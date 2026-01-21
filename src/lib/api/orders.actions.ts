/**
 * Orders Server Actions
 * ========================================
 *
 * Server actions untuk fetch dan manage orders data
 * - Fetch orders (farmer & customer)
 * - Fetch order detail dengan tracking
 * - Update order status
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import {
  sendOrderConfirmedWhatsApp,
  sendOrderProcessingWhatsApp,
  sendOrderShippedWhatsApp,
  sendOrderReadyPickupWhatsApp,
  sendOrderCancelledByFarmerWhatsApp,
  sendOrderCancelledByCustomerToFarmerWhatsApp,
  sendOrderCompletedWhatsApp,
} from "@/lib/whatsapp/venusconnect";

// ==========================================
// HELPER: Record Sales to product_sales_history
// ==========================================

async function recordSalesForTransaction(transactionId: string): Promise<void> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    // Get transaction items with product info
    const { data: items, error: itemsError } = await supabase
      .from("transaction_items")
      .select(`
        product_id,
        quantity,
        unit_price,
        subtotal
      `)
      .eq("transaction_id", transactionId);

    if (itemsError || !items || items.length === 0) {
      console.log(`⚠️ [recordSalesForTransaction] No items found for transaction: ${transactionId}`);
      return;
    }

    // Record sales for each product
    for (const item of items) {
      // Upsert to product_sales_history
      const { error: upsertError } = await supabase
        .from("product_sales_history")
        .upsert(
          {
            product_id: item.product_id,
            sale_date: today,
            quantity_sold: item.quantity,
            revenue: item.subtotal,
            orders_count: 1,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "product_id,sale_date",
            ignoreDuplicates: false,
          }
        );

      if (upsertError) {
        // If upsert fails, try to update existing record
        const { data: existing } = await supabase
          .from("product_sales_history")
          .select("id, quantity_sold, revenue, orders_count")
          .eq("product_id", item.product_id)
          .eq("sale_date", today)
          .single();

        if (existing) {
          await supabase
            .from("product_sales_history")
            .update({
              quantity_sold: existing.quantity_sold + item.quantity,
              revenue: Number(existing.revenue) + item.subtotal,
              orders_count: existing.orders_count + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        } else {
          // Insert new record
          await supabase.from("product_sales_history").insert({
            product_id: item.product_id,
            sale_date: today,
            quantity_sold: item.quantity,
            revenue: item.subtotal,
            orders_count: 1,
          });
        }
      }

      // Update total_sold on products table
      const { data: product } = await supabase
        .from("products")
        .select("total_sold")
        .eq("id", item.product_id)
        .single();

      if (product) {
        await supabase
          .from("products")
          .update({ total_sold: (product.total_sold || 0) + item.quantity })
          .eq("id", item.product_id);
      }

      console.log(`📊 [recordSalesForTransaction] Recorded sale: product=${item.product_id}, qty=${item.quantity}, revenue=${item.subtotal}`);
    }

    console.log(`✅ [recordSalesForTransaction] Sales recorded for transaction: ${transactionId}`);
  } catch (error) {
    console.error("❌ [recordSalesForTransaction] Error:", error);
  }
}

// ==========================================
// TYPES
// ==========================================

export interface OrderProduct {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  unit: string;
  product?: {
    slug: string;
    name: string;
    images: string[];
  } | null;
  products?: {
    slug: string;
    name: string;
    images: string[];
  }[] | {
    slug: string;
    name: string;
    images: string[];
  } | null;
}

export interface Order {
  id: string;
  order_id: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  service_fee: number;
  total_amount: number;
  shipping_method: string | null;
  shipping_courier: string | null;
  shipping_tracking_number: string | null;
  estimated_delivery: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  items: OrderProduct[];
  tracking_history?: TrackingHistory[];
}

export interface TrackingHistory {
  id: string;
  status: string;
  note: string;
  location: string | null;
  tracked_at: string;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ==========================================
// FARMER ACTIONS
// ==========================================

/**
 * Get all orders for farmer
 * @returns List of orders containing farmer's products
 * OPTIMIZED: Uses efficient join query to reduce database calls
 */
