"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavbarUser() {
  const pathname = usePathname();
  const navItems = [
    {
      name: "Market Maggot",
      link: "/market/products",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      name: "Supply Connect",
      link: "/supply",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      name: "Tentang",
      link: "/about",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const mobileNavItems = [
    {
      name: "Market",
      link: "/market/products",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      name: "Supply",
      link: "/supply",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      name: "Cart",
      link: "/market/cart",
      badge: 3,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      name: "About",
      link: "/about",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Navbar>
        <NavBody>
          <NavbarLogo src="/assets/logo.svg" alt="EcoMaggie" href="/" />
          <NavItems items={navItems} pathname={pathname} />
          <div className="flex items-center gap-4">
            <Link
              href="/wishlist"
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-green-50 hover:text-[#2D5016] ${
                pathname === "/wishlist"
                  ? "bg-green-50 text-[#2D5016] shadow-md scale-105"
                  : "text-gray-700"
              }`}
              title="Wishlist"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </Link>

            <Link
              href="/market/cart"
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-green-50 hover:text-[#2D5016] ${
                pathname === "/market/cart"
                  ? "bg-green-50 text-[#2D5016] shadow-md scale-105"
                  : "text-gray-700"
              }`}
              title="Keranjang"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2D5016] text-[10px] font-bold text-white">
                3
              </span>
            </Link>

            <Link
              href="/transaction"
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-green-50 hover:text-[#2D5016] ${
                pathname === "/transaction"
                  ? "bg-green-50 text-[#2D5016] shadow-md scale-105"
                  : "text-gray-700"
              }`}
              title="Transaksi Saya"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </Link>

            <Link
              href="/profile"
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2D5016] to-[#3d6b1e] text-white transition-all hover:shadow-lg hover:scale-105 ${
                pathname === "/profile"
                  ? "shadow-xl scale-110 ring-2 ring-[#2D5016] ring-offset-2"
                  : ""
              }`}
              title="Profile"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
          </div>
        </NavBody>
      </Navbar>

      <div className="lg:hidden fixed top-0 inset-x-0 z-50 pt-safe">
        <div className="mx-2 mt-3">
          <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 px-4 py-3">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#2D5016]/10 via-transparent to-[#3d6b1e]/10 pointer-events-none"></div>

            <div className="relative flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center transition-transform active:scale-95"
              >
                <img
                  src="/assets/logo.svg"
                  alt="EcoMaggie"
                  className="h-8 w-auto"
                />
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href="/wishlist"
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-green-50 hover:text-[#2D5016] active:scale-95 ${
                    pathname === "/wishlist"
                      ? "bg-green-50 text-[#2D5016] scale-105"
                      : "text-gray-600"
                  }`}
                  title="Wishlist"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </Link>

                <Link
                  href="/market/cart"
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-green-50 hover:text-[#2D5016] active:scale-95 ${
                    pathname === "/market/cart"
                      ? "bg-green-50 text-[#2D5016] scale-105"
                      : "text-gray-600"
                  }`}
                  title="Keranjang"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2D5016] text-[10px] font-bold text-white">
                    3
                  </span>
                </Link>

                <Link
                  href="/transaction"
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-green-50 hover:text-[#2D5016] active:scale-95 ${
                    pathname === "/transaction"
                      ? "bg-green-50 text-[#2D5016] scale-105"
                      : "text-gray-600"
                  }`}
                  title="Transaksi Saya"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </Link>

                <Link
                  href="/profile"
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2D5016] to-[#3d6b1e] text-white transition-all hover:shadow-lg active:scale-95 ${
                    pathname === "/profile"
                      ? "shadow-xl scale-105 ring-2 ring-white"
                      : ""
                  }`}
                  title="Profile"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe">
        <div className="mx-2 mb-3">
          <nav className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 px-3 py-3">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#2D5016]/10 via-transparent to-[#3d6b1e]/10 pointer-events-none"></div>

            <div className="relative flex items-center justify-around">
              {mobileNavItems.map((item, idx) => {
                const isActive =
                  pathname === item.link ||
                  pathname?.startsWith(item.link + "/");
                return (
                  <Link
                    key={`bottom-nav-${idx}`}
                    href={item.link}
                    className="flex flex-col items-center gap-1 py-1.5 px-3 transition-all relative group"
                  >
                    {isActive && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-[#2D5016] to-[#3d6b1e] rounded-full"></div>
                    )}

                    <div className="relative">
                      <div
                        className={`transition-all ${
                          isActive
                            ? "text-[#2D5016] scale-110"
                            : "text-gray-500 group-hover:text-[#2D5016] group-hover:scale-105"
                        }`}
                      >
                        {item.icon}
                      </div>

                      {item.badge && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2D5016] text-[9px] font-bold text-white shadow-md">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-medium transition-all ${
                        isActive
                          ? "text-[#2D5016]"
                          : "text-gray-500 group-hover:text-[#2D5016]"
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
