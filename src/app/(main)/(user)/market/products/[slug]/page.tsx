"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getMarketProductDetail,
  getProductReviews,
  submitProductReview,
  checkWishlistStatus,
  toggleWishlist,
  type MarketProductDetail,
  type ProductReview,
  type ProductReviewsResponse,
} from "@/lib/api/product.actions";
import Swal from "sweetalert2";

// Category display names mapping
const categoryDisplayNames: Record<string, string> = {
  VEGETABLES: "Sayuran",
  FRUITS: "Buah-buahan",
  GRAINS: "Biji-bijian",
  DAIRY: "Produk Susu",
  MEAT: "Daging",
  ORGANIC: "Organik",
  OTHER: "Lainnya",
};

// Format date helper
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
}

// Format relative time for farmer join date
function formatJoinDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMonths = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  if (diffInMonths < 1) return "Baru bergabung";
  if (diffInMonths < 12) return `${diffInMonths} bulan`;
  const years = Math.floor(diffInMonths / 12);
  return `${years} tahun`;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [slug, setSlug] = useState<string>("");
  const [product, setProduct] = useState<MarketProductDetail | null>(null);
  const [reviewsData, setReviewsData] = useState<ProductReviewsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description"
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Review form states
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wishlist states
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Fetch product data
  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    async function fetchProduct() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getMarketProductDetail(slug);

        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          setError(result.message || "Produk tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Terjadi kesalahan saat memuat produk");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  // Fetch reviews when product is loaded or when switching to reviews tab
  const fetchReviews = useCallback(async () => {
    if (!product?.id) return;

    setIsLoadingReviews(true);
    try {
      const result = await getProductReviews(product.id);
      if (result.success && result.data) {
        setReviewsData(result.data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [product?.id]);

  useEffect(() => {
    if (activeTab === "reviews" && product?.id && !reviewsData) {
      fetchReviews();
    }
  }, [activeTab, product?.id, reviewsData, fetchReviews]);

  // Check wishlist status when product is loaded
  useEffect(() => {
    async function checkWishlist() {
      if (!product?.id) return;

      const result = await checkWishlistStatus(product.id);
      if (result.success && result.data) {
        setIsWishlisted(result.data.isWishlisted);
      }
    }
    checkWishlist();
  }, [product?.id]);

  // Handle wishlist toggle
  const handleToggleWishlist = async () => {
    if (!product?.id) return;

    setIsTogglingWishlist(true);
    try {
      const result = await toggleWishlist(product.id);

      if (result.success && result.data) {
        setIsWishlisted(result.data.isWishlisted);
        Swal.fire({
          icon: "success",
          title: result.data.isWishlisted
            ? "Ditambahkan ke Wishlist"
            : "Dihapus dari Wishlist",
          text: result.message,
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else if (result.error === "UNAUTHORIZED") {
        Swal.fire({
          icon: "warning",
          title: "Login Diperlukan",
          text: "Silakan login untuk menambahkan ke wishlist",
          confirmButtonColor: "#A3AF87",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: result.message,
          confirmButtonColor: "#A3AF87",
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Gagal memproses wishlist",
        confirmButtonColor: "#A3AF87",
      });
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  // Handle image upload for review
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire({
            icon: "warning",
            title: "Ukuran file terlalu besar",
            text: "Maksimal ukuran file adalah 5MB",
            confirmButtonColor: "#A3AF87",
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === files.length) {
              setReviewImages((prev) => [...prev, ...newImages].slice(0, 5));
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeReviewImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!product?.id) return;

    if (!reviewText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Komentar tidak boleh kosong",
        text: "Silakan tulis komentar untuk ulasan Anda",
        confirmButtonColor: "#A3AF87",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const result = await submitProductReview({
        productId: product.id,
        rating: reviewRating,
        comment: reviewText.trim(),
        images: reviewImages,
      });

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Ulasan Anda berhasil dikirim",
          confirmButtonColor: "#A3AF87",
        });
        // Reset form
        setReviewText("");
        setReviewRating(5);
        setReviewImages([]);
        // Refresh reviews
        fetchReviews();
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal mengirim ulasan",
          text: result.message,
          confirmButtonColor: "#A3AF87",
        });
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan",
        text: "Gagal mengirim ulasan",
        confirmButtonColor: "#A3AF87",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3AF87] mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error || "Produk tidak ditemukan"}
          </h2>
          <p className="text-gray-600 mb-4">
            Produk yang Anda cari mungkin tidak tersedia atau telah dihapus.
          </p>
          <Link
            href="/market/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#A3AF87] text-white rounded-lg hover:bg-[#95a17a] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali ke Produk
          </Link>
        </div>
      </div>
    );
  }

  const categoryDisplay =
    categoryDisplayNames[product.category] || product.category;
  const productImages =
    product.images.length > 0 ? product.images : ["/assets/dummy/magot.png"];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Back Button */}
        <Link
          href="/market/products"
          className="inline-flex items-center gap-1.5 mb-4 text-sm text-[#5a6c5b] hover:text-[#4a5c4b] transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">Kembali</span>
        </Link>

        {/* Main Content - Compact Layout */}
        <div className="grid lg:grid-cols-5 gap-4 mb-4">
          {/* Left: Images - Smaller */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
              {/* Main Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-50">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setPreviewImage(productImages[selectedImage])}
                />
                {product.discountPercent > 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md">
                    -{product.discountPercent}%
                  </div>
                )}
                <button
                  onClick={handleToggleWishlist}
                  disabled={isTogglingWishlist}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <svg
                    className={`h-4 w-4 transition-all ${
                      isWishlisted
                        ? "text-red-500 fill-red-500"
                        : "text-gray-500 group-hover:text-red-500"
                    }`}
                    fill={isWishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-5 gap-1.5">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-[#A3AF87]"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info - Compact */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#A3AF87]/20 text-[#5a6c5b]">
                      {categoryDisplay}
                    </span>
                    {product.farmer.isVerified && (
                      <span className="flex items-center gap-1 text-xs text-[#5a6c5b]">
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Terverifikasi
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-[#5a6c5b]">
                    {product.name}
                  </h1>
                </div>
              </div>

              {/* Rating & Stock Row */}
              <div className="flex flex-wrap items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-sm font-semibold text-[#5a6c5b]">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({product.totalReviews} ulasan)
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-500">
                  {product.totalSold} terjual
                </span>
                <span className="text-gray-300">|</span>
                <span
                  className={`text-xs font-medium ${
                    product.stock > 10
                      ? "text-emerald-600"
                      : product.stock > 0
                      ? "text-orange-500"
                      : "text-red-500"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} ${product.unit} tersedia`
                    : "Stok habis"}
                </span>
              </div>

              {/* Price */}
              <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-[#A3AF87]/10 to-transparent">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-[#5a6c5b]">
                    Rp {product.finalPrice.toLocaleString("id-ID")}
                  </span>
                  {product.discountPercent > 0 && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                      <span className="px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded">
                        Hemat {product.discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  per {product.unit}
                </p>
              </div>

              {/* Quantity & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#5a6c5b]">
                    Jumlah:
                  </span>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors rounded-l-lg"
                      disabled={product.stock === 0}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.min(
                            product.stock,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      className="w-12 h-8 text-center text-sm font-medium border-x border-gray-200 focus:outline-none"
                      disabled={product.stock === 0}
                    />
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors rounded-r-lg"
                      disabled={product.stock === 0}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    ={" "}
                    <span className="font-semibold text-[#5a6c5b]">
                      Rp{" "}
                      {(product.finalPrice * quantity).toLocaleString("id-ID")}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Buttons - With Animation */}
              <div className="flex gap-2 mb-4">
                <button
                  className="group flex-1 py-2.5 px-4 bg-[#A3AF87] text-white rounded-lg font-medium hover:bg-[#95a17a] hover:shadow-lg hover:shadow-[#A3AF87]/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  disabled={product.stock === 0}
                >
                  <svg
                    className="h-5 w-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Keranjang
                </button>
                <button
                  onClick={() => router.push("/market/checkout")}
                  className="group flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  disabled={product.stock === 0}
                >
                  <svg
                    className="h-5 w-5 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                    />
                  </svg>
                  Beli Sekarang
                </button>
              </div>

              {/* Seller Info - Compact */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A3AF87] to-[#5a6c5b] flex items-center justify-center">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm text-[#5a6c5b]">
                          {product.farmer.farmName}
                        </p>
                        {product.farmer.isVerified && (
                          <svg
                            className="h-4 w-4 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <svg
                          className="h-3 w-3 fill-yellow-500"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="font-medium">
                          {product.farmer.rating.toFixed(1)}
                        </span>
                        {product.farmer.location && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>{product.farmer.location}</span>
                          </>
                        )}
                        <span className="text-gray-300">•</span>
                        <span>
                          Bergabung {formatJoinDate(product.farmer.joinedAt)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {product.farmer.totalProducts} Produk
                      </div>
                    </div>
                  </div>
                  {product.farmer.phone ? (
                    <a
                      href={`https://wa.me/${product.farmer.phone
                        .replace(/^0/, "62")
                        .replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Halo, saya tertarik dengan produk ${product.name} di EcoMaggie`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-full hover:bg-green-600 transition-colors"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                      Chat
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-300 text-gray-500 text-xs font-medium rounded-full cursor-not-allowed"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                      Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs - Compact */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          {/* Tabs Header - Without Specifications */}
          <div className="flex gap-4 border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-2.5 px-1 text-sm font-medium transition-all relative ${
                activeTab === "description"
                  ? "text-[#5a6c5b]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Deskripsi
              {activeTab === "description" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A3AF87] rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2.5 px-1 text-sm font-medium transition-all relative ${
                activeTab === "reviews"
                  ? "text-[#5a6c5b]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Ulasan ({product.totalReviews})
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A3AF87] rounded-full"></div>
              )}
            </button>
          </div>

          {/* Tabs Content */}
          <div>
            {activeTab === "description" && (
              <div>
                {product.description ? (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Belum ada deskripsi untuk produk ini.
                  </p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                {/* Rating Summary - Compact */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-[#A3AF87]/10 to-transparent">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#5a6c5b]">
                      {reviewsData?.averageRating?.toFixed(1) ||
                        product.rating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i <
                            Math.floor(
                              reviewsData?.averageRating || product.rating
                            )
                              ? "fill-yellow-400"
                              : "fill-gray-300"
                          }`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {reviewsData?.total || product.totalReviews} ulasan
                    </p>
                  </div>
                  <div className="flex-1 space-y-1 w-full sm:w-auto">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count =
                        reviewsData?.ratingDistribution?.[star] || 0;
                      const total = reviewsData?.total || 1;
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-8">
                            {star} ★
                          </span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-6">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Write Review Form - With Photo Upload */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-semibold text-sm text-[#5a6c5b] mb-3">
                    Tulis Ulasan
                  </h4>

                  {/* Rating Select */}
                  <div className="mb-3">
                    <label className="text-xs text-gray-600 mb-1 block">
                      Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <svg
                            className={`h-6 w-6 transition-colors ${
                              star <= reviewRating
                                ? "fill-yellow-400"
                                : "fill-gray-300 hover:fill-yellow-200"
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="mb-3">
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Bagikan pengalaman Anda dengan produk ini..."
                      className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#A3AF87] focus:ring-1 focus:ring-[#A3AF87] focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Photo Upload */}
                  <div className="mb-3">
                    <label className="text-xs text-gray-600 mb-1.5 block">
                      Upload Foto (Maks 5)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {reviewImages.map((img, index) => (
                        <div
                          key={index}
                          className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={img}
                            alt={`Review ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeReviewImage(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {reviewImages.length < 5 && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#A3AF87] hover:text-[#A3AF87] transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span className="text-[10px]">Foto</span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || !reviewText.trim()}
                    className="w-full py-2 bg-[#A3AF87] text-white text-sm font-medium rounded-lg hover:bg-[#95a17a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReview ? "Mengirim..." : "Kirim Ulasan"}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    * Anda hanya dapat memberikan ulasan setelah membeli produk
                    ini
                  </p>
                </div>

                {/* Reviews List - Compact with Photo Support */}
                <div className="space-y-3">
                  {isLoadingReviews ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#A3AF87] border-t-transparent"></div>
                      <span className="ml-2 text-sm text-gray-500">
                        Memuat ulasan...
                      </span>
                    </div>
                  ) : reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
                    reviewsData.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {review.authorAvatar ? (
                              <img
                                src={review.authorAvatar}
                                alt={review.author}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A3AF87] to-[#5a6c5b] flex items-center justify-center text-white text-sm font-medium">
                                {review.author.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm text-[#5a6c5b]">
                                {review.author}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                          </div>
                          {review.isVerified && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full flex items-center gap-1">
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
                              Terverifikasi
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? "fill-yellow-400"
                                  : "fill-gray-300"
                              }`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>

                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {review.images.map((img, imgIndex) => (
                              <button
                                key={imgIndex}
                                onClick={() => setPreviewImage(img)}
                                className="w-14 h-14 rounded-md overflow-hidden border border-gray-200 hover:border-[#A3AF87] transition-colors"
                              >
                                <img
                                  src={img}
                                  alt={`Review photo ${imgIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <svg
                        className="w-12 h-12 text-gray-300 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <p className="text-sm text-gray-500">
                        Belum ada ulasan untuk produk ini
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Jadilah yang pertama memberikan ulasan!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