export async function getFarmerOrders(): Promise<ApiResponse<Order[]>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized - No user found",
      };
    }

    console.log("🔍 [getFarmerOrders] Fetching orders for user:", user.id);

    // Get farmer data
    const { data: farmer, error: farmerError } = await supabase
      .from("farmers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (farmerError || !farmer) {
      console.error("❌ [getFarmerOrders] Farmer not found:", farmerError);
      return {
        success: false,
        message: "Farmer not found",
      };
    }

    // OPTIMIZED: Get unique transaction IDs using inner join
    const { data: transactionIds, error: transactionIdsError } = await supabase
      .from("transaction_items")
      .select(`
        transaction_id,
        products!inner(
          farmer_id
        )
      `)
      .eq("products.farmer_id", farmer.id);

    if (transactionIdsError) {
      console.error("❌ [getFarmerOrders] Error fetching transaction IDs:", transactionIdsError);
      return {
        success: false,
        message: "Failed to fetch orders",
      };
    }

    const uniqueTransactionIds = [...new Set(transactionIds?.map((item: any) => item.transaction_id) || [])];

    if (uniqueTransactionIds.length === 0) {
      console.log("✅ [getFarmerOrders] No orders found");
      return {
        success: true,
        data: [],
      };
    }

    // OPTIMIZED: Fetch all transaction items in ONE query using 'in' filter
    const { data: allItems, error: itemsError } = await supabase
      .from("transaction_items")
      .select(
        `
        id,
        transaction_id,
        product_id,
        product_name,
        product_image,
        unit_price,
        quantity,
        subtotal,
        unit,
        products(
          slug,
          name,
          images
        )
      `
      )
      .in("transaction_id", uniqueTransactionIds);

    if (itemsError) {
      console.error("❌ [getFarmerOrders] Error fetching items:", itemsError);
    }

    // OPTIMIZED: Fetch transactions with all details in ONE query
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select(
        `
        id,
        order_id,
        status,
        subtotal,
        shipping_cost,
        service_fee,
        total_amount,
        shipping_method,
        shipping_courier,
        shipping_tracking_number,
        estimated_delivery,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        created_at,
        updated_at,
        paid_at
      `
      )
      .in("id", uniqueTransactionIds)
      .order("created_at", { ascending: false });

    if (transactionsError) {
      console.error("❌ [getFarmerOrders] Error fetching transactions:", transactionsError);
      return {
        success: false,
        message: "Failed to fetch orders",
      };
    }

    // OPTIMIZED: Group items by transaction_id using Map for O(n) complexity
    const itemsByTransactionId = new Map<string, any[]>();
    (allItems || []).forEach((item) => {
      if (!itemsByTransactionId.has(item.transaction_id)) {
        itemsByTransactionId.set(item.transaction_id, []);
      }
      itemsByTransactionId.get(item.transaction_id)!.push(item);
    });

    // OPTIMIZED: Map transactions with their items without async operations
    const ordersWithItems = (transactions || []).map((transaction) => ({
      ...transaction,
      items: itemsByTransactionId.get(transaction.id) || [],
    }));

    console.log(`✅ [getFarmerOrders] Found ${ordersWithItems.length} orders`);

    return {
      success: true,
      data: ordersWithItems as Order[],
    };
  } catch (error) {
    console.error("❌ [getFarmerOrders] Unexpected error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get order detail by ID for farmer
 */
export async function getFarmerOrderDetail(orderId: string): Promise<ApiResponse<Order>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    console.log(`🔍 [getFarmerOrderDetail] Fetching order: ${orderId}`);

    // Get transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (transactionError || !transaction) {
      console.error("❌ [getFarmerOrderDetail] Transaction not found:", transactionError);
      return {
        success: false,
        message: "Order not found",
      };
    }

    // Verify farmer owns products in this transaction
    const { data: farmer } = await supabase
      .from("farmers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!farmer) {
      return {
        success: false,
        message: "Farmer not found",
      };
    }

    const { data: transactionItems } = await supabase
      .from("transaction_items")
      .select(
        `
        *,
        products!inner(
          farmer_id,
          slug,
          name,
          images
        )
      `
      )
      .eq("transaction_id", transaction.id);

    const isFarmerOrder = transactionItems?.some((item: any) => item.products?.farmer_id === farmer.id);

    if (!isFarmerOrder) {
      return {
        success: false,
        message: "You don't have access to this order",
      };
    }

    // Fetch tracking history
    const { data: trackingHistory } = await supabase
      .from("shipping_tracking_history")
      .select("*")
      .eq("transaction_id", transaction.id)
      .order("tracked_at", { ascending: false });

    const orderWithDetails: Order = {
      ...transaction,
      items: transactionItems || [],
      tracking_history: trackingHistory || [],
    };

    console.log(`✅ [getFarmerOrderDetail] Order found: ${orderId}`);

    return {
      success: true,
      data: orderWithDetails,
    };
  } catch (error) {
    console.error("❌ [getFarmerOrderDetail] Unexpected error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ==========================================
// CUSTOMER ACTIONS
// ==========================================

/**
 * Get all orders for customer
 */
export async function getCustomerOrders(): Promise<ApiResponse<Order[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    console.log("🔍 [getCustomerOrders] Fetching orders for user:", user.id);

    // Fetch transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (transactionsError) {
      console.error("❌ [getCustomerOrders] Error:", transactionsError);
      return {
        success: false,
        message: "Failed to fetch orders",
      };
    }

    // Fetch items for each transaction
    const ordersWithItems = await Promise.all(
      (transactions || []).map(async (transaction) => {
        const { data: items, error: itemsError } = await supabase
          .from("transaction_items")
          .select(
            `
            id,
            transaction_id,
            product_id,
            product_name,
            product_image,
            unit_price,
            quantity,
            subtotal,
            unit,
            products!inner(
              slug,
              name,
              images
            )
          `
          )
          .eq("transaction_id", transaction.id);

        if (itemsError) {
          console.error("❌ [getCustomerOrders] Error fetching items:", itemsError);
        }

        // Debug log to check if slug is fetched correctly (DISABLED)
        // if (items && items.length > 0) {
        //   console.log("🔍 [getCustomerOrders] First item structure:", {
        //     product_id: items[0].product_id,
        //     product_name: items[0].product_name,
        //     products: items[0].products,
        //   });
        // }

        return {
          ...transaction,
          items: items || [],
        };
      })
    );

    console.log(`✅ [getCustomerOrders] Found ${ordersWithItems.length} orders`);

    return {
      success: true,
      data: ordersWithItems as Order[],
    };
  } catch (error) {
    console.error("❌ [getCustomerOrders] Unexpected error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get order detail by ID for customer
 */
export async function getCustomerOrderDetail(orderId: string): Promise<ApiResponse<Order>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    console.log(`🔍 [getCustomerOrderDetail] Fetching order: ${orderId}`);

    // Get transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("*")
      .eq("order_id", orderId)
      .eq("user_id", user.id)
      .single();

    if (transactionError || !transaction) {
      console.error("❌ [getCustomerOrderDetail] Transaction not found:", transactionError);
      return {
        success: false,
        message: "Order not found",
      };
    }

    // Fetch items
    const { data: items } = await supabase
      .from("transaction_items")
      .select(
        `
        *,
        products(
          slug,
          name,
          images
        )
      `
      )
      .eq("transaction_id", transaction.id);

    // Fetch tracking history
    const { data: trackingHistory } = await supabase
      .from("shipping_tracking_history")
      .select("*")
      .eq("transaction_id", transaction.id)
      .order("tracked_at", { ascending: false });

    const orderWithDetails: Order = {
      ...transaction,
      items: items || [],
      tracking_history: trackingHistory || [],
    };

    console.log(`✅ [getCustomerOrderDetail] Order found: ${orderId}`);

    return {
      success: true,
      data: orderWithDetails,
    };
  } catch (error) {
    console.error("❌ [getCustomerOrderDetail] Unexpected error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ==========================================
// CANCEL ORDER ACTIONS
// ==========================================

/**
 * Cancel order by customer
 * Only allowed for: pending, paid status (before processing)
 */
export async function cancelOrderByCustomer(
  orderId: string,
  reason?: string
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    console.log(`🔍 [cancelOrderByCustomer] Cancelling order: ${orderId}`);

    // Get transaction and verify ownership
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("id, status, order_id")
      .eq("order_id", orderId)
      .eq("user_id", user.id)
      .single();

    if (transactionError || !transaction) {
      console.error("❌ [cancelOrderByCustomer] Transaction not found:", transactionError);
      return {
        success: false,
        message: "Pesanan tidak ditemukan",
      };
    }

    // Check if order can be cancelled
    const cancellableStatuses = ["pending", "paid", "confirmed"];
    if (!cancellableStatuses.includes(transaction.status)) {
      return {
        success: false,
        message: `Pesanan dengan status "${transaction.status}" tidak dapat dibatalkan. Hanya pesanan yang belum diproses yang dapat dibatalkan.`,
      };
    }

    // Update status to cancelled
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
        notes: reason ? `Dibatalkan oleh customer: ${reason}` : "Dibatalkan oleh customer",
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("❌ [cancelOrderByCustomer] Update error:", updateError);
      return {
        success: false,
        message: "Gagal membatalkan pesanan",
      };
    }

    // Restore product stock
    await restoreProductStock(supabase, transaction.id);

    // Send WhatsApp notification to farmer(s)
    try {
      const { data: transactionData } = await supabase
        .from("transactions")
        .select("customer_name")
        .eq("id", transaction.id)
        .single();

      const { data: transactionItems } = await supabase
        .from("transaction_items")
        .select(`
          product_id,
          products (
            farmer_id,
            farmers (
              farm_name,
              users (name, phone)
            )
          )
        `)
        .eq("transaction_id", transaction.id);

      // Get unique farmers
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
          });
        }
      }

      // Send notification to each farmer
      for (const [, farmerInfo] of farmerNotifications) {
        if (farmerInfo.phone) {
          await sendOrderCancelledByCustomerToFarmerWhatsApp(
            farmerInfo.phone,
            farmerInfo.name,
            orderId,
            transactionData?.customer_name || "Customer",
            reason
          ).catch((err) => console.error("WhatsApp notification failed:", err));
        }
      }
    } catch (err) {
      console.error("❌ [cancelOrderByCustomer] WhatsApp notification error:", err);
    }

    console.log(`✅ [cancelOrderByCustomer] Order cancelled: ${orderId}`);

    return {
      success: true,
      message: "Pesanan berhasil dibatalkan",
    };
  } catch (error) {
    console.error("❌ [cancelOrderByCustomer] Unexpected error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cancel order by farmer
 * Allowed for: pending, paid, confirmed, processing status
 */
export async function cancelOrderByFarmer(
  orderId: string,
  reason: string
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    console.log(`🔍 [cancelOrderByFarmer] Cancelling order: ${orderId}`);

    // Get farmer data
    const { data: farmer, error: farmerError } = await supabase
      .from("farmers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (farmerError || !farmer) {
      return {
        success: false,
        message: "Farmer not found",
      };
    }

    // Get transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("id, status, order_id, customer_name, customer_phone")
      .eq("order_id", orderId)
      .single();

    if (transactionError || !transaction) {
      console.error("❌ [cancelOrderByFarmer] Transaction not found:", transactionError);
      return {
        success: false,
        message: "Pesanan tidak ditemukan",
      };
    }

    // Verify farmer owns products in this transaction
    const { data: transactionItems } = await supabase
      .from("transaction_items")
      .select(
        `
        *,
        products!inner(
          farmer_id
        )
      `
      )
      .eq("transaction_id", transaction.id);

    const isFarmerOrder = transactionItems?.some((item: any) => item.products?.farmer_id === farmer.id);

    if (!isFarmerOrder) {
      return {
        success: false,
        message: "Anda tidak memiliki akses ke pesanan ini",
      };
    }

    // Check if order can be cancelled
    const cancellableStatuses = ["pending", "paid", "confirmed", "processing", "ready_pickup"];
    if (!cancellableStatuses.includes(transaction.status)) {
      return {
        success: false,
        message: `Pesanan dengan status "${transaction.status}" tidak dapat dibatalkan. Pesanan yang sudah dikirim tidak dapat dibatalkan.`,
      };
    }

    if (!reason || reason.trim().length < 10) {
      return {
        success: false,
        message: "Alasan pembatalan harus diisi minimal 10 karakter",
      };
    }

    // Update status to cancelled
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
        notes: `Dibatalkan oleh penjual: ${reason}`,
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("❌ [cancelOrderByFarmer] Update error:", updateError);
      return {
        success: false,
        message: "Gagal membatalkan pesanan",
      };
    }

    // Restore product stock
    await restoreProductStock(supabase, transaction.id);

    // Send WhatsApp notification to customer
    try {
      if (transaction.customer_phone) {
        await sendOrderCancelledByFarmerWhatsApp(
          transaction.customer_phone,
          transaction.customer_name,
          orderId,
          reason
        ).catch((err) => console.error("WhatsApp notification failed:", err));
      }
    } catch (err) {
      console.error("❌ [cancelOrderByFarmer] WhatsApp notification error:", err);
    }

    console.log(`✅ [cancelOrderByFarmer] Order cancelled: ${orderId}`);

    return {
      success: true,
      message: "Pesanan berhasil dibatalkan",
    };
  } catch (error) {
    console.error("❌ [cancelOrderByFarmer] Unexpected error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Helper function to restore product stock after cancellation
 */
async function restoreProductStock(supabase: any, transactionId: string): Promise<void> {
  try {
    // Get transaction items
    const { data: items } = await supabase
      .from("transaction_items")
      .select("product_id, quantity")
      .eq("transaction_id", transactionId);

    if (!items || items.length === 0) return;

    // Restore stock for each product
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();

      if (product) {
        await supabase
          .from("products")
          .update({ stock: product.stock + item.quantity })
          .eq("id", item.product_id);
      }
    }

    console.log(`✅ [restoreProductStock] Stock restored for transaction: ${transactionId}`);
  } catch (error) {
    console.error("❌ [restoreProductStock] Error:", error);
  }
}

// ==========================================
// ORDER STATUS UPDATE ACTIONS
// ==========================================

/**
 * Update order status by farmer
 * Used for: confirming order, marking ready for pickup, marking as shipped (for delivery)
 */
export async function updateOrderStatusByFarmer(
  orderId: string,
  newStatus: string,
  additionalData?: {
    driverName?: string;
    driverPhone?: string;
    departureTime?: string;
    trackingNumber?: string;
    courierCode?: string;
  }
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    console.log(`🔍 [updateOrderStatusByFarmer] Updating order: ${orderId} to ${newStatus}`);

    // Get farmer data
    const { data: farmer, error: farmerError } = await supabase
      .from("farmers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (farmerError || !farmer) {
      return {
        success: false,
        message: "Farmer not found",
      };
    }

    // Get transaction by order_id
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("id, status, order_id")
      .eq("order_id", orderId)
      .single();

    if (transactionError || !transaction) {
      console.error("❌ [updateOrderStatusByFarmer] Transaction not found:", transactionError);
      return {
        success: false,
        message: "Pesanan tidak ditemukan",
      };
    }

    // Verify farmer owns products in this transaction
    const { data: transactionItems } = await supabase
      .from("transaction_items")
      .select(
        `
        *,
        products!inner(
          farmer_id
        )
      `
      )
      .eq("transaction_id", transaction.id);

    const isFarmerOrder = transactionItems?.some((item: any) => item.products?.farmer_id === farmer.id);

    if (!isFarmerOrder) {
      return {
        success: false,
        message: "Anda tidak memiliki akses ke pesanan ini",
      };
    }

    // Validate status transition
    // For small business, allow more flexible transitions
    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "processing", "cancelled"],
      paid: ["confirmed", "processing", "ready_pickup", "shipped", "cancelled"], // Allow direct to shipped/ready_pickup
      confirmed: ["processing", "ready_pickup", "shipped", "cancelled"],
      processing: ["ready_pickup", "shipped", "cancelled"],
      ready_pickup: ["completed", "cancelled"],
      shipped: ["delivered", "completed"], // Allow direct to completed
      delivered: ["completed"],
    };

    const currentStatus = transaction.status;
    
    // Allow same-status updates (for saving additional info like driver details)
    const isSameStatus = currentStatus === newStatus;
    if (!isSameStatus && !validTransitions[currentStatus]?.includes(newStatus)) {
      return {
        success: false,
        message: `Tidak dapat mengubah status dari "${currentStatus}" ke "${newStatus}"`,
      };
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Add additional data based on status
    if (newStatus === "shipped" && additionalData?.trackingNumber) {
      updateData.shipping_tracking_number = additionalData.trackingNumber;
      if (additionalData.courierCode) {
        updateData.shipping_courier = additionalData.courierCode;
      }
    }

    // For delivery type, store driver info in notes
    if (additionalData?.driverName || additionalData?.driverPhone) {
      const driverInfo = [];
      if (additionalData.driverName) driverInfo.push(`Driver: ${additionalData.driverName}`);
      if (additionalData.driverPhone) driverInfo.push(`HP: ${additionalData.driverPhone}`);
      if (additionalData.departureTime) driverInfo.push(`Berangkat: ${additionalData.departureTime}`);
      updateData.notes = driverInfo.join(", ");
    }

    // Update transaction
    const { error: updateError } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", transaction.id);

    if (updateError) {
      console.error("❌ [updateOrderStatusByFarmer] Update error:", updateError);
      return {
        success: false,
        message: "Gagal mengupdate status pesanan",
      };
    }

    // Add tracking history entry only if status changed
    if (!isSameStatus) {
      await supabase.from("shipping_tracking_history").insert({
        transaction_id: transaction.id,
        status: newStatus,
        note: getStatusNote(newStatus, additionalData),
        tracked_at: new Date().toISOString(),
      });

      // Send WhatsApp notification to customer for status changes
      try {
        const { data: transactionData } = await supabase
          .from("transactions")
          .select("customer_name, customer_phone, estimated_delivery")
          .eq("id", transaction.id)
          .single();

        if (transactionData?.customer_phone) {
          const customerPhone = transactionData.customer_phone;
          const customerName = transactionData.customer_name;

          switch (newStatus) {
            case "confirmed":
              await sendOrderConfirmedWhatsApp(
                customerPhone,
                customerName,
                orderId
              ).catch((err) => console.error("WhatsApp notification failed:", err));
              break;

            case "processing":
              await sendOrderProcessingWhatsApp(
                customerPhone,
                customerName,
                orderId
              ).catch((err) => console.error("WhatsApp notification failed:", err));
              break;

            case "ready_pickup":
              await sendOrderReadyPickupWhatsApp(
                customerPhone,
                customerName,
                orderId
              ).catch((err) => console.error("WhatsApp notification failed:", err));
              break;

            case "shipped":
              await sendOrderShippedWhatsApp(
                customerPhone,
                customerName,
                orderId,
                additionalData?.trackingNumber,
                additionalData?.courierCode,
                transactionData.estimated_delivery || undefined
              ).catch((err) => console.error("WhatsApp notification failed:", err));
              break;

            case "delivered":
              // Delivered status uses the same template as delivery notification
              // We can reuse the existing sendDeliveryNotificationWhatsApp or create a new one
              // For now, we'll skip this as it's typically auto-detected by courier
              break;

            case "completed":
              await sendOrderCompletedWhatsApp(
                customerPhone,
                customerName,
                orderId
              ).catch((err) => console.error("WhatsApp notification failed:", err));
              break;
          }
        }
      } catch (err) {
        console.error("❌ [updateOrderStatusByFarmer] WhatsApp notification error:", err);
      }
    }

    console.log(`✅ [updateOrderStatusByFarmer] Order updated: ${orderId} -> ${newStatus}`);

    return {
      success: true,
      message: getSuccessMessage(newStatus),
    };
  } catch (error) {
    console.error("❌ [updateOrderStatusByFarmer] Unexpected error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Helper to get status note for tracking history
 */
function getStatusNote(status: string, additionalData?: any): string {
  switch (status) {
    case "confirmed":
      return "Pesanan dikonfirmasi oleh penjual";
    case "processing":
      return "Pesanan sedang diproses/dikemas";
    case "ready_pickup":
      return "Pesanan siap diambil di toko";
    case "shipped":
      if (additionalData?.driverName) {
        return `Pesanan dikirim oleh ${additionalData.driverName}`;
      }
      return "Pesanan telah dikirim";
    case "delivered":
      return "Pesanan telah sampai di tujuan";
    case "completed":
      return "Pesanan selesai";
    default:
      return `Status diubah ke ${status}`;
  }
}

/**
 * Helper to get success message
 */
function getSuccessMessage(status: string): string {
  switch (status) {
    case "confirmed":
      return "Pesanan berhasil dikonfirmasi";
    case "processing":
      return "Pesanan sedang diproses";
    case "ready_pickup":
      return "Pesanan ditandai siap diambil";
    case "shipped":
      return "Pesanan berhasil dikirim";
    case "delivered":
      return "Pesanan ditandai sudah sampai";
    case "completed":
      return "Pesanan selesai";
    default:
      return "Status pesanan berhasil diupdate";
  }
}

// ==========================================
// SHIPPING CONFIRMATION (FARMER)
// ==========================================

/**
 * Confirm shipping by farmer (for local delivery without tracking)
 * Changes status from paid -> shipped
 */
export async function confirmShippingByFarmer(
  orderId: string,
  notes?: string
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    console.log(`🚚 [confirmShippingByFarmer] Confirming shipping for: ${orderId}`);

    // Get farmer
    const { data: farmer } = await supabase
      .from("farmers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!farmer) {
      return { success: false, message: "Farmer not found" };
    }

    // Get transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("id, status, order_id")
      .eq("order_id", orderId)
      .single();

    if (txError || !transaction) {
      return { success: false, message: "Pesanan tidak ditemukan" };
    }

    // Verify farmer owns products
    const { data: items } = await supabase
      .from("transaction_items")
      .select("products!inner(farmer_id)")
      .eq("transaction_id", transaction.id);

    const isFarmerOrder = items?.some((item: any) => item.products?.farmer_id === farmer.id);
    if (!isFarmerOrder) {
      return { success: false, message: "Anda tidak memiliki akses ke pesanan ini" };
    }

    // Check valid status
    if (!["paid", "confirmed", "processing"].includes(transaction.status)) {
      return {
        success: false,
        message: `Pesanan dengan status "${transaction.status}" tidak dapat dikonfirmasi pengirimannya`,
      };
    }

    // Update to shipped
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: "shipped",
        updated_at: new Date().toISOString(),
        notes: notes || "Pesanan telah dikirim (konfirmasi manual)",
      })
      .eq("id", transaction.id);

    if (updateError) {
      return { success: false, message: "Gagal mengupdate status" };
    }

    // Add tracking history
    await supabase.from("shipping_tracking_history").insert({
      transaction_id: transaction.id,
      status: "shipped",
      note: notes || "Pesanan telah dikirim oleh penjual",
      tracked_at: new Date().toISOString(),
    });

    console.log(`✅ [confirmShippingByFarmer] Shipping confirmed: ${orderId}`);

    return { success: true, message: "Pengiriman berhasil dikonfirmasi" };
  } catch (error) {
    console.error("❌ [confirmShippingByFarmer] Error:", error);
    return { success: false, message: "Terjadi kesalahan" };
  }
}

