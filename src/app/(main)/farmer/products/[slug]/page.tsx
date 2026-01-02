"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Package,
  DollarSign,
  Eye,
  Heart,
  ShoppingCart,
  Star,
  Users,
  Calendar,
  Edit3,
  BarChart3,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";

interface Review {
  id: number;
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

// Mock Product with Performance Data
const mockProductData: Record<string, any> = {
  "maggot-bsf-premium": {
    id: 1,
    slug: "maggot-bsf-premium",
    name: "Maggot BSF Premium",
    description:
      "Maggot Black Soldier Fly berkualitas tinggi untuk pakan ternak.",
    price: 50000,
    discount: 10,
    finalPrice: 45000,
    unit: "kg",
    stock: 150,
    lowStockThreshold: 30,
    category: "Maggot Segar",
    images: ["/assets/dummy/magot.png"],
    status: "active",
    rating: 4.8,
    totalReviews: 124,
    totalSales: 450,
    views: 3250,
    wishlistCount: 87,
    cartAdditions: 520,
    conversionRate: 13.8, // (totalSales / views) * 100
    revenue: 20250000, // totalSales * finalPrice
    createdAt: "2024-01-15",
    lastUpdated: "2024-12-20",
    // Sales trend data (last 7 days)
    salesTrend: [
      { date: "14 Des", sales: 12 },
      { date: "15 Des", sales: 18 },
      { date: "16 Des", sales: 15 },
      { date: "17 Des", sales: 22 },
      { date: "18 Des", sales: 25 },
      { date: "19 Des", sales: 20 },
      { date: "20 Des", sales: 28 },
    ],
    // Rating distribution
    ratingDistribution: [
      { stars: 5, count: 80, percentage: 64.5 },
      { stars: 4, count: 30, percentage: 24.2 },
      { stars: 3, count: 10, percentage: 8.1 },
      { stars: 2, count: 3, percentage: 2.4 },
      { stars: 1, count: 1, percentage: 0.8 },
    ],
  },
  "maggot-kering-organik": {
    id: 2,
    slug: "maggot-kering-organik",
    name: "Maggot Kering Organik",
    description: "Maggot kering berkualitas untuk pakan ikan dan unggas.",
    price: 80000,
    discount: 15,
    finalPrice: 68000,
    unit: "kg",
    stock: 25,
    lowStockThreshold: 30,
    category: "Maggot Kering",
    images: ["/assets/dummy/magot.png"],
    status: "active",
    rating: 4.7,
    totalReviews: 89,
    totalSales: 320,
    views: 2180,
    wishlistCount: 56,
    cartAdditions: 380,
    conversionRate: 14.7,
    revenue: 21760000,
    createdAt: "2024-01-20",
    lastUpdated: "2024-12-19",
    salesTrend: [
      { date: "14 Des", sales: 10 },
      { date: "15 Des", sales: 14 },
      { date: "16 Des", sales: 12 },
      { date: "17 Des", sales: 18 },
      { date: "18 Des", sales: 16 },
      { date: "19 Des", sales: 15 },
      { date: "20 Des", sales: 20 },
    ],
    ratingDistribution: [
      { stars: 5, count: 60, percentage: 67.4 },
      { stars: 4, count: 20, percentage: 22.5 },
      { stars: 3, count: 6, percentage: 6.7 },
      { stars: 2, count: 2, percentage: 2.2 },
      { stars: 1, count: 1, percentage: 1.1 },
    ],
  },
};

export default function ProductPerformancePage({ params }: PageProps) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
      const productData = mockProductData[resolvedParams.slug];

      if (productData) {
        setProduct(productData);
      } else {
        alert("Produk tidak ditemukan");
        router.push("/farmer/products");
      }

      setLoading(false);

