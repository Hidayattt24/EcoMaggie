"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Calendar,
  Scale,
  ChevronRight,
  Search,
  Phone,
  User,
  FileText,
  Image as ImageIcon,
  X,
  MessageCircle,
  Leaf,
  TreePine,
  Loader2,
  MapPinOff,
  Sparkles,
  History,
  UserCircle,
} from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";

// Dummy data riwayat supply dengan detail lebih lengkap
const supplyHistory = [
  {
    id: "SUP-001",
    date: "2025-12-30",
    weight: 5.5,
    type: "Sisa Makanan",
    status: "completed",
    pickupDate: "2025-12-31",
    pickupTime: "08:30",
    address: "Jl. T. Nyak Arief No. 12, Banda Aceh",
    notes: "Sampah di depan pagar rumah",
    courier: {
      name: "Ahmad Ridwan",
      phone: "081234567890",
      photo: null,
    },
    farmer: {
      name: "Peternakan Maggot Aceh Jaya",
      location: "Aceh Besar",
    },
    photo: null,
  },
  {
    id: "SUP-002",
    date: "2025-12-28",
    weight: 3.2,
    type: "Sayuran & Buah",
    status: "picked_up",
    pickupDate: "2025-12-29",
    pickupTime: "14:15",
    address: "Jl. T. Nyak Arief No. 12, Banda Aceh",
    notes: "Kantong warna hitam",
    courier: {
      name: "Muhammad Faisal",
      phone: "081298765432",
      photo: null,
    },
    farmer: null,
    photo: null,
  },
  {
    id: "SUP-003",
    date: "2025-12-27",
    weight: 8.0,
    type: "Campuran Organik",
    status: "waiting",
    pickupDate: null,
    pickupTime: null,
    address: "Jl. T. Nyak Arief No. 12, Banda Aceh",
    notes: "Sampah dapur dan sisa makanan",
    courier: null,
    farmer: null,
    photo: null,
  },
  {
    id: "SUP-004",
    date: "2025-12-25",
    weight: 4.5,
    type: "Sisa Makanan",
    status: "completed",
    pickupDate: "2025-12-26",
    pickupTime: "10:00",
    address: "Jl. T. Nyak Arief No. 12, Banda Aceh",
    notes: "",
    courier: {
      name: "Ahmad Ridwan",
      phone: "081234567890",
      photo: null,
    },
    farmer: {
      name: "CV. Maggot Banda Aceh",
      location: "Banda Aceh",
    },
    photo: null,
  },
  {
    id: "SUP-005",
    date: "2025-12-20",
    weight: 6.0,
    type: "Sayuran & Buah",
    status: "completed",
    pickupDate: "2025-12-21",
    pickupTime: "16:45",
    address: "Jl. T. Nyak Arief No. 12, Banda Aceh",
    notes: "Kulit buah dan sayuran busuk",
    courier: {
      name: "Rizki Pratama",
      phone: "081387654321",
      photo: null,
    },
    farmer: {
      name: "Peternakan Maggot Aceh Jaya",
      location: "Aceh Besar",
    },
    photo: null,
  },
];

const statusConfig = {
  waiting: {
    label: "Menunggu Pickup",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    dotColor: "bg-amber-500",
  },
  picked_up: {
    label: "Sedang Diproses",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Truck,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    dotColor: "bg-blue-500",
  },
  completed: {
    label: "Selesai",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    dotColor: "bg-green-500",
  },
};

type SupplyItem = (typeof supplyHistory)[0];