// ==========================================
// ORDER COMPLETION (USER)
// ==========================================

/**
 * Confirm order received by customer
 * Changes status from shipped -> completed
 */
export async function confirmOrderReceivedByCustomer(
  orderId: string
): Promise<ApiResponse<{ productSlug?: string }>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    console.log(`✅ [confirmOrderReceivedByCustomer] Confirming receipt: ${orderId}`);

    // Get transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("id, status, order_id, user_id")
      .eq("order_id", orderId)
      .eq("user_id", user.id)
      .single();

    if (txError || !transaction) {
      return { success: false, message: "Pesanan tidak ditemukan" };
    }

    // Check valid status
    if (!["shipped", "delivered", "ready_pickup"].includes(transaction.status)) {
      return {
        success: false,
        message: `Pesanan dengan status "${transaction.status}" tidak dapat dikonfirmasi penerimaannya`,
      };
    }

    // Update to completed
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: "completed",
        updated_at: now,
      })
      .eq("id", transaction.id);

    if (updateError) {
      return { success: false, message: "Gagal mengupdate status" };
    }

    // Add tracking history
    await supabase.from("shipping_tracking_history").insert({
      transaction_id: transaction.id,
      status: "completed",
      note: "Pesanan telah diterima oleh pembeli",
      tracked_at: now,
    });

    // Record sales to product_sales_history for analytics
    await recordSalesForTransaction(transaction.id);

    // Get first product slug for review redirect
    const { data: items } = await supabase
      .from("transaction_items")
      .select("products(slug)")
      .eq("transaction_id", transaction.id)
      .limit(1);

    // Handle both array and object response from Supabase join
    const firstItem = items?.[0] as { products?: { slug?: string } | { slug?: string }[] | null } | undefined;
    const productsData = firstItem?.products;
    const productSlug = Array.isArray(productsData) 
      ? productsData[0]?.slug 
      : productsData?.slug;

    console.log(`✅ [confirmOrderReceivedByCustomer] Order completed: ${orderId}`);

    // Trigger notification (fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/notifications/order-completed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, transactionId: transaction.id }),
    }).catch(() => {});

    return {
      success: true,
      message: "Pesanan berhasil dikonfirmasi",
      data: { productSlug },
    };
  } catch (error) {
    console.error("❌ [confirmOrderReceivedByCustomer] Error:", error);
    return { success: false, message: "Terjadi kesalahan" };
  }
}

