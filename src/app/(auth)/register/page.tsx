"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser, RegisterFormData } from "@/lib/api/auth.actions";
import AddressFormFields from "@/components/auth/AddressFormFields";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    nomorWhatsapp: "",
    password: "",
    confirmPassword: "",
    jenisPengguna: "",
    namaUsaha: "",
    province: "",
    city: "",
    district: "",
    village: "",
    postalCode: "",
    fullAddress: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddressFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.namaLengkap.trim()) {
      newErrors.namaLengkap = "Nama lengkap wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.nomorWhatsapp.trim()) {
      newErrors.nomorWhatsapp = "Nomor WhatsApp wajib diisi";
    } else if (
      !/^(\+62|62|0)[0-9]{9,12}$/.test(
        formData.nomorWhatsapp.replace(/[\s-]/g, "")
      )
    ) {
      newErrors.nomorWhatsapp =
        "Format nomor WhatsApp tidak valid (contoh: 08123456789 atau +628123456789)";
    }

    if (!formData.password) {
      newErrors.password = "Kata sandi wajib diisi";
    } else if (formData.password.length < 8) {
      newErrors.password = "Kata sandi minimal 8 karakter";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Kata sandi tidak cocok";
    }

    if (!formData.province) {
      newErrors.province = "Provinsi wajib dipilih";
    }

    if (!formData.city) {
      newErrors.city = "Kabupaten/Kota wajib dipilih";
    }

    if (!formData.district || !formData.district.trim()) {
      newErrors.district = "Kecamatan wajib diisi";
    }

    if (!formData.village || !formData.village.trim()) {
      newErrors.village = "Kelurahan/Desa wajib diisi";
    }

    if (!formData.postalCode || !formData.postalCode.trim()) {
      newErrors.postalCode = "Kode pos wajib diisi";
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = "Kode pos harus 5 digit angka";
    }

    if (!formData.fullAddress || !formData.fullAddress.trim()) {
      newErrors.fullAddress = "Alamat lengkap wajib diisi";
    } else if (formData.fullAddress.trim().length < 10) {
      newErrors.fullAddress = "Alamat lengkap minimal 10 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isLoading) return;

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Save user location to localStorage for Supply Connect eligibility check
    try {
      const locationData = {
        province: formData.province,
        city: formData.city,
        district: formData.district,
        village: formData.village,
        postalCode: formData.postalCode,
        fullAddress: formData.fullAddress,
      };
      localStorage.setItem(
        "ecomaggie_user_location",
        JSON.stringify(locationData)
      );
    } catch (error) {
      console.error("Error saving location data:", error);
    }

    // Call Supabase Auth register
    const registerData: RegisterFormData = {
      namaLengkap: formData.namaLengkap,
      email: formData.email,
      nomorWhatsapp: formData.nomorWhatsapp,
      password: formData.password,
      jenisPengguna: formData.jenisPengguna,
      namaUsaha: formData.namaUsaha,
      province: formData.province,
      city: formData.city,
      district: formData.district,
      village: formData.village,
      postalCode: formData.postalCode,
      fullAddress: formData.fullAddress,
    };

    const result = await registerUser(registerData);

    if (result.success) {
      await Swal.fire({
        icon: "success",
        title: "Pendaftaran Berhasil!",
        text: "Silakan cek email Anda untuk verifikasi akun.",
        confirmButtonText: "Lanjutkan",
        confirmButtonColor: "#A3AF87",
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-gray-100",
          title: "text-xl font-bold text-[#5a6c5b]",
          htmlContainer: "text-gray-600",
          confirmButton:
            "rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all",
        },
        showClass: {
          popup: "animate__animated animate__bounceIn",
        },
      });
      // Redirect to OTP page with email
      router.push(`/otp?email=${encodeURIComponent(formData.email)}`);
    } else {
      await Swal.fire({
        icon: "error",
        title: "Pendaftaran Gagal",
        text: result.message,
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#A3AF87",
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-gray-100",
          title: "text-xl font-bold text-[#5a6c5b]",
          htmlContainer: "text-gray-600",
          confirmButton:
            "rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all",
        },
        showClass: {
          popup: "animate__animated animate__shakeX",
        },
      });
    }

    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 py-8 sm:py-12"
      style={{
        backgroundColor: "#fdf8d4",
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div
          className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden"
          style={{ borderTop: "4px solid #435664" }}
        >
          {/* Decorative corner */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-bl-full"
            style={{
              backgroundColor: "#ebfba8",
              opacity: 0.15,
            }}
          ></div>

          {/* Logo & Title */}
          <div className="text-center mb-6 sm:mb-8 relative z-10">
            <Link href="/" className="inline-block">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl p-2 hover:scale-105 transition-transform duration-300 shadow-lg"
                style={{ backgroundColor: "#303646" }}
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
              style={{ color: "#435664" }}
            >
              Daftar Akun
            </h1>
            <p className="text-gray-600 mt-1.5 sm:mt-2 text-xs sm:text-sm poppins-regular">
              Bergabunglah dengan EcoMaggie
            </p>
          </div>

          {/* Register Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-3 sm:space-y-4 relative z-10"
          >
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label
                htmlFor="namaLengkap"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  id="namaLengkap"
                  name="namaLengkap"
                  type="text"
                  required
                  value={formData.namaLengkap}
                  onChange={(e) =>
                    setFormData({ ...formData, namaLengkap: e.target.value })
                  }
                  className={`block w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border ${
                    errors.namaLengkap ? "border-red-500" : "border-gray-300"
                  } rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 poppins-regular shadow-sm`}
                  style={
                    { "--tw-ring-color": "#A3AF87" } as React.CSSProperties
                  }
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#A3AF87")
                  }
                  onMouseLeave={(e) =>
                    !errors.namaLengkap &&
                    (e.currentTarget.style.borderColor = "")
                  }
                  placeholder="Masukkan nama lengkap"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              {errors.namaLengkap && (
                <p className="text-red-500 text-xs poppins-regular flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.namaLengkap}
                </p>
              )}
            </div>

            {/* Email */}
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
                  className={`block w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 poppins-regular shadow-sm`}
                  style={
                    { "--tw-ring-color": "#A3AF87" } as React.CSSProperties
                  }
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#A3AF87")
                  }
                  onMouseLeave={(e) =>
                    !errors.email && (e.currentTarget.style.borderColor = "")
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
              {errors.email && (
                <p className="text-red-500 text-xs poppins-regular flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Nomor WhatsApp */}
            <div className="space-y-2">
              <label
                htmlFor="nomorWhatsapp"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 poppins-medium"
              >
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Nomor WhatsApp
              </label>
              <div className="relative">
                <input
                  id="nomorWhatsapp"
                  name="nomorWhatsapp"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.nomorWhatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, nomorWhatsapp: e.target.value })
                  }
                  className={`block w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border ${
                    errors.nomorWhatsapp ? "border-red-500" : "border-gray-300"
                  } rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 poppins-regular shadow-sm`}
                  style={
                    { "--tw-ring-color": "#A3AF87" } as React.CSSProperties
                  }
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#A3AF87")
                  }
                  onMouseLeave={(e) =>
                    !errors.nomorWhatsapp &&
                    (e.currentTarget.style.borderColor = "")
                  }
                  placeholder="08123456789 atau +628123456789"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
              </div>
              {errors.nomorWhatsapp && (
                <p className="text-red-500 text-xs poppins-regular flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.nomorWhatsapp}
                </p>
              )}
            </div>

            {/* Password */}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`block w-full pl-10 sm:pl-11 pr-11 sm:pr-12 py-2.5 sm:py-3 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 poppins-regular shadow-sm`}
                  style={
                    { "--tw-ring-color": "#A3AF87" } as React.CSSProperties
                  }
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#A3AF87")
                  }
                  onMouseLeave={(e) =>
                    !errors.password && (e.currentTarget.style.borderColor = "")
                  }
                  placeholder="Min. 8 karakter"
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
              {errors.password && (
                <p className="text-red-500 text-xs poppins-regular flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`block w-full pl-10 sm:pl-11 pr-11 sm:pr-12 py-2.5 sm:py-3 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 poppins-regular shadow-sm`}
                  style={
                    { "--tw-ring-color": "#A3AF87" } as React.CSSProperties
                  }
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#A3AF87")
                  }
                  onMouseLeave={(e) =>
                    !errors.confirmPassword &&
                    (e.currentTarget.style.borderColor = "")
                  }
                  placeholder="Ulangi kata sandi"
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs poppins-regular flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Divider - Optional Info */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-gray-500 poppins-regular text-xs flex items-center gap-2">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs poppins-medium"
                    style={{
                      backgroundColor: "rgba(163, 175, 135, 0.1)",
                      color: "#5a6c5b",
                    }}
                  >
                    Opsional
                  </span>
                </span>
              </div>
            </div>

            {/* Jenis Pengguna (Optional) */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 poppins-medium">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Jenis Pengguna
                <span className="text-gray-400 font-normal text-xs bg-gray-50 px-2 py-0.5 rounded-full">
                  Opsional
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* UMKM Card */}
                <label
                  className={`relative flex flex-col items-center justify-center p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                    formData.jenisPengguna === "UMKM"
                      ? "shadow-lg scale-[1.02]"
                      : "border-gray-200 bg-white hover:shadow-md hover:scale-[1.01]"
                  }`}
                  style={
                    formData.jenisPengguna === "UMKM"
                      ? {
                          borderColor: "#A3AF87",
                          backgroundColor: "rgba(163, 175, 135, 0.1)",
                        }
                      : {}
                  }
                  onMouseEnter={(e) =>
                    formData.jenisPengguna !== "UMKM" &&
                    (e.currentTarget.style.borderColor = "#5a6c5b")
                  }
                  onMouseLeave={(e) =>
                    formData.jenisPengguna !== "UMKM" &&
                    (e.currentTarget.style.borderColor = "")
                  }
                >
                  <input
                    type="radio"
                    name="jenisPengguna"
                    value="UMKM"
                    checked={formData.jenisPengguna === "UMKM"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jenisPengguna: e.target.value,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300"
                    style={
                      formData.jenisPengguna === "UMKM"
                        ? {
                            backgroundColor: "#A3AF87",
                            boxShadow:
                              "0 10px 15px -3px rgba(163, 175, 135, 0.3)",
                          }
                        : { backgroundColor: "#f3f4f6" }
                    }
                  >
                    <svg
                      className="w-6 h-6 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={
                        formData.jenisPengguna === "UMKM"
                          ? { color: "white" }
                          : { color: "#9ca3af" }
                      }
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-sm font-semibold poppins-semibold transition-colors duration-300"
                    style={
                      formData.jenisPengguna === "UMKM"
                        ? { color: "#A3AF87" }
                        : { color: "#374151" }
                    }
                  >
                    UMKM
                  </span>
                  <span className="text-xs text-gray-500 mt-1 poppins-regular text-center">
                    Usaha Kecil
                  </span>
                  {formData.jenisPengguna === "UMKM" && (
                    <div
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                      style={{ backgroundColor: "#A3AF87" }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </label>

                {/* Rumah Tangga Card */}
                <label
                  className={`relative flex flex-col items-center justify-center p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                    formData.jenisPengguna === "Rumah Tangga"
                      ? "shadow-lg scale-[1.02]"
                      : "border-gray-200 bg-white hover:shadow-md hover:scale-[1.01]"
                  }`}
                  style={
                    formData.jenisPengguna === "Rumah Tangga"
                      ? {
                          borderColor: "#A3AF87",
                          backgroundColor: "rgba(163, 175, 135, 0.1)",
                        }
                      : {}
                  }
                  onMouseEnter={(e) =>
                    formData.jenisPengguna !== "Rumah Tangga" &&
                    (e.currentTarget.style.borderColor = "#5a6c5b")
                  }
                  onMouseLeave={(e) =>
                    formData.jenisPengguna !== "Rumah Tangga" &&
                    (e.currentTarget.style.borderColor = "")
                  }
                >
                  <input
                    type="radio"
                    name="jenisPengguna"
                    value="Rumah Tangga"
                    checked={formData.jenisPengguna === "Rumah Tangga"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jenisPengguna: e.target.value,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300"
                    style={
                      formData.jenisPengguna === "Rumah Tangga"
                        ? {
                            backgroundColor: "#A3AF87",
                            boxShadow:
                              "0 10px 15px -3px rgba(163, 175, 135, 0.3)",
                          }
                        : { backgroundColor: "#f3f4f6" }
                    }
                  >
                    <svg
                      className="w-6 h-6 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={
                        formData.jenisPengguna === "Rumah Tangga"
                          ? { color: "white" }
                          : { color: "#9ca3af" }
                      }
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-sm font-semibold poppins-semibold transition-colors duration-300"
                    style={
                      formData.jenisPengguna === "Rumah Tangga"
                        ? { color: "#A3AF87" }
                        : { color: "#374151" }
                    }
                  >
                    Rumah Tangga
                  </span>
                  <span className="text-xs text-gray-500 mt-1 poppins-regular text-center">
                    Keluarga
                  </span>
                  {formData.jenisPengguna === "Rumah Tangga" && (
                    <div
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                      style={{ backgroundColor: "#A3AF87" }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Nama Usaha (Conditional & Optional) */}
            {formData.jenisPengguna === "UMKM" && (
              <div className="space-y-2 animate-fade-in-up">
                <label
                  htmlFor="namaUsaha"
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Nama Usaha
                  <span className="text-gray-400 font-normal text-xs bg-gray-50 px-2 py-0.5 rounded-full">
                    Opsional
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="namaUsaha"
                    name="namaUsaha"
                    type="text"
                    value={formData.namaUsaha}
                    onChange={(e) =>
                      setFormData({ ...formData, namaUsaha: e.target.value })
                    }
                    className="block w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 poppins-regular shadow-sm"
                    style={
                      { "--tw-ring-color": "#A3AF87" } as React.CSSProperties
                    }
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "#A3AF87")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "")
                    }
                    placeholder="Contoh: Warung Makan Sederhana"
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
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Alamat Section Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "#A3AF87" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="text-sm font-semibold text-gray-700 poppins-semibold">
                  Alamat
                </h3>
              </div>

              {/* Address Form Fields with Biteship API Integration */}
              <AddressFormFields
                formData={{
                  province: formData.province,
                  city: formData.city,
                  district: formData.district,
                  village: formData.village,
                  postalCode: formData.postalCode,
                  fullAddress: formData.fullAddress,
                }}
                errors={errors}
                onChange={handleAddressFieldChange}
              />

              {/* Supply Connect Availability Notice */}
              {formData.city === "Banda Aceh" && (
                <p
                  className="text-xs poppins-regular flex items-center gap-1 p-3 rounded-lg"
                  style={{ 
                    color: "#A3AF87",
                    backgroundColor: "rgba(163, 175, 135, 0.1)"
                  }}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Layanan Supply Connect tersedia di wilayah Anda
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                onClick={(e) => {
                  if (isLoading) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                }}
                className="w-full flex justify-center items-center gap-2 py-2.5 sm:py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm sm:text-base text-white hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed poppins-semibold"
                style={
                  {
                    backgroundColor: "#435664",
                    "--tw-ring-color": "#435664",
                    pointerEvents: isLoading ? "none" : "auto",
                  } as React.CSSProperties
                }
                onMouseEnter={(e) =>
                  !isLoading &&
                  ((e.currentTarget.style.transform = "scale(1.02)"),
                  (e.currentTarget.style.boxShadow =
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"))
                }
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                  }
                }}
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
                  "Daftar"
                )}
              </button>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-gray-500 poppins-regular pt-2">
              Dengan mendaftar, Anda menyetujui{" "}
              <Link
                href="/terms"
                className="font-medium"
                style={{ color: "#A3AF87" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#5a6c5b")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#A3AF87")}
              >
                Syarat & Ketentuan
              </Link>
            </p>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 poppins-regular text-sm">
                Sudah punya akun?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg border-2 transition-all duration-200 poppins-semibold"
              style={{
                backgroundColor: "rgba(163, 175, 135, 0.1)",
                color: "#a3af87",
                borderColor: "#a3af87",
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Masuk ke Akun
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4 sm:mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 text-gray-600 transition-all duration-200 poppins-medium text-xs sm:text-sm bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-md"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#A3AF87";
              e.currentTarget.style.borderColor = "#A3AF87";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "";
              e.currentTarget.style.borderColor = "";
            }}
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
