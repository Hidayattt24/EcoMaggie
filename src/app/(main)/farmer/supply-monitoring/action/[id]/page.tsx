"use client";

import { use, useState } from "react";
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
} from "lucide-react";

interface SupplyActionPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock supply data
const getSupplyData = (id: string) => ({
  id: id,
  supplierId: "USR-123",
  supplierName: "Ahmad Yani",
  supplierPhone: "082288953268",
  wasteType: "Sisa Makanan",
  weight: "3-5 kg",
  estimatedWeight: 4,
  address: "Jl. T. Nyak Arief No. 12, Lamnyong, Banda Aceh",
  pickupDate: "2026-01-04",
  pickupTime: "08:00 - 10:00",
  status: "waiting",
  submittedAt: "2026-01-03T14:30:00",
  driver: null,
  driverPhone: null,
  estimatedArrival: null,
  actualWeight: null,
  condition: null,
  notes: "Sampah di depan pagar, kantong hitam",
});

const statusConfig = {
  waiting: {
    label: "Menunggu Penjadwalan",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
    actions: ["schedule"],
  },
  scheduled: {
    label: "Terjadwal",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
    actions: ["pickup"],
  },
  on_route: {
    label: "Dalam Perjalanan",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
    actions: ["complete"],
  },
  completed: {
    label: "Selesai Diproses",
    color: "bg-[#A3AF87]/20 text-[#5a6c5b] border-[#A3AF87]",
    dotColor: "bg-[#A3AF87]",
    actions: [],
  },
};

export default function SupplyActionPage({ params }: SupplyActionPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const supply = getSupplyData(id);

  const [currentStatus, setCurrentStatus] = useState(supply.status);
  const [formData, setFormData] = useState({
    driver: supply.driver || "",
    driverPhone: supply.driverPhone || "",
    estimatedArrival: supply.estimatedArrival || "",
    actualWeight: supply.actualWeight || "",
    condition: supply.condition || "",
    internalNotes: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const status = statusConfig[currentStatus as keyof typeof statusConfig];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    // Validate required fields based on status
    if (newStatus === "scheduled") {
      if (!formData.driver || !formData.driverPhone) {
        alert("Harap isi nama driver dan nomor telepon untuk menjadwalkan!");
        return;
      }
    }

    if (newStatus === "completed") {
      if (!formData.actualWeight) {
        alert("Harap isi berat aktual sampah untuk menyelesaikan!");
        return;
      }
    }

    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setCurrentStatus(newStatus);
      setIsSaving(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        // Redirect back to detail page
        router.push(`/farmer/supply-monitoring/${id}`);
      }, 2000);
    }, 1000);
  };

  const handleSaveInfo = async () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }, 800);
  };

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
              <p className="text-gray-600">Supply ID: {supply.id}</p>
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

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 p-4 bg-[#A3AF87]/10 border-2 border-[#A3AF87] rounded-xl flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-[#A3AF87]" />
            <p className="text-[#5a6c5b] font-semibold">
              Perubahan berhasil disimpan!
            </p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Column - Supply Info (Read Only) */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 space-y-4 lg:space-y-6"
          >
            {/* Supplier Card */}
            <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6">
              <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                Penyuplai
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-semibold text-[#303646]">
                    {supply.supplierName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telepon</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${supply.supplierPhone}`}
                      className="font-semibold text-[#303646] hover:text-[#A3AF87]"
                    >
                      {supply.supplierPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Waste Info Card */}
            <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6">
              <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-400" />
                Detail Sampah
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Jenis</p>
                  <p className="font-semibold text-[#303646]">
                    {supply.wasteType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimasi Berat</p>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold text-[#303646]">
                      {supply.weight} (~{supply.estimatedWeight} kg)
                    </p>
                  </div>
                </div>
                {supply.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Catatan</p>
                    <p className="text-sm text-[#303646] italic">
                      {supply.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pickup Info Card */}
            <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6">
              <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                Penjemputan
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Alamat</p>
                  <p className="text-sm text-[#303646]">{supply.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tanggal
                  </p>
                  <p className="font-semibold text-[#303646]">
                    {new Date(supply.pickupDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Waktu
                  </p>
                  <p className="font-semibold text-[#303646]">
                    {supply.pickupTime}
                  </p>
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
            {(currentStatus === "waiting" || currentStatus === "scheduled") && (
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#A3AF87]" />
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#A3AF87] focus:outline-none transition-colors text-[#303646] placeholder:text-gray-400"
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
                      placeholder="Contoh: 082288953268"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#A3AF87] focus:outline-none transition-colors text-[#303646] placeholder:text-gray-400"
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#A3AF87] focus:outline-none transition-colors text-[#303646] placeholder:text-gray-400"
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

            {/* Completion Form */}
            {currentStatus === "on_route" && (
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-[#A3AF87]" />
                  Verifikasi Sampah
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#303646] mb-2">
                      Berat Aktual (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="actualWeight"
                      value={formData.actualWeight}
                      onChange={handleInputChange}
                      placeholder="Masukkan berat sebenarnya"
                      step="0.1"
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#A3AF87] focus:outline-none transition-colors text-[#303646] placeholder:text-gray-400"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Estimasi: {supply.estimatedWeight} kg
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#303646] mb-2">
                      Kondisi Sampah
                    </label>
                    <textarea
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      placeholder="Contoh: Kondisi baik, sesuai deskripsi"
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
            {currentStatus !== "completed" && (
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
                  {currentStatus === "waiting" && (
                    <button
                      onClick={() => handleStatusChange("scheduled")}
                      disabled={isSaving}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <Calendar className="h-5 w-5" />
                      {isSaving ? "Memproses..." : "Jadwalkan Penjemputan"}
                    </button>
                  )}

                  {currentStatus === "scheduled" && (
                    <button
                      onClick={() => handleStatusChange("on_route")}
                      disabled={isSaving}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <Truck className="h-5 w-5" />
                      {isSaving ? "Memproses..." : "Driver Menuju Lokasi"}
                    </button>
                  )}

                  {currentStatus === "on_route" && (
                    <button
                      onClick={() => handleStatusChange("completed")}
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
            {currentStatus === "completed" && (
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
  );
}
