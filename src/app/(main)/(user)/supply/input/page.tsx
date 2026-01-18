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
  ChevronLeft,
  Recycle,
  TreePine,
  Truck,
  Globe,
  Info,
  X,
  Sparkles,
  Loader2,
  MapPinOff,
  UserCircle,
  Sunrise,
  Sun,
  Sunset,
  History,
} from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useDefaultAddress } from "@/hooks/useDefaultAddress";
import MediaUploader from "@/components/supply/MediaUploader";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import dynamic from "next/dynamic";

// Import LocationPicker dynamically to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import("@/components/supply/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 rounded-2xl border-2 border-[#A3AF87]/20 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#A3AF87] mx-auto mb-3" />
        <p className="text-sm text-gray-600 font-medium">Memuat peta...</p>
      </div>
    </div>
  ),
});

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
  {
    id: "pagi",
    label: "Pagi",
    time: "08:00 - 10:00",
    icon: Sunrise,
    color: "text-orange-500",
  },
  {
    id: "siang",
    label: "Siang",
    time: "12:00 - 14:00",
    icon: Sun,
    color: "text-yellow-500",
  },
  {
    id: "sore",
    label: "Sore",
    time: "16:00 - 18:00",
    icon: Sunset,
    color: "text-purple-500",
  },
];

const weightOptions = [
  { value: "1", label: "< 1 kg", desc: "Sangat kecil" },
  { value: "3", label: "1-3 kg", desc: "Kecil" },
  { value: "5", label: "3-5 kg", desc: "Sedang" },
  { value: "10", label: "5-10 kg", desc: "Besar" },
  { value: "15", label: "> 10 kg", desc: "Sangat besar" },
];

const impactStats = [
  { label: "Sampah Diselamatkan", value: "1,250 kg", icon: Recycle },
  { label: "CO₂ Terhindar", value: "500 kg", icon: Globe },
  { label: "Peternak Terbantu", value: "12", icon: TreePine },
];

