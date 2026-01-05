"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import React from "react";
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
  { name: "Beranda", href: "#beranda-section", icon: HomeIcon },
  { name: "Tentang", href: "#tentang-section", icon: InfoIcon },
  { name: "Solusi", href: "#solusi-section", icon: LightbulbIcon },
  { name: "Dampak", href: "#dampak-section", icon: ChartIcon },
  { name: "Testimoni", href: "#testimoni-section", icon: StarIcon },
];

export default function NavbarLandingPage() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda-section");

  // Detect active section on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "beranda-section",
        "tentang-section",
        "solusi-section",
        "dampak-section",
        "testimoni-section",
      ];

      const scrollPosition = window.scrollY + 150; // Offset untuk navbar

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll handler untuk smooth scrolling
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(targetId);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:block fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div
          className="shadow-lg bg-white/90 backdrop-blur-md"
          style={{
            width: "1100px",
            height: "70px",
            borderRadius: "45px",
          }}
        >
          <div className="flex items-center justify-between h-full px-6">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/assets/logo.svg"
                alt="Logo EcoMaggie - Platform Pengelolaan Sampah Organik dan Budidaya Maggot Indonesia"
                width={100}
                height={100}
                className="w-36 h-36"
              />
            </Link>

            {/* Navigation Menu */}
            <div className="flex items-center gap-3">
              {navigationItems.map((item) => {
                const sectionId = item.href.replace("#", "");
                const isActive = activeSection === sectionId;
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={cn(
                      "flex items-center gap-1.5 text-sm poppins-medium transition-all duration-300 relative py-2 px-2.5 rounded-lg cursor-pointer",
                      isActive
                        ? "text-white font-semibold"
                        : "text-[#303646] hover:text-[#A3AF87]"
                    )}
                    style={{
                      backgroundColor: isActive ? "#A3AF87" : "transparent",
                    }}
                  >
                    <Icon />
                    <span className="text-xs">{item.name}</span>
                  </a>
                );
              })}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm poppins-semibold rounded-full transition-all duration-300 border-2"
                style={{
                  color: "#A3AF87",
                  borderColor: "#A3AF87",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#A3AF87";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#A3AF87";
                }}
              >
                <span className="flex items-center gap-2">
                  <LoginIcon />
                  Masuk
                </span>
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 text-sm poppins-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-xl"
                style={{
                  backgroundColor: "#A3AF87",
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8a9670";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#A3AF87";
                }}
              >
                <span className="flex items-center gap-2">
                  <UserAddIcon />
                  Daftar
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50">
        {/* Navbar Container */}
        <div className="bg-white/95 backdrop-blur-lg shadow-lg">
          <div className="flex items-center justify-between h-20 px-4">
            {/* Logo - Enlarged */}
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/logo.svg"
                alt="EcoMaggie Logo"
                width={100}
                height={100}
                className="w-28 h-28"
              />
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative p-3 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ backgroundColor: "#A3AF87" }}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={cn(
                    "block w-6 h-0.5 bg-white rounded-full transition-all duration-300",
                    mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  )}
                ></span>
                <span
                  className={cn(
                    "block w-6 h-0.5 bg-white rounded-full my-1 transition-all duration-300",
                    mobileMenuOpen ? "opacity-0" : "opacity-100"
                  )}
                ></span>
                <span
                  className={cn(
                    "block w-6 h-0.5 bg-white rounded-full transition-all duration-300",
                    mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  )}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Enhanced Design */}
        <div
          className={cn(
            "absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl border-b border-green-100 transition-all duration-300 overflow-hidden",
            mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="p-4 space-y-3">
            {/* Navigation Items */}
            <div className="space-y-2">
              {navigationItems.map((item, index) => {
                const sectionId = item.href.replace("#", "");
                const isActive = activeSection === sectionId;
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={cn(
                      "flex items-center gap-3 text-base poppins-medium transition-all duration-300 py-3.5 px-4 rounded-xl cursor-pointer transform",
                      isActive
                        ? "text-[#2D5016] shadow-md scale-[1.02]"
                        : "text-gray-700 hover:text-[#A3AF87] hover:bg-green-50 hover:pl-6"
                    )}
                    style={{
                      backgroundColor: isActive ? "#A3AF87" : "transparent",
                      animationDelay: `${index * 50}ms`,
                      animation: mobileMenuOpen
                        ? "slideInRight 0.3s ease-out forwards"
                        : "none",
                    }}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: mobileMenuOpen
                        ? "slideInRight 0.3s ease-out forwards"
                        : "none",
                    }}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        isActive ? "bg-white/30" : "bg-green-50"
                      )}
                    >
                      <Icon />
                    </div>
                    <span>{item.name}</span>
                    {isActive && (
                      <svg
                        className="w-5 h-5 ml-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </a>
                );
              })}
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs text-gray-500 bg-white poppins-medium">
                  Akses Akun
                </span>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="space-y-3 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 text-[#A3AF87] poppins-semibold rounded-xl transition-all duration-300 border-2 border-[#A3AF87] hover:bg-[#A3AF87] hover:text-white transform hover:scale-[1.02] active:scale-95"
              >
                <LoginIcon />
                Masuk ke Akun
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 text-white poppins-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
                style={{
                  backgroundColor: "#A3AF87",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8a9670";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#A3AF87";
                }}
              >
                <UserAddIcon />
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
