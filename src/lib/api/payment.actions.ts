"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  midtransService,
  verifySignature,
  validateNotification,
  mapMidtransStatus,
  normalizeOrderId,
} from "@/lib/midtrans";
import {
  sendNewOrderNotificationToFarmer,
  sendNewOrderPendingToFarmerWhatsApp,
  sendOrderCreatedWhatsApp,
  sendPaymentSuccessWhatsApp,
} from "@/lib/whatsapp/venusconnect";
// NOTE: Biteship Order API tidak digunakan (manual booking workflow)
// Farmer akan booking courier manual dan input resi ke sistem

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface CreatePaymentData {
  checkoutProducts: {
    id: string;
    name: string;
    image: string;
    finalPrice: number;
    quantity: number;
    unit: string;
  }[];
  shippingAddress: {
    id: string;
    recipientName: string;
    recipientPhone: string;
    streetAddress: string;
    city: string;
    province: string;
    district?: string;
    village?: string;
    postalCode: string;
  };
  shippingMethod: {
    id: string;
    name: string;
    courierCode: string;
    serviceCode: string;
    price: number;
    estimatedDays: string;
  };
  customerEmail: string;
  subtotal: number;
  shippingCost: number;
  serviceFee: number;
  total: number;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    orderId: string;
    snapToken: string;
    redirectUrl?: string;
  };
}

export interface TransactionStatusResponse {
  success: boolean;
  message: string;
  data?: {
    orderId: string;
    status: string;
    paymentStatus: string;
    paymentType?: string;
    total: number;
    paidAt?: string;
    transaction: any;
    payment: any;
    items: any[];
  };
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Generate unique Order ID
 * Format: ECO-YYYYMMDD-XXXXX
 */
function generateOrderId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, "0");
  return `ECO-${dateStr}-${random}`;
}

/**
 * Get Midtrans API URL based on environment
 */
function getMidtransApiUrl(): string {
  const env = process.env.MIDTRANS_ENVIRONMENT || "sandbox";
  return env === "production"
    ? process.env.MIDTRANS_PRODUCTION_API_URL || "https://app.midtrans.com"
    : process.env.MIDTRANS_SANDBOX_API_URL ||
        "https://app.sandbox.midtrans.com";
}

/**
 * Create Authorization header for Midtrans API
 */
function getAuthHeader(): string {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY is not configured");
  }
  // Base64 encode "ServerKey:" (note the colon at the end)
  const auth = Buffer.from(`${serverKey}:`).toString("base64");
  return `Basic ${auth}`;
}

// =====================================================
// MAIN FUNCTIONS
// =====================================================

/**
 * Create payment transaction and get Snap token from Midtrans
 */
