"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Truck,
  MapPin,
  Store,
  Save,
  FileText,
} from "lucide-react";
import { getFarmerOrderDetail, updateOrderStatusByFarmer } from "@/lib/api/orders.actions";
import type { Order } from "@/lib/api/orders.actions";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";

// ============================================
// TYPES
// ============================================
type OrderStatus = "pending" | "paid" | "confirmed" | "processing" | "ready_pickup" | "shipped" | "delivered" | "completed" | "cancelled";
type ShippingType = "ecomaggie-delivery" | "self-pickup" | "expedition";

interface TrackingData {
  driverName?: string;
  driverWhatsapp?: string;
  departureTime?: string;
}

interface ResiData {
  waybillId: string;
  courierCode: string;
}

// ============================================
// COURIER OPTIONS
// ============================================
const COURIER_OPTIONS = [
  { value: "jne", label: "JNE" },
  { value: "jnt", label: "J&T Express" },
  { value: "sicepat", label: "SiCepat" },
  { value: "anteraja", label: "AnterAja" },
  { value: "ninja", label: "Ninja Xpress" },
  { value: "id_express", label: "ID Express" },
];

// ============================================
// STATUS CONFIG
// ============================================
const statusConfig = {
  pending: { label: "Menunggu Pembayaran", color: "bg-amber-50 text-amber-700 border-amber-200", dotColor: "bg-amber-500" },
  paid: { label: "Dibayar", color: "bg-blue-50 text-blue-700 border-blue-200", dotColor: "bg-blue-500" },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-50 text-blue-700 border-blue-200", dotColor: "bg-blue-500" },
  processing: { label: "Dikemas", color: "bg-purple-50 text-purple-700 border-purple-200", dotColor: "bg-purple-500" },
  ready_pickup: { label: "Siap Diambil", color: "bg-orange-50 text-orange-700 border-orange-200", dotColor: "bg-orange-500" },
  shipped: { label: "Dikirim", color: "bg-[#A3AF87]/20 text-[#5a6c5b] border-[#A3AF87]", dotColor: "bg-[#A3AF87]" },
  delivered: { label: "Terkirim", color: "bg-teal-50 text-teal-700 border-teal-200", dotColor: "bg-teal-500" },
  completed: { label: "Selesai", color: "bg-green-50 text-green-700 border-green-200", dotColor: "bg-green-500" },
  cancelled: { label: "Dibatalkan", color: "bg-red-50 text-red-700 border-red-200", dotColor: "bg-red-500" },
};

// ============================================
// SHIPPING TYPE DETECTION
// ============================================
function detectShippingType(shippingMethod: string | null): ShippingType {
  if (!shippingMethod) return "expedition";
  const method = shippingMethod.toLowerCase();
  if (method.includes("ecomaggie") || method.includes("delivery") || method.includes("motor")) return "ecomaggie-delivery";
  if (method.includes("pickup") || method.includes("ambil")) return "self-pickup";
  return "expedition";
}

