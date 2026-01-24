"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Camera,
  CheckCircle2,
  AlertCircle,
  Shield,
  Lock,
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Check,
  RotateCcw,
  ZoomIn,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  updateUserProfile,
  changePassword,
  type UserProfile,
  type UpdateProfileData,
  type ChangePasswordData,
} from "@/lib/api/profile.actions";
import { useUserProfile } from "@/hooks/useUserProfile";
import Swal from "sweetalert2";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";
import { ProfileInfoSkeleton } from "@/components/ui/Skeleton";

export default function ProfileSettings() {
  const router = useRouter();

  // Use SWR hook for data fetching with caching
  const { profile, isLoading, error, refresh } = useUserProfile();

  // Account States
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable Profile Data - Initialize from profile when available
  const [profileData, setProfileData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    userType: profile?.userType || "UMKM",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(profile?.avatar || null);

  // Image Crop States
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [rotation, setRotation] = useState(0);

  // Security States
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState<
    ChangePasswordData & { confirmPassword: string }
  >({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Update local state when profile data changes from SWR
  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        userType: profile.userType || "UMKM",
      });
      setImagePreview(profile.avatar || null);
    }
  }, [profile]);

  // Handle Image Change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: "File Terlalu Besar",
          text: "Ukuran file maksimal 5MB",
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Crop Complete Callback
  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Create Cropped Image
  const createCroppedImage = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels,
        rotation
      );
      setImagePreview(croppedImage);
      setShowCropModal(false);
      setImageToCrop(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    } catch (error) {
      console.error("Error cropping image:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal memotong gambar",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  // Cancel Crop
  const cancelCrop = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  // Handle Save Profile
  const handleSaveProfile = async () => {
    setIsSaving(true);

    // Check if email is being changed
    const emailChanged = profileData.email !== profile?.email;

    const updateData: UpdateProfileData = {
      name: profileData.name,
      phone: profileData.phone,
      userType: profileData.userType,
      avatar: imagePreview || undefined,
      email: emailChanged ? profileData.email : undefined,
    };

    const result = await updateUserProfile(updateData);

    if (result.success) {
      await Swal.fire({
        title: "Berhasil!",
        text: emailChanged 
          ? "Profil berhasil diperbarui. Jika email diubah, silakan cek email baru untuk verifikasi."
          : result.message,
        icon: "success",
        confirmButtonColor: "#A3AF87",
        timer: emailChanged ? undefined : 2000,
        showConfirmButton: emailChanged,
      });
      setIsEditMode(false);
      if (result.data) {
        // Refresh SWR cache
        refresh();
        window.location.reload();
      }
    } else {
      await Swal.fire({
        title: "Gagal!",
        text: result.message,
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }

    setIsSaving(false);
  };

  // Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
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

    setIsChangingPassword(true);

    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    if (result.success) {
      await Swal.fire({
        title: "Berhasil!",
        text: result.message,
        icon: "success",
        confirmButtonColor: "#A3AF87",
        timer: 2000,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      setPasswordError(result.message);
    }

    setIsChangingPassword(false);
  };

  // Image Crop Utility Functions
  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
      0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9f5] via-white to-[#f0f2ed] pb-20 lg:pb-6">
        {/* Header Skeleton */}
        <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse mb-3" />
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-80 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
          {/* Profile Info Skeleton */}
          <ProfileInfoSkeleton />

          {/* Security Section Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-56 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
                </div>
              ))}
              <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => refresh()}
            className="w-full flex items-center justify-center gap-2 bg-[#A3AF87] text-white py-3.5 rounded-xl font-semibold mb-3 hover:bg-[#95a17a] transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            Coba Lagi
          </button>
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 text-gray-600 py-3 font-medium hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-6">
      {/* Image Crop Modal */}
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#435664] to-[#303646] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Sesuaikan Foto Profil
              </h3>
              <button
                onClick={cancelCrop}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Crop Area */}
            <div className="relative h-[280px] sm:h-[400px] bg-gray-900 flex-shrink-0">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 bg-gray-50 overflow-y-auto">
              {/* Zoom Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ZoomIn className="h-4 w-4 text-[#5a6c5b]" />
                    Zoom
                  </label>
                  <span className="text-xs font-medium text-gray-500">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#A3AF87]"
                />
              </div>

              {/* Rotation Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-[#435664]" />
                    Rotasi
                  </label>
                  <span className="text-xs font-medium text-gray-500">
                    {rotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#435664]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-2">
                <button
                  onClick={cancelCrop}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium text-sm sm:text-base"
                >
                  Batal
                </button>
                <button
                  onClick={createCroppedImage}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-2xl hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Check className="h-5 w-5" />
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10 lg:static">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3 py-2 lg:px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all group"
            >
              <ArrowLeft className="h-5 w-5 text-[#435664] group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Kembali</span>
            </button>
            <button
              onClick={() => refresh()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3 py-2 lg:px-4 bg-[#435664]/10 hover:bg-[#435664]/20 text-[#435664] text-sm font-medium rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#303646]">
            Pengaturan Akun
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Kelola informasi profil dan keamanan akun Anda
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Account Information Section */}
        <div className="bg-[#fdf8d4] rounded-3xl border border-[#435664]/20 shadow-xl overflow-hidden">
          {/* Card Header with Gradient */}
          <div className="bg-gradient-to-r from-[#435664] to-[#303646] px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Informasi Akun</h2>
                <p className="text-sm text-white/80 mt-1">
                  {isEditMode ? "Mode Edit Aktif" : "Kelola profil Anda"}
                </p>
              </div>
              {!isEditMode && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-5 py-2.5 bg-white text-[#435664] rounded-2xl hover:shadow-lg transition-all text-sm font-semibold"
                >
                  Edit Profil
                </button>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-6 sm:mb-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#435664] to-[#303646] rounded-full blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-[#435664] to-[#303646]">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="h-12 w-12 sm:h-16 sm:w-16 text-white"
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
                  )}
                </div>
                {isEditMode && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                  >
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white mb-1" />
                    <span className="text-[10px] sm:text-xs font-medium text-white">
                      Upload Foto
                    </span>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-bold text-xl sm:text-2xl text-[#303646] mb-1">
                  {profileData.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">
                  {profileData.email}
                </p>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-[#fdf8d4] rounded-full border border-[#435664]/20">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs font-medium text-[#435664]">
                    {profileData.userType === "UMKM" ? "UMKM" : "Rumah Tangga"}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Detail Informasi
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Nama Lengkap */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#435664] rounded-full"></div>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  disabled={!isEditMode}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#435664] focus:border-[#435664] transition-all disabled:bg-gray-50 disabled:text-gray-600 text-[#303646] font-medium group-hover:border-gray-300"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#435664] rounded-full"></div>
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
                    className="w-full px-4 py-3.5 pr-36 border-2 border-gray-200 rounded-xl transition-all disabled:bg-gray-50 disabled:text-gray-600 text-[#303646] font-medium focus:ring-2 focus:ring-[#435664] focus:border-[#435664] group-hover:border-gray-300"
                    placeholder="email@example.com"
                  />
                  {!isEditMode && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-2 py-1 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-700">
                        Terverifikasi
                      </span>
                    </div>
                  )}
                </div>
                {isEditMode && profileData.email !== profile?.email && (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Email akan diubah. Verifikasi mungkin diperlukan.
                  </p>
                )}
              </div>

              {/* Nomor Telepon */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#435664] rounded-full"></div>
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  disabled={!isEditMode}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#435664] focus:border-[#435664] transition-all disabled:bg-gray-50 disabled:text-gray-600 text-[#303646] font-medium group-hover:border-gray-300"
                />
              </div>

              {/* Jenis Pengguna */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#435664] rounded-full"></div>
                  Jenis Pengguna
                </label>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* UMKM Card */}
                  <label
                    className={`relative flex flex-col items-center p-3 sm:p-5 border-2 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                      profileData.userType === "UMKM"
                        ? "border-[#435664] bg-white shadow-lg ring-2 ring-[#435664]/20"
                        : "border-gray-200 bg-white hover:shadow-md hover:border-gray-300"
                    } ${
                      !isEditMode
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="radio"
                      name="userType"
                      value="UMKM"
                      checked={profileData.userType === "UMKM"}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          userType: e.target.value,
                        })
                      }
                      disabled={!isEditMode}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 transition-all duration-300 ${
                        profileData.userType === "UMKM"
                          ? "bg-gradient-to-br from-[#435664] to-[#303646] shadow-lg"
                          : "bg-gray-100"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 sm:w-7 sm:h-7 ${
                          profileData.userType === "UMKM"
                            ? "text-white"
                            : "text-gray-400"
                        }`}
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
                    <span
                      className={`font-bold text-xs sm:text-sm ${
                        profileData.userType === "UMKM"
                          ? "text-[#303646]"
                          : "text-gray-500"
                      }`}
                    >
                      UMKM
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                      Usaha Kecil
                    </span>
                    {profileData.userType === "UMKM" && (
                      <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <Check
                          className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                          strokeWidth={3}
                        />
                      </div>
                    )}
                  </label>

                  {/* Rumah Tangga Card */}
                  <label
                    className={`relative flex flex-col items-center p-5 border-2 rounded-2xl transition-all duration-300 ${
                      profileData.userType === "Rumah Tangga"
                        ? "border-[#435664] bg-white shadow-lg ring-2 ring-[#435664]/20"
                        : "border-gray-200 bg-white hover:shadow-md hover:border-gray-300"
                    } ${
                      !isEditMode
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="radio"
                      name="userType"
                      value="Rumah Tangga"
                      checked={profileData.userType === "Rumah Tangga"}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          userType: e.target.value,
                        })
                      }
                      disabled={!isEditMode}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 transition-all duration-300 ${
                        profileData.userType === "Rumah Tangga"
                          ? "bg-gradient-to-br from-[#435664] to-[#303646] shadow-lg"
                          : "bg-gray-100"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 sm:w-7 sm:h-7 ${
                          profileData.userType === "Rumah Tangga"
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
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
                      className={`font-bold text-xs sm:text-sm ${
                        profileData.userType === "Rumah Tangga"
                          ? "text-[#303646]"
                          : "text-gray-500"
                      }`}
                    >
                      Rumah Tangga
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                      Keluarga
                    </span>
                    {profileData.userType === "Rumah Tangga" && (
                      <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <Check
                          className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                          strokeWidth={3}
                        />
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditMode && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full sm:flex-1 px-6 py-3.5 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-2xl hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditMode(false);
                    setProfileData({
                      name: profile?.name || "",
                      email: profile?.email || "",
                      phone: profile?.phone || "",
                      userType: profile?.userType || "UMKM",
                    });
                    setImagePreview(profile?.avatar || null);
                  }}
                  disabled={isSaving}
                  className="w-full sm:flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-[#fdf8d4] rounded-3xl border border-[#435664]/20 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#435664] to-[#303646] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Keamanan Akun</h2>
                <p className="text-sm text-white/80">Ubah password Anda</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handlePasswordChange} className="space-y-5">
              {/* Old Password */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#435664] rounded-full"></div>
                  Password Lama
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#435664] focus:border-[#435664] transition-all text-gray-700 font-medium"
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
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#435664] rounded-full"></div>
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
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#435664] focus:border-[#435664] transition-all text-gray-700 font-medium"
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
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#435664] rounded-full"></div>
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
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#435664] focus:border-[#435664] transition-all text-gray-700 font-medium"
                    placeholder="Konfirmasi password baru"
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

              {passwordError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600 font-medium">
                    {passwordError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-2xl hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all font-semibold mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Mengubah Password...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Ubah Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
