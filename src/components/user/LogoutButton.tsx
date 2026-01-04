"use client";

import { LogOut } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/api/auth.actions";

interface LogoutButtonProps {
  onClose?: () => void;
  className?: string;
  hideText?: boolean;
}

export function LogoutButton({
  onClose,
  className = "",
  hideText = false,
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Keluar dari Akun?",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#A3AF87",
      cancelButtonColor: "#9CA3AF",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-3xl shadow-2xl border border-gray-100",
        title: "text-xl font-bold text-[#5a6c5b]",
        htmlContainer: "text-gray-600",
        confirmButton:
          "rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all",
        cancelButton:
          "rounded-xl px-8 py-3 font-medium hover:bg-gray-100 transition-all",
      },
      buttonsStyling: true,
      showClass: {
        popup: "animate__animated animate__fadeInDown animate__faster",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp animate__faster",
      },
    });

    if (result.isConfirmed) {
      // Show logout success toast
      Swal.fire({
        icon: "success",
        title: "Berhasil Logout",
        text: "Sampai jumpa lagi!",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        customClass: {
          popup: "rounded-2xl shadow-xl border-2 border-[#A3AF87]",
          title: "text-base font-bold text-[#A3AF87]",
          htmlContainer: "text-sm text-gray-600",
        },
        background: "#ffffff",
        iconColor: "#A3AF87",
        didOpen: (toast) => {
          toast.style.animation =
            "slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
        },
        willClose: (toast) => {
          toast.style.animation = "fadeOutRight 0.4s ease-in-out";
        },
      });
      // Close dropdown if callback provided
      if (onClose) {
        onClose();
      }

      try {
        // Call server action to sign out (will redirect automatically to /)
        await signOut();
      } catch (error) {
        // Next.js redirect() throws a special error with NEXT_REDIRECT digest
        // Check if it's a redirect error by checking the digest property
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

        Swal.fire({
          icon: "error",
          title: "Gagal Logout",
          text: "Terjadi kesalahan saat logout. Silakan coba lagi.",
          confirmButtonColor: "#A3AF87",
          confirmButtonText: "OK",
          customClass: {
            popup: "rounded-3xl shadow-2xl border border-gray-100",
            title: "text-xl font-bold text-[#5a6c5b]",
            htmlContainer: "text-gray-600",
            confirmButton:
              "rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all",
          },
          showClass: {
            popup: "animate__animated animate__shakeX",
          },
        });
      }
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${className}`}
      style={{
        backgroundColor: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(163, 175, 135, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div
        className="p-2 rounded-lg transition-all"
        style={{
          backgroundColor: "rgba(163, 175, 135, 0.15)",
        }}
      >
        <LogOut className="h-5 w-5" style={{ color: "#A3AF87" }} />
      </div>
    </button>
  );
}
