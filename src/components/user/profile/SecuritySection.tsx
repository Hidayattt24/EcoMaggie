"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";

interface SecuritySectionProps {
  onPasswordChange: (data: any) => void;
}

export function SecuritySection({ onPasswordChange }: SecuritySectionProps) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (passwordData.newPassword.length < 8) {
      setError("Password baru minimal 8 karakter");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Password baru dan konfirmasi tidak cocok");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      onPasswordChange(passwordData);
      setIsSaving(false);
      setIsChanging(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Security Header */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-gray-100"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Keamanan Akun</h3>
            <p className="text-sm text-gray-600 mt-1">
              Kelola password dan pengaturan keamanan akun Anda
            </p>
          </div>
        </div>
      </motion.div>

      {/* Password Change Form */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#2D5016]" />
            <h3 className="text-lg font-bold text-[#2D5016]">Ganti Password</h3>
          </div>
          {!isChanging && (
            <button
              onClick={() => setIsChanging(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all"
            >
              Ubah Password
            </button>
          )}
        </div>

        {isChanging ? (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* Old Password */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">
                Password Lama
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 transition-all"
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
              <label className="text-sm font-bold text-gray-700 mb-2 block">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 transition-all"
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
              <p className="text-xs text-gray-500 mt-1.5">
                Gunakan kombinasi huruf, angka, dan simbol
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 transition-all"
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsChanging(false);
                  setError("");
                  setPasswordData({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>
          </motion.form>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Lock className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-bold text-gray-900">Password Anda</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Terakhir diubah 30 hari yang lalu
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
