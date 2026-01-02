"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Banknote,
  ShoppingBag,
  PackageCheck,
  Truck,
  CalendarDays,
  Bell,
} from "lucide-react";
import StatsTile from "@/components/farmer/dashboard/StatsTile";
import SalesChart from "@/components/farmer/dashboard/SalesChart";
import ImpactTile from "@/components/farmer/dashboard/ImpactTile";
import TopProducts from "@/components/farmer/dashboard/TopProducts";
import OperationalAlerts from "@/components/farmer/dashboard/OperationalAlerts";

// Dummy stats data
const dashboardStats = {
  totalSales: 15750000,
  newOrders: 12,
  needsShipping: 8,
  pendingPickup: 5,
};

export default function FarmerDashboard() {
  const [currentDate, setCurrentDate] = useState<string>("");

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
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays className="h-4 w-4" />
              <span>{currentDate || "Loading..."}</span>
            </div>
            {/* Notification Icon (Desktop) */}
            <Link
              href="/farmer/orders"
              className="relative flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Notifikasi"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                8
              </span>
            </Link>
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
          trend={{ value: 12.5, isPositive: true }}
          variant="highlight"
          href="/farmer/analytics"
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
          title="Menunggu Pickup"
          value={dashboardStats.pendingPickup}
          icon={Truck}
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
