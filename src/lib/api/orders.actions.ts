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
  product: {
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

    // Get all transactions that contain farmer's products
    // First, get all transaction IDs that have farmer's products
    const { data: transactionIds, error: transactionIdsError } = await supabase
      .from("transaction_items")
      .select(
        `
        transaction_id,
        products!inner(
          farmer_id
        )
      `
      )
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

    // Fetch full transaction data
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

    // Fetch transaction items for each transaction
    const ordersWithItems = await Promise.all(
      (transactions || []).map(async (transaction) => {
        const { data: items } = await supabase
          .from("transaction_items")
          .select(
            `
            id,
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
          .eq("transaction_id", transaction.id);

        return {
          ...transaction,
          items: items || [],
        };
      })
    );

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