export default function SupplyInputPage() {
  const router = useRouter();
  const { toast, success, error: showError, hideToast } = useToast();
  const { userLocation, isSupplyConnectAvailable, isLoading } =
    useUserLocation();
  const { address: defaultAddressData, isLoading: isLoadingAddress } =
    useDefaultAddress();

  // Get clean default address
  const defaultAddress =
    defaultAddressData?.fullAddress || "Belum ada alamat terdaftar";
  const defaultAddressId = defaultAddressData?.id || null;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    wasteType: "",
    weight: "",
    address: "",
    addressId: null as string | null,
    date: "",
    timeSlot: "",
    notes: "",
    photo: null as File | null,
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState("");

  // Update form address when defaultAddress loads
  useEffect(() => {
    if (defaultAddressData && !useCustomAddress) {
      setFormData((prev) => ({
        ...prev,
        address: defaultAddressData.fullAddress,
        addressId: defaultAddressData.id,
      }));
    }
  }, [defaultAddressData, useCustomAddress]);

  // Date picker helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Pilih tanggal";
    const date = new Date(dateStr);
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const selectedDate = new Date(year, month, day);
    const formattedDate = selectedDate.toISOString().split("T")[0];
    setFormData({ ...formData, date: formattedDate });
    setShowDatePicker(false);
  };

  const handlePhotoChange = (file: File | null, preview: string | null) => {
    setFormData({ ...formData, photo: file });
    setPreviewUrl(preview);
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
      address: address || formData.address,
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Import the actions
      const { createSupply, uploadSupplyMedia } =
        await import("@/lib/api/supply.actions");

      let uploadedPhotoUrl: string | undefined;

      // Upload photo if exists
      if (formData.photo) {
        console.log("Uploading photo...");
        const photoResult = await uploadSupplyMedia(formData.photo, "user");
        if (photoResult.success && photoResult.url) {
          uploadedPhotoUrl = photoResult.url;
          console.log("Photo uploaded:", uploadedPhotoUrl);
        } else {
          console.error("Photo upload failed:", photoResult.error);
          showError(
            "Upload Gagal",
            "Gagal mengupload foto: " + photoResult.error,
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare data
      const supplyData = {
        wasteType: formData.wasteType,
        estimatedWeight: formData.weight,
        photoUrl: uploadedPhotoUrl,
        pickupAddress: useCustomAddress ? customAddress : defaultAddress,
        pickupAddressId:
          (useCustomAddress ? undefined : defaultAddressId) || undefined,
        pickupDate: formData.date,
        pickupTimeSlot: formData.timeSlot,
        pickupLatitude: formData.latitude || undefined,
        pickupLongitude: formData.longitude || undefined,
        notes: formData.notes || undefined,
      };

      console.log("Submitting supply data:", supplyData);

      // Submit to database
      const result = await createSupply(supplyData);

      if (result.success) {
        setSuccessData(result.data);
        setIsSuccess(true);
        success(
          "Permintaan Berhasil!",
          "Supply pickup Anda telah berhasil didaftarkan",
        );
      } else {
        console.error("Create supply error:", result);
        showError(
          "Gagal Membuat Supply",
          result.message || "Gagal membuat supply request",
        );
      }
    } catch (error) {
      console.error("Submit error:", error);
      showError("Terjadi Kesalahan", "Terjadi kesalahan saat mengirim data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 =
    formData.wasteType && formData.weight && formData.photo;
  const canProceedStep2 = formData.date && formData.timeSlot;

  // Loading state with skeleton
  if (isLoading || isLoadingAddress) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="flex-1">
              <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Progress Bar Skeleton */}
          <div className="flex gap-2 mb-8 max-w-xl">
            <div className="flex-1 h-2 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 h-2 bg-gray-200 rounded-full animate-pulse" />
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Form Skeleton */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
                <div className="space-y-8">
                  {/* Section 1 */}
                  <div>
                    <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse mb-4" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 lg:p-5 rounded-2xl border-2 border-gray-100 bg-white">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse mb-3" />
                          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div>
                    <div className="h-6 w-56 bg-gray-200 rounded-lg animate-pulse mb-4" />
                    <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 rounded-xl bg-gray-100">
                          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-1" />
                          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3 - Photo */}
                  <div>
                    <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse mb-4" />
                    <div className="w-full aspect-video bg-gray-200 rounded-2xl animate-pulse" />
                  </div>

                  {/* Button Skeleton */}
                  <div className="h-14 w-full bg-gray-200 rounded-2xl animate-pulse" />
                </div>
              </div>
            </div>

            {/* Right Column - Info Panel Skeleton */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {/* Summary Card Skeleton */}
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-400 rounded-lg" />
                  <div className="h-6 w-32 bg-gray-400 rounded" />
                </div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="h-4 w-24 bg-gray-400 rounded" />
                      <div className="h-4 w-16 bg-gray-400 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Guide Card Skeleton */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Stats Skeleton */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
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
              ? "Silakan lengkapi data alamat Anda saat mendaftar untuk menggunakan fitur Supply Connect."
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

  // Success State
  if (isSuccess && successData) {
    // Map waste type to display name
    const wasteTypeNames: Record<string, string> = {
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
      "15": "> 10 kg",
    };

    // Map status to display
    const statusLabels: Record<string, string> = {
      PENDING: "Menunggu Konfirmasi",
      SCHEDULED: "Dijadwalkan",
      ON_THE_WAY: "Kurir Dalam Perjalanan",
      PICKED_UP: "Sudah Diambil",
      COMPLETED: "Selesai",
      CANCELLED: "Dibatalkan",
    };

    // Format date
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-100"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative mx-auto mb-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#A3AF87] to-[#8a9b73] rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Permintaan Berhasil!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Permintaan pickup sampah organik Anda telah diterima. Tim kami akan
            segera menghubungi Anda.
          </p>

          {/* Supply Details Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 mb-6 text-left border border-gray-100 shadow-sm">
            <div className="space-y-3">
              {/* ID Supply */}
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  ID Supply
                </span>
                <span className="text-sm font-bold text-[#A3AF87]">
                  {successData.supplyNumber}
                </span>
              </div>

              {/* Jenis */}
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Recycle className="h-4 w-4" />
                  Jenis
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {wasteTypeNames[successData.wasteType] ||
                    successData.wasteType}
                </span>
              </div>

              {/* Berat */}
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Berat
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {weightLabels[successData.estimatedWeight] ||
                    successData.estimatedWeight}
                </span>
              </div>

              {/* Tanggal Pickup */}
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tanggal Pickup
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatDate(successData.pickupDate)}
                </span>
              </div>

              {/* Waktu Pickup */}
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Waktu
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {successData.pickupTimeRange}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Status
                </span>
                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                  {statusLabels[successData.status] || successData.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/supply/history"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#A3AF87] to-[#8a9b73] text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <History className="h-5 w-5" />
              Lihat Riwayat
            </Link>
            <Link
              href="/supply"
              className="w-full flex items-center justify-center gap-2 text-gray-600 py-3 font-medium hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

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
              <p className="text-sm text-gray-500">Langkah {step} dari 2</p>
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
                step >= 1 ? "bg-[#A3AF87]" : "bg-gray-200"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full transition-colors ${
                step >= 2 ? "bg-[#A3AF87]" : "bg-gray-200"
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
                                  setFormData({
                                    ...formData,
                                    wasteType: type.id,
                                  })
                                }
                                className={`p-4 lg:p-5 rounded-2xl border-2 text-left transition-all ${
                                  isSelected
                                    ? "border-[#A3AF87] bg-[#A3AF87]/5 shadow-md"
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
                                      ? "text-[#A3AF87]"
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
                                    ? "bg-[#A3AF87] text-white shadow-lg"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                <p className="font-bold text-lg">
                                  {option.label}
                                </p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isSelected
                                      ? "text-white/80"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {option.desc}
                                </p>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Photo/Video Upload */}
                      <div>
                        <label className="block text-base font-semibold text-gray-900 mb-4">
                          Foto Sampah <span className="text-red-500">*</span>
                        </label>
                        <MediaUploader
                          onPhotoChange={handlePhotoChange}
                          photoPreview={previewUrl}
                        />
                      </div>

                      {/* Continue Button - Full Width */}
                      <motion.button
                        whileHover={{ scale: canProceedStep1 ? 1.01 : 1 }}
                        whileTap={{ scale: canProceedStep1 ? 0.99 : 1 }}
                        onClick={() => setStep(2)}
                        disabled={!canProceedStep1}
                        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                          canProceedStep1
                            ? "bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white shadow-lg hover:shadow-xl"
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
                      {/* Address & Location Section - Redesigned */}
                      <div className="space-y-6">
                        {/* Section Header */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Lokasi Penjemputan
                          </h3>
                          <p className="text-sm text-gray-600">
                            Tentukan alamat dan titik lokasi untuk memudahkan kurir menemukan sampah Anda
                          </p>
                        </div>

                        {/* Step 1: Address Selection */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-[#A3AF87] text-white rounded-full flex items-center justify-center font-bold text-sm">
                              1
                            </div>
                            <h4 className="font-bold text-gray-900">Pilih Alamat</h4>
                          </div>

                          {/* Default Address Option */}
                          {!useCustomAddress && (
                            <div className="space-y-3">
                              <div className="bg-white rounded-xl p-4 border-2 border-[#A3AF87] shadow-sm">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-[#A3AF87]/10 rounded-lg">
                                    <MapPin className="h-5 w-5 text-[#A3AF87]" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-xs font-semibold text-[#A3AF87]">
                                        ALAMAT TERPILIH
                                      </p>
                                      <CheckCircle className="h-4 w-4 text-[#A3AF87]" />
                                    </div>
                                    <p className="text-sm text-gray-900 font-medium">
                                      {defaultAddress}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setUseCustomAddress(true);
                                  setCustomAddress("");
                                  setFormData({
                                    ...formData,
                                    address: "",
                                    addressId: null,
                                  });
                                }}
                                className="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium text-sm hover:border-[#A3AF87] hover:bg-[#A3AF87]/5 transition-all flex items-center justify-center gap-2"
                              >
                                <MapPin className="h-4 w-4" />
                                Gunakan Alamat Lain
                              </button>
                            </div>
                          )}

                          {/* Custom Address Input */}
                          {useCustomAddress && (
                            <div className="space-y-3">
                              <textarea
                                value={customAddress}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setCustomAddress(value);
                                  setFormData({
                                    ...formData,
                                    address: value,
                                    addressId: null,
                                  });
                                }}
                                placeholder="Masukkan alamat lengkap pickup...\nContoh: Jl. Sudirman No. 45, Peunayong, Banda Aceh"
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#A3AF87] focus:outline-none resize-none text-gray-900 placeholder:text-gray-400"
                              />
                              
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUseCustomAddress(false);
                                    setCustomAddress("");
                                    if (defaultAddressData) {
                                      setFormData({
                                        ...formData,
                                        address: defaultAddressData.fullAddress,
                                        addressId: defaultAddressData.id,
                                      });
                                    }
                                  }}
                                  className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                  <X className="h-4 w-4" />
                                  Batal
                                </button>
                                
                                {customAddress && (
                                  <div className="flex-1 py-2.5 px-4 bg-green-50 text-green-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Tersimpan
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Step 2: Pin Location (Recommended) */}
                        <div className="bg-gradient-to-br from-[#A3AF87]/5 to-white rounded-2xl p-6 border-2 border-[#A3AF87]/30">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#A3AF87] text-white rounded-full flex items-center justify-center font-bold text-sm">
                                2
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  Tandai Titik Lokasi di Peta
                                </h4>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  Direkomendasikan untuk akurasi pickup
                                </p>
                              </div>
                            </div>
                            <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                              REKOMENDASI
                            </div>
                          </div>

                          {/* Info Box */}
                          <div className="mb-4 flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-900">
                              <span className="font-semibold">Mengapa perlu?</span> Titik lokasi yang presisi membantu kurir menemukan lokasi penjemputan dengan cepat dan tepat.
                            </p>
                          </div>

                          <LocationPicker
                            onLocationSelect={handleLocationSelect}
                            initialLat={formData.latitude || undefined}
                            initialLng={formData.longitude || undefined}
                            defaultAddress={
                              useCustomAddress ? customAddress : defaultAddress
                            }
                          />
                        </div>
                      </div>

                      {/* Date & Time Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Date Picker Custom */}
                        <div>
                          <label className="block text-base font-semibold text-gray-900 mb-4">
                            Tanggal Pickup
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowDatePicker(!showDatePicker)}
                              className="w-full px-5 py-4 bg-gradient-to-r from-[#A3AF87]/5 to-[#A3AF87]/10 border-2 border-[#A3AF87]/30 rounded-2xl text-left hover:border-[#A3AF87] transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#A3AF87]/20 rounded-xl group-hover:bg-[#A3AF87]/30 transition-colors">
                                  <Calendar className="h-5 w-5 text-[#A3AF87]" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-600 font-medium">
                                    Pilih Tanggal
                                  </p>
                                  <p className="text-base font-semibold text-gray-900">
                                    {formatDateDisplay(formData.date)}
                                  </p>
                                </div>
                                <ChevronRight
                                  className={`h-5 w-5 text-[#A3AF87] transition-transform ${
                                    showDatePicker ? "rotate-90" : ""
                                  }`}
                                />
                              </div>
                            </button>

                            {/* Custom Date Picker Dropdown */}
                            {showDatePicker && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute z-50 mt-2 w-full bg-white border-2 border-[#A3AF87]/30 rounded-2xl shadow-2xl p-5"
                              >
                                {/* Month Navigator */}
                                <div className="flex items-center justify-between mb-4">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCurrentMonth(
                                        new Date(
                                          currentMonth.getFullYear(),
                                          currentMonth.getMonth() - 1,
                                        ),
                                      )
                                    }
                                    className="p-2 hover:bg-[#A3AF87]/10 rounded-lg transition-colors"
                                  >
                                    <ChevronLeft className="h-5 w-5 text-[#A3AF87]" />
                                  </button>
                                  <p className="font-bold text-gray-900">
                                    {currentMonth.toLocaleDateString("id-ID", {
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCurrentMonth(
                                        new Date(
                                          currentMonth.getFullYear(),
                                          currentMonth.getMonth() + 1,
                                        ),
                                      )
                                    }
                                    className="p-2 hover:bg-[#A3AF87]/10 rounded-lg transition-colors"
                                  >
                                    <ChevronRight className="h-5 w-5 text-[#A3AF87]" />
                                  </button>
                                </div>

                                {/* Days Header */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                  {[
                                    "Min",
                                    "Sen",
                                    "Sel",
                                    "Rab",
                                    "Kam",
                                    "Jum",
                                    "Sab",
                                  ].map((day) => (
                                    <div
                                      key={day}
                                      className="text-center text-xs font-semibold text-gray-500 py-2"
                                    >
                                      {day}
                                    </div>
                                  ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 gap-1">
                                  {Array.from({
                                    length:
                                      getDaysInMonth(currentMonth)
                                        .startingDayOfWeek,
                                  }).map((_, i) => (
                                    <div
                                      key={`empty-${i}`}
                                      className="aspect-square"
                                    />
                                  ))}
                                  {Array.from({
                                    length:
                                      getDaysInMonth(currentMonth).daysInMonth,
                                  }).map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = new Date(
                                      currentMonth.getFullYear(),
                                      currentMonth.getMonth(),
                                      day,
                                    )
                                      .toISOString()
                                      .split("T")[0];
                                    const isSelected =
                                      formData.date === dateStr;
                                    const isToday =
                                      dateStr ===
                                      new Date().toISOString().split("T")[0];
                                    const isPast =
                                      new Date(dateStr) <
                                      new Date(
                                        new Date().toISOString().split("T")[0],
                                      );

                                    return (
                                      <button
                                        key={day}
                                        type="button"
                                        onClick={() =>
                                          !isPast && handleDateSelect(day)
                                        }
                                        disabled={isPast}
                                        className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                                          isPast
                                            ? "text-gray-300 cursor-not-allowed"
                                            : isSelected
                                              ? "bg-gradient-to-br from-[#A3AF87] to-[#95a17a] text-white shadow-lg scale-105"
                                              : isToday
                                                ? "bg-[#A3AF87]/10 text-[#A3AF87] border-2 border-[#A3AF87]/30"
                                                : "hover:bg-[#A3AF87]/5 text-gray-700"
                                        }`}
                                      >
                                        {day}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Today Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const today = new Date();
                                    setCurrentMonth(today);
                                    handleDateSelect(today.getDate());
                                  }}
                                  className="w-full mt-4 py-2.5 bg-[#A3AF87]/10 text-[#A3AF87] font-semibold rounded-xl hover:bg-[#A3AF87]/20 transition-colors"
                                >
                                  Hari Ini
                                </button>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Time Slot - Icon Based */}
                        <div>
                          <label className="block text-base font-semibold text-gray-900 mb-4">
                            Waktu Pickup
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {timeSlots.map((slot) => {
                              const isSelected = formData.timeSlot === slot.id;
                              const IconComponent = slot.icon;
                              return (
                                <motion.button
                                  key={slot.id}
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      timeSlot: slot.id,
                                    })
                                  }
                                  className={`p-4 rounded-2xl transition-all group ${
                                    isSelected
                                      ? "bg-gradient-to-br from-[#A3AF87] to-[#95a17a] shadow-xl border-2 border-[#A3AF87]"
                                      : "bg-white border-2 border-gray-200 hover:border-[#A3AF87]/50 hover:shadow-lg"
                                  }`}
                                >
                                  <div
                                    className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "bg-white/20"
                                        : "bg-gray-50 group-hover:bg-[#A3AF87]/10"
                                    }`}
                                  >
                                    <IconComponent
                                      className={`h-6 w-6 ${
                                        isSelected ? "text-white" : slot.color
                                      }`}
                                    />
                                  </div>
                                  <p
                                    className={`font-bold text-sm ${
                                      isSelected
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {slot.label}
                                  </p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      isSelected
                                        ? "text-white/80"
                                        : "text-gray-500"
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
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 transition-all resize-none text-gray-900"
                        />
                      </div>

                      {/* Submit Button - Full Width */}
                      <motion.button
                        whileHover={{
                          scale: canProceedStep2 && !isSubmitting ? 1.01 : 1,
                        }}
                        whileTap={{
                          scale: canProceedStep2 && !isSubmitting ? 0.99 : 1,
                        }}
                        onClick={handleSubmit}
                        disabled={!canProceedStep2 || isSubmitting}
                        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                          canProceedStep2 && !isSubmitting
                            ? "bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white shadow-lg hover:shadow-xl"
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
              <div className="bg-gradient-to-br from-[#A3AF87] to-[#95a17a] rounded-2xl p-6 text-white shadow-lg">
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
                        {
                          timeSlots.find((t) => t.id === formData.timeSlot)
                            ?.time
                        }
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
                      <div className="w-6 h-6 bg-[#A3AF87]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[#A3AF87]">
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
                  <div className="p-2 bg-[#A3AF87]/10 rounded-lg">
                    <Sparkles className="h-5 w-5 text-[#A3AF87]" />
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
                        <div className="p-2 bg-[#A3AF87]/10 rounded-lg">
                          <Icon className="h-4 w-4 text-[#A3AF87]" />
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

              {/* Pickup Map - Banda Aceh */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#A3AF87] to-[#95a17a] rounded-lg shadow-sm">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Lokasi Pickup</h3>
                    <p className="text-xs text-gray-500">Banda Aceh, NAD</p>
                  </div>
                </div>

                {/* Modern Map Embed */}
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127334.89283826!2d95.24!3d5.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3040377ae63dbbed%3A0x3039d80b220cb90!2sBanda%20Aceh%2C%20Aceh!5e0!3m2!1sen!2sid!4v1234567890"
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale-[30%]"
                  />

                  {/* Overlay to prevent interaction */}
                  <div
                    className="absolute inset-0 bg-[#A3AF87]/20 pointer-events-auto"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(163, 175, 135, 0.15) 0%, rgba(163, 175, 135, 0.25) 100%)",
                    }}
                  />

                  {/* Overlay badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-gray-700">
                        Area Layanan Aktif
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Info */}
                <div className="mt-4 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-[#A3AF87] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {useCustomAddress && customAddress
                        ? customAddress
                        : defaultAddress}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
