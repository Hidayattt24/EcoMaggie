import { handlePaymentNotification } from "@/lib/api/payment.actions";
import { NextRequest, NextResponse } from "next/server";

/**
 * Midtrans Payment Notification Handler (Webhook)
 *
 * This endpoint receives HTTP POST notifications from Midtrans
 * when payment status changes.
 *
 * Endpoint: POST /api/payment/notification
 *
 * Configure this URL in Midtrans Dashboard:
 * Settings > Configuration > Payment Notification URL
 *
 * Example URL (Production):
 * https://yourdomain.com/api/payment/notification
 *
 * Example URL (Development with ngrok):
 * https://your-ngrok-url.ngrok.io/api/payment/notification
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("🔔 ========================================");
    console.log("🔔 [WEBHOOK ROUTE] Midtrans notification received");
    console.log("🔔 ========================================");
    console.log("📅 Timestamp:", new Date().toISOString());
    console.log("🌐 Request URL:", request.url);
    console.log("📋 Headers:", Object.fromEntries(request.headers.entries()));

    // Parse JSON body
    const notificationData = await request.json();

    console.log("📦 [WEBHOOK ROUTE] Notification data:", {
      order_id: notificationData.order_id,
      transaction_status: notificationData.transaction_status,
      payment_type: notificationData.payment_type,
      fraud_status: notificationData.fraud_status,
      gross_amount: notificationData.gross_amount,
    });

    // Process notification
    const result = await handlePaymentNotification(notificationData);

    const duration = Date.now() - startTime;

    if (result.success) {
      console.log(`✅ [WEBHOOK ROUTE] Notification processed successfully in ${duration}ms`);
      return NextResponse.json(
        {
          status: "success",
          message: result.message,
          processingTime: `${duration}ms`,
        },
        { status: 200 }
      );
    } else {
      console.error(`❌ [WEBHOOK ROUTE] Notification processing failed in ${duration}ms:`, result.message);
      return NextResponse.json(
        {
          status: "error",
          message: result.message,
          processingTime: `${duration}ms`,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [WEBHOOK ROUTE] Unexpected error after ${duration}ms:`, error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Internal server error",
        processingTime: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - For testing webhook endpoint
 * You can access this in browser to verify the endpoint is working
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Midtrans webhook endpoint is active",
    timestamp: new Date().toISOString(),
    info: {
      endpoint: "/api/payment/notification",
      method: "POST",
      description: "Configure this URL in Midtrans Dashboard > Settings > Configuration > Payment Notification URL",
    },
  });
}
