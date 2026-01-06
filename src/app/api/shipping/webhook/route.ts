/**
 * Biteship Webhook Handler
 * ========================
 * Endpoint: POST /api/shipping/webhook
 *
 * Handles shipping status updates from Biteship
 */

import { NextRequest, NextResponse } from "next/server";
import { handleBiteshipWebhook } from "@/lib/api/biteship.actions";

export async function POST(request: NextRequest) {
  try {
    console.log("🌿 [Eco-maggie] Biteship webhook received");

    const payload = await request.json();

    console.log("📦 Webhook payload:", JSON.stringify(payload, null, 2));

    // Process webhook
    const result = await handleBiteshipWebhook(payload);

    if (!result.success) {
      console.error("❌ Webhook processing failed:", result.message);
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    console.log("✅ Webhook processed successfully");

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Biteship may also send GET requests for verification
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Eco-maggie Biteship Webhook Endpoint",
    timestamp: new Date().toISOString(),
  });
}
