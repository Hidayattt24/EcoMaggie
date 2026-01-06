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
  totalSalesLastMonth: number;
  salesGrowthPercentage: number;
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
  type: "low_stock" | "new_order" | "pending_pickup" | "new_supply_request";
  message: string;
  createdAt: string;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    productName?: string;
    stock?: number;
    supplyId?: string;
    customerName?: string;
    amount?: number;
  };
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
 * Includes comparison with last month
 */
export async function getFarmerDashboardStats(): Promise<DashboardStats> {
  const farmerId = await getCurrentFarmerId();
  if (!farmerId) {
    return {
      totalSales: 0,
      totalSalesLastMonth: 0,
      salesGrowthPercentage: 0,
      newOrders: 0,
      needsShipping: 0,
      pendingPickup: 0,
    };
  }

  const supabase = await createClient();

  // Get all transactions that contain farmer's products
  const { data: transactionIds } = await supabase
    .from("transaction_items")
    .select(
      `
      transaction_id,
      products!inner(
        farmer_id
      )
    `
    )
    .eq("products.farmer_id", farmerId);

  if (!transactionIds || transactionIds.length === 0) {
    return {
      totalSales: 0,
      totalSalesLastMonth: 0,
      salesGrowthPercentage: 0,
      newOrders: 0,
      needsShipping: 0,
      pendingPickup: 0,
    };
  }

  const uniqueTransactionIds = [...new Set(transactionIds.map((item: any) => item.transaction_id))];

  // Get date ranges
  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Fetch all transactions
  const { data: allTransactions } = await supabase
    .from("transactions")
    .select("id, status, total_amount, subtotal, service_fee, paid_at, created_at")
    .in("id", uniqueTransactionIds);

  let totalSalesAllTime = 0; // Total keseluruhan (untuk display)
  let totalSalesLastMonth = 0; // Total bulan lalu (untuk comparison)
  let newOrders = 0;
  let needsShipping = 0;

  if (allTransactions) {
    allTransactions.forEach((transaction) => {
      const netEarning = transaction.subtotal - (transaction.subtotal * 0.05); // After 5% platform fee
      const paidDate = transaction.paid_at ? new Date(transaction.paid_at) : null;

      // Calculate total sales ALL TIME from paid transactions
      if (
        transaction.status === "paid" ||
        transaction.status === "shipped" ||
        transaction.status === "delivered" ||
        transaction.status === "completed"
      ) {
        totalSalesAllTime += netEarning;
      }

      // Calculate total sales from LAST MONTH only
      if (
        paidDate &&
        paidDate >= startOfLastMonth &&
        paidDate <= endOfLastMonth &&
        (transaction.status === "paid" ||
          transaction.status === "shipped" ||
          transaction.status === "delivered" ||
          transaction.status === "completed")
      ) {
        totalSalesLastMonth += netEarning;
      }

      // Count new orders (paid status - needs farmer action)
      if (transaction.status === "paid") {
        newOrders++;
      }

      // Count orders that need shipping
      if (
        transaction.status === "paid" ||
        transaction.status === "confirmed" ||
        transaction.status === "processing"
      ) {
        needsShipping++;
      }
    });
  }

  // Calculate growth percentage
  // Compare: (Total All Time - Last Month) vs Last Month
  let salesGrowthPercentage = 0;
  const totalExcludingLastMonth = totalSalesAllTime - totalSalesLastMonth;
  
  if (totalSalesLastMonth > 0) {
    salesGrowthPercentage = ((totalExcludingLastMonth - totalSalesLastMonth) / totalSalesLastMonth) * 100;
  } else if (totalSalesAllTime > 0) {
    // If last month was 0 but we have sales, show as new growth
    salesGrowthPercentage = 0; // Don't show percentage if no comparison data
  }

  // Get pending pickup count from user_supplies (masyarakat yang butuh diambil sampahnya)
  // Count unique user_id (suppliers) with PENDING or SCHEDULED status
  const { data: pendingSupplies, error: supplyError } = await supabase
    .from("user_supplies")
    .select("user_id")
    .in("status", ["PENDING", "SCHEDULED"]);

  // Count unique suppliers
  let pendingPickup = 0;
  if (!supplyError && pendingSupplies) {
    const uniqueSuppliers = new Set(pendingSupplies.map(s => s.user_id));
    pendingPickup = uniqueSuppliers.size;
  }

  return {
    totalSales: Math.round(totalSalesAllTime),
    totalSalesLastMonth: Math.round(totalSalesLastMonth),
    salesGrowthPercentage: Math.round(salesGrowthPercentage * 10) / 10, // Round to 1 decimal
    newOrders,
    needsShipping,
    pendingPickup,
  };
}

