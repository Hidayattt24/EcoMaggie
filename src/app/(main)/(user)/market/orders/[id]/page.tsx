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
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import { StatusLabel } from "@/components/transaction/StatusLabel";
import { TransactionDetailItem } from "@/components/transaction/TransactionDetailItem";
import { generateInvoicePDF } from "@/utils/generateInvoicePDF";

interface Product {
  id: number;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
  slug: string;
}

interface Order {
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
const mockOrderData: { [key: string]: Order } = {
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
  "ORD-2025-12-002": {
    id: "2",
    orderId: "ORD-2025-12-002",
    farmName: "Maggot Organik Sentosa",
    farmerId: 2,
    farmerPhone: "6281234567891",
    status: "packed",
    products: [
      {
        id: 2,
        name: "Maggot BSF Organik",
        variant: "1kg",
        quantity: 3,
        price: 38000,
        image: "/assets/dummy/magot.png",
        slug: "maggot-bsf-organik",
      },
      {
        id: 3,
        name: "Maggot BSF Kering",
        variant: "250gr",
        quantity: 1,
        price: 52000,
        image: "/assets/dummy/magot.png",
        slug: "maggot-bsf-kering",
      },
    ],
    totalItems: 4,
    subtotal: 166000,
    shippingCost: 12000,
    discount: 0,
    totalPrice: 178000,
    shippingMethod: "Regular",
    date: "30 Des 2025",
    paymentMethod: "GoPay",
    shippingAddress: {
      name: "Ahmad Wijaya",
      phone: "082345678901",
      address: "Jl. Sudirman No. 456, Blok B",
      city: "Bandung",
      province: "Jawa Barat",
      postalCode: "40123",
    },
  },
  "ORD-2025-12-003": {
    id: "3",
    orderId: "ORD-2025-12-003",
    farmName: "Ternak Maggot Jaya",
    farmerId: 3,
    farmerPhone: "6281234567892",
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
    paymentMethod: "Transfer Bank BCA",
    shippingAddress: {
      name: "Siti Nurhaliza",
      phone: "083456789012",
      address: "Jl. Gatot Subroto No. 789",
      city: "Surabaya",
      province: "Jawa Timur",
      postalCode: "60123",
    },
  },
  "ORD-2025-12-004": {
    id: "4",
    orderId: "ORD-2025-12-004",
    farmName: "BSF Farm Indonesia",
    farmerId: 4,
    farmerPhone: "6281234567893",
    status: "unpaid",
    products: [
      {
        id: 3,
        name: "Maggot BSF Kering",
        variant: "250gr",
        quantity: 2,
        price: 52000,
        image: "/assets/dummy/magot.png",
        slug: "maggot-bsf-kering",
      },
    ],
    totalItems: 2,
    subtotal: 104000,
    shippingCost: 10000,
    discount: 0,
    totalPrice: 114000,
    shippingMethod: "Regular",
    date: "30 Des 2025",
    paymentMethod: "Belum Dibayar",
    shippingAddress: {
      name: "Rina Kusuma",
      phone: "084567890123",
      address: "Jl. Diponegoro No. 321",
      city: "Yogyakarta",
      province: "DI Yogyakarta",
      postalCode: "55123",
    },
  },
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const data = mockOrderData[resolvedParams.id];
      setOrder(data || null);
      setIsLoading(false);
    }, 500);
  }, [resolvedParams.id]);

  const handlePrintInvoice = () => {
    if (!order) return;

    const fullAddress = `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}`;

    generateInvoicePDF({
      orderId: order.orderId,
      orderDate: order.date,
      productName: order.products[0].name,
      quantity: order.totalItems,
      price: order.products[0].price,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      shippingMethod: order.shippingMethod,
      discount: order.discount,
      total: order.totalPrice,
      customerName: order.shippingAddress.name,
      customerPhone: order.shippingAddress.phone,
      customerAddress: fullAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus:
        order.status === "completed"
          ? "paid"
          : order.status === "cancelled"
          ? "failed"
          : "pending",
      items: order.products.map((p) => ({
        name: p.name,
        variant: p.variant,
        quantity: p.quantity,
        unit: "pcs",
        price: p.price,
        subtotal: p.price * p.quantity,
      })),
      trackingNumber: order.trackingNumber,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A3AF87]/10 via-white to-[#A3AF87]/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A3AF87]/20 border-t-[#A3AF87] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#5a6c5b] font-medium">
            Memuat detail pesanan...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A3AF87]/10 via-white to-[#A3AF87]/5 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#5a6c5b] mb-2">
            Pesanan Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            Maaf, pesanan yang Anda cari tidak ditemukan.
          </p>
          <button
            onClick={() => router.push("/market/orders")}
            className="px-6 py-3 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Kembali ke Pesanan
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

  const StatusIconComponent = statusIcons[order.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-[#A3AF87]/10 via-white to-[#A3AF87]/5 pb-6"
    >
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10 lg:static">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 sm:p-2.5 hover:bg-[#A3AF87]/10 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-[#5a6c5b]" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-[#5a6c5b] truncate">
                Detail Pesanan
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 truncate">
                {order.orderId}
              </p>
            </div>
            <button
              onClick={handlePrintInvoice}
              className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-[#A3AF87]/50 text-[#5a6c5b] rounded-lg font-bold text-sm hover:bg-[#A3AF87]/10 transition-all flex-shrink-0"
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
            className="bg-gradient-to-br from-[#A3AF87]/20 to-[#A3AF87]/10 rounded-xl sm:rounded-2xl p-4 sm:p-8 border-2 border-[#A3AF87]/30"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <StatusIconComponent className="h-7 w-7 sm:h-10 sm:w-10 text-[#5a6c5b]" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex justify-center sm:justify-start">
                  <StatusLabel status={order.status} size="lg" />
                </div>
                <p className="text-xs sm:text-sm text-[#5a6c5b] mt-2 px-2 sm:px-0">
                  {order.status === "shipped" &&
                    "Pesanan Anda sedang dalam perjalanan"}
                  {order.status === "packed" &&
                    "Pesanan Anda sedang dikemas oleh petani"}
                  {order.status === "completed" &&
                    "Pesanan telah selesai. Terima kasih!"}
                  {order.status === "unpaid" &&
                    "Segera selesaikan pembayaran Anda"}
                  {order.status === "cancelled" &&
                    "Pesanan ini telah dibatalkan"}
                </p>
              </div>
              <div className="text-center sm:text-right w-full sm:w-auto">
                <p className="text-xs sm:text-xs text-[#5a6c5b] mb-1">
                  Total Pembayaran
                </p>
                <p className="text-xl sm:text-3xl font-bold text-[#5a6c5b] break-words">
                  Rp {order.totalPrice.toLocaleString("id-ID")}
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
          <div className="p-3 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-[#A3AF87]/10 to-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-[#A3AF87] rounded-lg">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h2 className="text-base sm:text-xl font-bold text-[#5a6c5b]">
                Informasi Pengiriman
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <TransactionDetailItem
              icon={Package}
              label="Metode Pengiriman"
              value={order.shippingMethod}
            />
            {order.trackingNumber && (
              <TransactionDetailItem
                icon={Hash}
                label="Nomor Resi"
                value={
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="break-all text-sm sm:text-base">
                      {order.trackingNumber}
                    </span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(order.trackingNumber!)
                      }
                      className="text-xs px-2 py-1 bg-[#A3AF87]/20 text-[#5a6c5b] rounded font-bold hover:bg-[#A3AF87]/30 transition-colors w-fit"
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
                  <p className="font-bold">{order.shippingAddress.name}</p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.province}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                </div>
              }
            />
            <TransactionDetailItem
              icon={Package}
              label="Penjual"
              value={
                <div className="space-y-1">
                  <p className="font-bold">{order.farmName}</p>
                  <a
                    href={`https://wa.me/${order.farmerPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#5a6c5b] hover:underline"
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
          <div className="p-4 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-[#A3AF87]/10 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#A3AF87] rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#5a6c5b]">
                Rincian Produk
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {order.products.map((product, index) => (
                <div
                  key={product.id}
                  className={`flex gap-4 pb-4 ${
                    index !== order.products.length - 1
                      ? "border-b-2 border-gray-50"
                      : ""
                  }`}
                >
                  <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#A3AF87]/20 to-[#A3AF87]/10 rounded-xl overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/market/products/${product.slug}`}
                      className="font-bold text-sm sm:text-base text-[#5a6c5b] hover:underline line-clamp-2"
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
                      <p className="font-bold text-sm sm:text-base text-[#5a6c5b]">
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
          <div className="p-4 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-[#A3AF87]/10 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#A3AF87] rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#5a6c5b]">
                Rincian Pembayaran
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Subtotal ({order.totalItems} produk)
                </span>
                <span className="font-bold text-[#5a6c5b]">
                  Rp {order.subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span className="font-bold text-[#5a6c5b]">
                  Rp {order.shippingCost.toLocaleString("id-ID")}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diskon</span>
                  <span className="font-bold text-green-600">
                    - Rp {order.discount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t-2 border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base sm:text-lg text-gray-700">
                    Total Pembayaran
                  </span>
                  <span className="font-bold text-xl sm:text-2xl text-[#5a6c5b]">
                    Rp {order.totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t-2 border-gray-50">
                <TransactionDetailItem
                  icon={CreditCard}
                  label="Metode Pembayaran"
                  value={order.paymentMethod}
                />
              </div>
              <div className="pt-1">
                <TransactionDetailItem
                  icon={Calendar}
                  label="Tanggal Transaksi"
                  value={order.date}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons based on Status */}
        {order.status === "completed" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href={`/market/products/${order.products[0].slug}#ulasan`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
            >
              <Star className="h-4 w-4 sm:h-5 sm:w-5" />
              Beri Ulasan
            </Link>
            <button
              onClick={handlePrintInvoice}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-[#A3AF87]/50 text-[#5a6c5b] rounded-xl font-bold text-sm hover:bg-[#A3AF87]/10 transition-all active:scale-95"
            >
              <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
              Cetak Invoice
            </button>
          </motion.div>
        )}

        {order.status === "packed" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <a
              href={`https://wa.me/${
                order.farmerPhone
              }?text=${encodeURIComponent(
                `Halo, saya ingin menanyakan status pesanan saya dengan ID: ${order.orderId}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              Hubungi Penjual via WhatsApp
            </a>
          </motion.div>
        )}

        {/* Print Invoice Button (Mobile) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="sm:hidden pb-2"
        >
          <button
            onClick={handlePrintInvoice}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-[#A3AF87]/50 text-[#5a6c5b] rounded-xl font-bold text-sm hover:bg-[#A3AF87]/10 transition-all active:scale-95"
          >
            <Printer className="h-4 w-4" />
            Cetak Invoice
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
