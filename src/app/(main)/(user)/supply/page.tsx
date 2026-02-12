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
  Check,
  ChevronDown,
} from "lucide-react";
import { getUserAddresses } from "@/lib/api/address.actions";
import { getCurrentUserProfile } from "@/lib/api/profile.actions";
import { isLocationSupported } from "@/lib/utils/region-validator";

type LocationStatus = "loading" | "allowed" | "not_allowed" | "not_registered";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  streetAddress: string;
  city: string;
  province: string;
  district?: string;
  village?: string;
  postalCode: string;
  isDefault: boolean;
}

export default function SupplyPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("loading");
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    acceptedWastes: boolean;
    wasteConditions: boolean;
    notAcceptedWastes: boolean;
    restrictionReason: boolean;
    tips: boolean;
  }>({
    acceptedWastes: false,
    wasteConditions: false,
    notAcceptedWastes: false,
    restrictionReason: false,
    tips: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Fetch addresses on mount
  useEffect(() => {
    async function fetchAddresses() {
      setIsLoading(true);
      try {
        // Fetch addresses from addresses table
        const addressResult = await getUserAddresses();
        let allAddresses: Address[] = [];

        if (
          addressResult.success &&
          addressResult.data &&
          addressResult.data.length > 0
        ) {
          allAddresses = addressResult.data.map((addr) => ({
            id: addr.id,
            label: addr.label,
            recipientName: addr.recipientName,
            recipientPhone: addr.recipientPhone,
            streetAddress: addr.streetAddress,
            city: addr.city,
            province: addr.province,
            district: addr.district,
            village: addr.village,
            postalCode: addr.postalCode,
            isDefault: addr.isDefault,
          }));
        } else {
          // Only use profile address as fallback if NO addresses exist in table
          const profileResult = await getCurrentUserProfile();
          if (profileResult.success && profileResult.data) {
            const profile = profileResult.data;

            // Check if user has address data in profile
            if (profile.province && profile.city && profile.postalCode) {
              // Create a virtual address from profile data
              const profileAddress: Address = {
                id: "profile-address",
                label: "Alamat Profil",
                recipientName: profile.name || "",
                recipientPhone: profile.phone || "",
                streetAddress: profile.fullAddress || "",
                city: profile.city,
                province: profile.province,
                district: profile.district || undefined,
                village: profile.village || undefined,
                postalCode: profile.postalCode,
                isDefault: true,
              };

              allAddresses.push(profileAddress);
            }
          }
        }

        setAddresses(allAddresses);

        // Set default address as selected
        const defaultAddr =
          allAddresses.find((a) => a.isDefault) || allAddresses[0];
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAddresses();
  }, []);

  // Determine location status based on selected address
  useEffect(() => {
    if (isLoading) {
      setLocationStatus("loading");
      return;
    }

    if (!selectedAddress) {
      setLocationStatus("not_registered");
      return;
    }

    // Check if selected address is in supported region
    const isSupported = isLocationSupported(
      selectedAddress.province,
      selectedAddress.city,
    );
    if (isSupported) {
      setLocationStatus("allowed");
    } else {
      setLocationStatus("not_allowed");
    }
  }, [selectedAddress, isLoading]);

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
    { name: "Produk Susu", icon: Coffee, color: "text-amber-700" },
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
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={
              {
                backgroundColor: "#fdf8d4",
                border: "2px solid #a3af87",
              } as React.CSSProperties
            }
          >
            <Recycle
              className="h-4 w-4"
              style={{ color: "#435664" } as React.CSSProperties}
            />
            <span
              className="text-xs font-bold tracking-wider uppercase"
              style={{ color: "#303646" } as React.CSSProperties}
            >
              Supply Connect
            </span>
          </div>
          <h1
            className="text-3xl lg:text-4xl font-bold mb-3"
            style={{ color: "#303646" } as React.CSSProperties}
          >
            Ubah Sampah Organik Jadi
            <span className="text-[#a3af87]"> Manfaat untuk Bumi</span>
          </h1>
          <p className="text-gray-500 text-sm lg:text-base max-w-2xl mx-auto">
            Berkontribusi untuk lingkungan yang lebih bersih dengan menyetorkan
            sampah organik nabati rumah tangga Anda. Gratis pickup untuk wilayah
            Banda Aceh.
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
              className="lg:col-span-6 rounded-2xl p-5 lg:p-6 shadow-lg bg-gradient-to-br from-[#435664] to-[#303646]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
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
                      Pilih alamat untuk cek layanan
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile/addresses"
                  className="px-3 py-2 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 rounded-lg transition-all flex items-center gap-2"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Kelola</span>
                </Link>
              </div>

              {/* Address Selector */}
              {addresses.length > 0 && !isLoading && (
                <div className="mb-4 relative">
                  <button
                    onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                    className="w-full bg-white/90 rounded-xl p-3 text-left flex items-center justify-between hover:bg-white transition-all"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#435664]">
                        {selectedAddress?.label || "Pilih Alamat"}
                      </p>
                      {selectedAddress && (
                        <>
                          <p className="text-xs text-[#435664] mt-0.5">
                            {selectedAddress.recipientName}
                          </p>
                          <p className="text-xs text-[#435664]/70 mt-0.5">
                            {selectedAddress.city}, {selectedAddress.province}
                          </p>
                        </>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-[#435664] transition-transform ${showAddressDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown List */}
                  <AnimatePresence>
                    {showAddressDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto"
                      >
                        {addresses.map((address) => (
                          <button
                            key={address.id}
                            onClick={() => {
                              setSelectedAddress(address);
                              setShowAddressDropdown(false);
                            }}
                            className={`w-full p-3 text-left hover:bg-[#fdf8d4] transition-all border-b border-gray-100 last:border-0 ${
                              selectedAddress?.id === address.id
                                ? "bg-[#fdf8d4]"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                                  selectedAddress?.id === address.id
                                    ? "border-[#a3af87] bg-[#a3af87]"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedAddress?.id === address.id && (
                                  <Check
                                    className="w-3 h-3 text-white"
                                    strokeWidth={3}
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-[#435664]">
                                    {address.label}
                                  </p>
                                  {address.isDefault && (
                                    <span className="px-2 py-0.5 bg-[#a3af87] text-white text-xs font-bold rounded">
                                      Utama
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#435664] mt-0.5">
                                  {address.recipientName}
                                </p>
                                <p className="text-xs text-[#435664]/70 mt-0.5">
                                  {address.streetAddress}
                                </p>
                                <p className="text-xs text-[#435664]/70">
                                  {address.city}, {address.province}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

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

                {locationStatus === "allowed" && selectedAddress && (
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
                          {selectedAddress.city}, {selectedAddress.province}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Lokasi terverifikasi! Anda dapat menggunakan Supply
                          Connect.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {locationStatus === "not_allowed" && selectedAddress && (
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
                          Alamat "{selectedAddress.label}" (
                          {selectedAddress.city}, {selectedAddress.province})
                          berada di luar wilayah layanan. Silakan pilih alamat
                          lain atau tambahkan alamat di Banda Aceh.
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
                <div className="space-y-2">
                  <div className="text-center py-2 px-4 rounded-xl bg-white/10 text-white/80 text-xs">
                    <MapPinOff className="h-4 w-4 inline mr-2" />
                    Alamat ini di luar jangkauan
                  </div>
                  <Link
                    href="/profile/addresses"
                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all bg-white/20 text-white hover:bg-white/30 shadow-lg hover:shadow-xl"
                  >
                    <MapPin className="h-4 w-4" />
                    Kelola Alamat
                  </Link>
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
                      className="group relative rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all overflow-hidden bg-gradient-to-br from-[#a3af87] to-[#8a9670]"
                    >
                      {/* Animated pulse ring */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 z-20">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-6 w-6 bg-white shadow-lg"></span>
                      </div>

                      {/* Decorative circles */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                      <div className="relative">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all group-hover:scale-110">
                          <Package className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
                        </div>
                        <h3 className="text-white font-bold text-lg lg:text-xl mb-2">
                          Input Sampah Baru
                        </h3>
                        <p className="text-white/80 text-sm lg:text-base mb-4">
                          Catat dan jadwalkan pickup sampah organik Anda
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white font-semibold text-sm group-hover:bg-white/30 transition-all">
                          <span>Mulai Sekarang</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/supply/history"
                      className="group relative rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all overflow-hidden bg-gradient-to-br from-[#fdf8d4] to-[#f5efc0] border-2 border-[#a3af87]"
                    >
                      {/* Animated pulse ring */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 z-20">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#a3af87] opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-6 w-6 bg-[#a3af87] shadow-lg"></span>
                      </div>

                      {/* Decorative circles */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#a3af87]/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#a3af87]/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                      <div className="relative">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-[#a3af87]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#a3af87] transition-all group-hover:scale-110">
                          <History className="h-7 w-7 lg:h-8 lg:w-8 text-[#435664] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="font-bold text-lg lg:text-xl mb-2 text-[#303646]">
                          Riwayat Supply
                        </h3>
                        <p className="text-sm lg:text-base mb-4 text-[#435664]">
                          Lihat status dan tracking pickup Anda
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#a3af87] rounded-xl text-white font-semibold text-sm group-hover:bg-[#8a9670] transition-all shadow-lg">
                          <span>Lihat Riwayat</span>
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
                    className="rounded-3xl p-8 lg:p-10 shadow-xl text-center flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#fdf8d4] to-[#f5efc0] border-2 border-[#a3af87]/30"
                  >
                    <div className="w-20 h-20 bg-[#a3af87]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MapPinOff className="h-10 w-10 text-[#435664]" />
                    </div>
                    <h3 className="font-bold text-lg lg:text-xl mb-3 text-[#303646]">
                      {locationStatus === "not_registered"
                        ? "Alamat Belum Terdaftar"
                        : "Di Luar Jangkauan"}
                    </h3>
                    <p className="text-sm lg:text-base max-w-md mx-auto mb-6 text-[#435664]">
                      {locationStatus === "not_registered"
                        ? "Silakan tambahkan alamat terlebih dahulu."
                        : `Saat ini layanan hanya untuk Banda Aceh.`}
                    </p>
                    {locationStatus === "not_registered" && (
                      <Link
                        href="/profile/addresses"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#a3af87] text-white rounded-xl font-semibold text-sm hover:bg-[#8a9670] transition-colors shadow-lg"
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
            className="rounded-2xl p-5 lg:p-6 shadow-lg bg-gradient-to-br from-[#fdf8d4] to-[#f5efc0] border-2 border-[#a3af87]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#a3af87]/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-[#435664]" />
              </div>
              <h3 className="font-bold text-base lg:text-lg text-[#303646]">
                Bagaimana Cara Kerjanya?
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {howItWorks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="relative bg-white rounded-xl p-4 hover:shadow-md transition-all group border-2 border-[#a3af87]/20"
                  >
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#435664] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                      {item.step}
                    </div>
                    <div className="pt-2">
                      <div className="p-2 rounded-lg inline-flex mb-3 bg-[#a3af87]/20">
                        <Icon className="h-5 w-5 text-[#435664]" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1 text-[#303646]">
                        {item.title}
                      </h4>
                      <p className="text-xs leading-relaxed text-[#435664]">
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
            <motion.div
              variants={itemVariants}
              className="rounded-2xl p-5 lg:p-6 shadow-lg bg-gradient-to-br from-[#a3af87] to-[#8a9670]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-base lg:text-lg">
                    Jenis yang Diterima
                  </h3>
                </div>
                <button
                  onClick={() => toggleSection("acceptedWastes")}
                  className="flex items-center gap-1 px-3 py-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Toggle detail"
                >
                  <span className="text-xs font-medium text-white">
                    {expandedSections.acceptedWastes
                      ? "Tutup"
                      : "Klik Lebih Lanjut"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-white transition-transform duration-300 ${
                      expandedSections.acceptedWastes ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 lg:gap-3">
                {acceptedWastes.map((waste, index) => {
                  const Icon = waste.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-3 flex flex-col items-center text-center transition-all hover:shadow-md hover:scale-105 border-2 border-white/50"
                    >
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-2 bg-[#a3af87]/20">
                        <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-[#435664]" />
                      </div>
                      <p className="text-xs lg:text-sm font-semibold leading-tight text-[#303646]">
                        {waste.name}
                      </p>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence>
                {expandedSections.acceptedWastes && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 bg-white/90 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#a3af87] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-[#303646] mb-1">
                          Sampah Nabati Rumah Tangga
                        </h4>
                        <p className="text-xs text-[#435664] leading-relaxed">
                          Semua jenis sampah organik yang berasal dari tumbuhan
                          seperti sisa sayuran, kulit buah, dan sisa makanan
                          nabati sangat cocok untuk diolah menjadi pakan maggot
                          BSF.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#a3af87] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-[#303646] mb-1">
                          Kualitas Terjaga
                        </h4>
                        <p className="text-xs text-[#435664] leading-relaxed">
                          Sampah organik nabati memiliki kandungan nutrisi yang
                          stabil dan aman untuk budidaya maggot BSF,
                          menghasilkan pakan ternak berkualitas tinggi.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#a3af87] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-[#303646] mb-1">
                          Ramah Lingkungan
                        </h4>
                        <p className="text-xs text-[#435664] leading-relaxed">
                          Dengan menyetorkan sampah organik nabati, Anda ikut
                          mengurangi limbah yang berakhir di TPA dan mendukung
                          ekonomi sirkular yang berkelanjutan.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 2. Kondisi Sampah */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl p-5 lg:p-6 shadow-lg bg-gradient-to-br from-[#435664] to-[#303646]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-base lg:text-lg">
                    Kondisi Sampah
                  </h3>
                </div>
                <button
                  onClick={() => toggleSection("wasteConditions")}
                  className="flex items-center gap-1 px-3 py-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Toggle detail"
                >
                  <span className="text-xs font-medium text-white">
                    {expandedSections.wasteConditions
                      ? "Tutup"
                      : "Klik Lebih Lanjut"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-white transition-transform duration-300 ${
                      expandedSections.wasteConditions ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-3">
                {wasteConditions.map((condition, index) => {
                  const Icon = condition.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-white rounded-xl p-3 hover:shadow-md transition-all border-2 border-white/50"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#a3af87]/20">
                        <Icon className="h-4 w-4 text-[#435664]" />
                      </div>
                      <p className="text-xs lg:text-sm font-medium leading-snug text-[#303646]">
                        {condition.text}
                      </p>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence>
                {expandedSections.wasteConditions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 bg-white/90 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#435664] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-[#303646] mb-1">
                          Mengapa Kondisi Penting?
                        </h4>
                        <p className="text-xs text-[#435664] leading-relaxed">
                          Maggot BSF sangat sensitif terhadap bahan kimia dan
                          kontaminan tertentu. Sampah yang bersih akan
                          menghasilkan maggot berkualitas tinggi yang aman untuk
                          pakan ternak.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#435664] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-[#303646] mb-1">
                          Standar Kualitas
                        </h4>
                        <p className="text-xs text-[#435664] leading-relaxed">
                          Kami menerapkan standar kualitas ketat untuk
                          memastikan sampah organik yang diterima dapat diolah
                          dengan optimal dan menghasilkan produk akhir yang
                          berkualitas.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 3. Yang Tidak Diterima */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 rounded-2xl p-5 lg:p-6 shadow-lg bg-gradient-to-br from-[#a3af87] to-[#8a9670]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <XCircle className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base lg:text-lg text-white">
                    Yang Tidak Diterima
                  </h3>
                </div>
                <button
                  onClick={() => toggleSection("notAcceptedWastes")}
                  className="flex items-center gap-1 px-3 py-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Toggle detail"
                >
                  <span className="text-xs font-medium text-white">
                    {expandedSections.notAcceptedWastes
                      ? "Tutup"
                      : "Klik Lebih Lanjut"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-white transition-transform duration-300 ${
                      expandedSections.notAcceptedWastes ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                {notAcceptedWastes.map((waste, index) => {
                  const Icon = waste.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-3 flex flex-col items-center text-center transition-all hover:shadow-md hover:scale-105 border-2 border-white/50"
                    >
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-2 bg-red-100">
                        <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
                      </div>
                      <p className="text-xs lg:text-sm font-semibold leading-tight text-[#303646]">
                        {waste.name}
                      </p>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence>
                {expandedSections.notAcceptedWastes && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 bg-white/90 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-[#303646] mb-1">
                          Risiko Kontaminasi
                        </h4>
                        <p className="text-xs text-[#435664] leading-relaxed">
                          Sampah hewani dapat menarik lalat hijau yang berbahaya
                          dan mengganggu proses budidaya maggot BSF. Lalat jenis
                          ini dapat membawa penyakit dan menurunkan kualitas
                          hasil panen.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-[#303646] mb-1">
                          Bau dan Kesehatan
                        </h4>
                        <p className="text-xs text-[#435664] leading-relaxed">
                          Sampah berminyak dan hewani cenderung menimbulkan bau
                          yang kuat dan dapat menjadi sumber bakteri patogen
                          yang merugikan untuk budidaya maggot.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 4. Alasan Pembatasan */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 rounded-2xl p-5 lg:p-6 shadow-lg bg-gradient-to-br from-[#fdf8d4] to-[#f5efc0] border-2 border-[#a3af87]/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <TriangleAlert className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-base lg:text-lg text-[#303646]">
                    Alasan Pembatasan Ini
                  </h3>
                </div>
                <button
                  onClick={() => toggleSection("restrictionReason")}
                  className="flex items-center gap-1 px-3 py-2 hover:bg-amber-100/50 rounded-lg transition-colors"
                  aria-label="Toggle detail"
                >
                  <span className="text-xs font-medium text-[#303646]">
                    {expandedSections.restrictionReason
                      ? "Tutup"
                      : "Klik Lebih Lanjut"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#303646] transition-transform duration-300 ${
                      expandedSections.restrictionReason ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="bg-white rounded-xl p-4 lg:p-5 hover:shadow-md transition-all border-2 border-[#a3af87]/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-100">
                    <Bug className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm leading-relaxed text-[#435664]">
                      <span className="font-bold text-[#303646]">
                        Sampah hewani dapat memicu munculnya lalat hijau
                      </span>{" "}
                      (bukan BSF) yang berbahaya bagi budidaya, serta
                      meningkatkan risiko bau dan penyakit.
                    </p>
                    <p className="text-xs lg:text-sm leading-relaxed mt-2 text-[#435664]">
                      Oleh karena itu,{" "}
                      <span className="font-semibold text-[#a3af87]">
                        EcoMaggie hanya memprioritaskan limbah nabati
                      </span>{" "}
                      yang lebih aman, stabil, dan sesuai untuk pakan maggot
                      BSF.
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.restrictionReason && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 bg-white rounded-xl p-4 border-2 border-[#a3af87]/20 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <Bug className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-[#303646] mb-1">
                          Fokus pada Maggot BSF
                        </h4>
                        <p className="text-xs text-[#435664] leading-relaxed">
                          Black Soldier Fly (BSF) adalah spesies lalat yang
                          ramah lingkungan dan tidak menyebarkan penyakit.
                          Berbeda dengan lalat rumah atau lalat hijau yang dapat
                          membawa patogen berbahaya.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Leaf className="h-5 w-5 text-[#a3af87] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-[#303646] mb-1">
                          Keunggulan Limbah Nabati
                        </h4>
                        <p className="text-xs text-[#435664] leading-relaxed">
                          Limbah nabati menghasilkan maggot dengan kandungan
                          protein optimal, bebas dari kontaminan hewani, dan
                          lebih mudah dikelola dalam proses budidaya skala
                          besar.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 5. Tips */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 rounded-2xl p-5 lg:p-6 shadow-lg bg-gradient-to-br from-[#435664] to-[#303646]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-base lg:text-lg">
                    Tips Menyimpan Sampah Organik
                  </h3>
                </div>
                <button
                  onClick={() => toggleSection("tips")}
                  className="flex items-center gap-1 px-3 py-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Toggle detail"
                >
                  <span className="text-xs font-medium text-white">
                    {expandedSections.tips ? "Tutup" : "Klik Lebih Lanjut"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-white transition-transform duration-300 ${
                      expandedSections.tips ? "rotate-180" : ""
                    }`}
                  />
                </button>
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
                    className="flex items-start gap-3 bg-white rounded-xl p-3 hover:shadow-md transition-all border-2 border-white/50"
                  >
                    <div className="w-6 h-6 bg-[#a3af87] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs lg:text-sm text-[#303646]">
                        {tip.title}
                      </h4>
                      <p className="text-xs mt-0.5 text-[#435664]">
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {expandedSections.tips && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 bg-white/90 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#435664] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-[#303646] mb-1">
                          Persiapan Optimal
                        </h4>
                        <p className="text-xs text-[#435664] leading-relaxed">
                          Dengan mengikuti tips di atas, sampah organik Anda
                          akan tetap dalam kondisi baik hingga waktu
                          penjemputan. Hal ini memudahkan proses pengolahan dan
                          menghasilkan kualitas maggot yang lebih baik.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Recycle className="h-5 w-5 text-[#a3af87] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-[#303646] mb-1">
                          Maksimalkan Kontribusi
                        </h4>
                        <p className="text-xs text-[#435664] leading-relaxed">
                          Sampah organik yang tersimpan dengan baik dapat
                          diproses lebih efisien, meningkatkan dampak positif
                          Anda terhadap lingkungan dan ekonomi sirkular.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
