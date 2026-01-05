"use server";

/**
 * Farmer Dashboard Server Actions
 * ===========================================
 * Server-side data fetching for Farmer Dashboard
 */

import { createClient } from "@/lib/supabase/server";

// ===========================================
// TYPES
// ===========================================

export type DashboardStats = {
  totalSales: number;
  newOrders: number;
  needsShipping: number;
  pendingPickup: number;
};

export type SalesDataPoint = {
  date: string;
  amount: number;
};

export type TopProduct = {
  id: string;
  name: string;
  slug: string;
  totalSold: number;
  revenue: number;
  image: string | null;
};

export type Alert = {
  id: string;
  type: "low_stock" | "new_order" | "pending_pickup";
  message: string;
  createdAt: string;
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

// ===========================================
// DASHBOARD DATA FUNCTIONS
// ===========================================

/**
 * Get dashboard statistics
 */
export async function getFarmerDashboardStats(): Promise<DashboardStats> {
  const farmerId = await getCurrentFarmerId();
  if (!farmerId) {
    return {
      totalSales: 0,
      newOrders: 0,
      needsShipping: 0,
      pendingPickup: 0,
    };
  }

  const supabase = await createClient();

  // Get total sales and new orders count
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      id,
      total,
      status,
      created_at,
      order_items!inner(
        product_id,
        products!inner(
          farmer_id
        )
      )
    `
    )
    .eq("order_items.products.farmer_id", farmerId);

  let totalSales = 0;
  let newOrders = 0;
  let needsShipping = 0;

  if (orders) {
    // Calculate total sales from completed orders
    orders.forEach((order) => {
      if (order.status === "DELIVERED" || order.status === "COMPLETED") {
        totalSales += Number(order.total) || 0;
      }

      // Count new orders (pending or confirmed)
      if (order.status === "PENDING" || order.status === "CONFIRMED") {
        newOrders++;
      }

      // Count orders that need shipping
      if (
        order.status === "CONFIRMED" ||
        order.status === "PROCESSING"
      ) {
        needsShipping++;
      }
    });
  }

  // Get pending pickup count from supplies
  const { count: pendingPickup } = await supabase
    .from("supplies")
    .select("*", { count: "exact", head: true })
    .eq("farmer_id", farmerId)
    .eq("status", "SCHEDULED");

  return {
    totalSales,
    newOrders,
    needsShipping,
    pendingPickup: pendingPickup || 0,
  };
}

/**
 * Get sales chart data for last 7 days
 */
export async function getSalesChartData(): Promise<SalesDataPoint[]> {
  const farmerId = await getCurrentFarmerId();
  if (!farmerId) return [];

  const supabase = await createClient();

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      created_at,
      total,
      order_items!inner(
        product_id,
        products!inner(
          farmer_id
        )
      )
    `
    )
    .eq("order_items.products.farmer_id", farmerId)
    .gte(
      "created_at",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    );

  // Group by date
  const salesByDate: Record<string, number> = {};
  last7Days.forEach((date) => {
    salesByDate[date] = 0;
  });

  if (orders) {
    orders.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0];
      if (salesByDate[date] !== undefined) {
        salesByDate[date] += Number(order.total) || 0;
      }
    });
  }

  return last7Days.map((date) => ({
    date,
    amount: salesByDate[date],
  }));
}

/**
 * Get top selling products
 */
export async function getTopProducts(limit: number = 5): Promise<TopProduct[]> {
  const farmerId = await getCurrentFarmerId();
  if (!farmerId) return [];

  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, total_sold, price, images")
    .eq("farmer_id", farmerId)
    .eq("is_active", true)
    .order("total_sold", { ascending: false })
    .limit(limit);

  if (!products) return [];

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    totalSold: product.total_sold || 0,
    revenue: (product.total_sold || 0) * (Number(product.price) || 0),
    image: product.images && product.images.length > 0 ? product.images[0] : null,
  }));
}

/**
 * Get operational alerts
 */
export async function getOperationalAlerts(): Promise<Alert[]> {
  const farmerId = await getCurrentFarmerId();
  if (!farmerId) return [];

  const supabase = await createClient();
  const alerts: Alert[] = [];

  // Check for low stock products
  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("id, name, stock")
    .eq("farmer_id", farmerId)
    .eq("is_active", true)
    .lte("stock", 10)
    .order("stock", { ascending: true })
    .limit(3);

  if (lowStockProducts) {
    lowStockProducts.forEach((product) => {
      alerts.push({
        id: `low-stock-${product.id}`,
        type: "low_stock",
        message: `Stok ${product.name} tersisa ${product.stock} unit`,
        createdAt: new Date().toISOString(),
      });
    });
  }

  // Check for new orders
  const { data: newOrders } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      created_at,
      order_items!inner(
        product_id,
        products!inner(
          farmer_id
        )
      )
    `
    )
    .eq("order_items.products.farmer_id", farmerId)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })
    .limit(3);

  if (newOrders) {
    newOrders.forEach((order) => {
      alerts.push({
        id: `new-order-${order.id}`,
        type: "new_order",
        message: `Pesanan baru ${order.order_number}`,
        createdAt: order.created_at,
      });
    });
  }

  // Sort by created_at descending
  alerts.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return alerts.slice(0, 5);
}
