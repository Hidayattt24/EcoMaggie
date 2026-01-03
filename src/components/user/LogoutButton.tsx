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
        popup: "rounded-2xl",
        title: "text-xl font-bold poppins-bold",
        htmlContainer: "text-gray-600 poppins-regular",
        confirmButton:
          "rounded-xl px-6 py-3 font-medium shadow-lg poppins-semibold",
        cancelButton: "rounded-xl px-6 py-3 font-medium poppins-regular",
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
            popup: "rounded-2xl",
            title: "text-xl font-bold poppins-bold",
            htmlContainer: "text-gray-600 poppins-regular",
            confirmButton: "rounded-xl px-6 py-3 font-medium poppins-semibold",
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
