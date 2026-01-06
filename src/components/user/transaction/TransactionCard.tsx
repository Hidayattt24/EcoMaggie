"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ShoppingBag,
  Star,
  ChevronRight,
  Phone,
  FileText,
  Store,
  Calendar,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cancelOrderByCustomer } from "@/lib/api/orders.actions";

interface Product {
  id: number;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
  slug?: string;
}

interface Transaction {
  id: string;
  orderId: string;
  farmName: string;
  farmerId: number;
  status: "unpaid" | "packed" | "shipped" | "completed" | "cancelled";
  products: Product[];
  totalItems: number;
  totalPrice: number;
  shippingMethod: string;
  shippingCourier?: string;
  date: string;
  trackingNumber?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onTrack?: (transaction: Transaction) => void;
  onCancelSuccess?: () => void;
}

const statusConfig = {
  unpaid: {
    label: "Menunggu Pembayaran",
    color: "bg-orange-50 text-orange-600 border border-orange-200",
    icon: Clock,
  },
  packed: {
    label: "Sedang Dikemas",
    color: "bg-blue-50 text-blue-600 border border-blue-200",
    icon: Package,
  },
  shipped: {
    label: "Dalam Pengiriman",
    color: "bg-purple-50 text-purple-600 border border-purple-200",
    icon: Truck,
  },
  completed: {
    label: "Pesanan Selesai",
    color: "bg-green-50 text-green-600 border border-green-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "bg-red-50 text-red-500 border border-red-200",
    icon: XCircle,
  },
};

