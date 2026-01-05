"use client";

import { useEffect, useState } from "react";
import { Recycle, Leaf, Trophy } from "lucide-react";
import { getSocialImpactData } from "@/lib/api/farmer-supply.actions";
import type { SocialImpactData } from "@/lib/api/farmer-supply.actions";

const rankColors = {
  1: "bg-amber-100 text-amber-700 border-amber-200",
  2: "bg-gray-100 text-gray-600 border-gray-200",
  3: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function ImpactTile() {
  const [impactData, setImpactData] = useState<SocialImpactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchImpactData() {
      try {
        setIsLoading(true);
        const response = await getSocialImpactData();
        if (response.success && response.data) {
          setImpactData(response.data);
        }
      } catch (error) {
        console.error("Error fetching impact data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchImpactData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#A3AF87]/5 to-[#FDF8D4]/50 p-5 lg:p-6 rounded-2xl border border-[#A3AF87]/20 shadow-sm h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-[#A3AF87] rounded-xl">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#303646] poppins-bold">
              Dampak Sosial
            </h3>
            <p className="text-xs text-gray-500">Memuat data...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#A3AF87]/5 to-[#FDF8D4]/50 p-5 lg:p-6 rounded-2xl border border-[#A3AF87]/20 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-[#A3AF87] rounded-xl">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#303646] poppins-bold">
            Dampak Sosial
          </h3>
          <p className="text-xs text-gray-500">Kontribusi lingkungan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Big Stat */}
        <div className="flex flex-col justify-center">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#A3AF87]/10 rounded-xl">
                <Recycle className="h-7 w-7 text-[#A3AF87]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Sampah</p>
                <p className="text-xs text-gray-400">Terkelola</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl lg:text-5xl font-bold text-[#303646] poppins-bold">
                {impactData?.totalWeightKg.toLocaleString("id-ID") || "0"}
              </span>
              <span className="text-xl font-semibold text-[#A3AF87]">KG</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Total sampah organik yang berhasil dikelola
            </p>

            {/* Environmental Impact */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Dampak Lingkungan</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                  <p className="text-lg font-bold text-emerald-600">
                    {impactData?.co2Reduced.toLocaleString("id-ID") || "0"}
                  </p>
                  <p className="text-[10px] text-gray-500">kg CO₂ Dikurangi</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">
                    {impactData?.familiesHelped || "0"}
                  </p>
                  <p className="text-[10px] text-gray-500">Keluarga Terbantu</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Leaderboard */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h4 className="font-semibold text-[#303646]">Top 3 Penyuplai</h4>
          </div>
          <div className="space-y-3">
            {impactData?.topSuppliers && impactData.topSuppliers.length > 0 ? (
              impactData.topSuppliers.map((supplier) => (
                <div
                  key={supplier.userId}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                      rankColors[supplier.rank as keyof typeof rankColors]
                    }`}
                  >
                    {supplier.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#303646] text-sm truncate">
                      {supplier.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {supplier.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#A3AF87] text-sm">
                      {supplier.totalWeight} kg
                    </p>
                    <p className="text-xs text-gray-400">
                      {supplier.supplyCount}x supply
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Belum ada data penyuplai</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
              <p className="text-xl font-bold text-[#303646]">
                {impactData?.totalSuppliers || 0}
              </p>
              <p className="text-xs text-gray-500">Total Penyuplai</p>
            </div>
            <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
              <p className="text-xl font-bold text-[#303646]">
                {impactData?.newSuppliers || 0}
              </p>
              <p className="text-xs text-gray-500">Penyuplai Baru</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
