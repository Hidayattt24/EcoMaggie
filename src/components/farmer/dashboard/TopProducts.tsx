"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Package, TrendingUp } from "lucide-react";
import { getTopProducts } from "@/lib/api/farmer-dashboard.actions";
import type { TopProduct } from "@/lib/api/farmer-dashboard.actions";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
        <p className="text-sm font-semibold text-[#303646] mb-1">
          {payload[0].payload.name}
        </p>
        <p className="text-sm text-gray-600">
          Terjual:{" "}
          <span className="font-bold text-[#A3AF87]">{payload[0].value}</span>{" "}
          unit
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Rp {payload[0].payload.revenue.toLocaleString("id-ID")}
        </p>
      </div>
    );
  }
  return null;
};

export default function TopProducts() {
  const [topProductsData, setTopProductsData] = useState<
    Array<{ name: string; sold: number; revenue: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        setIsLoading(true);
        const products = await getTopProducts(5);
        const formattedData = products.map((p) => ({
          name: p.name,
          sold: p.totalSold,
          revenue: p.revenue,
        }));
        setTopProductsData(formattedData);
      } catch (error) {
        console.error("Error fetching top products:", error);
        setTopProductsData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopProducts();
  }, []);

  const totalSold = topProductsData.reduce((sum, item) => sum + item.sold, 0);

  return (
    <div className="bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#A3AF87]/10 rounded-xl">
            <Package className="h-5 w-5 text-[#A3AF87]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#303646] poppins-bold">
              Produk Terlaris
            </h3>
            <p className="text-xs text-gray-500">Top 5 bulan ini</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#303646]">{totalSold}</p>
          <p className="text-xs text-gray-400">Total terjual</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] lg:h-[220px] mb-4">
        {topProductsData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topProductsData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                width={120}
                tickFormatter={(value) =>
                  value.length > 15 ? `${value.slice(0, 15)}...` : value
                }
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(163, 175, 135, 0.1)" }}
              />
              <Bar dataKey="sold" radius={[0, 6, 6, 0]} barSize={20}>
                {topProductsData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === 0
                        ? "#A3AF87"
                        : `rgba(163, 175, 135, ${0.8 - index * 0.15})`
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada data penjualan</p>
            </div>
          </div>
        )}
      </div>

      {/* Product List with Details */}
      <div className="space-y-2">
        {topProductsData.slice(0, 3).map((product, index) => (
          <div
            key={product.name}
            className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0
                    ? "bg-[#A3AF87] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </span>
              <span className="text-sm font-medium text-[#303646] truncate max-w-[140px]">
                {product.name}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#A3AF87]">{product.sold}</p>
              <p className="text-[10px] text-gray-400">unit</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
