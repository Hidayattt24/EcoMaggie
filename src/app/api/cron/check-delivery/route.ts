/**
 * API Route: Cron Job - Auto Check Delivery Status
 * ========================================
 *
 * Endpoint untuk auto-check status pengiriman setiap 6 jam
 * Flow:
 * 1. Get all transactions with status "shipped" dan ada waybill_id
 * 2. Loop dan track via Biteship Tracking API
 * 3. Save tracking history
 * 4. Jika status = "delivered", update transaction dan kirim email notifikasi
 *
 * GET /api/cron/check-delivery
 * Headers: Authorization: Bearer CRON_SECRET (untuk keamanan)
 *
 * CARA SETUP CRON (Manual Trigger):
 * 1. Setup di cron-job.org atau similar service
 * 2. Set URL: https://your-domain.com/api/cron/check-delivery
 * 3. Set Header: Authorization: Bearer YOUR_CRON_SECRET
 * 4. Set interval: Setiap 6 jam (00:00, 06:00, 12:00, 18:00)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackBiteshipShipment } from "@/lib/api/biteship.actions";
import { sendDeliveryNotificationEmail } from "@/lib/email/resend";

// Cron secret untuk keamanan (set di .env)
const CRON_SECRET = process.env.CRON_SECRET || "your-secret-key-here";

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token !== CRON_SECRET) {
      console.warn("⚠️ [Cron Check Delivery] Unauthorized access attempt");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    console.log("🔄 [Cron Check Delivery] Starting cron job...");

    const supabase = await createClient();

    // Get all transactions with status "shipped" and has waybill_id
    const { data: shippedTransactions, error: fetchError } = await supabase
      .from("transactions")
      .select("id, order_id, shipping_tracking_number, shipping_courier, customer_email, customer_name")
      .eq("status", "shipped")
      .not("shipping_tracking_number", "is", null)
      .not("shipping_courier", "is", null);

    if (fetchError) {
      console.error("❌ [Cron Check Delivery] Fetch error:", fetchError);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data transaksi" },
        { status: 500 }
      );
    }

    if (!shippedTransactions || shippedTransactions.length === 0) {
      console.log("✅ [Cron Check Delivery] No shipped transactions to check");
      return NextResponse.json({
        success: true,
        message: "Tidak ada transaksi yang perlu dicek",
        checked: 0,
        delivered: 0,
      });
    }

    console.log(`📦 [Cron Check Delivery] Found ${shippedTransactions.length} shipped transactions`);

    let checkedCount = 0;
    let deliveredCount = 0;
    const errors: string[] = [];

    // Loop through each transaction
    for (const transaction of shippedTransactions) {
      try {
        const { id, order_id, shipping_tracking_number, shipping_courier, customer_email, customer_name } = transaction;

        console.log(`🔍 [Cron Check Delivery] Checking ${order_id} (${shipping_tracking_number})`);

        // Track shipment via Biteship
        const trackingResult = await trackBiteshipShipment(
          shipping_tracking_number,
          shipping_courier
        );

        if (!trackingResult.success || !trackingResult.data) {
          console.warn(`⚠️ [Cron Check Delivery] Failed to track ${order_id}:`, trackingResult.message);
          errors.push(`${order_id}: ${trackingResult.message}`);
          continue;
        }

        checkedCount++;

        const trackingData = trackingResult.data;
        const currentStatus = trackingData.status;

        console.log(`📊 [Cron Check Delivery] ${order_id} status: ${currentStatus}`);

        // Save tracking history
        if (trackingData.history && trackingData.history.length > 0) {
          const historyRecords = trackingData.history.map((item: any) => ({
            transaction_id: id,
            waybill_id: shipping_tracking_number,
            courier_code: shipping_courier,
            status: item.status || "unknown",
            note: item.note || "",
            location: item.service_code || null,
            tracked_at: item.updated_at,
            biteship_response: item,
          }));

          // Use upsert to avoid duplicates
          const { error: historyError } = await supabase
            .from("shipping_tracking_history")
            .upsert(historyRecords, {
              onConflict: "transaction_id,tracked_at,status",
              ignoreDuplicates: true,
            });

          if (historyError) {
            console.error(`⚠️ [Cron Check Delivery] Failed to save history for ${order_id}:`, historyError);
          }
        }

        // Check if delivered
        if (currentStatus === "delivered") {
          console.log(`✅ [Cron Check Delivery] ${order_id} is DELIVERED!`);

          // Update transaction status to "delivered"
          const { error: updateError } = await supabase
            .from("transactions")
            .update({
              status: "delivered",
              updated_at: new Date().toISOString(),
            })
            .eq("id", id);

          if (updateError) {
            console.error(`❌ [Cron Check Delivery] Failed to update ${order_id}:`, updateError);
            errors.push(`${order_id}: Failed to update status`);
            continue;
          }

          deliveredCount++;

          // Send email notification
          console.log(`📧 [Cron Check Delivery] Sending delivery notification to ${customer_email}`);

          const emailResult = await sendDeliveryNotificationEmail(customer_email, customer_name, order_id);

          if (emailResult.success) {
            console.log(`✅ [Cron Check Delivery] Email sent to ${customer_email}`);
          } else {
            console.error(`⚠️ [Cron Check Delivery] Failed to send email to ${customer_email}:`, emailResult.message);
            errors.push(`${order_id}: Failed to send email`);
          }
        }
      } catch (error) {
        console.error(`❌ [Cron Check Delivery] Error processing transaction:`, error);
        errors.push(`${transaction.order_id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }

      // Add small delay between API calls to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
    }

    console.log(`🎉 [Cron Check Delivery] Cron job completed:`, {
      total: shippedTransactions.length,
      checked: checkedCount,
      delivered: deliveredCount,
      errors: errors.length,
    });

    return NextResponse.json({
      success: true,
      message: "Cron job selesai",
      stats: {
        total: shippedTransactions.length,
        checked: checkedCount,
        delivered: deliveredCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("❌ [Cron Check Delivery] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
