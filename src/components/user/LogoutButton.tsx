"use client";

import { LogOut } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  onClose?: () => void;
  className?: string;
}

export function LogoutButton({ onClose, className = "" }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Keluar dari Akun?",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2D5016",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        title: "text-xl font-bold text-gray-900",
        htmlContainer: "text-gray-600",
        confirmButton: "rounded-xl px-6 py-3 font-medium shadow-lg",
        cancelButton: "rounded-xl px-6 py-3 font-medium",
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

      // Show success toast
      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Berhasil Logout",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        customClass: {
          popup: "rounded-2xl",
          title: "text-sm font-semibold",
        },
        showClass: {
          popup: "animate-fade-in",
        },
      });

      // Perform logout logic here
      // For now, just redirect to login page
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-all group ${className}`}
    >
      <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-all">
        <LogOut className="h-5 w-5 text-red-600" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-bold text-sm text-red-600">Keluar</p>
        <p className="text-xs text-red-400">Logout dari akun</p>
      </div>
    </button>
  );
}
