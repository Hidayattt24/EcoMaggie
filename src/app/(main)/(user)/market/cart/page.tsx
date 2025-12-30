"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  ShoppingBag,
  Tag,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CartItem {
  id: number;
  slug: string;
  name: string;
  variant: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  stock: number;
  discount?: number;
}

interface RecommendedProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  discount?: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      slug: "maggot-bsf-premium",
      name: "Maggot BSF Premium",
      variant: "500gr",
      price: 45000,
      unit: "kg",
      quantity: 2,
      image: "/assets/dummy/magot.png",
      stock: 150,
      discount: 15,
    },
    {
      id: 2,
      slug: "maggot-bsf-organik",
      name: "Maggot BSF Organik",
      variant: "1kg",
      price: 38000,
      unit: "kg",
      quantity: 1,
      image: "/assets/dummy/magot.png",
      stock: 200,
    },
    {
      id: 3,
      slug: "maggot-bsf-kering",
      name: "Maggot BSF Kering",
      variant: "250gr",
      price: 65000,
      unit: "kg",
      quantity: 3,
      image: "/assets/dummy/magot.png",
      stock: 80,
      discount: 20,
    },
  ]);

  const [selectedItems, setSelectedItems] = useState<number[]>([1, 2, 3]);

  const recommendedProducts: RecommendedProduct[] = [
    {
      id: 4,
      slug: "maggot-bsf-fresh",
      name: "Maggot BSF Fresh",
      price: 42000,
      unit: "kg",
      image: "/assets/dummy/magot.png",
      discount: 10,
    },
    {
      id: 5,
      slug: "maggot-bsf-jumbo",
      name: "Maggot BSF Jumbo",
      price: 52000,
      unit: "kg",
      image: "/assets/dummy/magot.png",
    },
  ];

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(
            1,
            Math.min(item.stock, item.quantity + delta)
          );
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
    setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
  };

  const calculateItemTotal = (item: CartItem) => {
    const finalPrice = item.discount
      ? Math.round(item.price * (1 - item.discount / 100))
      : item.price;
    return finalPrice * item.quantity;
  };

  const selectedItemsData = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  const subtotal = selectedItemsData.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0
  );

  const totalItems = selectedItemsData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#2D5016] to-[#2D5016]/80 rounded-xl shadow-lg">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2D5016]">
                Keranjang Belanja
              </h1>
              <p className="text-xs sm:text-sm text-[#2D5016]/70 font-medium mt-0.5">
                {cartItems.length} produk di keranjang Anda
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16 sm:py-20"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center mb-6 sm:mb-8 border-4 border-[#2D5016]/10">
                <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-[#2D5016]/30" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D5016] mb-2 sm:mb-3 text-center">
                Keranjang Anda Kosong
              </h2>
              <p className="text-sm sm:text-base text-[#2D5016]/70 mb-6 sm:mb-8 text-center max-w-md px-4">
                Yuk, mulai belanja produk maggot berkualitas untuk kebutuhan
                ternak Anda
              </p>
              <Link
                href="/market/products"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-xl font-bold text-sm sm:text-base hover:shadow-xl hover:shadow-[#2D5016]/30 transition-all"
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                Mulai Belanja
              </Link>
            </motion.div>
          ) : (
            /* Cart Content */
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Select All Bar */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100/50 border-2 border-[#2D5016]/10 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === cartItems.length}
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
                      Pilih Semua ({cartItems.length})
                    </span>
                  </label>
                  {selectedItems.length > 0 && (
                    <span className="text-xs sm:text-sm font-bold text-[#2D5016]">
                      {selectedItems.length} item dipilih
                    </span>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="space-y-3">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 bg-white border-2 rounded-xl transition-all ${
                        selectedItems.includes(item.id)
                          ? "border-[#2D5016] shadow-md shadow-[#2D5016]/10"
                          : "border-gray-200 hover:border-[#2D5016]/30"
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Checkbox */}
                        <div className="flex-shrink-0">
                          <label className="cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleSelectItem(item.id)}
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
                          </label>
                        </div>

                        {/* Product Image */}
                        <Link
                          href={`/market/products/${item.slug}`}
                          className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-lg overflow-hidden hover:scale-105 transition-transform"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/market/products/${item.slug}`}
                                className="font-bold text-sm sm:text-base text-[#2D5016] hover:text-[#2D5016]/80 line-clamp-1"
                              >
                                {item.name}
                              </Link>
                              <p className="text-xs sm:text-sm text-[#2D5016]/70 font-medium">
                                Varian: {item.variant}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all hover:scale-110"
                              title="Hapus dari keranjang"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="mb-3">
                            {item.discount ? (
                              <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base sm:text-lg font-bold text-[#2D5016]">
                                    Rp{" "}
                                    {Math.round(
                                      item.price * (1 - item.discount / 100)
                                    ).toLocaleString("id-ID")}
                                  </span>
                                  <span className="text-xs text-gray-400 line-through">
                                    Rp {item.price.toLocaleString("id-ID")}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 font-bold rounded">
                                    -{item.discount}%
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-base sm:text-lg font-bold text-[#2D5016]">
                                Rp {item.price.toLocaleString("id-ID")}
                              </span>
                            )}
                          </div>

                          {/* Quantity Control */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                disabled={item.quantity <= 1}
                                className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-[#2D5016] hover:text-white hover:border-[#2D5016] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-[#2D5016]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                disabled={item.quantity >= item.stock}
                                className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-[#2D5016] hover:text-white hover:border-[#2D5016] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Subtotal per Item */}
                            <div className="text-right">
                              <p className="text-xs text-[#2D5016]/70">
                                Subtotal
                              </p>
                              <motion.p
                                key={calculateItemTotal(item)}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className="text-sm sm:text-base font-bold text-[#2D5016]"
                              >
                                Rp{" "}
                                {calculateItemTotal(item).toLocaleString(
                                  "id-ID"
                                )}
                              </motion.p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Column - Summary (Desktop) */}
              <div className="hidden lg:block">
                <div className="sticky top-4 border-2 border-[#2D5016]/20 bg-gradient-to-br from-white to-green-50/30 rounded-2xl p-6 shadow-xl shadow-[#2D5016]/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#2D5016] rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#2D5016]">
                      Ringkasan Belanja
                    </h3>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#2D5016]/70 font-medium">
                        Total Item
                      </span>
                      <span className="font-bold text-[#2D5016]">
                        {totalItems} produk
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#2D5016]/70 font-medium">
                        Subtotal
                      </span>
                      <motion.span
                        key={subtotal}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="font-bold text-[#2D5016]"
                      >
                        Rp {subtotal.toLocaleString("id-ID")}
                      </motion.span>
                    </div>
                  </div>

                  <div className="border-t-2 border-[#2D5016]/10 pt-4 mb-6">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-base font-bold text-[#2D5016]">
                        Total Belanja
                      </span>
                      <motion.span
                        key={subtotal}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold text-[#2D5016]"
                      >
                        Rp {subtotal.toLocaleString("id-ID")}
                      </motion.span>
                    </div>
                  </div>

                  <Link
                    href="/market/checkout"
                    className={`w-full py-4 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedItems.length > 0
                        ? "bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white hover:shadow-xl hover:shadow-[#2D5016]/30"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    <span>Checkout Sekarang</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>

                  {selectedItems.length === 0 && (
                    <p className="text-xs text-center text-[#2D5016]/70 mt-3">
                      Pilih produk untuk melanjutkan
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Recommended Products */}
        {cartItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2D5016]">
                  Mungkin Anda Juga Butuh
                </h2>
                <p className="text-sm text-[#2D5016]/70">
                  Produk terkait untuk melengkapi pesanan Anda
                </p>
              </div>
              <Link
                href="/market/products"
                className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#2D5016] hover:gap-2 transition-all"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {recommendedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/market/products/${product.slug}`}
                  className="group bg-white border-2 border-gray-100 hover:border-[#2D5016]/30 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-green-50 to-green-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {product.discount && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs sm:text-sm font-bold text-[#2D5016] line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm sm:text-base font-bold text-[#2D5016]">
                      Rp{" "}
                      {product.discount
                        ? Math.round(
                            product.price * (1 - product.discount / 100)
                          ).toLocaleString("id-ID")
                        : product.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#2D5016]/20 shadow-2xl p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-[#2D5016]/70">Total Belanja</p>
              <motion.p
                key={subtotal}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-xl font-bold text-[#2D5016]"
              >
                Rp {subtotal.toLocaleString("id-ID")}
              </motion.p>
            </div>
            <Link
              href="/market/checkout"
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                selectedItems.length > 0
                  ? "bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white hover:shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
              }`}
            >
              <span>Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {selectedItems.length > 0 && (
            <p className="text-xs text-center text-[#2D5016]/70">
              {totalItems} produk dipilih
            </p>
          )}
        </div>
      )}
    </div>
  );
}
