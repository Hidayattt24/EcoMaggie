"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Calendar,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Banknote,
  RefreshCw,
  ChevronDown,
  Download,
  CheckCircle2,
} from "lucide-react";
import type { Order as DbOrder } from "@/lib/api/orders.actions";
import { CancelOrderModal } from "@/components/farmer/orders/CancelOrderModal";
import { StatsTile } from "@/components/farmer/orders/StatsTile";
import { RevenueTile } from "@/components/farmer/orders/RevenueTile";
import { OrderTableRow } from "@/components/farmer/orders/OrderTableRow";
import {
  StatsTileSkeleton,
  RevenueTileSkeleton,
  TableRowSkeleton,
} from "@/components/farmer/orders/SkeletonComponents";
import { exportOrdersToExcel, type OrderExportData } from "@/utils/exportExcel";
import { useFarmerOrders } from "@/hooks/useFarmerOrders";

// ============================================
// TYPES
// ============================================
type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "processing"
  | "ready_pickup"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

type ShippingType = "ecomaggie-delivery" | "self-pickup" | "expedition";

interface OrderProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string | null;
}

interface Order {
  id: string;
  orderId: string;
  status: OrderStatus;
  products: OrderProduct[];
  totalItems: number;
  totalPrice: number;
  netEarnings: number;
  shippingType: ShippingType;
  expeditionName?: string;
  trackingNumber?: string;
  date: string;
  createdAt: string;
  customer: { name: string; phone: string };
  shippingAddress: { city: string; province: string };
}

// ============================================
// CONFIGURATIONS - Only for export mapping
// ============================================
const statusLabels: Record<OrderStatus, string> = {
  pending: "Belum Dibayar",
  paid: "Dibayar",
  confirmed: "Dikonfirmasi",
  processing: "Dikemas",
  ready_pickup: "Siap Diambil",
  shipped: "Dikirim",
  delivered: "Terkirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function detectShippingType(shippingMethod: string | null): ShippingType {
  if (!shippingMethod) return "expedition";
  const method = shippingMethod.toLowerCase();
  if (
    method.includes("ecomaggie") ||
    method.includes("delivery") ||
    method.includes("motor")
  )
    return "ecomaggie-delivery";
  if (method.includes("pickup") || method.includes("ambil"))
    return "self-pickup";
  return "expedition";
}

