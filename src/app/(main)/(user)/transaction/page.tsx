"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  ShoppingBag,
  X,
  RefreshCw,
} from "lucide-react";
import { StatusTabs } from "@/components/user/transaction/StatusTabs";
import { TransactionCard } from "@/components/user/transaction/TransactionCard";
import { TrackingDetail } from "@/components/user/transaction/TrackingDetail";
import { getCustomerOrders } from "@/lib/api/orders.actions";
import type { Order as DbOrder } from "@/lib/api/orders.actions";

// ============================================
// TYPES
// ============================================
type TransactionStatus = "unpaid" | "packed" | "shipped" | "completed" | "cancelled";

interface Product {
  id: number;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
  slug?: string;
}

interface Transaction {
  id: string;
  orderId: string;
  farmName: string;
  farmerId: number;
  status: TransactionStatus;
  products: Product[];
  totalItems: number;
  totalPrice: number;
  shippingMethod: string;
  shippingCourier: string;
  date: string;
  trackingNumber?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map database status to UI status
 */
function mapDbStatusToUiStatus(dbStatus: string): TransactionStatus {
  const statusMap: Record<string, TransactionStatus> = {
    pending: "unpaid",
    paid: "packed",
    confirmed: "packed",
    processing: "packed",
    ready_pickup: "packed",
    shipped: "shipped",
    delivered: "completed",
    completed: "completed",
    cancelled: "cancelled",
    failed: "cancelled",
    expired: "cancelled",
  };
  return statusMap[dbStatus] || "unpaid";
}

/**
 * Transform database order to UI transaction format
 */
function transformDbOrderToTransaction(dbOrder: DbOrder): Transaction {
  const products: Product[] = dbOrder.items.map((item, index) => ({
    id: index + 1,
    name: item.product_name,
    variant: item.unit || "Standard",
    quantity: item.quantity,
    price: item.unit_price,
    image: item.product_image || "/assets/dummy/magot.png",
    slug: item.product?.slug,
  }));

  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);

  return {
    id: dbOrder.id,
    orderId: dbOrder.order_id,
    farmName: "Eco-maggie Store", // TODO: Get from farmer data
    farmerId: 1,
    status: mapDbStatusToUiStatus(dbOrder.status),
    products,
    totalItems,
    totalPrice: dbOrder.total_amount,
    shippingMethod: dbOrder.shipping_method || "Regular",
    shippingCourier: dbOrder.shipping_courier || "",
    date: new Date(dbOrder.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    trackingNumber: dbOrder.shipping_tracking_number || undefined,
  };
}

// ============================================
// SKELETON COMPONENT
// ============================================
function TransactionSkeleton() {
  return (
    <div className="bg-[#fdf8d4] border border-[#435664]/20 rounded-2xl overflow-hidden animate-pulse shadow-sm">
      <div className="p-4 border-b border-[#435664]/10">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-white/60 rounded w-32" />
          <div className="h-6 bg-white/60 rounded w-24" />
        </div>
        <div className="h-3 bg-white/40 rounded w-24" />
      </div>
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-20 h-20 bg-white rounded-xl" />
          <div className="flex-1">
            <div className="h-4 bg-white/60 rounded w-3/4 mb-2" />
            <div className="h-3 bg-white/40 rounded w-1/2 mb-1" />
            <div className="h-3 bg-white/40 rounded w-1/4" />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-[#435664]/10">
        <div className="h-10 bg-white/40 rounded-xl" />
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function TransactionPage() {
  const [activeTab, setActiveTab] = useState("shipped");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [trackingTransaction, setTrackingTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions from database
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getCustomerOrders();

      if (result.success && result.data) {
        const transformedTransactions = result.data.map(transformDbOrderToTransaction);
        setTransactions(transformedTransactions);
      } else {
        setError(result.message || "Gagal memuat transaksi");
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError("Terjadi kesalahan saat memuat transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate counts for each tab
  const counts = useMemo(() => ({
    unpaid: transactions.filter((t) => t.status === "unpaid").length,
    packed: transactions.filter((t) => t.status === "packed").length,
    shipped: transactions.filter((t) => t.status === "shipped").length,
    completed: transactions.filter((t) => t.status === "completed").length,
    cancelled: transactions.filter((t) => t.status === "cancelled").length,
  }), [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesTab = transaction.status === activeTab;
      const matchesSearch =
        searchQuery === "" ||
        transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.products.some((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesTab && matchesSearch;
    });
  }, [transactions, activeTab, searchQuery]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleTrack = (transaction: any) => {
    setTrackingTransaction(transaction);
  };

  const handleRefresh = () => {
    loadTransactions();
  };

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-[#435664]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#435664] to-[#303646] rounded-xl shadow-lg shadow-[#435664]/20">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#303646]">
                  Transaksi Saya
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Kelola dan pantau semua pesanan Anda
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#435664]/10 hover:bg-[#435664]/20 text-[#435664] text-sm font-medium rounded-xl transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID pesanan, nama toko, atau produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 border border-[#435664]/30 rounded-xl text-sm text-[#303646] placeholder:text-gray-400 font-medium focus:outline-none focus:border-[#435664] focus:ring-2 focus:ring-[#435664]/20 transition-all bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <StatusTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={counts}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm text-red-700 font-medium hover:underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && filteredTransactions.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-[#303646]">
                {filteredTransactions.length}
              </span>{" "}
              transaksi
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 lg:grid-cols-2"
            >
              {[1, 2, 3, 4].map((i) => (
                <TransactionSkeleton key={i} />
              ))}
            </motion.div>
          ) : filteredTransactions.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16 sm:py-24"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-[#fdf8d4] rounded-full flex items-center justify-center mb-6 sm:mb-8 border-2 border-[#435664]/20">
                <ShoppingBag className="h-14 w-14 sm:h-18 sm:w-18 text-[#435664]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#303646] mb-2 sm:mb-3 text-center">
                {searchQuery
                  ? "Transaksi Tidak Ditemukan"
                  : "Belum Ada Transaksi"}
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 text-center max-w-md px-4">
                {searchQuery
                  ? "Coba gunakan kata kunci yang berbeda atau hapus filter pencarian"
                  : "Yuk, mulai belanja produk maggot berkualitas dari petani lokal"}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-3 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white text-sm font-bold rounded-2xl hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all"
                >
                  Hapus Pencarian
                </button>
              ) : (
                <a
                  href="/market"
                  className="px-6 py-3 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white text-sm font-bold rounded-2xl hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all"
                >
                  Mulai Belanja
                </a>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="transactions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 lg:grid-cols-2"
            >
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TransactionCard
                    transaction={transaction}
                    onTrack={handleTrack}
                    onCancelSuccess={loadTransactions}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tracking Modal */}
      <TrackingDetail
        isOpen={trackingTransaction !== null}
        onClose={() => setTrackingTransaction(null)}
        transaction={trackingTransaction || { orderId: "", farmName: "", shippingMethod: "" }}
        trackingData={null}
      />
    </div>
  );
}
