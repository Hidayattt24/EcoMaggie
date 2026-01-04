"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  MapPinOff,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCircle,
} from "lucide-react";

type LocationStatus = "loading" | "allowed" | "not_allowed" | "not_registered";

interface UserLocationData {
  provinsi: string;
  kabupatenKota: string;
  kodePos: string;
  alamatLengkap: string;
}

interface RegionStatusCardProps {
  locationStatus: LocationStatus;
  userLocation: UserLocationData | null;
  className?: string;
}

export default function RegionStatusCard({
  locationStatus,
  userLocation,
  className = "",
}: RegionStatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl transition-colors ${
              locationStatus === "allowed"
                ? "bg-green-100"
                : locationStatus === "not_allowed"
                ? "bg-red-100"
                : locationStatus === "not_registered"
                ? "bg-amber-100"
                : "bg-gray-100"
            }`}
          >
            {locationStatus === "loading" ? (
              <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
            ) : locationStatus === "allowed" ? (
              <MapPin className="h-6 w-6 text-green-600" />
            ) : locationStatus === "not_allowed" ? (
              <MapPinOff className="h-6 w-6 text-red-600" />
            ) : (
              <UserCircle className="h-6 w-6 text-amber-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Status Wilayah Layanan
            </h3>
            <p className="text-xs text-gray-500">
              Berdasarkan alamat terdaftar Anda
            </p>
          </div>
        </div>
      </div>

      {/* Status Display */}
      <AnimatePresence mode="wait">
        {locationStatus === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"
          >
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
              <p className="text-sm text-gray-700">Memuat data lokasi...</p>
            </div>
          </motion.div>
        )}

        {locationStatus === "not_registered" && (
          <motion.div
            key="not_registered"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-200"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">
                  Alamat Belum Terdaftar
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Anda belum memiliki alamat yang terdaftar. Silakan tambahkan
                  alamat terlebih dahulu untuk menggunakan fitur Supply Connect.
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
            className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-800 font-medium">
                  {userLocation.kabupatenKota}, {userLocation.provinsi}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Lokasi terverifikasi! Anda dapat menggunakan semua fitur
                  Supply Connect.
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
            className="bg-red-50 rounded-xl p-4 mb-4 border border-red-200"
          >
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">
                  Di Luar Jangkauan Layanan
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Alamat Anda ({userLocation.kabupatenKota},{" "}
                  {userLocation.provinsi}) berada di luar wilayah layanan. Saat
                  ini Supply Connect hanya tersedia untuk wilayah Aceh (NAD) -
                  Kota Banda Aceh.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      {locationStatus === "not_registered" ? (
        <Link
          href="/profile/addresses"
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all bg-[#A3AF87] text-white hover:bg-[#95a17a] shadow-lg hover:shadow-xl"
        >
          <MapPin className="h-4 w-4" />
          Tambah Alamat
        </Link>
      ) : locationStatus === "not_allowed" ? (
        <div className="text-center py-3 px-4 rounded-xl bg-gray-100 text-gray-500 text-sm">
          <MapPinOff className="h-4 w-4 inline mr-2" />
          Layanan tidak tersedia di wilayah Anda
        </div>
      ) : locationStatus === "allowed" ? (
        <div className="text-center py-3 px-4 rounded-xl bg-green-100 text-green-700 text-sm font-medium">
          <CheckCircle className="h-4 w-4 inline mr-2" />
          Fitur Supply Connect Aktif
        </div>
      ) : null}
    </motion.div>
  );
}
