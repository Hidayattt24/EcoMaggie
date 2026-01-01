"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement login logic
    console.log("Login data:", formData);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      style={{
        background:
          "linear-gradient(to bottom right, #FDF8D4 0%, #ffffff 50%, #FDF8D4 100%)",
      }}
    >
      <div className="w-full max-w-lg">
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
          <div className="text-center mb-6 sm:mb-8 relative z-10">
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
            <h1
              className="text-xl sm:text-2xl font-bold poppins-bold mt-3 sm:mt-4"
              style={{ color: "#A3AF87" }}
            >
              Masuk ke Akun
            </h1>
            <p className="text-gray-600 mt-1.5 sm:mt-2 text-xs sm:text-sm poppins-regular">
              Selamat datang kembali di EcoMaggie
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5 relative z-10"
          >
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 poppins-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "#A3AF87" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="block w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 poppins-regular shadow-sm"
                  style={
                    { "--tw-ring-color": "#A3AF87" } as React.CSSProperties
                  }
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#A3AF87")
                  }
                  onMouseLeave={(e) =>
                    !document.activeElement ||
                    document.activeElement !== e.currentTarget
                      ? (e.currentTarget.style.borderColor = "#d1d5db")
                      : null
                  }
                  placeholder="nama@email.com"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 poppins-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "#A3AF87" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="block w-full pl-10 sm:pl-11 pr-11 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 poppins-regular shadow-sm"
                  style={
                    { "--tw-ring-color": "#A3AF87" } as React.CSSProperties
                  }
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#A3AF87")
                  }
                  onMouseLeave={(e) =>
                    !document.activeElement ||
                    document.activeElement !== e.currentTarget
                      ? (e.currentTarget.style.borderColor = "#d1d5db")
                      : null
                  }
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium transition-colors poppins-medium"
                style={{ color: "#A3AF87" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#5a6c5b")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#A3AF87")}
              >
                Lupa kata sandi?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 sm:py-3 px-4 mt-2 border border-transparent rounded-xl shadow-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 poppins-semibold"
              style={
                {
                  backgroundColor: "#A3AF87",
                  "--tw-ring-color": "#A3AF87",
                } as React.CSSProperties
              }
              onMouseEnter={(e) =>
                !isLoading &&
                ((e.currentTarget.style.transform = "scale(1.02)"),
                (e.currentTarget.style.boxShadow =
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"))
              }
              onMouseLeave={(e) => (
                (e.currentTarget.style.transform = "scale(1)"),
                (e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)")
              )}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 poppins-regular text-sm">
                Belum punya akun?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg border-2 transition-all duration-200 poppins-semibold"
              style={{
                backgroundColor: "rgba(163, 175, 135, 0.1)",
                color: "#A3AF87",
                borderColor: "#A3AF87",
              }}
              onMouseEnter={(e) => (
                (e.currentTarget.style.backgroundColor =
                  "rgba(163, 175, 135, 0.2)"),
                (e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)")
              )}
              onMouseLeave={(e) => (
                (e.currentTarget.style.backgroundColor =
                  "rgba(163, 175, 135, 0.1)"),
                (e.currentTarget.style.boxShadow = "")
              )}
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Daftar Akun
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4 sm:mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/50 backdrop-blur-sm text-gray-700 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 poppins-regular text-xs sm:text-sm"
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
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
