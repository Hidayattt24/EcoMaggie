"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Scale,
  Package,
  FileText,
  Image as ImageIcon,
  Truck,
  CheckCircle,
  Circle,
  Edit3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  getFarmerSupplyById,
  type SupplyWithUser,
} from "@/lib/api/farmer-supply.actions";

interface SupplyMonitoringDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusConfig = {
  PENDING: {
    label: "Menunggu Penjadwalan",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  SCHEDULED: {
    label: "Terjadwal",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
  ON_THE_WAY: {
    label: "Dalam Perjalanan",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
  },
  PICKED_UP: {
    label: "Sudah Diambil",
    color: "bg-green-50 text-green-700 border-green-200",
    dotColor: "bg-green-500",
  },
  COMPLETED: {
    label: "Selesai Diproses",
    color: "bg-[#A3AF87]/20 text-[#5a6c5b] border-[#A3AF87]",
    dotColor: "bg-[#A3AF87]",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-500",
  },
};

// Map waste type to display label
const wasteTypeLabels: Record<string, string> = {
  sisa_makanan: "Sisa Makanan",
  sayuran_buah: "Sayuran & Buah",
  sisa_dapur: "Sisa Dapur",
  campuran: "Campuran Organik",
};

// Map weight to display label
const weightLabels: Record<string, string> = {
  "1": "< 1 kg",
  "3": "1-3 kg",
  "5": "3-5 kg",
  "10": "5-10 kg",
  "15": "10-15 kg",
};

// Build timeline from status history
const buildTimeline = (supply: SupplyWithUser) => {
  const timeline = [
    {
      status: "PENDING",
      label: "Permintaan Diterima",
      date: supply.createdAt,
      completed: true,
    },
    {
      status: "SCHEDULED",
      label: "Pickup Dijadwalkan",
      date: supply.statusHistory?.find((h: any) => h.status === "SCHEDULED")?.timestamp || null,
      completed: ["SCHEDULED", "ON_THE_WAY", "PICKED_UP", "COMPLETED"].includes(supply.status),
    },
    {
      status: "ON_THE_WAY",
      label: "Driver Menuju Lokasi",
      date: supply.statusHistory?.find((h: any) => h.status === "ON_THE_WAY")?.timestamp || null,
      completed: ["ON_THE_WAY", "PICKED_UP", "COMPLETED"].includes(supply.status),
    },
    {
      status: "PICKED_UP",
      label: "Sampah Diambil",
      date: supply.pickedUpAt || supply.statusHistory?.find((h: any) => h.status === "PICKED_UP")?.timestamp || null,
      completed: ["PICKED_UP", "COMPLETED"].includes(supply.status),
    },
    {
      status: "COMPLETED",
      label: "Sampah Diterima",
      date: supply.completedAt || supply.statusHistory?.find((h: any) => h.status === "COMPLETED")?.timestamp || null,
      completed: supply.status === "COMPLETED",
    },
  ];
  
  return timeline;
};

export default function SupplyMonitoringDetailPage({
  params,
}: SupplyMonitoringDetailPageProps) {
  const { id } = use(params);
  const [supply, setSupply] = useState<SupplyWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSupply() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getFarmerSupplyById(id);
        if (response.success && response.data) {
          setSupply(response.data);
        } else {
          setError(response.message || "Gagal memuat data supply");
        }
      } catch (err) {
        console.error("Error fetching supply:", err);
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSupply();
  }, [id]);

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="flex items-start justify-between">
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Supplier Info Skeleton */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>

