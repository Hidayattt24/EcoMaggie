"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  PackageCheck,
  MessageCircle,
  FileText,
  Banknote,
  Loader2,
  Copy,
  Check,
  Bike,
  Store,
  Box,
  Phone,
  Calendar,
} from "lucide-react";

// ============================================
// TYPES
// ============================================
type ShippingType = "ecomaggie-delivery" | "self-pickup" | "expedition";
type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready_pickup"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

interface Product {
  id: number;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  weight: number;
  image: string;
  stock: number;
}

interface Order {
  id: string;
  orderId: string;
  status: OrderStatus;
  products: Product[];
  totalItems: number;
  totalWeight: number;
  subtotal: number;
  shippingCost: number;
  platformFee: number;
  discount: number;
  totalPrice: number;
  netEarnings: number;
  shippingMethod: string;
  shippingType: ShippingType;
  trackingNumber?: string;
  expeditionName?: string;
  date: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "failed";
  notes?: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string;
  };
  shippingAddress: {
    label: string;
    recipientName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  statusHistory: {
    status: string;
    date: string;
    note?: string;
  }[];
}

// ============================================
// CONFIGURATIONS
// ============================================
const shippingTypeConfig: Record<ShippingType, any> = {
  "ecomaggie-delivery": {
    label: "Eco-Maggie Delivery",
    icon: Bike,
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  "self-pickup": {
    label: "Ambil di Toko",
    icon: Store,
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  expedition: {
    label: "Ekspedisi Reguler",
    icon: Package,
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
};

const statusConfig: Record<OrderStatus, any> = {
  pending: {
    label: "Menunggu Pembayaran",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    icon: Clock,
  },
  confirmed: {
    label: "Dikonfirmasi",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: CheckCircle2,
  },
  processing: {
    label: "Sedang Dikemas",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    icon: Package,
  },
  ready_pickup: {
    label: "Siap Diambil",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    icon: Store,
  },
  shipped: {
    label: "Dalam Pengiriman",
    color: "bg-[#A3AF87]/20 text-[#5a6c5b] border-[#A3AF87]/30",
    iconBg: "bg-[#A3AF87]/20",
    iconColor: "text-[#5a6c5b]",
    icon: Truck,
  },
  delivered: {
    label: "Terkirim",
    color: "bg-teal-100 text-teal-700 border-teal-200",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    icon: PackageCheck,
  },
  completed: {
    label: "Selesai",
    color: "bg-green-100 text-green-700 border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "bg-red-100 text-red-700 border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    icon: XCircle,
  },
};

// Mock data - Replace with real API
const mockOrderData: Record<string, Order> = {
  "ORD-2026-01-001": {
    id: "1",
    orderId: "ORD-2026-01-001",
    status: "confirmed",
    products: [
      {
        id: 1,
        name: "Maggot BSF Premium",
        variant: "500gr",
        quantity: 2,
        price: 76500,
        weight: 500,
        image: "/assets/dummy/magot.png",
        stock: 50,
      },
      {
        id: 2,
        name: "Maggot BSF Organik",
        variant: "1kg",
        quantity: 1,
        price: 38000,
        weight: 1000,
        image: "/assets/dummy/magot.png",
        stock: 30,
      },
    ],
    totalItems: 3,
    totalWeight: 2000,
    subtotal: 191000,
    shippingCost: 5000,
    platformFee: 0,
    discount: 0,
    totalPrice: 196000,
    netEarnings: 176450,
    shippingMethod: "Eco-Maggie Delivery",
    shippingType: "ecomaggie-delivery",
    date: "2 Jan 2026",
    createdAt: "2026-01-02T10:30:00",
    paymentMethod: "Transfer Bank",
    paymentStatus: "paid",
    notes: "Tolong kirim pagi ya, untuk pakan ayam",
    customer: {
      id: 1,
      name: "Budi Santoso",
      phone: "081234567890",
      email: "budi@email.com",
    },
    shippingAddress: {
      label: "Rumah",
      recipientName: "Budi Santoso",
      phone: "081234567890",
      address: "Jl. T. Panglima Polem No. 45",
      city: "Banda Aceh",
      province: "Aceh",
      postalCode: "23111",
    },
    statusHistory: [
      {
        status: "pending",
        date: "2026-01-02T10:30:00",
        note: "Pesanan dibuat",
      },
      {
        status: "confirmed",
        date: "2026-01-02T10:45:00",
        note: "Pembayaran diterima",
      },
    ],
  },
  "ORD-2026-01-002": {
    id: "2",
    orderId: "ORD-2026-01-002",
    status: "processing",
    products: [
      {
        id: 2,
        name: "Maggot BSF Organik",
        variant: "1kg",
        quantity: 3,
        price: 38000,
        weight: 1000,
        image: "/assets/dummy/magot.png",
        stock: 30,
      },
      {
        id: 3,
        name: "Pupuk Organik Maggot",
        variant: "5kg",
        quantity: 2,
        price: 85000,
        weight: 5000,
        image: "/assets/dummy/magot.png",
        stock: 20,
      },
    ],
    totalItems: 5,
    totalWeight: 13000,
    subtotal: 284000,
    shippingCost: 35000,
    platformFee: 0,
    discount: 0,
    totalPrice: 319000,
    netEarnings: 269800,
    shippingMethod: "JNE Regular",
    shippingType: "expedition",
    expeditionName: "JNE Regular",
    date: "2 Jan 2026",
    createdAt: "2026-01-02T08:15:00",
    paymentMethod: "Transfer Bank",
    paymentStatus: "paid",
    customer: {
      id: 2,
      name: "Ahmad Wijaya",
      phone: "082345678901",
      email: "ahmad@email.com",
    },
    shippingAddress: {
      label: "Kantor",
      recipientName: "Ahmad Wijaya",
      phone: "082345678901",
      address: "Jl. Gatot Subroto No. 123",
      city: "Medan",
      province: "Sumatera Utara",
      postalCode: "20112",
    },
    statusHistory: [
      { status: "pending", date: "2026-01-02T08:15:00" },
      { status: "confirmed", date: "2026-01-02T08:30:00" },
      {
        status: "processing",
        date: "2026-01-02T09:00:00",
        note: "Sedang dikemas",
      },
    ],
  },
  "ORD-2026-01-003": {
    id: "3",
    orderId: "ORD-2026-01-003",
    status: "ready_pickup",
    products: [
      {
        id: 1,
        name: "Maggot BSF Premium",
        variant: "500gr",
        quantity: 5,
        price: 76500,
        weight: 500,
        image: "/assets/dummy/magot.png",
        stock: 50,
      },
    ],
    totalItems: 5,
    totalWeight: 2500,
    subtotal: 382500,
    shippingCost: 0,
    platformFee: 0,
    discount: 0,
    totalPrice: 382500,
    netEarnings: 363375,
    shippingMethod: "Ambil di Toko",
    shippingType: "self-pickup",
    date: "1 Jan 2026",
    createdAt: "2026-01-01T14:00:00",
    paymentMethod: "Transfer Bank",
    paymentStatus: "paid",
    customer: {
      id: 3,
      name: "Siti Nurhaliza",
      phone: "083456789012",
      email: "siti@email.com",
    },
    shippingAddress: {
      label: "Toko EcoMaggie",
      recipientName: "Siti Nurhaliza",
      phone: "083456789012",
      address: "Ambil di Toko EcoMaggie",
      city: "Banda Aceh",
      province: "Aceh",
      postalCode: "23111",
    },
    statusHistory: [
      { status: "pending", date: "2026-01-01T14:00:00" },
      { status: "confirmed", date: "2026-01-01T14:15:00" },
      { status: "processing", date: "2026-01-01T14:30:00" },
      {
        status: "ready_pickup",
        date: "2026-01-01T15:00:00",
        note: "Pesanan siap diambil",
      },
    ],
  },
};

export default function FarmerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedResi, setCopiedResi] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const data = mockOrderData[resolvedParams.id];
      setOrder(data || null);
      setIsLoading(false);
    }, 500);
  }, [resolvedParams.id]);

  const handleWhatsApp = () => {
    if (!order) return;
    const message = encodeURIComponent(
      `Halo ${order.customer.name},\n\nTerima kasih telah berbelanja di EcoMaggie!\n\nPesanan Anda dengan ID *${order.orderId}* sedang kami proses.\n\nJika ada pertanyaan, silakan hubungi kami.\n\nSalam,\nPetani EcoMaggie`
    );
    window.open(
      `https://wa.me/62${order.customer.phone.replace(
        /^0/,
        ""
      )}?text=${message}`,
      "_blank"
    );
  };

  const handlePrintInvoice = () => {
    alert("Fitur cetak invoice akan segera hadir!");
  };

  const copyTrackingNumber = () => {
    if (!order?.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#A3AF87] mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#303646] mb-2">
            Pesanan Tidak Ditemukan
          </h2>
          <p className="text-gray-500 mb-6">
            Pesanan dengan ID tersebut tidak ditemukan dalam sistem.
          </p>
          <button
            onClick={() => router.push("/farmer/orders")}
            className="px-6 py-3 bg-[#A3AF87] text-white rounded-xl font-bold hover:bg-[#8a9a6e] transition-colors"
          >
            Kembali ke Daftar Pesanan
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status];
  const shippingConfig = shippingTypeConfig[order.shippingType];
  const StatusIcon = currentStatus.icon;
  const ShippingIcon = shippingConfig?.icon || Package;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-8 pt-4 px-4 md:px-6 lg:px-0"
    >
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 md:p-2.5 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-[#303646]" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <h1 className="text-lg md:text-2xl font-bold text-[#303646] poppins-bold">
                Detail Pesanan
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentStatus.color}`}
              >
                {currentStatus.label}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              {order.orderId} • {order.date}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="flex items-center gap-2 font-bold text-[#303646] mb-5">
            <User className="h-5 w-5 text-[#A3AF87]" />
            Informasi Customer
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-bold text-[#303646]">{order.customer.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {order.customer.phone}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Alamat Pengiriman</p>
              <p className="font-semibold text-[#303646] text-sm">
                {order.shippingAddress.recipientName}
              </p>
              <p className="text-sm text-[#303646] mt-1">
                {order.shippingAddress.address}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                {order.shippingAddress.postalCode}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${shippingConfig?.bgColor} ${shippingConfig?.textColor}`}
              >
                <ShippingIcon className="h-4 w-4" />
                {shippingConfig?.label}
                {order.expeditionName && ` (${order.expeditionName})`}
              </span>
            </div>
          </div>
          <button
            onClick={handleWhatsApp}
            className="w-full mt-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Hubungi via WhatsApp
          </button>
        </div>

        {/* Products */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="flex items-center gap-2 font-bold text-[#303646] mb-5">
            <Package className="h-5 w-5 text-[#A3AF87]" />
            Daftar Produk ({order.totalItems} item)
          </h3>
          <div className="space-y-3">
            {order.products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-semibold text-[#303646]">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.variant} • {product.weight}g
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#303646]">
                    {product.quantity}x
                  </p>
                  <p className="text-sm text-gray-500">
                    Rp{" "}
                    {(product.price * product.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="flex items-center gap-2 font-bold text-[#303646] mb-5">
            <Banknote className="h-5 w-5 text-[#A3AF87]" />
            Ringkasan Finansial
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">
                Rp {order.subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ongkir</span>
              <span className="font-semibold">
                Rp {order.shippingCost.toLocaleString("id-ID")}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Diskon</span>
                <span className="font-semibold text-red-600">
                  - Rp {order.discount.toLocaleString("id-ID")}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t">
              <span className="font-bold text-[#303646]">Total</span>
              <span className="text-xl font-bold text-[#303646]">
                Rp {order.totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gradient-to-br from-[#A3AF87]/10 to-[#FDF8D4] rounded-xl">
            <p className="text-xs text-gray-500 mb-1">
              Pendapatan Bersih Petani
            </p>
            <p className="text-2xl font-bold text-[#303646]">
              Rp {order.netEarnings.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="flex items-center gap-2 font-bold text-[#303646] mb-5">
            <Clock className="h-5 w-5 text-[#A3AF87]" />
            Riwayat Status
          </h3>
          <div className="space-y-3">
            {order.statusHistory
              .slice()
              .reverse()
              .map((history, idx) => {
                const config = statusConfig[history.status as OrderStatus];
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        config?.iconBg || "bg-gray-100"
                      }`}
                    >
                      {config?.icon && (
                        <config.icon
                          className={`h-4 w-4 ${config.iconColor}`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#303646]">
                        {config?.label || history.status}
                      </p>
                      {history.note && (
                        <p className="text-xs text-gray-500">{history.note}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(history.date).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
