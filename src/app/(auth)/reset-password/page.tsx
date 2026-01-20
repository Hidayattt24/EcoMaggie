"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { resetPassword, verifyResetSession } from "@/lib/api/auth.actions";
import Swal from "sweetalert2";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const [error, setError] = useState("");

  // Password strength
  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = [
    "Sangat Lemah",
    "Lemah",
    "Cukup",
    "Kuat",
    "Sangat Kuat",
  ];
  const strengthColors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#16a34a",
  ];

  // Verify reset session on mount
  useEffect(() => {
    const checkSession = async () => {
      const result = await verifyResetSession();
      setIsValidSession(result.success);
      setIsVerifying(false);

      if (!result.success) {
        Swal.fire({
          icon: "error",
          title: "Link Tidak Valid",
          text: result.message,
          confirmButtonText: "Kembali ke Login",
          confirmButtonColor: "#A3AF87",
        }).then(() => {
          router.push("/forgot-password");
        });
      }
    };

    checkSession();
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) return;
    
    setError("");

    if (!password) {
      setError("Kata sandi baru wajib diisi");
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter");
      return;
    }

    if (passwordStrength < 3) {
      setError(
        "Kata sandi terlalu lemah. Gunakan kombinasi huruf besar, kecil, angka, dan simbol."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(password);

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "Kata Sandi Berhasil Diubah!",
          text: "Silakan login dengan kata sandi baru Anda.",
          confirmButtonText: "Login Sekarang",
          confirmButtonColor: "#A3AF87",
        });
        router.push("/login");
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
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  // Loading state while verifying session
  if (isVerifying) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            "linear-gradient(to bottom right, #FDF8D4 0%, #ffffff 50%, #FDF8D4 100%)",
        }}
      >
        <div className="text-center">
          <Loader2
            className="w-12 h-12 animate-spin mx-auto mb-4"
            style={{ color: "#A3AF87" }}
          />
          <p className="text-gray-600 poppins-regular">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  // Invalid session
  if (!isValidSession) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      style={{
        background:
          "linear-gradient(to bottom right, #FDF8D4 0%, #ffffff 50%, #FDF8D4 100%)",
      }}
    >
      <motion.div
        className="w-full max-w-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Card */}
        <div
          className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden"
          style={{ borderTop: "4px solid #A3AF87" }}
        >
          {/* Decorative corner */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-50"
            style={{
              background:
                "linear-gradient(to bottom right, rgba(163, 175, 135, 0.2), transparent)",
            }}
          ></div>

          {/* Logo & Title */}
          <motion.div
            className="text-center mb-6 sm:mb-8 relative z-10"
            variants={itemVariants}
          >
            <Link href="/" className="inline-block">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl p-2 hover:scale-105 transition-transform duration-300 shadow-lg"
                style={{ backgroundColor: "#A3AF87" }}
              >
                <Image
                  src="/icon.svg"
                  alt="EcoMaggie Logo"
                  width={48}
                  height={48}
                  className="w-full h-full"
                />
              </div>
            </Link>
            <div className="flex items-center justify-center gap-2 mt-4">
              <ShieldCheck className="w-6 h-6" style={{ color: "#A3AF87" }} />
              <h1
                className="text-xl sm:text-2xl font-bold poppins-bold"
                style={{ color: "#A3AF87" }}
              >
                Reset Kata Sandi
              </h1>
            </div>
            <p className="text-gray-600 mt-2 text-xs sm:text-sm poppins-regular">
              Masukkan kata sandi baru untuk akun Anda
            </p>
          </motion.div>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* New Password Field */}
            <motion.div className="space-y-2" variants={itemVariants}>
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 poppins-medium"
              >
                <Lock className="w-4 h-4" style={{ color: "#A3AF87" }} />
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="block w-full pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 poppins-regular shadow-sm"
                  style={
                    { "--tw-ring-color": "#A3AF87" } as React.CSSProperties
                  }
                  placeholder="Masukkan kata sandi baru"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                        style={{
                          backgroundColor:
                            passwordStrength >= level
                              ? strengthColors[passwordStrength - 1]
                              : "#e5e7eb",
                        }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-xs poppins-regular"
                    style={{
                      color:
                        passwordStrength > 0
                          ? strengthColors[passwordStrength - 1]
                          : "#6b7280",
                    }}
                  >
                    Kekuatan:{" "}
                    {passwordStrength > 0
                      ? strengthLabels[passwordStrength - 1]
                      : "Masukkan kata sandi"}
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div className="space-y-2" variants={itemVariants}>
              <label
                htmlFor="confirmPassword"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 poppins-medium"
              >
                <Lock className="w-4 h-4" style={{ color: "#A3AF87" }} />
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  className={`block w-full pl-10 pr-12 py-2.5 sm:py-3 border rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 poppins-regular shadow-sm ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-500"
                      : confirmPassword && password === confirmPassword
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                  style={
                    { "--tw-ring-color": "#A3AF87" } as React.CSSProperties
                  }
                  placeholder="Konfirmasi kata sandi baru"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs poppins-regular flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Kata sandi tidak cocok
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-green-500 text-xs poppins-regular flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Kata sandi cocok
                </p>
              )}
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="poppins-regular">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              onClick={(e) => {
                if (isLoading || !password || !confirmPassword) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }}
              variants={itemVariants}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full flex justify-center items-center gap-2 py-2.5 sm:py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed poppins-semibold"
              style={{
                backgroundColor: "#A3AF87",
                pointerEvents: (isLoading || !password || !confirmPassword) ? "none" : "auto"
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Simpan Kata Sandi Baru</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Password Requirements */}
          <motion.div
            variants={itemVariants}
            className="mt-6 p-4 rounded-xl"
            style={{
              backgroundColor: "rgba(163, 175, 135, 0.1)",
              border: "1px solid rgba(163, 175, 135, 0.2)",
            }}
          >
            <p className="text-xs text-gray-600 poppins-medium mb-2">
              Kata sandi harus memenuhi kriteria:
            </p>
            <ul className="text-xs text-gray-500 poppins-regular space-y-1">
              <li
                className={`flex items-center gap-2 ${
                  password.length >= 8 ? "text-green-600" : ""
                }`}
              >
                {password.length >= 8 ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-gray-300" />
                )}
                Minimal 8 karakter
              </li>
              <li
                className={`flex items-center gap-2 ${
                  /[A-Z]/.test(password) ? "text-green-600" : ""
                }`}
              >
                {/[A-Z]/.test(password) ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-gray-300" />
                )}
                Minimal 1 huruf besar
              </li>
              <li
                className={`flex items-center gap-2 ${
                  /[0-9]/.test(password) ? "text-green-600" : ""
                }`}
              >
                {/[0-9]/.test(password) ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-gray-300" />
                )}
                Minimal 1 angka
              </li>
              <li
                className={`flex items-center gap-2 ${
                  /[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""
                }`}
              >
                {/[^A-Za-z0-9]/.test(password) ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-gray-300" />
                )}
                Minimal 1 simbol (!@#$%^&*)
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Back to Login */}
        <motion.div
          className="text-center mt-4 sm:mt-6"
          variants={itemVariants}
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/50 backdrop-blur-sm text-gray-700 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 poppins-regular text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Loading fallback
function ResetPasswordLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(to bottom right, #FDF8D4 0%, #ffffff 50%, #FDF8D4 100%)",
      }}
    >
      <div className="text-center">
        <Loader2
          className="w-12 h-12 animate-spin mx-auto mb-4"
          style={{ color: "#A3AF87" }}
        />
        <p className="text-gray-600 poppins-regular">Memuat...</p>
      </div>
    </div>
  );
}

// Main export with Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
