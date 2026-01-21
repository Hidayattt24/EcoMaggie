/**
 * API Route: Confirm Delivery by Customer
 * ========================================
 *
 * Allows customers to confirm they have received their order.
 * This will update the order status to "completed".
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 [confirm-delivery] Processing order: ${orderId}`);

    // Get transaction by order_id
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("id, status, customer_email")
      .eq("order_id", orderId)
      .single();

    if (transactionError || !transaction) {
      console.error("❌ [confirm-delivery] Transaction not found:", transactionError);
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify customer owns this order
    if (transaction.customer_email !== user.email) {
      console.error("❌ [confirm-delivery] Email mismatch:", {
        transactionEmail: transaction.customer_email,
        userEmail: user.email,
      });
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses ke pesanan ini" },
        { status: 403 }
      );
    }

    // Check if order can be confirmed (must be in shipped or delivered status)
    if (!["shipped", "delivered"].includes(transaction.status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Pesanan dengan status "${transaction.status}" tidak dapat dikonfirmasi. Hanya pesanan yang sedang dikirim yang dapat dikonfirmasi.`,
        },
        { status: 400 }
      );
    }

    // Update status to completed
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("❌ [confirm-delivery] Update error:", updateError);
      return NextResponse.json(
        { success: false, message: "Gagal mengkonfirmasi penerimaan pesanan" },
        { status: 500 }
      );
    }

    // Add tracking history entry
    await supabase.from("shipping_tracking_history").insert({
      transaction_id: transaction.id,
      status: "completed",
      note: "Pesanan dikonfirmasi diterima oleh customer",
      tracked_at: new Date().toISOString(),
    });

    console.log(`✅ [confirm-delivery] Order confirmed: ${orderId}`);

    return NextResponse.json({
      success: true,
      message: "Terima kasih! Pesanan telah dikonfirmasi selesai.",
    });
  } catch (error) {
    console.error("❌ [confirm-delivery] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
