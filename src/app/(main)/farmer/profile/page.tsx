"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Save,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Settings,
  KeyRound,
  UserCircle,
  Store,
  Info,
} from "lucide-react";
import {
  getFarmerProfile,
  updateFarmerProfile,
  changeFarmerPassword,
  type FarmerProfile,
} from "@/lib/api/farmer-profile.actions";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";

type TabType = "profile" | "password";

// Skeleton Components
function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 bg-[#fdf8d4]/50 rounded-2xl"></div>
        <div className="flex-1">
          <div className="h-6 bg-[#fdf8d4]/50 rounded w-48 mb-2"></div>
          <div className="h-4 bg-[#a3af87]/20 rounded w-32"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={i > 4 ? "md:col-span-2" : ""}>
            <div className="h-4 bg-[#fdf8d4]/50 rounded w-24 mb-2"></div>
            <div className="h-12 bg-[#a3af87]/20 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FarmerProfilePage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const { toast, success, error: showError, hideToast } = useToast();

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [farmName, setFarmName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const result = await getFarmerProfile();

    if (result.success && result.data) {
      setProfile(result.data);
      setName(result.data.name || "");
      setEmail(result.data.email || "");
      setPhone(result.data.phone || "");
      setFarmName(result.data.farmName || "");
      setDescription(result.data.description || "");
      setLocation(result.data.location || "");
    } else {
      showError("Gagal Memuat Profile", result.message);
    }

    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const result = await updateFarmerProfile({
      name,
      email,
      phone,
      farmName,
      description,
      location,
    });

    setIsSavingProfile(false);

    if (result.success) {
      success("Profile Berhasil Diupdate!", "Perubahan telah disimpan");
      loadProfile();
    } else {
      showError("Gagal Update Profile", result.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showError("Password Tidak Sama", "Password baru dan konfirmasi password tidak sama");
      return;
    }

    if (newPassword.length < 6) {
      showError("Password Terlalu Pendek", "Password minimal 6 karakter");
      return;
    }

    setIsSavingPassword(true);

    const result = await changeFarmerPassword(currentPassword, newPassword);

    setIsSavingPassword(false);

    if (result.success) {
      success("Password Berhasil Diubah!", "Gunakan password baru untuk login selanjutnya");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      showError("Gagal Ganti Password", result.message);
    }
  };

  const tabs = [
    { id: "profile" as TabType, label: "Informasi Profile", icon: User },
    { id: "password" as TabType, label: "Keamanan", icon: Shield },
  ];

  return (
    <div className="min-h-screen">
      {/* Toast Notification */}
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 lg:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#303646]">
              Pengaturan Profile
            </h1>
            <p className="text-[#435664] mt-1">
              Kelola informasi akun dan keamanan Anda
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#fdf8d4]/50 rounded-xl border border-[#a3af87]/30">
            <Settings className="h-5 w-5 text-[#a3af87]" />
            <span className="text-sm font-medium text-[#435664]">Settings</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Profile Card & Tabs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 space-y-6"
        >
          {/* Profile Card */}
          <div className="bg-[#fdf8d4]/30 rounded-2xl border-2 border-[#a3af87]/30 p-6 shadow-sm">
            {loading ? (
              <div className="animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-[#fdf8d4]/50 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-[#fdf8d4]/50 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-[#a3af87]/20 rounded w-48"></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#a3af87] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <UserCircle className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#303646] mb-1">
                  {profile?.name || "Farmer"}
                </h3>
                <p className="text-sm text-[#435664] mb-4">{email || profile?.email}</p>
                {profile?.farmName && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fdf8d4]/50 rounded-full border border-[#a3af87]/30">
                    <Store className="h-4 w-4 text-[#a3af87]" />
                    <span className="text-sm font-medium text-[#435664]">
                      {profile.farmName}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-[#fdf8d4]/30 rounded-2xl border-2 border-[#a3af87]/30 p-3 shadow-sm">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-[#a3af87] text-white shadow-md"
                        : "text-[#435664] hover:bg-[#fdf8d4]/50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-[#a3af87]"}`} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Info */}
          <div className="bg-[#fdf8d4]/50 rounded-2xl p-5 border-2 border-[#a3af87]/30">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-[#a3af87] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#303646] text-sm mb-1">
                  Tips Keamanan
                </h4>
                <p className="text-xs text-[#435664] leading-relaxed">
                  Pastikan password Anda kuat dan unik. Gunakan kombinasi huruf, angka, dan simbol untuk keamanan maksimal.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Content - Forms */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8"
        >
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#fdf8d4]/30 rounded-2xl border-2 border-[#a3af87]/30 p-6 lg:p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#fdf8d4]/50 rounded-xl border border-[#a3af87]/30">
                    <User className="h-6 w-6 text-[#a3af87]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#303646]">
                      Informasi Profile
                    </h2>
                    <p className="text-sm text-[#435664]">
                      Update informasi pribadi dan usaha Anda
                    </p>
                  </div>
                </div>

                {loading ? (
                  <ProfileSkeleton />
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Email (editable) */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-[#303646] mb-2">
                        <Mail className="h-4 w-4 text-[#a3af87]" />
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#fdf8d4]/50 border-2 border-[#a3af87]/30 rounded-xl text-[#303646] placeholder:text-[#435664]/50 focus:outline-none focus:border-[#a3af87] transition-colors"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#303646] mb-2">
                          <User className="h-4 w-4 text-[#a3af87]" />
                          Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-[#fdf8d4]/50 border-2 border-[#a3af87]/30 rounded-xl text-[#303646] placeholder:text-[#435664]/50 focus:outline-none focus:border-[#a3af87] transition-colors"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#303646] mb-2">
                          <Phone className="h-4 w-4 text-[#a3af87]" />
                          No. HP/WhatsApp <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-[#fdf8d4]/50 border-2 border-[#a3af87]/30 rounded-xl text-[#303646] placeholder:text-[#435664]/50 focus:outline-none focus:border-[#a3af87] transition-colors"
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>
                    </div>

                    {/* Farm Name */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-[#303646] mb-2">
                        <Building2 className="h-4 w-4 text-[#a3af87]" />
                        Nama Usaha/Farm
                      </label>
                      <input
                        type="text"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#fdf8d4]/50 border-2 border-[#a3af87]/30 rounded-xl text-[#303646] placeholder:text-[#435664]/50 focus:outline-none focus:border-[#a3af87] transition-colors"
                        placeholder="Contoh: Farm Organik Sejahtera"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-[#303646] mb-2">
                        <MapPin className="h-4 w-4 text-[#a3af87]" />
                        Lokasi
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-3 bg-[#fdf8d4]/50 border-2 border-[#a3af87]/30 rounded-xl text-[#303646] placeholder:text-[#435664]/50 focus:outline-none focus:border-[#a3af87] transition-colors"
                        placeholder="Contoh: Banda Aceh, Aceh"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-[#303646] mb-2">
                        <FileText className="h-4 w-4 text-[#a3af87]" />
                        Deskripsi Usaha
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-[#fdf8d4]/50 border-2 border-[#a3af87]/30 rounded-xl text-[#303646] placeholder:text-[#435664]/50 focus:outline-none focus:border-[#a3af87] transition-colors resize-none"
                        placeholder="Ceritakan tentang usaha Anda..."
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 border-t border-[#a3af87]/30">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="flex items-center gap-2 px-6 py-3 bg-[#a3af87] text-white font-semibold rounded-xl hover:bg-[#435664] disabled:bg-[#435664]/50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                      >
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            Simpan Perubahan
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {activeTab === "password" && (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#fdf8d4]/30 rounded-2xl border-2 border-[#a3af87]/30 p-6 lg:p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#fdf8d4]/50 rounded-xl border border-[#a3af87]/30">
                    <KeyRound className="h-6 w-6 text-[#a3af87]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#303646]">
                      Ganti Password
                    </h2>
                    <p className="text-sm text-[#435664]">
                      Perbarui password untuk keamanan akun
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#303646] mb-2">
                      <Lock className="h-4 w-4 text-[#a3af87]" />
                      Password Lama <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 bg-[#fdf8d4]/50 border-2 border-[#a3af87]/30 rounded-xl text-[#303646] placeholder:text-[#435664]/50 focus:outline-none focus:border-[#a3af87] transition-colors"
                        placeholder="Masukkan password lama"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a3af87] hover:text-[#435664]"
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#303646] mb-2">
                      <KeyRound className="h-4 w-4 text-[#a3af87]" />
                      Password Baru <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 pr-12 bg-[#fdf8d4]/50 border-2 border-[#a3af87]/30 rounded-xl text-[#303646] placeholder:text-[#435664]/50 focus:outline-none focus:border-[#a3af87] transition-colors"
                        placeholder="Minimal 6 karakter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a3af87] hover:text-[#435664]"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#303646] mb-2">
                      <CheckCircle className="h-4 w-4 text-[#a3af87]" />
                      Konfirmasi Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 pr-12 bg-[#fdf8d4]/50 border-2 border-[#a3af87]/30 rounded-xl text-[#303646] placeholder:text-[#435664]/50 focus:outline-none focus:border-[#a3af87] transition-colors"
                        placeholder="Masukkan ulang password baru"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a3af87] hover:text-[#435664]"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Warning Notice */}
                  <div className="bg-[#fdf8d4]/70 border-2 border-[#a3af87]/40 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-[#a3af87] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-[#303646] mb-1">
                          Perhatian
                        </p>
                        <p className="text-sm text-[#435664]">
                          Setelah mengganti password, Anda akan tetap login di perangkat ini. 
                          Namun Anda perlu login ulang di perangkat lain menggunakan password baru.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4 border-t border-[#a3af87]/30">
                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="flex items-center gap-2 px-6 py-3 bg-[#a3af87] text-white font-semibold rounded-xl hover:bg-[#435664] disabled:bg-[#435664]/50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      {isSavingPassword ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Mengubah...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5" />
                          Ganti Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
