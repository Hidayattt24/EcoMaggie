"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1
              className="text-9xl md:text-[180px] font-bold poppins-bold"
              style={{
                background: "linear-gradient(135deg, #A3AF87 0%, #5a6c5b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              404
            </h1>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-200 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-emerald-200 rounded-full blur-xl animate-pulse delay-75" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 poppins-bold mb-4">
            Oops! Halaman Tidak Ditemukan
          </h2>
          <p className="text-lg text-gray-600 poppins-regular mb-2">
            Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
          </p>
          <p className="text-base text-gray-500 poppins-regular">
            Jangan khawatir, mari kembali ke jalur yang benar!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/"
            className="group flex items-center gap-3 px-8 py-4 rounded-full poppins-semibold text-white transition-all duration-300 hover:shadow-xl hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #A3AF87 0%, #5a6c5b 100%)",
            }}
          >
            <Home className="w-5 h-5" />
            <span>Kembali ke Beranda</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-3 px-8 py-4 rounded-full poppins-semibold transition-all duration-300 hover:shadow-lg bg-white border-2 hover:scale-105"
            style={{
              color: "#5a6c5b",
              borderColor: "#A3AF87",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Halaman Sebelumnya</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search className="w-5 h-5" style={{ color: "#A3AF87" }} />
            <h3 className="text-lg font-semibold poppins-semibold text-gray-800">
              Halaman Populer
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/market"
              className="px-4 py-2 rounded-lg poppins-medium text-sm transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: "rgba(163, 175, 135, 0.1)",
                color: "#5a6c5b",
              }}
            >
              Maggot Market
            </Link>
            <Link
              href="/supply"
              className="px-4 py-2 rounded-lg poppins-medium text-sm transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: "rgba(163, 175, 135, 0.1)",
                color: "#5a6c5b",
              }}
            >
              Supply Connect
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg poppins-medium text-sm transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: "rgba(163, 175, 135, 0.1)",
                color: "#5a6c5b",
              }}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg poppins-medium text-sm transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: "rgba(163, 175, 135, 0.1)",
                color: "#5a6c5b",
              }}
            >
              Daftar
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-sm text-gray-500 poppins-regular">
          Butuh bantuan?{" "}
          <Link
            href="/#footer"
            className="underline hover:text-gray-700"
            style={{ color: "#A3AF87" }}
          >
            Hubungi kami
          </Link>
        </p>
      </div>
    </div>
  );
}
