"use server";

/**
 * Farmer Orders Server Actions
 * ===========================================
 * Server-side data fetching for Farmer Orders Management
 */

import { createClient } from "@/lib/supabase/server";

// ===========================================
// TYPES
// ===========================================

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderProduct = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  image: string | null;
};

export type FarmerOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  notes: string | null;
  paymentMethod: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  shippingAddress: {
    id: string;
    recipient: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    district: string | null;
    village: string | null;
  };
  products: OrderProduct[];
  totalItems: number;
};

export type OrdersStats = {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  completed: number;
  cancelled: number;
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get current farmer ID from authenticated user
 */
async function getCurrentFarmerId(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: farmer } = await supabase
    .from("farmers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  return farmer?.id || null;
}

/**
 * Convert database order status to frontend status
 */
function mapOrderStatus(dbStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    PROCESSING: "PROCESSING",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
  };
  return statusMap[dbStatus] || "PENDING";
}

// ===========================================
// ORDERS DATA FUNCTIONS
// ===========================================

/**
 * Get all orders for current farmer
 */
export async function getFarmerOrders(): Promise<FarmerOrder[]> {
  const farmerId = await getCurrentFarmerId();
  if (!farmerId) return [];

  const supabase = await createClient();

  // Get orders that contain products from this farmer
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      created_at,
      updated_at,
      subtotal,
      shipping_cost,
      total,
      notes,
      payment_method,
      user_id,
      address_id,
      users!inner(
        id,
        full_name,
        email,
        phone
      ),
      addresses!inner(
        id,
        recipient,
        phone,
        street,
        city,
        province,
        postal_code,
        district,
        village
      ),
      order_items!inner(
        id,
        product_id,
        quantity,
        price,
        subtotal,
        products!inner(
          id,
          name,
          images,
          farmer_id
        )
      )
    `
    )
    .eq("order_items.products.farmer_id", farmerId)
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) return [];

  // Transform data
  const transformedOrders: FarmerOrder[] = orders.map((order: any) => {
    // Get user info
    const user = Array.isArray(order.users) ? order.users[0] : order.users;
    const address = Array.isArray(order.addresses)
      ? order.addresses[0]
      : order.addresses;

    // Get products from this farmer only
    const farmerProducts = order.order_items.filter(
      (item: any) => item.products.farmer_id === farmerId
    );

    // Calculate total items
    const totalItems = farmerProducts.reduce(
      (sum: number, item: any) => sum + (item.quantity || 0),
      0
    );

    return {
      id: order.id,
      orderNumber: order.order_number,
      status: mapOrderStatus(order.status),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      subtotal: Number(order.subtotal) || 0,
      shippingCost: Number(order.shipping_cost) || 0,
      total: Number(order.total) || 0,
      notes: order.notes,
      paymentMethod: order.payment_method,
      customer: {
        id: user?.id || "",
        name: user?.full_name || "Unknown",
        email: user?.email || "",
        phone: user?.phone || null,
      },
      shippingAddress: {
        id: address?.id || "",
        recipient: address?.recipient || "",
        phone: address?.phone || "",
        street: address?.street || "",
        city: address?.city || "",
        province: address?.province || "",
        postalCode: address?.postal_code || "",
        district: address?.district || null,
        village: address?.village || null,
      },
      products: farmerProducts.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.products?.name || "Unknown Product",
        quantity: item.quantity || 0,
        price: Number(item.price) || 0,
        subtotal: Number(item.subtotal) || 0,
        image:
          item.products?.images && item.products.images.length > 0
            ? item.products.images[0]
            : null,
      })),
      totalItems,
    };
  });

  return transformedOrders;
}

/**
 * Get orders statistics
 */
export async function getOrdersStats(): Promise<OrdersStats> {
  const farmerId = await getCurrentFarmerId();
  if (!farmerId) {
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
    };
  }

  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      order_items!inner(
        product_id,
        products!inner(
          farmer_id
        )
      )
    `
    )
    .eq("order_items.products.farmer_id", farmerId);

  const stats: OrdersStats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
  };

  if (orders) {
    stats.total = orders.length;

    orders.forEach((order: any) => {
      switch (order.status) {
        case "PENDING":
          stats.pending++;
          break;
        case "CONFIRMED":
          stats.confirmed++;
          break;
        case "PROCESSING":
          stats.processing++;
          break;
        case "SHIPPED":
          stats.shipped++;
          break;
        case "DELIVERED":
          stats.delivered++;
          break;
        case "CANCELLED":
          stats.cancelled++;
          break;
      }
    });

    // Add CONFIRMED to completed for now (can be adjusted based on business logic)
    stats.completed = stats.delivered;
  }

  return stats;
}

/**
 * Get single order detail
 */
export async function getFarmerOrderDetail(
  orderId: string
): Promise<FarmerOrder | null> {
  const farmerId = await getCurrentFarmerId();
  if (!farmerId) return null;

  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      created_at,
      updated_at,
      subtotal,
      shipping_cost,
      total,
      notes,
      payment_method,
      user_id,
      address_id,
      users!inner(
        id,
        full_name,
        email,
        phone
      ),
      addresses!inner(
        id,
        recipient,
        phone,
        street,
        city,
        province,
        postal_code,
        district,
        village
      ),
      order_items!inner(
        id,
        product_id,
        quantity,
        price,
        subtotal,
        products!inner(
          id,
          name,
          images,
          farmer_id
        )
      )
    `
    )
    .eq("id", orderId)
    .eq("order_items.products.farmer_id", farmerId)
    .single();

  if (!order) return null;

  // Transform data (same as getFarmerOrders)
  const user = Array.isArray(order.users) ? order.users[0] : order.users;
  const address = Array.isArray(order.addresses)
    ? order.addresses[0]
    : order.addresses;

  const farmerProducts = (order.order_items as any[]).filter(
    (item: any) => item.products.farmer_id === farmerId
  );

  const totalItems = farmerProducts.reduce(
    (sum: number, item: any) => sum + (item.quantity || 0),
    0
  );

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: mapOrderStatus(order.status),
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    subtotal: Number(order.subtotal) || 0,
    shippingCost: Number(order.shipping_cost) || 0,
    total: Number(order.total) || 0,
    notes: order.notes,
    paymentMethod: order.payment_method,
    customer: {
      id: user?.id || "",
      name: user?.full_name || "Unknown",
      email: user?.email || "",
      phone: user?.phone || null,
    },
    shippingAddress: {
      id: address?.id || "",
      recipient: address?.recipient || "",
      phone: address?.phone || "",
      street: address?.street || "",
      city: address?.city || "",
      province: address?.province || "",
      postalCode: address?.postal_code || "",
      district: address?.district || null,
      village: address?.village || null,
    },
    products: farmerProducts.map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      name: item.products?.name || "Unknown Product",
      quantity: item.quantity || 0,
      price: Number(item.price) || 0,
      subtotal: Number(item.subtotal) || 0,
      image:
        item.products?.images && item.products.images.length > 0
          ? item.products.images[0]
          : null,
    })),
    totalItems,
  };
}