              {/* Waste Details Skeleton */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>

              {/* Location Skeleton */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="p-5 bg-gray-50 rounded-xl mb-4">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-28"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-40 mb-6"></div>
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !supply) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#303646] mb-2">
            Gagal Memuat Data
          </h2>
          <p className="text-gray-600 mb-6">{error || "Supply tidak ditemukan"}</p>
          <Link
            href="/farmer/supply-monitoring"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3AF87] text-white rounded-xl font-semibold hover:bg-[#95a17a] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Monitoring
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[supply.status as keyof typeof statusConfig];
  const timeline = buildTimeline(supply);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Link
            href="/farmer/supply-monitoring"
            className="inline-flex items-center gap-2 text-sm text-[#5a6c5b] hover:text-[#4a5c4b] mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Monitoring
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[#303646]">
                  Detail Supply
                </h1>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${status.color}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${status.dotColor} animate-pulse`}
                  ></div>
                  <span className="text-sm font-semibold">{status.label}</span>
                </div>
              </div>
              <p className="text-gray-600">Supply ID: {supply.supplyNumber}</p>
            </div>

            {supply.status !== "COMPLETED" && supply.status !== "CANCELLED" && (
              <Link
                href={`/farmer/supply-monitoring/action/${supply.id}`}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg transition-all"
              >
                <Edit3 className="h-4 w-4 sm:h-5 sm:w-5" />
                Update Status
              </Link>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supplier Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border-2 border-gray-100 p-6"
            >
              <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-[#A3AF87]" />
                Informasi Penyuplai
              </h3>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A3AF87] to-[#5a6c5b] flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-[#303646] mb-1">
                    {supply.userName}
                  </p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${supply.userPhone}`}
                      className="hover:text-[#A3AF87]"
                    >
                      {supply.userPhone}
                    </a>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ID: {supply.userId}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Waste Details */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border-2 border-gray-100 p-6"
            >
              <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#A3AF87]" />
                Detail Sampah
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Jenis Sampah</p>
                  <p className="font-semibold text-[#303646]">
                    {wasteTypeLabels[supply.wasteType] || supply.wasteType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estimasi Berat</p>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold text-[#303646]">
                      {weightLabels[supply.estimatedWeight] || `${supply.estimatedWeight} kg`}
                    </p>
                  </div>
                </div>
                {supply.actualWeight && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Berat Aktual</p>
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-[#A3AF87]" />
                      <p className="font-bold text-[#A3AF87]">
                        {supply.actualWeight} kg
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {supply.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Catatan dari Penyuplai
                  </p>
                  <p className="text-[#303646] mt-2">{supply.notes}</p>
                </div>
              )}

              {/* Photo Section - Enhanced for Driver Visibility */}
              {supply.photoUrl && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-base font-semibold text-[#303646] flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-[#A3AF87]" />
                      Foto Sampah
                    </p>
                    <a
                      href={supply.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#A3AF87] hover:text-[#8a9b73] font-medium flex items-center gap-1"
                    >
                      Lihat Full Screen
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  {/* Large Photo Display */}
                  <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#A3AF87]/30 shadow-xl bg-gray-100">
                    <img
                      src={supply.photoUrl}
                      alt="Foto sampah untuk pickup"
                      className="w-full h-auto min-h-[400px] max-h-[600px] object-contain bg-gray-50 cursor-pointer"
                      onClick={() => supply.photoUrl && window.open(supply.photoUrl, '_blank')}
                    />

                    {/* Overlay Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <ImageIcon className="h-4 w-4" />
                        <span className="font-medium">Klik foto untuk memperbesar</span>
                      </div>
                    </div>
                  </div>

                  {/* Helper Text for Driver */}
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs text-blue-800 flex items-start gap-2">
                      <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>
                        <strong>Info untuk Driver:</strong> Gunakan foto ini sebagai referensi untuk menemukan lokasi sampah saat pickup.
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Pickup Location - Enhanced Modern Design */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100 p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[#303646] text-lg flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-[#A3AF87] to-[#8a9b73] rounded-xl">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  Lokasi Penjemputan
                </h3>
                
                {/* Quick Action Badge */}
                {supply.pickupLatitude && supply.pickupLongitude && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-green-700">GPS Ready</span>
                  </div>
                )}
              </div>

              {/* Address Card */}
              <div className="mb-4 p-5 bg-white rounded-xl border-2 border-[#A3AF87]/20 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#A3AF87]/10 rounded-lg flex-shrink-0">
                    <MapPin className="h-5 w-5 text-[#A3AF87]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">Alamat Lengkap</p>
                    <p className="text-[#303646] font-medium leading-relaxed">{supply.pickupAddress}</p>
                  </div>
                </div>
              </div>

              {/* GPS Coordinates & Navigation Section */}
              {supply.pickupLatitude && supply.pickupLongitude ? (
                <div className="space-y-4">
                  {/* Coordinates Display - Modern Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">Koordinat GPS</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50">
                        <p className="text-[10px] text-blue-600 font-semibold mb-1 uppercase">Latitude</p>
                        <p className="text-sm font-mono font-bold text-blue-900">
                          {supply.pickupLatitude.toFixed(6)}
                        </p>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50">
                        <p className="text-[10px] text-blue-600 font-semibold mb-1 uppercase">Longitude</p>
                        <p className="text-sm font-mono font-bold text-blue-900">
                          {supply.pickupLongitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons - Enhanced */}
                  <div className="grid grid-cols-1 gap-3">
                    {/* Primary: Google Maps */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${supply.pickupLatitude},${supply.pickupLongitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-xl p-4 font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold">Buka Google Maps</p>
                            <p className="text-xs text-blue-100">Navigasi GPS langsung ke lokasi</p>
                          </div>
                        </div>
                        <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </a>

                    {/* Secondary: Copy Coordinates */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${supply.pickupLatitude},${supply.pickupLongitude}`);
                        // You can add a toast notification here
                      }}
                      className="group flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-[#A3AF87] hover:bg-[#A3AF87]/5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[#A3AF87]/10 transition-colors">
                          <svg className="h-5 w-5 text-gray-600 group-hover:text-[#A3AF87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">Salin Koordinat</p>
                          <p className="text-xs text-gray-500">Copy untuk aplikasi lain</p>
                        </div>
                      </div>
                      <svg className="h-5 w-5 text-gray-400 group-hover:text-[#A3AF87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Info Box - Driver Tips */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-green-900 mb-1">💡 Tips untuk Driver</p>
                        <p className="text-xs text-green-800 leading-relaxed">
                          Gunakan navigasi GPS untuk akurasi maksimal. Pastikan GPS aktif dan koneksi internet stabil untuk petunjuk arah real-time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* No GPS Warning - Enhanced */
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative flex items-start gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl flex-shrink-0">
                      <svg className="h-6 w-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-900 mb-2">⚠️ Koordinat GPS Tidak Tersedia</p>
                      <p className="text-xs text-amber-800 leading-relaxed mb-3">
                        User tidak menyertakan titik koordinat lokasi. Gunakan alamat di atas untuk navigasi manual atau hubungi user untuk konfirmasi lokasi yang lebih detail.
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-amber-200 rounded-full">
                          <div className="h-full w-1/3 bg-amber-500 rounded-full" />
                        </div>
                        <span className="text-xs font-semibold text-amber-700">Akurasi: Rendah</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Info */}
              {supply.pickupDate && (
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="group p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="text-xs text-purple-600 font-bold uppercase tracking-wide">Tanggal Pickup</p>
                    </div>
                    <p className="font-bold text-purple-900 text-sm">
                      {new Date(supply.pickupDate).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  
                  <div className="group p-4 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl border border-pink-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-pink-100 rounded-lg group-hover:scale-110 transition-transform">
                        <Clock className="h-4 w-4 text-pink-600" />
                      </div>
                      <p className="text-xs text-pink-600 font-bold uppercase tracking-wide">Waktu Pickup</p>
                    </div>
                    <p className="font-bold text-pink-900 text-sm">
                      {supply.pickupTimeRange || supply.pickupTimeSlot}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Driver Info (if assigned) */}
            {supply.courierName && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border-2 border-gray-100 p-6"
              >
                <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#A3AF87]" />
                  Informasi Driver
                </h3>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#303646]">
                      {supply.courierName}
                    </p>
                    {supply.courierPhone && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                        <Phone className="h-3 w-3" />
                        <a
                          href={`tel:${supply.courierPhone}`}
                          className="hover:text-[#A3AF87]"
                        >
                          {supply.courierPhone}
                        </a>
                      </div>
                    )}
                    {supply.estimatedArrival && (
                      <p className="text-sm text-gray-600 mt-1">
                        ETA: {supply.estimatedArrival}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Timeline */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 sticky top-6">
              <h3 className="font-bold text-[#303646] mb-6">
                Timeline Penjemputan
              </h3>

              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div key={index} className="relative flex gap-4">
                    {/* Timeline Line */}
                    {index < timeline.length - 1 && (
                      <div
                        className={`absolute left-4 top-10 w-0.5 h-full ${
                          item.completed ? "bg-[#A3AF87]" : "bg-gray-200"
                        }`}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                        item.completed ? "bg-[#A3AF87]" : "bg-gray-200"
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          item.completed ? "text-[#303646]" : "text-gray-400"
                        }`}
                      >
                        {item.label}
                      </p>
                      {item.date && (
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(item.date).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submitted At */}
              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                <p className="text-sm text-gray-600">Waktu Submit</p>
                <p className="text-sm font-semibold text-[#303646] mt-1">
                  {new Date(supply.createdAt).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
