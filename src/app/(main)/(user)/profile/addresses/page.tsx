"use client";

import { useState } from "react";
import { Plus, ArrowLeft, MapPin, User, Phone, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Address {
  id: number;
  label: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
  isPrimary: boolean;
}

export default function AddressesPage() {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      label: "Rumah",
      name: "Budi Santoso",
      phone: "081234567890",
      province: "Jawa Barat",
      city: "Bandung",
      postalCode: "40123",
      address: "Jl. Merdeka No. 123, Kec. Cicendo",
      isPrimary: true,
    },
    {
      id: 2,
      label: "Kantor",
      name: "Budi Santoso",
      phone: "081234567890",
      province: "Jawa Barat",
      city: "Bandung",
      postalCode: "40191",
      address: "Jl. Asia Afrika No. 8, Kec. Sumur Bandung",
      isPrimary: false,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<
    Omit<Address, "id" | "isPrimary">
  >({
    label: "",
    name: "",
    phone: "",
    province: "",
    city: "",
    postalCode: "",
    address: "",
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      // Update existing address
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddress.id ? { ...addr, ...newAddress } : addr
        )
      );
    } else {
      // Add new address
      const newId = Math.max(...addresses.map((a) => a.id), 0) + 1;
      setAddresses([
        ...addresses,
        { ...newAddress, id: newId, isPrimary: addresses.length === 0 },
      ]);
    }
    setNewAddress({
      label: "",
      name: "",
      phone: "",
      province: "",
      city: "",
      postalCode: "",
      address: "",
    });
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const handleSetPrimary = (id: number) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isPrimary: addr.id === id,
      }))
    );
  };

  const handleDeleteAddress = (id: number) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== id);
    if (
      updatedAddresses.length > 0 &&
      !updatedAddresses.some((a) => a.isPrimary)
    ) {
      updatedAddresses[0].isPrimary = true;
    }
    setAddresses(updatedAddresses);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress({
      label: address.label,
      name: address.name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      postalCode: address.postalCode,
      address: address.address,
    });
    setShowAddForm(true);
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
              className="h-5 w-5 text-[#5a6c5b] group-hover:-translate-x-1 transition-transform"
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
                  name: "",
                  phone: "",
                  province: "",
                  city: "",
                  postalCode: "",
                  address: "",
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
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAddress(null);
                      setNewAddress({
                        label: "",
                        name: "",
                        phone: "",
                        province: "",
                        city: "",
                        postalCode: "",
                        address: "",
                      });
                    }}
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium"
                      placeholder="Rumah, Kantor, dll"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Penerima
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.name}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium"
                      placeholder="Nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.province}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          province: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium"
                      placeholder="Jawa Barat"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kota/Kabupaten
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium"
                      placeholder="Bandung"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          postalCode: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium"
                      placeholder="40123"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Lengkap
                    </label>
                    <textarea
                      required
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          address: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all resize-none text-[#5a6c5b] font-medium"
                      placeholder="Jalan, nomor, RT/RW, Kecamatan, dll"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#A3AF87] text-white rounded-xl hover:bg-[#95a17a] transition-all font-medium active:scale-95"
                  >
                    {editingAddress ? "Simpan Perubahan" : "Simpan Alamat"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAddress(null);
                      setNewAddress({
                        label: "",
                        name: "",
                        phone: "",
                        province: "",
                        city: "",
                        postalCode: "",
                        address: "",
                      });
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Address List */}
        {addresses.length === 0 ? (
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
        ) : (
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
                      {address.isPrimary && (
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
                    <span>{address.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{address.phone}</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>
                      {address.address}, {address.city}, {address.province}{" "}
                      {address.postalCode}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {!address.isPrimary && (
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
        )}
      </div>
    </div>
  );
}
