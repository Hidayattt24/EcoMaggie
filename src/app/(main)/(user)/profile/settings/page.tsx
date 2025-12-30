"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Camera,
  CheckCircle2,
  AlertCircle,
  Shield,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileSettings() {
  const router = useRouter();

  // Account States
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    phone: "081234567890",
    profilePicture: "/assets/dummy/profile.jpg",
  });
  const [imagePreview, setImagePreview] = useState(profileData.profilePicture);

  // Security States
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // Account Functions
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      setProfileData({ ...profileData, profilePicture: imagePreview });
      setIsEditMode(false);
      setIsLoading(false);
    }, 1000);
  };

  // Security Functions
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password baru minimal 8 karakter");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Password baru dan konfirmasi tidak cocok");
      return;
    }

    console.log("Changing password...");
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 mb-3 px-3 py-2 lg:px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all group"
          >
            <svg
              className="h-5 w-5 text-[#2D5016] group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">Kembali</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D5016]">
            Pengaturan Akun
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Kelola informasi profil dan keamanan akun Anda
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Account Information Section */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Informasi Akun</h2>
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 bg-[#2D5016] text-white rounded-xl hover:bg-[#234012] transition-colors text-sm font-medium"
              >
                Edit Profil
              </button>
            )}
          </div>

          {/* Profile Picture */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditMode && (
                <label className="absolute bottom-0 right-0 bg-[#2D5016] p-2 rounded-full cursor-pointer hover:bg-[#234012] transition-colors shadow-lg">
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-lg text-gray-900">
                {profileData.name}
              </h3>
              <p className="text-sm text-gray-500">{profileData.email}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                disabled={!isEditMode}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-[#2D5016] text-[#2D5016] font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  disabled={!isEditMode}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-[#2D5016] text-[#2D5016] font-medium"
                />
                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
              </div>
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Email terverifikasi
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                disabled={!isEditMode}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-[#2D5016] text-[#2D5016] font-medium"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditMode && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-[#2D5016] text-white rounded-xl hover:bg-[#234012] transition-all disabled:opacity-50 font-medium"
              >
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setImagePreview(profileData.profilePicture);
                }}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                Batal
              </button>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Keamanan Akun</h2>
              <p className="text-sm text-gray-600">Ubah password Anda</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Lama
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-blue-600 font-medium"
                  placeholder="Masukkan password lama"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOldPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-blue-600 font-medium"
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-blue-600 font-medium"
                  placeholder="Ulangi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {passwordError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{passwordError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium mt-6"
            >
              Ubah Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
