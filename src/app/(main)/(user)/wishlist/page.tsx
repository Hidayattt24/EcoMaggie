"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Package,
  Star,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getUserWishlist,
  removeFromWishlist,
  type WishlistItem,
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

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch wishlist data
  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getUserWishlist();
      if (result.success && result.data) {
        setWishlistItems(result.data.items);
      } else if (result.error === "UNAUTHORIZED") {
        Swal.fire({
          icon: "warning",
          title: "Login Diperlukan",
          text: "Silakan login untuk melihat wishlist Anda",
          confirmButtonColor: "#A3AF87",
          confirmButtonText: "Login",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/login");
          }
        });
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoveFromWishlist = async (productId: string) => {
    const item = wishlistItems.find((i) => i.productId === productId);

    const result = await Swal.fire({
      icon: "question",
      title: "Hapus dari Wishlist?",
      text: `Hapus ${item?.name || "produk ini"} dari wishlist?`,
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setRemovingId(productId);
    try {
      const response = await removeFromWishlist(productId);
      if (response.success) {
        setWishlistItems((prev) =>
          prev.filter((i) => i.productId !== productId)
        );
        setSelectedItems((prev) => prev.filter((id) => id !== productId));
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Produk dihapus dari wishlist",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: response.message,
          confirmButtonColor: "#A3AF87",
        });
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan",
        confirmButtonColor: "#A3AF87",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const toggleSelectItem = (productId: string) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter((id) => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map((item) => item.productId));
    }
  };

  const addSelectedToCart = () => {
    const selectedProducts = wishlistItems.filter((item) =>
      selectedItems.includes(item.productId)
    );
    if (selectedProducts.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Produk",
        text: "Pilih produk terlebih dahulu!",
        confirmButtonColor: "#A3AF87",
      });
      return;
    }
    // TODO: Implement add to cart functionality
    Swal.fire({
      icon: "info",
      title: "Coming Soon",
      text: `${selectedProducts.length} produk akan ditambahkan ke keranjang`,
      confirmButtonColor: "#A3AF87",
    });
  };

  const checkoutSelected = () => {
    const selectedProducts = wishlistItems.filter((item) =>
      selectedItems.includes(item.productId)
    );
    if (selectedProducts.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Produk",
        text: "Pilih produk terlebih dahulu!",
        confirmButtonColor: "#A3AF87",
      });
      return;
    }
    // TODO: Redirect to checkout page with selected products
    router.push("/market/checkout");
  };

  const totalValue = wishlistItems.reduce(
    (sum, item) => sum + item.finalPrice,
    0
  );

  const selectedTotalValue = wishlistItems
    .filter((item) => selectedItems.includes(item.productId))
    .reduce((sum, item) => sum + item.finalPrice, 0);

  const inStockCount = wishlistItems.filter((item) => item.stock > 0).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A3AF87]/20 via-white to-[#A3AF87]/10 pb-6 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3AF87] mb-4"></div>
            <p className="text-gray-600">Memuat wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A3AF87]/20 via-white to-[#A3AF87]/10 pb-6 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button - Mobile Only */}
        <button
          onClick={() => router.back()}
          className="lg:hidden flex items-center gap-2 mb-4 text-[#5a6c5b] hover:text-[#5a6c5b]/80 transition-colors"
        >
          <div className="p-2 bg-white border-2 border-[#A3AF87]/30 rounded-lg hover:bg-[#A3AF87]/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <span className="font-semibold text-sm">Kembali</span>
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#A3AF87] to-[#95a17a] rounded-xl shadow-lg">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#5a6c5b]">
                  Wishlist Saya
                </h1>
                <p className="text-xs sm:text-sm text-[#5a6c5b]/70 font-medium mt-0.5">
                  {wishlistItems.length} produk tersimpan
                </p>
              </div>
            </div>

            {wishlistItems.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <div className="px-4 py-2.5 bg-gradient-to-br from-[#A3AF87]/20 to-[#A3AF87]/10 border-2 border-[#A3AF87]/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#5a6c5b]" />
                    <div className="text-left">
                      <p className="text-[10px] text-[#5a6c5b]/70 font-bold">
                        Stok Tersedia
                      </p>
                      <p className="text-sm font-bold text-[#5a6c5b]">
                        {inStockCount} produk
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2.5 bg-gradient-to-br from-[#A3AF87]/20 to-[#A3AF87]/10 border-2 border-[#A3AF87]/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#5a6c5b]" />
                    <div className="text-left">
                      <p className="text-[10px] text-[#5a6c5b]/70 font-bold">
                        Total Nilai
                      </p>
                      <p className="text-sm font-bold text-[#5a6c5b]">
                        Rp {totalValue.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Select All & Actions Bar */}
          {wishlistItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gradient-to-r from-[#A3AF87]/10 to-[#A3AF87]/5 border-2 border-[#A3AF87]/20 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === wishlistItems.length}
                      onChange={toggleSelectAll}
                      className="peer w-5 h-5 rounded-md border-2 border-[#A3AF87]/50 checked:bg-[#A3AF87] checked:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/30 cursor-pointer transition-all appearance-none"
                    />
                    <svg
                      className="absolute top-0.5 left-0.5 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-[#5a6c5b] group-hover:text-[#5a6c5b]/80">
                    Pilih Semua
                  </span>
                </label>
                {selectedItems.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-full text-xs font-bold shadow-md"
                  >
                    <span>{selectedItems.length} dipilih</span>
                  </motion.div>
                )}
              </div>

              {selectedItems.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="hidden sm:flex items-center px-3 py-2 bg-white border-2 border-[#A3AF87]/30 rounded-lg">
                    <span className="text-xs text-[#5a6c5b]/70 font-medium mr-2">
                      Total:
                    </span>
                    <span className="text-sm font-bold text-[#5a6c5b]">
                      Rp {selectedTotalValue.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <button
                    onClick={addSelectedToCart}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-[#A3AF87] text-[#5a6c5b] rounded-lg font-bold text-sm hover:bg-[#A3AF87]/10 transition-all"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      Tambah ke Keranjang
                    </span>
                    <span className="sm:hidden">Keranjang</span>
                  </button>
                  <button
                    onClick={checkoutSelected}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-[#A3AF87]/30 transition-all"
                  >
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Bayar Sekarang</span>
                    <span className="sm:hidden">Bayar</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {wishlistItems.length === 0 ? (
            /* Empty State */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16 sm:py-20"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#A3AF87]/20 to-[#A3AF87]/10 rounded-full flex items-center justify-center mb-6 sm:mb-8 border-4 border-[#A3AF87]/20">
                <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-[#A3AF87]/50" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#5a6c5b] mb-2 sm:mb-3 text-center">
                Wishlist Anda Kosong
              </h2>
              <p className="text-sm sm:text-base text-[#5a6c5b]/70 mb-6 sm:mb-8 text-center max-w-md px-4">
                Simpan produk favorit Anda untuk memudahkan pembelian di
                kemudian hari
              </p>
              <Link
                href="/market/products"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-xl font-bold text-sm sm:text-base hover:shadow-xl hover:shadow-[#A3AF87]/30 transition-all"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                Jelajahi Produk
              </Link>
            </motion.div>
          ) : (
            /* Wishlist Items Grid */
            <motion.div
              key="items"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
            >
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-2 ${
                    selectedItems.includes(item.productId)
                      ? "border-[#A3AF87] shadow-md shadow-[#A3AF87]/20"
                      : "border-gray-100"
                  } ${removingId === item.productId ? "opacity-50" : ""}`}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-[#A3AF87]/10 to-white overflow-hidden">
                    {/* Checkbox - Top Left */}
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.productId)}
                          onChange={() => toggleSelectItem(item.productId)}
                          onClick={(e) => e.stopPropagation()}
                          className="peer w-5 h-5 rounded-md border-2 border-white checked:bg-[#A3AF87] checked:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/50 cursor-pointer transition-all shadow-lg appearance-none bg-white/95 hover:scale-110"
                        />
                        <svg
                          className="absolute top-0.5 left-0.5 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </label>
                    </div>

                    <Link href={`/market/products/${item.slug}`}>
                      <img
                        src={item.images[0] || "/assets/dummy/magot.png"}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                    </Link>

                    {/* Category Badge */}
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-[#A3AF87] text-white text-[9px] font-semibold rounded-full pointer-events-none">
                      {categoryDisplayNames[item.category] || item.category}
                    </div>

                    {/* Discount Badge */}
                    {item.discountPercent > 0 && (
                      <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold rounded-full shadow-lg animate-pulse pointer-events-none">
                        🔥 DISKON {item.discountPercent}%
                      </div>
                    )}

                    {/* Stock Badge */}
                    {item.stock === 0 && (
                      <div className="absolute top-8 right-1.5 px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full shadow-md">
                        Habis
                      </div>
                    )}

                    {/* Remove Button - Bottom Right */}
                    <button
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                      disabled={removingId === item.productId}
                      className="absolute bottom-1.5 right-1.5 w-6 h-6 bg-white/95 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg z-10 disabled:opacity-50"
                      title="Hapus dari wishlist"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-2">
                    {/* Product Name */}
                    <h3 className="font-bold text-xs text-[#5a6c5b] mb-0.5 line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Farmer Name */}
                    <p className="text-[9px] text-[#5a6c5b]/70 mb-1.5 line-clamp-1">
                      {item.farmer.farmName}
                      {item.farmer.isVerified && (
                        <span className="ml-1 text-blue-500">✓</span>
                      )}
                    </p>

                    {/* Rating & Stock */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-semibold text-gray-800">
                          {item.rating.toFixed(1)}
                        </span>
                        <span className="text-[9px] text-gray-500">
                          ({item.totalReviews})
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-500">
                        {item.stock} {item.unit}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-1.5">
                      {item.discountPercent > 0 ? (
                        <div className="space-y-0.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-[#5a6c5b]">
                              Rp {item.finalPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[9px] text-gray-500">
                              /{item.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-gray-400 line-through">
                              Rp {item.price.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[8px] px-1 py-0.5 bg-red-100 text-red-600 font-bold rounded">
                              -{item.discountPercent}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-sm font-bold text-[#5a6c5b]">
                            Rp {item.price.toLocaleString("id-ID")}
                          </span>
                          <span className="text-[9px] text-gray-500">
                            /{item.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-1">
                      <Link
                        href={`/market/products/${item.slug}`}
                        className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-md font-semibold text-[10px] hover:bg-gray-200 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        Lihat
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Banner */}
        {wishlistItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-[#A3AF87]/20 to-[#A3AF87]/10 border-2 border-[#A3AF87]/30 rounded-xl sm:rounded-2xl"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 bg-[#A3AF87] rounded-lg flex-shrink-0">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#5a6c5b] mb-1">
                  Tips Wishlist
                </h3>
                <p className="text-xs sm:text-sm text-[#5a6c5b]/70 font-medium">
                  Pantau terus wishlist Anda! Kami akan memberitahu jika ada
                  perubahan harga atau stok produk favorit Anda.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
