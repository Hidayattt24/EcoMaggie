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
  LocateFixed,
  AlertTriangle,
  Leaf,
  Users,
  Scale,
  MapPinOff,
  RefreshCw,
  Info,
  Sparkles,
} from "lucide-react";

// Koordinat batas Banda Aceh yang lebih akurat
const BANDA_ACEH_BOUNDS = {
  north: 5.6,
  south: 5.5,
  east: 95.4,
  west: 95.25,
};

type LocationStatus =
  | "idle"
  | "checking"
  | "allowed"
  | "not_allowed"
  | "error"
  | "denied";

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  address: string;
}

export default function SupplyPage() {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    address: "",
  });
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isLocationAllowed = locationStatus === "allowed";

  const checkLocation = () => {
    setLocationStatus("checking");
    setErrorMessage("");

    if (!navigator.geolocation) {
      setLocationStatus("error");
      setErrorMessage(
        "Browser Anda tidak mendukung Geolocation. Silakan gunakan browser modern."
      );
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        const isInBandaAceh =
          latitude >= BANDA_ACEH_BOUNDS.south &&
          latitude <= BANDA_ACEH_BOUNDS.north &&
          longitude >= BANDA_ACEH_BOUNDS.west &&
          longitude <= BANDA_ACEH_BOUNDS.east;

        setLocationData({
          latitude,
          longitude,
          accuracy,
          address: isInBandaAceh
            ? "Kota Banda Aceh, Aceh"
            : "Di luar jangkauan layanan",
        });

        if (isInBandaAceh) {
          setLocationStatus("allowed");
        } else {
          setLocationStatus("not_allowed");
          setErrorMessage(
            `Lokasi Anda terdeteksi di luar wilayah Banda Aceh. Layanan Supply Connect saat ini hanya tersedia untuk wilayah Kota Banda Aceh.`
          );
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus("denied");
            setErrorMessage(
              "Akses lokasi ditolak. Untuk menggunakan fitur ini, izinkan akses lokasi di pengaturan browser Anda."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationStatus("error");
            setErrorMessage(
              "Informasi lokasi tidak tersedia. Pastikan GPS perangkat Anda aktif dan coba lagi."
            );
            break;
          case error.TIMEOUT:
            setLocationStatus("error");
            setErrorMessage(
              "Permintaan lokasi timeout. Periksa koneksi internet Anda dan coba lagi."
            );
            break;
          default:
            setLocationStatus("error");
            setErrorMessage(
              "Terjadi kesalahan saat mengambil lokasi. Silakan coba lagi."
            );
        }
      },
      options
    );
  };

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
      icon: Scale,
      value: "1,250",
      label: "kg Sampah",
      color: "text-emerald-600",
    },
    { icon: Users, value: "48", label: "Kontributor", color: "text-blue-600" },
    { icon: TreePine, value: "12", label: "Peternak", color: "text-amber-600" },
    {
      icon: Leaf,
      value: "500",
      label: "kg CO₂ Tersimpan",
      color: "text-green-600",
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
          <div className="inline-flex items-center gap-2 bg-[#2D5016]/10 px-4 py-2 rounded-full mb-4">
            <Recycle className="h-4 w-4 text-[#2D5016]" />
            <span className="text-xs font-bold text-[#2D5016] tracking-wider uppercase">
              Supply Connect
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Ubah Sampah Organik Jadi
            <span className="text-[#2D5016]"> Manfaat untuk Bumi</span>
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
                        : locationStatus === "not_allowed" ||
                          locationStatus === "denied"
                        ? "bg-red-100"
                        : locationStatus === "error"
                        ? "bg-amber-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {locationStatus === "checking" ? (
                      <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
                    ) : locationStatus === "allowed" ? (
                      <MapPin className="h-6 w-6 text-green-600" />
                    ) : locationStatus === "not_allowed" ||
                      locationStatus === "denied" ? (
                      <MapPinOff className="h-6 w-6 text-red-600" />
                    ) : locationStatus === "error" ? (
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    ) : (
                      <LocateFixed className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Verifikasi Lokasi
                    </h3>
                    <p className="text-xs text-gray-500">
                      Layanan tersedia di Banda Aceh
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Status Display */}
              <AnimatePresence mode="wait">
                {locationStatus === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100"
                  >
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">
                          Verifikasi Diperlukan
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Klik tombol di bawah untuk mengecek apakah lokasi Anda
                          berada dalam jangkauan layanan.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {locationStatus === "checking" && (
                  <motion.div
                    key="checking"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                      <p className="text-sm text-gray-700">
                        Mengecek lokasi Anda...
                      </p>
                    </div>
                  </motion.div>
                )}

                {locationStatus === "allowed" && (
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
                          {locationData.address}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Lokasi terverifikasi! Anda dapat menggunakan semua
                          fitur Supply Connect.
                        </p>
                        {locationData.accuracy && (
                          <p className="text-xs text-green-500 mt-1">
                            Akurasi: ±{Math.round(locationData.accuracy)}m
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {(locationStatus === "not_allowed" ||
                  locationStatus === "denied" ||
                  locationStatus === "error") && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`rounded-xl p-4 mb-4 border ${
                      locationStatus === "error"
                        ? "bg-amber-50 border-amber-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {locationStatus === "error" ? (
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            locationStatus === "error"
                              ? "text-amber-800"
                              : "text-red-800"
                          }`}
                        >
                          {locationStatus === "denied"
                            ? "Akses Lokasi Ditolak"
                            : locationStatus === "not_allowed"
                            ? "Di Luar Jangkauan Layanan"
                            : "Terjadi Kesalahan"}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            locationStatus === "error"
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Check Location Button */}
              <button
                onClick={checkLocation}
                disabled={locationStatus === "checking"}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  locationStatus === "checking"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : locationStatus === "allowed"
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-[#2D5016] text-white hover:bg-[#3d6b1e] shadow-lg hover:shadow-xl"
                }`}
              >
                {locationStatus === "checking" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mengecek...
                  </>
                ) : locationStatus === "allowed" ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Cek Ulang Lokasi
                  </>
                ) : (
                  <>
                    <LocateFixed className="h-4 w-4" />
                    Cek Lokasi Presisi
                  </>
                )}
              </button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-3"
            >
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100"
                  >
                    <Icon className={`h-5 w-5 ${stat.color} mb-2`} />
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                );
              })}
            </motion.div>

            {/* Impact Info */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-[#2D5016]/5 to-[#4a7c23]/10 rounded-2xl p-5 border border-[#2D5016]/10"
            >
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-5 w-5 text-[#2D5016]" />
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
                      className="group relative bg-gradient-to-br from-[#2D5016] to-[#4a7c23] rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all overflow-hidden"
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
                      className="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#2D5016]/30 hover:shadow-lg transition-all"
                    >
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2D5016]/10 transition-colors">
                        <History className="h-7 w-7 text-gray-600 group-hover:text-[#2D5016] transition-colors" />
                      </div>
                      <h3 className="text-gray-900 font-bold text-lg mb-1">
                        Riwayat Supply
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Lihat semua data dan status pickup Anda
                      </p>
                      <div className="flex items-center gap-1 text-gray-400 text-sm mt-4 group-hover:text-[#2D5016] transition-colors">
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
                      Verifikasi Lokasi Diperlukan
                    </h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
                      Untuk mengakses fitur Input Sampah dan Riwayat Supply,
                      silakan verifikasi bahwa lokasi Anda berada dalam
                      jangkauan layanan (Kota Banda Aceh).
                    </p>
                    <button
                      onClick={checkLocation}
                      disabled={locationStatus === "checking"}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D5016] text-white rounded-xl font-semibold text-sm hover:bg-[#3d6b1e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {locationStatus === "checking" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Mengecek...
                        </>
                      ) : (
                        <>
                          <LocateFixed className="h-4 w-4" />
                          Verifikasi Sekarang
                        </>
                      )}
                    </button>
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
                <div className="p-2 bg-[#2D5016]/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-[#2D5016]" />
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
                      className="relative bg-white rounded-xl p-4 border border-gray-100 hover:border-[#2D5016]/20 hover:shadow-md transition-all group"
                    >
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#2D5016] text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {item.step}
                      </div>
                      <div className="flex items-start gap-3 pt-2">
                        <div className="p-2 bg-[#2D5016]/10 rounded-lg group-hover:bg-[#2D5016]/20 transition-colors">
                          <Icon className="h-5 w-5 text-[#2D5016]" />
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
                    emoji: "🍚",
                    color: "bg-orange-50 border-orange-100",
                  },
                  {
                    name: "Sayuran & Buah",
                    emoji: "🥬",
                    color: "bg-green-50 border-green-100",
                  },
                  {
                    name: "Kulit Telur",
                    emoji: "🥚",
                    color: "bg-amber-50 border-amber-100",
                  },
                  {
                    name: "Sisa Dapur",
                    emoji: "🍖",
                    color: "bg-red-50 border-red-100",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`${item.color} rounded-xl p-3 text-center border`}
                  >
                    <span className="text-2xl mb-1 block">{item.emoji}</span>
                    <p className="text-xs font-medium text-gray-700">
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
