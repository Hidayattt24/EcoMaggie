/**
 * API Route: Order Completed Notification
 * Sends WhatsApp notifications to customer when order is completed
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderCompletedWhatsApp } from "@/lib/whatsapp/venusconnect";

export async function POST(request: NextRequest) {
  try {
    const { orderId, transactionId } = await request.json();

    if (!orderId && !transactionId) {
      return NextResponse.json(
        { success: false, message: "orderId or transactionId required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get transaction details
    const query = transactionId
      ? supabase.from("transactions").select("*").eq("id", transactionId).single()
      : supabase.from("transactions").select("*").eq("order_id", orderId).single();

    const { data: transaction, error } = await query;

    if (error || !transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    console.log(`📱 [order-completed] Sending WhatsApp notification for order: ${transaction.order_id}`);
    console.log(`   Customer: ${transaction.customer_name} (${transaction.customer_phone})`);

    // Send WhatsApp notification to customer
    let customerNotified = false;
    if (transaction.customer_phone) {
      const whatsappResult = await sendOrderCompletedWhatsApp(
        transaction.customer_phone,
        transaction.customer_name,
        transaction.order_id
      );

      if (whatsappResult.success) {
        console.log(`✅ [order-completed] WhatsApp sent to customer`);
        customerNotified = true;
      } else {
        console.error(`⚠️ [order-completed] Failed to send WhatsApp:`, whatsappResult.message);
      }
    } else {
      console.warn(`⚠️ [order-completed] No phone number for customer`);
    }

    return NextResponse.json({
      success: true,
      message: "WhatsApp notification sent",
      data: {
        customerNotified,
      },
    });
  } catch (error) {
    console.error("❌ [order-completed] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
