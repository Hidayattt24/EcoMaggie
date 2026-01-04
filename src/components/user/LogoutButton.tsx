"use client";

import { useState } from "react";
import { LogOut, AlertTriangle, X } from "lucide-react";
import { signOut } from "@/lib/api/auth.actions";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";

interface LogoutButtonProps {
  onClose?: () => void;
  className?: string;
  hideText?: boolean;
  showInDropdown?: boolean;
}

export function LogoutButton({
  onClose,
  className = "",
  hideText = false,
  showInDropdown = true,
}: LogoutButtonProps) {
  const { toast, success, error: showError, hideToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Don't render if showInDropdown is false
  if (!showInDropdown) {
    return null;
  }

  const handleLogoutClick = () => {
    setShowModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Call server action to sign out
      await signOut();

      // Show success toast
      success("Berhasil Logout", "Sampai jumpa lagi di EcoMaggie!");

      // Close modal and dropdown
      setShowModal(false);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      // Check if it's a redirect error
      const isRedirect =
        error &&
        typeof error === "object" &&
        "digest" in error &&
        typeof error.digest === "string" &&
        error.digest.startsWith("NEXT_REDIRECT");

      // If it's a redirect, let it propagate
      if (isRedirect) {
        throw error;
      }

      // Only show error for actual errors
      console.error("Logout error:", error);
      showError(
        "Gagal Logout",
        "Terjadi kesalahan saat logout. Silakan coba lagi."
      );
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowModal(false);
  };

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

      {/* Logout Button */}
      <button
        onClick={handleLogoutClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group hover:bg-red-50 ${className}`}
      >
        <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-all">
          <LogOut className="h-5 w-5 text-red-600" />
        </div>
        {!hideText && (
          <div className="flex-1 text-left">
            <p className="font-bold text-sm text-gray-900">
              Keluar dari Aplikasi
            </p>
            <p className="text-xs text-gray-500">Logout dari akun Anda</p>
          </div>
        )}
      </button>

      {/* Modern Logout Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleCancelLogout}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100"
            >
              {/* Content */}
              <div className="p-6">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute inset-0 w-16 h-16 bg-red-500/30 rounded-full animate-ping"></div>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  Keluar dari Akun?
                </h2>
                <p className="text-sm text-gray-600 mb-6 text-center">
                  Apakah Anda yakin ingin keluar dari EcoMaggie?
                </p>

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 mb-6">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Anda akan keluar dan harus login kembali.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Cancel Button */}
                  <button
                    onClick={handleCancelLogout}
                    className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm touch-manipulation"
                  >
                    <X className="h-4 w-4" />
                    Batal
                  </button>

                  {/* Confirm Button */}
                  <button
                    onClick={handleConfirmLogout}
                    disabled={isLoggingOut}
                    className="px-4 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 active:from-red-700 active:to-orange-700 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm touch-manipulation"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Keluar...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        Keluar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