export default function SupplyHistoryPage() {
  const { userLocation, isSupplyConnectAvailable, isLoading } =
    useUserLocation();

  const [activeTab, setActiveTab] = useState<
    "all" | "waiting" | "picked_up" | "completed"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<SupplyItem | null>(
    supplyHistory[0]
  );

  const filteredSupply = supplyHistory.filter((item) => {
    const matchesTab = activeTab === "all" || item.status === activeTab;
    const matchesSearch =
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalWeight = supplyHistory.reduce((acc, item) => acc + item.weight, 0);
  const completedCount = supplyHistory.filter(
    (s) => s.status === "completed"
  ).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#A3AF87] mx-auto mb-4" />
          <p className="text-gray-600">Memuat...</p>
        </motion.div>
      </div>
    );
  }

  // Location not allowed state - user not registered or outside service area
  if (!isSupplyConnectAvailable) {
    const isNotRegistered = !userLocation;

    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100"
        >
          <div
            className={`w-20 h-20 ${
              isNotRegistered ? "bg-amber-100" : "bg-red-100"
            } rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            {isNotRegistered ? (
              <UserCircle className="h-10 w-10 text-amber-500" />
            ) : (
              <MapPinOff className="h-10 w-10 text-red-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isNotRegistered
              ? "Data Alamat Tidak Ditemukan"
              : "Di Luar Jangkauan Layanan"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isNotRegistered
              ? "Silakan lengkapi data alamat Anda saat mendaftar untuk melihat Riwayat Supply."
              : `Alamat Anda (${userLocation?.kabupatenKota}, ${userLocation?.provinsi}) berada di luar wilayah layanan. Saat ini Supply Connect hanya tersedia di Kota Banda Aceh.`}
          </p>
          {isNotRegistered ? (
            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 bg-[#A3AF87] text-white py-3.5 rounded-xl font-semibold mb-3 hover:bg-[#95a17a] transition-colors"
            >
              <UserCircle className="h-5 w-5" />
              Daftar Sekarang
            </Link>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-500 py-3.5 rounded-xl font-semibold mb-3">
              <MapPinOff className="h-5 w-5" />
              Layanan Tidak Tersedia
            </div>
          )}
          <Link
            href="/supply"
            className="w-full flex items-center justify-center gap-2 text-gray-600 py-3 font-medium hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/supply"
              className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Riwayat Supply
              </h1>
              <p className="text-sm text-gray-500">
                {supplyHistory.length} total • {completedCount} selesai •{" "}
                {totalWeight.toFixed(1)} kg terkumpul
              </p>
            </div>
          </div>

          {/* Stats Cards - Desktop */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-200">
              <Scale className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                {totalWeight.toFixed(1)} kg
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">
                {completedCount} Selesai
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Grid Layout - Master-Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - List (Master) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 xl:col-span-4"
          >
            {/* Search & Filter */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan jenis atau ID..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 transition-all text-sm"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { key: "all", label: "Semua", count: supplyHistory.length },
                  {
                    key: "waiting",
                    label: "Menunggu",
                    count: supplyHistory.filter((s) => s.status === "waiting")
                      .length,
                  },
                  {
                    key: "picked_up",
                    label: "Diproses",
                    count: supplyHistory.filter((s) => s.status === "picked_up")
                      .length,
                  },
                  {
                    key: "completed",
                    label: "Selesai",
                    count: completedCount,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                      activeTab === tab.key
                        ? "bg-[#A3AF87] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.key ? "bg-white/20" : "bg-gray-200"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Supply List */}
            <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {filteredSupply.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-8 text-center border border-gray-100"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Tidak Ada Data
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Belum ada riwayat supply untuk filter ini
                    </p>
                  </motion.div>
                ) : (
                  filteredSupply.map((item) => {
                    const status =
                      statusConfig[item.status as keyof typeof statusConfig];
                    const StatusIcon = status.icon;
                    const isSelected = selectedItem?.id === item.id;

                    return (
                      <motion.button
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={() => setSelectedItem(item)}
                        className={`w-full text-left bg-white rounded-xl p-4 border-2 transition-all ${
                          isSelected
                            ? "border-[#A3AF87] shadow-md bg-[#A3AF87]/5"
                            : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${status.iconBg}`}>
                            <StatusIcon
                              className={`h-4 w-4 ${status.iconColor}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3
                                className={`font-semibold text-sm truncate ${
                                  isSelected
                                    ? "text-[#A3AF87]"
                                    : "text-gray-900"
                                }`}
                              >
                                {item.type}
                              </h3>
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dotColor}`}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                              {item.id}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Scale className="h-3 w-3" />
                                <span>{item.weight} kg</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(item.date).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "numeric",
                                      month: "short",
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column - Detail */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 xl:col-span-8"
          >
            <AnimatePresence mode="wait">
              {selectedItem ? (
                <motion.div
                  key={selectedItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Detail Header */}
                  <div className="bg-gradient-to-br from-[#A3AF87] to-[#95a17a] p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-white/70 text-sm mb-1">
                          {selectedItem.id}
                        </p>
                        <h2 className="text-2xl font-bold">
                          {selectedItem.type}
                        </h2>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          statusConfig[
                            selectedItem.status as keyof typeof statusConfig
                          ].color
                        }`}
                      >
                        {
                          statusConfig[
                            selectedItem.status as keyof typeof statusConfig
                          ].label
                        }
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-white/70 text-xs mb-1">Berat</p>
                        <p className="font-bold text-lg">
                          {selectedItem.weight} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-white/70 text-xs mb-1">
                          Tanggal Input
                        </p>
                        <p className="font-semibold">
                          {new Date(selectedItem.date).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/70 text-xs mb-1">Pickup</p>
                        <p className="font-semibold">
                          {selectedItem.pickupDate
                            ? new Date(
                                selectedItem.pickupDate
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detail Content */}
                  <div className="p-6 space-y-6">
                    {/* Address */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-[#A3AF87]/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-[#A3AF87]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Alamat Pickup
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedItem.address}
                        </p>
                        {selectedItem.notes && (
                          <p className="text-sm text-gray-500 mt-1">
                            Catatan: {selectedItem.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Courier Info */}
                    {selectedItem.courier && (
                      <div className="border border-gray-100 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Truck className="h-4 w-4 text-[#A3AF87]" />
                          Informasi Kurir
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {selectedItem.courier.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Kurir EcoMaggie
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${selectedItem.courier.phone}`}
                              className="p-2.5 bg-[#A3AF87]/10 text-[#A3AF87] rounded-xl hover:bg-[#A3AF87]/20 transition-colors"
                            >
                              <Phone className="h-5 w-5" />
                            </a>
                            <a
                              href={`https://wa.me/${selectedItem.courier.phone.replace(
                                /^0/,
                                "62"
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                            >
                              <MessageCircle className="h-5 w-5" />
                            </a>
                          </div>
                        </div>
                        {selectedItem.pickupTime && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>
                                Dijemput pukul {selectedItem.pickupTime}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Farmer Info */}
                    {selectedItem.farmer && (
                      <div className="border border-gray-100 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <TreePine className="h-4 w-4 text-[#A3AF87]" />
                          Disalurkan ke Peternak
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Leaf className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {selectedItem.farmer.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedItem.farmer.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline / Status */}
                    <div className="border border-gray-100 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <History className="h-4 w-4 text-[#A3AF87]" />
                        Status Tracking
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            status: "Input Diterima",
                            date: selectedItem.date,
                            completed: true,
                          },
                          {
                            status: "Menunggu Pickup",
                            date:
                              selectedItem.status !== "waiting"
                                ? selectedItem.date
                                : null,
                            completed: selectedItem.status !== "waiting",
                            active: selectedItem.status === "waiting",
                          },
                          {
                            status: "Dijemput Kurir",
                            date: selectedItem.pickupDate,
                            completed:
                              selectedItem.status === "picked_up" ||
                              selectedItem.status === "completed",
                            active: selectedItem.status === "picked_up",
                          },
                          {
                            status: "Selesai Disalurkan",
                            date:
                              selectedItem.status === "completed"
                                ? selectedItem.pickupDate
                                : null,
                            completed: selectedItem.status === "completed",
                          },
                        ].map((step, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="relative">
                              <div
                                className={`w-3 h-3 rounded-full mt-1.5 ${
                                  step.completed
                                    ? "bg-green-500"
                                    : step.active
                                    ? "bg-blue-500 animate-pulse"
                                    : "bg-gray-200"
                                }`}
                              />
                              {index < 3 && (
                                <div
                                  className={`absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-8 ${
                                    step.completed
                                      ? "bg-green-200"
                                      : "bg-gray-100"
                                  }`}
                                />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p
                                className={`font-medium text-sm ${
                                  step.completed || step.active
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.status}
                              </p>
                              {step.date && (
                                <p className="text-xs text-gray-500">
                                  {new Date(step.date).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        href={`/supply/${selectedItem.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#A3AF87] text-white rounded-xl font-semibold hover:bg-[#95a17a] transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Lihat Detail Lengkap
                      </Link>
                      {selectedItem.status === "waiting" && (
                        <button className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors">
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 h-full min-h-[500px] flex flex-col items-center justify-center"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="font-semibold text-gray-600 mb-2">
                    Pilih Item dari Daftar
                  </h3>
                  <p className="text-gray-400 text-sm max-w-xs">
                    Klik salah satu riwayat supply di sebelah kiri untuk melihat
                    detail lengkapnya
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
