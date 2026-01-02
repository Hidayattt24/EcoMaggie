"use client";

import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StatsTileProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "warning" | "success" | "highlight";
  badge?: number;
  href?: string;
}

export default function StatsTile({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  badge,
  href,
}: StatsTileProps) {
  const variants = {
    default: {
      bg: "bg-white",
      iconBg: "bg-[#A3AF87]/10",
      iconColor: "text-[#A3AF87]",
    },
    warning: {
      bg: "bg-white",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    success: {
      bg: "bg-white",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    highlight: {
      bg: "bg-[#FDF8D4]",
      iconBg: "bg-[#A3AF87]/20",
      iconColor: "text-[#A3AF87]",
    },
  };

  const style = variants[variant];

  return (
    <div
      className={cn(
        "relative p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col",
        style.bg
      )}
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {badge}
        </span>
      )}

      <div className="flex items-start justify-between flex-1">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-[#303646] poppins-bold">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-xs font-semibold",
                  trend.isPositive ? "text-emerald-600" : "text-red-500"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-gray-400">vs bulan lalu</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", style.iconBg)}>
          <Icon className={cn("h-6 w-6", style.iconColor)} />
        </div>
      </div>

      {href && (
        <Link
          href={href}
          className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-medium text-[#A3AF87] hover:text-[#8a9a6e] transition-colors group"
        >
          <span>Selengkapnya</span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
