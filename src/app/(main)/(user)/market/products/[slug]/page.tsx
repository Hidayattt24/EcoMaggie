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
  checkProductPurchaseStatus,
  type MarketProductDetail,
  type ProductReview,
  type ProductReviewsResponse,
  type PurchaseStatus,
} from "@/lib/api/product.actions";
import { addToCart } from "@/lib/api/cart.actions";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import { ProductDetailSkeleton } from "@/components/ui/Skeleton";

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
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30),
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
  const { toast, success, error: showError, warning, hideToast } = useToast();
  const [slug, setSlug] = useState<string>("");
  const [product, setProduct] = useState<MarketProductDetail | null>(null);
  const [reviewsData, setReviewsData] = useState<ProductReviewsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description",
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

  // Cart states
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Purchase status for review eligibility
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus | null>(
    null,
  );
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(false);

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

  // Check purchase status when switching to reviews tab
  useEffect(() => {
    async function checkPurchase() {
      if (!product?.id || activeTab !== "reviews") return;
      if (purchaseStatus !== null) return; // Already checked

      setIsCheckingPurchase(true);
      try {
        const result = await checkProductPurchaseStatus(product.id);
        if (result.success && result.data) {
          setPurchaseStatus(result.data);
        }
      } catch (err) {
        console.error("Error checking purchase status:", err);
      } finally {
        setIsCheckingPurchase(false);
      }
    }
    checkPurchase();
  }, [product?.id, activeTab, purchaseStatus]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product?.id) return;

    setIsAddingToCart(true);
    try {
      const result = await addToCart(product.id, quantity);

      if (result.success) {
        success(
          "Berhasil!",
          result.message || `${product.name} berhasil ditambahkan ke keranjang`,
        );
        // Reset quantity after adding to cart
        setQuantity(1);
      } else if (result.error === "Unauthorized") {
        warning(
          "Login Diperlukan",
          "Silakan login untuk menambahkan ke keranjang",
        );
      } else {
        showError("Gagal", result.message || "Gagal menambahkan ke keranjang");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showError("Terjadi Kesalahan", "Gagal menambahkan ke keranjang");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle toggle wishlist
  const handleToggleWishlist = async () => {
    if (!product?.id) return;

    setIsTogglingWishlist(true);
    try {
      const result = await toggleWishlist(product.id);

      if (result.success) {
        setIsWishlisted(!isWishlisted);
        success(
          result.message.includes("ditambahkan")
            ? "Ditambahkan ke Wishlist!"
            : "Dihapus dari Wishlist",
          result.message,
        );
      } else if (result.error === "UNAUTHORIZED") {
        warning(
          "Login Diperlukan",
          "Silakan login untuk menambahkan ke wishlist",
        );
      } else {
        showError("Gagal", result.message || "Gagal mengupdate wishlist");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      showError("Terjadi Kesalahan", "Gagal mengupdate wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!product?.id) return;
    if (!reviewText.trim()) {
      warning("Ulasan Kosong", "Silakan tulis ulasan Anda");
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
        success("Berhasil!", "Terima kasih atas ulasan Anda!");
        // Reset form
        setReviewText("");
        setReviewRating(5);
        setReviewImages([]);
        // Refresh reviews
        fetchReviews();
      } else if (result.error === "UNAUTHORIZED") {
        warning("Login Diperlukan", "Silakan login untuk memberikan ulasan");
      } else {
        showError("Gagal", result.message || "Gagal mengirim ulasan");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showError("Terjadi Kesalahan", "Gagal mengirim ulasan");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Continue with rest of handlers that had Swal.fire calls
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Validate file count
    if (reviewImages.length + files.length > 3) {
      warning("Maksimal 3 Foto", "Anda hanya dapat mengupload maksimal 3 foto");
      return;
    }

    // Process each file
    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showError("File Tidak Valid", "Hanya file gambar yang diperbolehkan");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("File Terlalu Besar", "Ukuran file maksimal 5MB");
        return;
      }

      // Read and add to preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReviewImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReviewImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ProductDetailSkeleton />
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-2xl hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all"
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
    <>
      {/* Toast Notification */}
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

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
            className="inline-flex items-center gap-1.5 mb-4 text-sm text-[#435664] hover:text-[#303646] transition-colors"
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
            {/* Left: Images - Modern Design */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-4 border-2 border-[#435664]/10">
                {/* Main Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-gradient-to-br from-gray-100 to-gray-50 shadow-inner border-2 border-[#435664]/5 group">
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-500 ease-out"
                    onClick={() =>
                      setPreviewImage(productImages[selectedImage])
                    }
                  />
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  {/* Zoom Icon Hint */}
                  <div className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-lg">
                    <svg
                      className="w-4 h-4 text-[#435664]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                      />
                    </svg>
                  </div>

                  {/* Discount Badge */}
                  {product.discountPercent > 0 && (
                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-lg shadow-lg animate-pulse">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span>-{product.discountPercent}%</span>
                      </div>
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={handleToggleWishlist}
                    disabled={isTogglingWishlist}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/wishlist border-2 border-white/50"
                  >
                    <svg
                      className={`h-5 w-5 transition-all ${
                        isWishlisted
                          ? "text-red-500 fill-red-500 scale-110"
                          : "text-gray-400 group-hover/wishlist:text-red-500 group-hover/wishlist:scale-110"
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
                  <div className="grid grid-cols-5 gap-2">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                          selectedImage === index
                            ? "border-[#435664] shadow-md scale-105 ring-2 ring-[#435664]/20"
                            : "border-gray-200 hover:border-[#a3af87] hover:shadow-sm hover:scale-105"
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

            {/* Right: Product Info - Modern & Clean */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border-2 border-[#435664]/10">
                {/* Product Name & Category */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white shadow-sm">
                      {categoryDisplay}
                    </span>
                    {product.farmer.isVerified && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                        <svg
                          className="h-3.5 w-3.5"
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#303646] leading-tight">
                    {product.name}
                  </h1>
                </div>

                {/* Stats Cards - Modern Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                  {/* Rating Card */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-3 border border-yellow-200/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg
                        className="h-4 w-4 fill-yellow-500"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-lg font-bold text-[#303646]">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {product.totalReviews} ulasan
                    </p>
                  </div>

                  {/* Sales Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg
                        className="h-4 w-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span className="text-lg font-bold text-[#303646]">
                        {product.totalSold}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Terjual</p>
                  </div>

                  {/* Stock Card */}
                  <div className={`rounded-xl p-3 border ${
                    product.stock > 10
                      ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50"
                      : product.stock > 0
                        ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50"
                        : "bg-gradient-to-br from-red-50 to-pink-50 border-red-200/50"
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg
                        className={`h-4 w-4 ${
                          product.stock > 10
                            ? "text-emerald-600"
                            : product.stock > 0
                              ? "text-orange-600"
                              : "text-red-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <span className={`text-lg font-bold ${
                        product.stock > 10
                          ? "text-emerald-600"
                          : product.stock > 0
                            ? "text-orange-600"
                            : "text-red-600"
                      }`}>
                        {product.stock}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{product.unit}</p>
                  </div>
                </div>

                {/* Price Section - Prominent */}
                <div className="mb-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#fdf8d4] to-[#f5efc0] border-2 border-[#435664]/20 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#435664]">Harga</span>
                    {product.discountPercent > 0 && (
                      <span className="px-2.5 py-1 text-xs font-bold bg-red-500 text-white rounded-lg shadow-sm animate-pulse">
                        Hemat {product.discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-bold text-[#303646]">
                      Rp {product.finalPrice.toLocaleString("id-ID")}
                    </span>
                    {product.discountPercent > 0 && (
                      <span className="text-lg text-gray-400 line-through">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#435664] mt-1 font-medium">
                    per {product.unit}
                  </p>
                </div>

                {/* Quantity Selector - Enhanced */}
                <div className="mb-5">
                  <div className="bg-white p-3 sm:p-5 rounded-2xl border-2 border-[#435664]/20 shadow-sm">
                    <label className="block text-xs sm:text-sm font-bold text-[#303646] mb-2 sm:mb-3">
                      Jumlah Pembelian
                    </label>

                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border-2 border-[#435664]/30 rounded-lg sm:rounded-xl overflow-hidden bg-[#fdf8d4] shadow-sm">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center text-[#435664] hover:bg-[#a3af87] hover:text-white active:bg-[#303646] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                          disabled={product.stock === 0}
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
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
                                Math.max(1, parseInt(e.target.value) || 1),
                              ),
                            )
                          }
                          className="w-12 h-9 sm:w-16 sm:h-12 text-center text-base sm:text-xl font-bold border-x-2 border-[#435664]/30 focus:outline-none focus:bg-white text-[#303646] bg-[#fdf8d4]"
                          disabled={product.stock === 0}
                        />
                        <button
                          onClick={() =>
                            setQuantity(Math.min(product.stock, quantity + 1))
                          }
                          className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center text-[#435664] hover:bg-[#a3af87] hover:text-white active:bg-[#303646] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                          disabled={product.stock === 0}
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Total Price Display */}
                      <div className="flex-1 bg-gradient-to-r from-[#fdf8d4] to-[#f5efc0] rounded-lg sm:rounded-xl p-2 sm:p-4 border border-[#435664]/20">
                        <div className="text-[10px] sm:text-xs text-[#435664] mb-0.5 sm:mb-1 font-semibold">Total Harga</div>
                        <div className="text-sm sm:text-2xl font-bold text-[#303646]">
                          Rp {(product.finalPrice * quantity).toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 sm:mt-3 flex items-center gap-2 text-xs sm:text-sm">
                      <svg
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#435664] flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-[#435664] font-medium">
                        Stok tersedia: <span className="font-bold">{product.stock} {product.unit}</span>
                      </span>
                    </div>
                  </div>
                </div>
                {/* Action Buttons - Modern & Prominent */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="group w-full sm:flex-1 py-4 px-5 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-[#a3af87]/40 hover:-translate-y-1 active:translate-y-0 active:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    disabled={product.stock === 0 || isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Menambahkan...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-5 w-5 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span>Tambah ke Keranjang</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const checkoutUrl = `/market/checkout?productId=${product.id}&qty=${quantity}`;
                      router.push(checkoutUrl);
                    }}
                    className="group w-full sm:flex-1 py-4 px-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-1 active:translate-y-0 active:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    disabled={product.stock === 0}
                  >
                    <svg
                      className="h-5 w-5 group-hover:scale-110 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    Beli Sekarang
                  </button>
                </div>

                {/* Seller Info - Modern Card */}
                <div className="mt-5 pt-5 border-t-2 border-gray-100">
                  <div className="bg-gradient-to-br from-[#fdf8d4] to-white rounded-2xl p-4 border-2 border-[#435664]/10 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      {/* Seller Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#435664] to-[#303646] flex items-center justify-center shadow-lg ring-2 ring-white">
                          <svg
                            className="h-7 w-7 text-white"
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
                      </div>

                      {/* Seller Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-base text-[#303646] truncate">
                            {product.farmer.farmName}
                          </h3>
                          {product.farmer.isVerified && (
                            <svg
                              className="h-5 w-5 text-blue-500 flex-shrink-0"
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
                        
                        {/* Seller Stats */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#435664] mb-2">
                          <div className="flex items-center gap-1">
                            <svg
                              className="h-3.5 w-3.5 fill-yellow-500"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="font-semibold">{product.farmer.rating.toFixed(1)}</span>
                          </div>
                          {product.farmer.location && (
                            <>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center gap-1">
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span className="truncate">{product.farmer.location}</span>
                              </div>
                            </>
                          )}
                          <span className="text-gray-300">•</span>
                          <span>Bergabung {formatJoinDate(product.farmer.joinedAt)}</span>
                        </div>

                        <div className="text-xs text-[#435664] font-medium">
                          {product.farmer.totalProducts} Produk
                        </div>
                      </div>

                      {/* Chat Button */}
                      {product.farmer.phone ? (
                        <a
                          href={`https://wa.me/${product.farmer.phone
                            .replace(/^0/, "62")
                            .replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Halo, saya tertarik dengan produk ${product.name} di EcoMaggie`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/30 transition-all active:scale-95"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                          </svg>
                          <span className="hidden sm:inline">Chat</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-gray-300 text-gray-500 text-sm font-bold rounded-xl cursor-not-allowed"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                          </svg>
                          <span className="hidden sm:inline">Chat</span>
                        </button>
                      )}
                    </div>
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
                                reviewsData?.averageRating || product.rating,
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
                        const percentage =
                          total > 0 ? (count / total) * 100 : 0;
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

                  {/* Write Review Form - Modern Design */}
                  <div
                    className={`p-5 rounded-xl border-2 transition-all ${
                      purchaseStatus?.canReview
                        ? "border-[#A3AF87] bg-gradient-to-br from-[#A3AF87]/5 to-white shadow-sm"
                        : "border-gray-200 bg-gray-50/50"
                    }`}
                  >
                    {isCheckingPurchase ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#A3AF87] border-t-transparent mr-2"></div>
                        <span className="text-sm text-gray-500">
                          Memeriksa status pembelian...
                        </span>
                      </div>
                    ) : purchaseStatus?.canReview ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-[#A3AF87] flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#5a6c5b]">
                              Tulis Ulasan Anda
                            </h4>
                            <p className="text-xs text-[#5a6c5b]/70">
                              Bagikan pengalaman Anda dengan produk ini
                            </p>
                          </div>
                        </div>

                        {/* Rating Select */}
                        <div className="mb-4">
                          <label className="text-sm font-medium text-[#5a6c5b] mb-2 block">
                            Berikan Rating
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className="focus:outline-none transform hover:scale-110 transition-transform"
                              >
                                <svg
                                  className={`h-8 w-8 transition-colors ${
                                    star <= reviewRating
                                      ? "fill-yellow-400 drop-shadow-sm"
                                      : "fill-gray-300 hover:fill-yellow-200"
                                  }`}
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              </button>
                            ))}
                            <span className="ml-2 text-sm text-[#5a6c5b] self-center font-medium">
                              {reviewRating === 5
                                ? "Sangat Bagus!"
                                : reviewRating === 4
                                  ? "Bagus"
                                  : reviewRating === 3
                                    ? "Cukup"
                                    : reviewRating === 2
                                      ? "Kurang"
                                      : "Buruk"}
                            </span>
                          </div>
                        </div>

                        {/* Review Text */}
                        <div className="mb-4">
                          <label className="text-sm font-medium text-[#5a6c5b] mb-2 block">
                            Ulasan Anda
                          </label>
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Ceritakan pengalaman Anda menggunakan produk ini..."
                            className="w-full p-3 text-sm border-2 border-gray-200 rounded-xl focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none resize-none transition-all text-[#5a6c5b] placeholder:text-gray-400"
                            rows={4}
                          />
                        </div>

                        {/* Photo Upload */}
                        <div className="mb-4">
                          <label className="text-sm font-medium text-[#5a6c5b] mb-2 block">
                            Tambah Foto{" "}
                            <span className="text-gray-400 font-normal">
                              (Opsional, maks 3)
                            </span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {reviewImages.map((img, index) => (
                              <div
                                key={index}
                                className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#A3AF87]/30 shadow-sm"
                              >
                                <img
                                  src={img}
                                  alt={`Review ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => removeReviewImage(index)}
                                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
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
                            {reviewImages.length < 3 && (
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#A3AF87] hover:text-[#A3AF87] hover:bg-[#A3AF87]/5 transition-all"
                              >
                                <svg
                                  className="w-6 h-6"
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
                                <span className="text-xs mt-1">Foto</span>
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
                          className="w-full py-3 bg-[#A3AF87] text-white font-semibold rounded-xl hover:bg-[#95a17a] hover:shadow-lg hover:shadow-[#A3AF87]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
                        >
                          {isSubmittingReview ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Mengirim...</span>
                            </>
                          ) : (
                            <>
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
                                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                              </svg>
                              <span>Kirim Ulasan</span>
                            </>
                          )}
                        </button>
                      </>
                    ) : purchaseStatus?.hasReviewed ? (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-[#5a6c5b] mb-1">
                          Terima Kasih!
                        </h4>
                        <p className="text-sm text-gray-500">
                          Anda sudah memberikan ulasan untuk produk ini
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-[#5a6c5b] mb-1">
                          Beli Dulu, Baru Review
                        </h4>
                        <p className="text-sm text-gray-500 mb-3">
                          Anda hanya dapat memberikan ulasan setelah membeli
                          produk ini
                        </p>
                        <button
                          onClick={() => {
                            const checkoutUrl = `/market/checkout?productId=${product.id}&qty=1`;
                            router.push(checkoutUrl);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#A3AF87] text-white text-sm font-medium rounded-lg hover:bg-[#95a17a] transition-colors"
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
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          Beli Sekarang
                        </button>
                      </div>
                    )}
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
                    ) : reviewsData?.reviews &&
                      reviewsData.reviews.length > 0 ? (
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
    </>
  );
}
