"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  PackageCheck,
  Search,
  Calendar,
  User,
  AlertCircle,
  Bike,
  Store,
  TrendingUp,
  TrendingDown,
  Ban,
  Activity,
  Eye,
  ArrowRight,
  Banknote,
  ShoppingBag,
  RefreshCw,
  ChevronDown,
  Download,
} from "lucide-react";
import { getFarmerOrders } from "@/lib/api/orders.actions";
import type { Order as DbOrder } from "@/lib/api/orders.actions";
import { CancelOrderModal } from "@/components/farmer/orders/CancelOrderModal";
import { exportOrdersToExcel, type OrderExportData } from "@/utils/exportExcel";

// ============================================
// TYPES
// ============================================
type OrderStatus =
  | "pending" | "paid" | "confirmed" | "processing"
  | "ready_pickup" | "shipped" | "delivered" | "completed" | "cancelled";

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
// CONFIGURATIONS
// ============================================
const shippingTypeConfig: Record<ShippingType, {
  label: string;
  shortLabel: string;
  icon: typeof Bike;
  bgColor: string;
  textColor: string;
}> = {
  "ecomaggie-delivery": {
    label: "Eco-Maggie Delivery",
    shortLabel: "Delivery",
    icon: Bike,
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  "self-pickup": {
    label: "Ambil di Toko",
    shortLabel: "Pickup",
    icon: Store,
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  expedition: {
    label: "Ekspedisi Reguler",
    shortLabel: "Ekspedisi",
    icon: Package,
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
};

const statusConfig: Record<OrderStatus, {
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
  icon: typeof Clock;
}> = {
  pending: { label: "Menunggu", color: "bg-amber-50 text-amber-700 border-amber-200", bgColor: "bg-amber-100", dotColor: "bg-amber-500", icon: Clock },
  paid: { label: "Dibayar", color: "bg-blue-50 text-blue-700 border-blue-200", bgColor: "bg-blue-100", dotColor: "bg-blue-500", icon: CheckCircle2 },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-50 text-blue-700 border-blue-200", bgColor: "bg-blue-100", dotColor: "bg-blue-500", icon: CheckCircle2 },
  processing: { label: "Dikemas", color: "bg-purple-50 text-purple-700 border-purple-200", bgColor: "bg-purple-100", dotColor: "bg-purple-500", icon: Package },
  ready_pickup: { label: "Siap Diambil", color: "bg-orange-50 text-orange-700 border-orange-200", bgColor: "bg-orange-100", dotColor: "bg-orange-500", icon: Store },
  shipped: { label: "Dikirim", color: "bg-[#A3AF87]/20 text-[#5a6c5b] border-[#A3AF87]", bgColor: "bg-[#A3AF87]/20", dotColor: "bg-[#A3AF87]", icon: Truck },
  delivered: { label: "Terkirim", color: "bg-teal-50 text-teal-700 border-teal-200", bgColor: "bg-teal-100", dotColor: "bg-teal-500", icon: PackageCheck },
  completed: { label: "Selesai", color: "bg-green-50 text-green-700 border-green-200", bgColor: "bg-green-100", dotColor: "bg-green-500", icon: CheckCircle2 },
  cancelled: { label: "Dibatalkan", color: "bg-red-50 text-red-700 border-red-200", bgColor: "bg-red-100", dotColor: "bg-red-500", icon: XCircle },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function detectShippingType(shippingMethod: string | null): ShippingType {
  if (!shippingMethod) return "expedition";
  const method = shippingMethod.toLowerCase();
  if (method.includes("ecomaggie") || method.includes("delivery") || method.includes("motor")) return "ecomaggie-delivery";
  if (method.includes("pickup") || method.includes("ambil")) return "self-pickup";
  return "expedition";
}

function transformDbOrderToOrder(dbOrder: DbOrder): Order {
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
    date: new Date(dbOrder.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    createdAt: dbOrder.created_at,
    customer: { name: dbOrder.customer_name, phone: dbOrder.customer_phone },
    shippingAddress: { city, province },
  };
}

// Check if order is new (within last hour)
function isNewOrder(createdAt: string): boolean {
  const now = new Date();
  const created = new Date(createdAt);
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  return diffHours <= 1;
}

// ============================================
// SKELETON COMPONENTS
// ============================================
function StatsTileSkeleton() {
  return (
    <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gray-200 rounded-xl w-12 h-12"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded-xl">
          <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-24 mb-1"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 bg-gray-100 rounded-xl">
              <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueTileSkeleton() {
  return (
    <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gray-200 rounded-xl w-12 h-12"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-gray-100 rounded-xl">
            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="py-4 px-4"><div className="h-5 bg-gray-200 rounded w-24 mb-1"></div><div className="h-3 bg-gray-200 rounded w-32"></div></td>
      <td className="py-4 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-200"></div><div><div className="h-5 bg-gray-200 rounded w-28 mb-1"></div><div className="h-3 bg-gray-200 rounded w-24"></div></div></div></td>
      <td className="py-4 px-4"><div className="h-5 bg-gray-200 rounded w-32 mb-1"></div><div className="h-4 bg-gray-200 rounded w-16"></div></td>
      <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="py-4 px-4"><div className="h-5 bg-gray-200 rounded w-20 mb-1"></div></td>
      <td className="py-4 px-4"><div className="h-7 bg-gray-200 rounded-full w-24"></div></td>
      <td className="py-4 px-4"><div className="flex gap-2"><div className="w-8 h-8 bg-gray-200 rounded-lg"></div><div className="w-8 h-8 bg-gray-200 rounded-lg"></div></div></td>
    </tr>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function FarmerOrdersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "price">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getFarmerOrders();
      if (result.success && result.data) {
        setOrders(result.data.map(transformDbOrderToOrder));
      } else {
        setError(result.message || "Gagal memuat pesanan");
      }
    } catch (err) {
      console.error("Error loading orders:", err);
      setError("Terjadi kesalahan saat memuat pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCancelModal = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrderForCancel(order);
    setCancelModalOpen(true);
  };

  const handleExportExcel = () => {
    const exportData: OrderExportData[] = filteredOrders.map((order) => ({
      orderId: order.orderId,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      totalItems: order.totalItems,
      totalPrice: order.totalPrice,
      netEarnings: order.netEarnings,
      shippingType: order.shippingType === "ecomaggie-delivery" ? "Eco-Maggie Delivery" : 
                    order.shippingType === "self-pickup" ? "Ambil di Toko" : "Ekspedisi Reguler",
      status: statusConfig[order.status].label,
      date: order.date,
      city: order.shippingAddress.city,
      province: order.shippingAddress.province,
    }));

    exportOrdersToExcel(exportData, "farmer-orders");
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = orders.length;
    const needsAction = orders.filter((o) => ["paid", "confirmed", "processing"].includes(o.status)).length;
    const processing = orders.filter((o) => ["processing", "ready_pickup"].includes(o.status)).length;
    const shipped = orders.filter((o) => o.status === "shipped").length;
    const completed = orders.filter((o) => ["delivered", "completed"].includes(o.status)).length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    
    const paidOrders = orders.filter((o) => 
      ["paid", "confirmed", "processing", "ready_pickup", "shipped", "delivered", "completed"].includes(o.status)
    );
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.netEarnings, 0);
    const totalSales = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    return { total, needsAction, processing, shipped, completed, cancelled, totalRevenue, totalSales, paidOrdersCount: paidOrders.length };
  }, [orders]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Apply filter
    if (filter === "needs_action") {
      filtered = filtered.filter((o) => ["paid", "confirmed", "processing"].includes(o.status));
    } else if (filter === "processing") {
      filtered = filtered.filter((o) => ["processing", "ready_pickup"].includes(o.status));
    } else if (filter === "shipped") {
      filtered = filtered.filter((o) => o.status === "shipped");
    } else if (filter === "completed") {
      filtered = filtered.filter((o) => ["delivered", "completed"].includes(o.status));
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
          order.products.some((p) => p.name.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        comparison = a.totalPrice - b.totalPrice;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [orders, filter, searchQuery, sortBy, sortOrder]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#303646] mb-2">Gagal Memuat Pesanan</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={loadOrders} className="px-6 py-3 bg-[#A3AF87] text-white rounded-xl font-bold hover:bg-[#8a9a6e] transition-colors">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-[#303646]">Pesanan Saya</h1>
                <p className="text-gray-600 mt-1">Monitor dan kelola pesanan dari customer</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportExcel}
                  disabled={isLoading || filteredOrders.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-[#A3AF87] text-white rounded-xl hover:bg-[#8a9a6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export ke Excel"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">Export Excel</span>
                </button>
                <button
                  onClick={loadOrders}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-[#A3AF87] transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 text-gray-600 ${isLoading ? "animate-spin" : ""}`} />
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">Refresh</span>
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#A3AF87]/10 rounded-xl">
                  <Activity className="h-5 w-5 text-[#A3AF87] animate-pulse" />
                  <span className="text-sm font-medium text-[#5a6c5b]">Live</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            {/* Tile 1: Live Order Stats */}
            {isLoading ? <StatsTileSkeleton /> : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="col-span-12 lg:col-span-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#A3AF87]/30 transition-colors p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#A3AF87] rounded-xl">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#303646]">Live Order Stats</h3>
                    <p className="text-xs text-gray-500">Update realtime</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Total Orders */}
                  <div className="p-4 bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Total Pesanan Aktif</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-[#303646]">{stats.total}</p>
                      <p className="text-lg text-gray-600">pesanan</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stats.paidOrdersCount} sudah dibayar</p>
                  </div>

                  {/* Status Breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <p className="text-xs text-amber-700 font-medium mb-1">Perlu Tindakan</p>
                      <p className="text-2xl font-bold text-amber-600">{stats.needsAction}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <p className="text-xs text-purple-700 font-medium mb-1">Diproses</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
                    </div>
                    <div className="p-3 bg-[#A3AF87]/10 rounded-xl">
                      <p className="text-xs text-[#5a6c5b] font-medium mb-1">Dikirim</p>
                      <p className="text-2xl font-bold text-[#5a6c5b]">{stats.shipped}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl">
                      <p className="text-xs text-green-700 font-medium mb-1">Selesai</p>
                      <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tile 2: Revenue Summary */}
            {isLoading ? <RevenueTileSkeleton /> : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="col-span-12 lg:col-span-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#A3AF87]/30 transition-colors p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#A3AF87] to-[#8a9a6e] rounded-xl">
                      <Banknote className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#303646]">Ringkasan Pendapatan</h3>
                      <p className="text-xs text-gray-500">Dari pesanan yang sudah dibayar</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">+{stats.paidOrdersCount} order</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-[#A3AF87]/10 to-[#FDF8D4]/30 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Pendapatan Bersih</p>
                    <p className="text-xl font-bold text-[#303646]">Rp {stats.totalRevenue.toLocaleString("id-ID")}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Setelah potongan 5%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Total Penjualan</p>
                    <p className="text-xl font-bold text-[#303646]">Rp {stats.totalSales.toLocaleString("id-ID")}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Termasuk ongkir</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <p className="text-xs text-amber-700 mb-1">Menunggu Proses</p>
                    <p className="text-xl font-bold text-amber-600">{stats.needsAction}</p>
                    <p className="text-[10px] text-amber-600/70 mt-1">Butuh tindakan</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl">
                    <p className="text-xs text-red-700 mb-1">Dibatalkan</p>
                    <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
                    <p className="text-[10px] text-red-600/70 mt-1">Total cancel</p>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs text-blue-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Pendapatan bersih dihitung dari subtotal produk setelah potongan platform 5%. Ongkir tidak termasuk karena diteruskan ke kurir.</span>
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Real-time Orders Table */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border-2 border-gray-100 hover:border-[#A3AF87]/30 transition-colors p-6 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-[#A3AF87] rounded-xl">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#303646]">Real-time Incoming Orders</h3>
                  <p className="text-xs text-gray-500">Data pesanan terbaru dari customer</p>
                </div>
              </div>

              {/* Filter Tabs with Badge Counts */}
              <div className="flex items-center gap-2 sm:gap-3 bg-gray-100 rounded-xl p-1.5 overflow-x-auto w-full sm:w-auto">
                {[
                  { value: "all", label: "Semua", count: stats.total },
                  { value: "needs_action", label: "Tindakan", count: stats.needsAction },
                  { value: "processing", label: "Diproses", count: stats.processing },
                  { value: "shipped", label: "Dikirim", count: stats.shipped },
                  { value: "completed", label: "Selesai", count: stats.completed },
                  { value: "cancelled", label: "Batal", count: stats.cancelled },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`relative px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      filter === tab.value ? "bg-white text-[#303646] shadow-md" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[11px] font-bold rounded-full ${
                          tab.value === "needs_action" || tab.value === "cancelled" 
                            ? "bg-red-500 text-white shadow-sm shadow-red-200" 
                            : tab.value === "shipped" || tab.value === "completed"
                            ? "bg-[#A3AF87] text-white shadow-sm shadow-[#A3AF87]/30"
                            : "bg-gray-500 text-white"
                        }`}>
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari order ID, nama customer, atau produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-[#303646] placeholder:text-gray-400 focus:outline-none focus:border-[#A3AF87] focus:bg-white transition-all"
                />
              </div>
              <div className="flex gap-2">
                {/* Custom Sort Dropdown with Green Color Palette */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#A3AF87]/15 to-[#A3AF87]/5 border-2 border-[#A3AF87]/40 rounded-xl hover:border-[#A3AF87] hover:shadow-md hover:shadow-[#A3AF87]/10 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#A3AF87]/20 rounded-lg flex items-center justify-center">
                        {sortBy === "date" ? (
                          <Calendar className="h-4 w-4 text-[#5a6c5b]" />
                        ) : (
                          <Banknote className="h-4 w-4 text-[#5a6c5b]" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-[#5a6c5b]">
                        {sortBy === "date" ? "Tanggal" : "Harga"}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-[#5a6c5b] group-hover:rotate-180 transition-transform" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-2 w-full min-w-[160px] bg-white rounded-xl border-2 border-[#A3AF87]/30 shadow-lg shadow-[#A3AF87]/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                    <div className="p-2">
                      <button
                        onClick={() => setSortBy("date")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          sortBy === "date" ? "bg-[#A3AF87]/15 text-[#5a6c5b]" : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${sortBy === "date" ? "bg-[#A3AF87]/30" : "bg-gray-100"}`}>
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Tanggal</span>
                        {sortBy === "date" && <CheckCircle2 className="h-4 w-4 text-[#A3AF87] ml-auto" />}
                      </button>
                      <button
                        onClick={() => setSortBy("price")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          sortBy === "price" ? "bg-[#A3AF87]/15 text-[#5a6c5b]" : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${sortBy === "price" ? "bg-[#A3AF87]/30" : "bg-gray-100"}`}>
                          <Banknote className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Harga</span>
                        {sortBy === "price" && <CheckCircle2 className="h-4 w-4 text-[#A3AF87] ml-auto" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Sort Order Button */}
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    sortOrder === "desc" 
                      ? "bg-[#A3AF87] border-[#A3AF87] text-white shadow-md shadow-[#A3AF87]/30" 
                      : "bg-white border-[#A3AF87]/40 text-[#5a6c5b] hover:border-[#A3AF87] hover:shadow-md"
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
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">ID & Waktu</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Customer</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Produk</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Pengiriman</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Total</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <>{[1, 2, 3, 4, 5].map((i) => <TableRowSkeleton key={i} />)}</>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">{searchQuery ? "Tidak ada pesanan yang cocok" : "Tidak ada pesanan"}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order, index) => {
                      const config = statusConfig[order.status];
                      const shippingConfig = shippingTypeConfig[order.shippingType];
                      const ShippingIcon = shippingConfig.icon;
                      const isNew = isNewOrder(order.createdAt);

                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer"
                          onClick={() => router.push(`/farmer/orders/${order.orderId}`)}
                        >
                          {/* ID & Time */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-semibold text-[#303646]">{order.orderId}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              {isNew && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                                  NEW
                                </motion.span>
                              )}
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A3AF87] to-[#5a6c5b] flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-[#303646]">{order.customer.name}</p>
                                <p className="text-xs text-gray-500">{order.customer.phone}</p>
                              </div>
                            </div>
                          </td>

                          {/* Products */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {order.products.slice(0, 2).map((product, idx) => (
                                  <div key={idx} className="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 overflow-hidden">
                                    {product.image ? (
                                      <Image src={product.image} alt={product.name} width={32} height={32} className="object-cover w-full h-full" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-gray-400" /></div>
                                    )}
                                  </div>
                                ))}
                                {order.products.length > 2 && (
                                  <div className="w-8 h-8 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-gray-600">+{order.products.length - 2}</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-[#303646]">{order.totalItems} item</p>
                                <p className="text-xs text-gray-500 truncate max-w-[120px]">{order.products[0]?.name}</p>
                              </div>
                            </div>
                          </td>

                          {/* Shipping */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${shippingConfig.bgColor} ${shippingConfig.textColor}`}>
                                <ShippingIcon className="h-3.5 w-3.5" />
                                {shippingConfig.shortLabel}
                              </span>
                            </div>
                            {order.trackingNumber && (
                              <p className="text-[10px] text-gray-500 mt-1 font-mono">{order.trackingNumber}</p>
                            )}
                          </td>

                          {/* Total */}
                          <td className="py-4 px-4">
                            <p className="font-bold text-[#303646]">Rp {order.totalPrice.toLocaleString("id-ID")}</p>
                            <p className="text-xs text-[#A3AF87]">+Rp {order.netEarnings.toLocaleString("id-ID")}</p>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color}`}>
                              <div className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}></div>
                              <span className="text-xs font-semibold">{config.label}</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/farmer/orders/${order.orderId}`); }}
                                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <Eye className="h-4 w-4 text-gray-600" />
                              </button>
                              {["paid", "confirmed", "processing"].includes(order.status) && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); router.push(`/farmer/orders/${order.orderId}`); }}
                                  className="p-2 bg-[#A3AF87] rounded-lg hover:bg-[#95a17a] transition-colors"
                                >
                                  <ArrowRight className="h-4 w-4 text-white" />
                                </button>
                              )}
                              {["paid", "confirmed", "processing", "ready_pickup"].includes(order.status) && (
                                <button
                                  onClick={(e) => handleOpenCancelModal(order, e)}
                                  className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                  <Ban className="h-4 w-4 text-red-600" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
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
        onClose={() => { setCancelModalOpen(false); setSelectedOrderForCancel(null); }}
        onSuccess={loadOrders}
        orderId={selectedOrderForCancel?.orderId || ""}
        customerName={selectedOrderForCancel?.customer.name || ""}
        customerPhone={selectedOrderForCancel?.customer.phone}
      />
    </>
  );
}