export default function FarmerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { toast, success, error: showError, hideToast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shippingType, setShippingType] = useState<ShippingType>("expedition");

  // Form states
  const [trackingData, setTrackingData] = useState<TrackingData>({});
  const [resiData, setResiData] = useState<ResiData>({ waybillId: "", courierCode: "" });
  const [internalNotes, setInternalNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadOrderData();
  }, [resolvedParams.id]);

  const loadOrderData = async () => {
    setIsLoading(true);
    const result = await getFarmerOrderDetail(resolvedParams.id);
    if (result.success && result.data) {
      setOrder(result.data);
      const type = detectShippingType(result.data.shipping_method);
      setShippingType(type);
      setResiData({
        waybillId: result.data.shipping_tracking_number || "",
        courierCode: result.data.shipping_courier || "",
      });
      setInternalNotes(result.data.notes || "");
    }
    setIsLoading(false);
  };

  const validateEcomaggieForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!trackingData.driverName?.trim()) newErrors.driverName = "Nama driver wajib diisi";
    if (!trackingData.driverWhatsapp?.trim()) {
      newErrors.driverWhatsapp = "Nomor WhatsApp wajib diisi";
    } else if (!/^08\d{8,11}$/.test(trackingData.driverWhatsapp)) {
      newErrors.driverWhatsapp = "Format: 08xxxxxxxxxx";
    }
    if (!trackingData.departureTime) newErrors.departureTime = "Waktu keberangkatan wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResiForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!resiData.waybillId.trim()) newErrors.waybillId = "Nomor resi wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEcomaggieTracking = async () => {
    if (!validateEcomaggieForm() || !order) return;
    setIsUpdating(true);
    setErrors({});

    try {
      const result = await updateOrderStatusByFarmer(order.order_id, "shipped", {
        driverName: trackingData.driverName,
        driverPhone: trackingData.driverWhatsapp,
        departureTime: trackingData.departureTime,
      });

      if (result.success) {
        success("Berhasil!", "Pesanan berhasil dikirim! Driver sedang dalam perjalanan.");
        setTimeout(() => loadOrderData(), 2000);
      } else {
        showError("Gagal", result.message || "Gagal menyimpan data pengiriman");
      }
    } catch (err) {
      console.error("Error saving delivery tracking:", err);
      showError("Error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputResi = async () => {
    if (!validateResiForm() || !order) return;
    setIsUpdating(true);
    setErrors({});

    try {
      const response = await fetch("/api/shipping/update-waybill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: order.id,
          waybill_id: resiData.waybillId,
          courier_code: resiData.courierCode,
        }),
      });

      const result = await response.json();
      if (result.success) {
        success("Berhasil!", "Resi berhasil diinput! Status order telah diupdate ke 'Dikirim'.");
        setTimeout(() => loadOrderData(), 2000);
      } else {
        showError("Gagal", result.message || "Gagal menyimpan resi");
      }
    } catch (err) {
      console.error("Error inputting resi:", err);
      showError("Error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;
    setIsUpdating(true);
    setErrors({});

    try {
      const result = await updateOrderStatusByFarmer(order.order_id, newStatus);
      if (result.success) {
        success("Berhasil!", result.message || "Status berhasil diupdate!");
        setTimeout(() => loadOrderData(), 2000);
      } else {
        showError("Gagal", result.message || "Gagal mengupdate status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showError("Error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!order) return;
    setIsUpdating(true);
    success("Tersimpan!", "Catatan internal berhasil disimpan");
    setIsUpdating(false);
  };

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="flex items-start justify-between">
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-36"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-4 space-y-4 lg:space-y-6">
              {/* Customer Card Skeleton */}
              <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6 animate-pulse">
                <div className="h-5 bg-gray-300 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-5 bg-gray-300 rounded w-40"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-5 bg-gray-300 rounded w-32"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mt-1"></div>
                  </div>
                </div>
              </div>

              {/* Order Summary Skeleton */}
              <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6 animate-pulse">
                <div className="h-5 bg-gray-300 rounded w-40 mb-4"></div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-20 mb-2"></div>
                    {[1, 2].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-gray-300">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between mb-2">
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t-2 border-gray-400">
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-gray-300 rounded w-16"></div>
                      <div className="h-6 bg-gray-300 rounded w-28"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Method Skeleton */}
              <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6 animate-pulse">
                <div className="h-5 bg-gray-300 rounded w-36 mb-3"></div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-300">
                  <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-8 space-y-4 lg:space-y-6">
              {/* Action Form Skeleton */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="space-y-6">
                  <div className="p-5 bg-gray-50 rounded-2xl">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-3"></div>
                    <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
                  </div>
                  <div className="h-14 bg-gray-200 rounded-xl w-full"></div>
                </div>
              </div>

              {/* Internal Notes Skeleton */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-36 mb-4"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
                  <div className="h-24 bg-gray-200 rounded-xl w-full mb-4"></div>
                  <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#303646] mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Pesanan yang Anda cari tidak ditemukan</p>
          <Link
            href="/farmer/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3AF87] text-white rounded-xl font-semibold hover:bg-[#95a17a] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const ShippingIcon = shippingType === "ecomaggie-delivery" ? Bike : shippingType === "self-pickup" ? Store : Truck;
  const isAlreadyShipped = ["shipped", "delivered", "completed"].includes(order.status);

  return (
    <>
      {/* Toast Notification */}
      <Toast type={toast.type} title={toast.title} message={toast.message} isVisible={toast.isVisible} onClose={hideToast} />
      
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
            <Link
              href="/farmer/orders"
              className="inline-flex items-center gap-2 text-sm text-[#5a6c5b] hover:text-[#4a5c4b] mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Daftar Pesanan
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#303646] mb-2">Detail Pesanan</h1>
                <p className="text-gray-600">Order ID: {order.order_id}</p>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${status.color}`}>
                <div className={`w-2 h-2 rounded-full ${status.dotColor} animate-pulse`}></div>
                <span className="text-sm font-semibold">{status.label}</span>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Column - Order Info (Read Only) */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-4 space-y-4 lg:space-y-6"
            >
              {/* Customer Card */}
              <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-400" />
                  Info Customer
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Nama</p>
                    <p className="font-semibold text-[#303646]">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${order.customer_phone}`} className="font-semibold text-[#303646] hover:text-[#A3AF87]">
                        {order.customer_phone}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Alamat</p>
                    <p className="text-sm text-[#303646]">{order.customer_address}</p>
                  </div>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-400" />
                  Ringkasan Pesanan
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Produk</p>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.quantity}x {item.product_name}</span>
                        <span className="font-semibold text-[#303646]">Rp {item.subtotal.toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold text-[#303646]">Rp {order.subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Ongkir</span>
                      <span className="font-semibold text-[#303646]">Rp {order.shipping_cost.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Biaya Layanan</span>
                      <span className="font-semibold text-[#303646]">Rp {order.service_fee.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#303646]">Total</span>
                      <span className="text-xl font-bold text-[#303646]">Rp {order.total_amount.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  {order.paid_at && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-semibold text-green-700">Sudah Dibayar</p>
                        </div>
                        <p className="text-xs text-gray-600">
                          {new Date(order.paid_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Method Card */}
              <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="font-bold text-[#303646] mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  Metode Pengiriman
                </h3>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-[#A3AF87]/10 rounded-lg flex items-center justify-center">
                    <ShippingIcon className="h-5 w-5 text-[#5a6c5b]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#303646] text-sm">{order.shipping_method || "Ekspedisi"}</p>
                    <p className="text-xs text-gray-500">
                      {shippingType === "expedition" ? "Input resi manual" : shippingType === "ecomaggie-delivery" ? "Delivery motor" : "Ambil di toko"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Action Forms */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-8 space-y-4 lg:space-y-6"
            >
              {/* Expedition: Input Resi Form */}
              {shippingType === "expedition" && !isAlreadyShipped && (
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                  <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-[#A3AF87]" />
                    Input Nomor Resi
                  </h3>

                  <div className="space-y-6">
                    {/* Waybill Input - Enhanced */}
                    <div className="p-5 bg-gradient-to-br from-[#A3AF87]/5 to-blue-50/50 rounded-2xl border-2 border-[#A3AF87]/20">
                      <label className="block text-base font-bold text-[#303646] mb-3 flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#A3AF87]" />
                        Nomor Resi / Waybill ID <span className="text-red-500">*</span>
                      </label>
                      
                      <div className="relative">
                        <input
                          type="text"
                          value={resiData.waybillId}
                          onChange={(e) => setResiData({ ...resiData, waybillId: e.target.value })}
                          placeholder="Contoh: JT123456789"
                          disabled={isUpdating}
                          className={`w-full px-6 py-4 text-lg font-semibold rounded-xl border-2 focus:outline-none transition-colors text-[#303646] placeholder:text-gray-300 bg-white disabled:bg-gray-50 ${
                            errors.waybillId ? "border-red-300 focus:border-red-400" : "border-[#A3AF87]/30 focus:border-[#A3AF87]"
                          }`}
                        />
                      </div>
                      
                      {errors.waybillId && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.waybillId}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Masukkan nomor resi yang Anda terima dari agen kurir
                      </p>
                    </div>

                    {/* Courier Display */}
                    <div>
                      <label className="block text-sm font-semibold text-[#303646] mb-2">
                        Kurir Ekspedisi <span className="text-xs text-gray-500 font-normal">(dipilih oleh customer)</span>
                      </label>
                      <div className="relative">
                        <Truck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A3AF87] pointer-events-none" />
                        <select
                          value={resiData.courierCode}
                          disabled={true}
                          className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-[#303646] font-semibold cursor-not-allowed"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23A3AF87' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: "right 0.5rem center",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "1.5em 1.5em",
                          }}
                        >
                          <option value="">Pilih Kurir</option>
                          {COURIER_OPTIONS.map((courier) => (
                            <option key={courier.value} value={courier.value}>{courier.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleInputResi}
                      disabled={isUpdating}
                      className="w-full px-6 py-4 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] hover:from-[#95a17a] hover:to-[#8a9471] text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Simpan Resi & Kirim Paket
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Expedition: Already Shipped */}
              {shippingType === "expedition" && isAlreadyShipped && (
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                  <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-[#A3AF87]" />
                    Informasi Pengiriman
                  </h3>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="font-semibold text-green-700">Paket Sudah Dikirim</p>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div>
                        <p className="text-xs text-gray-600">Nomor Resi</p>
                        <p className="font-bold text-[#303646] text-lg">{order.shipping_tracking_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Kurir</p>
                        <p className="font-semibold text-[#303646]">
                          {COURIER_OPTIONS.find((c) => c.value === order.shipping_courier)?.label || order.shipping_courier?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {order.tracking_history && order.tracking_history.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[#303646] mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#A3AF87]" />
                        Tracking History
                      </h4>
                      <div className="space-y-3">
                        {order.tracking_history.map((history) => (
                          <div key={history.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-[#A3AF87]/20 flex items-center justify-center flex-shrink-0">
                              <Package className="h-4 w-4 text-[#5a6c5b]" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-[#303646] text-sm">{history.status}</p>
                              <p className="text-sm text-gray-600">{history.note}</p>
                              {history.location && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {history.location}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(history.tracked_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ecomaggie Delivery: Driver Info Form */}
              {shippingType === "ecomaggie-delivery" && !isAlreadyShipped && (
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                  <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                    <Bike className="h-5 w-5 text-[#A3AF87]" />
                    Informasi Driver
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#303646] mb-2">
                        Nama Driver <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={trackingData.driverName || ""}
                        onChange={(e) => setTrackingData({ ...trackingData, driverName: e.target.value })}
                        placeholder="Masukkan nama driver"
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors text-[#303646] placeholder:text-gray-400 ${
                          errors.driverName ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-[#A3AF87]"
                        }`}
                      />
                      {errors.driverName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.driverName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#303646] mb-2">
                        Nomor WhatsApp Driver <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={trackingData.driverWhatsapp || ""}
                        onChange={(e) => setTrackingData({ ...trackingData, driverWhatsapp: e.target.value })}
                        placeholder="08123456789"
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors text-[#303646] placeholder:text-gray-400 ${
                          errors.driverWhatsapp ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-[#A3AF87]"
                        }`}
                      />
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
                          onChange={(e) => setTrackingData({ ...trackingData, departureTime: e.target.value })}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-colors text-[#303646] ${
                            errors.departureTime ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-[#A3AF87]"
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
                      onClick={handleSaveEcomaggieTracking}
                      disabled={isUpdating}
                      className="w-full px-6 py-4 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] hover:from-[#95a17a] hover:to-[#8a9471] text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Kirim Pesanan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Ecomaggie Delivery: Already Shipped */}
              {shippingType === "ecomaggie-delivery" && isAlreadyShipped && (
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                  <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                    <Bike className="h-5 w-5 text-[#A3AF87]" />
                    Informasi Pengiriman
                  </h3>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="font-semibold text-green-700">Pesanan Sedang Diantar</p>
                    </div>
                    {order.notes && <p className="text-sm text-gray-600 mt-2">{order.notes}</p>}
                  </div>

                  {order.status === "shipped" && (
                    <button
                      onClick={() => handleStatusUpdate("delivered")}
                      disabled={isUpdating}
                      className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 mb-3"
                    >
                      {isUpdating ? "Memproses..." : "Tandai Sudah Sampai"}
                    </button>
                  )}
                </div>
              )}

              {/* Self Pickup */}
              {shippingType === "self-pickup" && (
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                  <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                    <Store className="h-5 w-5 text-[#A3AF87]" />
                    Ambil di Toko
                  </h3>

                  {order.status === "ready_pickup" ? (
                    <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h4 className="font-bold text-[#303646] mb-2">Pesanan Siap Diambil</h4>
                      <p className="text-sm text-gray-600 mb-4">Customer sudah diberitahu bahwa pesanan siap untuk diambil di toko.</p>
                      <button
                        onClick={() => handleStatusUpdate("completed")}
                        disabled={isUpdating}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? "Memproses..." : "Tandai Sudah Diambil (Selesai)"}
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl text-center">
                      <Store className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                      <h4 className="font-bold text-[#303646] mb-2">Pesanan Ambil di Toko</h4>
                      <p className="text-sm text-gray-600 mb-4">Customer akan mengambil pesanan langsung di toko. Pastikan pesanan sudah siap.</p>
                      <button
                        onClick={() => handleStatusUpdate("ready_pickup")}
                        disabled={isUpdating}
                        className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? "Memproses..." : "Tandai Siap Diambil"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Internal Notes */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#A3AF87]" />
                  Catatan Internal
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-[#303646] mb-2">
                    Catatan Internal (Opsional)
                  </label>
                  <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Tambahkan catatan internal (tidak terlihat oleh customer)"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#A3AF87] focus:outline-none transition-colors resize-none text-[#303646] placeholder:text-gray-400"
                  />
                </div>

                <button
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="w-full mt-4 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  {isUpdating ? "Menyimpan..." : "Simpan Catatan"}
                </button>
              </div>

              {/* Status Change Actions */}
              {!isAlreadyShipped && order.status !== "cancelled" && order.status !== "ready_pickup" && shippingType !== "self-pickup" && (
                <div className="bg-gradient-to-br from-[#A3AF87]/10 to-[#FDF8D4]/30 rounded-2xl border-2 border-[#A3AF87]/20 p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-[#A3AF87] mt-0.5" />
                    <div>
                      <h3 className="font-bold text-[#303646] mb-1">Info Penting</h3>
                      <p className="text-sm text-gray-600">
                        {shippingType === "expedition" 
                          ? "Pastikan nomor resi sudah benar sebelum menyimpan. Setelah disimpan, status pesanan akan berubah menjadi 'Dikirim'."
                          : "Pastikan data driver sudah benar. Customer akan menerima notifikasi dengan info driver."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Completed State */}
              {(order.status === "completed" || order.status === "cancelled") && (
                <div className="bg-[#A3AF87]/10 rounded-2xl border-2 border-[#A3AF87] p-8 text-center">
                  <CheckCircle2 className="h-16 w-16 text-[#A3AF87] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#303646] mb-2">
                    {order.status === "completed" ? "Pesanan Selesai" : "Pesanan Dibatalkan"}
                  </h3>
                  <p className="text-gray-600">
                    {order.status === "completed" ? "Semua tahapan pesanan telah selesai" : "Pesanan ini telah dibatalkan"}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
