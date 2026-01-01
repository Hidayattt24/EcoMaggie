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
    color: "bg-green-50 text-green-700 border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/supply/history"
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
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

        {/* Main Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100 mb-4">
            <div className={`p-3 rounded-xl ${status.iconBg}`}>
              <Package className={`h-7 w-7 ${status.iconColor}`} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 text-lg">
                {supplyDetail.type}
              </h2>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">Berat</span>
              </div>
              <p className="font-semibold text-gray-900">
                {supplyDetail.weight}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">Pickup</span>
              </div>
              <p className="font-semibold text-gray-900">
                {supplyDetail.pickupDate
                  ? new Date(supplyDetail.pickupDate).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "short" }
                    )
                  : "Menunggu"}
              </p>
            </div>
          </div>
        </div>

        {/* Location & Time */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">
            Informasi Pickup
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#2D5016]/10 rounded-lg flex-shrink-0">
                <MapPin className="h-4 w-4 text-[#2D5016]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Alamat</p>
                <p className="text-sm text-gray-900">{supplyDetail.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#2D5016]/10 rounded-lg flex-shrink-0">
                <Clock className="h-4 w-4 text-[#2D5016]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Waktu</p>
                <p className="text-sm text-gray-900">
                  {supplyDetail.pickupTime}
                </p>
              </div>
            </div>

            {supplyDetail.notes && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#2D5016]/10 rounded-lg flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-[#2D5016]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Catatan</p>
                  <p className="text-sm text-gray-900">{supplyDetail.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Courier */}
        {supplyDetail.courier && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">
              Kurir Pickup
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#2D5016] to-[#4a7c23] rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {supplyDetail.courier.name}
                  </p>
                  <p className="text-xs text-gray-500">Kurir EcoMaggie</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${supplyDetail.courier.phone}`}
                  className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Phone className="h-5 w-5 text-gray-600" />
                </a>
                <a
                  href={`https://wa.me/62${supplyDetail.courier.phone.slice(
                    1
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-green-100 rounded-xl hover:bg-green-200 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">
            Status Tracking
          </h3>

          <div className="space-y-0">
            {supplyDetail.timeline.map((item, index) => (
              <div key={item.status} className="flex gap-3">
                {/* Timeline Line & Dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      item.completed ? "bg-[#2D5016]" : "bg-gray-300"
                    }`}
                  />
                  {index < supplyDetail.timeline.length - 1 && (
                    <div
                      className={`w-0.5 h-12 ${
                        item.completed ? "bg-[#2D5016]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="pb-4">
                  <p
                    className={`font-medium text-sm ${
                      item.completed ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`text-xs ${
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

        {/* Action Button */}
        <div className="mt-6">
          <a
            href="https://wa.me/6282288953268?text=Halo%20EcoMaggie,%20saya%20butuh%20bantuan%20terkait%20supply%20sampah%20organik"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-[#2D5016] to-[#4a7c23] text-white shadow-lg hover:shadow-xl transition-all"
          >
            <MessageCircle className="h-5 w-5" />
            Butuh Bantuan?
          </a>
        </div>
      </div>
    </div>
  );
}