// Cancel Confirmation Modal
function CancelModal({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderId: string;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  const cancelReasons = [
    "Ingin mengubah pesanan",
    "Menemukan harga lebih murah",
    "Tidak jadi membeli",
    "Salah pilih produk/varian",
    "Lainnya",
  ];

  const handleConfirm = () => {
    const finalReason = selectedReason === "Lainnya" ? reason : selectedReason;
    onConfirm(finalReason);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Batalkan Pesanan?</h3>
                <p className="text-sm text-gray-500">{orderId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-amber-800">
              Pesanan yang sudah dibatalkan tidak dapat dikembalikan. Pastikan Anda yakin sebelum melanjutkan.
            </p>
          </div>

          {/* Reason Selection */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Pilih alasan pembatalan:</p>
            <div className="space-y-2">
              {cancelReasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedReason === r
                      ? "border-[#A3AF87] bg-[#A3AF87]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-[#A3AF87] focus:ring-[#A3AF87]"
                  />
                  <span className="text-sm text-gray-700">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason Input */}
          {selectedReason === "Lainnya" && (
            <div className="mb-4">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tulis alasan pembatalan..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A3AF87] resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Kembali
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || !selectedReason || (selectedReason === "Lainnya" && !reason.trim())}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Membatalkan...
                </>
              ) : (
                "Ya, Batalkan"
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function TransactionCard({
  transaction,
  onTrack,
  onCancelSuccess,
}: TransactionCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const config = statusConfig[transaction.status];
  const StatusIcon = config.icon;

  const firstProduct = transaction.products[0];
  const otherProductsCount = transaction.products.length - 1;

  const handleCancelOrder = async (reason: string) => {
    setIsCancelling(true);
    setCancelError(null);

    try {
      const result = await cancelOrderByCustomer(transaction.orderId, reason);

      if (result.success) {
        setShowCancelModal(false);
        onCancelSuccess?.();
      } else {
        setCancelError(result.message || "Gagal membatalkan pesanan");
      }
    } catch (error) {
      setCancelError("Terjadi kesalahan saat membatalkan pesanan");
    } finally {
      setIsCancelling(false);
    }
  };

  const getActionButtons = () => {
    switch (transaction.status) {
      case "unpaid":
        return (
          <>
            <Link
              href={`/market/checkout?orderId=${transaction.orderId}`}
              className="flex-1 px-4 py-2.5 bg-[#A3AF87] text-white rounded-xl font-bold text-sm hover:bg-[#95a17a] hover:shadow-lg hover:shadow-[#A3AF87]/30 transition-all text-center"
            >
              Bayar Sekarang
            </Link>
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2.5 border border-red-200 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
            >
              Batalkan
            </button>
          </>
        );
      case "packed":
        const whatsappMessage = encodeURIComponent(
          `Halo, saya ingin menanyakan status pesanan saya dengan ID: ${transaction.orderId}`
        );
        const whatsappNumber = "6282288953268";
        return (
          <>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 border border-[#A3AF87] text-[#5a6c5b] rounded-xl font-bold text-sm hover:bg-[#A3AF87]/10 transition-all flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Hubungi WhatsApp
            </a>
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2.5 border border-red-200 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
            >
              Batalkan
            </button>
          </>
        );
      case "shipped":
        return (
          <button
            onClick={() => onTrack?.(transaction)}
            className="flex-1 px-4 py-2.5 bg-[#A3AF87] text-white rounded-xl font-bold text-sm hover:bg-[#95a17a] hover:shadow-lg hover:shadow-[#A3AF87]/30 transition-all flex items-center justify-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Lacak Pesanan
          </button>
        );
      case "completed":
        return (
          <>
            <Link
              href={`/market/products/${firstProduct.slug || firstProduct.id}#ulasan`}
              className="flex-1 px-4 py-2.5 bg-[#A3AF87] text-white rounded-xl font-bold text-sm hover:bg-[#95a17a] hover:shadow-lg hover:shadow-[#A3AF87]/30 transition-all flex items-center justify-center gap-2"
            >
              <Star className="h-4 w-4" />
              Beri Nilai
            </Link>
            <Link
              href={`/transaction/${transaction.orderId}`}
              className="flex-1 px-4 py-2.5 border border-[#A3AF87] text-[#5a6c5b] rounded-xl font-bold text-sm hover:bg-[#A3AF87]/10 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Detail
            </Link>
          </>
        );
      case "cancelled":
        return (
          <Link
            href="/market/products"
            className="flex-1 px-4 py-2.5 border border-[#A3AF87] text-[#5a6c5b] rounded-xl font-bold text-sm hover:bg-[#A3AF87]/10 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Belanja Lagi
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white border border-[#A3AF87]/20 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-[#A3AF87]/10 transition-all"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#A3AF87]/10 bg-gradient-to-r from-[#A3AF87]/5 to-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#A3AF87]/10 rounded-lg flex items-center justify-center">
                <Store className="h-4 w-4 text-[#A3AF87]" />
              </div>
              <span className="font-bold text-sm text-[#5a6c5b]">
                {transaction.farmName}
              </span>
            </div>
            <Link
              href={`/market/orders/${transaction.orderId}`}
              className="flex items-center gap-1 text-xs text-[#5a6c5b] hover:text-[#A3AF87] hover:gap-2 transition-all font-semibold"
            >
              <span>Detail</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>{transaction.date}</span>
              <span className="text-gray-300">•</span>
              <span className="font-medium">{transaction.orderId}</span>
            </div>
            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${config.color}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {config.label}
            </div>
          </div>
        </div>

        {/* Body - Products */}
        <div className="p-4">
          <div className="flex gap-3 mb-3">
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-[#A3AF87]/10 rounded-xl overflow-hidden border border-[#A3AF87]/10">
              <img
                src={firstProduct.image}
                alt={firstProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-[#5a6c5b] line-clamp-1 mb-1">
                {firstProduct.name}
              </h3>
              <p className="text-xs text-gray-500 mb-1">
                Varian: {firstProduct.variant}
              </p>
              <p className="text-xs text-gray-500">x{firstProduct.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-[#5a6c5b]">
                Rp {firstProduct.price.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {otherProductsCount > 0 && (
            <div className="px-3 py-2 bg-[#A3AF87]/5 rounded-lg text-xs text-[#5a6c5b] font-medium border border-[#A3AF87]/10">
              + {otherProductsCount} produk lainnya
            </div>
          )}

          {/* Cancel Error */}
          {cancelError && (
            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              {cancelError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#A3AF87]/10 bg-[#A3AF87]/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium">
              {transaction.totalItems} Produk
            </span>
            <div className="text-right">
              <span className="text-xs text-gray-500 mr-2">Total:</span>
              <span className="text-base font-bold text-[#5a6c5b]">
                Rp {transaction.totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <div className="flex gap-2">{getActionButtons()}</div>
        </div>
      </motion.div>

      {/* Cancel Modal */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        orderId={transaction.orderId}
        isLoading={isCancelling}
      />
    </>
  );
}
