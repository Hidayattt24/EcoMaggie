"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  PackageCheck,
  Search,
  ChevronRight,
  Calendar,
  User,
  MapPin,
  ArrowUpDown,
  LayoutGrid,
  List,
  AlertCircle,
  Bike,
  Store,
  Box,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  Sparkles,
  Bell,
  Loader2,
} from "lucide-react";
import { getFarmerOrders } from "@/lib/api/orders.actions";
import type { Order as DbOrder } from "@/lib/api/orders.actions";

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
  customer: {
    name: string;
    phone: string;
  };
  shippingAddress: {
    city: string;
    province: string;
  };
}

// ============================================
// SHIPPING TYPE CONFIGURATION
// ============================================
const shippingTypeConfig: Record<
  ShippingType,
  {
    label: string;
    shortLabel: string;
    icon: typeof Bike;
    bgColor: string;
    textColor: string;
    description: string;
  }
> = {
  "ecomaggie-delivery": {
    label: "Eco-Maggie Delivery",
    shortLabel: "Delivery",
    icon: Bike,
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    description: "Antar ke alamat (Banda Aceh)",
  },
  "self-pickup": {
    label: "Ambil di Toko",
    shortLabel: "Pickup",
    icon: Store,
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    description: "Customer ambil sendiri",
  },
  expedition: {
    label: "Ekspedisi Reguler",
    shortLabel: "Ekspedisi",
    icon: Package,
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    description: "JNE / J&T / SiCepat",
  },
};

// ============================================
// STATUS CONFIGURATION
// ============================================
const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    iconBg: string;
    iconColor: string;
    icon: typeof Clock;
  }
> = {
  pending: {
    label: "Menunggu",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    icon: Clock,
  },
  paid: {
    label: "Dibayar",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: CheckCircle2,
  },
  confirmed: {
    label: "Dikonfirmasi",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: CheckCircle2,
  },
  processing: {
    label: "Dikemas",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    icon: Package,
  },
  ready_pickup: {
    label: "Siap Diambil",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    icon: Store,
  },
  shipped: {
    label: "Dikirim",
    color: "text-[#5a6c5b]",
    bgColor: "bg-[#A3AF87]/20",
    iconBg: "bg-[#A3AF87]/20",
    iconColor: "text-[#5a6c5b]",
    icon: Truck,
  },
  delivered: {
    label: "Terkirim",
    color: "text-teal-700",
    bgColor: "bg-teal-100",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    icon: PackageCheck,
  },
  completed: {
    label: "Selesai",
    color: "text-green-700",
    bgColor: "bg-green-100",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "text-red-700",
    bgColor: "bg-red-100",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    icon: XCircle,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function detectShippingType(shippingMethod: string | null, shippingCourier: string | null): ShippingType {
  if (!shippingMethod) return "expedition";

  const method = shippingMethod.toLowerCase();

  if (method.includes("ecomaggie") || method.includes("delivery") || method.includes("motor")) {
    return "ecomaggie-delivery";
  }

  if (method.includes("pickup") || method.includes("ambil")) {
    return "self-pickup";
  }

  return "expedition";
}

function transformDbOrderToOrder(dbOrder: DbOrder): Order {
  const shippingType = detectShippingType(dbOrder.shipping_method, dbOrder.shipping_courier);

  // Extract city and province from customer_address
  const addressParts = dbOrder.customer_address.split(",");
  const city = addressParts[addressParts.length - 2]?.trim() || "Unknown";
  const province = addressParts[addressParts.length - 1]?.trim() || "Unknown";

  // Calculate net earnings from SUBTOTAL (product price only), not total_amount
  // total_amount includes shipping + service fee which is not farmer's revenue
  const subtotal = dbOrder.subtotal || dbOrder.total_amount; // fallback if subtotal not available
  const platformFee = subtotal * 0.05; // 5% platform fee (same as checkout service fee)
  const netEarnings = subtotal - platformFee;

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
    netEarnings: Math.round(netEarnings),
    shippingType,
    expeditionName: dbOrder.shipping_courier?.toUpperCase(),
    trackingNumber: dbOrder.shipping_tracking_number || undefined,
    date: new Date(dbOrder.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    createdAt: dbOrder.created_at,
    customer: {
      name: dbOrder.customer_name,
      phone: dbOrder.customer_phone,
    },
    shippingAddress: {
      city,
      province,
    },
  };
}

// ============================================
// SKELETON COMPONENTS
// ============================================
function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Product Images */}
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-12 h-12 rounded-lg bg-gray-200"></div>
            ))}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="h-6 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TAB CONFIGURATION
// ============================================
type TabFilter = "all" | "latest" | "needs_action" | "processing" | "shipped" | "completed";

const tabConfig: Record<
  TabFilter,
  {
    label: string;
    icon: typeof Box;
    description: string;
    filter: (order: Order) => boolean;
  }
