"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";

// ============================================
// TYPES
// ============================================
type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready_pickup"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

type ShippingType = "ecomaggie-delivery" | "self-pickup" | "expedition";

interface OrderProduct {
  id: number;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
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
// MOCK DATA
// ============================================
const mockOrders: Order[] = [
  {
    id: "1",
    orderId: "ORD-2026-01-001",
    status: "confirmed",
    products: [
      {
        id: 1,
        name: "Maggot BSF Premium",
        variant: "500gr",
        quantity: 2,
        price: 76500,
        image: "/assets/dummy/magot.png",
      },
      {
        id: 2,
        name: "Maggot BSF Organik",
        variant: "1kg",
        quantity: 1,
        price: 38000,
        image: "/assets/dummy/magot.png",
      },
    ],
    totalItems: 3,
    totalPrice: 196000,
    netEarnings: 176450,
    shippingType: "ecomaggie-delivery",
    date: "2 Jan 2026",
    createdAt: "2026-01-02T10:30:00",
    customer: { name: "Budi Santoso", phone: "081234567890" },
    shippingAddress: { city: "Banda Aceh", province: "Aceh" },
  },
  {
    id: "2",
    orderId: "ORD-2026-01-002",
    status: "processing",
    products: [
      {
        id: 2,
        name: "Maggot BSF Organik",
        variant: "1kg",
        quantity: 3,
        price: 38000,
        image: "/assets/dummy/magot.png",
      },
      {
        id: 3,
        name: "Pupuk Organik Maggot",
        variant: "5kg",
        quantity: 2,
        price: 85000,
        image: "/assets/dummy/magot.png",
      },
    ],
    totalItems: 5,
    totalPrice: 319000,
    netEarnings: 269800,
    shippingType: "expedition",
    expeditionName: "JNE Regular",
    date: "2 Jan 2026",
    createdAt: "2026-01-02T08:15:00",
    customer: { name: "Ahmad Wijaya", phone: "082345678901" },
    shippingAddress: { city: "Medan", province: "Sumatera Utara" },
  },
  {
    id: "3",
    orderId: "ORD-2026-01-003",
    status: "ready_pickup",
    products: [
      {
        id: 1,
        name: "Maggot BSF Premium",
        variant: "500gr",
        quantity: 5,
        price: 76500,
        image: "/assets/dummy/magot.png",
      },
    ],
    totalItems: 5,
    totalPrice: 382500,
    netEarnings: 363375,
    shippingType: "self-pickup",
    date: "1 Jan 2026",
    createdAt: "2026-01-01T14:00:00",
    customer: { name: "Siti Nurhaliza", phone: "083456789012" },
    shippingAddress: { city: "Banda Aceh", province: "Aceh" },
  },
];

// ============================================
// TAB CONFIGURATION
// ============================================
type TabFilter =
  | "all"
  | "latest"
  | "needs_action"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

type ShippingFilter =
  | "all"
  | "ecomaggie-delivery"
  | "self-pickup"
  | "expedition";

const tabs: { id: TabFilter; label: string; statuses: OrderStatus[] }[] = [
  { id: "all", label: "Semua", statuses: [] },
  { id: "latest", label: "Terbaru", statuses: [] },
  {
    id: "needs_action",
    label: "Perlu Tindakan",
    statuses: ["pending", "confirmed", "ready_pickup"],
  },
  { id: "processing", label: "Dikemas", statuses: ["processing"] },
  { id: "shipped", label: "Dikirim", statuses: ["shipped", "delivered"] },
  { id: "completed", label: "Selesai", statuses: ["completed"] },
  { id: "cancelled", label: "Dibatalkan", statuses: ["cancelled"] },
];

const shippingFilters: { id: ShippingFilter; label: string }[] = [
  { id: "all", label: "Semua Pengiriman" },
  { id: "ecomaggie-delivery", label: "Delivery" },
  { id: "self-pickup", label: "Ambil di Toko" },
  { id: "expedition", label: "Ekspedisi" },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function FarmerOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [shippingFilter, setShippingFilter] = useState<ShippingFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = [...mockOrders];

    // Filter by tab
    if (activeTab === "latest") {
      // Show only newest 5 orders for 'Terbaru' tab
      result = result.slice(0, 5);
    } else if (activeTab !== "all") {
      const tab = tabs.find((t) => t.id === activeTab);
      if (tab) {
        result = result.filter((order) => tab.statuses.includes(order.status));
      }
    }

    // Filter by shipping type
    if (shippingFilter !== "all") {
      result = result.filter((order) => order.shippingType === shippingFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderId.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.products.some((p) => p.name.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "highest":
          return b.totalPrice - a.totalPrice;
        case "lowest":
          return a.totalPrice - b.totalPrice;
        default:
          return 0;
      }
    });

    return result;
  }, [activeTab, shippingFilter, searchQuery, sortBy]);

  // Count orders per tab
  const tabCounts = useMemo(() => {
    const counts: Record<TabFilter, number> = {
      all: mockOrders.length,
      latest: Math.min(5, mockOrders.length),
      needs_action: 0,
      processing: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
    };

    mockOrders.forEach((order) => {
      if (["pending", "confirmed", "ready_pickup"].includes(order.status))
        counts.needs_action++;
      if (order.status === "processing") counts.processing++;
      if (["shipped", "delivered"].includes(order.status)) counts.shipped++;
      if (order.status === "completed") counts.completed++;
      if (order.status === "cancelled") counts.cancelled++;
    });

    return counts;
  }, []);

  // Count orders per shipping type
  const shippingCounts = useMemo(() => {
    const counts: Record<ShippingFilter, number> = {
      all: mockOrders.length,
      "ecomaggie-delivery": 0,
      "self-pickup": 0,
      expedition: 0,
    };

    mockOrders.forEach((order) => {
      counts[order.shippingType]++;
    });

    return counts;
  }, []);

  const handleOrderClick = (orderId: string) => {
    router.push(`/farmer/orders/${orderId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-8 pt-4 px-4 md:px-6 lg:px-0"
    >
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#303646] poppins-bold">
          Manajemen Pesanan
        </h1>
        <p className="text-gray-500 text-xs md:text-sm mt-1">
          Kelola pesanan masuk dari customer
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-2.5 bg-amber-100 rounded-lg md:rounded-xl">
              <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-[#303646]">
                {tabCounts.needs_action}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">
                Perlu Tindakan
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-2.5 bg-purple-100 rounded-lg md:rounded-xl">
              <Package className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-[#303646]">
                {tabCounts.processing}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">
                Sedang Dikemas
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-2.5 bg-[#A3AF87]/20 rounded-lg md:rounded-xl">
              <Truck className="h-4 w-4 md:h-5 md:w-5 text-[#5a6c5b]" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-[#303646]">
                {tabCounts.shipped}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">
                Dalam Pengiriman
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-2.5 bg-green-100 rounded-lg md:rounded-xl">
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-[#303646]">
                {tabCounts.completed}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">Selesai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-6">
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? "text-[#A3AF87]"
                  : "text-gray-500 hover:text-[#303646]"
              }`}
            >
              {tab.label}
              {tabCounts[tab.id] > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? "bg-[#A3AF87] text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tabCounts[tab.id]}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A3AF87]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="p-4 flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID pesanan, nama customer, atau produk..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A3AF87] focus:bg-white transition-colors"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white z-10 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none pl-10 pr-10 py-3 bg-gradient-to-r from-[#A3AF87] to-[#8a9a6e] text-white border-0 rounded-xl text-sm font-semibold shadow-md shadow-[#A3AF87]/20 focus:outline-none focus:ring-2 focus:ring-[#A3AF87] focus:ring-offset-2 cursor-pointer hover:shadow-lg hover:shadow-[#A3AF87]/30 transition-all"
              >
                <option value="newest" className="bg-white text-[#303646] py-2">
                  Terbaru
                </option>
                <option value="oldest" className="bg-white text-[#303646] py-2">
                  Terlama
                </option>
                <option
                  value="highest"
                  className="bg-white text-[#303646] py-2"
                >
                  Harga Tertinggi
                </option>
                <option value="lowest" className="bg-white text-[#303646] py-2">
                  Harga Terendah
                </option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 h-4 w-4 text-white pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="hidden lg:flex items-center bg-gradient-to-br from-[#FDF8D4] to-[#f5eec4] border-2 border-[#A3AF87]/20 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-gradient-to-br from-[#A3AF87] to-[#8a9a6e] shadow-md shadow-[#A3AF87]/30 text-white scale-105"
                    : "text-[#303646] hover:bg-white/60"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-br from-[#A3AF87] to-[#8a9a6e] shadow-md shadow-[#A3AF87]/30 text-white scale-105"
                    : "text-[#303646] hover:bg-white/60"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Type Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto">
        {shippingFilters
          .filter((f) => f.id !== "all")
          .map((filter) => {
            const config =
              shippingTypeConfig[filter.id as keyof typeof shippingTypeConfig];
            const isActive = shippingFilter === filter.id;
            const Icon = config?.icon || Package;

            return (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShippingFilter(isActive ? "all" : filter.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? "border-[#A3AF87] bg-[#A3AF87]/5"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      config?.bgColor || "bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        config?.textColor || "text-gray-600"
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <p
                      className={`text-sm font-semibold ${
                        isActive ? "text-[#A3AF87]" : "text-[#303646]"
                      }`}
                    >
                      {filter.label}
                    </p>
                    <p className="text-xs text-gray-400">
                      {shippingCounts[filter.id]} pesanan
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
      </div>

      {/* Active Filter Indicator */}
      {shippingFilter !== "all" && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter aktif:</span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${shippingTypeConfig[shippingFilter]?.bgColor} ${shippingTypeConfig[shippingFilter]?.textColor}`}
          >
            {(() => {
              const Icon = shippingTypeConfig[shippingFilter]?.icon || Package;
              return <Icon className="h-3 w-3" />;
            })()}
            {shippingTypeConfig[shippingFilter]?.label}
          </span>
          <button
            onClick={() => setShippingFilter("all")}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Hapus filter
          </button>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-[#303646] mb-2">
            Tidak Ada Pesanan
          </h3>
          <p className="text-gray-500 text-sm">
            {searchQuery || shippingFilter !== "all"
              ? "Tidak ditemukan pesanan yang sesuai dengan filter."
              : "Belum ada pesanan pada kategori ini."}
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, idx) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              const shippingConfig = shippingTypeConfig[order.shippingType];
              const ShippingIcon = shippingConfig?.icon || Package;

              return (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#A3AF87]/50 hover:shadow-lg hover:shadow-[#A3AF87]/5 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-[#303646]">
                              {order.orderId}
                            </h3>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bgColor} ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {order.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              {order.customer.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Products Preview */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex -space-x-2">
                          {order.products.slice(0, 3).map((product, pIdx) => (
                            <div
                              key={product.id}
                              className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white overflow-hidden"
                            >
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {order.products.length > 3 && (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-500">
                              +{order.products.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.products.length > 1
                            ? `${order.products[0].name} +${
                                order.products.length - 1
                              } lainnya`
                            : order.products[0].name}
                        </div>
                      </div>

                      {/* Bottom Info */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {order.shippingAddress.city}
                        </span>
                        <span
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${shippingConfig?.bgColor} ${shippingConfig?.textColor}`}
                        >
                          <ShippingIcon className="h-3 w-3" />
                          {shippingConfig?.shortLabel}
                          {order.expeditionName && ` - ${order.expeditionName}`}
                        </span>
                        {order.trackingNumber && (
                          <span className="text-xs text-gray-400 font-mono">
                            #{order.trackingNumber}
                          </span>
                        )}
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">
                          {order.totalItems} item
                        </span>
                      </div>
                    </div>

                    {/* Price Info & Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-0.5">Total</p>
                        <p className="font-bold text-[#303646]">
                          Rp {order.totalPrice.toLocaleString("id-ID")}
                        </p>
                        {order.status !== "cancelled" && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-400 mb-0.5">
                              Pendapatan
                            </p>
                            <p className="font-bold text-[#A3AF87] text-sm">
                              Rp {order.netEarnings.toLocaleString("id-ID")}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
                        {order.status !== "cancelled" &&
                          order.status !== "completed" && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/farmer/orders/action/${order.orderId}`
                                );
                              }}
                              className="px-4 py-2 bg-[#A3AF87] text-white rounded-lg font-semibold text-sm hover:bg-[#8a9a6e] transition-colors whitespace-nowrap"
                            >
                              Ambil Tindakan
                            </motion.button>
                          )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderClick(order.orderId);
                          }}
                          className="px-4 py-2 bg-white border-2 border-gray-200 text-[#303646] rounded-lg font-semibold text-sm hover:border-[#A3AF87] hover:text-[#A3AF87] transition-colors whitespace-nowrap"
                        >
                          Lihat Detail
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, idx) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              const shippingConfig = shippingTypeConfig[order.shippingType];
              const ShippingIcon = shippingConfig?.icon || Package;

              return (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleOrderClick(order.orderId)}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#A3AF87]/50 hover:shadow-lg hover:shadow-[#A3AF87]/5 transition-all cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-[#303646] mb-1">
                        {order.orderId}
                      </h3>
                      <p className="text-xs text-gray-500">{order.date}</p>
                    </div>
                    <div className={`p-2 rounded-xl ${status.iconBg}`}>
                      <StatusIcon className={`h-4 w-4 ${status.iconColor}`} />
                    </div>
                  </div>

                  {/* Shipping Type Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${shippingConfig?.bgColor} ${shippingConfig?.textColor}`}
                    >
                      <ShippingIcon className="h-3 w-3" />
                      {shippingConfig?.shortLabel}
                      {order.expeditionName && ` - ${order.expeditionName}`}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#A3AF87] flex items-center justify-center text-white font-bold">
                      {order.customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#303646] text-sm">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.shippingAddress.city}
                      </p>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">
                      Produk ({order.totalItems} item)
                    </p>
                    <div className="flex -space-x-2">
                      {order.products.slice(0, 4).map((product) => (
                        <div
                          key={product.id}
                          className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white overflow-hidden"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {order.products.length > 4 && (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-500">
                          +{order.products.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold text-[#303646]">
                        Rp {order.totalPrice.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status.bgColor} ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
