"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Scale,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Phone,
  User,
  Copy,
  MessageCircle,
  Recycle,
  FileText,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { getSupplyById, type UserSupply } from "@/lib/api/supply.actions";

// Map database waste types to display labels
const wasteTypeLabels: Record<string, string> = {
  sisa_makanan: "Sisa Makanan",
  sayuran_buah: "Sayuran & Buah",
  sisa_dapur: "Sisa Dapur",
  campuran: "Campuran Organik",
};

// Map database weight values to display labels
const weightLabels: Record<string, string> = {
  "1": "1 kg",
  "3": "1-3 kg",
  "5": "3-5 kg",
  "10": "5-10 kg",
  "15": "10-15 kg",
};

// Map database status to display config
const getStatusConfig = (dbStatus: string) => {
  if (dbStatus === "PENDING" || dbStatus === "SCHEDULED") {
    return {
      label: "Menunggu",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    };
  }
  if (dbStatus === "ON_THE_WAY" || dbStatus === "PICKED_UP") {
    return {
      label: "Diproses",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    };
  }
  if (dbStatus === "COMPLETED") {
    return {
      label: "Selesai",
      color: "bg-[#A3AF87]/20 text-[#5a6c5b] border-[#A3AF87]",
      iconBg: "bg-[#A3AF87]/20",
      iconColor: "text-[#A3AF87]",
    };
  }
  if (dbStatus === "CANCELLED") {
    return {
      label: "Dibatalkan",
      color: "bg-red-50 text-red-700 border-red-200",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    };
  }
  return {
    label: "Menunggu",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  };
};

// Build timeline from status history - 5 steps consistent with farmer view
const buildTimeline = (supply: UserSupply) => {
  const timeline = [
    {
      status: "PENDING",
      label: "Permintaan Diterima",
      date: supply.createdAt,
      completed: true,
    },
    {
      status: "SCHEDULED",
      label: "Pickup Dijadwalkan",
      date: supply.statusHistory?.find((h: any) => h.status === "SCHEDULED")?.timestamp || null,
      completed: ["SCHEDULED", "ON_THE_WAY", "PICKED_UP", "COMPLETED"].includes(supply.status),
    },
    {
      status: "ON_THE_WAY",
      label: "Driver Menuju Lokasi",
      date: supply.statusHistory?.find((h: any) => h.status === "ON_THE_WAY")?.timestamp || null,
      completed: ["ON_THE_WAY", "PICKED_UP", "COMPLETED"].includes(supply.status),
    },
    {
      status: "PICKED_UP",
      label: "Sampah Diambil",
      date: supply.pickedUpAt || supply.statusHistory?.find((h: any) => h.status === "PICKED_UP")?.timestamp || null,
      completed: ["PICKED_UP", "COMPLETED"].includes(supply.status),
    },
    {
      status: "COMPLETED",
      label: "Sampah Diterima",
      date: supply.completedAt || supply.statusHistory?.find((h: any) => h.status === "COMPLETED")?.timestamp || null,
      completed: supply.status === "COMPLETED",
    },
  ];
  
  return timeline;
};

