"use client";

import { use } from "react";
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
  ArrowRight,
  Edit3,
} from "lucide-react";

interface SupplyMonitoringDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock supply detail data
const getSupplyDetail = (id: string) => ({
  id: id,
  supplierId: "USR-123",
  supplierName: "Ahmad Yani",
  supplierPhone: "082288953268",
  wasteType: "Sisa Makanan",
  weight: "3-5 kg",
  estimatedWeight: 4,
  actualWeight: null,
  address: "Jl. T. Nyak Arief No. 12, Lamnyong, Banda Aceh",
  pickupDate: "2026-01-04",
  pickupTime: "08:00 - 10:00",
  timeSlot: "pagi",
  status: "waiting",
  submittedAt: "2026-01-03T14:30:00",
  scheduledAt: null,
  pickedUpAt: null,
  completedAt: null,
  driver: null,
  driverPhone: null,
  estimatedArrival: null,
  notes: "Sampah di depan pagar, kantong hitam",
  condition: null,
  photo: "/assets/dummy/waste-sample.jpg",
  timeline: [
    {
      status: "submitted",
      label: "Permintaan Diterima",
      date: "3 Jan 2026, 14:30",
      completed: true,
    },
    {
      status: "scheduled",
      label: "Pickup Dijadwalkan",
      date: null,
      completed: false,
    },
    {
      status: "on_route",
      label: "Driver Menuju Lokasi",
      date: null,
      completed: false,
    },
    {
      status: "completed",
      label: "Sampah Diterima",
      date: null,
      completed: false,
    },
  ],
});

const statusConfig = {
  waiting: {
    label: "Menunggu Penjadwalan",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  scheduled: {
    label: "Terjadwal",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
  on_route: {
    label: "Dalam Perjalanan",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
  },
  completed: {
    label: "Selesai Diproses",
    color: "bg-[#A3AF87]/20 text-[#5a6c5b] border-[#A3AF87]",
    dotColor: "bg-[#A3AF87]",
  },
};

export default function SupplyMonitoringDetailPage({
  params,
}: SupplyMonitoringDetailPageProps) {
  const { id } = use(params);
  const supply = getSupplyDetail(id);
  const status = statusConfig[supply.status as keyof typeof statusConfig];

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
              <p className="text-gray-600">Supply ID: {supply.id}</p>
            </div>

            {supply.status !== "completed" && (
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
                    {supply.supplierName}
                  </p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${supply.supplierPhone}`}
                      className="hover:text-[#A3AF87]"
                    >
                      {supply.supplierPhone}
                    </a>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ID: {supply.supplierId}
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
                    {supply.wasteType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estimasi Berat</p>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold text-[#303646]">
                      {supply.weight} (~{supply.estimatedWeight} kg)
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

              {supply.photo && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-3">Foto Sampah</p>
                  <div className="relative w-full max-w-md">
                    <img
                      src={supply.photo}
                      alt="Waste photo"
                      className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                    />
                  </div>
                </div>
              )}

              {supply.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Catatan dari Penyuplai
                  </p>
                  <p className="text-[#303646] mt-2">{supply.notes}</p>
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
                <p className="text-[#303646] font-medium">{supply.address}</p>
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
                      {supply.pickupTime}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Driver Info (if assigned) */}
            {supply.driver && (
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
                      {supply.driver}
                    </p>
                    {supply.driverPhone && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                        <Phone className="h-3 w-3" />
                        <a
                          href={`tel:${supply.driverPhone}`}
                          className="hover:text-[#A3AF87]"
                        >
                          {supply.driverPhone}
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
                {supply.timeline.map((item, index) => (
                  <div key={index} className="relative flex gap-4">
                    {/* Timeline Line */}
                    {index < supply.timeline.length - 1 && (
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
                          {item.date}
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
                  {new Date(supply.submittedAt).toLocaleString("id-ID", {
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
