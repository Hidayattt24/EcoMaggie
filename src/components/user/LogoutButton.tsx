"use client";

import { LogOut } from "lucide-react";
import Swal from "sweetalert2";
import { createClient } from "@/lib/supabase/client";

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
  if (!showInDropdown) {
    return null;
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Keluar dari Akun?",
      text: "Apakah Anda yakin ingin keluar dari EcoMaggie?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        title: "text-xl font-bold text-gray-900",
        htmlContainer: "text-gray-600",
        confirmButton: "rounded-xl px-6 py-3 font-semibold shadow-lg",
        cancelButton: "rounded-xl px-6 py-3 font-semibold",
      },
      buttonsStyling: true,
      showClass: {
        popup: "animate-fade-in",
      },
      hideClass: {
        popup: "animate-fade-out",
      },
    });

    if (result.isConfirmed) {
      // Close dropdown if callback provided
      if (onClose) {
        onClose();
      }

      try {
        // Perform logout with Supabase
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        // Redirect to home
        window.location.href = "/";
      } catch (error) {
        console.error("Logout error:", error);

        // Show error message
        Swal.fire({
          icon: "error",
          title: "Gagal Logout",
          text: "Terjadi kesalahan saat logout. Silakan coba lagi.",
          confirmButtonColor: "#ef4444",
          confirmButtonText: "OK",
          customClass: {
            popup: "rounded-2xl",
            confirmButton: "rounded-xl px-6 py-3 font-semibold",
          },
        });
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
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
  );
}
