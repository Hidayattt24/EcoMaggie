"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Package,
  Star,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface WishlistItem {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  category: string;
  discount?: number;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 1,
      slug: "maggot-bsf-premium",
      name: "Maggot BSF Premium",
      description:
        "Maggot Black Soldier Fly berkualitas tinggi untuk pakan ternak",
      price: 45000,
      unit: "kg",
      rating: 4.8,
      reviews: 124,
      stock: 150,
      image: "/assets/dummy/magot.png",
      category: "Premium",
      discount: 15,
    },
    {
      id: 2,
      slug: "maggot-bsf-organik",
      name: "Maggot BSF Organik",
      description: "100% organik tanpa bahan kimia, cocok untuk budidaya lele",
      price: 38000,
      unit: "kg",
      rating: 4.9,
      reviews: 89,
      stock: 200,
      image: "/assets/dummy/magot.png",
      category: "Organik",
    },
    {
      id: 3,
      slug: "maggot-bsf-kering",
      name: "Maggot BSF Kering",
      description: "Maggot kering dengan nutrisi lengkap, tahan lama",
      price: 65000,
      unit: "kg",
      rating: 4.7,
      reviews: 56,
      stock: 80,
      image: "/assets/dummy/magot.png",
      category: "Kering",
      discount: 20,
    },
    {
      id: 4,
      slug: "maggot-bsf-fresh",
      name: "Maggot BSF Fresh",
      description: "Maggot segar langsung dari budidaya, protein tinggi",
      price: 42000,
      unit: "kg",
      rating: 4.9,
      reviews: 178,
      stock: 120,
      image: "/assets/dummy/magot.png",
      category: "Fresh",
    },
  ]);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const removeFromWishlist = (id: number) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id));
    setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
  };

  const toggleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map((item) => item.id));
    }
  };

  const addSelectedToCart = () => {
    const selectedProducts = wishlistItems.filter((item) =>
      selectedItems.includes(item.id)
    );
    if (selectedProducts.length === 0) {
      alert("Pilih produk terlebih dahulu!");
      return;
    }
    alert(
      `${
        selectedProducts.length
      } produk ditambahkan ke keranjang:\n${selectedProducts
        .map((p) => p.name)
        .join("\n")}`
    );
  };

  const checkoutSelected = () => {
    const selectedProducts = wishlistItems.filter((item) =>
      selectedItems.includes(item.id)
    );
    if (selectedProducts.length === 0) {
      alert("Pilih produk terlebih dahulu!");
      return;
    }
    alert(
      `Checkout ${selectedProducts.length} produk:\n${selectedProducts
        .map((p) => p.name)
        .join("\n")}`
    );
    // TODO: Redirect to checkout page
  };

  const totalValue = wishlistItems.reduce((sum, item) => {
    const finalPrice = item.discount
      ? Math.round(item.price * (1 - item.discount / 100))
      : item.price;
    return sum + finalPrice;
  }, 0);

  const selectedTotalValue = wishlistItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => {
      const finalPrice = item.discount
        ? Math.round(item.price * (1 - item.discount / 100))
        : item.price;
      return sum + finalPrice;
    }, 0);

  const inStockCount = wishlistItems.filter((item) => item.stock > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#2D5016] to-[#2D5016]/80 rounded-xl shadow-lg">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#2D5016]">
                  Wishlist Saya
                </h1>
                <p className="text-xs sm:text-sm text-[#2D5016]/70 font-medium mt-0.5">
                  {wishlistItems.length} produk tersimpan
                </p>
              </div>
            </div>

            {wishlistItems.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <div className="px-4 py-2.5 bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-[#2D5016]/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#2D5016]" />
                    <div className="text-left">
                      <p className="text-[10px] text-[#2D5016]/70 font-bold">
                        Stok Tersedia
                      </p>
                      <p className="text-sm font-bold text-[#2D5016]">
                        {inStockCount} produk
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2.5 bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-[#2D5016]/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#2D5016]" />
                    <div className="text-left">
                      <p className="text-[10px] text-[#2D5016]/70 font-bold">
                        Total Nilai
                      </p>
                      <p className="text-sm font-bold text-[#2D5016]">
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
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gradient-to-r from-[#2D5016]/5 to-green-50/50 border-2 border-[#2D5016]/10 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === wishlistItems.length}
                      onChange={toggleSelectAll}
                      className="peer w-5 h-5 rounded-md border-2 border-[#2D5016]/30 checked:bg-[#2D5016] checked:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/30 cursor-pointer transition-all appearance-none"
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
                  <span className="text-sm font-bold text-[#2D5016] group-hover:text-[#2D5016]/80">
                    Pilih Semua
                  </span>
                </label>
                {selectedItems.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-full text-xs font-bold shadow-md"
                  >
                    <span>{selectedItems.length} dipilih</span>
                  </motion.div>
                )}
              </div>

              {selectedItems.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="hidden sm:flex items-center px-3 py-2 bg-white border-2 border-[#2D5016]/20 rounded-lg">
                    <span className="text-xs text-[#2D5016]/70 font-medium mr-2">
                      Total:
                    </span>
                    <span className="text-sm font-bold text-[#2D5016]">
                      Rp {selectedTotalValue.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <button
                    onClick={addSelectedToCart}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-[#2D5016] text-[#2D5016] rounded-lg font-bold text-sm hover:bg-green-50 transition-all"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      Tambah ke Keranjang
                    </span>
                    <span className="sm:hidden">Keranjang</span>
                  </button>
                  <button
                    onClick={checkoutSelected}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-[#2D5016]/30 transition-all"
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
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center mb-6 sm:mb-8 border-4 border-[#2D5016]/10">
                <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-[#2D5016]/30" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D5016] mb-2 sm:mb-3 text-center">
                Wishlist Anda Kosong
              </h2>
              <p className="text-sm sm:text-base text-[#2D5016]/70 mb-6 sm:mb-8 text-center max-w-md px-4">
                Simpan produk favorit Anda untuk memudahkan pembelian di
                kemudian hari
              </p>
              <Link
                href="/market/products"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-xl font-bold text-sm sm:text-base hover:shadow-xl hover:shadow-[#2D5016]/30 transition-all"
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
                  transition={{ delay: index * 0.1 }}
                  className={`group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-2 ${
                    selectedItems.includes(item.id)
                      ? "border-[#2D5016] shadow-md shadow-[#2D5016]/20"
                      : "border-gray-100"
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-green-50 to-white overflow-hidden">
                    {/* Checkbox - Top Left */}
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="peer w-5 h-5 rounded-md border-2 border-white checked:bg-[#2D5016] checked:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/50 cursor-pointer transition-all shadow-lg appearance-none bg-white/95 hover:scale-110"
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
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                    </Link>

                    {/* Category Badge */}
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-[#2D5016]/90 text-white text-[9px] font-semibold rounded-full pointer-events-none">
                      {item.category}
                    </div>

                    {/* Discount Badge */}
                    {item.discount && (
                      <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold rounded-full shadow-lg animate-pulse pointer-events-none">
                        🔥 DISKON {item.discount}%
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
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute bottom-1.5 right-1.5 w-6 h-6 bg-white/95 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg z-10"
                      title="Hapus dari wishlist"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-2">
                    {/* Product Name */}
                    <h3 className="font-bold text-xs text-[#2D5016] mb-0.5 line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[9px] text-[#2D5016]/70 mb-1.5 line-clamp-1">
                      {item.description}
                    </p>

                    {/* Rating & Stock */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-semibold text-gray-800">
                          {item.rating}
                        </span>
                        <span className="text-[9px] text-gray-500">
                          ({item.reviews})
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-500">
                        {item.stock} {item.unit}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-1.5">
                      {item.discount ? (
                        <div className="space-y-0.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-[#2D5016]">
                              Rp{" "}
                              {Math.round(
                                item.price * (1 - item.discount / 100)
                              ).toLocaleString("id-ID")}
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
                              -{item.discount}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-sm font-bold text-[#2D5016]">
                            Rp {item.price.toLocaleString("id-ID")}
                          </span>
                          <span className="text-[9px] text-gray-500">
                            /{item.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      <Link
                        href={`/market/products/${item.slug}`}
                        className="px-2 py-1.5 bg-gray-100 text-gray-700 rounded-md font-semibold text-[10px] hover:bg-gray-200 hover:scale-105 transition-all active:scale-95 flex items-center justify-center"
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
            className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-[#2D5016]/20 rounded-xl sm:rounded-2xl"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 bg-[#2D5016] rounded-lg flex-shrink-0">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#2D5016] mb-1">
                  Tips Wishlist
                </h3>
                <p className="text-xs sm:text-sm text-[#2D5016]/70 font-medium">
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
