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
  AlertTriangle,
  Leaf,
  MapPinOff,
  Info,
  Sparkles,
  UtensilsCrossed,
  Apple,
  UserCircle,
  ShieldAlert,
  ShieldCheck,
  Droplet,
  Wheat,
  Cake,
  Fish,
  Bone,
  Beaker,
  Ban,
  Bug,
  TriangleAlert,
  Coffee,
  Salad,
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

  const howItWorks = [
    {
      step: 1,
      icon: Package,
      title: "Kumpulkan Sampah",
      desc: "Pisahkan sampah organik nabati dari rumah tangga Anda.",
    },
    {
      step: 2,
      icon: Recycle,
      title: "Input Data Sampah",
      desc: "Catat jenis sampah, perkiraan berat, dan jadwalkan waktu pickup.",
    },
    {
      step: 3,
      icon: Truck,
      title: "Pickup Gratis",
      desc: "Tim kurir EcoMaggie akan datang ke lokasi Anda.",
    },
    {
      step: 4,
      icon: TreePine,
      title: "Jadi Pakan Maggot",
      desc: "Sampah diolah menjadi pakan maggot BSF berkelanjutan.",
    },
  ];

  // Accepted waste types with icons
  const acceptedWastes = [
    { name: "Sisa Sayur & Buah", icon: Salad, color: "text-green-600" },
    { name: "Kulit Buah", icon: Apple, color: "text-orange-600" },
    { name: "Nasi & Mie", icon: UtensilsCrossed, color: "text-amber-600" },
    { name: "Ampas Tahu", icon: Wheat, color: "text-yellow-700" },
    { name: "Roti & Kue", icon: Cake, color: "text-pink-600" },
    { name: "Sisa Bahan Nabati", icon: Leaf, color: "text-emerald-600" },
  ];

  // Waste conditions
  const wasteConditions = [
    { text: "Tidak tercampur plastik/logam", icon: ShieldCheck },
    { text: "Tidak berminyak berlebih", icon: Droplet },
    { text: "Tidak ada bahan kimia", icon: Beaker },
    { text: "Tidak berjamur ekstrem", icon: ShieldAlert },
  ];

  // Not accepted wastes
  const notAcceptedWastes = [
    { name: "Daging & Tulang", icon: Bone, color: "text-red-600" },
    { name: "Ikan & Seafood", icon: Fish, color: "text-blue-700" },
    { name: "Produk Susu", icon: Coffee, color: "text-amber-700" },
    { name: "Sampah Berminyak", icon: Droplet, color: "text-orange-700" },
    { name: "Sampah Campuran", icon: Ban, color: "text-gray-700" },
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: "#a3af87" }}>
            <Recycle className="h-4 w-4 text-white" />
            <span className="text-xs font-bold tracking-wider uppercase text-white">
              Supply Connect
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Ubah Sampah Organik Jadi
            <span style={{ color: "#a3af87" }}> Manfaat untuk Bumi</span>
          </h1>
          <p className="text-gray-500 text-sm lg:text-base max-w-2xl mx-auto">
            Berkontribusi untuk lingkungan yang lebih bersih dengan menyetorkan
            sampah organik nabati rumah tangga Anda. Gratis pickup untuk wilayah Banda
            Aceh.
          </p>
        </motion.div>

        {/* Top Section: Status Wilayah Layanan + Action Buttons */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 lg:mb-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Status Wilayah Layanan */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-6 rounded-2xl p-5 lg:p-6 shadow-lg"
              style={{ backgroundColor: "#a3af87" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  {locationStatus === "loading" ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : locationStatus === "allowed" ? (
                    <MapPin className="h-6 w-6 text-white" />
                  ) : locationStatus === "not_allowed" ? (
                    <MapPinOff className="h-6 w-6 text-white" />
                  ) : (
                    <UserCircle className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base lg:text-lg">
                    Status Wilayah Layanan
                  </h3>
                  <p className="text-xs text-white/70">
                    Berdasarkan alamat pendaftaran
                  </p>
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
                    className="bg-white/90 rounded-xl p-4 mb-4"
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
                    className="bg-white/90 rounded-xl p-4 mb-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900 font-medium">
                          Alamat Belum Terdaftar
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Anda belum memiliki alamat yang terdaftar. Silakan
                          tambahkan alamat terlebih dahulu.
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
                    className="bg-white/90 rounded-xl p-4 mb-4"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-900 font-medium">
                          {userLocation.kabupatenKota}, {userLocation.provinsi}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Lokasi terverifikasi! Anda dapat menggunakan Supply Connect.
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
                    className="bg-white/90 rounded-xl p-4 mb-4"
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-900 font-medium">
                          Di Luar Jangkauan Layanan
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Alamat Anda ({userLocation.kabupatenKota},{" "}
                          {userLocation.provinsi}) berada di luar wilayah
                          layanan.
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
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all bg-white/20 text-white hover:bg-white/30 shadow-lg hover:shadow-xl"
                >
                  <MapPin className="h-4 w-4" />
                  Tambah Alamat
                </Link>
              ) : locationStatus === "not_allowed" ? (
                <div className="text-center py-3 px-4 rounded-xl bg-white/20 text-white/80 text-sm">
                  <MapPinOff className="h-4 w-4 inline mr-2" />
                  Layanan tidak tersedia
                </div>
              ) : locationStatus === "allowed" ? (
                <div className="text-center py-3 px-4 rounded-xl bg-white/20 text-white text-sm font-medium">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Fitur Supply Connect Aktif
                </div>
              ) : null}
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="lg:col-span-6">
              <AnimatePresence mode="wait">
                {isLocationAllowed ? (
                  <motion.div
                    key="enabled"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full"
                  >
                    <Link
                      href="/supply/input"
                      className="group relative rounded-2xl p-5 lg:p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all overflow-hidden"
                      style={{ backgroundColor: "#a3af87" }}
                    >
                      <div className="absolute -top-1 -right-1 w-4 h-4 z-20">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-white shadow-lg"></span>
                      </div>

                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="relative">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:bg-white/30 transition-colors">
                          <Package className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                        </div>
                        <h3 className="text-white font-bold text-base lg:text-lg mb-1">
                          Input Sampah Baru
                        </h3>
                        <p className="text-white/70 text-xs lg:text-sm">
                          Catat dan jadwalkan pickup
                        </p>
                        <div className="flex items-center gap-1 text-white/80 text-sm mt-3 lg:mt-4 group-hover:text-white transition-colors">
                          <span className="text-xs lg:text-sm">Mulai Sekarang</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/supply/history"
                      className="group relative rounded-2xl p-5 lg:p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all overflow-hidden"
                      style={{ backgroundColor: "#a3af87" }}
                    >
                      <div className="absolute -top-1 -right-1 w-4 h-4 z-20">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-white shadow-lg"></span>
                      </div>

                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="relative">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:bg-white/30 transition-colors">
                          <History className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                        </div>
                        <h3 className="text-white font-bold text-base lg:text-lg mb-1">
                          Riwayat Supply
                        </h3>
                        <p className="text-white/70 text-xs lg:text-sm">
                          Lihat status pickup Anda
                        </p>
                        <div className="flex items-center gap-1 text-white/80 text-sm mt-3 lg:mt-4 group-hover:text-white transition-colors">
                          <span className="text-xs lg:text-sm">Lihat Riwayat</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="disabled"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl p-6 lg:p-8 shadow-lg text-center flex flex-col items-center justify-center h-full"
                    style={{ backgroundColor: "#a3af87" }}
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPinOff className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-base lg:text-lg mb-2">
                      {locationStatus === "not_registered"
                        ? "Alamat Belum Terdaftar"
                        : "Di Luar Jangkauan"}
                    </h3>
                    <p className="text-white/70 text-xs lg:text-sm max-w-md mx-auto mb-4">
                      {locationStatus === "not_registered"
                        ? "Silakan tambahkan alamat terlebih dahulu."
                        : `Saat ini layanan hanya untuk Banda Aceh.`}
                    </p>
                    {locationStatus === "not_registered" && (
                      <Link
                        href="/profile/addresses"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors"
                      >
                        <MapPin className="h-4 w-4" />
                        Tambah Alamat
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Section: All Guidelines */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Bagaimana Cara Kerjanya */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl p-5 lg:p-6 shadow-lg"
            style={{ backgroundColor: "#a3af87" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-white text-base lg:text-lg">
                Bagaimana Cara Kerjanya?
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {howItWorks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="relative bg-white/90 rounded-xl p-4 hover:bg-white transition-all group"
                  >
                    <div className="absolute -top-2 -left-2 w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md" style={{ backgroundColor: "#a3af87" }}>
                      {item.step}
                    </div>
                    <div className="pt-2">
                      <div className="p-2 rounded-lg inline-flex mb-3" style={{ backgroundColor: "#a3af87" }}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Guidelines Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* 1. Jenis yang Diterima */}
            <motion.div variants={itemVariants} className="rounded-2xl p-5 lg:p-6 shadow-lg" style={{ backgroundColor: "#a3af87" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-base lg:text-lg">
                  Jenis yang Diterima
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                {acceptedWastes.map((waste, index) => {
                  const Icon = waste.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white/90 rounded-xl p-3 flex flex-col items-center text-center transition-all hover:bg-white hover:scale-105"
                    >
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: "#a3af87" }}>
                        <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <p className="text-xs lg:text-sm font-semibold text-gray-800 leading-tight">
                        {waste.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* 2. Kondisi Sampah */}
            <motion.div variants={itemVariants} className="rounded-2xl p-5 lg:p-6 shadow-lg" style={{ backgroundColor: "#a3af87" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-base lg:text-lg">
                  Kondisi Sampah
                </h3>
              </div>
              <div className="space-y-3">
                {wasteConditions.map((condition, index) => {
                  const Icon = condition.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-white/90 rounded-xl p-3 hover:bg-white transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#a3af87" }}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-xs lg:text-sm font-medium text-gray-800 leading-snug">
                        {condition.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* 3. Yang Tidak Diterima */}
            <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl p-5 lg:p-6 shadow-lg" style={{ backgroundColor: "#a3af87" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-base lg:text-lg">
                  Yang Tidak Diterima
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">
                {notAcceptedWastes.map((waste, index) => {
                  const Icon = waste.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white/90 rounded-xl p-3 flex flex-col items-center text-center transition-all hover:bg-white hover:scale-105"
                    >
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: "#a3af87" }}>
                        <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <p className="text-xs lg:text-sm font-semibold text-gray-800 leading-tight">
                        {waste.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* 4. Alasan Pembatasan */}
            <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl p-5 lg:p-6 shadow-lg" style={{ backgroundColor: "#a3af87" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TriangleAlert className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-base lg:text-lg">
                  Alasan Pembatasan Ini
                </h3>
              </div>
              <div className="bg-white/90 rounded-xl p-4 lg:p-5 hover:bg-white transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#a3af87" }}>
                    <Bug className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm text-gray-800 leading-relaxed">
                      <span className="font-bold text-gray-900">Sampah hewani dapat memicu munculnya lalat hijau</span> (bukan BSF) yang berbahaya bagi budidaya, serta meningkatkan risiko bau dan penyakit.
                    </p>
                    <p className="text-xs lg:text-sm text-gray-800 leading-relaxed mt-2">
                      Oleh karena itu, <span className="font-semibold" style={{ color: "#a3af87" }}>EcoMaggie hanya memprioritaskan limbah nabati</span> yang lebih aman, stabil, dan sesuai untuk pakan maggot BSF.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 5. Tips */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 rounded-2xl p-5 lg:p-6 shadow-lg"
              style={{ backgroundColor: "#a3af87" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-base lg:text-lg">
                  Tips Menyimpan Sampah Organik
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    title: "Pisahkan dari Sampah Anorganik",
                    desc: "Pastikan tidak tercampur plastik, kaca, atau logam.",
                  },
                  {
                    title: "Simpan di Wadah Tertutup",
                    desc: "Gunakan wadah tertutup untuk menghindari bau dan serangga.",
                  },
                  {
                    title: "Tiriskan Air Berlebih",
                    desc: "Kurangi kadar air untuk mencegah pembusukan cepat.",
                  },
                ].map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-white/90 rounded-xl p-3 hover:bg-white transition-all"
                  >
                    <div className="w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: "#a3af87" }}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-xs lg:text-sm">
                        {tip.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
