"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
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
  {
    label: "Profil",
    href: "/farmer/profile",
    icon: <User className="h-5 w-5 shrink-0" />,
  },
];

// Bottom navigation links for mobile (main 5 items)
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
  {
    label: "Profil",
    href: "/farmer/profile",
    icon: <User className="h-5 w-5" />,
  },
];

export default function FarmerSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
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

            {/* Bottom Section - User & Logout (Desktop) */}
            <div className="flex flex-col gap-2 mt-auto">
              {/* User Profile */}
              <div className="border-t border-gray-200 pt-4">
                <Link
                  href="/farmer/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#A3AF87] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    P
                  </div>
                  <motion.div
                    animate={{
                      display: open ? "block" : "none",
                      opacity: open ? 1 : 0,
                    }}
                    className="overflow-hidden flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium text-[#303646] poppins-medium truncate">
                      Petani Maggot
                    </p>
                    <p className="text-xs text-gray-500 poppins-regular truncate">
                      petani@ecomaggie.id
                    </p>
                  </motion.div>
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-200 pt-3 pb-2">
                <SidebarLink
                  link={{
                    label: "Keluar",
                    href: "/login",
                    icon: <LogOut className="h-5 w-5 shrink-0" />,
                  }}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                />
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
                    8
                  </span>
                </Link>

                {/* Profile Button */}
                <Link
                  href="/farmer/profile"
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-white transition-all hover:shadow-lg active:scale-95",
                    pathname?.startsWith("/farmer/profile")
                      ? "shadow-xl scale-105 ring-2 ring-white"
                      : ""
                  )}
                  style={{ backgroundColor: "#A3AF87" }}
                  title="Profile"
                >
                  <User className="h-5 w-5" />
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
