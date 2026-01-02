"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Bike,
  User,
  Phone,
  Clock,
  MapPin,
} from "lucide-react";

// ============================================
// TYPES
// ============================================
type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

type ShippingType = "ecomaggie-delivery" | "self-pickup" | "expedition";

interface TrackingData {
  driverName?: string;
  driverWhatsapp?: string;
  departureTime?: string;
}

interface Order {
  id: string;
  orderId: string;
  status: OrderStatus;
  shippingType: ShippingType;
  trackingData?: TrackingData;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  totalPrice: number;
  products: { name: string; quantity: number }[];
}

// Mock data - replace with API
const mockOrders: Record<string, Order> = {
  "ORD-2026-01-001": {
    id: "1",
    orderId: "ORD-2026-01-001",
    status: "confirmed",
    shippingType: "ecomaggie-delivery",
    customer: {
      name: "Budi Santoso",
      phone: "081234567890",
      address: "Jl. T. Nyak Arief No. 123, Kopelma Darussalam, Banda Aceh",
    },
    totalPrice: 196000,
    products: [
      { name: "Maggot BSF Premium 500gr", quantity: 2 },
      { name: "Maggot BSF Organik 1kg", quantity: 1 },
    ],
  },
};

// ============================================
// STATUS CONFIG
// ============================================
const statusSteps = [
  { status: "confirmed", label: "Dikonfirmasi", icon: CheckCircle2 },
  { status: "processing", label: "Mulai Packing", icon: Package },
  { status: "shipped", label: "Kirim Pesanan", icon: Bike },
  { status: "delivered", label: "Konfirmasi Terkirim", icon: CheckCircle2 },
  { status: "completed", label: "Selesai", icon: CheckCircle2 },
];

export default function OrderActionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states
  const [trackingData, setTrackingData] = useState<TrackingData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const data = mockOrders[resolvedParams.id];
      if (data) {
        setOrder(data);
        if (data.trackingData) {
          setTrackingData(data.trackingData);
        }
      }
      setIsLoading(false);
    }, 500);
  }, [resolvedParams.id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (order?.shippingType === "ecomaggie-delivery") {
      if (!trackingData.driverName?.trim()) {
        newErrors.driverName = "Nama driver wajib diisi";
      }
      if (!trackingData.driverWhatsapp?.trim()) {
        newErrors.driverWhatsapp = "Nomor WhatsApp wajib diisi";
      } else if (!/^08\d{8,11}$/.test(trackingData.driverWhatsapp)) {
        newErrors.driverWhatsapp = "Format: 08xxxxxxxxxx";
      }
      if (!trackingData.departureTime) {
        newErrors.departureTime = "Waktu keberangkatan wajib diisi";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTracking = async () => {
    if (!validateForm()) return;

    setIsUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (order) {
      setOrder({ ...order, trackingData });
      alert("✅ Data tracking berhasil disimpan!");
    }

    setIsUpdating(false);
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (order) {
      setOrder({ ...order, status: newStatus });

      if (newStatus === "completed") {
        alert("✅ Pesanan selesai!");
        router.push("/farmer/orders");
      }
    }

    setIsUpdating(false);
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex((step) => step.status === order.status);
  };

  const getNextAction = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < 0 || currentIndex >= statusSteps.length - 1) return null;
    return statusSteps[currentIndex + 1];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#A3AF87]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#303646] mb-2">
            Pesanan Tidak Ditemukan
          </h2>
          <button
            onClick={() => router.push("/farmer/orders")}
            className="mt-4 px-6 py-3 bg-[#A3AF87] text-white rounded-xl font-bold"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const nextAction = getNextAction();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-8"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-[#303646]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#303646] poppins-bold">
              Pusat Kendali Distribusi
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{order.orderId}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-[#A3AF87]" />
              Info Customer
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Nama</p>
                <p className="font-semibold text-[#303646]">
                  {order.customer.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Telepon</p>
                <p className="font-semibold text-[#303646]">
                  {order.customer.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Alamat</p>
                <p className="text-sm text-[#303646]">
                  {order.customer.address}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-[#303646] mb-4">Ringkasan</h3>
            <div className="space-y-2">
              {order.products.map((p, i) => (
                <p key={i} className="text-sm text-gray-600">
                  {p.quantity}x {p.name}
                </p>
              ))}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-lg font-bold text-[#303646]">
                  Rp {order.totalPrice.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-[#303646] mb-6 poppins-bold">
              Tracking Pengiriman
            </h3>

            {/* Delivery-specific form */}
            {order.shippingType === "ecomaggie-delivery" && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#303646] mb-2">
                    Nama Driver Motor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={trackingData.driverName || ""}
                      onChange={(e) =>
                        setTrackingData({
                          ...trackingData,
                          driverName: e.target.value,
                        })
                      }
                      placeholder="Contoh: Rizki Ramadhan"
                      className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-[#303646] placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${
                        errors.driverName
                          ? "border-red-300 focus:border-red-400"
                          : "border-gray-200 focus:border-[#A3AF87] focus:shadow-sm focus:shadow-[#A3AF87]/20"
                      }`}
                    />
                  </div>
                  {errors.driverName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.driverName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#303646] mb-2">
                    Nomor WhatsApp Driver{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={trackingData.driverWhatsapp || ""}
                      onChange={(e) =>
                        setTrackingData({
                          ...trackingData,
                          driverWhatsapp: e.target.value,
                        })
                      }
                      placeholder="08123456789"
                      className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-[#303646] placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${
                        errors.driverWhatsapp
                          ? "border-red-300 focus:border-red-400"
                          : "border-gray-200 focus:border-[#A3AF87] focus:shadow-sm focus:shadow-[#A3AF87]/20"
                      }`}
                    />
                  </div>
                  {errors.driverWhatsapp && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.driverWhatsapp}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#303646] mb-2">
                    Waktu Keberangkatan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type="datetime-local"
                      value={trackingData.departureTime || ""}
                      onChange={(e) =>
                        setTrackingData({
                          ...trackingData,
                          departureTime: e.target.value,
                        })
                      }
                      className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-[#303646] focus:outline-none focus:bg-white transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 ${
                        errors.departureTime
                          ? "border-red-300 focus:border-red-400"
                          : "border-gray-200 focus:border-[#A3AF87] focus:shadow-sm focus:shadow-[#A3AF87]/20"
                      }`}
                    />
                  </div>
                  {errors.departureTime && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.departureTime}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSaveTracking}
                  disabled={isUpdating}
                  className="w-full px-6 py-3 bg-[#A3AF87]/10 text-[#5a6c5b] rounded-xl font-bold hover:bg-[#A3AF87]/20 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Menyimpan..." : "Simpan Data Tracking"}
                </button>
              </div>
            )}

            {/* Status Progression */}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="font-semibold text-[#303646] mb-4">
                Progress Pengiriman
              </h4>
              <div className="space-y-3">
                {statusSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const currentIndex = getCurrentStepIndex();
                  const isComplete = index <= currentIndex;
                  const isCurrent = index === currentIndex;

                  return (
                    <div
                      key={step.status}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                        isComplete ? "bg-green-50" : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isComplete
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-500"
                        }`}
                      >
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            isComplete ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                      {isCurrent && index < statusSteps.length - 1 && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              statusSteps[index + 1].status as OrderStatus
                            )
                          }
                          disabled={isUpdating}
                          className="px-4 py-2 bg-[#A3AF87] text-white rounded-lg font-semibold text-sm hover:bg-[#8a9a6e] transition-colors disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Lanjut"
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
