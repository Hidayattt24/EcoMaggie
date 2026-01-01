"use client";

import { LucideIcon } from "lucide-react";

interface TransactionDetailItemProps {
  icon: LucideIcon;
  label: string;
  value: string | React.ReactNode;
  iconColor?: string;
  valueColor?: string;
}

export function TransactionDetailItem({
  icon: Icon,
  label,
  value,
  iconColor = "text-[#5a6c5b]",
  valueColor = "text-[#5a6c5b]",
}: TransactionDetailItemProps) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <div
        className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#A3AF87]/20 to-[#A3AF87]/10 rounded-xl flex items-center justify-center ${iconColor}`}
      >
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">
          {label}
        </p>
        <div className={`text-sm sm:text-base font-bold ${valueColor}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
