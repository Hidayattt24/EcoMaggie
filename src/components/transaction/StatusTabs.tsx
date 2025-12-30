"use client";

import { motion } from "framer-motion";

interface StatusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    [key: string]: number;
  };
}

const tabs = [
  { id: "unpaid", label: "Belum Bayar" },
  { id: "packed", label: "Dikemas" },
  { id: "shipped", label: "Dikirim" },
  { id: "completed", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
];

export function StatusTabs({
  activeTab,
  onTabChange,
  counts,
}: StatusTabsProps) {
  return (
    <div className="bg-white border-b-2 border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative px-4 sm:px-6 py-4 flex-shrink-0 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm sm:text-base font-bold whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "text-[#2D5016]"
                      : "text-gray-500 hover:text-[#2D5016]/70"
                  }`}
                >
                  {tab.label}
                </span>
                {counts[tab.id] > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      activeTab === tab.id
                        ? "bg-[#2D5016] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {counts[tab.id]}
                  </span>
                )}
              </div>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/80"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
