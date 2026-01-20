"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/user/LogoutButton";
import { useProfile, formatPhoneNumber } from "@/hooks/useProfile";
import { getCartItemCount } from "@/lib/api/cart.actions";
import { getWishlistCount } from "@/lib/api/product.actions";
import { getTransactionCount } from "@/lib/api/transaction.actions";
import { Recycle } from "lucide-react";

export function NavbarUser() {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Get user profile data
  const { profile, loading: profileLoading } = useProfile();

  // Cart, Wishlist, and Transaction count states
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);

  // Fetch counts on mount and when pathname changes
  useEffect(() => {
    const fetchCounts = async () => {
      const [cart, wishlist, transaction] = await Promise.all([
        getCartItemCount(),
        getWishlistCount(),
        getTransactionCount(),
      ]);
      setCartCount(cart);
      setWishlistCount(wishlist);
      setTransactionCount(transaction);
    };

    fetchCounts();

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);

    return () => clearInterval(interval);
  }, [pathname]); // Re-fetch when pathname changes

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
      icon: <Recycle className="h-4 w-4" />,
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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
      icon: <Recycle className="h-6 w-6" />,
    },
  ];

  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };

    const handleScroll = () => {
      setShowProfileDropdown(false);
    };

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [showProfileDropdown]);

  return (
    <>
      <Navbar>
        <NavBody>
          <NavbarLogo src="/assets/logo.svg" alt="EcoMaggie" href="/" />
          <NavItems items={navItems} pathname={pathname} />
          <div className="flex items-center gap-4">
            <Link
              href="/wishlist"
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                pathname === "/wishlist"
                  ? "shadow-md scale-105"
                  : ""
              }`}
              style={
                {
                  backgroundColor:
                    pathname === "/wishlist"
                      ? "rgba(235, 251, 168, 0.5)"
                      : "transparent",
                  color: pathname === "/wishlist" ? "#303646" : "#303646",
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                if (pathname !== "/wishlist") {
                  e.currentTarget.style.backgroundColor =
                    "rgba(235, 251, 168, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/wishlist") {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
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
              {wishlistCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: "#303646", color: "#fdf8d4" }}
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/market/cart"
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                pathname === "/market/cart"
                  ? "shadow-md scale-105"
                  : ""
              }`}
              style={
                {
                  backgroundColor:
                    pathname === "/market/cart"
                      ? "rgba(235, 251, 168, 0.5)"
                      : "transparent",
                  color: pathname === "/market/cart" ? "#303646" : "#303646",
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                if (pathname !== "/market/cart") {
                  e.currentTarget.style.backgroundColor =
                    "rgba(235, 251, 168, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/market/cart") {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
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
              {cartCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: "#303646", color: "#fdf8d4" }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/transaction"
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                pathname === "/transaction"
                  ? "shadow-md scale-105"
                  : ""
              }`}
              style={
                {
                  backgroundColor:
                    pathname === "/transaction"
                      ? "rgba(235, 251, 168, 0.5)"
                      : "transparent",
                  color: pathname === "/transaction" ? "#303646" : "#303646",
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                if (pathname !== "/transaction") {
                  e.currentTarget.style.backgroundColor =
                    "rgba(235, 251, 168, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/transaction") {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
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
              {transactionCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: "#303646", color: "#fdf8d4" }}
                >
                  {transactionCount > 99 ? "99+" : transactionCount}
                </span>
              )}
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all hover:shadow-lg hover:scale-105 overflow-hidden ${
                  pathname?.startsWith("/profile")
                    ? "shadow-xl scale-110 ring-2 ring-offset-2"
                    : ""
                }`}
                style={
                  {
                    backgroundColor: "#303646",
                    borderColor: pathname?.startsWith("/profile")
                      ? "#ebfba8"
                      : undefined,
                  } as React.CSSProperties
                }
                title="Profile"
              >
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="h-5 w-5 text-[#fdf8d4]"
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
                )}
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50">
                  {/* User Info Header */}
                  <div
                    className="p-4 border-b-2 border-gray-100"
                    style={{
                      background:
                        "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), white)",
                    }}
                  >
                    <p
                      className="font-bold text-base"
                      style={{ color: "#435664" }}
                    >
                      {profileLoading ? (
                        <span className="inline-block w-32 h-5 bg-gray-200 animate-pulse rounded"></span>
                      ) : (
                        profile?.name || "User"
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {profileLoading ? (
                        <span className="inline-block w-40 h-4 bg-gray-200 animate-pulse rounded"></span>
                      ) : (
                        formatPhoneNumber(profile?.phone)
                      )}
                    </p>
                  </div>

                  {/* Menu Options */}
                  <div className="p-2">
                    <Link
                      href="/profile/settings"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group"
                    >
                      <div
                        className="p-2 rounded-lg transition-all"
                        style={{ backgroundColor: "rgba(67, 86, 100, 0.1)" }}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: "#435664" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-900">
                          Pengaturan Akun
                        </p>
                        <p className="text-xs text-gray-500">
                          Edit profil & password
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/profile/addresses"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group"
                    >
                      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-all">
                        <svg
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-900">
                          Daftar Alamat
                        </p>
                        <p className="text-xs text-gray-500">
                          Kelola alamat pengiriman
                        </p>
                      </div>
                    </Link>

                    <LogoutButton
                      onClose={() => setShowProfileDropdown(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </NavBody>
      </Navbar>

      <div className="lg:hidden fixed top-0 inset-x-0 z-50 pt-safe">
        <div className="mx-2 mt-3">
          <div className="relative rounded-3xl shadow-2xl border border-gray-200/50 px-4 py-3" style={{ backgroundColor: "#fdf8d4" }}>
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(235, 251, 168, 0.3), transparent, rgba(235, 251, 168, 0.3))",
              }}
            ></div>

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
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 ${
                    pathname === "/wishlist" ? "scale-105" : ""
                  }`}
                  style={{
                    backgroundColor:
                      pathname === "/wishlist"
                        ? "rgba(235, 251, 168, 0.5)"
                        : "transparent",
                    color: pathname === "/wishlist" ? "#303646" : "#303646",
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== "/wishlist") {
                      e.currentTarget.style.backgroundColor =
                        "rgba(235, 251, 168, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== "/wishlist") {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                  title="Wishlist"
                >
                  <svg
                    className="h-5 w-5"
                    style={{ color: "#303646" }}
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
                  {wishlistCount > 0 && (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: "#303646", color: "#fdf8d4" }}
                    >
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/market/cart"
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 ${
                    pathname === "/market/cart" ? "scale-105" : ""
                  }`}
                  style={{
                    backgroundColor:
                      pathname === "/market/cart"
                        ? "rgba(235, 251, 168, 0.5)"
                        : "transparent",
                    color: pathname === "/market/cart" ? "#303646" : "#303646",
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== "/market/cart") {
                      e.currentTarget.style.backgroundColor =
                        "rgba(235, 251, 168, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== "/market/cart") {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                  title="Keranjang"
                >
                  <svg
                    className="h-5 w-5"
                    style={{ color: "#303646" }}
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
                  {cartCount > 0 && (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: "#303646", color: "#fdf8d4" }}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/transaction"
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 ${
                    pathname === "/transaction" ? "scale-105" : ""
                  }`}
                  style={{
                    backgroundColor:
                      pathname === "/transaction"
                        ? "rgba(235, 251, 168, 0.5)"
                        : "transparent",
                    color: pathname === "/transaction" ? "#303646" : "#303646",
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== "/transaction") {
                      e.currentTarget.style.backgroundColor =
                        "rgba(235, 251, 168, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== "/transaction") {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                  title="Transaksi"
                >
                  <svg
                    className="h-5 w-5"
                    style={{ color: "#303646" }}
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
                  {transactionCount > 0 && (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: "#303646", color: "#fdf8d4" }}
                    >
                      {transactionCount > 99 ? "99+" : transactionCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={mobileDropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all hover:shadow-lg active:scale-95 overflow-hidden ${
                      pathname?.startsWith("/profile")
                        ? "shadow-xl scale-105 ring-2"
                        : ""
                    }`}
                    style={{
                      backgroundColor: "#303646",
                      borderColor: pathname?.startsWith("/profile") ? "#ebfba8" : undefined
                    }}
                    title="Profile"
                  >
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="h-5 w-5 text-[#fdf8d4]"
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
                    )}
                  </button>

                  {/* Mobile Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50">
                      {/* User Info Header */}
                      <div
                        className="p-4 border-b-2 border-gray-100"
                        style={{
                          background:
                            "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), white)",
                        }}
                      >
                        <p
                          className="font-bold text-base"
                          style={{ color: "#435664" }}
                        >
                          {profileLoading ? (
                            <span className="inline-block w-32 h-5 bg-gray-200 animate-pulse rounded"></span>
                          ) : (
                            profile?.name || "User"
                          )}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {profileLoading ? (
                            <span className="inline-block w-40 h-4 bg-gray-200 animate-pulse rounded"></span>
                          ) : (
                            formatPhoneNumber(profile?.phone)
                          )}
                        </p>
                      </div>

                      {/* Menu Options */}
                      <div className="p-2">
                        <Link
                          href="/profile/settings"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group"
                        >
                          <div
                            className="p-2 rounded-lg transition-all"
                            style={{
                              backgroundColor: "rgba(67, 86, 100, 0.1)",
                            }}
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              style={{ color: "#435664" }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-900">
                              Pengaturan Akun
                            </p>
                            <p className="text-xs text-gray-500">
                              Edit profil & password
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/profile/addresses"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group"
                        >
                          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-all">
                            <svg
                              className="h-5 w-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-900">
                              Daftar Alamat
                            </p>
                            <p className="text-xs text-gray-500">
                              Kelola alamat pengiriman
                            </p>
                          </div>
                        </Link>

                        <LogoutButton
                          onClose={() => setShowProfileDropdown(false)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe">
        {/* Hide navbar bottom on wishlist, checkout, cart, and profile pages */}
        {!pathname?.includes("/wishlist") &&
          !pathname?.includes("/checkout") &&
          !pathname?.includes("/cart") &&
          !pathname?.includes("/profile") && (
            <div className="mx-2 mb-3">
              <nav className="relative rounded-3xl shadow-2xl border border-gray-200/50 px-3 py-3" style={{ backgroundColor: "#fdf8d4" }}>
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(235, 251, 168, 0.3), transparent, rgba(235, 251, 168, 0.3))",
                  }}
                ></div>

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
                          <div
                            className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
                            style={{
                              backgroundColor: "#303646",
                            }}
                          ></div>
                        )}

                        <div
                          className="transition-all"
                          style={
                            {
                              color: isActive ? "#303646" : "#435664",
                              transform: isActive ? "scale(1.1)" : undefined,
                            } as React.CSSProperties
                          }
                        >
                          {item.icon}
                        </div>

                        <span
                          className="text-[10px] font-medium transition-all"
                          style={
                            {
                              color: isActive ? "#303646" : "#435664",
                            } as React.CSSProperties
                          }
                        >
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          )}
      </div>
    </>
  );
}
