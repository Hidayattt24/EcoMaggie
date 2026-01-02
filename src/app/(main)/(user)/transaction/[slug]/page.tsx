"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  Hash,
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StatusLabel } from "@/components/user/transaction/StatusLabel";
import { TransactionDetailItem } from "@/components/user/transaction/TransactionDetailItem";

interface Product {
  id: number;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
  slug: string;
}

interface Transaction {
  id: string;
  orderId: string;
  farmName: string;
  farmerId: number;
  farmerPhone: string;
  status: "unpaid" | "packed" | "shipped" | "completed" | "cancelled";
  products: Product[];
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalPrice: number;
  shippingMethod: string;
  trackingNumber?: string;
  date: string;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

// Mock data - Replace with actual API call
const mockTransactionData: { [key: string]: Transaction } = {
  "ORD-2025-12-001": {
    id: "1",
    orderId: "ORD-2025-12-001",
    farmName: "Kebun Maggot Berkah",
    farmerId: 1,
    farmerPhone: "6281234567890",
    status: "shipped",
    products: [
      {
        id: 1,
        name: "Maggot BSF Premium",
        variant: "500gr",
        quantity: 2,
        price: 76500,
        image: "/assets/dummy/magot.png",
        slug: "maggot-bsf-premium",
      },
      {
        id: 2,
        name: "Maggot BSF Organik",
        variant: "1kg",
        quantity: 1,
        price: 38000,
        image: "/assets/dummy/magot.png",
        slug: "maggot-bsf-organik",
      },
    ],
    totalItems: 3,
    subtotal: 191000,
    shippingCost: 15000,
    discount: 10000,
    totalPrice: 196000,
    shippingMethod: "Local Delivery",
    trackingNumber: "ECO-BA-20251230001",
    date: "29 Des 2025",
    paymentMethod: "Transfer Bank BCA",
    shippingAddress: {
      name: "Budi Santoso",
      phone: "081234567890",
      address: "Jl. Merdeka No. 123, RT 05/RW 03",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12345",
    },
  },
  "ORD-2025-12-003": {
    id: "3",
    orderId: "ORD-2025-12-003",
    farmName: "Ternak Maggot Jaya",
    farmerId: 3,
    farmerPhone: "6281234567891",
    status: "completed",
    products: [
      {
        id: 1,
        name: "Maggot BSF Premium",
        variant: "500gr",
        quantity: 5,
        price: 76500,
        image: "/assets/dummy/magot.png",
        slug: "maggot-bsf-premium",
      },
    ],
    totalItems: 5,
    subtotal: 382500,
    shippingCost: 20000,
    discount: 0,
    totalPrice: 402500,
    shippingMethod: "Express",
    trackingNumber: "ECO-JKT-20251225001",
    date: "25 Des 2025",
    paymentMethod: "GoPay",
    shippingAddress: {
      name: "Siti Nurhaliza",
      phone: "082345678901",
      address: "Jl. Gatot Subroto No. 456, Blok A",
      city: "Bandung",
      province: "Jawa Barat",
      postalCode: "40123",
    },
  },
};

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const data = mockTransactionData[resolvedParams.slug];
      setTransaction(data || null);
      setIsLoading(false);
    }, 500);
  }, [resolvedParams.slug]);

  const handlePrintInvoice = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-green-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2D5016]/20 border-t-[#2D5016] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 font-medium">
            Memuat detail transaksi...
          </p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-green-50/20 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D5016] mb-2">
            Transaksi Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            Maaf, transaksi yang Anda cari tidak ditemukan.
          </p>
          <button
            onClick={() => router.push("/transaction")}
            className="px-6 py-3 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Kembali ke Transaksi
          </button>
        </div>
      </div>
    );
  }

  const statusIcons = {
    unpaid: Clock,
    packed: Package,
    shipped: Truck,
    completed: CheckCircle2,
    cancelled: XCircle,
  };

  const StatusIconComponent = statusIcons[transaction.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-green-50/20 pb-6"
    >
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10 lg:static">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-[#2D5016]" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-[#2D5016] truncate">
                Detail Transaksi
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 truncate">
                {transaction.orderId}
              </p>
            </div>
            <button
              onClick={handlePrintInvoice}
              className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-[#2D5016]/30 text-[#2D5016] rounded-lg font-bold text-sm hover:bg-green-50 transition-all flex-shrink-0"
            >
              <Printer className="h-4 w-4" />
              Cetak Invoice
            </button>
          </div>

          {/* Status Header with Large Icon */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl sm:rounded-2xl p-4 sm:p-8 border-2 border-[#2D5016]/10"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <StatusIconComponent className="h-7 w-7 sm:h-10 sm:w-10 text-[#2D5016]" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex justify-center sm:justify-start">
                  <StatusLabel status={transaction.status} size="lg" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 px-2 sm:px-0">
                  {transaction.status === "shipped" &&
                    "Pesanan Anda sedang dalam perjalanan"}
                  {transaction.status === "packed" &&
                    "Pesanan Anda sedang dikemas oleh petani"}
                  {transaction.status === "completed" &&
                    "Pesanan telah selesai. Terima kasih!"}
                  {transaction.status === "unpaid" &&
                    "Segera selesaikan pembayaran Anda"}
                  {transaction.status === "cancelled" &&
                    "Pesanan ini telah dibatalkan"}
                </p>
              </div>
              <div className="text-center sm:text-right w-full sm:w-auto">
                <p className="text-xs sm:text-xs text-gray-500 mb-1">
                  Total Pembayaran
                </p>
                <p className="text-xl sm:text-3xl font-bold text-[#2D5016] break-words">
                  Rp {transaction.totalPrice.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Shipping Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 overflow-hidden"
        >
          <div className="p-3 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-green-50/30 to-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-[#2D5016] rounded-lg">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h2 className="text-base sm:text-xl font-bold text-[#2D5016]">
                Informasi Pengiriman
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <TransactionDetailItem
              icon={Package}
              label="Metode Pengiriman"
              value={transaction.shippingMethod}
            />
            {transaction.trackingNumber && (
              <TransactionDetailItem
                icon={Hash}
                label="Nomor Resi"
                value={
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="break-all text-sm sm:text-base">
                      {transaction.trackingNumber}
                    </span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          transaction.trackingNumber!
                        )
                      }
                      className="text-xs px-2 py-1 bg-green-100 text-[#2D5016] rounded font-bold hover:bg-green-200 transition-colors w-fit"
                    >
                      Salin
                    </button>
                  </div>
                }
              />
            )}
            <TransactionDetailItem
              icon={MapPin}
              label="Alamat Pengiriman"
              value={
                <div className="space-y-1">
                  <p className="font-bold">
                    {transaction.shippingAddress.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {transaction.shippingAddress.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {transaction.shippingAddress.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    {transaction.shippingAddress.city},{" "}
                    {transaction.shippingAddress.province}{" "}
                    {transaction.shippingAddress.postalCode}
                  </p>
                </div>
              }
            />
            <TransactionDetailItem
              icon={Package}
              label="Penjual"
              value={
                <div className="space-y-1">
                  <p className="font-bold">{transaction.farmName}</p>
                  <a
                    href={`https://wa.me/${transaction.farmerPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#2D5016] hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    Hubungi Penjual
                  </a>
                </div>
              }
            />
          </div>
        </motion.div>

        {/* Product Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-green-50/30 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2D5016] rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#2D5016]">
                Rincian Produk
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {transaction.products.map((product, index) => (
                <div
                  key={product.id}
                  className={`flex gap-4 pb-4 ${
                    index !== transaction.products.length - 1
                      ? "border-b-2 border-gray-50"
                      : ""
                  }`}
                >
                  <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-xl overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/market/products/${product.slug}`}
                      className="font-bold text-sm sm:text-base text-[#2D5016] hover:underline line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Varian: {product.variant}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs sm:text-sm text-gray-600">
                        x{product.quantity}
                      </p>
                      <p className="font-bold text-sm sm:text-base text-[#2D5016]">
                        Rp{" "}
                        {(product.price * product.quantity).toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Payment Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-green-50/30 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2D5016] rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#2D5016]">
                Rincian Pembayaran
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Subtotal ({transaction.totalItems} produk)
                </span>
                <span className="font-bold text-[#2D5016]">
                  Rp {transaction.subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span className="font-bold text-[#2D5016]">
                  Rp {transaction.shippingCost.toLocaleString("id-ID")}
                </span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diskon</span>
                  <span className="font-bold text-green-600">
                    - Rp {transaction.discount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t-2 border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base sm:text-lg text-gray-700">
                    Total Pembayaran
                  </span>
                  <span className="font-bold text-xl sm:text-2xl text-[#2D5016]">
                    Rp {transaction.totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t-2 border-gray-50">
                <TransactionDetailItem
                  icon={CreditCard}
                  label="Metode Pembayaran"
                  value={transaction.paymentMethod}
                />
              </div>
              <div className="pt-1">
                <TransactionDetailItem
                  icon={Calendar}
                  label="Tanggal Transaksi"
                  value={transaction.date}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Print Invoice Button (Mobile) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="sm:hidden pb-2"
        >
          <button
            onClick={handlePrintInvoice}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
          >
            <Printer className="h-4 w-4" />
            Cetak Invoice
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
