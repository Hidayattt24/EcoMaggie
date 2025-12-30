"use client";

import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
  MapPin,
  ShoppingBag,
  Star,
  ChevronRight,
  Phone,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
}

interface Transaction {
  id: string;
  orderId: string;
  farmName: string;
  farmerId: number;
  status: "unpaid" | "packed" | "shipped" | "completed" | "cancelled";
  products: Product[];
  totalItems: number;
  totalPrice: number;
  shippingMethod: string;
  date: string;
  trackingNumber?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onTrack?: (transaction: Transaction) => void;
}

const statusConfig = {
  unpaid: {
    label: "Menunggu Pembayaran",
    color: "bg-orange-100 text-orange-700",
    icon: Clock,
  },
  packed: {
    label: "Sedang Dikemas",
    color: "bg-blue-100 text-blue-700",
    icon: Package,
  },
  shipped: {
    label: "Dalam Pengiriman",
    color: "bg-purple-100 text-purple-700",
    icon: Truck,
  },
  completed: {
    label: "Pesanan Selesai",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

export function TransactionCard({
  transaction,
  onTrack,
}: TransactionCardProps) {
  const config = statusConfig[transaction.status];
  const StatusIcon = config.icon;

  const firstProduct = transaction.products[0];
  const otherProductsCount = transaction.products.length - 1;

  const getActionButtons = () => {
    switch (transaction.status) {
      case "unpaid":
        return (
          <>
            <Link
              href={`/market/checkout?orderId=${transaction.orderId}`}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all text-center"
            >
              Bayar Sekarang
            </Link>
            <button className="px-4 py-2.5 border-2 border-gray-200 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all">
              Batalkan
            </button>
          </>
        );
      case "packed":
        const whatsappMessage = encodeURIComponent(
          `Halo, saya ingin menanyakan status pesanan saya dengan ID: ${transaction.orderId}`
        );
        const whatsappNumber = "6281234567890"; // Replace with actual farmer's WhatsApp number
        return (
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2.5 border-2 border-[#2D5016]/30 text-[#2D5016] rounded-lg font-bold text-sm hover:bg-green-50 transition-all flex items-center justify-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Hubungi WhatsApp
          </a>
        );
      case "shipped":
        return (
          <button
            onClick={() => onTrack?.(transaction)}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Lacak Pesanan
          </button>
        );
      case "completed":
        return (
          <>
            <Link
              href={`/market/products/${firstProduct.id}#ulasan`}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Star className="h-4 w-4" />
              Beri Nilai
            </Link>
            <Link
              href={`/transaction/${transaction.orderId}`}
              className="flex-1 px-4 py-2.5 border-2 border-[#2D5016]/30 text-[#2D5016] rounded-lg font-bold text-sm hover:bg-green-50 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Detail Pesanan
            </Link>
          </>
        );
      case "cancelled":
        return (
          <Link
            href="/market/products"
            className="flex-1 px-4 py-2.5 border-2 border-[#2D5016]/30 text-[#2D5016] rounded-lg font-bold text-sm hover:bg-green-50 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Belanja Lagi
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Header */}
      <div className="p-4 border-b-2 border-gray-50 bg-gradient-to-r from-green-50/50 to-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-[#2D5016]" />
            <span className="font-bold text-sm text-[#2D5016]">
              {transaction.farmName}
            </span>
          </div>
          <Link
            href={`/market/orders/${transaction.orderId}`}
            className="flex items-center gap-1 text-xs text-[#2D5016] hover:gap-2 transition-all"
          >
            <span className="font-bold">Detail</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            ID: {transaction.orderId}
          </span>
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${config.color}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {config.label}
          </div>
        </div>
      </div>

      {/* Body - Products */}
      <div className="p-4">
        <div className="flex gap-3 mb-3">
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-lg overflow-hidden">
            <img
              src={firstProduct.image}
              alt={firstProduct.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-[#2D5016] line-clamp-1 mb-1">
              {firstProduct.name}
            </h3>
            <p className="text-xs text-gray-500 mb-1">
              Varian: {firstProduct.variant}
            </p>
            <p className="text-xs text-gray-500">x{firstProduct.quantity}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm text-[#2D5016]">
              Rp {firstProduct.price.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {otherProductsCount > 0 && (
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 font-medium">
            + {otherProductsCount} produk lainnya
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t-2 border-gray-50 bg-gray-50/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 font-medium">
            {transaction.totalItems} Produk
          </span>
          <div className="text-right">
            <span className="text-xs text-gray-500 mr-2">Total Belanja:</span>
            <span className="text-base font-bold text-[#2D5016]">
              Rp {transaction.totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
        <div className="flex gap-2">{getActionButtons()}</div>
      </div>
    </motion.div>
  );
}
