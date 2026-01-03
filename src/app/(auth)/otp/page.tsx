"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { resendVerificationEmail } from "@/lib/api/auth.actions";
import Swal from "sweetalert2";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const shouldResend = searchParams.get("resend") === "true";

  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Auto resend if coming from login page with unverified email
  useEffect(() => {
    if (shouldResend && email) {
      handleResend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldResend, email]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleResend = async () => {
    if (!canResend && !shouldResend) return;
    if (!email) return;

    setIsResending(true);
    setCanResend(false);
    setResendTimer(60);

    const result = await resendVerificationEmail(email);

    if (result.success) {
      await Swal.fire({
        icon: "success",
        title: "Email Terkirim!",
        text: result.message,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      await Swal.fire({
        icon: "error",
        title: "Gagal Mengirim",
        text: result.message,
        confirmButtonColor: "#A3AF87",
      });
    }

    setIsResending(false);
  };

  const maskedEmail = email
    ? email.replace(/(^[^@]{2})[^@]*(@)/, "$1***$2")
    : "****";

  const openEmailApp = () => {
    // Try to open default email app
    window.location.href = "mailto:";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden"
          style={{ borderTop: "4px solid #A3AF87" }}
        >
          {/* Decorative Elements */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-bl-full opacity-30"
            style={{
              background:
                "linear-gradient(to bottom right, rgba(163, 175, 135, 0.2), transparent)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-32 h-32 rounded-tr-full opacity-20"
            style={{
              background:
                "linear-gradient(to top left, rgba(163, 175, 135, 0.2), transparent)",
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="text-center mb-6">
              <Link href="/" className="inline-block">
                <div
                  className="w-16 h-16 mx-auto rounded-2xl p-2.5 hover:scale-105 transition-transform duration-300 shadow-lg"
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
            </div>

            {/* Email Animation Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Animated circles */}
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: "#A3AF87" }}
                />
                <div
                  className="absolute inset-2 rounded-full animate-pulse opacity-30"
                  style={{ backgroundColor: "#A3AF87" }}
                />
                {/* Main icon container */}
                <div
                  className="relative w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(163, 175, 135, 0.15)" }}
                >
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="#A3AF87"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1
                className="text-2xl md:text-3xl font-bold poppins-bold mb-2"
                style={{ color: "#303646" }}
              >
                Cek Email Anda
              </h1>
              <p className="text-gray-500 poppins-regular text-sm md:text-base">
                Kami telah mengirimkan link konfirmasi ke
              </p>
            </div>

            {/* Email Display */}
            <div
              className="rounded-xl p-4 mb-6 text-center"
              style={{ backgroundColor: "rgba(163, 175, 135, 0.1)" }}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="#A3AF87"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span
                  className="font-semibold poppins-semibold"
                  style={{ color: "#A3AF87" }}
                >
                  {maskedEmail}
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                  style={{ backgroundColor: "#A3AF87" }}
                >
                  1
                </div>
                <div>
                  <p className="text-gray-700 poppins-medium text-sm">
                    Buka kotak masuk email Anda
                  </p>
                  <p className="text-gray-500 text-xs poppins-regular mt-0.5">
                    Cek juga folder spam/promosi
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                  style={{ backgroundColor: "#A3AF87" }}
                >
                  2
                </div>
                <div>
                  <p className="text-gray-700 poppins-medium text-sm">
                    Klik tombol &quot;Konfirmasi Email&quot;
                  </p>
                  <p className="text-gray-500 text-xs poppins-regular mt-0.5">
                    Di dalam email dari EcoMaggie
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                  style={{ backgroundColor: "#A3AF87" }}
                >
                  3
                </div>
                <div>
                  <p className="text-gray-700 poppins-medium text-sm">
                    Akun Anda akan aktif
                  </p>
                  <p className="text-gray-500 text-xs poppins-regular mt-0.5">
                    Mulai belanja produk organik berkualitas!
                  </p>
                </div>
              </div>
            </div>

            {/* Open Email Button */}
            <button
              onClick={openEmailApp}
              className="w-full py-3.5 px-4 rounded-xl text-white font-semibold poppins-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#A3AF87" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#8a9a73";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#A3AF87";
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Buka Aplikasi Email
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-gray-400 text-xs poppins-regular">
                atau
              </span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Resend Section */}
            <div className="text-center">
              <p className="text-gray-500 text-sm poppins-regular mb-3">
                Tidak menerima email?
              </p>
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-semibold poppins-semibold text-sm transition-all duration-200 hover:shadow-md disabled:opacity-50"
                  style={{
                    borderColor: "#A3AF87",
                    color: "#A3AF87",
                  }}
                  onMouseEnter={(e) => {
                    if (!isResending) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(163, 175, 135, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {isResending ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Kirim Ulang Email
                    </>
                  )}
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm poppins-regular">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Kirim ulang dalam {resendTimer} detik
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div
          className="mt-6 p-4 rounded-xl border"
          style={{
            backgroundColor: "rgba(163, 175, 135, 0.05)",
            borderColor: "rgba(163, 175, 135, 0.2)",
          }}
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="#A3AF87"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-gray-700 text-sm poppins-medium mb-1">
                Butuh bantuan?
              </p>
              <p className="text-gray-500 text-xs poppins-regular">
                Jika email tidak kunjung masuk setelah 5 menit, hubungi kami di{" "}
                <a
                  href="mailto:support@ecomaggie.com"
                  className="font-semibold hover:underline"
                  style={{ color: "#A3AF87" }}
                >
                  support@ecomaggie.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Register */}
        <div className="text-center mt-6">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm poppins-medium transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali ke Pendaftaran
          </Link>
        </div>

        {/* Already verified link */}
        <div className="text-center mt-4">
          <p className="text-gray-500 text-sm poppins-regular">
            Sudah konfirmasi email?{" "}
            <Link
              href="/login"
              className="font-semibold poppins-semibold hover:underline"
              style={{ color: "#A3AF87" }}
            >
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function VerifyEmailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-10"
          style={{ borderTop: "4px solid #A3AF87" }}
        >
          <div className="flex items-center justify-center py-16">
            <div
              className="animate-spin h-10 w-10 border-4 border-t-transparent rounded-full"
              style={{ borderColor: "#A3AF87", borderTopColor: "transparent" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
