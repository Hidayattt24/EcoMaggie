"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Recycle,
  Package,
  History,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  Truck,
  TreePine,
  Globe,
  AlertTriangle,
  Leaf,
  Users,
  Scale,
  MapPinOff,
  Info,
  Sparkles,
  UtensilsCrossed,
  Apple,
  Egg,
  Soup,
  UserCircle,
} from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";

type LocationStatus = "loading" | "allowed" | "not_allowed" | "not_registered";

export default function SupplyPage() {
  const { userLocation, isSupplyConnectAvailable, isLoading, hasAddress } =
    useUserLocation();
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("loading");

  // Determine location status based on user address data from database
  useEffect(() => {
    if (isLoading) {
      setLocationStatus("loading");
      return;
    }

    // User belum set alamat di database
    if (!hasAddress || !userLocation) {
      setLocationStatus("not_registered");
      return;
    }

    // User sudah set alamat, cek apakah di wilayah layanan
    if (isSupplyConnectAvailable) {
      setLocationStatus("allowed");
    } else {
      setLocationStatus("not_allowed");
    }
  }, [userLocation, isSupplyConnectAvailable, isLoading, hasAddress]);

  const isLocationAllowed = locationStatus === "allowed";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statsData = [
    {
      icon: Recycle,
      value: "1,250",
      label: "kg Sampah",
      color: "text-[#A3AF87]",
      bgColor: "bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5",
      iconBg: "bg-gradient-to-br from-[#A3AF87] to-[#95a17a]",
    },
    { 
      icon: Users, 
      value: "48", 
      label: "Kontributor", 
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-50/50",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    { 
      icon: TreePine, 
      value: "12", 
      label: "Peternak", 
      color: "text-amber-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-50/50",
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
    },
    {
      icon: Leaf,
      value: "500",
      label: "kg CO₂ Tersimpan",
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-50/50",
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: Package,
      title: "Kumpulkan Sampah",
      desc: "Pisahkan sampah organik dari rumah tangga Anda seperti sisa makanan, sayuran, dan buah.",
    },
    {
      step: 2,
      icon: Recycle,
      title: "Input Data Sampah",
      desc: "Catat jenis sampah, perkiraan berat, dan jadwalkan waktu pickup yang sesuai.",
    },
    {
      step: 3,
      icon: Truck,
      title: "Pickup Gratis",
      desc: "Tim kurir EcoMaggie akan datang ke lokasi Anda untuk mengambil sampah organik.",
    },
    {
      step: 4,
      icon: TreePine,
      title: "Jadi Pakan Maggot",
      desc: "Sampah diolah menjadi pakan maggot BSF yang mendukung pertanian berkelanjutan.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 lg:mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#A3AF87]/10 px-4 py-2 rounded-full mb-4">
            <Recycle className="h-4 w-4 text-[#A3AF87]" />
            <span className="text-xs font-bold text-[#A3AF87] tracking-wider uppercase">
              Supply Connect
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Ubah Sampah Organik Jadi
            <span className="text-[#A3AF87]"> Manfaat untuk Bumi</span>
          </h1>
          <p className="text-gray-500 text-sm lg:text-base max-w-2xl mx-auto">
            Berkontribusi untuk lingkungan yang lebih bersih dengan menyetorkan
            sampah organik rumah tangga Anda. Gratis pickup untuk wilayah Banda
            Aceh.
          </p>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Info & Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 space-y-6"
          >
            {/* Location Check Card */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl transition-colors ${
                      locationStatus === "allowed"
                        ? "bg-green-100"
                        : locationStatus === "not_allowed"
                        ? "bg-red-100"
                        : locationStatus === "not_registered"
                        ? "bg-amber-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {locationStatus === "loading" ? (
                      <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
                    ) : locationStatus === "allowed" ? (
                      <MapPin className="h-6 w-6 text-green-600" />
                    ) : locationStatus === "not_allowed" ? (
                      <MapPinOff className="h-6 w-6 text-red-600" />
                    ) : (
                      <UserCircle className="h-6 w-6 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Status Wilayah Layanan
                    </h3>
                    <p className="text-xs text-gray-500">
                      Berdasarkan alamat pendaftaran Anda
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Status Display */}
              <AnimatePresence mode="wait">
                {locationStatus === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                      <p className="text-sm text-gray-700">
                        Memuat data lokasi...
                      </p>
                    </div>
                  </motion.div>
                )}

                {locationStatus === "not_registered" && (
                  <motion.div
                    key="not_registered"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-200"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium">
                          Alamat Belum Terdaftar
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Anda belum memiliki alamat yang terdaftar. Silakan
                          tambahkan alamat terlebih dahulu untuk menggunakan
                          fitur Supply Connect.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {locationStatus === "allowed" && userLocation && (
                  <motion.div
                    key="allowed"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-green-800 font-medium">
                          {userLocation.kabupatenKota}, {userLocation.provinsi}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Lokasi terverifikasi! Anda dapat menggunakan semua
                          fitur Supply Connect.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {locationStatus === "not_allowed" && userLocation && (
                  <motion.div
                    key="not_allowed"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 rounded-xl p-4 mb-4 border border-red-200"
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-800 font-medium">
                          Di Luar Jangkauan Layanan
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          Alamat Anda ({userLocation.kabupatenKota},{" "}
                          {userLocation.provinsi}) berada di luar wilayah
                          layanan. Saat ini Supply Connect hanya tersedia untuk
                          wilayah Kota Banda Aceh.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button based on status */}
              {locationStatus === "not_registered" ? (
                <Link
                  href="/profile/addresses"
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all bg-[#A3AF87] text-white hover:bg-[#95a17a] shadow-lg hover:shadow-xl"
                >
                  <MapPin className="h-4 w-4" />
                  Tambah Alamat
                </Link>
              ) : locationStatus === "not_allowed" ? (
                <div className="text-center py-3 px-4 rounded-xl bg-gray-100 text-gray-500 text-sm">
                  <MapPinOff className="h-4 w-4 inline mr-2" />
                  Layanan tidak tersedia di wilayah Anda
                </div>
              ) : locationStatus === "allowed" ? (
                <div className="text-center py-3 px-4 rounded-xl bg-green-100 text-green-700 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Fitur Supply Connect Aktif
                </div>
              ) : null}
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4"
            >
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`${stat.bgColor} rounded-2xl p-5 border-2 border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}
                  >
                    {/* Background decoration */}
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    
                    {/* Icon with gradient background */}
                    <div className={`inline-flex p-2.5 rounded-xl ${stat.iconBg} shadow-lg mb-3 relative z-10`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    
                    {/* Value */}
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 relative z-10">
                      {stat.value}
                    </p>
                    
                    {/* Label */}
                    <p className={`text-xs font-semibold ${stat.color} relative z-10`}>
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Impact Info */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-[#A3AF87]/5 to-[#95a17a]/10 rounded-2xl p-5 border border-[#A3AF87]/10"
            >
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-5 w-5 text-[#A3AF87]" />
                <h3 className="font-semibold text-gray-900">
                  Dampak untuk Bumi
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Setiap kilogram sampah organik yang Anda sumbangkan membantu
                mengurangi emisi gas rumah kaca dan mendukung pertanian
                berkelanjutan. Bersama kita wujudkan lingkungan yang lebih
                bersih.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column - Actions & How It Works */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-6"
          >
            {/* Action Cards */}
            <motion.div variants={itemVariants}>
              <AnimatePresence mode="wait">
                {isLocationAllowed ? (
                  <motion.div
                    key="enabled"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <Link
                      href="/supply/input"
                      className="group relative bg-gradient-to-br from-[#A3AF87] to-[#95a17a] rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                      <div className="relative">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                          <Package className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">
                          Input Sampah Baru
                        </h3>
                        <p className="text-white/70 text-sm">
                          Catat dan jadwalkan pickup sampah organik Anda
                        </p>
                        <div className="flex items-center gap-1 text-white/80 text-sm mt-4 group-hover:text-white transition-colors">
                          <span>Mulai Sekarang</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/supply/history"
                      className="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#A3AF87]/30 hover:shadow-lg transition-all"
                    >
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#A3AF87]/10 transition-colors">
                        <History className="h-7 w-7 text-gray-600 group-hover:text-[#A3AF87] transition-colors" />
                      </div>
                      <h3 className="text-gray-900 font-bold text-lg mb-1">
                        Riwayat Supply
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Lihat semua data dan status pickup Anda
                      </p>
                      <div className="flex items-center gap-1 text-gray-400 text-sm mt-4 group-hover:text-[#A3AF87] transition-colors">
                        <span>Lihat Riwayat</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="disabled"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-200 text-center"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPinOff className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-700 font-semibold text-lg mb-2">
                      {locationStatus === "not_registered"
                        ? "Alamat Belum Terdaftar"
                        : "Di Luar Jangkauan Layanan"}
                    </h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
                      {locationStatus === "not_registered"
                        ? "Anda belum memiliki alamat yang terdaftar. Silakan tambahkan alamat terlebih dahulu untuk menggunakan fitur Supply Connect."
                        : `Alamat Anda (${userLocation?.kabupatenKota}, ${userLocation?.provinsi}) berada di luar wilayah layanan. Saat ini Supply Connect hanya tersedia untuk wilayah Aceh (NAD) - Kota Banda Aceh.`}
                    </p>
                    {locationStatus === "not_registered" ? (
                      <Link
                        href="/profile/addresses"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3AF87] text-white rounded-xl font-semibold text-sm hover:bg-[#95a17a] transition-colors"
                      >
                        <MapPin className="h-4 w-4" />
                        Tambah Alamat
                      </Link>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-500 rounded-xl font-semibold text-sm cursor-not-allowed">
                        <MapPinOff className="h-4 w-4" />
                        Layanan Tidak Tersedia
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* How It Works */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#A3AF87]/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-[#A3AF87]" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Bagaimana Cara Kerjanya?
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {howItWorks.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative bg-white rounded-xl p-4 border border-gray-100 hover:border-[#A3AF87]/20 hover:shadow-md transition-all group"
                    >
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#A3AF87] text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {item.step}
                      </div>
                      <div className="flex items-start gap-3 pt-2">
                        <div className="p-2 bg-[#A3AF87]/10 rounded-lg group-hover:bg-[#A3AF87]/20 transition-colors">
                          <Icon className="h-5 w-5 text-[#A3AF87]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Jenis Sampah Info */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 border border-gray-100"
            >
              <h3 className="font-bold text-gray-900 mb-4">
                Jenis Sampah yang Diterima
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    name: "Sisa Makanan",
                    icon: UtensilsCrossed,
                    color: "bg-orange-50 border-orange-100",
                    iconColor: "text-orange-500",
                  },
                  {
                    name: "Sayuran & Buah",
                    icon: Apple,
                    color: "bg-green-50 border-green-100",
                    iconColor: "text-green-500",
                  },
                  {
                    name: "Kulit Telur",
                    icon: Egg,
                    color: "bg-amber-50 border-amber-100",
                    iconColor: "text-amber-500",
                  },
                  {
                    name: "Sisa Dapur",
                    icon: Soup,
                    color: "bg-red-50 border-red-100",
                    iconColor: "text-red-500",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className={`${item.color} rounded-xl p-3 text-center border`}
                    >
                      <div className="flex justify-center mb-1">
                        <Icon className={`h-6 w-6 ${item.iconColor}`} />
                      </div>
                      <p className="text-xs font-medium text-gray-700">
                        {item.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
