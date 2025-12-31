"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Scale,
  MapPin,
  Calendar,
  Clock,
  Camera,
  CheckCircle,
  Leaf,
  Apple,
  Carrot,
  Fish,
  Trash2,
  ChevronRight,
  Recycle,
  TreePine,
  Truck,
  Globe,
  Info,
  X,
  Sparkles,
  LocateFixed,
  Loader2,
  MapPinOff,
} from "lucide-react";
import { useLocationPersistence } from "@/hooks/useLocationPersistence";

const wasteTypes = [
  {
    id: "sisa_makanan",
    name: "Sisa Makanan",
    icon: Apple,
    desc: "Nasi, lauk, roti, kue",
    color: "bg-orange-100 text-orange-600",
    borderColor: "border-orange-200",
  },
  {
    id: "sayuran_buah",
    name: "Sayuran & Buah",
    icon: Carrot,
    desc: "Kulit, potongan, busuk",
    color: "bg-green-100 text-green-600",
    borderColor: "border-green-200",
  },
  {
    id: "sisa_dapur",
    name: "Sisa Dapur",
    icon: Fish,
    desc: "Tulang, cangkang, kulit telur",
    color: "bg-blue-100 text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    id: "campuran",
    name: "Campuran Organik",
    icon: Trash2,
    desc: "Berbagai jenis organik",
    color: "bg-purple-100 text-purple-600",
    borderColor: "border-purple-200",
  },
];

const timeSlots = [
  { id: "pagi", label: "Pagi", time: "08:00 - 10:00", icon: "🌅" },
  { id: "siang", label: "Siang", time: "12:00 - 14:00", icon: "☀️" },
  { id: "sore", label: "Sore", time: "16:00 - 18:00", icon: "🌇" },
];

const weightOptions = [
  { value: "1", label: "< 1 kg", desc: "Sangat kecil" },
  { value: "3", label: "1-3 kg", desc: "Kecil" },
  { value: "5", label: "3-5 kg", desc: "Sedang" },
  { value: "10", label: "5-10 kg", desc: "Besar" },
  { value: "15", label: "> 10 kg", desc: "Sangat besar" },
];

const impactStats = [
  { label: "Sampah Diselamatkan", value: "1,250 kg", icon: Scale },
  { label: "CO₂ Terhindar", value: "500 kg", icon: Globe },
  { label: "Peternak Terbantu", value: "12", icon: TreePine },
];

