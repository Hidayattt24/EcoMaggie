"use client";

import { useState, useEffect } from "react";
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
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  type Cart,
  type CartItem,
} from "@/lib/api/cart.actions";
import { getFeaturedProducts } from "@/lib/api/product.actions";
import { CartItemSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import Swal from "sweetalert2";

export default function CartPage() {
  const router = useRouter();
  const { toast, success, error: showError, hideToast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  // Fetch cart data
  const fetchCart = async () => {
    try {
      const result = await getCartItems();
      if (result.success && result.data) {
        setCart(result.data);
        // Auto select all items by default
        setSelectedItems(result.data.items.map((item) => item.id));
      } else if (result.error === "Unauthorized") {
        Swal.fire({
          icon: "warning",
          title: "Login Diperlukan",
          text: "Silakan login untuk melihat keranjang",
          confirmButtonColor: "#A3AF87",
        }).then(() => {
          router.push("/auth/sign-in");
        });
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Keranjang",
        text: "Terjadi kesalahan saat memuat keranjang",
        confirmButtonColor: "#A3AF87",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchRecommendedProducts();
  }, []);

  const fetchRecommendedProducts = async () => {
    try {
      const result = await getFeaturedProducts(8);
      if (result.success && result.data) {
        setRecommendedProducts(result.data);
      }
    } catch (error) {
      console.error("Error fetching recommended products:", error);
    }
  };

  const toggleSelectAll = () => {
    if (!cart) return;
    if (selectedItems.length === cart.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.items.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1 || isUpdating) return;

    setIsUpdating(itemId);
    try {
      const result = await updateCartItemQuantity(itemId, newQuantity);

      if (result.success) {
        // Update local state optimistically
        if (cart) {
          setCart({
            ...cart,
            items: cart.items.map((item) =>
              item.id === itemId ? { ...item, quantity: newQuantity } : item
            ),
          });
        }

        // Show success feedback with Toast
        success(
          "Berhasil!",
          "Jumlah produk berhasil diperbarui"
        );
      } else {
        showError(
          "Gagal",
          result.message || "Gagal memperbarui jumlah produk"
        );
        // Refresh cart to get accurate data
        fetchCart();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      showError(
        "Terjadi Kesalahan",
        "Gagal memperbarui jumlah produk"
      );
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    const item = cart?.items.find((i) => i.id === itemId);

    const result = await Swal.fire({
      icon: "question",
      title: "Hapus dari Keranjang?",
      text: `Hapus ${item?.product?.name || "produk ini"} dari keranjang?`,
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9CA3AF",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-3xl shadow-2xl border border-gray-100",
        title: "text-xl font-bold text-[#303646]",
        htmlContainer: "text-gray-600",
        confirmButton:
          "rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all",
        cancelButton:
          "rounded-xl px-8 py-3 font-medium hover:bg-gray-100 transition-all",
      },
      showClass: {
        popup: "animate__animated animate__fadeInDown animate__faster",
      },
    });

    if (!result.isConfirmed) return;

    setIsDeleting(itemId);

    try {
      const response = await removeFromCart(itemId);

      if (response.success) {
        // Update local state with animation
        if (cart) {
          setCart({
            ...cart,
            items: cart.items.filter((item) => item.id !== itemId),
            totalItems:
              cart.totalItems -
              (cart.items.find((i) => i.id === itemId)?.quantity || 0),
            totalPrice:
              cart.totalPrice -
              (cart.items.find((i) => i.id === itemId)?.product?.finalPrice ||
                0) *
                (cart.items.find((i) => i.id === itemId)?.quantity || 0),
          });
        }

        // Remove from selected items
        setSelectedItems(selectedItems.filter((id) => id !== itemId));

        // Show success with Toast
        success(
          "Berhasil Dihapus!",
          "Produk berhasil dihapus dari keranjang"
        );
      } else {
        showError(
          "Gagal",
          response.message || "Gagal menghapus produk"
        );
      }
    } catch (error) {
      console.error("Error removing item:", error);
      showError(
        "Terjadi Kesalahan",
        "Gagal menghapus produk dari keranjang"
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const calculateItemTotal = (item: CartItem) => {
    if (!item.product) return 0;
    return item.product.finalPrice * item.quantity;
  };

  const selectedItemsData =
    cart?.items.filter((item) => selectedItems.includes(item.id)) || [];

  const subtotal = selectedItemsData.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0
  );

  const totalItems = selectedItemsData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Toast Notification */}
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button - Mobile Only */}
        <button
          onClick={() => router.back()}
          className="lg:hidden flex items-center gap-2 mb-4 text-[#435664] hover:text-[#303646] transition-colors"
        >
          <div className="p-2 bg-white border-2 border-[#435664]/30 rounded-lg hover:bg-[#435664]/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <span className="font-semibold text-sm">Kembali</span>
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#435664] to-[#303646] rounded-xl shadow-lg">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#303646]">
                Keranjang Belanja
              </h1>
              <p className="text-xs sm:text-sm text-[#435664] font-medium mt-0.5">
                {cart?.items.length || 0} produk di keranjang Anda
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!cart || cart.items.length === 0 ? (
            /* Empty Cart State */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16 sm:py-20"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#fdf8d4] to-[#f5efc0] rounded-full flex items-center justify-center mb-6 sm:mb-8 border-4 border-[#435664]/20">
                <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-[#435664]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#303646] mb-2 sm:mb-3 text-center">
                Keranjang Anda Kosong
              </h2>
              <p className="text-sm sm:text-base text-[#435664] mb-6 sm:mb-8 text-center max-w-md px-4">
                Yuk, mulai belanja produk berkualitas untuk kebutuhan Anda
              </p>
              <Link
                href="/market/products"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-xl font-bold text-sm sm:text-base hover:shadow-xl hover:shadow-[#a3af87]/30 transition-all"
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
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#fdf8d4] to-[#f5efc0] border-2 border-[#435664] rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === cart.items.length}
                        onChange={toggleSelectAll}
                        className="peer w-5 h-5 rounded-md border-2 border-[#435664] checked:bg-[#435664] checked:border-[#435664] focus:ring-2 focus:ring-[#435664]/30 cursor-pointer transition-all appearance-none"
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
                    <span className="text-sm font-bold text-[#303646] group-hover:text-[#435664]">
                      Pilih Semua ({cart.items.length})
                    </span>
                  </label>
                  {selectedItems.length > 0 && (
                    <span className="text-xs sm:text-sm font-bold text-[#435664]">
                      {selectedItems.length} item dipilih
                    </span>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="space-y-3">
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 bg-white border-2 rounded-xl transition-all ${
                        selectedItems.includes(item.id)
                          ? "border-[#435664] shadow-md shadow-[#435664]/10"
                          : "border-gray-200 hover:border-[#435664]/30"
                      } ${isDeleting === item.id ? "opacity-50" : ""}`}
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
                                className="peer w-5 h-5 rounded-md border-2 border-[#435664]/30 checked:bg-[#435664] checked:border-[#435664] focus:ring-2 focus:ring-[#435664]/30 cursor-pointer transition-all appearance-none"
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
                          href={`/market/products/${item.product?.slug || ""}`}
                          className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden hover:scale-105 transition-transform"
                          style={
                            {
                              backgroundColor: "rgba(163, 175, 135, 0.1)",
                            } as React.CSSProperties
                          }
                        >
                          <img
                            src={
                              item.product?.images?.[0] ||
                              "/assets/dummy/magot.png"
                            }
                            alt={item.product?.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/market/products/${
                                  item.product?.slug || ""
                                }`}
                                className="font-bold text-sm sm:text-base text-[#5a6c5b] hover:text-[#5a6c5b]/80 line-clamp-1"
                              >
                                {item.product?.name || "Product"}
                              </Link>
                              <p
                                className="text-xs sm:text-sm font-medium"
                                style={{ color: "rgba(90, 108, 91, 0.7)" }}
                              >
                                {item.product?.farmer?.farmName || "Petani"}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              disabled={isDeleting === item.id}
                              className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Hapus dari keranjang"
                            >
                              {isDeleting === item.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>

                          {/* Price */}
                          <div className="mb-3">
                            {item.product?.discountPercent &&
                            item.product.discountPercent > 0 ? (
                              <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base sm:text-lg font-bold text-[#5a6c5b]">
                                    Rp{" "}
                                    {item.product.finalPrice.toLocaleString(
                                      "id-ID"
                                    )}
                                  </span>
                                  <span className="text-xs text-gray-400 line-through">
                                    Rp{" "}
                                    {item.product.price.toLocaleString("id-ID")}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 font-bold rounded">
                                    -{item.product.discountPercent}%
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-base sm:text-lg font-bold text-[#5a6c5b]">
                                Rp{" "}
                                {item.product?.finalPrice.toLocaleString(
                                  "id-ID"
                                ) || 0}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 ml-2">
                              per {item.product?.unit || "kg"}
                            </span>
                          </div>

                          {/* Quantity Control */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={
                                  item.quantity <= 1 || isUpdating === item.id
                                }
                                className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#A3AF87] hover:text-white hover:border-[#A3AF87]"
                              >
                                {isUpdating === item.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent"></div>
                                ) : (
                                  <Minus className="h-3 w-3" />
                                )}
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-[#5a6c5b]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={
                                  (item.product?.stock || 0) <= item.quantity ||
                                  isUpdating === item.id
                                }
                                className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#A3AF87] hover:text-white hover:border-[#A3AF87]"
                              >
                                {isUpdating === item.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent"></div>
                                ) : (
                                  <Plus className="h-3 w-3" />
                                )}
                              </button>
                            </div>

                            {/* Subtotal per Item */}
                            <div className="text-right">
                              <p
                                className="text-xs"
                                style={{ color: "rgba(90, 108, 91, 0.7)" }}
                              >
                                Subtotal
                              </p>
                              <motion.p
                                key={calculateItemTotal(item)}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className="text-sm sm:text-base font-bold text-[#5a6c5b]"
                              >
                                Rp{" "}
                                {calculateItemTotal(item).toLocaleString(
                                  "id-ID"
                                )}
                              </motion.p>
                            </div>
                          </div>

                          {/* Stock Warning */}
                          {item.product &&
                            item.quantity >= item.product.stock - 5 && (
                              <p className="text-xs text-orange-500 mt-2">
                                Stok tersisa: {item.product.stock}{" "}
                                {item.product.unit}
                              </p>
                            )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Column - Summary (Desktop) */}
              <div className="hidden lg:block">
                <div className="sticky top-4 bg-gradient-to-br from-[#fdf8d4] to-[#f5efc0] border-2 border-[#435664] rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#435664] rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#303646]">
                      Ringkasan Belanja
                    </h3>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-[#435664]">
                        Total Item
                      </span>
                      <span className="font-bold text-[#303646]">
                        {totalItems} produk
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-[#435664]">
                        Subtotal
                      </span>
                      <motion.span
                        key={subtotal}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="font-bold text-[#303646]"
                      >
                        Rp {subtotal.toLocaleString("id-ID")}
                      </motion.span>
                    </div>
                  </div>

                  <div className="border-t-2 border-[#435664]/20 pt-4 mb-6">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-base font-bold text-[#303646]">
                        Total Belanja
                      </span>
                      <motion.span
                        key={subtotal}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold text-[#303646]"
                      >
                        Rp {subtotal.toLocaleString("id-ID")}
                      </motion.span>
                    </div>
                  </div>

                  <Link
                    href="/market/checkout"
                    className={`w-full py-4 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedItems.length > 0
                        ? "bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white hover:shadow-lg hover:shadow-[#a3af87]/30"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    <span>Checkout Sekarang</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>

                  {selectedItems.length === 0 && (
                    <p className="text-xs text-center text-[#435664] mt-3">
                      Pilih produk untuk melanjutkan
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Recommended Products */}
        {cart && cart.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#5a6c5b]">
                  Mungkin Anda Juga Butuh
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "rgba(90, 108, 91, 0.7)" }}
                >
                  Produk terkait untuk melengkapi pesanan Anda
                </p>
              </div>
              <Link
                href="/market/products"
                className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#5a6c5b] hover:gap-2 transition-all"
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
                  className="group bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#A3AF87]/30 transition-all"
                >
                  <div
                    className="relative aspect-square"
                    style={
                      {
                        backgroundColor: "rgba(163, 175, 135, 0.1)",
                      } as React.CSSProperties
                    }
                  >
                    <img
                      src={product.images?.[0] || "/assets/dummy/magot.png"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {product.discountPercent > 0 && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md">
                        -{product.discountPercent}%
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs sm:text-sm font-bold text-[#5a6c5b] line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm sm:text-base font-bold text-[#5a6c5b]">
                      Rp {product.finalPrice.toLocaleString("id-ID")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {cart && cart.items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#435664]/20 shadow-2xl p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-[#435664]">
                Total Belanja
              </p>
              <motion.p
                key={subtotal}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-xl font-bold text-[#303646]"
              >
                Rp {subtotal.toLocaleString("id-ID")}
              </motion.p>
            </div>
            <Link
              href="/market/checkout"
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                selectedItems.length > 0
                  ? "bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white hover:shadow-lg hover:shadow-[#a3af87]/30"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
              }`}
            >
              <span>Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {selectedItems.length > 0 && (
            <p className="text-xs text-center text-[#435664]">
              {totalItems} produk dipilih
            </p>
          )}
        </div>
      )}
    </div>
  );
}
