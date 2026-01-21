"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  TrendingUp,
  AlertTriangle,
  Edit3,
  Trash2,
  Eye,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Heart,
  MessageSquare,
  ShoppingCart,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  useProducts,
  useProductAnalytics,
  useTopProducts,
  useLowStockProducts,
  defaultAnalytics,
} from "@/hooks/farmer/useProducts";
import type { Product } from "@/lib/api/product.actions";
import { exportProductsToExcel, type ProductExportData } from "@/utils/exportExcel";

// ===========================================
// SKELETON COMPONENTS
// ===========================================

function StatsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-10"></div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-center gap-1.5">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );
}

export default function FarmerProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch data using hooks
  const { products, loading, error, refetch, handleDelete } = useProducts();
  const { analytics, loading: analyticsLoading } = useProductAnalytics();
  const { topProducts, loading: topLoading } = useTopProducts(3);
  const { lowStockProducts, loading: lowStockLoading } = useLowStockProducts();

  // Use analytics data or defaults for empty state
  const stats = analytics || defaultAnalytics;

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Unique categories from products
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ["all", ...cats];
  }, [products]);

  // Handle delete with SweetAlert confirmation
  const onDeleteProduct = async (product: Product) => {
    const result = await Swal.fire({
      title: "Hapus Produk?",
      html: `
        <div class="text-left">
          <p class="text-gray-600">Anda yakin ingin menghapus produk:</p>
          <p class="font-bold text-gray-900 mt-2">"${product.name}"</p>
          <p class="text-sm text-red-500 mt-3">⚠️ Tindakan ini tidak dapat dibatalkan</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-xl",
      },
    });

    if (result.isConfirmed) {
      const deleteResult = await handleDelete(product.slug, product.name);

      if (deleteResult.success) {
        Swal.fire({
          title: "Berhasil!",
          text: deleteResult.message,
          icon: "success",
          confirmButtonColor: "#A3AF87",
          customClass: { popup: "rounded-xl" },
        });
      } else {
        Swal.fire({
          title: "Gagal!",
          text: deleteResult.message,
          icon: "error",
          confirmButtonColor: "#EF4444",
          customClass: { popup: "rounded-xl" },
        });
      }
    }
  };

  const handleExportExcel = () => {
    const exportData: ProductExportData[] = filteredProducts.map((product) => ({
      name: product.name,
      category: product.category,
      price: product.price,
      discount: product.discountPercent,
      finalPrice: product.finalPrice,
      stock: product.stock,
      unit: product.unit,
      status: product.status === "active" ? "Aktif" : product.status === "inactive" ? "Nonaktif" : "Draft",
      totalSold: product.totalSold,
      totalReviews: product.totalReviews,
      averageRating: product.rating,
    }));

    exportProductsToExcel(exportData, "farmer-products");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf8d4]/30 to-white pt-4 px-4 md:px-6 lg:px-0 pb-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#303646] mb-1">
              Manajemen Produk
            </h1>
            <p className="text-sm text-[#435664]">
              Kelola inventori dan performa produk Anda
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              disabled={loading || filteredProducts.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#a3af87] text-white rounded-lg hover:bg-[#435664] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export ke Excel"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Export Excel</span>
            </button>
            <button
              onClick={() => refetch()}
              className="p-3 bg-[#fdf8d4]/30 text-[#435664] rounded-lg border-2 border-[#a3af87]/30 hover:border-[#a3af87] hover:text-[#a3af87] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <Link
              href="/farmer/products/add"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#a3af87] text-white rounded-lg font-medium hover:bg-[#435664] transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="h-5 w-5" />
              Tambah Produk
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => refetch()}
              className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Coba Lagi
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards - Quick Overview */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6"
      >
        <div className="bg-[#fdf8d4]/20 rounded-xl p-4 border-2 border-[#a3af87]/30 hover:border-[#a3af87] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#a3af87]/10 rounded-lg">
              <Package className="h-5 w-5 text-[#a3af87]" />
            </div>
            <div>
              {analyticsLoading ? (
                <StatsSkeleton />
              ) : (
                <>
                  <p className="text-xs text-[#435664]">Total Produk</p>
                  <p className="text-xl font-bold text-[#303646]">
                    {stats.totalProducts}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#fdf8d4]/20 rounded-xl p-4 border-2 border-[#a3af87]/30 hover:border-green-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              {analyticsLoading ? (
                <StatsSkeleton />
              ) : (
                <>
                  <p className="text-xs text-[#435664]">Produk Aktif</p>
                  <p className="text-xl font-bold text-[#303646]">
                    {stats.activeProducts}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#fdf8d4]/20 rounded-xl p-4 border-2 border-[#a3af87]/30 hover:border-red-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              {analyticsLoading ? (
                <StatsSkeleton />
              ) : (
                <>
                  <p className="text-xs text-[#435664]">Stok Rendah</p>
                  <p className="text-xl font-bold text-red-600">
                    {stats.lowStockCount}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#fdf8d4]/20 rounded-xl p-4 border-2 border-[#a3af87]/30 hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              {analyticsLoading ? (
                <StatsSkeleton />
              ) : (
                <>
                  <p className="text-xs text-[#435664]">Total Revenue</p>
                  <p className="text-lg font-bold text-[#303646]">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(stats.totalRevenue)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
      >
        {/* TILE 1: TOP PRODUCTS */}
        <div className="bg-[#fdf8d4]/20 rounded-xl p-5 border-2 border-[#a3af87]/30 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-[#a3af87] to-[#435664] rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-[#303646]">Produk Terlaris</h3>
            </div>
          </div>

          {topLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-6">
              <TrendingUp className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Belum ada data penjualan</p>
              <p className="text-xs text-gray-400 mt-1">
                Data akan muncul setelah ada transaksi
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => {
                const maxSales = topProducts[0]?.totalSold || 1;
                const percentage = (product.totalSold / maxSales) * 100;

                return (
                  <div key={product.id} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? "bg-yellow-500 text-white"
                              : index === 1
                              ? "bg-gray-300 text-gray-700"
                              : "bg-orange-400 text-white"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <p className="text-sm font-medium text-[#303646] truncate">
                          {product.name}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#a3af87] ml-2">
                        {product.totalSold}
                      </span>
                    </div>
                    <div className="w-full bg-[#fdf8d4]/30 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-[#a3af87] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-[#435664]">
                        {product.category}
                      </p>
                      <p className="text-[10px] font-medium text-[#435664]">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(product.totalSold * product.finalPrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* TILE 2: STOCK ALERTS */}
        <div className="bg-[#fdf8d4]/20 rounded-xl p-5 border-2 border-red-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-[#303646]">Peringatan Stok</h3>
            </div>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              {lowStockProducts.length}
            </span>
          </div>

          {lowStockLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse p-3 bg-gray-100 rounded-lg"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Semua stok aman! 🎉
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Tidak ada produk dengan stok rendah
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {lowStockProducts.map((product) => {
                const stockPercentage =
                  (product.stock / product.lowStockThreshold) * 100;
                const isVeryLow = stockPercentage <= 50;

                return (
                  <div
                    key={product.id}
                    className={`p-3 rounded-lg border-2 ${
                      isVeryLow
                        ? "border-red-200 bg-red-50"
                        : "border-orange-200 bg-orange-50"
                    } hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#303646] truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {product.category}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-md text-xs font-bold ${
                          isVeryLow
                            ? "bg-red-200 text-red-800"
                            : "bg-orange-200 text-orange-800"
                        }`}
                      >
                        {product.stock} {product.unit}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-white rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isVeryLow ? "bg-red-500" : "bg-orange-500"
                          }`}
                          style={{
                            width: `${Math.min(stockPercentage, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-600">
                        Min: {product.lowStockThreshold}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* TILE 3: CATEGORY DISTRIBUTION */}
        <div className="bg-[#fdf8d4]/20 rounded-xl p-5 border-2 border-[#a3af87]/30 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#a3af87] rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-[#303646]">Distribusi Kategori</h3>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse p-2 bg-gray-100 rounded-lg"
                >
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Category Distribution */}
              {products.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#435664] mb-2">
                    Distribusi Kategori
                  </p>
                  {Array.from(new Set(products.map((p) => p.category)))
                    .slice(0, 4)
                    .map((category) => {
                      const count = products.filter(
                        (p) => p.category === category
                      ).length;
                      const percentage = (count / stats.totalProducts) * 100;

                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-[#303646]">{category}</p>
                            <span className="text-xs font-bold text-[#a3af87]">
                              {count}
                            </span>
                          </div>
                          <div className="w-full bg-[#fdf8d4]/30 rounded-full h-1.5">
                            <div
                              className="h-full bg-[#a3af87] rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {products.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-[#435664]">Belum ada produk</p>
                  <p className="text-xs text-[#435664]/70 mt-1">
                    Tambahkan produk pertama Anda
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-[#fdf8d4]/20 rounded-xl p-4 border-2 border-[#a3af87]/30 mb-4"
      >
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#435664]" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[#a3af87]/30 rounded-lg focus:border-[#a3af87] focus:ring-2 focus:ring-[#a3af87]/20 focus:outline-none transition-all text-sm text-[#303646] placeholder:text-[#435664]/50"
            />
          </div>

          {/* Category Filter - Modern Hover Dropdown */}
          <div className="relative group">
            <button
              className="w-full md:w-auto px-4 py-3 rounded-xl border-2 border-[#a3af87]/40 bg-white hover:border-[#a3af87] hover:shadow-md transition-all flex items-center gap-2 text-[#435664] font-semibold"
            >
              <Filter className="h-5 w-5 text-[#a3af87]" />
              <span className="text-sm">
                {selectedCategory === "all" ? "Semua Kategori" : selectedCategory}
              </span>
              <svg className="h-4 w-4 ml-1 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border-2 border-[#a3af87]/30 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                <div className="px-3 py-2 border-b border-[#a3af87]/20 mb-1">
                  <p className="text-xs font-semibold text-[#435664] uppercase tracking-wide">Pilih Kategori</p>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        selectedCategory === cat 
                          ? "bg-[#a3af87]/15 text-[#303646]" 
                          : "hover:bg-[#fdf8d4]/30 text-[#435664]"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        selectedCategory === cat ? "bg-[#a3af87]/30" : "bg-[#fdf8d4]/50"
                      }`}>
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">
                        {cat === "all" ? "Semua Kategori" : cat}
                      </span>
                      {selectedCategory === cat && (
                        <svg className="h-4 w-4 text-[#a3af87] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-[#fdf8d4]/20 rounded-xl border-2 border-[#a3af87]/30 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#a3af87]/10 to-[#fdf8d4]/30 border-b-2 border-[#a3af87]/30">
                <th className="text-left px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Produk
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Kategori
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Harga
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Stok
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Performa
                </th>
                <th className="text-center px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#a3af87]/20">
              {loading
                ? // Skeleton loading rows
                  [...Array(5)].map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))
                : filteredProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#fdf8d4]/30 transition-colors"
                    >
                      {/* Product Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#fdf8d4]/30 flex-shrink-0">
                            {product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-[#a3af87]/50" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[#303646] truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#435664]">
                              {product.totalReviews} ulasan
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-[#a3af87]/10 text-[#435664] text-xs font-medium rounded-md">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        <div>
                          {product.discountPercent > 0 && (
                            <p className="text-[10px] text-gray-400 line-through">
                              Rp {product.price.toLocaleString("id-ID")}
                            </p>
                          )}
                          <p className="text-sm font-bold text-[#303646]">
                            Rp {product.finalPrice.toLocaleString("id-ID")}
                          </p>
                          {product.discountPercent > 0 && (
                            <span className="inline-block px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded mt-0.5">
                              -{product.discountPercent}%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p
                              className={`text-sm font-bold ${
                                product.stock <= product.lowStockThreshold
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {product.stock} {product.unit}
                            </p>
                            {product.stock <= product.lowStockThreshold && (
                              <p className="text-[10px] text-red-500 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Stok rendah
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.status === "active"
                              ? "bg-green-100 text-green-700"
                              : product.status === "inactive"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.status === "active"
                                ? "bg-green-600"
                                : product.status === "inactive"
                                ? "bg-gray-600"
                                : "bg-yellow-600"
                            }`}
                          />
                          {product.status === "active"
                            ? "Aktif"
                            : product.status === "inactive"
                            ? "Nonaktif"
                            : "Draft"}
                        </span>
                      </td>

                      {/* Performance */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <svg
                              className="h-3.5 w-3.5 fill-yellow-500"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-700">
                              {product.rating > 0
                                ? product.rating.toFixed(1)
                                : "0"}
                            </span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-600">
                            {product.totalSold} terjual
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/farmer/products/${product.slug}`}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/farmer/products/edit/${product.slug}`}
                            className="p-2 bg-[#a3af87]/10 text-[#a3af87] rounded-lg hover:bg-[#a3af87]/20 transition-colors"
                            title="Edit Produk"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => onDeleteProduct(product)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-[#a3af87]/50 mx-auto mb-3" />
              <p className="text-[#435664] font-medium">
                {products.length === 0
                  ? "Belum ada produk"
                  : "Produk tidak ditemukan"}
              </p>
              <p className="text-sm text-[#435664]/70 mt-1">
                {products.length === 0
                  ? "Tambahkan produk pertama Anda sekarang"
                  : "Coba ubah filter atau kata kunci pencarian"}
              </p>
              {products.length === 0 && (
                <Link
                  href="/farmer/products/add"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#a3af87] text-white rounded-lg text-sm font-medium hover:bg-[#435664] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Produk
                </Link>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
