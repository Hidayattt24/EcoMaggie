"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const Navbar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative w-full">
      <nav className="fixed inset-x-0 top-0 z-50 mx-auto w-full px-4 py-4">
        {children}
      </nav>
    </div>
  );
};

export const NavBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "hidden lg:flex items-center justify-between gap-4 rounded-full border px-6 py-3 transition-all duration-300",
        isScrolled
          ? "border-gray-200 bg-white/95 shadow-lg backdrop-blur-md"
          : "border-gray-200 bg-white shadow-md",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({
  items,
  className,
  pathname,
}: {
  items: { name: string; link: string; icon?: React.ReactNode }[];
  className?: string;
  pathname?: string;
}) => {
  return (
    <div className={cn("flex items-center gap-8", className)}>
      {items.map((item, idx) => {
        const isActive =
          pathname === item.link || pathname?.startsWith(item.link + "/");
        return (
          <Link
            key={`nav-${idx}`}
            href={item.link}
            className={cn(
              "relative flex items-center gap-2 text-sm font-medium transition-all",
              isActive ? "text-[#2D5016]" : "text-gray-700 hover:text-[#2D5016]"
            )}
          >
            {item.icon}
            <span>{item.name}</span>
            {/* Active Indicator */}
            {isActive && (
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#2D5016] to-[#3d6b1e] rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
};

export const MobileNav = ({ children }: { children: React.ReactNode }) => {
  return <div className="lg:hidden">{children}</div>;
};

export const NavbarLogo = ({
  src,
  alt = "Logo",
  href = "/",
}: {
  src?: string;
  alt?: string;
  href?: string;
}) => {
  return (
    <Link href={href} className="flex items-center gap-2">
      {src ? (
        <img src={src} alt={alt} className="h-8 w-auto" />
      ) : (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2D5016] to-[#3d6b1e]" />
          <span className="text-lg font-bold text-[#2D5016]">EcoMaggie</span>
        </div>
      )}
    </Link>
  );
};

export const NavbarButton = ({
  children,
  variant = "primary",
  className,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-[#2D5016] to-[#3d6b1e] text-white hover:shadow-lg hover:scale-105",
    secondary:
      "border-2 border-[#2D5016] text-[#2D5016] hover:bg-[#2D5016] hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-6 py-2 text-sm font-semibold transition-all duration-200",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-full border px-4 py-3 transition-all duration-300",
        isScrolled
          ? "border-gray-200 bg-white/95 shadow-lg backdrop-blur-md"
          : "border-gray-200 bg-white shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-all hover:bg-gray-50"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
};

export const MobileNavMenu = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={false}
      animate={isOpen ? "open" : "closed"}
      variants={{
        open: {
          height: "auto",
          opacity: 1,
          marginTop: 16,
        },
        closed: {
          height: 0,
          opacity: 0,
          marginTop: 0,
        },
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
        {children}
      </div>
    </motion.div>
  );
};
