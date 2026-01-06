"use client";

import { useState, useEffect } from "react";
import {
  Banknote,
  ShoppingBag,
  PackageCheck,
  Truck,
  CalendarDays,
  Recycle,
} from "lucide-react";
import StatsTile from "@/components/farmer/dashboard/StatsTile";
import SalesChart from "@/components/farmer/dashboard/SalesChart";
import ImpactTile from "@/components/farmer/dashboard/ImpactTile";
import TopProducts from "@/components/farmer/dashboard/TopProducts";
import OperationalAlerts from "@/components/farmer/dashboard/OperationalAlerts";
import NotificationDropdown from "@/components/farmer/dashboard/NotificationDropdown";
import { getFarmerDashboardStats } from "@/lib/api/farmer-dashboard.actions";
import type { DashboardStats } from "@/lib/api/farmer-dashboard.actions";

export default function FarmerDashboard() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSales: 0,
    totalSalesLastMonth: 0,
    salesGrowthPercentage: 0,
    newOrders: 0,
    needsShipping: 0,
    pendingPickup: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        const stats = await getFarmerDashboardStats();
        setDashboardStats(stats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Handle hydration for date
  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#303646] poppins-bold">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Selamat datang kembali,{" "}
              <span className="font-semibold text-[#A3AF87]">
                Petani Maggot
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays className="h-4 w-4" />
              <span>{currentDate || "Loading..."}</span>
            </div>
            {/* Notification Dropdown */}
            <NotificationDropdown />
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Row 1: Hero Stats - 4 Small Tiles */}
        <StatsTile
          title="Total Penjualan"
          value={`Rp ${dashboardStats.totalSales.toLocaleString("id-ID")}`}
          icon={Banknote}
          description="Pendapatan bersih setelah potongan 5%"
          trend={
            dashboardStats.salesGrowthPercentage !== 0
              ? {
                  value: Math.abs(dashboardStats.salesGrowthPercentage),
                  isPositive: dashboardStats.salesGrowthPercentage > 0,
                }
              : undefined
          }
          variant="highlight"
          href="/farmer/orders"
        />
        <StatsTile
          title="Pesanan Baru"
          value={dashboardStats.newOrders}
          icon={ShoppingBag}
          badge={
            dashboardStats.newOrders > 0 ? dashboardStats.newOrders : undefined
          }
          variant="default"
          href="/farmer/orders"
        />
        <StatsTile
          title="Perlu Dikirim"
          value={dashboardStats.needsShipping}
          icon={PackageCheck}
          variant="warning"
          href="/farmer/orders?status=shipping"
        />
        <StatsTile
          title="Supply Masyarakat"
          value={dashboardStats.pendingPickup}
          icon={Recycle}
          description="Permintaan pickup sampah organik"
          badge={
            dashboardStats.pendingPickup > 0 ? dashboardStats.pendingPickup : undefined
          }
          variant="default"
          href="/farmer/supply-monitoring"
        />

        {/* Row 2: Sales Chart - Wide Tile (spans 2-3 columns on desktop) */}
        <div className="sm:col-span-2 lg:col-span-3">
          <SalesChart />
        </div>

        {/* Row 2 Continued: Operational Alerts - Takes remaining space */}
        <div className="sm:col-span-2 lg:col-span-1">
          <OperationalAlerts />
        </div>

        {/* Row 3: Impact Tile - Full Width on Mobile, 2 Columns on Desktop */}
        <div className="sm:col-span-2 lg:col-span-2">
          <ImpactTile />
        </div>

        {/* Row 3 Continued: Top Products - 2 Columns */}
        <div className="sm:col-span-2 lg:col-span-2">
          <TopProducts />
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="mt-6 lg:mt-8 p-4 lg:p-5 bg-gradient-to-r from-[#A3AF87]/10 to-[#FDF8D4]/30 rounded-2xl border border-[#A3AF87]/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#303646] poppins-bold">
              Aksi Cepat
            </h3>
            <p className="text-sm text-gray-500">
              Kelola operasional farm Anda dengan mudah
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/farmer/products/new"
              className="px-4 py-2.5 bg-[#A3AF87] text-white text-sm font-semibold rounded-xl hover:bg-[#8a9a6e] transition-colors shadow-sm"
            >
              + Tambah Produk
            </a>
            <a
              href="/farmer/orders"
              className="px-4 py-2.5 bg-white text-[#303646] text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Lihat Pesanan
            </a>
            <a
              href="/farmer/supply-monitoring"
              className="px-4 py-2.5 bg-white text-[#303646] text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Monitor Supply
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
