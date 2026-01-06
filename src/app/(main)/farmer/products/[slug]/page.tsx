"use client";

/**
 * Product Performance View Page (Integrated)
 * ===========================================
 * View product performance, analytics, and reviews
 * Connected to product.actions.ts backend
 */

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  TrendingUp,
  Package,
  DollarSign,
  Heart,
  ShoppingCart,
  Star,
  Users,
  Calendar,
  Edit3,
  BarChart3,
  AlertCircle,
  MessageSquare,
  ImageOff,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  useProduct,
  useSalesTrend,
  useProductRevenue,
  type Product,
} from "@/hooks/farmer/useProducts";
import { getProductReviews } from "@/lib/api/product.actions";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  images?: string[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ===========================================
// LOADING SKELETON
// ===========================================

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-4 px-4 md:px-6 lg:px-0 pb-8">
      {/* Header Skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-200"></div>
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5 border-2 border-gray-100 animate-pulse"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border-2 border-gray-100 animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white rounded-xl p-6 border-2 border-gray-100 animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// NOT FOUND COMPONENT
// ===========================================

function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-[#303646] mb-2">
          Produk Tidak Ditemukan
        </h2>
        <p className="text-gray-600 mb-6">
          Produk yang Anda cari tidak ditemukan atau telah dihapus.
        </p>
        <Link
          href="/farmer/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#A3AF87] text-white rounded-lg font-medium hover:bg-[#95a17a] transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Produk
        </Link>
      </div>
    </div>
  );
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function ProductPerformancePage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { product, loading, error } = useProduct(resolvedParams.slug);
  const { salesTrend, loading: salesLoading } = useSalesTrend(product?.id);
  const { revenueStats, loading: revenueLoading } = useProductRevenue(product?.id);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<{ [key: number]: number }>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  });
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fetch reviews when product is loaded
  useEffect(() => {
    if (product?.id) {
      fetchReviews(product.id);
    }
  }, [product?.id]);

  const fetchReviews = async (productId: string) => {
    setLoadingReviews(true);
    try {
      // Fetch real reviews from database
      const response = await getProductReviews(productId);

      if (response.success && response.data) {
        const transformedReviews: Review[] = response.data.reviews.map((r) => ({
          id: r.id,
          author: r.author,
          rating: r.rating,
          date: new Date(r.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          comment: r.comment || "",
          verified: r.isVerified,
          images: r.images,
        }));
        setReviews(transformedReviews);
        setRatingDistribution(response.data.ratingDistribution);
        setAverageRating(response.data.averageRating);
        setTotalReviews(response.data.total);
      } else {
        setReviews([]);
        setRatingDistribution({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        setAverageRating(0);
        setTotalReviews(0);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Calculate derived values
  const calculateRevenue = (p: Product) => p.totalSold * p.finalPrice;

  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Error or not found state
  if (error || !product) {
    return <ProductNotFound />;
  }

  const revenue = calculateRevenue(product);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-4 px-4 md:px-6 lg:px-0 pb-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <Link
          href="/farmer/products"
          className="inline-flex items-center gap-2 text-sm text-[#5a6c5b] hover:text-[#4a5c4b] mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Produk
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
              {product.images && product.images.length > 0 && !imageError ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#303646]">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
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
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600">
                  {product.category}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/farmer/products/edit/${product.slug}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#A3AF87] text-white rounded-lg font-medium hover:bg-[#95a17a] transition-all hover:shadow-lg"
          >
            <Edit3 className="h-4 w-4" />
            Edit Produk
          </Link>
        </div>
      </motion.div>

      {/* Performance Stats Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        {/* Total Sales */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-[#A3AF87]/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-[#A3AF87]" />
            </div>
            {product.totalSold > 0 && (
              <TrendingUp className="h-4 w-4 text-green-600" />
            )}
          </div>
          <p className="text-xs text-gray-600 mb-1">Total Penjualan</p>
          <p className="text-2xl font-bold text-[#303646]">
            {product.totalSold}
          </p>
          <p className="text-xs text-gray-500 mt-1">{product.unit} terjual</p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            {(revenueStats.totalRevenue > 0 || revenue > 0) && <TrendingUp className="h-4 w-4 text-green-600" />}
          </div>
          <p className="text-xs text-gray-600 mb-1">Total Pendapatan</p>
          {revenueLoading ? (
            <div className="h-7 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-xl font-bold text-[#303646]">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(revenueStats.totalRevenue > 0 ? revenueStats.totalRevenue : revenue)}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {revenueStats.totalRevenue > 0 
              ? `${revenueStats.totalOrders} pesanan selesai` 
              : "Estimasi dari penjualan"}
          </p>
        </div>

        {/* Rating */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-yellow-50 rounded-lg">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Rating Produk</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-[#303646]">
              {averageRating > 0 ? averageRating.toFixed(1) : product.rating > 0 ? product.rating.toFixed(1) : "-"}
            </p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= Math.round(averageRating || product.rating)
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {totalReviews || product.totalReviews} ulasan
          </p>
          
          {/* Rating Distribution */}
          {(totalReviews > 0 || product.totalReviews > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star] || 0;
                const total = totalReviews || product.totalReviews || 1;
                const percentage = (count / total) * 100;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-3">{star}</span>
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Trend Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl p-6 border-2 border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#A3AF87] rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#303646]">Trend Penjualan</h3>
                <p className="text-xs text-gray-500">7 hari terakhir</p>
              </div>
            </div>
            {salesLoading && (
              <div className="w-5 h-5 border-2 border-[#A3AF87] border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>

          {/* Bar Chart - Integrated with Database */}
          {salesTrend.trend.length > 0 ? (
            <>
              <div className="flex items-end justify-between gap-2 h-48">
                {salesTrend.trend.map((data, index) => {
                  const height =
                    salesTrend.maxSales > 0
                      ? (data.quantitySold / salesTrend.maxSales) * 100
                      : 0;
                  const isEmpty = data.quantitySold === 0;

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="relative w-full flex items-end justify-center h-40">
                        <div
                          className={`w-full rounded-t-lg transition-all group relative cursor-pointer ${
                            isEmpty
                              ? "bg-gray-200"
                              : "bg-gradient-to-t from-[#A3AF87] to-[#95a17a] hover:shadow-lg"
                          }`}
                          style={{
                            height: isEmpty ? "8px" : `${Math.max(height, 8)}%`,
                          }}
                        >
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#303646] text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                            <p className="font-bold">{data.quantitySold} {product.unit}</p>
                            <p className="text-gray-300 text-[10px]">
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                              }).format(data.revenue)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-600 font-medium">
                        {data.dayName}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Stats Summary - Real Data */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t-2 border-gray-100">
                <div>
                  <p className="text-xs text-gray-600">Rata-rata/hari</p>
                  <p className="text-lg font-bold text-[#303646]">
                    {salesTrend.avgPerDay} {product.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Penjualan Tertinggi</p>
                  <p
                    className={`text-lg font-bold ${
                      salesTrend.maxSales > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {salesTrend.maxSales > 0
                      ? `${salesTrend.maxSales} ${product.unit}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total 7 Hari</p>
                  <p
                    className={`text-lg font-bold ${
                      salesTrend.totalSales > 0
                        ? "text-[#A3AF87]"
                        : "text-gray-400"
                    }`}
                  >
                    {salesTrend.totalSales > 0
                      ? `${salesTrend.totalSales} ${product.unit}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Pendapatan 7 Hari</p>
                  <p
                    className={`text-lg font-bold ${
                      salesTrend.totalRevenue > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {salesTrend.totalRevenue > 0
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(salesTrend.totalRevenue)
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Empty State Message */}
              {!salesTrend.hasData && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    📊 Belum ada data penjualan dalam 7 hari terakhir
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    Data akan muncul setelah ada transaksi yang selesai
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Loading/Empty State for Chart */
            <div className="h-48 flex items-center justify-center">
              {salesLoading ? (
                <div className="text-center">
                  <div className="w-10 h-10 border-3 border-[#A3AF87] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Memuat data...</p>
                </div>
              ) : (
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Belum ada data penjualan
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Data trend akan muncul setelah ada penjualan
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Reviews from Users */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border-2 border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#303646]">Ulasan Pelanggan</h3>
                <p className="text-xs text-gray-500">
                  {product.totalReviews} ulasan dari pembeli
                </p>
              </div>
            </div>
          </div>

          {loadingReviews ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-[#A3AF87] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Memuat ulasan...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Belum ada ulasan</p>
              <p className="text-xs text-gray-400 mt-1">
                Ulasan akan muncul setelah pembeli memberikan feedback
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {(showAllReviews ? reviews : reviews.slice(0, 3)).map(
                (review) => (
                  <div
                    key={review.id}
                    className="p-4 border-2 border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A3AF87] to-[#5a6c5b] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#303646]">
                            {review.author}
                          </p>
                          <p className="text-xs text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      {review.verified && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full flex items-center gap-1 flex-shrink-0">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= review.rating
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {review.images.map((img, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="w-14 h-14 rounded-md overflow-hidden border border-gray-200 relative"
                          >
                            <Image
                              src={img}
                              alt={`Review photo ${imgIndex + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
              {reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="w-full py-2 text-sm font-medium text-[#A3AF87] hover:text-[#95a17a] transition-colors"
                >
                  {showAllReviews
                    ? "Tampilkan Lebih Sedikit"
                    : `Lihat Semua ${reviews.length} Ulasan`}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Engagement Metrics & Product Info */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Engagement */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 border-2 border-gray-100"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-[#A3AF87] rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-[#303646]">Engagement Pelanggan</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Total Orders */}
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-700 font-semibold">Total Order</p>
              </div>
              {revenueLoading ? (
                <div className="h-8 w-12 bg-blue-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-blue-600">
                  {revenueStats.totalOrders}
                </p>
              )}
              <p className="text-xs text-gray-600 mt-1">Pesanan masuk</p>
            </div>

            {/* Total Sold */}
            <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-purple-600" />
                <p className="text-xs text-purple-700 font-semibold">Terjual</p>
              </div>
              {revenueLoading ? (
                <div className="h-8 w-16 bg-purple-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {revenueStats.totalQuantitySold > 0 ? revenueStats.totalQuantitySold : product.totalSold}
                </p>
              )}
              <p className="text-xs text-gray-600 mt-1">{product.unit} terjual</p>
            </div>

            {/* Total Reviews */}
            <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <p className="text-xs text-yellow-700 font-semibold">Ulasan</p>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {totalReviews || product.totalReviews}
              </p>
              <p className="text-xs text-gray-600 mt-1">Review diterima</p>
            </div>

            {/* Stock Status */}
            <div
              className={`p-4 rounded-lg border-2 col-span-2 ${
                product.stock <= product.lowStockThreshold
                  ? product.stock === 0
                    ? "bg-red-50 border-red-100"
                    : "bg-orange-50 border-orange-100"
                  : "bg-emerald-50 border-emerald-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Package
                  className={`h-4 w-4 ${
                    product.stock <= product.lowStockThreshold
                      ? product.stock === 0
                        ? "text-red-600"
                        : "text-orange-600"
                      : "text-emerald-600"
                  }`}
                />
                <p
                  className={`text-xs font-semibold ${
                    product.stock <= product.lowStockThreshold
                      ? product.stock === 0
                        ? "text-red-700"
                        : "text-orange-700"
                      : "text-emerald-700"
                  }`}
                >
                  Status Stok
                </p>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      product.stock <= product.lowStockThreshold
                        ? product.stock === 0
                          ? "text-red-600"
                          : "text-orange-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {product.stock}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {product.unit} tersedia
                  </p>
                </div>
                {product.stock <= product.lowStockThreshold && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      product.stock === 0
                        ? "bg-red-100 text-red-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    <AlertCircle className="h-3 w-3" />
                    <p className="text-xs font-medium">
                      {product.stock === 0 ? "Habis!" : "Stok rendah!"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 border-2 border-gray-100"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-[#A3AF87] rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-[#303646]">Informasi Produk</h3>
          </div>

          <div className="space-y-4">
            {/* Price Info */}
            <div className="p-4 bg-gradient-to-br from-[#A3AF87]/10 to-[#FDF8D4]/30 rounded-lg border-2 border-[#A3AF87]/20">
              <p className="text-xs text-gray-600 mb-2">Harga Saat Ini</p>
              <div className="flex items-baseline gap-2">
                {product.discountPercent > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    Rp {product.price.toLocaleString("id-ID")}
                  </span>
                )}
                <span className="text-2xl font-bold text-[#A3AF87]">
                  Rp {product.finalPrice.toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-gray-600">/ {product.unit}</span>
              </div>
              {product.discountPercent > 0 && (
                <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded mt-2">
                  Diskon {product.discountPercent}%
                </span>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-600" />
                  <p className="text-xs text-gray-600">Dibuat</p>
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {new Date(product.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-600" />
                  <p className="text-xs text-gray-600">Update Terakhir</p>
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {new Date(product.updatedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1.5">Deskripsi</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.description || "Tidak ada deskripsi"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
