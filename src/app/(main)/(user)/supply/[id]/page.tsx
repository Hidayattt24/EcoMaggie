"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Scale,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  Phone,
  User,
  Copy,
  MessageCircle,
  Circle,
  Recycle,
  FileText,
} from "lucide-react";

// Dummy data detail supply
const supplyDetail = {
  id: "SUP-001",
  date: "2025-12-30",
  weight: "3-5 kg",
  type: "Sisa Makanan",
  status: "completed",
  pickupDate: "2025-12-31",
  pickupTime: "08:00 - 10:00",
  address: "Jl. T. Nyak Arief No. 12, Lamnyong, Banda Aceh",
  notes: "Sampah sudah dikemas dalam plastik hitam, diletakkan di depan pagar",
  courier: {
    name: "Ahmad Fauzi",
    phone: "082288953268",
  },
  timeline: [
    {
      status: "submitted",
      label: "Permintaan Diterima",
      date: "30 Des 2025, 14:30",
      completed: true,
    },
    {
      status: "confirmed",
      label: "Pickup Dikonfirmasi",
      date: "30 Des 2025, 15:00",
      completed: true,
    },
    {
      status: "picked_up",
      label: "Sampah Diambil",
      date: "31 Des 2025, 08:45",
      completed: true,
    },
    {
      status: "completed",
      label: "Selesai Diproses",
      date: "31 Des 2025, 10:00",
      completed: true,
    },
  ],
};

const statusConfig = {
  waiting: {
    label: "Menunggu",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  picked_up: {
    label: "Diproses",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  completed: {
    label: "Selesai",
    color: "bg-[#A3AF87]/20 text-[#5a6c5b] border-[#A3AF87]",
    iconBg: "bg-[#A3AF87]/20",
    iconColor: "text-[#A3AF87]",
  },
};

export default function SupplyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const status = statusConfig[supplyDetail.status as keyof typeof statusConfig];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
                    {supplyDetail.id}
                  </span>
                  <button
                    onClick={() => copyToClipboard(supplyDetail.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Salin ID"
                  >
                    <Copy className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(supplyDetail.date).toLocaleDateString("id-ID", {
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
                {supplyDetail.id}
              </h1>
              <button
                onClick={() => copyToClipboard(supplyDetail.id)}
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
                    {supplyDetail.type}
                  </h2>
                  <p className="text-sm lg:text-base text-gray-500">
                    {new Date(supplyDetail.date).toLocaleDateString("id-ID", {
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
                    {supplyDetail.weight}
                  </p>
                </div>
                <div
                  className="rounded-xl lg:rounded-2xl p-4"
                  style={{ backgroundColor: "rgba(163, 175, 135, 0.1)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-[#A3AF87]" />
                    <span className="text-xs text-gray-500">Tanggal Pickup</span>
                  </div>
                  <p className="font-bold text-[#303646] text-lg">
                    {supplyDetail.pickupDate
                      ? new Date(supplyDetail.pickupDate).toLocaleDateString(
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
                    {supplyDetail.pickupTime}
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
                      {supplyDetail.address}
                    </p>
                  </div>
                </div>

                {supplyDetail.notes && (
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
                        {supplyDetail.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Courier Card */}
            {supplyDetail.courier && (
              <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-[#303646] text-base lg:text-lg poppins-bold mb-5">
                  Kurir Pickup
                </h3>

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
                        {supplyDetail.courier.name}
                      </p>
                      <p className="text-sm text-gray-500">Kurir EcoMaggie</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`tel:${supplyDetail.courier.phone}`}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Phone className="h-5 w-5 text-gray-600" />
                      <span className="hidden sm:inline text-sm font-medium text-gray-700">
                        Telepon
                      </span>
                    </a>
                    <a
                      href={`https://wa.me/62${supplyDetail.courier.phone.slice(
                        1
                      )}`}
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
              </div>
            )}
          </div>

          {/* Right Column - Timeline & Actions */}
          <div className="space-y-6">
            {/* Timeline Card */}
            <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[#303646] text-base lg:text-lg poppins-bold mb-5">
                Status Tracking
              </h3>

              <div className="space-y-0">
                {supplyDetail.timeline.map((item, index) => (
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
                      {index < supplyDetail.timeline.length - 1 && (
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
                        {item.completed ? item.date : "Menunggu"}
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
                  background: "linear-gradient(135deg, #A3AF87 0%, #8a9a6e 100%)",
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
