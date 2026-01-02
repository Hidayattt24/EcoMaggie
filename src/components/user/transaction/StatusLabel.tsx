"use client";

import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  LucideIcon,
} from "lucide-react";

interface StatusLabelProps {
  status: "unpaid" | "packed" | "shipped" | "completed" | "cancelled";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const statusConfig = {
  unpaid: {
    label: "Menunggu Pembayaran",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: Clock,
  },
  packed: {
    label: "Sedang Dikemas",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Package,
  },
  shipped: {
    label: "Dalam Pengiriman",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Truck,
  },
  completed: {
    label: "Pesanan Selesai",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
};

const sizeClasses = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function StatusLabel({
  status,
  size = "md",
  showIcon = true,
}: StatusLabelProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border-2 ${config.color} ${sizeClasses[size]}`}
    >
      {showIcon && <StatusIcon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </div>
  );
}