// OPTIMIZED: Memoized transform function
const transformDbOrderToOrder = (dbOrder: DbOrder): Order => {
  const shippingType = detectShippingType(dbOrder.shipping_method);
  const addressParts = dbOrder.customer_address.split(",");
  const city = addressParts[addressParts.length - 2]?.trim() || "Unknown";
  const province = addressParts[addressParts.length - 1]?.trim() || "Unknown";
  const subtotal = dbOrder.subtotal || dbOrder.total_amount;
  const netEarnings = Math.round(subtotal * 0.95);

  return {
    id: dbOrder.id,
    orderId: dbOrder.order_id,
    status: dbOrder.status as OrderStatus,
    products: dbOrder.items.map((item) => ({
      id: item.id,
      name: item.product_name,
      quantity: item.quantity,
      price: item.unit_price,
      image: item.product_image,
    })),
    totalItems: dbOrder.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: dbOrder.total_amount,
    netEarnings,
    shippingType,
    expeditionName: dbOrder.shipping_courier?.toUpperCase(),
    trackingNumber: dbOrder.shipping_tracking_number || undefined,
    date: new Date(dbOrder.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    createdAt: dbOrder.created_at,
    customer: { name: dbOrder.customer_name, phone: dbOrder.customer_phone },
    shippingAddress: { city, province },
  };
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function FarmerOrdersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "price">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] =
    useState<Order | null>(null);

  // Use SWR hook for caching - INI YANG MENGURANGI EGRESS!
  const {
    orders: rawOrders,
    isLoading,
    error,
    refresh,
  } = useFarmerOrders();

  // Transform DB orders to display format
  const orders = useMemo(
    () => rawOrders.map(transformDbOrderToOrder),
    [rawOrders]
  );

  const handleOpenCancelModal = useCallback(
    (order: Order, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedOrderForCancel(order);
      setCancelModalOpen(true);
    },
    [],
  );

  // Calculate stats with growth comparison
  const stats = useMemo(() => {
    const total = orders.length;
    const unpaid = orders.filter((o) => o.status === "pending").length;
    const packed = orders.filter((o) =>
      ["paid", "confirmed", "processing"].includes(o.status),
    ).length;
    const readyPickup = orders.filter((o) => o.status === "ready_pickup").length;
    const shipped = orders.filter((o) => o.status === "shipped").length;
    const completed = orders.filter((o) =>
      ["delivered", "completed"].includes(o.status),
    ).length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;

    // Calculate needsAction: orders that need farmer's attention
    const needsAction = orders.filter((o) =>
      ["paid", "confirmed", "processing", "ready_pickup"].includes(o.status),
    ).length;

    const paidOrders = orders.filter((o) =>
      [
        "paid",
        "confirmed",
        "processing",
        "ready_pickup",
        "shipped",
        "delivered",
        "completed",
      ].includes(o.status),
    );
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.netEarnings, 0);
    const totalSales = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    // Calculate growth: Last 30 days vs Previous 30 days
    const now = new Date();
    const last30DaysStart = new Date(now);
    last30DaysStart.setDate(last30DaysStart.getDate() - 30);
    const previous30DaysStart = new Date(now);
    previous30DaysStart.setDate(previous30DaysStart.getDate() - 60);

    const currentPeriodOrders = paidOrders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= last30DaysStart && orderDate <= now;
    });

    const previousPeriodOrders = paidOrders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= previous30DaysStart && orderDate < last30DaysStart;
    });

    const orderGrowth =
      currentPeriodOrders.length - previousPeriodOrders.length;

    return {
      total,
      unpaid,
      packed,
      readyPickup,
      shipped,
      completed,
      cancelled,
      needsAction,
      totalRevenue,
      totalSales,
      paidOrdersCount: paidOrders.length,
      orderGrowth, // NEW: Growth count (can be positive or negative)
      currentPeriodOrderCount: currentPeriodOrders.length, // NEW: For context
      previousPeriodOrderCount: previousPeriodOrders.length, // NEW: For context
    };
  }, [orders]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Apply filter
    if (filter === "unpaid") {
      filtered = filtered.filter((o) => o.status === "pending");
    } else if (filter === "packed") {
      filtered = filtered.filter((o) =>
        ["paid", "confirmed", "processing"].includes(o.status),
      );
    } else if (filter === "ready_pickup") {
      filtered = filtered.filter((o) => o.status === "ready_pickup");
    } else if (filter === "shipped") {
      filtered = filtered.filter((o) => o.status === "shipped");
    } else if (filter === "completed") {
      filtered = filtered.filter((o) =>
        ["delivered", "completed"].includes(o.status),
      );
    } else if (filter === "cancelled") {
      filtered = filtered.filter((o) => o.status === "cancelled");
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderId.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.products.some((p) => p.name.toLowerCase().includes(query)),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        comparison = a.totalPrice - b.totalPrice;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [orders, filter, searchQuery, sortBy, sortOrder]);

  // Export to Excel handler (must be after filteredOrders)
  const handleExportExcel = useCallback(() => {
    const exportData: OrderExportData[] = filteredOrders.map((order) => ({
      orderId: order.orderId,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      totalItems: order.totalItems,
      totalPrice: order.totalPrice,
      netEarnings: order.netEarnings,
      shippingType:
        order.shippingType === "ecomaggie-delivery"
          ? "Eco-Maggie Delivery"
          : order.shippingType === "self-pickup"
            ? "Ambil di Toko"
            : "Ekspedisi Reguler",
      status: statusLabels[order.status],
      date: order.date,
      city: order.shippingAddress.city,
      province: order.shippingAddress.province,
    }));

    exportOrdersToExcel(exportData, "farmer-orders");
  }, [filteredOrders]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#303646] mb-2">
            Gagal Memuat Pesanan
          </h2>
          <p className="text-gray-500 mb-6">{typeof error === "string" ? error : "Terjadi kesalahan"}</p>
          <button
            onClick={() => refresh()}
            className="px-6 py-3 bg-[#a3af87] text-white rounded-xl font-bold hover:bg-[#435664] transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#fdf8d4]/20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-[#303646]">
                  Pesanan Saya
                </h1>
                <p className="text-[#435664] mt-1">
                  Monitor dan kelola pesanan dari customer
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportExcel}
                  disabled={isLoading || filteredOrders.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-[#a3af87] text-white rounded-xl hover:bg-[#435664] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export ke Excel"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    Export Excel
                  </span>
                </button>
                <button
                  onClick={() => refresh()}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#fdf8d4]/50 border-2 border-[#a3af87]/30 rounded-xl hover:border-[#a3af87] transition-colors disabled:opacity-50"
                  title="Refresh Data"
                >
                  <RefreshCw
                    className={`h-4 w-4 text-[#435664] ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span className="text-sm font-medium text-[#435664] hidden sm:inline">
                    Refresh
                  </span>
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#fdf8d4] rounded-xl border border-[#a3af87]/20">
                  <Activity className="h-5 w-5 text-[#a3af87] animate-pulse" />
                  <span className="text-sm font-medium text-[#435664]">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Grid Layout - OPTIMIZED */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            {/* Tile 1: Live Order Stats */}
            {isLoading ? <StatsTileSkeleton /> : <StatsTile stats={stats} />}

            {/* Tile 2: Revenue Summary */}
            {isLoading ? (
              <RevenueTileSkeleton />
            ) : (
              <RevenueTile stats={stats} />
            )}
          </div>

          {/* Real-time Orders Table */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#fdf8d4]/30 rounded-2xl border-2 border-[#a3af87]/30 hover:border-[#a3af87]/50 transition-colors p-6 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-[#a3af87] rounded-xl">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#303646]">
                    Real-time Incoming Orders
                  </h3>
                  <p className="text-xs text-[#435664]">
                    Data pesanan terbaru dari customer
                  </p>
                </div>
              </div>

              {/* Filter Tabs with Badge Counts */}
              <div className="flex items-center gap-2 sm:gap-3 bg-[#fdf8d4]/50 rounded-xl p-1.5 overflow-x-auto w-full sm:w-auto">
                {[
                  { value: "all", label: "Semua", count: stats.total },
                  { value: "unpaid", label: "Belum Dibayar", count: stats.unpaid },
                  { value: "packed", label: "Dikemas", count: stats.packed },
                  { value: "ready_pickup", label: "Siap Diambil", count: stats.readyPickup },
                  { value: "shipped", label: "Dikirim", count: stats.shipped },
                  { value: "completed", label: "Selesai", count: stats.completed },
                  { value: "cancelled", label: "Dibatalkan", count: stats.cancelled },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`relative px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      filter === tab.value
                        ? "bg-[#a3af87] text-white shadow-md"
                        : "text-[#435664] hover:text-[#303646] hover:bg-[#fdf8d4]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {tab.count > 0 && (
                        <span
                          className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[11px] font-bold rounded-full ${
                            tab.value === "unpaid" ||
                            tab.value === "cancelled"
                              ? "bg-red-500 text-white shadow-sm"
                              : tab.value === "shipped" ||
                                  tab.value === "completed"
                                ? "bg-[#a3af87] text-white shadow-sm"
                                : "bg-[#435664] text-white"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#a3af87] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari order ID, nama customer, atau produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#fdf8d4]/50 border-2 border-[#a3af87]/30 rounded-xl text-[#303646] placeholder:text-[#435664]/50 focus:outline-none focus:border-[#a3af87] focus:bg-[#fdf8d4] transition-all"
                />
              </div>
              <div className="flex gap-2">
                {/* Custom Sort Dropdown with Green Color Palette */}
                <div className="relative group">
                  <button className="flex items-center gap-3 px-4 py-3 bg-[#fdf8d4] border-2 border-[#a3af87]/40 rounded-xl hover:border-[#a3af87] hover:shadow-md transition-all">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#a3af87]/20 rounded-lg flex items-center justify-center">
                        {sortBy === "date" ? (
                          <Calendar className="h-4 w-4 text-[#435664]" />
                        ) : (
                          <Banknote className="h-4 w-4 text-[#435664]" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-[#435664]">
                        {sortBy === "date" ? "Tanggal" : "Harga"}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-[#435664] group-hover:rotate-180 transition-transform" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-2 w-full min-w-[160px] bg-white rounded-xl border-2 border-[#a3af87]/30 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                    <div className="p-2">
                      <button
                        onClick={() => setSortBy("date")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          sortBy === "date"
                            ? "bg-[#fdf8d4] text-[#435664]"
                            : "hover:bg-[#fdf8d4]/50 text-[#435664]"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${sortBy === "date" ? "bg-[#a3af87]/30" : "bg-[#fdf8d4]/50"}`}
                        >
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Tanggal</span>
                        {sortBy === "date" && (
                          <CheckCircle2 className="h-4 w-4 text-[#a3af87] ml-auto" />
                        )}
                      </button>
                      <button
                        onClick={() => setSortBy("price")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          sortBy === "price"
                            ? "bg-[#fdf8d4] text-[#435664]"
                            : "hover:bg-[#fdf8d4]/50 text-[#435664]"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${sortBy === "price" ? "bg-[#a3af87]/30" : "bg-[#fdf8d4]/50"}`}
                        >
                          <Banknote className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Harga</span>
                        {sortBy === "price" && (
                          <CheckCircle2 className="h-4 w-4 text-[#a3af87] ml-auto" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sort Order Button */}
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    sortOrder === "desc"
                      ? "bg-[#a3af87] border-[#a3af87] text-white shadow-md"
                      : "bg-[#fdf8d4]/50 border-[#a3af87]/40 text-[#435664] hover:border-[#a3af87] hover:shadow-md"
                  }`}
                  title={sortOrder === "desc" ? "Terbaru dulu" : "Terlama dulu"}
                >
                  {sortOrder === "asc" ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#a3af87]/30">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#435664]">
                      ID & Waktu
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#435664]">
                      Customer
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#435664]">
                      Produk
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#435664]">
                      Pengiriman
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#435664]">
                      Total
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#435664]">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#435664]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <TableRowSkeleton key={i} />
                      ))}
                    </>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Package className="h-12 w-12 text-[#a3af87]/30 mx-auto mb-3" />
                        <p className="text-[#435664]">
                          {searchQuery
                            ? "Tidak ada pesanan yang cocok"
                            : "Tidak ada pesanan"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order, index) => (
                      <OrderTableRow
                        key={order.id}
                        order={order}
                        index={index}
                        onCancelClick={handleOpenCancelModal}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedOrderForCancel(null);
        }}
        onSuccess={() => refresh()}
        orderId={selectedOrderForCancel?.orderId || ""}
        customerName={selectedOrderForCancel?.customer.name || ""}
        customerPhone={selectedOrderForCancel?.customer.phone}
      />
    </>
  );
}
