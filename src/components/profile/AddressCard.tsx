"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, User, Trash2, Edit, Check } from "lucide-react";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isPrimary: boolean;
}

interface AddressCardProps {
  address: Address;
  onSetPrimary: (id: string) => void;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
}

export function AddressCard({
  address,
  onSetPrimary,
  onEdit,
  onDelete,
}: AddressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-gray-100 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all relative overflow-hidden"
    >
      {/* Primary Badge */}
      {address.isPrimary && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-br from-[#2D5016] to-[#2D5016]/80 text-white px-4 py-1.5 rounded-bl-xl rounded-tr-xl flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">Alamat Utama</span>
          </div>
        </div>
      )}

      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-green-50 rounded-lg">
          <MapPin className="h-4 w-4 text-[#2D5016]" />
        </div>
        <h3 className="font-bold text-base text-[#2D5016]">{address.label}</h3>
      </div>

      {/* Recipient Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm text-gray-900">
              {address.recipientName}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600">{address.recipientPhone}</p>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p>{address.address}</p>
            <p className="mt-1">
              {address.city}, {address.province} {address.postalCode}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {!address.isPrimary && (
          <button
            onClick={() => onSetPrimary(address.id)}
            className="flex-1 min-w-[120px] px-3 py-2 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all active:scale-95"
          >
            Jadikan Utama
          </button>
        )}
        <button
          onClick={() => onEdit(address)}
          className="flex-1 min-w-[100px] px-3 py-2 border-2 border-[#2D5016]/30 text-[#2D5016] rounded-lg text-xs font-bold hover:bg-green-50 transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Edit className="h-3.5 w-3.5" />
          Ubah
        </button>
        <button
          onClick={() => onDelete(address.id)}
          className="px-3 py-2 border-2 border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Hapus
        </button>
      </div>
    </motion.div>
  );
}
