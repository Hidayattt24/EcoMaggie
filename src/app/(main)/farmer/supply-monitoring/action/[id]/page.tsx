"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Clock,
  Package,
  CheckCircle,
  Truck,
  Save,
  AlertCircle,
  Scale,
  FileText,
  Phone,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import {
  getFarmerSupplyById,
  updateSupplyStatus,
  type SupplyWithUser,
} from "@/lib/api/farmer-supply.actions";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";

interface SupplyActionPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusConfig = {
  PENDING: {
    label: "Menunggu Penjadwalan",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
    actions: ["schedule"],
  },
  SCHEDULED: {
    label: "Terjadwal",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
    actions: ["pickup"],
  },
  ON_THE_WAY: {
    label: "Dalam Perjalanan",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
    actions: ["picked_up"],
  },
  PICKED_UP: {
    label: "Sudah Diambil",
    color: "bg-green-50 text-green-700 border-green-200",
    dotColor: "bg-green-500",
    actions: ["complete"],
  },
  COMPLETED: {
    label: "Selesai Diproses",
    color: "bg-[#A3AF87]/20 text-[#5a6c5b] border-[#A3AF87]",
    dotColor: "bg-[#A3AF87]",
    actions: [],
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-500",
    actions: [],
  },
};

// Waste type is now stored as proper name in database, no need for mapping

// Map weight to display label
const weightLabels: Record<string, string> = {
  "1": "< 1 kg",
  "3": "1-3 kg",
  "5": "3-5 kg",
  "10": "5-10 kg",
  "15": "10-15 kg",
};

