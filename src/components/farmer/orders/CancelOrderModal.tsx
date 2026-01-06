"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2, Phone } from "lucide-react";
import { cancelOrderByFarmer } from "@/lib/api/orders.actions";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string;
  customerName: string;
  customerPhone?: string;
}

export function CancelOrderModal({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  customerName,
  customerPhone,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelReasons = [
    "Stok produk habis",
    "Produk tidak tersedia sementara",
    "Harga produk berubah",
    "Tidak dapat memproses pesanan",
    "Alamat pengiriman tidak terjangkau",
    "Lainnya",
  ];

  const handleConfirm = async () => {
    const finalReason = selectedReason === "Lainnya" ? reason : selectedReason;

    if (!finalReason || finalReason.trim().length < 10) {
      setError("Alasan pembatalan harus diisi minimal 10 karakter");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await cancelOrderByFarmer(orderId, finalReason);

      if (result.success) {
        onClose();
        onSuccess();
      } else {
        setError(result.message || "Gagal membatalkan pesanan");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat membatalkan pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      setSelectedReason("");
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
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
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-sm text-gray-600">
              Customer: <span className="font-semibold text-gray-900">{customerName}</span>
            </p>
            {customerPhone && (
              <a
                href={`https://wa.me/${customerPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#A3AF87] hover:underline mt-1"
              >
                <Phone className="h-3 w-3" />
                Hubungi via WhatsApp
              </a>
            )}
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-amber-800">
              <strong>Perhatian:</strong> Pembatalan pesanan akan mengembalikan stok produk dan customer akan diberitahu. Pastikan Anda sudah menghubungi customer sebelum membatalkan.
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
                    onChange={(e) => {
                      setSelectedReason(e.target.value);
                      setError(null);
                    }}
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
                onChange={(e) => {
                  setReason(e.target.value);
                  setError(null);
                }}
                placeholder="Tulis alasan pembatalan (minimal 10 karakter)..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#A3AF87] resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">{reason.length}/10 karakter minimum</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Kembali
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || !selectedReason || (selectedReason === "Lainnya" && reason.trim().length < 10)}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Membatalkan...
                </>
              ) : (
                "Ya, Batalkan Pesanan"
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