export async function createPaymentTransaction(
  paymentData: CreatePaymentData
): Promise<PaymentResponse> {
  try {
    console.log("🔄 Starting payment transaction creation...");

    const supabase = await createClient();

    // 1. Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "User tidak terautentikasi",
      };
    }

    // 2. Generate Order ID
    const orderId = generateOrderId();
    console.log(`📋 Order ID: ${orderId}`);

    // 3. Create transaction record in database
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        order_id: orderId,
        user_id: user.id,
        status: "pending",
        subtotal: paymentData.subtotal,
        shipping_cost: paymentData.shippingCost,
        service_fee: paymentData.serviceFee,
        total_amount: paymentData.total,
        shipping_address_id: paymentData.shippingAddress.id,
        shipping_method: paymentData.shippingMethod.name,
        shipping_courier: paymentData.shippingMethod.courierCode,
        shipping_service: paymentData.shippingMethod.serviceCode,
        estimated_delivery: paymentData.shippingMethod.estimatedDays,
        customer_name: paymentData.shippingAddress.recipientName,
        customer_email: paymentData.customerEmail,
        customer_phone: paymentData.shippingAddress.recipientPhone,
        customer_address: `${paymentData.shippingAddress.streetAddress}, ${paymentData.shippingAddress.district || ""}, ${paymentData.shippingAddress.village || ""}, ${paymentData.shippingAddress.city}, ${paymentData.shippingAddress.province} ${paymentData.shippingAddress.postalCode}`,
        expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .select()
      .single();

    if (transactionError || !transaction) {
      console.error("❌ Transaction insert error:", transactionError);
      return {
        success: false,
        message: "Gagal membuat transaksi di database",
      };
    }

    console.log("✅ Transaction created:", transaction.id);

    // 4. Create transaction items
    const transactionItems = paymentData.checkoutProducts.map((product) => ({
      transaction_id: transaction.id,
      product_id: product.id,
      product_name: product.name,
      product_image: product.image,
      unit_price: product.finalPrice,
      quantity: product.quantity,
      subtotal: product.finalPrice * product.quantity,
      unit: product.unit,
    }));

    const { error: itemsError } = await supabase
      .from("transaction_items")
      .insert(transactionItems);

    if (itemsError) {
      console.error("❌ Transaction items insert error:", itemsError);
      // Rollback transaction
      await supabase.from("transactions").delete().eq("id", transaction.id);
      return {
        success: false,
        message: "Gagal menyimpan detail produk",
      };
    }

    console.log(`✅ ${transactionItems.length} items inserted`);

    // 5. Prepare Midtrans request
    const midtransRequest = {
      transaction_details: {
        order_id: orderId,
        gross_amount: paymentData.total,
      },
      customer_details: {
        first_name: paymentData.shippingAddress.recipientName.split(" ")[0],
        last_name:
          paymentData.shippingAddress.recipientName.split(" ").slice(1).join(" ") ||
          "",
        email: paymentData.customerEmail,
        phone: paymentData.shippingAddress.recipientPhone,
        shipping_address: {
          first_name: paymentData.shippingAddress.recipientName.split(" ")[0],
          last_name:
            paymentData.shippingAddress.recipientName.split(" ").slice(1).join(" ") ||
            "",
          phone: paymentData.shippingAddress.recipientPhone,
          address: paymentData.shippingAddress.streetAddress,
          city: paymentData.shippingAddress.city,
          postal_code: paymentData.shippingAddress.postalCode,
          country_code: "IDN",
        },
      },
      item_details: [
        // Product items
        ...paymentData.checkoutProducts.map((product) => ({
          id: product.id,
          price: product.finalPrice,
          quantity: product.quantity,
          name: product.name.substring(0, 50), // Max 50 chars
        })),
        // Shipping cost
        ...(paymentData.shippingCost > 0
          ? [
              {
                id: "SHIPPING",
                price: paymentData.shippingCost,
                quantity: 1,
                name: `Ongkir - ${paymentData.shippingMethod.name}`,
              },
            ]
          : []),
        // Service fee (5% platform fee)
        ...(paymentData.serviceFee > 0
          ? [
              {
                id: "SERVICE_FEE",
                price: paymentData.serviceFee,
                quantity: 1,
                name: "Biaya Layanan (5%)",
              },
            ]
          : []),
      ],
      credit_card: {
        secure: true,
      },
      enabled_payments: [
        "credit_card",
        "bca_va",
        "bni_va",
        "bri_va",
        "permata_va",
        "other_va",
        "gopay",
        "shopeepay",
        "qris",
      ],
      expiry: {
        unit: "hours",
        duration: 24,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL}/market/orders/success?orderId=${orderId}`,
      },
    };

    console.log("🔄 Calling Midtrans Snap API...");

    // 6. Call Midtrans Snap API
    const midtransUrl = `${getMidtransApiUrl()}/snap/v1/transactions`;
    const response = await fetch(midtransUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify(midtransRequest),
    });

    const midtransResponse = await response.json();

    if (!response.ok || !midtransResponse.token) {
      console.error("❌ Midtrans API error:", midtransResponse);

      // Rollback database entries
      await supabase.from("transactions").delete().eq("id", transaction.id);

      return {
        success: false,
        message:
          midtransResponse.error_messages?.[0] ||
          "Gagal membuat transaksi pembayaran",
      };
    }

    console.log("✅ Snap token received:", midtransResponse.token);

    // 7. Save payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      transaction_id: transaction.id,
      midtrans_order_id: orderId,
      snap_token: midtransResponse.token,
      payment_status: "pending",
      gross_amount: paymentData.total,
      expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      midtrans_response: midtransResponse,
    });

    if (paymentError) {
      console.error("❌ Payment insert error:", paymentError);
      // Continue anyway, token is already created
    }

    console.log("✅ Payment transaction created successfully");

    // Send WhatsApp notifications (fire and forget)
    try {
      // Send to customer
      if (paymentData.shippingAddress.recipientPhone) {
        await sendOrderCreatedWhatsApp(
          paymentData.shippingAddress.recipientPhone,
          paymentData.shippingAddress.recipientName,
          orderId,
          paymentData.total,
          paymentData.checkoutProducts.length
        ).catch((err) => console.error("WhatsApp notification to customer failed:", err));
      }

      // Send to farmer(s)
      const { data: transactionItems } = await supabase
        .from("transaction_items")
        .select(`
          product_id,
          quantity,
          unit_price,
          products (
            farmer_id,
            farmers (
              farm_name,
              users (name, phone)
            )
          )
        `)
        .eq("transaction_id", transaction.id);

      // Group by farmer
      const farmerNotifications = new Map();
      for (const item of transactionItems || []) {
        const products = Array.isArray(item.products) ? item.products[0] : item.products;
        const farmers = products?.farmers;
        const farmerData = Array.isArray(farmers) ? farmers[0] : farmers;
        const userData = farmerData?.users;
        const userInfo = Array.isArray(userData) ? userData[0] : userData;

        const farmerId = products?.farmer_id;
        if (farmerId && !farmerNotifications.has(farmerId)) {
          farmerNotifications.set(farmerId, {
            name: userInfo?.name || "Farmer",
            phone: userInfo?.phone,
            itemCount: 0,
          });
        }

        if (farmerId) {
          const info = farmerNotifications.get(farmerId);
          info.itemCount += item.quantity;
        }
      }

      // Send notification to each farmer
      for (const [, farmerInfo] of farmerNotifications) {
        if (farmerInfo.phone) {
          await sendNewOrderPendingToFarmerWhatsApp(
            farmerInfo.phone,
            farmerInfo.name,
            orderId,
            paymentData.shippingAddress.recipientName,
            paymentData.total,
            farmerInfo.itemCount
          ).catch((err) => console.error("WhatsApp notification to farmer failed:", err));
        }
      }
    } catch (err) {
      console.error("❌ WhatsApp notification error:", err);
    }

    return {
      success: true,
      message: "Transaksi pembayaran berhasil dibuat",
      data: {
        orderId,
        snapToken: midtransResponse.token,
        redirectUrl: midtransResponse.redirect_url,
      },
    };
  } catch (error) {
    console.error("❌ Create payment transaction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat transaksi",
    };
  }
}

/**
 * Handle Midtrans payment notification (webhook)
 * Uses service role client to bypass RLS
 */
export async function handlePaymentNotification(
  notificationData: any
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔔 ========================================");
    console.log("🔔 [WEBHOOK] Payment notification received");
    console.log("🔔 ========================================");
    console.log("📦 Raw notification data:", JSON.stringify(notificationData, null, 2));

    // 1. Validate notification has required fields
    const validatedNotification = validateNotification(notificationData);
    if (!validatedNotification) {
      console.error("❌ [WEBHOOK] Invalid notification - missing required fields");
      return {
        success: false,
        message: "Invalid notification - missing required fields",
      };
    }

    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      gross_amount,
      signature_key,
      status_code,
      transaction_id,
      transaction_time,
      settlement_time,
      va_numbers,
      bill_key,
      biller_code,
    } = validatedNotification;

    // Normalize order_id (trim whitespace, handle case)
    const normalizedOrderId = normalizeOrderId(order_id);
    
    console.log(`📋 [WEBHOOK] Order ID: "${normalizedOrderId}" (original: "${order_id}")`);
    console.log(`📊 [WEBHOOK] Transaction Status: ${transaction_status}`);
    console.log(`📊 [WEBHOOK] Fraud Status: ${fraud_status}`);
    console.log(`💰 [WEBHOOK] Gross Amount: ${gross_amount}`);

    // 2. Verify signature
    if (!verifySignature(normalizedOrderId, status_code, gross_amount, signature_key)) {
      console.error("❌ [WEBHOOK] Invalid signature!");
      return {
        success: false,
        message: "Invalid signature",
      };
    }
    console.log("✅ [WEBHOOK] Signature verified");

    // Use service role client to bypass RLS for webhook updates
    const supabase = createServiceClient();

    // 3. Get transaction - try multiple approaches
    console.log(`🔍 [WEBHOOK] Looking for transaction with order_id: "${normalizedOrderId}"`);
    
    let transaction = null;
    let transactionError = null;

    // First try: exact match
    const result1 = await supabase
      .from("transactions")
      .select("*")
      .eq("order_id", normalizedOrderId)
      .single();
    
    transaction = result1.data;
    transactionError = result1.error;

    // If not found, try with LIKE (in case of whitespace issues)
    if (!transaction) {
      console.log("⚠️ [WEBHOOK] Exact match failed, trying LIKE query...");
      const result2 = await supabase
        .from("transactions")
        .select("*")
        .ilike("order_id", `%${normalizedOrderId}%`)
        .limit(1)
        .single();
      
      transaction = result2.data;
      transactionError = result2.error;
    }

    if (transactionError || !transaction) {
      console.error("❌ [WEBHOOK] Transaction NOT FOUND!");
      console.error("   Searched for order_id:", normalizedOrderId);
      console.error("   Database error:", transactionError);
      
      // Log all recent transactions for debugging
      const { data: recentTx } = await supabase
        .from("transactions")
        .select("order_id, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      console.log("📋 [WEBHOOK] Recent transactions in DB:", recentTx);
      
      return {
        success: false,
        message: `Transaction not found: ${normalizedOrderId}`,
      };
    }

    console.log(`✅ [WEBHOOK] Transaction found: ID=${transaction.id}`);
    console.log(`📊 [WEBHOOK] Current DB status: ${transaction.status}`);

    // 4. Map Midtrans status to our status using utility function
    const { transactionStatus: newStatus, paymentStatus } = mapMidtransStatus(
      transaction_status,
      fraud_status
    );

    console.log(`📝 [WEBHOOK] Status mapping:`);
    console.log(`   - Current DB status: ${transaction.status}`);
    console.log(`   - New transaction status: ${newStatus}`);
    console.log(`   - New payment status: ${paymentStatus}`);

    // 5. Update transaction status
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      metadata: notificationData, // Store raw Midtrans response
    };

    if (newStatus === "paid") {
      updateData.paid_at = settlement_time || new Date().toISOString();
    }

    console.log(`🔧 [WEBHOOK] Updating transaction...`);
    const { data: updatedTransaction, error: updateError } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", transaction.id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ [WEBHOOK] Transaction update FAILED!");
      console.error("   Error:", updateError);
      console.error("   Update data:", updateData);
      return {
        success: false,
        message: `Failed to update transaction: ${updateError.message}`,
      };
    }
    
    console.log("✅ [WEBHOOK] Transaction updated successfully!");
    console.log(`   - Order ID: ${updatedTransaction?.order_id}`);
    console.log(`   - New Status: ${updatedTransaction?.status}`);
    console.log(`   - Paid At: ${updatedTransaction?.paid_at}`);

    // 6. Update payment record
    const { data: payment, error: paymentFetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("transaction_id", transaction.id)
      .single();

    if (paymentFetchError) {
      console.warn("⚠️ [WEBHOOK] Payment record not found:", paymentFetchError);
    }

    if (payment) {
      // Append to notification history
      const notificationHistory = Array.isArray(payment.notification_history)
        ? payment.notification_history
        : [];
      notificationHistory.push({
        timestamp: new Date().toISOString(),
        source: "webhook",
        data: notificationData,
      });

      const paymentUpdateData: any = {
        midtrans_transaction_id: transaction_id,
        payment_status: paymentStatus,
        payment_type,
        fraud_status,
        status_code,
        status_message: notificationData.status_message || "",
        transaction_time,
        settlement_time,
        notification_history: notificationHistory,
        updated_at: new Date().toISOString(),
      };

      // Add VA number if exists
      if (va_numbers && va_numbers.length > 0) {
        paymentUpdateData.va_number = va_numbers[0].va_number;
        paymentUpdateData.bank = va_numbers[0].bank;
      }

      // Add bill info if exists
      if (bill_key) paymentUpdateData.bill_key = bill_key;
      if (biller_code) paymentUpdateData.biller_code = biller_code;

      const { data: updatedPayment, error: paymentUpdateError } = await supabase
        .from("payments")
        .update(paymentUpdateData)
        .eq("id", payment.id)
        .select()
        .single();

      if (paymentUpdateError) {
        console.error("❌ [WEBHOOK] Payment update error:", paymentUpdateError);
      } else {
        console.log("✅ [WEBHOOK] Payment updated successfully!");
        console.log(`   - Payment status: ${updatedPayment?.payment_status}`);
        console.log(`   - Payment type: ${updatedPayment?.payment_type}`);
        console.log(`   - Midtrans TX ID: ${updatedPayment?.midtrans_transaction_id}`);
      }
    }

    // 7. Process paid transaction: Create Biteship order, update stock, clear cart
    if (newStatus === "paid") {
      console.log("🛒 [WEBHOOK] Processing paid transaction...");

      // Get transaction items with product details
      const { data: transactionItems, error: itemsError } = await supabase
        .from("transaction_items")
        .select("product_id, product_name, quantity, unit_price")
        .eq("transaction_id", transaction.id);

      if (itemsError) {
        console.error("❌ [WEBHOOK] Failed to get transaction items:", itemsError);
      } else if (transactionItems && transactionItems.length > 0) {
        const productIds = transactionItems.map((item: any) => item.product_id);
        console.log(`🛒 [WEBHOOK] Processing ${productIds.length} products...`);

        // ===========================================
        // BITESHIP ORDER - DISABLED (Manual Booking Workflow)
        // ===========================================
        // NOTE: Biteship Order API tidak digunakan untuk menghemat biaya
        // Workflow manual:
        // 1. Farmer menerima notifikasi pesanan baru
        // 2. Farmer booking courier manual (JNE/J&T/dll)
        // 3. Farmer input nomor resi ke sistem
        // 4. Customer bisa tracking via link courier atau Biteship Tracking API
        
        if (transaction.shipping_courier &&
            transaction.shipping_courier !== "pickup" &&
            transaction.shipping_courier !== "ecomaggie") {
          console.log("📦 [WEBHOOK] Courier shipping detected - awaiting manual booking by farmer");
          console.log("   - Courier: " + transaction.shipping_courier);
          console.log("   - Farmer will book manually and input tracking number");
        } else {
          console.log("ℹ️ [WEBHOOK] Local delivery/pickup - no courier booking needed");
        }

        // Update product stock (reduce by quantity sold)
        for (const item of transactionItems) {
          const { error: stockError } = await supabase.rpc('decrement_stock', {
            p_product_id: item.product_id,
            p_quantity: item.quantity
          });

          // Fallback if RPC doesn't exist - manual update
          if (stockError) {
            console.log(`⚠️ [WEBHOOK] RPC not available, using manual stock update`);
            const { data: product } = await supabase
              .from("products")
              .select("stock, total_sold")
              .eq("id", item.product_id)
              .single();

            if (product) {
              await supabase
                .from("products")
                .update({
                  stock: Math.max(0, product.stock - item.quantity),
                  total_sold: (product.total_sold || 0) + item.quantity,
                })
                .eq("id", item.product_id);
            }
          }
        }
        console.log("✅ [WEBHOOK] Product stock updated!");

        // Clear cart items
        const { data: userCart } = await supabase
          .from("carts")
          .select("id")
          .eq("user_id", transaction.user_id)
          .single();

        if (userCart) {
          const { error: clearError } = await supabase
            .from("cart_items")
            .delete()
            .eq("cart_id", userCart.id)
            .in("product_id", productIds);

          if (clearError) {
            console.error("❌ [WEBHOOK] Failed to clear cart:", clearError);
          } else {
            console.log("✅ [WEBHOOK] Cart items cleared successfully!");
          }
        }

        // Send WhatsApp notification to farmer(s)
        console.log("📱 [WEBHOOK] Sending WhatsApp notification to farmer...");
        try {
          // Get unique farmers from transaction items
          const { data: farmersData } = await supabase
            .from("transaction_items")
            .select(`
              product_id,
              products (
                farmer_id,
                farmers (
                  farm_name,
                  users (
                    name,
                    phone
                  )
                )
              )
            `)
            .eq("transaction_id", transaction.id);

          if (farmersData && farmersData.length > 0) {
            // Group by farmer to send one notification per farmer
            const farmerNotifications = new Map();

            for (const item of farmersData) {
              const product = Array.isArray(item.products) ? item.products[0] : item.products;
              const farmerData = Array.isArray(product?.farmers) ? product.farmers[0] : product?.farmers;
              const userData = Array.isArray(farmerData?.users) ? farmerData.users[0] : farmerData?.users;

              if (farmerData && userData?.phone) {
                const farmerId = product.farmer_id;
                if (!farmerNotifications.has(farmerId)) {
                  farmerNotifications.set(farmerId, {
                    phone: userData.phone,
                    name: userData.name || farmerData.farm_name || "Farmer",
                    itemCount: 1,
                  });
                } else {
                  farmerNotifications.get(farmerId).itemCount++;
                }
              }
            }

            // Send notification to each farmer
            for (const [farmerId, farmerInfo] of farmerNotifications) {
              const whatsappResult = await sendNewOrderNotificationToFarmer(
                farmerInfo.phone,
                farmerInfo.name,
                transaction.order_id,
                transaction.customer_name || "Customer",
                transaction.total_amount,
                farmerInfo.itemCount
              );

              if (whatsappResult.success) {
                console.log(`✅ [WEBHOOK] WhatsApp sent to farmer: ${farmerInfo.name}`);
              } else {
                console.error(`⚠️ [WEBHOOK] Failed to send WhatsApp to farmer: ${whatsappResult.message}`);
              }
            }
          }
        } catch (whatsappError) {
          console.error("⚠️ [WEBHOOK] WhatsApp notification error:", whatsappError);
          // Don't fail the webhook if WhatsApp fails
        }

        // Send payment success notification to customer
        console.log("📱 [WEBHOOK] Sending payment success notification to customer...");
        try {
          if (transaction.customer_phone && transaction.customer_name) {
            const whatsappResult = await sendPaymentSuccessWhatsApp(
              transaction.customer_phone,
              transaction.customer_name,
              transaction.order_id,
              transaction.total_amount
            );

            if (whatsappResult.success) {
              console.log("✅ [WEBHOOK] Payment success WhatsApp sent to customer");
            } else {
              console.error(`⚠️ [WEBHOOK] Failed to send payment success WhatsApp: ${whatsappResult.message}`);
            }
          }
        } catch (whatsappError) {
          console.error("⚠️ [WEBHOOK] Payment success WhatsApp error:", whatsappError);
        }
      }
    }

    console.log("🔔 ========================================");
    console.log("🔔 [WEBHOOK] Notification processed successfully!");
    console.log("🔔 ========================================");

    return {
      success: true,
      message: "Notification processed successfully",
    };
  } catch (error) {
    console.error("❌ [WEBHOOK] CRITICAL ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to process notification",
    };
  }
}

/**
 * Check transaction status directly from Midtrans API
 * This is the self-healing mechanism when webhook fails
 */
async function checkMidtransStatus(orderId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const data = await midtransService.getTransactionStatus(orderId);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error checking Midtrans status:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Sync transaction status from Midtrans to database
 * Self-healing mechanism when webhook fails (e.g., localtunnel blocked)
 */
async function syncTransactionFromMidtrans(
  orderId: string,
  supabase: ReturnType<typeof createServiceClient>
): Promise<{ synced: boolean; newStatus?: string }> {
  try {
    const normalizedId = normalizeOrderId(orderId);
    console.log(`🔄 [SELF-HEALING] Checking Midtrans API for ${normalizedId}...`);

    // 1. Get current status from Midtrans API
    const midtransResult = await checkMidtransStatus(normalizedId);

    if (!midtransResult.success || !midtransResult.data) {
      console.log("⚠️ [SELF-HEALING] Could not get Midtrans status");
      return { synced: false };
    }

    const midtransData = midtransResult.data;
    
    // 2. Use utility function to map status
    const { transactionStatus: newStatus, paymentStatus } = mapMidtransStatus(
      midtransData.transaction_status,
      midtransData.fraud_status
    );

    console.log(`📊 [SELF-HEALING] Midtrans status: ${midtransData.transaction_status}, mapped to: ${newStatus}`);

    // 3. Get current DB status
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("id, status")
      .eq("order_id", normalizedId)
      .single();

    if (txError || !transaction) {
      console.error("❌ [SELF-HEALING] Transaction not found in DB:", normalizedId);
      return { synced: false };
    }

    const dbStatus = transaction.status;
    console.log(`📊 [SELF-HEALING] DB status: ${dbStatus}`);

    // 4. Determine if we need to sync
    const needsSync = (
      (newStatus === "paid" && (dbStatus === "pending" || dbStatus === "processing")) ||
      (newStatus === "cancelled" && (dbStatus === "pending" || dbStatus === "processing")) ||
      (newStatus === "expired" && (dbStatus === "pending" || dbStatus === "processing")) ||
      (newStatus === "failed" && (dbStatus === "pending" || dbStatus === "processing"))
    );

    // 5. If status needs update, do it now!
    if (needsSync && newStatus !== dbStatus) {
      console.log(`🔧 [SELF-HEALING] Updating DB: ${dbStatus} → ${newStatus}`);

      // Update transactions table
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        metadata: midtransData, // Store raw Midtrans response
      };

      if (newStatus === "paid") {
        updateData.paid_at = midtransData.settlement_time || new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("transactions")
        .update(updateData)
        .eq("id", transaction.id);

      if (updateError) {
        console.error("❌ [SELF-HEALING] Failed to update transaction:", updateError);
        return { synced: false };
      }

      // Update payments table
      const { data: payment } = await supabase
        .from("payments")
        .select("id, notification_history")
        .eq("transaction_id", transaction.id)
        .single();

      if (payment) {
        const notificationHistory = Array.isArray(payment.notification_history)
          ? payment.notification_history
          : [];
        notificationHistory.push({
          timestamp: new Date().toISOString(),
          source: "self-healing",
          data: midtransData,
        });

        await supabase
          .from("payments")
          .update({
            midtrans_transaction_id: midtransData.transaction_id,
            payment_status: paymentStatus,
            payment_type: midtransData.payment_type,
            fraud_status: midtransData.fraud_status,
            status_code: midtransData.status_code,
            status_message: midtransData.status_message,
            transaction_time: midtransData.transaction_time,
            settlement_time: midtransData.settlement_time,
            notification_history: notificationHistory,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.id);
      }

      // Clear cart items and update stock if payment is successful
      if (newStatus === "paid") {
        console.log("🛒 [SELF-HEALING] Processing paid transaction...");
        
        // Get full transaction data to get user_id
        const { data: fullTransaction } = await supabase
          .from("transactions")
          .select("user_id")
          .eq("id", transaction.id)
          .single();

        if (fullTransaction) {
          // Get product IDs and quantities from transaction_items
          const { data: transactionItems } = await supabase
            .from("transaction_items")
            .select("product_id, quantity")
            .eq("transaction_id", transaction.id);

          if (transactionItems && transactionItems.length > 0) {
            const productIds = transactionItems.map((item: any) => item.product_id);
            
            // Update product stock
            for (const item of transactionItems) {
              const { data: product } = await supabase
                .from("products")
                .select("stock, total_sold")
                .eq("id", item.product_id)
                .single();
              
              if (product) {
                await supabase
                  .from("products")
                  .update({
                    stock: Math.max(0, product.stock - item.quantity),
                    total_sold: (product.total_sold || 0) + item.quantity,
                  })
                  .eq("id", item.product_id);
              }
            }
            console.log("✅ [SELF-HEALING] Product stock updated!");
            
            // Get user's cart and clear items
            const { data: userCart } = await supabase
              .from("carts")
              .select("id")
              .eq("user_id", fullTransaction.user_id)
              .single();

            if (userCart) {
              await supabase
                .from("cart_items")
                .delete()
                .eq("cart_id", userCart.id)
                .in("product_id", productIds);
              
              console.log("✅ [SELF-HEALING] Cart items cleared!");
            }
          }
        }
      }

      console.log(`✅ [SELF-HEALING] Successfully synced ${normalizedId} to ${newStatus}`);
      return { synced: true, newStatus };
    }

    console.log(`ℹ️ [SELF-HEALING] No sync needed for ${normalizedId}`);
    return { synced: false };
  } catch (error) {
    console.error("❌ [SELF-HEALING] Error:", error);
    return { synced: false };
  }
}

/**
 * Get transaction status by order ID
 * Uses service role client to bypass RLS and get latest data
 * INCLUDES SELF-HEALING: If DB shows pending but Midtrans shows paid, auto-sync!
 */
export async function getTransactionStatus(
  orderId: string
): Promise<TransactionStatusResponse> {
  try {
    console.log(`🔍 Getting transaction status for ${orderId}`);

    // Normalize order_id using utility function
    const normalizedOrderId = normalizeOrderId(orderId);

    // Use service role client to bypass RLS
    const supabase = createServiceClient();

    // Get transaction with items and payment
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select(
        `
        *,
        transaction_items (*),
        payments (*)
      `
      )
      .eq("order_id", normalizedOrderId)
      .single();

    if (transactionError || !transaction) {
      console.error("❌ Transaction not found:", normalizedOrderId, transactionError);
      return {
        success: false,
        message: "Transaksi tidak ditemukan",
      };
    }

    console.log("✅ Transaction found:", transaction.order_id);
    console.log("📊 Transaction status from DB:", transaction.status);

    const payment = Array.isArray(transaction.payments)
      ? transaction.payments[0]
      : transaction.payments;

    console.log("💳 Payment status from DB:", payment?.payment_status);
    console.log("💳 Payment type from DB:", payment?.payment_type);

    // ============================================
    // SELF-HEALING: Check Midtrans if still pending
    // ============================================
    if (transaction.status === "pending" || payment?.payment_status === "pending") {
      console.log("🔄 [SELF-HEALING] DB shows pending, checking Midtrans API...");
      
      const syncResult = await syncTransactionFromMidtrans(normalizedOrderId, supabase);
      
      if (syncResult.synced && syncResult.newStatus) {
        console.log(`✅ [SELF-HEALING] Status synced to: ${syncResult.newStatus}`);
        
        // Re-fetch updated data
        const { data: updatedTransaction } = await supabase
          .from("transactions")
          .select(
            `
            *,
            transaction_items (*),
            payments (*)
          `
          )
          .eq("order_id", normalizedOrderId)
          .single();

        if (updatedTransaction) {
          const updatedPayment = Array.isArray(updatedTransaction.payments)
            ? updatedTransaction.payments[0]
            : updatedTransaction.payments;

          return {
            success: true,
            message: "Status transaksi berhasil disinkronkan dari Midtrans",
            data: {
              orderId: updatedTransaction.order_id,
              status: updatedTransaction.status,
              paymentStatus: updatedPayment?.payment_status || "pending",
              paymentType: updatedPayment?.payment_type,
              total: updatedTransaction.total_amount,
              paidAt: updatedTransaction.paid_at,
              transaction: updatedTransaction,
              payment: updatedPayment,
              items: updatedTransaction.transaction_items || [],
            },
          };
        }
      }
    }

    return {
      success: true,
      message: "Status transaksi berhasil diambil",
      data: {
        orderId: transaction.order_id,
        status: transaction.status,
        paymentStatus: payment?.payment_status || "pending",
        paymentType: payment?.payment_type,
        total: transaction.total_amount,
        paidAt: transaction.paid_at,
        transaction,
        payment,
        items: transaction.transaction_items || [],
      },
    };
  } catch (error) {
    console.error("❌ Get transaction status error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengambil status transaksi",
    };
  }
}

/**
 * Cancel transaction
 */
export async function cancelTransaction(
  orderId: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`❌ Cancelling transaction ${orderId}`);

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "User tidak terautentikasi",
      };
    }

    // Update transaction status
    const { data, error } = await supabase
      .from("transactions")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !data) {
      console.error("❌ Cancel transaction error:", error);
      return {
        success: false,
        message: "Gagal membatalkan transaksi",
      };
    }

    // Update payment status
    await supabase
      .from("payments")
      .update({
        payment_status: "cancel",
        updated_at: new Date().toISOString(),
      })
      .eq("transaction_id", data.id);

    console.log("✅ Transaction cancelled successfully");

    return {
      success: true,
      message: "Transaksi berhasil dibatalkan",
    };
  } catch (error) {
    console.error("❌ Cancel transaction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal membatalkan transaksi",
    };
  }
}

/**
 * Force sync transaction status from Midtrans
 * Use this when webhook fails and you need to manually trigger sync
 */
export async function forceSyncTransactionStatus(
  orderId: string
): Promise<{ success: boolean; message: string; newStatus?: string }> {
  try {
    console.log(`🔄 [FORCE SYNC] Starting for ${orderId}...`);

    const normalizedOrderId = normalizeOrderId(orderId);
    const supabase = createServiceClient();

    const syncResult = await syncTransactionFromMidtrans(normalizedOrderId, supabase);

    if (syncResult.synced) {
      return {
        success: true,
        message: `Status berhasil disinkronkan ke: ${syncResult.newStatus}`,
        newStatus: syncResult.newStatus,
      };
    }

    return {
      success: true,
      message: "Status sudah sinkron atau tidak perlu diupdate",
    };
  } catch (error) {
    console.error("❌ [FORCE SYNC] Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal sinkronisasi",
    };
  }
}
