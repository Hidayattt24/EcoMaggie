"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LogoutButton } from "@/components/user/LogoutButton";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  User,
  Recycle,
  LogOut,
} from "lucide-react";

const farmerLinks = [
  {
    label: "Dashboard",
    href: "/farmer/dashboard",
    icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
  },
  {
    label: "Pesanan",
    href: "/farmer/orders",
    icon: <ShoppingBag className="h-5 w-5 shrink-0" />,
  },
  {
    label: "Produk",
    href: "/farmer/products",
    icon: <Package className="h-5 w-5 shrink-0" />,
  },
  {
    label: "Supply",
    href: "/farmer/supply-monitoring",
    icon: <Recycle className="h-5 w-5 shrink-0" />,
  },
];

// Bottom navigation links for mobile (main 4 items)
const mobileNavLinks = [
  {
    label: "Dashboard",
    href: "/farmer/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Pesanan",
    href: "/farmer/orders",
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    label: "Produk",
    href: "/farmer/products",
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: "Supply",
    href: "/farmer/supply-monitoring",
    icon: <Recycle className="h-5 w-5" />,
  },
];

export default function FarmerSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [showMobileLogout, setShowMobileLogout] = useState(false);
  const pathname = usePathname();

  // Check if current path matches the link
  const isActiveLink = (href: string) => {
    if (href === "/farmer/dashboard") {
      return pathname === "/farmer/dashboard" || pathname === "/farmer";
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col overflow-hidden bg-gray-50 md:flex-row",
        "min-h-screen"
      )}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 border-r border-gray-200 h-screen">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <LogoIcon />}

              <div className="mt-6 flex flex-col gap-1">
                {farmerLinks.map((link, idx) => (
                  <SidebarLink
                    key={idx}
                    link={link}
                    isActive={isActiveLink(link.href)}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Section - Logout (Desktop) */}
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex justify-center">
                <button
                  onClick={async () => {
                    const { signOut } = await import("@/lib/api/auth.actions");
                    const Swal = (await import("sweetalert2")).default;

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
                        cancelButton:
                          "rounded-xl px-6 py-3 font-medium poppins-regular",
                      },
                    });

                    if (result.isConfirmed) {
                      try {
                        await signOut();
                      } catch (error) {
                        const isRedirect =
                          error &&
                          typeof error === "object" &&
                          "digest" in error &&
                          typeof error.digest === "string" &&
                          error.digest.startsWith("NEXT_REDIRECT");
                        if (isRedirect) throw error;
                      }
                    }
                  }}
                  className="group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all hover:scale-105"
                  style={{ backgroundColor: "rgba(163, 175, 135, 0.15)" }}
                  title="Keluar dari Akun"
                >
                  <LogOut
                    className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "#A3AF87" }}
                  />

                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap poppins-medium">
                    Keluar
                  </div>
                </button>
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 pt-safe">
        <div className="mx-2 mt-3">
          <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 px-4 py-3">
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(163, 175, 135, 0.1), transparent, rgba(90, 108, 91, 0.1))",
              }}
            ></div>

            <div className="relative flex items-center justify-between">
              <Link
                href="/farmer/dashboard"
                className="flex items-center transition-transform active:scale-95"
              >
                <img
                  src="/assets/logo.svg"
                  alt="EcoMaggie"
                  className="h-8 w-auto"
                />
              </Link>

              <div className="flex items-center gap-3">
                {/* Logout Button Mobile */}
                <button
                  onClick={() => setShowMobileLogout(true)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
                  style={{ backgroundColor: "rgba(163, 175, 135, 0.1)" }}
                  title="Keluar"
                >
                  <LogOut className="h-5 w-5" style={{ color: "#A3AF87" }} />
                </button>

                {/* Notification Badge */}
                <Link
                  href="/farmer/orders"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
                  title="Notifikasi"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {/* Badge Count */}
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                    3
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div className="mx-2 mb-3">
          <nav className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 px-3 py-3">
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(163, 175, 135, 0.1), transparent, rgba(90, 108, 91, 0.1))",
              }}
            ></div>

            <div className="relative flex items-center justify-around">
              {mobileNavLinks.map((link, idx) => {
                const isActive = isActiveLink(link.href);
                return (
                  <Link
                    key={`bottom-nav-${idx}`}
                    href={link.href}
                    className="flex flex-col items-center gap-1 py-1.5 px-3 transition-all relative group"
                  >
                    {isActive && (
                      <div
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
                        style={{
                          background:
                            "linear-gradient(to right, #A3AF87, #5a6c5b)",
                        }}
                      ></div>
                    )}

                    <div
                      className="transition-all"
                      style={{
                        color: isActive ? "#A3AF87" : "rgb(107 114 128)",
                        transform: isActive ? "scale(1.1)" : undefined,
                      }}
                    >
                      {link.icon}
                    </div>

                    <span
                      className="text-[10px] font-medium transition-all"
                      style={{
                        color: isActive ? "#A3AF87" : "rgb(107 114 128)",
                      }}
                    >
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Logout Modal */}
            <AnimatePresence>
              {showMobileLogout && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowMobileLogout(false)}
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                  />

                  {/* Modal */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="md:hidden fixed bottom-0 left-0 right-0 z-[70] pb-safe"
                  >
                    <div className="mx-3 mb-20">
                      <div className="bg-white rounded-3xl shadow-2xl p-4 border border-gray-200">
                        <div className="mb-3 pb-3 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 poppins-semibold">
                              Akun Anda
                            </h3>
                            <button
                              onClick={() => setShowMobileLogout(false)}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <svg
                                className="w-5 h-5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 poppins-regular mt-1">
                            egomaggie@gmail.com
                          </p>
                        </div>
                        <LogoutButton
                          onClose={() => setShowMobileLogout(false)}
                          className="rounded-xl justify-center"
                          hideText={true}
                          showInDropdown={false}
                        />
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:h-screen">
        <div className="pt-20 pb-24 md:pt-0 md:pb-0 p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

const Logo = () => {
  return (
    <Link
      href="/farmer/dashboard"
      className="relative z-20 flex items-center space-x-3 py-2 px-1"
    >
      <div
        className="w-11 h-11 rounded-xl p-1.5 shadow-md shrink-0"
        style={{ backgroundColor: "#A3AF87" }}
      >
        <Image
          src="/icon.svg"
          alt="EcoMaggie Logo"
          width={36}
          height={36}
          className="w-full h-full"
        />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col"
      >
        <span
          className="font-bold poppins-bold text-lg whitespace-pre"
          style={{ color: "#0A2710" }}
        >
          EcoMaggie
        </span>
        <span className="text-xs text-[#A3AF87] poppins-medium -mt-0.5">
          Petani Dashboard
        </span>
      </motion.div>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="/farmer/dashboard"
      className="relative z-20 flex items-center justify-center py-2"
    >
      <div
        className="w-11 h-11 rounded-xl p-1.5 shadow-md shrink-0"
        style={{ backgroundColor: "#A3AF87" }}
      >
        <Image
          src="/icon.svg"
          alt="EcoMaggie Logo"
          width={36}
          height={36}
          className="w-full h-full"
        />
      </div>
    </Link>
  );
};