/**
 * Get sales chart data for last 7 days
 * Shows revenue from all PAID transactions (not just delivered)
 * Because revenue is recognized when customer pays, not when delivered
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

  // Get transaction IDs with farmer's products in the last 7 days
  const { data: transactionIds } = await supabase
    .from("transaction_items")
    .select(
      `
      transaction_id,
      products!inner(
        farmer_id
      )
    `
    )
    .eq("products.farmer_id", farmerId);

  if (!transactionIds || transactionIds.length === 0) {
    return last7Days.map((date) => ({ date, amount: 0 }));
  }

  const uniqueTransactionIds = [...new Set(transactionIds.map((item: any) => item.transaction_id))];

  // Fetch transactions from last 7 days
  // Include all paid transactions (paid, shipped, delivered, completed)
  const { data: transactions } = await supabase
    .from("transactions")
    .select("created_at, subtotal, status, paid_at")
    .in("id", uniqueTransactionIds)
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .in("status", ["paid", "shipped", "delivered", "completed"]); // All paid statuses

  // Group by date
  const salesByDate: Record<string, number> = {};
  last7Days.forEach((date) => {
    salesByDate[date] = 0;
  });

  if (transactions) {
    transactions.forEach((transaction) => {
      // Use paid_at date if available, otherwise use created_at
      const dateToUse = transaction.paid_at || transaction.created_at;
      const date = new Date(dateToUse).toISOString().split("T")[0];
      
      if (salesByDate[date] !== undefined) {
        // Calculate net earning (after 5% platform fee)
        const netEarning = transaction.subtotal - (transaction.subtotal * 0.05);
        // Count all paid transactions (revenue recognized at payment)
        salesByDate[date] += netEarning;
      }
    });
  }

  return last7Days.map((date) => ({
    date,
    amount: Math.round(salesByDate[date]),
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
 * Get operational alerts (last 10 hours)
 * Includes: new orders, low stock, pending pickups, supply requests
 */
export async function getOperationalAlerts(): Promise<Alert[]> {
  const farmerId = await getCurrentFarmerId();
  if (!farmerId) return [];

  const supabase = await createClient();
  const alerts: Alert[] = [];

  // Get timestamp for 10 hours ago
  const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();

  // 1. Check for NEW ORDERS (last 10 hours)
  const { data: transactionIds } = await supabase
    .from("transaction_items")
    .select(
      `
      transaction_id,
      product_name,
      quantity,
      products!inner(
        farmer_id
      )
    `
    )
    .eq("products.farmer_id", farmerId);

  if (transactionIds && transactionIds.length > 0) {
    const uniqueTransactionIds = [...new Set(transactionIds.map((item: any) => item.transaction_id))];

    const { data: newOrders } = await supabase
      .from("transactions")
      .select("id, order_id, customer_name, subtotal, status, paid_at, created_at")
      .in("id", uniqueTransactionIds)
      .eq("status", "paid")
      .gte("paid_at", tenHoursAgo)
      .order("paid_at", { ascending: false })
      .limit(10);

    if (newOrders) {
      newOrders.forEach((order) => {
        // Get product names for this order
        const orderItems = transactionIds.filter(
          (item: any) => item.transaction_id === order.id
        );
        const productNames = orderItems.map((item: any) => item.product_name).join(", ");

        alerts.push({
          id: `new-order-${order.id}`,
          type: "new_order",
          message: `Pesanan baru dari ${order.customer_name}`,
          createdAt: order.paid_at || order.created_at,
          metadata: {
            orderId: order.id,
            orderNumber: order.order_id,
            customerName: order.customer_name,
            amount: order.subtotal,
            productName: productNames,
          },
        });
      });
    }
  }

  // 2. Check for PENDING SUPPLY REQUESTS from community (last 10 hours)
  const { data: pendingSupplies } = await supabase
    .from("user_supplies")
    .select("id, user_id, waste_type, estimated_weight, status, created_at, users:user_id(name, full_name)")
    .in("status", ["PENDING", "SCHEDULED"])
    .gte("created_at", tenHoursAgo)
    .order("created_at", { ascending: false })
    .limit(10);

  if (pendingSupplies) {
    pendingSupplies.forEach((supply: any) => {
      const userName = supply.users?.full_name || supply.users?.name || "Penyuplai";
      alerts.push({
        id: `supply-${supply.id}`,
        type: "new_supply_request",
        message: `Permintaan pickup sampah ${supply.waste_type} (${supply.estimated_weight}kg) dari ${userName}`,
        createdAt: supply.created_at,
        metadata: {
          supplyId: supply.id,
          customerName: userName,
          productName: supply.waste_type,
          amount: supply.estimated_weight,
        },
      });
    });
  }

  // 3. Check for LOW STOCK products (always show, not time-based)
  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("id, name, stock")
    .eq("farmer_id", farmerId)
    .eq("is_active", true)
    .lte("stock", 10)
    .order("stock", { ascending: true })
    .limit(5);

  if (lowStockProducts) {
    lowStockProducts.forEach((product) => {
      alerts.push({
        id: `low-stock-${product.id}`,
        type: "low_stock",
        message: `Stok ${product.name} tersisa ${product.stock} unit`,
        createdAt: new Date().toISOString(),
        metadata: {
          productName: product.name,
          stock: product.stock,
        },
      });
    });
  }

  // Sort by created_at descending (newest first)
  alerts.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return alerts;
}
