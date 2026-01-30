"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
} from "lucide-react";
import { forgotPassword } from "@/lib/api/auth.actions";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) return;
    
    setError("");

    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Format email tidak valid");
      return;
    }

    setIsLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#fdf8d4" }}>
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          // Success State
          <motion.div
            key="success"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 relative overflow-hidden"
              style={{ borderTopColor: "#A3AF87" }}
            >
              {/* Decorative corner */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-50"
                style={{
                  background:
                    "linear-gradient(to bottom right, rgba(163, 175, 135, 0.3), transparent)",
                }}
              />

              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-center mb-6 relative z-10"
              >
                <div
                  className="w-20 h-20 mx-auto rounded-full p-4 mb-4 flex items-center justify-center"
                  style={{ background: "rgba(163, 175, 135, 0.2)" }}
                >
                  <CheckCircle2
                    className="w-12 h-12"
                    style={{ color: "#A3AF87" }}
                    strokeWidth={1.5}
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 poppins-bold">
                  Email Terkirim!
                </h1>
                <p className="text-gray-600 mt-3 text-sm poppins-regular leading-relaxed">
                  Kami telah mengirimkan tautan untuk mengatur ulang kata sandi
                  ke
                </p>
                <p
                  className="font-semibold poppins-semibold mt-1"
                  style={{ color: "#A3AF87" }}
                >
                  {email}
                </p>
              </motion.div>

              {/* Instructions */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
                className="space-y-4 mb-6 relative z-10"
              >
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(163, 175, 135, 0.1)",
                    border: "1px solid rgba(163, 175, 135, 0.2)",
                  }}
                >
                  <p className="text-sm text-gray-700 poppins-regular leading-relaxed">
                    <span className="font-semibold poppins-semibold block mb-2">
                      Langkah selanjutnya:
                    </span>
                    1. Buka email dari <strong>EcoMaggie</strong>
                    <br />
                    2. Klik tautan &quot;Reset Kata Sandi&quot;
                    <br />
                    3. Buat kata sandi baru Anda
                  </p>
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-500 poppins-regular">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Tidak menerima email? Periksa folder spam atau coba kirim
                    ulang setelah beberapa menit.
                  </span>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
                className="space-y-3 relative z-10"
              >
                <button
                  onClick={() => router.push("/login")}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg text-white transition-all duration-200 poppins-semibold hover:shadow-xl hover:scale-[1.02]"
                  style={{ backgroundColor: "#A3AF87" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#8a9a70";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#A3AF87";
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Kembali ke Login
                </button>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="w-full py-3 px-4 rounded-xl border-2 transition-all duration-200 poppins-medium text-sm"
                  style={{
                    borderColor: "#A3AF87",
                    color: "#A3AF87",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(163, 175, 135, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Kirim Ulang Email
                </button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          // Form State
          <motion.div
            key="form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 relative overflow-hidden"
              style={{ borderTopColor: "#A3AF87" }}
            >
              {/* Decorative corner */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-50"
                style={{
                  background:
                    "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), transparent)",
                }}
              />

              {/* Logo & Title */}
              <motion.div
                variants={itemVariants}
                className="text-center mb-8 relative z-10"
              >
                <Link href="/" className="inline-block">
                  <div
                    className="w-20 h-20 mx-auto rounded-2xl p-3 hover:scale-105 transition-transform duration-300 shadow-lg"
                    style={{ backgroundColor: "#A3AF87" }}
                  >
                    <Image
                      src="/icon.svg"
                      alt="EcoMaggie Logo"
                      width={64}
                      height={64}
                      className="w-full h-full"
                    />
                  </div>
                </Link>
                <h1
                  className="text-2xl font-bold poppins-bold mt-6"
                  style={{ color: "#A3AF87" }}
                >
                  Lupa Kata Sandi?
                </h1>
                <p className="text-gray-600 mt-2 text-sm poppins-regular">
                  Masukkan email Anda dan kami akan mengirimkan
                  <br />
                  tautan untuk mengatur ulang kata sandi
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {/* Email Input */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 poppins-medium"
                  >
                    <Mail className="w-4 h-4" style={{ color: "#A3AF87" }} />
                    Alamat Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 poppins-regular text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                        error
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-transparent"
                      }`}
                      onFocus={(e) => {
                        if (!error) {
                          e.currentTarget.style.borderColor = "#A3AF87";
                        }
                      }}
                      onBlur={(e) => {
                        if (!error) {
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }
                      }}
                    />
                    {email && !error && (
                      <CheckCircle2
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
                        style={{ color: "#A3AF87" }}
                      />
                    )}
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 text-red-500 text-sm poppins-regular bg-red-50 py-2 px-3 rounded-lg border border-red-200"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  onClick={(e) => {
                    if (isLoading || !email.trim()) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed poppins-semibold hover:shadow-xl hover:scale-[1.02]"
                  style={{
                    backgroundColor: "#A3AF87",
                    pointerEvents: (isLoading || !email.trim()) ? "none" : "auto"
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && email.trim()) {
                      e.currentTarget.style.backgroundColor = "#8a9a70";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = "#A3AF87";
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Kirim Instruksi
                    </>
                  )}
                </motion.button>
              </form>

              {/* Help Text */}
              <motion.div
                variants={itemVariants}
                className="mt-6 p-4 rounded-xl relative z-10"
                style={{
                  backgroundColor: "rgba(163, 175, 135, 0.1)",
                  borderColor: "rgba(163, 175, 135, 0.2)",
                  borderWidth: "1px",
                }}
              >
                <p className="text-xs text-gray-600 poppins-regular text-center flex items-start gap-2">
                  <AlertCircle
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color: "#A3AF87" }}
                  />
                  <span>
                    Pastikan email yang dimasukkan adalah email yang terdaftar
                    di akun EcoMaggie Anda.
                  </span>
                </p>
              </motion.div>
            </div>

            {/* Back to Login Link */}
            <motion.div variants={itemVariants} className="text-center mt-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2 text-gray-600 transition-all duration-200 poppins-medium text-sm bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#A3AF87] hover:text-[#A3AF87]"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Login
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