export default function SupplyActionPage({ params }: SupplyActionPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { toast, success, error, warning, hideToast } = useToast();
  
  const [supply, setSupply] = useState<SupplyWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [formData, setFormData] = useState({
    driver: "",
    driverPhone: "",
    estimatedArrival: "",
    actualWeight: "",
    condition: "",
    internalNotes: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Fetch supply data
  useEffect(() => {
    async function fetchSupply() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const response = await getFarmerSupplyById(id);
        if (response.success && response.data) {
          setSupply(response.data);
          setCurrentStatus(response.data.status);
          setFormData({
            driver: response.data.courierName || "",
            driverPhone: response.data.courierPhone || "",
            estimatedArrival: response.data.estimatedArrival || "",
            actualWeight: response.data.actualWeight?.toString() || "",
            condition: response.data.wasteCondition || "",
            internalNotes: response.data.internalNotes || "",
          });
        } else {
          setErrorMsg(response.message || "Gagal memuat data supply");
        }
      } catch (err) {
        console.error("Error fetching supply:", err);
        setErrorMsg("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSupply();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!supply) return;

    // Validate required fields based on status
    if (newStatus === "SCHEDULED") {
      if (!formData.driver || !formData.driverPhone) {
        warning(
          "Data Tidak Lengkap",
          "Harap isi nama driver dan nomor telepon untuk menjadwalkan!"
        );
        return;
      }
    }

    if (newStatus === "COMPLETED") {
      if (!formData.actualWeight) {
        warning(
          "Berat Belum Diisi",
          "Harap isi berat aktual sampah untuk menyelesaikan!"
        );
        return;
      }
    }

    setIsSaving(true);

    try {
      const response = await updateSupplyStatus({
        supplyId: supply.id,
        status: newStatus as any,
        courierName: formData.driver || undefined,
        courierPhone: formData.driverPhone || undefined,
        estimatedArrival: formData.estimatedArrival || undefined,
        actualWeight: formData.actualWeight ? parseFloat(formData.actualWeight) : undefined,
        wasteCondition: formData.condition || undefined,
        internalNotes: formData.internalNotes || undefined,
      });

      if (response.success) {
        setCurrentStatus(newStatus);
        success(
          "Status Berhasil Diupdate!",
          `Supply telah diupdate ke status: ${statusConfig[newStatus as keyof typeof statusConfig].label}`
        );

        setTimeout(() => {
          router.push(`/farmer/supply-monitoring/${id}`);
        }, 2000);
      } else {
        error(
          "Update Gagal",
          response.message || "Gagal update status"
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
      error(
        "Terjadi Kesalahan",
        "Terjadi kesalahan saat update status"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInfo = async () => {
    if (!supply) return;

    setIsSaving(true);

    try {
      const response = await updateSupplyStatus({
        supplyId: supply.id,
        status: currentStatus as any,
        courierName: formData.driver || undefined,
        courierPhone: formData.driverPhone || undefined,
        estimatedArrival: formData.estimatedArrival || undefined,
        actualWeight: formData.actualWeight ? parseFloat(formData.actualWeight) : undefined,
        wasteCondition: formData.condition || undefined,
        internalNotes: formData.internalNotes || undefined,
      });

      if (response.success) {
        success(
          "Informasi Tersimpan!",
          "Data verifikasi sampah berhasil disimpan"
        );
      } else {
        error(
          "Gagal Menyimpan",
          response.message || "Gagal menyimpan informasi"
        );
      }
    } catch (err) {
      console.error("Error saving info:", err);
      error(
        "Terjadi Kesalahan",
        "Terjadi kesalahan saat menyimpan informasi"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="flex items-start justify-between">
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-4 space-y-4 lg:space-y-6">
              {/* Supplier Card Skeleton */}
              <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6 animate-pulse">
                <div className="h-5 bg-gray-300 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-5 bg-gray-300 rounded w-32"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-5 bg-gray-300 rounded w-28"></div>
                  </div>
                </div>
              </div>

              {/* Waste Info Skeleton */}
              <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6 animate-pulse">
                <div className="h-5 bg-gray-300 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-5 bg-gray-300 rounded w-36"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-24 mb-2"></div>
                    <div className="h-5 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>

              {/* Pickup Info Skeleton */}
              <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6 animate-pulse">
                <div className="h-5 bg-gray-300 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-20 mb-2"></div>
                    <div className="h-5 bg-gray-300 rounded w-40"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-5 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-8 space-y-4 lg:space-y-6">
              {/* Driver Form Skeleton */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="space-y-4">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>

              {/* Internal Notes Skeleton */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-36 mb-4"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
                  <div className="h-24 bg-gray-200 rounded-xl"></div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl border-2 border-gray-200 p-6 animate-pulse">
                <div className="h-5 bg-gray-300 rounded w-40 mb-4"></div>
                <div className="h-14 bg-gray-300 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (errorMsg || !supply) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#303646] mb-2">
            Gagal Memuat Data
          </h2>
          <p className="text-gray-600 mb-6">{errorMsg || "Supply tidak ditemukan"}</p>
          <Link
            href="/farmer/supply-monitoring"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#a3af87] text-white rounded-xl font-semibold hover:bg-[#435664] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Monitoring
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[currentStatus as keyof typeof statusConfig];

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
      
      <div className="min-h-screen bg-gradient-to-br from-[#fdf8d4]/20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Link
            href={`/farmer/supply-monitoring/${id}`}
            className="inline-flex items-center gap-2 text-sm text-[#5a6c5b] hover:text-[#4a5c4b] mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Detail
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#303646] mb-2">
                Action Center
              </h1>
              <p className="text-[#435664]">Supply ID: {supply.supplyNumber}</p>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${status.color}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${status.dotColor} animate-pulse`}
              ></div>
              <span className="text-sm font-semibold">{status.label}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Column - Supply Info (Read Only) */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 space-y-4 lg:space-y-6"
          >
            {/* Supplier Card - Use address recipient data if available */}
            <div className="bg-[#fdf8d4]/30 rounded-2xl border-2 border-[#a3af87]/30 p-6">
              <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-[#a3af87]" />
                Penyuplai
              </h3>
              <div className="space-y-3">
                {supply.addressLabel && (
                  <div>
                    <p className="text-sm text-[#435664]">Label Alamat</p>
                    <p className="font-semibold text-[#a3af87]">
                      📍 {supply.addressLabel}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-[#435664]">Nama Penerima</p>
                  <p className="font-semibold text-[#303646]">
                    {supply.addressRecipientName || supply.userName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#435664]">Telepon</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#a3af87]" />
                    <a
                      href={`tel:${supply.addressRecipientPhone || supply.userPhone}`}
                      className="font-semibold text-[#303646] hover:text-[#a3af87]"
                    >
                      {supply.addressRecipientPhone || supply.userPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Waste Info Card */}
            <div className="bg-[#fdf8d4]/30 rounded-2xl border-2 border-[#a3af87]/30 p-6">
              <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#a3af87]" />
                Detail Sampah
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[#435664]">Jenis</p>
                  <p className="font-semibold text-[#303646]">
                    {supply.wasteType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#435664]">Estimasi Berat</p>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-[#a3af87]" />
                    <p className="font-semibold text-[#303646]">
                      {weightLabels[supply.estimatedWeight] || `${supply.estimatedWeight} kg`}
                    </p>
                  </div>
                </div>
                {supply.notes && (
                  <div>
                    <p className="text-sm text-[#435664]">Catatan</p>
                    <p className="text-sm text-[#303646] italic">
                      {supply.notes}
                    </p>
                  </div>
                )}
                {supply.photoUrl && (
                  <div>
                    <p className="text-sm text-[#435664] mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Foto/Video
                    </p>
                    <div className="relative w-full">
                      {supply.photoUrl.endsWith('.mp4') || 
                       supply.photoUrl.endsWith('.mov') || 
                       supply.photoUrl.endsWith('.avi') ||
                       supply.photoUrl.endsWith('.webm') ||
                       supply.photoUrl.includes('/videos/') ? (
                        <video
                          src={supply.photoUrl}
                          controls
                          className="w-full h-40 object-cover rounded-lg border border-[#a3af87]/30 bg-[#fdf8d4]/10"
                        >
                          Browser Anda tidak mendukung video.
                        </video>
                      ) : (
                        <img
                          src={supply.photoUrl}
                          alt="Waste photo"
                          onError={(e) => {
                            console.error("Error loading image:", supply.photoUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                          className="w-full h-32 object-cover rounded-lg border border-[#a3af87]/30"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pickup Info Card */}
            <div className="bg-[#fdf8d4]/30 rounded-2xl border-2 border-[#a3af87]/30 p-6">
              <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#a3af87]" />
                Penjemputan
              </h3>
              <div className="space-y-4">
                {/* Address Details */}
                <div>
                  <p className="text-sm text-[#435664] mb-2 font-semibold">Alamat Lengkap</p>
                  {supply.addressLabel && (
                    <p className="text-xs font-bold text-[#a3af87] mb-1">
                      📍 {supply.addressLabel}
                    </p>
                  )}
                  {supply.addressStreet ? (
                    <div className="bg-white rounded-xl p-3 border-2 border-[#a3af87]/20">
                      <p className="text-sm text-[#303646] font-semibold mb-2">
                        {supply.addressStreet}
                      </p>
                      <div className="space-y-1 text-xs text-[#435664]">
                        {supply.addressVillage && (
                          <p>Desa/Kelurahan: <span className="font-medium text-[#303646]">{supply.addressVillage}</span></p>
                        )}
                        {supply.addressDistrict && (
                          <p>Kecamatan: <span className="font-medium text-[#303646]">{supply.addressDistrict}</span></p>
                        )}
                        {supply.addressCity && (
                          <p>Kota/Kabupaten: <span className="font-medium text-[#303646]">{supply.addressCity}</span></p>
                        )}
                        {supply.addressProvince && (
                          <p>Provinsi: <span className="font-medium text-[#303646]">{supply.addressProvince}</span></p>
                        )}
                        {supply.addressPostalCode && (
                          <p>Kode Pos: <span className="font-medium text-[#303646]">{supply.addressPostalCode}</span></p>
                        )}
                      </div>
                      {supply.pickupLatitude && supply.pickupLongitude && (
                        <a
                          href={`https://www.google.com/maps?q=${supply.pickupLatitude},${supply.pickupLongitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold text-xs transition-all shadow-md hover:shadow-lg"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Buka di Google Maps
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-3 border-2 border-[#a3af87]/20">
                      <p className="text-sm text-[#303646]">{supply.pickupAddress}</p>
                      {supply.pickupLatitude && supply.pickupLongitude && (
                        <a
                          href={`https://www.google.com/maps?q=${supply.pickupLatitude},${supply.pickupLongitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold text-xs transition-all shadow-md hover:shadow-lg"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Buka di Google Maps
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-[#a3af87]/20">
                    <p className="text-xs text-[#435664] mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Tanggal
                    </p>
                    <p className="font-semibold text-sm text-[#303646]">
                      {new Date(supply.pickupDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-[#a3af87]/20">
                    <p className="text-xs text-[#435664] mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Waktu
                    </p>
                    <p className="font-semibold text-sm text-[#303646]">
                      {supply.pickupTimeRange || supply.pickupTimeSlot}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Action Forms */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 space-y-4 lg:space-y-6"
          >
            {/* Driver Assignment Form */}
            {(currentStatus === "PENDING" || currentStatus === "SCHEDULED") && (
              <div className="bg-white rounded-2xl border-2 border-[#a3af87]/30 p-6">
                <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#a3af87]" />
                  Informasi Driver
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#303646] mb-2">
                      Nama Driver <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="driver"
                      value={formData.driver}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama driver"
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#a3af87]/30 focus:border-[#a3af87] focus:outline-none transition-colors text-[#303646] placeholder:text-[#435664]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#303646] mb-2">
                      Nomor Telepon Driver{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="driverPhone"
                      value={formData.driverPhone}
                      onChange={handleInputChange}
                      placeholder="Contoh: 082172319892"
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#a3af87]/30 focus:border-[#a3af87] focus:outline-none transition-colors text-[#303646] placeholder:text-[#435664]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#303646] mb-2">
                      Estimasi Kedatangan (ETA)
                    </label>
                    <input
                      type="text"
                      name="estimatedArrival"
                      value={formData.estimatedArrival}
                      onChange={handleInputChange}
                      placeholder="Contoh: 15 menit lagi"
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#a3af87]/30 focus:border-[#a3af87] focus:outline-none transition-colors text-[#303646] placeholder:text-[#435664]"
                    />
                  </div>

                  <button
                    onClick={handleSaveInfo}
                    disabled={isSaving}
                    className="w-full px-6 py-3 bg-[#fdf8d4]/50 hover:bg-[#fdf8d4] text-[#435664] rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-[#a3af87]/30"
                  >
                    <Save className="h-5 w-5" />
                    {isSaving ? "Menyimpan..." : "Simpan Informasi"}
                  </button>
                </div>
              </div>
            )}

            {/* Completion Form */}
            {(currentStatus === "ON_THE_WAY" || currentStatus === "PICKED_UP") && (
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-[#A3AF87]" />
                  Verifikasi Sampah
                </h3>

                <div className="space-y-6">
                  {/* Actual Weight Input - Enhanced */}
                  <div className="p-5 bg-gradient-to-br from-[#A3AF87]/5 to-blue-50/50 rounded-2xl border-2 border-[#A3AF87]/20">
                    <label className="block text-base font-bold text-[#303646] mb-3 flex items-center gap-2">
                      <Scale className="h-5 w-5 text-[#A3AF87]" />
                      Berat Aktual Sampah <span className="text-red-500">*</span>
                    </label>
                    
                    <div className="relative">
                      <input
                        type="number"
                        name="actualWeight"
                        value={formData.actualWeight}
                        onChange={handleInputChange}
                        placeholder="0.0"
                        step="0.1"
                        min="0"
                        max="100"
                        className="w-full px-6 py-4 pr-16 text-2xl font-bold rounded-xl border-2 border-[#A3AF87]/30 focus:border-[#A3AF87] focus:outline-none transition-colors text-[#303646] placeholder:text-gray-300 bg-white"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#A3AF87]">
                        kg
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <p className="text-gray-600">
                        Estimasi: <span className="font-semibold text-[#303646]">
                          {weightLabels[supply.estimatedWeight] || `${supply.estimatedWeight} kg`}
                        </span>
                      </p>
                      {formData.actualWeight && (
                        <p className="text-[#A3AF87] font-semibold">
                          ✓ Berat tercatat
                        </p>
                      )}
                    </div>
                    
                    {/* Weight Guide */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-xs text-blue-800 flex items-start gap-2">
                        <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>
                          <strong>Panduan:</strong> Timbang sampah dengan timbangan digital untuk hasil akurat. Masukkan berat dalam kilogram (kg).
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Condition Description */}
                  <div>
                    <label className="block text-sm font-semibold text-[#303646] mb-2">
                      Deskripsi Kondisi Sampah
                    </label>
                    <textarea
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      placeholder="Contoh: Kondisi baik, sesuai deskripsi, tidak ada kontaminasi"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#A3AF87] focus:outline-none transition-colors resize-none text-[#303646] placeholder:text-gray-400"
                    />
                  </div>

                  <button
                    onClick={handleSaveInfo}
                    disabled={isSaving}
                    className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="h-5 w-5" />
                    {isSaving ? "Menyimpan..." : "Simpan Informasi"}
                  </button>
                </div>
              </div>
            )}

            {/* Internal Notes */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
              <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#A3AF87]" />
                Catatan Internal
              </h3>

              <div>
                <label className="block text-sm font-semibold text-[#303646] mb-2">
                  Catatan Internal (Opsional)
                </label>
                <textarea
                  name="internalNotes"
                  value={formData.internalNotes}
                  onChange={handleInputChange}
                  placeholder="Tambahkan catatan internal (tidak terlihat oleh penyuplai)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#A3AF87] focus:outline-none transition-colors resize-none text-[#303646] placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Status Change Actions */}
            {currentStatus !== "COMPLETED" && currentStatus !== "CANCELLED" && (
              <div className="bg-gradient-to-br from-[#A3AF87]/10 to-[#FDF8D4]/30 rounded-2xl border-2 border-[#A3AF87]/20 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-[#A3AF87] mt-0.5" />
                  <div>
                    <h3 className="font-bold text-[#303646] mb-1">
                      Update Status Supply
                    </h3>
                    <p className="text-sm text-gray-600">
                      Pilih aksi untuk mengubah status supply ini
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {currentStatus === "PENDING" && (
                    <button
                      onClick={() => handleStatusChange("SCHEDULED")}
                      disabled={isSaving}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <Calendar className="h-5 w-5" />
                      {isSaving ? "Memproses..." : "Jadwalkan Penjemputan"}
                    </button>
                  )}

                  {currentStatus === "SCHEDULED" && (
                    <button
                      onClick={() => handleStatusChange("ON_THE_WAY")}
                      disabled={isSaving}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <Truck className="h-5 w-5" />
                      {isSaving ? "Memproses..." : "Driver Menuju Lokasi"}
                    </button>
                  )}

                  {currentStatus === "ON_THE_WAY" && (
                    <button
                      onClick={() => handleStatusChange("PICKED_UP")}
                      disabled={isSaving}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <CheckCircle className="h-5 w-5" />
                      {isSaving ? "Memproses..." : "Sampah Sudah Diambil"}
                    </button>
                  )}

                  {currentStatus === "PICKED_UP" && (
                    <button
                      onClick={() => handleStatusChange("COMPLETED")}
                      disabled={isSaving}
                      className="w-full px-6 py-4 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] hover:from-[#95a17a] hover:to-[#8a9471] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <CheckCircle className="h-5 w-5" />
                      {isSaving ? "Memproses..." : "Sampah Diterima"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Completed State */}
            {(currentStatus === "COMPLETED" || currentStatus === "CANCELLED") && (
              <div className="bg-[#A3AF87]/10 rounded-2xl border-2 border-[#A3AF87] p-8 text-center">
                <CheckCircle className="h-16 w-16 text-[#A3AF87] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#303646] mb-2">
                  Supply Selesai Diproses
                </h3>
                <p className="text-gray-600">
                  Semua tahapan penjemputan telah selesai
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      </div>
    </>
  );
}
