/**
 * API Route: Update Waybill / Input Resi Manual (Farmer)
 * ========================================
 *
 * Endpoint untuk farmer input resi manual setelah booking kurir ke agen
 * Flow:
 * 1. Farmer booking kurir manual (ke agen JNE/J&T/dll)
 * 2. Farmer dapat resi (misal: JT123456789)
 * 3. Farmer input resi di dashboard → API ini dipanggil
 * 4. Update database transactions
 * 5. Track pengiriman pertama kali via Biteship
 * 6. Simpan tracking history
 *
 * POST /api/shipping/update-waybill
 * Body: {
 *   transaction_id: string,
 *   waybill_id: string,
 *   courier_code: string
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackBiteshipShipment } from "@/lib/api/biteship.actions";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { transaction_id, waybill_id, courier_code } = body;

    // Validate required fields
    if (!transaction_id || !waybill_id || !courier_code) {
      return NextResponse.json(
        {
          success: false,
          message: "transaction_id, waybill_id, dan courier_code harus diisi",
        },
        { status: 400 }
      );
    }

    console.log("📦 [Update Waybill] Request:", {
      transaction_id,
      waybill_id,
      courier_code,
      user_id: user.id,
    });

    // Verify farmer owns this transaction (check if transaction has their products)
    const { data: transactionItems, error: verifyError } = await supabase
      .from("transaction_items")
      .select(
        `
        product_id,
        products!inner(
          farmer_id,
          farmers!inner(
            user_id
          )
        )
      `
      )
      .eq("transaction_id", transaction_id);

    if (verifyError) {
      console.error("❌ [Update Waybill] Verify error:", verifyError);
      return NextResponse.json(
        { success: false, message: "Gagal memverifikasi transaksi" },
        { status: 500 }
      );
    }

    // Check if user is the farmer who owns products in this transaction
    const isFarmer = transactionItems?.some((item: any) =>
      item.products?.farmers?.user_id === user.id
    );

    if (!isFarmer) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses ke transaksi ini" },
        { status: 403 }
      );
    }

    // Update transaction with waybill and courier info
    const { data: updatedTransaction, error: updateError } = await supabase
      .from("transactions")
      .update({
        shipping_tracking_number: waybill_id,
        shipping_courier: courier_code,
        status: "shipped",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction_id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ [Update Waybill] Update error:", updateError);
      return NextResponse.json(
        { success: false, message: "Gagal mengupdate transaksi" },
        { status: 500 }
      );
    }

    console.log("✅ [Update Waybill] Transaction updated:", {
      order_id: updatedTransaction.order_id,
      waybill_id,
      courier_code,
    });

    // Track shipment via Biteship API
    const trackingResult = await trackBiteshipShipment(waybill_id, courier_code);

    if (trackingResult.success && trackingResult.data) {
      console.log("✅ [Update Waybill] Tracking retrieved:", {
        status: trackingResult.data.status,
        historyCount: trackingResult.data.history?.length || 0,
      });

      // Save tracking history to database
      if (trackingResult.data.history && trackingResult.data.history.length > 0) {
        const historyRecords = trackingResult.data.history.map((item: any) => ({
          transaction_id,
          waybill_id,
          courier_code,
          status: item.status || "unknown",
          note: item.note || "",
          location: item.service_code || null,
          tracked_at: item.updated_at,
          biteship_response: item,
        }));

        const { error: historyError } = await supabase
          .from("shipping_tracking_history")
          .insert(historyRecords);

        if (historyError) {
          console.error("⚠️ [Update Waybill] Failed to save tracking history:", historyError);
          // Don't fail the whole request if history save fails
        } else {
          console.log(`✅ [Update Waybill] Saved ${historyRecords.length} tracking history records`);
        }
      }
    } else {
      console.warn("⚠️ [Update Waybill] Failed to track shipment:", trackingResult.message);
      // Don't fail the whole request if tracking fails
    }

    return NextResponse.json({
      success: true,
      message: "Resi berhasil diinput dan status order diupdate",
      data: {
        order_id: updatedTransaction.order_id,
        waybill_id,
        courier_code,
        status: "shipped",
        tracking: trackingResult.data || null,
      },
    });
  } catch (error) {
    console.error("❌ [Update Waybill] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
