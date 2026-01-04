"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Check,
  X,
  Loader2,
  AlertCircle,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
  type CreateAddressData,
  type UpdateAddressData,
} from "@/lib/api/address.actions";
import {
  getCurrentUserProfile,
  type UserProfile,
} from "@/lib/api/profile.actions";
import AddressFormWithAPI from "@/components/user/AddressFormWithAPI";
import Swal from "sweetalert2";

export default function AddressesPage() {
  const router = useRouter();

  // States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<CreateAddressData>({
    label: "",
    recipientName: "",
    recipientPhone: "",
    province: "",
    city: "",
    district: "",
    village: "",
    postalCode: "",
    streetAddress: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [resetTrigger, setResetTrigger] = useState(0);

  // Debug: Log newAddress changes
  useEffect(() => {
    console.log("📝 newAddress state changed:", newAddress);
    console.log("  - postalCode:", newAddress.postalCode);
  }, [newAddress]);

  // Fetch addresses and profile on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch addresses and profile in parallel
    const [addressResult, profileResult] = await Promise.all([
      getUserAddresses(),
      getCurrentUserProfile(),
    ]);

    if (addressResult.success && addressResult.data) {
      setAddresses(addressResult.data);
    }

    if (profileResult.success && profileResult.data) {
      console.log("📦 User Profile Data:", profileResult.data);
      console.log("📍 Province:", profileResult.data.province);
      console.log("🏙️ City:", profileResult.data.city);
      console.log("🏘️ District:", profileResult.data.district);
      console.log("🏡 Village:", profileResult.data.village);
      console.log("📮 Postal Code:", profileResult.data.postalCode);
      console.log("🏠 Full Address:", profileResult.data.fullAddress);
      
      // Check if village is empty
      if (!profileResult.data.village || profileResult.data.village.trim() === "") {
        console.warn("⚠️ WARNING: Village data is empty!");
        console.warn("   This means the user did not fill in the village/kelurahan field during registration,");
        console.warn("   OR the data was not saved to the database.");
        console.warn("   Please check:");
        console.warn("   1. Did the user fill in the Kelurahan/Desa field during registration?");
        console.warn("   2. Check the database directly to see if the 'village' column has data");
      }
      
      setUserProfile(profileResult.data);
    }

    setIsLoading(false);
  };

  const fetchAddresses = async () => {
    const result = await getUserAddresses();
    if (result.success && result.data) {
      setAddresses(result.data);
    }
  };

  // Handle Add/Edit Address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    
    if (!newAddress.label.trim()) {
      errors.label = "Label alamat wajib diisi";
    }
    
    if (!newAddress.recipientName.trim()) {
      errors.recipientName = "Nama penerima wajib diisi";
    }
    
    if (!newAddress.recipientPhone.trim()) {
      errors.recipientPhone = "Nomor telepon wajib diisi";
    } else if (!/^(\+62|62|0)[0-9]{9,12}$/.test(newAddress.recipientPhone.replace(/[\s-]/g, ""))) {
      errors.recipientPhone = "Format nomor telepon tidak valid";
    }
    
    if (!newAddress.province.trim()) {
      errors.province = "Provinsi wajib dipilih";
    }
    
    if (!newAddress.city.trim()) {
      errors.city = "Kota/Kabupaten wajib dipilih";
    }
    
    if (!newAddress.district || !newAddress.district.trim()) {
      errors.district = "Kecamatan wajib diisi";
    }
    
    if (!newAddress.village || !newAddress.village.trim()) {
      errors.village = "Kelurahan/Desa wajib diisi";
    }
    
    if (!newAddress.postalCode.trim()) {
      errors.postalCode = "Kode pos wajib diisi";
    } else if (!/^\d{5}$/.test(newAddress.postalCode)) {
      errors.postalCode = "Kode pos harus 5 digit angka";
    }
    
    if (!newAddress.streetAddress.trim()) {
      errors.streetAddress = "Alamat lengkap wajib diisi";
    } else if (newAddress.streetAddress.trim().length < 10) {
      errors.streetAddress = "Alamat lengkap minimal 10 karakter";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setIsSaving(true);

    if (editingAddress) {
      // Update existing address
      const updateData: UpdateAddressData = {
        label: newAddress.label,
        recipientName: newAddress.recipientName,
        recipientPhone: newAddress.recipientPhone,
        province: newAddress.province,
        city: newAddress.city,
        postalCode: newAddress.postalCode,
        streetAddress: newAddress.streetAddress,
      };

      const result = await updateAddress(editingAddress.id, updateData);

      if (result.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: result.message,
          icon: "success",
          confirmButtonColor: "#A3AF87",
          timer: 2000,
        });
        await fetchAddresses();
        resetForm();
      } else {
        await Swal.fire({
          title: "Gagal!",
          text: result.message,
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      }
    } else {
      // Add new address
      const result = await createAddress(newAddress);

      if (result.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: result.message,
          icon: "success",
          confirmButtonColor: "#A3AF87",
          timer: 2000,
        });
        await fetchAddresses();
        resetForm();
      } else {
        await Swal.fire({
          title: "Gagal!",
          text: result.message,
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      }
    }

    setIsSaving(false);
  };

  // Handle Set Primary
  const handleSetPrimary = async (id: string) => {
    const result = await Swal.fire({
      title: "Jadikan Alamat Utama?",
      text: "Alamat ini akan dijadikan alamat pengiriman default",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#A3AF87",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Jadikan Utama",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const updateResult = await setDefaultAddress(id);

      if (updateResult.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: updateResult.message,
          icon: "success",
          confirmButtonColor: "#A3AF87",
          timer: 2000,
        });
        await fetchAddresses();
      } else {
        await Swal.fire({
          title: "Gagal!",
          text: updateResult.message,
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      }
    }
  };

  // Handle Delete Address
  const handleDeleteAddress = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Alamat?",
      text: "Alamat yang dihapus tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const deleteResult = await deleteAddress(id);

      if (deleteResult.success) {
        await Swal.fire({
          title: "Terhapus!",
          text: deleteResult.message,
          icon: "success",
          confirmButtonColor: "#A3AF87",
          timer: 2000,
        });
        await fetchAddresses();
      } else {
        await Swal.fire({
          title: "Gagal!",
          text: deleteResult.message,
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      }
    }
  };

  // Handle Edit Address
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress({
      label: address.label,
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone,
      province: address.province,
      city: address.city,
      district: address.district || "",
      village: address.village || "",
      postalCode: address.postalCode,
      streetAddress: address.streetAddress,
    });
    setShowAddForm(true);
    // Trigger reset to allow auto-select
    setResetTrigger((prev) => prev + 1);
  };

  // Reset Form
  const resetForm = () => {
    setNewAddress({
      label: "",
      recipientName: "",
      recipientPhone: "",
      province: "",
      city: "",
      district: "",
      village: "",
      postalCode: "",
      streetAddress: "",
    });
    setFormErrors({});
    setShowAddForm(false);
    setEditingAddress(null);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#A3AF87] mx-auto" />
          <p className="mt-4 text-gray-600">Memuat alamat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-6">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#5a6c5b]">
                Daftar Alamat
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Kelola alamat pengiriman Anda
              </p>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingAddress(null);
                setNewAddress({
                  label: "",
                  recipientName: "",
                  recipientPhone: "",
                  province: "",
                  city: "",
                  district: "",
                  village: "",
                  postalCode: "",
                  streetAddress: "",
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#A3AF87] text-white rounded-xl hover:bg-[#95a17a] transition-all shadow-sm active:scale-95"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-4">
        {/* Add Address Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleAddAddress}
                className="bg-gradient-to-br from-[#A3AF87]/20 to-white rounded-2xl border-2 border-[#A3AF87]/30 p-4 sm:p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#5a6c5b]">
                    {editingAddress ? "Edit Alamat" : "Tambah Alamat Baru"}
                  </h3>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-red-600" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label Alamat
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.label}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, label: e.target.value })
                      }
                      className={`w-full px-4 py-3 border-2 ${
                        formErrors.label ? "border-red-500" : "border-gray-200"
                      } rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium`}
                      placeholder="Rumah, Kantor, dll"
                    />
                    {formErrors.label && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.label}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Penerima
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.recipientName}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          recipientName: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 border-2 ${
                        formErrors.recipientName ? "border-red-500" : "border-gray-200"
                      } rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium`}
                      placeholder="Nama lengkap"
                    />
                    {formErrors.recipientName && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.recipientName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddress.recipientPhone}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          recipientPhone: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 border-2 ${
                        formErrors.recipientPhone ? "border-red-500" : "border-gray-200"
                      } rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium`}
                      placeholder="08xxxxxxxxxx"
                    />
                    {formErrors.recipientPhone && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.recipientPhone}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Format: 08xxx atau 62xxx atau +62xxx
                    </p>
                  </div>

                  {/* Address Form with API */}
                  <AddressFormWithAPI
                    formData={{
                      province: newAddress.province,
                      city: newAddress.city,
                      district: newAddress.district,
                      village: newAddress.village,
                      postalCode: newAddress.postalCode,
                      streetAddress: newAddress.streetAddress,
                    }}
                    errors={formErrors}
                    onChange={(field, value) => {
                      setNewAddress({ ...newAddress, [field]: value });
                      // Clear error when user starts typing
                      if (formErrors[field]) {
                        setFormErrors({ ...formErrors, [field]: "" });
                      }
                    }}
                    resetTrigger={resetTrigger}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 bg-[#A3AF87] text-white rounded-xl hover:bg-[#95a17a] transition-all font-medium active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : editingAddress ? (
                      "Simpan Perubahan"
                    ) : (
                      "Simpan Alamat"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Address Card - Show when user has profile address but no saved addresses */}
        {addresses.length === 0 &&
          userProfile &&
          (userProfile.province || userProfile.city) && (
            <div className="mb-4">
              <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border-2 border-amber-200 p-4 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Home className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                        Alamat Pendaftaran
                      </h3>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Dari Profil
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Alamat ini diambil dari data pendaftaran Anda. Tambahkan
                      alamat baru untuk pengiriman.
                      {(!userProfile.village || userProfile.village.trim() === "") && (
                        <span className="block mt-1 text-amber-600 font-medium">
                          ⚠️ Data kelurahan/desa belum lengkap. Silakan lengkapi saat menyimpan alamat.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex items-center gap-3 text-gray-700">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{userProfile.name || "-"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{userProfile.phone || "-"}</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="space-y-1">
                        {userProfile.fullAddress && (
                          <div>{userProfile.fullAddress}</div>
                        )}
                        <div className="text-sm text-gray-600">
                          {[
                            userProfile.village,
                            userProfile.district,
                            userProfile.city,
                            userProfile.province,
                            userProfile.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Data wilayah belum lengkap"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-200">
                  <button
                    onClick={() => {
                      console.log("🔄 Loading address from profile...");
                      console.log("Profile data:", userProfile);
                      console.log("  - userProfile.village:", userProfile.village);
                      console.log("  - typeof userProfile.village:", typeof userProfile.village);
                      console.log("  - userProfile.village || '':", userProfile.village || "");
                      
                      setShowAddForm(true);
                      const addressData = {
                        label: "Rumah",
                        recipientName: userProfile.name || "",
                        recipientPhone: userProfile.phone || "",
                        province: userProfile.province || "",
                        city: userProfile.city || "",
                        district: userProfile.district || "",
                        village: userProfile.village || "",
                        postalCode: userProfile.postalCode || "",
                        streetAddress: userProfile.fullAddress || "",
                      };
                      
                      console.log("📝 Setting address data:", addressData);
                      console.log("  - addressData.village:", addressData.village);
                      setNewAddress(addressData);
                      
                      // Trigger reset to allow auto-select
                      setResetTrigger((prev) => prev + 1);
                    }}
                    className="w-full px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Simpan Sebagai Alamat Pengiriman
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Address List */}
        {addresses.length === 0 &&
        (!userProfile || (!userProfile.province && !userProfile.city)) ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada alamat tersimpan</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-6 py-3 bg-[#A3AF87] text-white rounded-xl hover:bg-[#95a17a] transition-all font-medium"
            >
              Tambah Alamat Pertama
            </button>
          </div>
        ) : addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address) => (
              <motion.div
                key={address.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-6 hover:border-[#A3AF87] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#A3AF87]/20 rounded-xl">
                      <MapPin className="h-5 w-5 text-[#5a6c5b]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                        {address.label}
                      </h3>
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white text-xs font-bold rounded-full mt-1">
                          <Check className="h-3 w-3" />
                          Utama
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex items-center gap-3 text-gray-700">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{address.recipientName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{address.recipientPhone}</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="space-y-1">
                        {/* Alamat Lengkap */}
                        <div className="font-medium">{address.streetAddress}</div>
                        {/* Detail Wilayah */}
                        <div className="text-sm text-gray-600">
                          {[
                            address.village,
                            address.district,
                            address.city,
                            address.province,
                            address.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetPrimary(address.id)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-[#A3AF87]/20 text-[#5a6c5b] rounded-xl hover:bg-[#A3AF87]/30 transition-all font-medium text-sm active:scale-95"
                    >
                      Jadikan Utama
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-medium text-sm active:scale-95"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium text-sm active:scale-95"
                  >
                    Hapus
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
