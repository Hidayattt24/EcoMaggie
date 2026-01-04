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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#A3AF87] mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail supply...</p>
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
                      className="w-full h-auto min-h-[400px] max-h-[600px] object-contain bg-gray-50"
                      onClick={() => window.open(supply.photoUrl, '_blank')}
                      style={{ cursor: 'pointer' }}
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

            {/* Pickup Location */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border-2 border-gray-100 p-6"
            >
              <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#A3AF87]" />
                Lokasi Penjemputan
              </h3>

              <div className="p-4 bg-[#A3AF87]/5 rounded-xl border border-[#A3AF87]/20">
                <p className="text-[#303646] font-medium">{supply.pickupAddress}</p>
              </div>

              {supply.pickupDate && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Tanggal Pickup
                    </p>
                    <p className="font-semibold text-[#303646]">
                      {new Date(supply.pickupDate).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Waktu Pickup
                    </p>
                    <p className="font-semibold text-[#303646]">
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
