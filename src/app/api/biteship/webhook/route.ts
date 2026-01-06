/**
 * Biteship Webhook Handler
 * ========================================
 *
 * Receives webhook notifications from Biteship for order status updates
 *
 * Webhook Events:
 * - order.status: When order status changes (confirmed, allocated, picking_up, picked, delivered, cancelled)
 * - order.price: When shipping price changes due to weight discrepancy
 * - order.waybill_id: When waybill/resi number is updated by courier
 *
 * Status Flow:
 * 1. confirmed → AWB generated
 * 2. allocated → Courier assigned for pickup
 * 3. picking_up → Courier on the way to sender
 * 4. picked → Package picked up by courier
 * 5. delivered → Package delivered to recipient ✅
 * 6. cancelled → Order cancelled ❌
 *
 * Setup Webhook in Biteship Dashboard:
 * - URL: https://your-domain.com/api/biteship/webhook
 * - Method: POST
 * - Events: order.status, order.price, order.waybill_id
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/biteship/webhook
 * Receive Biteship webhook notifications
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🔔 ========================================");
    console.log("🔔 [BITESHIP WEBHOOK] Notification received");
    console.log("🔔 ========================================");

    // 1. Parse webhook payload
    const payload = await request.json();
    console.log("📦 [BITESHIP WEBHOOK] Raw payload:", JSON.stringify(payload, null, 2));

    // 2. Extract event type and order data
    const eventType = payload.event; // "order.status", "order.price", "order.waybill_id"
    const orderData = payload.order || payload;

    console.log(`📊 [BITESHIP WEBHOOK] Event Type: ${eventType}`);
    console.log(`📋 [BITESHIP WEBHOOK] Order ID: ${orderData.id}`);
    console.log(`📊 [BITESHIP WEBHOOK] Status: ${orderData.status}`);

    // 3. Use service role client to bypass RLS
    const supabase = createServiceClient();

    // 4. Find transaction by Biteship order ID
    const { data: transaction, error: findError } = await supabase
      .from("transactions")
      .select("*")
      .eq("biteship_order_id", orderData.id)
      .single();

    if (findError || !transaction) {
      console.error("❌ [BITESHIP WEBHOOK] Transaction not found!");
      console.error("   Biteship Order ID:", orderData.id);
      console.error("   Error:", findError);

      // Log recent transactions for debugging
      const { data: recentTx } = await supabase
        .from("transactions")
        .select("order_id, biteship_order_id, biteship_status")
        .order("created_at", { ascending: false })
        .limit(5);
      console.log("📋 [BITESHIP WEBHOOK] Recent transactions:", recentTx);

      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found",
        },
        { status: 404 }
      );
    }

    console.log(`✅ [BITESHIP WEBHOOK] Transaction found: ${transaction.order_id}`);
    console.log(`📊 [BITESHIP WEBHOOK] Current DB status: ${transaction.biteship_status || "none"}`);

    // 5. Prepare update data based on event type
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Handle different webhook events
    switch (eventType) {
      case "order.status":
        updateData.biteship_status = orderData.status;

        // Update transaction status based on Biteship status
        if (orderData.status === "delivered") {
          updateData.status = "delivered";
          updateData.delivered_at = new Date().toISOString();
        } else if (orderData.status === "cancelled") {
          updateData.status = "cancelled";
        } else if (orderData.status === "picked") {
          updateData.status = "shipped";
          updateData.shipped_at = new Date().toISOString();
        }

        console.log(`📝 [BITESHIP WEBHOOK] Status update: ${transaction.biteship_status} → ${orderData.status}`);
        break;

      case "order.price":
        updateData.biteship_price = orderData.price;
        updateData.shipping_cost = orderData.price;

        // Recalculate total if price changed
        const priceDiff = orderData.price - (transaction.biteship_price || transaction.shipping_cost || 0);
        if (priceDiff !== 0) {
          updateData.total_amount = transaction.total_amount + priceDiff;
          console.log(`💰 [BITESHIP WEBHOOK] Price update: ${transaction.shipping_cost} → ${orderData.price} (diff: ${priceDiff})`);
        }
        break;

      case "order.waybill_id":
        updateData.biteship_waybill_id = orderData.courier?.waybill_id;
        console.log(`📦 [BITESHIP WEBHOOK] Waybill update: ${orderData.courier?.waybill_id}`);
        break;

      default:
        console.log(`ℹ️ [BITESHIP WEBHOOK] Unknown event type: ${eventType}`);
    }

    // Also update courier info if available
    if (orderData.courier) {
      if (orderData.courier.tracking_id) {
        updateData.biteship_tracking_id = orderData.courier.tracking_id;
      }
      if (orderData.courier.waybill_id) {
        updateData.biteship_waybill_id = orderData.courier.waybill_id;
      }
    }

    // Store full webhook payload in metadata
    updateData.metadata = {
      ...transaction.metadata,
      biteship_webhooks: [
        ...(transaction.metadata?.biteship_webhooks || []),
        {
          event: eventType,
          timestamp: new Date().toISOString(),
          data: payload,
        },
      ],
    };

    // 6. Update transaction
    const { data: updatedTransaction, error: updateError } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", transaction.id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ [BITESHIP WEBHOOK] Update failed!", updateError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update transaction",
        },
        { status: 500 }
      );
    }

    console.log("✅ [BITESHIP WEBHOOK] Transaction updated successfully!");
    console.log(`   - Order ID: ${updatedTransaction.order_id}`);
    console.log(`   - Biteship Status: ${updatedTransaction.biteship_status}`);
    console.log(`   - Transaction Status: ${updatedTransaction.status}`);
    console.log(`   - Tracking ID: ${updatedTransaction.biteship_tracking_id}`);
    console.log(`   - Waybill ID: ${updatedTransaction.biteship_waybill_id}`);

    console.log("🔔 ========================================");
    console.log("🔔 [BITESHIP WEBHOOK] Processed successfully!");
    console.log("🔔 ========================================");

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("❌ [BITESHIP WEBHOOK] CRITICAL ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/biteship/webhook
 * Webhook verification endpoint (optional)
 */
export async function GET() {
  return NextResponse.json({
    message: "Biteship webhook endpoint is active",
    endpoint: "/api/biteship/webhook",
    method: "POST",
    events: ["order.status", "order.price", "order.waybill_id"],
  });
}
