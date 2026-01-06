/**
 * API Route: Auto-Complete Orders Cron Job
 * Compatible with cron-job.org
 * 
 * Automatically completes orders that have been shipped for more than 3 days
 * without customer confirmation.
 * 
 * Setup on cron-job.org:
 * - URL: https://your-domain.com/api/cron/auto-complete-orders
 * - Method: GET
 * - Schedule: Every day at 00:00 (0 0 * * *)
 * - Headers: x-cron-secret: YOUR_SECRET_KEY
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Secret key for cron job authentication
const CRON_SECRET = process.env.CRON_SECRET || "eco-maggie-cron-secret";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get("x-cron-secret");
    if (cronSecret !== CRON_SECRET) {
      console.warn("⚠️ [auto-complete-cron] Unauthorized request");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🔄 [auto-complete-cron] Starting auto-complete job...");

    const supabase = await createClient();

    // Calculate 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find shipped orders older than 3 days
    const { data: orders, error: fetchError } = await supabase
      .from("transactions")
      .select("id, order_id, customer_email, customer_name, updated_at")
      .eq("status", "shipped")
      .lt("updated_at", threeDaysAgo.toISOString());

    if (fetchError) {
      console.error("❌ [auto-complete-cron] Fetch error:", fetchError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      console.log("✅ [auto-complete-cron] No orders to auto-complete");
      return NextResponse.json({
        success: true,
        message: "No orders to auto-complete",
        data: { checked: 0, completed: 0 },
      });
    }

    const now = new Date().toISOString();
    let completedCount = 0;
    const completedOrders: string[] = [];

    for (const order of orders) {
      // Update to completed
      const { error: updateError } = await supabase
        .from("transactions")
        .update({
          status: "completed",
          updated_at: now,
        })
        .eq("id", order.id);

      if (!updateError) {
        // Add tracking history
        await supabase.from("shipping_tracking_history").insert({
          transaction_id: order.id,
          status: "completed",
          note: "Pesanan otomatis selesai setelah 3 hari pengiriman",
          tracked_at: now,
        });

        completedCount++;
        completedOrders.push(order.order_id);

        // Trigger notification
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/notifications/order-completed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.order_id, transactionId: order.id }),
        }).catch(() => {});

        console.log(`✅ Auto-completed: ${order.order_id}`);
      }
    }

    console.log(`✅ [auto-complete-cron] Completed ${completedCount}/${orders.length} orders`);

    return NextResponse.json({
      success: true,
      message: `Auto-completed ${completedCount} orders`,
      data: {
        checked: orders.length,
        completed: completedCount,
        orders: completedOrders,
      },
    });
  } catch (error) {
    console.error("❌ [auto-complete-cron] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
