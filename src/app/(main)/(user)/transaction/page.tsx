"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  ShoppingBag,
  Filter,
  X,
  RefreshCw,
} from "lucide-react";
import { StatusTabs } from "@/components/user/transaction/StatusTabs";
import { TransactionCard } from "@/components/user/transaction/TransactionCard";
import { TrackingDetail } from "@/components/user/transaction/TrackingDetail";

// Mock Data
const mockTransactions = [
  {
    id: "1",
    orderId: "ORD-2025-12-001",
    farmName: "Kebun Maggot Berkah",
    farmerId: 1,
    status: "shipped" as const,
    products: [
      {
        id: 1,
        name: "Maggot BSF Premium",
        variant: "500gr",
        quantity: 2,
        price: 76500,
        image: "/assets/dummy/magot.png",
      },
    ],
    totalItems: 2,
    totalPrice: 153000,
    shippingMethod: "Local Delivery",
    date: "29 Des 2025",
    trackingNumber: "ECO-BA-20251230001",
  },
  {
    id: "2",
    orderId: "ORD-2025-12-002",
    farmName: "Maggot Organik Sentosa",
    farmerId: 2,
    status: "packed" as const,
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
        name: "Maggot BSF Kering",
        variant: "250gr",
        quantity: 1,
        price: 52000,
        image: "/assets/dummy/magot.png",
      },
    ],
    totalItems: 4,
    totalPrice: 166000,
    shippingMethod: "Regular",
    date: "30 Des 2025",
  },
  {
    id: "3",
    orderId: "ORD-2025-12-003",
    farmName: "Ternak Maggot Jaya",
    farmerId: 3,
    status: "completed" as const,
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
    shippingMethod: "Express",
    date: "25 Des 2025",
  },
  {
    id: "4",
    orderId: "ORD-2025-12-004",
    farmName: "BSF Farm Indonesia",
    farmerId: 4,
    status: "unpaid" as const,
    products: [
      {
        id: 3,
        name: "Maggot BSF Kering",
        variant: "250gr",
        quantity: 2,
        price: 52000,
        image: "/assets/dummy/magot.png",
      },
    ],
    totalItems: 2,
    totalPrice: 104000,
    shippingMethod: "Regular",
    date: "30 Des 2025",
  },
  {
    id: "5",
    orderId: "ORD-2025-12-005",
    farmName: "Maggot Premium Farm",
    farmerId: 5,
    status: "cancelled" as const,
    products: [
      {
        id: 1,
        name: "Maggot BSF Premium",
        variant: "500gr",
        quantity: 1,
        price: 76500,
        image: "/assets/dummy/magot.png",
      },
    ],
    totalItems: 1,
    totalPrice: 76500,
    shippingMethod: "Regular",
    date: "28 Des 2025",
  },
];

// Skeleton Component
function TransactionSkeleton() {
  return (
    <div className="bg-white border border-[#A3AF87]/20 rounded-2xl overflow-hidden animate-pulse shadow-sm">
      <div className="p-4 border-b border-[#A3AF87]/10">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-[#A3AF87]/20 rounded w-32" />
          <div className="h-6 bg-[#A3AF87]/20 rounded w-24" />
        </div>
        <div className="h-3 bg-[#A3AF87]/10 rounded w-24" />
      </div>
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-20 h-20 bg-[#A3AF87]/10 rounded-xl" />
          <div className="flex-1">
            <div className="h-4 bg-[#A3AF87]/20 rounded w-3/4 mb-2" />
            <div className="h-3 bg-[#A3AF87]/10 rounded w-1/2 mb-1" />
            <div className="h-3 bg-[#A3AF87]/10 rounded w-1/4" />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-[#A3AF87]/10">
        <div className="h-10 bg-[#A3AF87]/10 rounded-xl" />
      </div>
    </div>
  );
}

export default function TransactionPage() {
  const [activeTab, setActiveTab] = useState("shipped");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trackingTransaction, setTrackingTransaction] = useState<any>(null);

  // Calculate counts for each tab
  const counts = {
    unpaid: mockTransactions.filter((t) => t.status === "unpaid").length,
    packed: mockTransactions.filter((t) => t.status === "packed").length,
    shipped: mockTransactions.filter((t) => t.status === "shipped").length,
    completed: mockTransactions.filter((t) => t.status === "completed").length,
    cancelled: mockTransactions.filter((t) => t.status === "cancelled").length,
  };

  // Filter transactions
  const filteredTransactions = mockTransactions.filter((transaction) => {
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

  const handleTabChange = (tab: string) => {
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleTrack = (transaction: any) => {
    setTrackingTransaction(transaction);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A3AF87]/5 via-white to-[#A3AF87]/10 pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-[#A3AF87]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-[#A3AF87] rounded-xl shadow-lg shadow-[#A3AF87]/20">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#5a6c5b]">
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
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#A3AF87]/10 hover:bg-[#A3AF87]/20 text-[#5a6c5b] text-sm font-medium rounded-xl transition-all disabled:opacity-50"
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
              className="w-full pl-12 pr-12 py-3.5 border border-[#A3AF87]/30 rounded-xl text-sm text-[#5a6c5b] placeholder:text-gray-400 font-medium focus:outline-none focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 transition-all bg-[#A3AF87]/5"
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
        {/* Results Count */}
        {!isLoading && filteredTransactions.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Menampilkan{" "}
              <span className="font-semibold text-[#5a6c5b]">
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
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 rounded-full flex items-center justify-center mb-6 sm:mb-8 border-2 border-[#A3AF87]/20">
                <ShoppingBag className="h-14 w-14 sm:h-18 sm:w-18 text-[#A3AF87]/40" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#5a6c5b] mb-2 sm:mb-3 text-center">
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
                  className="px-6 py-3 bg-[#A3AF87] text-white text-sm font-bold rounded-xl hover:bg-[#95a17a] transition-all"
                >
                  Hapus Pencarian
                </button>
              ) : (
                <a
                  href="/market/products"
                  className="px-6 py-3 bg-[#A3AF87] text-white text-sm font-bold rounded-xl hover:bg-[#95a17a] hover:shadow-lg hover:shadow-[#A3AF87]/30 transition-all"
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
        transaction={trackingTransaction || {}}
      />
    </div>
  );
}
