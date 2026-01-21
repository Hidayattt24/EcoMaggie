import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

interface Stats {
  total: number;
  unpaid: number;
  packed: number;
  readyPickup: number;
  shipped: number;
  completed: number;
  cancelled: number;
  paidOrdersCount: number;
}

interface StatsTileProps {
  stats: Stats;
}

export const StatsTile = React.memo(({ stats }: StatsTileProps) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="col-span-12 lg:col-span-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#a3af87]/30 transition-colors p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#a3af87] rounded-xl">
          <ShoppingBag className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-[#303646]">Live Order Stats</h3>
          <p className="text-xs text-gray-500">Update realtime</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Total Orders */}
        <div className="p-4 bg-[#fdf8d4] rounded-xl border border-[#a3af87]/20">
          <p className="text-sm text-gray-600 mb-1">Total Pesanan Aktif</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-[#303646]">{stats.total}</p>
            <p className="text-lg text-gray-600">pesanan</p>
          </div>
          <p className="text-xs text-[#435664] mt-1">{stats.paidOrdersCount} sudah dibayar</p>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs text-amber-700 font-medium mb-1">Belum Dibayar</p>
            <p className="text-2xl font-bold text-amber-600">{stats.unpaid}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-700 font-medium mb-1">Dikemas</p>
            <p className="text-2xl font-bold text-blue-600">{stats.packed}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-xs text-orange-700 font-medium mb-1">Siap Diambil</p>
            <p className="text-2xl font-bold text-orange-600">{stats.readyPickup}</p>
          </div>
          <div className="p-3 bg-[#a3af87]/10 rounded-xl border border-[#a3af87]/30">
            <p className="text-xs text-[#435664] font-medium mb-1">Dikirim</p>
            <p className="text-2xl font-bold text-[#435664]">{stats.shipped}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl border border-green-200">
            <p className="text-xs text-green-700 font-medium mb-1">Selesai</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl border border-red-200">
            <p className="text-xs text-red-700 font-medium mb-1">Dibatalkan</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

StatsTile.displayName = "StatsTile";