export default function SupplyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [supply, setSupply] = useState<UserSupply | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplyId, setSupplyId] = useState<string | null>(null);

  // Unwrap params Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setSupplyId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!supplyId) return;

    async function fetchSupply() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getSupplyById(supplyId!);

        if (response.success && response.data) {
          setSupply(response.data);
        } else {
          setError(response.message || "Supply tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching supply:", err);
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSupply();
  }, [supplyId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#A3AF87] mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail supply...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !supply) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Supply Tidak Ditemukan"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Supply yang Anda cari tidak ditemukan atau Anda tidak memiliki akses
            ke supply ini.
          </p>
          <Link
            href="/supply/history"
            className="w-full flex items-center justify-center gap-2 bg-[#A3AF87] text-white py-3.5 rounded-xl font-semibold mb-3 hover:bg-[#95a17a] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Riwayat
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatusConfig(supply.status);
  const timeline = buildTimeline(supply);
  const wasteType = wasteTypeLabels[supply.wasteType] || supply.wasteType;
  const weight = weightLabels[supply.estimatedWeight] || `${supply.estimatedWeight} kg`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#A3AF87]/5">
      {/* Desktop Header Bar */}
      <div className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/supply/history"
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-[#303646] poppins-bold">
                    Detail Supply
                  </h1>
                  <span className="text-lg text-gray-400">•</span>
                  <span className="text-lg font-semibold text-[#A3AF87]">
                    {supply.supplyNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(supply.supplyNumber)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Salin ID"
                  >
                    <Copy className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(supply.createdAt).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${status.color}`}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/supply/history"
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#303646] poppins-bold">
                {supply.supplyNumber}
              </h1>
              <button
                onClick={() => copyToClipboard(supply.supplyNumber)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500">Detail Supply</p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${status.color}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-8 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supply Info Card */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 pb-5 border-b border-gray-100 mb-5">
                <div
                  className="p-3 lg:p-4 rounded-xl lg:rounded-2xl"
                  style={{ backgroundColor: "rgba(163, 175, 135, 0.15)" }}
                >
                  <Recycle className="h-7 w-7 lg:h-8 lg:w-8 text-[#A3AF87]" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-[#303646] text-lg lg:text-xl poppins-bold">
                    {wasteType}
                  </h2>
                  <p className="text-sm lg:text-base text-gray-500">
                    {new Date(supply.createdAt).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  className="rounded-xl lg:rounded-2xl p-4"
                  style={{ backgroundColor: "rgba(163, 175, 135, 0.1)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-4 w-4 text-[#A3AF87]" />
                    <span className="text-xs text-gray-500">Berat</span>
                  </div>
                  <p className="font-bold text-[#303646] text-lg">
                    {weight}
                  </p>
                </div>
                <div
                  className="rounded-xl lg:rounded-2xl p-4"
                  style={{ backgroundColor: "rgba(163, 175, 135, 0.1)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-[#A3AF87]" />
                    <span className="text-xs text-gray-500">
                      Tanggal Pickup
                    </span>
                  </div>
                  <p className="font-bold text-[#303646] text-lg">
                    {supply.pickupDate
                      ? new Date(supply.pickupDate).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short" }
                        )
                      : "Menunggu"}
                  </p>
                </div>
                <div
                  className="rounded-xl lg:rounded-2xl p-4"
                  style={{ backgroundColor: "rgba(163, 175, 135, 0.1)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-[#A3AF87]" />
                    <span className="text-xs text-gray-500">Waktu</span>
                  </div>
                  <p className="font-bold text-[#303646] text-lg">
                    {supply.pickupTimeRange || "Menunggu"}
                  </p>
                </div>
                <div
                  className="rounded-xl lg:rounded-2xl p-4"
                  style={{ backgroundColor: "rgba(163, 175, 135, 0.1)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-[#A3AF87]" />
                    <span className="text-xs text-gray-500">Status</span>
                  </div>
                  <p className="font-bold text-[#A3AF87] text-lg">
                    {status.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Location & Notes Card */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[#303646] text-base lg:text-lg poppins-bold mb-5">
                Informasi Pickup
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div
                    className="p-2.5 lg:p-3 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: "rgba(163, 175, 135, 0.15)" }}
                  >
                    <MapPin className="h-5 w-5 text-[#A3AF87]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Alamat Pickup</p>
                    <p className="text-sm lg:text-base text-[#303646] font-medium">
                      {supply.pickupAddress}
                    </p>
                  </div>
                </div>

                {supply.notes && (
                  <div className="flex items-start gap-4">
                    <div
                      className="p-2.5 lg:p-3 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: "rgba(163, 175, 135, 0.15)" }}
                    >
                      <MessageCircle className="h-5 w-5 text-[#A3AF87]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Catatan</p>
                      <p className="text-sm lg:text-base text-[#303646]">
                        {supply.notes}
                      </p>
                    </div>
                  </div>
                )}

                {supply.photoUrl && (
                  <div className="flex items-start gap-4">
                    <div
                      className="p-2.5 lg:p-3 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: "rgba(163, 175, 135, 0.15)" }}
                    >
                      <ImageIcon className="h-5 w-5 text-[#A3AF87]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-2">Foto/Video Sampah</p>
                      <div className="relative w-full max-w-md">
                        {supply.photoUrl.endsWith('.mp4') || 
                         supply.photoUrl.endsWith('.mov') || 
                         supply.photoUrl.endsWith('.avi') ||
                         supply.photoUrl.includes('/videos/') ? (
                          <video
                            src={supply.photoUrl}
                            controls
                            className="w-full h-48 lg:h-64 object-cover rounded-xl border-2 border-gray-200"
                          >
                            Browser Anda tidak mendukung video.
                          </video>
                        ) : (
                          <img
                            src={supply.photoUrl}
                            alt="Waste photo"
                            className="w-full h-48 lg:h-64 object-cover rounded-xl border-2 border-gray-200"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Courier Card */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[#303646] text-base lg:text-lg poppins-bold mb-5">
                Kurir Pickup
              </h3>

              {supply.courierName && supply.courierPhone ? (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #A3AF87 0%, #8a9a6e 100%)",
                      }}
                    >
                      <User className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#303646] text-base lg:text-lg">
                        {supply.courierName}
                      </p>
                      <p className="text-sm text-gray-500">Kurir EcoMaggie</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`tel:${supply.courierPhone}`}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Phone className="h-5 w-5 text-gray-600" />
                      <span className="hidden sm:inline text-sm font-medium text-gray-700">
                        Telepon
                      </span>
                    </a>
                    <a
                      href={`https://wa.me/${supply.courierPhone.replace(/^0/, "62")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors"
                      style={{ backgroundColor: "rgba(163, 175, 135, 0.2)" }}
                    >
                      <MessageCircle className="h-5 w-5 text-[#A3AF87]" />
                      <span className="hidden sm:inline text-sm font-medium text-[#5a6c5b]">
                        WhatsApp
                      </span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-900 text-sm">
                      Masih Diproses
                    </p>
                    <p className="text-xs text-amber-700">
                      Kurir akan segera ditugaskan untuk pickup Anda
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Timeline & Actions */}
          <div className="space-y-6">
            {/* Timeline Card */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[#303646] text-base lg:text-lg poppins-bold mb-5">
                Status Tracking
              </h3>

              <div className="space-y-0">
                {timeline.map((item, index) => (
                  <div key={item.status} className="flex gap-4">
                    {/* Timeline Line & Dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${
                          item.completed ? "bg-[#A3AF87]" : "bg-gray-200"
                        }`}
                      >
                        {item.completed && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      {index < timeline.length - 1 && (
                        <div
                          className={`w-0.5 h-14 ${
                            item.completed ? "bg-[#A3AF87]" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-5">
                      <p
                        className={`font-semibold text-sm ${
                          item.completed ? "text-[#303646]" : "text-gray-400"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          item.completed ? "text-gray-500" : "text-gray-300"
                        }`}
                      >
                        {item.completed && item.date
                          ? new Date(item.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Menunggu"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Card */}
            <div
              className="rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-[#A3AF87]/30"
              style={{
                background:
                  "linear-gradient(135deg, rgba(163, 175, 135, 0.1) 0%, rgba(163, 175, 135, 0.05) 100%)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-[#A3AF87] rounded-xl">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#303646] poppins-bold">
                    Butuh Bantuan?
                  </h4>
                  <p className="text-xs text-gray-500">
                    Tim kami siap membantu
                  </p>
                </div>
              </div>
              <a
                href="https://wa.me/6282288953268?text=Halo%20EcoMaggie,%20saya%20butuh%20bantuan%20terkait%20supply%20sampah%20organik"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #A3AF87 0%, #8a9a6e 100%)",
                }}
              >
                <MessageCircle className="h-5 w-5" />
                Hubungi via WhatsApp
              </a>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-gray-100 shadow-sm">
              <h4 className="font-bold text-[#303646] text-sm poppins-bold mb-4">
                Aksi Cepat
              </h4>
              <div className="space-y-3">
                <Link
                  href="/supply/history"
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <FileText className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Lihat Riwayat Supply
                  </span>
                </Link>
                <Link
                  href="/supply/input"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                  style={{ backgroundColor: "rgba(163, 175, 135, 0.1)" }}
                >
                  <Recycle className="h-5 w-5 text-[#A3AF87]" />
                  <span className="text-sm font-medium text-[#5a6c5b]">
                    Buat Supply Baru
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
