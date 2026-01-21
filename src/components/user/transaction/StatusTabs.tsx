"use client";

import { motion } from "framer-motion";
import { CreditCard, Package, Store, Truck, CheckCircle, XCircle, LayoutGrid } from "lucide-react";

interface StatusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    [key: string]: number;
  };
}

const tabs = [
  { id: "all", label: "Semua", icon: LayoutGrid },
  { id: "unpaid", label: "Belum Bayar", icon: CreditCard },
  { id: "packed", label: "Dikemas", icon: Package },
  { id: "ready_pickup", label: "Siap Diambil", icon: Store },
  { id: "shipped", label: "Dikirim", icon: Truck },
  { id: "completed", label: "Selesai", icon: CheckCircle },
  { id: "cancelled", label: "Dibatalkan", icon: XCircle },
];

export function StatusTabs({
  activeTab,
  onTabChange,
  counts,
}: StatusTabsProps) {
  return (
    <div className="bg-white border-b border-[#A3AF87]/20 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative px-4 sm:px-6 py-4 flex-shrink-0 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
                      activeTab === tab.id
                        ? "text-[#A3AF87]"
                        : "text-gray-400 group-hover:text-[#A3AF87]/70"
                    }`}
                  />
                  <span
                    className={`text-sm sm:text-base font-bold whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "text-[#5a6c5b]"
                        : "text-gray-500 group-hover:text-[#5a6c5b]/70"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {counts[tab.id] > 0 && (
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-full transition-colors ${
                        activeTab === tab.id
                          ? "bg-[#A3AF87] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {counts[tab.id]}
                    </span>
                  )}
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A3AF87]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