      // Fetch real reviews from user-facing product page
      if (productData) {
        fetchReviews(productData.id);
      }
    });
  }, [params, router]);

  const fetchReviews = async (productId: number) => {
    setLoadingReviews(true);
    try {
      // Fetch from user product page API or simulate
      // In real scenario: const response = await fetch(`/api/products/${productId}/reviews`);
      // For now, simulate with mock data from user page structure
      const mockReviews: Review[] = [
        {
          id: 1,
          author: "Budi Santoso",
          rating: 5,
          date: "20 Des 2024",
          comment:
            "Kualitas maggot sangat bagus! Ikan saya jadi cepat besar. Pengiriman cepat dan aman.",
          verified: true,
          images: ["/assets/dummy/magot.png"],
        },
        {
          id: 2,
          author: "Siti Aminah",
          rating: 5,
          date: "18 Des 2024",
          comment:
            "Sudah order berkali-kali, selalu puas. Maggot fresh dan harga bersaing.",
          verified: true,
          images: ["/assets/dummy/magot.png"],
        },
        {
          id: 3,
          author: "Ahmad Rifai",
          rating: 4,
          date: "5 Des 2024",
          comment:
            "Bagus, tapi pengiriman agak lama. Overall recommended untuk peternak.",
          verified: true,
        },
        {
          id: 4,
          author: "Dewi Lestari",
          rating: 5,
          date: "1 Des 2024",
          comment:
            "Maggot berkualitas tinggi, ayam saya doyan banget. Terima kasih!",
          verified: true,
        },
        {
          id: 5,
          author: "Andi Wijaya",
          rating: 4,
          date: "28 Nov 2024",
          comment:
            "Produk bagus, kemasan rapi. Harga sedikit mahal tapi sebanding dengan kualitas.",
          verified: false,
        },
      ];
      setReviews(mockReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#A3AF87] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Memuat performa produk...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const maxSales = Math.max(...product.salesTrend.map((d: any) => d.sales));

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
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {/* Total Sales */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-[#A3AF87]/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-[#A3AF87]" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Total Penjualan</p>
          <p className="text-2xl font-bold text-[#303646]">
            {product.totalSales}
          </p>
          <p className="text-xs text-gray-500 mt-1">{product.unit} terjual</p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Total Pendapatan</p>
          <p className="text-xl font-bold text-[#303646]">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(product.revenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Dari semua penjualan</p>
        </div>

        {/* Wishlist */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-50 rounded-lg">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-1">Total Wishlist</p>
          <p className="text-2xl font-bold text-[#303646]">
            {product.wishlistCount.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Orang menyukai produk ini
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
              {product.rating}
            </p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= Math.round(product.rating)
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {product.totalReviews} ulasan
          </p>
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
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-48">
            {product.salesTrend.map((data: any, index: number) => {
              const height = (data.sales / maxSales) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="relative w-full flex items-end justify-center h-40">
                    <div
                      className="w-full bg-gradient-to-t from-[#A3AF87] to-[#95a17a] rounded-t-lg transition-all hover:shadow-lg group relative"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#303646] text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {data.sales} {product.unit}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 font-medium">
                    {data.date}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t-2 border-gray-100">
            <div>
              <p className="text-xs text-gray-600">Rata-rata/hari</p>
              <p className="text-lg font-bold text-[#303646]">
                {Math.round(
                  product.salesTrend.reduce(
                    (sum: number, d: any) => sum + d.sales,
                    0
                  ) / product.salesTrend.length
                )}{" "}
                {product.unit}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Penjualan Tertinggi</p>
              <p className="text-lg font-bold text-green-600">
                {maxSales} {product.unit}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total 7 Hari</p>
              <p className="text-lg font-bold text-[#A3AF87]">
                {product.salesTrend.reduce(
                  (sum: number, d: any) => sum + d.sales,
                  0
                )}{" "}
                {product.unit}
              </p>
            </div>
          </div>
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
                  {reviews.length} ulasan dari pembeli
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
                            className="w-14 h-14 rounded-md overflow-hidden border border-gray-200"
                          >
                            <img
                              src={img}
                              alt={`Review photo ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
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
            {/* Wishlist */}
            <div className="p-4 bg-red-50 rounded-lg border-2 border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-600" />
                <p className="text-xs text-red-700 font-semibold">Wishlist</p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {product.wishlistCount}
              </p>
              <p className="text-xs text-gray-600 mt-1">Orang menyukai</p>
            </div>

            {/* Cart Additions */}
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-700 font-semibold">Keranjang</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {product.cartAdditions}
              </p>
              <p className="text-xs text-gray-600 mt-1">Kali ditambahkan</p>
            </div>

            {/* Stock Status */}
            <div
              className={`p-4 rounded-lg border-2 ${
                product.stock <= product.lowStockThreshold
                  ? "bg-orange-50 border-orange-100"
                  : "bg-emerald-50 border-emerald-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Package
                  className={`h-4 w-4 ${
                    product.stock <= product.lowStockThreshold
                      ? "text-orange-600"
                      : "text-emerald-600"
                  }`}
                />
                <p
                  className={`text-xs font-semibold ${
                    product.stock <= product.lowStockThreshold
                      ? "text-orange-700"
                      : "text-emerald-700"
                  }`}
                >
                  Stok
                </p>
              </div>
              <p
                className={`text-2xl font-bold ${
                  product.stock <= product.lowStockThreshold
                    ? "text-orange-600"
                    : "text-emerald-600"
                }`}
              >
                {product.stock}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {product.unit} tersedia
              </p>
              {product.stock <= product.lowStockThreshold && (
                <div className="flex items-center gap-1 mt-2 text-orange-600">
                  <AlertCircle className="h-3 w-3" />
                  <p className="text-[10px] font-medium">Stok rendah!</p>
                </div>
              )}
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
                {product.discount > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    Rp {product.price.toLocaleString("id-ID")}
                  </span>
                )}
                <span className="text-2xl font-bold text-[#A3AF87]">
                  Rp {product.finalPrice.toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-gray-600">/ {product.unit}</span>
              </div>
              {product.discount > 0 && (
                <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded mt-2">
                  Diskon {product.discount}%
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
                  {new Date(product.lastUpdated).toLocaleDateString("id-ID", {
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
                {product.description}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