> = {
  all: {
    label: "Semua",
    icon: Box,
    description: "Semua pesanan",
    filter: () => true,
  },
  latest: {
    label: "Terbaru",
    icon: Sparkles,
    description: "24 jam terakhir",
    filter: (order) => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(order.createdAt) > dayAgo;
    },
  },
  needs_action: {
    label: "Perlu Tindakan",
    icon: Bell,
    description: "Butuh respons",
    filter: (order) => ["paid", "confirmed", "processing"].includes(order.status),
  },
  processing: {
    label: "Diproses",
    icon: Package,
    description: "Sedang dikemas",
    filter: (order) => ["processing", "ready_pickup"].includes(order.status),
  },
  shipped: {
    label: "Dikirim",
    icon: Truck,
    description: "Dalam pengiriman",
    filter: (order) => order.status === "shipped",
  },
  completed: {
    label: "Selesai",
    icon: CheckCircle2,
    description: "Transaksi selesai",
    filter: (order) => ["delivered", "completed"].includes(order.status),
  },
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function FarmerOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"date" | "price">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from database
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getFarmerOrders();

      if (result.success && result.data) {
        const transformedOrders = result.data.map(transformDbOrderToOrder);
        setOrders(transformedOrders);
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

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Apply tab filter
    filtered = filtered.filter(tabConfig[activeTab].filter);

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
  }, [orders, activeTab, searchQuery, sortBy, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = orders.length;
    const needsAction = orders.filter((o) => ["paid", "confirmed", "processing"].includes(o.status)).length;
    const processing = orders.filter((o) => ["processing", "ready_pickup"].includes(o.status)).length;
    const shipped = orders.filter((o) => o.status === "shipped").length;
    
    // Total revenue ONLY from paid transactions (consistent with dashboard)
    // Exclude: pending, cancelled orders
    const paidOrders = orders.filter((o) => 
      ["paid", "confirmed", "processing", "ready_pickup", "shipped", "delivered", "completed"].includes(o.status)
    );
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.netEarnings, 0);
    const paidOrdersCount = paidOrders.length;

    return { total, needsAction, processing, shipped, totalRevenue, paidOrdersCount };
  }, [orders]);

  // Render content (with loading state)
  const renderContent = () => {
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#303646] mb-2">Gagal Memuat Pesanan</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={loadOrders}
              className="px-6 py-3 bg-[#A3AF87] text-white rounded-xl font-bold hover:bg-[#8a9a6e] transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-8 pt-4 px-4 md:px-6 lg:px-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#303646] poppins-bold">Pesanan Saya</h1>
              <p className="text-gray-500 text-sm mt-1">Kelola semua pesanan dari customer</p>
            </div>
            <button
              onClick={loadOrders}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              title="Refresh"
            >
              <ArrowUpDown className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {isLoading ? (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            ) : (
              <>
                <div className="bg-white rounded-xl border-2 border-gray-100 hover:border-[#A3AF87]/30 transition-colors p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Box className="h-4 w-4 text-gray-500" />
                    <p className="text-xs text-gray-600 font-medium">Total Pesanan</p>
                  </div>
                  <p className="text-2xl font-bold text-[#303646]">{stats.total}</p>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-100 hover:border-orange-200 transition-colors p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-4 w-4 text-orange-500" />
                    <p className="text-xs text-gray-600 font-medium">Perlu Tindakan</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{stats.needsAction}</p>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-colors p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-purple-500" />
                    <p className="text-xs text-gray-600 font-medium">Diproses</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-100 hover:border-[#A3AF87]/30 transition-colors p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-[#A3AF87]" />
                    <p className="text-xs text-gray-600 font-medium">Dikirim</p>
                  </div>
                  <p className="text-2xl font-bold text-[#5a6c5b]">{stats.shipped}</p>
                </div>
              </>
            )}
          </div>

          {/* Revenue Card */}
          {isLoading ? (
            <div className="bg-gray-200 rounded-2xl h-32 animate-pulse"></div>
          ) : (
            <div className="bg-gradient-to-br from-[#A3AF87] to-[#8a9a6e] rounded-2xl p-4 sm:p-6 text-white mb-6 shadow-lg">
              <div className="flex items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-white/80 text-xs sm:text-sm font-medium">Total Pendapatan Bersih</p>
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-semibold">
                      {stats.paidOrdersCount} pesanan
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold break-all">Rp {stats.totalRevenue.toLocaleString("id-ID")}</p>
                  <div className="mt-2 space-y-1 hidden sm:block">
                    <p className="text-white/70 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white/60 rounded-full"></span>
                      Dihitung dari pesanan yang sudah dibayar
                    </p>
                    <p className="text-white/70 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white/60 rounded-full"></span>
                      Setelah potongan platform 5% (biaya layanan)
                    </p>
                    <p className="text-white/70 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white/60 rounded-full"></span>
                      Tidak termasuk ongkir (diteruskan ke kurir)
                    </p>
                  </div>
                  {/* Mobile: Compact info */}
                  <p className="text-white/70 text-[10px] mt-1 sm:hidden">
                    Setelah potongan 5% • Tidak termasuk ongkir
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs - Scrollable on Mobile */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-2 mb-4 shadow-sm overflow-hidden">
          <div className="flex sm:justify-center items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(Object.keys(tabConfig) as TabFilter[]).map((tab) => {
              const config = tabConfig[tab];
              const Icon = config.icon;
              const count = isLoading ? 0 : orders.filter(config.filter).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab
                      ? "bg-[#A3AF87] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">{config.label}</span>
                  <span className="xs:hidden">{config.label.split(" ")[0]}</span>
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                      activeTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari order ID, nama customer, atau produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-[#303646] placeholder:text-gray-400 focus:outline-none focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 transition-all"
            />
          </div>

          <div className="flex gap-2">
            {/* Modern Dropdown - Sort By */}
            <div className="relative min-w-[180px]">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3AF87] pointer-events-none z-10" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "price")}
                className="w-full pl-10 pr-10 py-3 border-2 border-[#A3AF87]/40 rounded-xl bg-white focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all text-sm appearance-none cursor-pointer text-[#303646] font-semibold hover:border-[#A3AF87] hover:shadow-md shadow-sm"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23A3AF87' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                }}
              >
                <option value="date" className="bg-white text-[#303646] py-3">
                  📅 Tanggal
                </option>
                <option value="price" className="bg-white text-[#303646] py-3">
                  💰 Harga
                </option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-4 py-3 bg-white border-2 border-[#A3AF87]/40 rounded-xl hover:border-[#A3AF87] hover:shadow-md transition-all shadow-sm"
              title={sortOrder === "asc" ? "Urutan Naik" : "Urutan Turun"}
            >
              {sortOrder === "asc" ? (
                <TrendingUp className="h-5 w-5 text-[#A3AF87]" />
              ) : (
                <TrendingDown className="h-5 w-5 text-[#A3AF87]" />
              )}
            </button>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#303646] mb-2">Tidak Ada Pesanan</h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Tidak ada pesanan yang cocok dengan pencarian"
                : "Belum ada pesanan di kategori ini"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status];
                const StatusIcon = config.icon;
                const ShippingIcon = shippingTypeConfig[order.shippingType].icon;

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#A3AF87]/30 transition-all cursor-pointer active:scale-[0.99]"
                    onClick={() => router.push(`/farmer/orders/${order.orderId}`)}
                  >
                    {/* Header */}
                    <div className="p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm sm:text-base text-[#303646]">{order.orderId}</p>
                          <span
                            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${config.bgColor} ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          {order.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShippingIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          {shippingTypeConfig[order.shippingType].shortLabel}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-3 sm:p-4">
                      {/* Mobile Layout */}
                      <div className="sm:hidden">
                        <div className="flex items-start gap-3">
                          {/* Product Images - Smaller on mobile */}
                          <div className="flex -space-x-1.5 flex-shrink-0">
                            {order.products.slice(0, 2).map((product, idx) => (
                              <div
                                key={idx}
                                className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
                              >
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-4 w-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.products.length > 2 && (
                              <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center shadow-sm">
                                <span className="text-[10px] font-bold text-gray-600">+{order.products.length - 2}</span>
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-sm text-[#303646]">
                                  {order.totalItems} item
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {order.products.map((p) => p.name).join(", ")}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-[#303646]">
                                  Rp {order.totalPrice.toLocaleString("id-ID")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-[100px]">{order.customer.name}</span>
                              </div>
                              <p className="text-[10px] text-[#A3AF87] font-medium">
                                +Rp {order.netEarnings.toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-start gap-4">
                        {/* Product Images */}
                        <div className="flex -space-x-2">
                          {order.products.slice(0, 3).map((product, idx) => (
                            <div
                              key={idx}
                              className="w-12 h-12 rounded-lg border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
                            >
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                          ))}
                          {order.products.length > 3 && (
                            <div className="w-12 h-12 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center shadow-sm">
                              <span className="text-xs font-bold text-gray-600">+{order.products.length - 3}</span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#303646] mb-1">
                            {order.totalItems} item{order.totalItems > 1 ? "s" : ""}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {order.products.map((p) => p.name).join(", ")}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <User className="h-3.5 w-3.5" />
                            <span className="truncate">{order.customer.name}</span>
                            <span>•</span>
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{order.shippingAddress.city}</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-[#303646]">
                            Rp {order.totalPrice.toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Earning: Rp {order.netEarnings.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>

                      {/* Tracking Number (if available) */}
                      {order.trackingNumber && (
                        <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                            <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#A3AF87]" />
                            <span className="text-gray-500">Resi:</span>
                            <span className="font-mono font-semibold text-[#303646] truncate">{order.trackingNumber}</span>
                            {order.expeditionName && (
                              <span className="px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] sm:text-xs font-semibold flex-shrink-0">
                                {order.expeditionName}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Button for orders needing action */}
                      {["paid", "confirmed", "processing"].includes(order.status) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/farmer/orders/action/${order.orderId}`);
                          }}
                          className="mt-3 w-full py-2.5 bg-[#A3AF87] text-white rounded-xl font-semibold hover:bg-[#8a9a6e] hover:shadow-md transition-all text-sm"
                        >
                          {order.status === "processing" ? "Input Resi & Kirim" : "Proses Pesanan"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    );
  };

  return renderContent();
}
