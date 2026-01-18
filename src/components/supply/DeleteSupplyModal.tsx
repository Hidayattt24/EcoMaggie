"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, AlertTriangle, Loader2 } from "lucide-react";
import { deleteSupply, deleteMultipleSupplies } from "@/lib/api/supply.actions";

interface DeleteSupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplyIds: string[];
  supplyNumbers: string[];
  onSuccess: () => void;
}

export default function DeleteSupplyModal({
  isOpen,
  onClose,
  supplyIds,
  supplyNumbers,
  onSuccess,
}: DeleteSupplyModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBulkDelete = supplyIds.length > 1;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      let result;
      if (isBulkDelete) {
        result = await deleteMultipleSupplies(supplyIds);
      } else {
        result = await deleteSupply(supplyIds[0]);
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message || "Gagal menghapus supply");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menghapus supply");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Hapus Supply
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {isBulkDelete
                      ? `${supplyIds.length} supply dipilih`
                      : "Konfirmasi penghapusan"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                {isBulkDelete
                  ? "Apakah Anda yakin ingin menghapus supply berikut?"
                  : "Apakah Anda yakin ingin menghapus supply ini?"}
              </p>

              {/* Supply List */}
              <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                {supplyNumbers.map((number, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 py-2 border-b border-gray-200 last:border-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">
                      {number}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Perhatian:</span> Data yang
                  dihapus tidak dapat dikembalikan.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