// ==========================================
// AUTO-COMPLETE ORDERS (CRON JOB)
// ==========================================

/**
 * Auto-complete orders that have been shipped for more than 3 days
 * Called by cron job
 */
export async function autoCompleteShippedOrders(): Promise<ApiResponse<{ completed: number }>> {
  try {
    const supabase = await createClient();

    // Calculate 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    console.log(`🔄 [autoCompleteShippedOrders] Checking orders shipped before: ${threeDaysAgo.toISOString()}`);

    // Find shipped orders older than 3 days
    const { data: orders, error: fetchError } = await supabase
      .from("transactions")
      .select("id, order_id, updated_at")
      .eq("status", "shipped")
      .lt("updated_at", threeDaysAgo.toISOString());

    if (fetchError) {
      console.error("❌ [autoCompleteShippedOrders] Fetch error:", fetchError);
      return { success: false, message: "Failed to fetch orders" };
    }

    if (!orders || orders.length === 0) {
      console.log("✅ [autoCompleteShippedOrders] No orders to auto-complete");
      return { success: true, data: { completed: 0 } };
    }

    const now = new Date().toISOString();
    let completedCount = 0;

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

        // Record sales to product_sales_history for analytics
        await recordSalesForTransaction(order.id);

        completedCount++;
        console.log(`✅ Auto-completed order: ${order.order_id}`);
      }
    }

    console.log(`✅ [autoCompleteShippedOrders] Completed ${completedCount} orders`);

    return { success: true, data: { completed: completedCount } };
  } catch (error) {
    console.error("❌ [autoCompleteShippedOrders] Error:", error);
    return { success: false, message: "Terjadi kesalahan" };
  }
}
