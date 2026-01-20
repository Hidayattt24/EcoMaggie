import React from "react";
import { motion } from "framer-motion";
import { Banknote, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface Stats {
  totalRevenue: number;
  totalSales: number;
  needsAction: number;
  cancelled: number;
  paidOrdersCount: number;
  orderGrowth: number;
  currentPeriodOrderCount: number;
  previousPeriodOrderCount: number;
}

interface RevenueTileProps {
  stats: Stats;
}

export const RevenueTile = React.memo(({ stats }: RevenueTileProps) => {
  const isPositiveGrowth = stats.orderGrowth > 0;
  const hasGrowthData = stats.orderGrowth !== 0;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="col-span-12 lg:col-span-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#A3AF87]/30 transition-colors p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#A3AF87] to-[#8a9a6e] rounded-xl">
            <Banknote className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[#303646]">Ringkasan Pendapatan</h3>
            <p className="text-xs text-gray-500">Dari pesanan yang sudah dibayar</p>
          </div>
        </div>
        {/* Dynamic Growth Badge */}
        {/* {hasGrowthData && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isPositiveGrowth ? "bg-emerald-50" : "bg-red-50"
            }`}
          >
            {isPositiveGrowth ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-xs font-semibold ${
                isPositiveGrowth ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {isPositiveGrowth ? "+" : ""}
              {stats.orderGrowth} order
            </span>
          </div>
        )} */}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-[#A3AF87]/10 to-[#FDF8D4]/30 rounded-xl">
          <p className="text-xs text-gray-600 mb-1">Pendapatan Bersih</p>
          <p className="text-xl font-bold text-[#303646]">Rp {stats.totalRevenue.toLocaleString("id-ID")}</p>
          <p className="text-[10px] text-gray-500 mt-1">Setelah potongan 5%</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600 mb-1">Total Penjualan</p>
          <p className="text-xl font-bold text-[#303646]">Rp {stats.totalSales.toLocaleString("id-ID")}</p>
          <p className="text-[10px] text-gray-500 mt-1">Termasuk ongkir</p>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl">
          <p className="text-xs text-amber-700 mb-1">Menunggu Proses</p>
          <p className="text-xl font-bold text-amber-600">{stats.needsAction}</p>
          <p className="text-[10px] text-amber-600/70 mt-1">Butuh tindakan</p>
        </div>
        <div className="p-4 bg-red-50 rounded-xl">
          <p className="text-xs text-red-700 mb-1">Dibatalkan</p>
          <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-[10px] text-red-600/70 mt-1">Total cancel</p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs text-blue-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Pendapatan bersih dihitung dari subtotal produk setelah potongan platform 5%. Ongkir tidak termasuk karena diteruskan ke kurir.</span>
        </p>
      </div>
    </motion.div>
  );
});

RevenueTile.displayName = "RevenueTile";