export default function SupplyInputPage() {
  const router = useRouter();
  const {
    isLocationAllowed,
    locationData,
    checkLocation,
    locationStatus,
    isLoading,
  } = useLocationPersistence();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    wasteType: "",
    weight: "",
    address: "Jl. T. Nyak Arief No. 12, Lamnyong, Banda Aceh",
    date: "",
    timeSlot: "",
    notes: "",
    photo: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, photo: null });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const canProceedStep1 = formData.wasteType && formData.weight;
  const canProceedStep2 = formData.date && formData.timeSlot;

  // Location not allowed state
  if (!isLoading && !isLocationAllowed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPinOff className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifikasi Lokasi Diperlukan
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Untuk menggunakan fitur Input Sampah, pastikan lokasi Anda berada
            dalam jangkauan layanan (Kota Banda Aceh).
          </p>
          <button
            onClick={checkLocation}
            disabled={locationStatus === "checking"}
            className="w-full flex items-center justify-center gap-2 bg-[#2D5016] text-white py-3.5 rounded-xl font-semibold mb-3 hover:bg-[#3d6b1e] transition-colors disabled:opacity-50"
          >
            {locationStatus === "checking" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Mengecek Lokasi...
              </>
            ) : (
              <>
                <LocateFixed className="h-5 w-5" />
                Verifikasi Lokasi
              </>
            )}
          </button>
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

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Permintaan Berhasil!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Permintaan pickup sampah organik Anda telah diterima. Tim kami akan
            segera menghubungi Anda.
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">ID Supply</span>
              <span className="text-sm font-semibold text-gray-900">
                SUP-{Math.random().toString(36).substring(2, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Jenis</span>
              <span className="text-sm font-medium text-gray-900">
                {wasteTypes.find((t) => t.id === formData.wasteType)?.name}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Berat</span>
              <span className="text-sm font-medium text-gray-900">
                {weightOptions.find((w) => w.value === formData.weight)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Status</span>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                Menunggu Pickup
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/supply/history"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#2D5016] to-[#4a7c23] text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Lihat Riwayat
            </Link>
            <Link
              href="/supply"
              className="w-full flex items-center justify-center gap-2 text-gray-600 py-3 font-medium hover:text-gray-900 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
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
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Input Sampah Organik
            </h1>
            <p className="text-sm text-gray-500">
              Langkah {step} dari 2 • {locationData.address}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-200">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Lokasi Terverifikasi
            </span>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 max-w-xl">
          <div
            className={`flex-1 h-2 rounded-full transition-colors ${
              step >= 1 ? "bg-[#2D5016]" : "bg-gray-200"
            }`}
          />
          <div
            className={`flex-1 h-2 rounded-full transition-colors ${
              step >= 2 ? "bg-[#2D5016]" : "bg-gray-200"
            }`}
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Form */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 xl:col-span-8"
          >
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Data Sampah */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    {/* Waste Type */}
                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-4">
                        Jenis Sampah Organik
                      </label>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                        {wasteTypes.map((type) => {
                          const Icon = type.icon;
                          const isSelected = formData.wasteType === type.id;
                          return (
                            <motion.button
                              key={type.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                setFormData({ ...formData, wasteType: type.id })
                              }
                              className={`p-4 lg:p-5 rounded-2xl border-2 text-left transition-all ${
                                isSelected
                                  ? "border-[#2D5016] bg-[#2D5016]/5 shadow-md"
                                  : `border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm`
                              }`}
                            >
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${type.color}`}
                              >
                                <Icon className="h-6 w-6" />
                              </div>
                              <p
                                className={`font-semibold text-sm lg:text-base ${
                                  isSelected
                                    ? "text-[#2D5016]"
                                    : "text-gray-900"
                                }`}
                              >
                                {type.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {type.desc}
                              </p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-4">
                        Perkiraan Berat Sampah
                      </label>
                      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
                        {weightOptions.map((option) => {
                          const isSelected = formData.weight === option.value;
                          return (
                            <motion.button
                              key={option.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  weight: option.value,
                                })
                              }
                              className={`p-4 rounded-xl text-center transition-all ${
                                isSelected
                                  ? "bg-[#2D5016] text-white shadow-lg"
                                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <p className="font-bold text-lg">
                                {option.label}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  isSelected ? "text-white/80" : "text-gray-500"
                                }`}
                              >
                                {option.desc}
                              </p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-4">
                        Foto Sampah{" "}
                        <span className="font-normal text-gray-400">
                          (opsional)
                        </span>
                      </label>
                      {previewUrl ? (
                        <div className="relative w-full max-w-sm">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-2xl border border-gray-200"
                          />
                          <button
                            onClick={removePhoto}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="block w-full max-w-sm p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-[#2D5016]/50 hover:bg-gray-100 transition-all cursor-pointer">
                          <Camera className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 font-medium">
                            Klik untuk upload foto
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG hingga 5MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Continue Button */}
                    <motion.button
                      whileHover={{ scale: canProceedStep1 ? 1.01 : 1 }}
                      whileTap={{ scale: canProceedStep1 ? 0.99 : 1 }}
                      onClick={() => setStep(2)}
                      disabled={!canProceedStep1}
                      className={`w-full lg:w-auto lg:px-12 py-4 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                        canProceedStep1
                          ? "bg-gradient-to-r from-[#2D5016] to-[#4a7c23] text-white shadow-lg hover:shadow-xl"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Lanjutkan ke Jadwal
                      <ChevronRight className="h-5 w-5" />
                    </motion.button>
                  </motion.div>
                )}

                {/* Step 2: Schedule */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    {/* Address */}
                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-4">
                        Alamat Pickup
                      </label>
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-[#2D5016]/10 rounded-xl">
                            <MapPin className="h-6 w-6 text-[#2D5016]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">
                              {formData.address}
                            </p>
                            <button className="text-sm text-[#2D5016] font-medium mt-2 hover:underline">
                              Ubah alamat pickup
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Date */}
                      <div>
                        <label className="block text-base font-semibold text-gray-900 mb-4">
                          Tanggal Pickup
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                              setFormData({ ...formData, date: e.target.value })
                            }
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/20 transition-all text-gray-900"
                          />
                        </div>
                      </div>

                      {/* Time Slot */}
                      <div>
                        <label className="block text-base font-semibold text-gray-900 mb-4">
                          Waktu Pickup
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {timeSlots.map((slot) => {
                            const isSelected = formData.timeSlot === slot.id;
                            return (
                              <motion.button
                                key={slot.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    timeSlot: slot.id,
                                  })
                                }
                                className={`p-3 lg:p-4 rounded-xl text-center transition-all ${
                                  isSelected
                                    ? "bg-[#2D5016] text-white shadow-lg"
                                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <span className="text-xl block mb-1">
                                  {slot.icon}
                                </span>
                                <p className="font-semibold text-sm">
                                  {slot.label}
                                </p>
                                <p
                                  className={`text-xs mt-0.5 ${
                                    isSelected
                                      ? "text-white/80"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {slot.time}
                                </p>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-4">
                        Catatan untuk Kurir{" "}
                        <span className="font-normal text-gray-400">
                          (opsional)
                        </span>
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Contoh: Sampah di depan pagar, warna kantong hitam..."
                        rows={3}
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/20 transition-all resize-none text-gray-900"
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{
                        scale: canProceedStep2 && !isSubmitting ? 1.01 : 1,
                      }}
                      whileTap={{
                        scale: canProceedStep2 && !isSubmitting ? 0.99 : 1,
                      }}
                      onClick={handleSubmit}
                      disabled={!canProceedStep2 || isSubmitting}
                      className={`w-full lg:w-auto lg:px-12 py-4 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                        canProceedStep2 && !isSubmitting
                          ? "bg-gradient-to-r from-[#2D5016] to-[#4a7c23] text-white shadow-lg hover:shadow-xl"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <Leaf className="h-5 w-5" />
                          Konfirmasi Pickup
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column - Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 xl:col-span-4 space-y-6"
          >
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-[#2D5016] to-[#4a7c23] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Ringkasan Input</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/20">
                  <span className="text-white/70">Jenis Sampah</span>
                  <span className="font-medium">
                    {wasteTypes.find((t) => t.id === formData.wasteType)
                      ?.name || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/20">
                  <span className="text-white/70">Perkiraan Berat</span>
                  <span className="font-medium">
                    {weightOptions.find((w) => w.value === formData.weight)
                      ?.label || "-"}
                  </span>
                </div>
                {formData.date && (
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span className="text-white/70">Tanggal Pickup</span>
                    <span className="font-medium">
                      {new Date(formData.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {formData.timeSlot && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-white/70">Waktu Pickup</span>
                    <span className="font-medium">
                      {timeSlots.find((t) => t.id === formData.timeSlot)?.time}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Guide Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Panduan Setor</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Pisahkan sampah organik dari sampah lainnya",
                  "Masukkan ke dalam kantong atau wadah tertutup",
                  "Letakkan di tempat yang mudah dijangkau kurir",
                  "Pastikan sampah tidak tercampur plastik/logam",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#2D5016]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#2D5016]">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Impact Stats */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#2D5016]/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-[#2D5016]" />
                </div>
                <h3 className="font-bold text-gray-900">Dampak Anda</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {impactStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
                    >
                      <div className="p-2 bg-[#2D5016]/10 rounded-lg">
                        <Icon className="h-4 w-4 text-[#2D5016]" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pickup Map Placeholder */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900">Lokasi Pickup</h3>
              </div>
              <div className="bg-gray-100 rounded-xl h-32 flex items-center justify-center">
                <div className="text-center">
                  <Globe className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Peta lokasi pickup</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                {formData.address}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
