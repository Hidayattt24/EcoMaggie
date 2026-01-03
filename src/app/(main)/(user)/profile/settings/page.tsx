"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getCurrentUserProfile,
  updateUserProfile,
  changePassword,
  type UserProfile,
  type UpdateProfileData,
  type ChangePasswordData,
} from "@/lib/api/profile.actions";
import Swal from "sweetalert2";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";

export default function ProfileSettings() {
  const router = useRouter();

  // Account States
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Data from Database
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Editable Profile Data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    userType: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  // Fetch Profile Data on Mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    const result = await getCurrentUserProfile();

    if (result.success && result.data) {
      setProfile(result.data);
      setProfileData({
        name: result.data.name || "",
        email: result.data.email || "",
        phone: result.data.phone || "",
        userType: result.data.userType || "UMKM",
      });
      setImagePreview(result.data.avatar);
    } else {
      await Swal.fire({
        title: "Error!",
        text: result.message,
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
    setIsLoading(false);
  };

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

    const updateData: UpdateProfileData = {
      name: profileData.name,
      phone: profileData.phone,
      userType: profileData.userType,
      avatar: imagePreview || undefined,
    };

    const result = await updateUserProfile(updateData);

    if (result.success) {
      await Swal.fire({
        title: "Berhasil!",
        text: result.message,
        icon: "success",
        confirmButtonColor: "#A3AF87",
        timer: 2000,
      });
      setIsEditMode(false);
      if (result.data) {
        setProfile(result.data);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#A3AF87] mx-auto" />
          <p className="mt-4 text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9f5] via-white to-[#f0f2ed] pb-20 lg:pb-6">
      {/* Image Crop Modal */}
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#A3AF87] to-[#5a6c5b] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
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
                    <RotateCcw className="h-4 w-4 text-[#5a6c5b]" />
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#A3AF87]"
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
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#A3AF87] to-[#5a6c5b] text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
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
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 mb-3 px-3 py-2 lg:px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all group"
          >
            <ArrowLeft className="h-5 w-5 text-[#5a6c5b] group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Kembali</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#5a6c5b]">
            Pengaturan Akun
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Kelola informasi profil dan keamanan akun Anda
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Account Information Section */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Card Header with Gradient */}
          <div className="bg-gradient-to-r from-[#A3AF87] to-[#5a6c5b] px-6 py-5">
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
                  className="px-5 py-2.5 bg-white text-[#5a6c5b] rounded-xl hover:shadow-lg transition-all text-sm font-semibold"
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
                <div className="absolute -inset-1 bg-gradient-to-r from-[#A3AF87] to-[#5a6c5b] rounded-full blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-[#A3AF87] to-[#5a6c5b]">
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
                <h3 className="font-bold text-xl sm:text-2xl text-[#5a6c5b] mb-1">
                  {profileData.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">
                  {profileData.email}
                </p>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-gradient-to-r from-[#A3AF87]/10 to-[#5a6c5b]/10 rounded-full">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs font-medium text-[#5a6c5b]">
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
                  <div className="w-1 h-4 bg-[#A3AF87] rounded-full"></div>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  disabled={!isEditMode}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-[#A3AF87] transition-all disabled:bg-gray-50 disabled:text-gray-600 text-[#5a6c5b] font-medium group-hover:border-gray-300"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#A3AF87] rounded-full"></div>
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-3.5 pr-36 border-2 border-gray-200 rounded-xl transition-all bg-gray-50 text-gray-600 font-medium cursor-not-allowed"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-2 py-1 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-green-700">
                      Terverifikasi
                    </span>
                  </div>
                </div>
              </div>

              {/* Nomor Telepon */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#A3AF87] rounded-full"></div>
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
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-[#A3AF87] transition-all disabled:bg-gray-50 disabled:text-gray-600 text-[#5a6c5b] font-medium group-hover:border-gray-300"
                />
              </div>

              {/* Jenis Pengguna */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#A3AF87] rounded-full"></div>
                  Jenis Pengguna
                </label>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* UMKM Card */}
                  <label
                    className={`relative flex flex-col items-center p-3 sm:p-5 border-2 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                      profileData.userType === "UMKM"
                        ? "border-[#A3AF87] bg-gradient-to-br from-[#A3AF87]/10 to-[#5a6c5b]/5 shadow-lg ring-2 ring-[#A3AF87]/20"
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
                          ? "bg-gradient-to-br from-[#A3AF87] to-[#5a6c5b] shadow-lg"
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
                          ? "text-[#5a6c5b]"
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
                        ? "border-[#A3AF87] bg-gradient-to-br from-[#A3AF87]/10 to-[#5a6c5b]/5 shadow-lg ring-2 ring-[#A3AF87]/20"
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
                          ? "bg-gradient-to-br from-[#A3AF87] to-[#5a6c5b] shadow-lg"
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
                          ? "text-[#5a6c5b]"
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
                  className="w-full sm:flex-1 px-6 py-3.5 bg-gradient-to-r from-[#A3AF87] to-[#5a6c5b] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
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
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5">
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
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
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
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 font-medium"
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
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
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
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 font-medium"
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
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
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
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 font-medium"
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
                className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
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
