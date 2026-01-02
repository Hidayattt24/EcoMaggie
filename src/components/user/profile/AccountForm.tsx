"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Camera,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

interface AccountFormProps {
  onSave: (data: any) => void;
}

export function AccountForm({ onSave }: AccountFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "Budi Santoso",
    email: "budi.santoso@example.com",
    phone: "081234567890",
    profileImage: "/assets/dummy/avatar.png",
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-br from-green-50 to-white rounded-2xl border-2 border-gray-100"
      >
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              src={formData.profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <label
            htmlFor="profile-upload"
            className="absolute bottom-0 right-0 p-2 bg-[#2D5016] rounded-full cursor-pointer hover:bg-[#2D5016]/90 transition-all shadow-lg"
          >
            <Camera className="h-4 w-4 text-white" />
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-[#2D5016] mb-1">
            {formData.username}
          </h2>
          <p className="text-sm text-gray-600 mb-2">{formData.email}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Email Terverifikasi
          </div>
        </div>
      </motion.div>

      {/* Form Fields */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#2D5016]">Data Profil</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all"
            >
              Edit Profil
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <User className="h-4 w-4 text-[#2D5016]" />
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              disabled={!isEditing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 transition-all disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Mail className="h-4 w-4 text-[#2D5016]" />
              Alamat Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 transition-all disabled:bg-gray-50 disabled:text-gray-600"
              />
              <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Phone className="h-4 w-4 text-[#2D5016]" />
              Nomor Telepon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={!isEditing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 transition-all disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
