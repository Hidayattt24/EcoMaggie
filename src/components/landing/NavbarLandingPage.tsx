"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Icons sebagai SVG components
const HomeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    className="w-5 h-5"
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
);

const LightbulbIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

const ChartIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const PackageIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-6 h-6"
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
);

const LoginIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
    />
  </svg>
);

const UserAddIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
);

const navigationItems = [
  { name: "Beranda", href: "/", icon: HomeIcon },
  { name: "Tentang", href: "/about", icon: InfoIcon },
  { name: "Solusi", href: "/solution", icon: LightbulbIcon },
  { name: "Dampak", href: "/impact", icon: ChartIcon },
  { name: "Produk", href: "/product", icon: PackageIcon },
  { name: "Testimoni", href: "/testimonials", icon: StarIcon },
];

export default function NavbarLandingPage() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:block fixed top-8 left-1/2 -translate-x-1/2 z-50">
        <div
          className="bg-white shadow-lg backdrop-blur-sm bg-white/95"
          style={{
            width: "1196px",
            height: "89px",
            borderRadius: "52px",
          }}
        >
          <div className="flex items-center justify-between h-full px-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/assets/logo.svg"
                alt="EcoMaggie Logo"
                width={100}
                height={100}
                className="w-40 h-40"
              />
            </Link>

            {/* Navigation Menu */}
            <div className="flex items-center gap-3">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 text-sm poppins-medium transition-all duration-300 relative py-2 px-2.5 rounded-lg",
                      isActive
                        ? "text-[#2D5016] font-semibold bg-green-50"
                        : "text-gray-700 hover:text-[#2D5016] hover:bg-green-50"
                    )}
                  >
                    <Icon />
                    <span className="text-xs">{item.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D5016] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="group relative px-5 py-2.5 text-sm text-[#2D5016] poppins-semibold rounded-full transition-all duration-300 border-2 border-[#2D5016] hover:bg-[#2D5016] hover:text-white overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <LoginIcon />
                  Masuk
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#2D5016] to-[#3d6b1e] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </Link>
              <Link
                href="/register"
                className="group relative px-5 py-2.5 text-sm text-white poppins-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#2D5016] via-[#3d6b1e] to-[#4a8022]" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#4a8022] via-[#3d6b1e] to-[#2D5016] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  <UserAddIcon />
                  Daftar
                </span>
                <span className="absolute inset-0 ring-2 ring-[#2D5016] ring-offset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between h-20 px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logo.svg"
              alt="EcoMaggie Logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-[#2D5016] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-20 left-0 right-0 bg-white shadow-lg border-t">
            <div className="flex flex-col p-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 text-base poppins-medium transition-all duration-300 py-3 px-4 rounded-lg",
                      isActive
                        ? "text-[#2D5016] font-semibold bg-green-50"
                        : "text-gray-700 hover:text-[#2D5016] hover:bg-green-50"
                    )}
                  >
                    <Icon />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-4 space-y-3 border-t">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 text-[#2D5016] poppins-semibold rounded-full transition-all duration-300 border-2 border-[#2D5016] hover:bg-[#2D5016] hover:text-white"
                >
                  <LoginIcon />
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-[#2D5016] to-[#3d6b1e] text-white poppins-semibold rounded-full hover:from-[#3d6b1e] hover:to-[#4a8022] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <UserAddIcon />
                  Daftar
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
