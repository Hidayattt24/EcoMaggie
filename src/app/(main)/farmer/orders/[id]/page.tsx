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
import CustomDateTimePicker from "@/components/farmer/orders/CustomDateTimePicker";

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
  pending: { label: "Menunggu Pembayaran", color: "bg-[#fdf8d4] text-[#435664] border-[#a3af87]/30", dotColor: "bg-[#a3af87]" },
  paid: { label: "Dibayar", color: "bg-[#fdf8d4] text-[#435664] border-[#a3af87]/50", dotColor: "bg-[#a3af87]" },
  confirmed: { label: "Dikonfirmasi", color: "bg-[#fdf8d4] text-[#435664] border-[#a3af87]/50", dotColor: "bg-[#a3af87]" },
  processing: { label: "Dikemas", color: "bg-[#a3af87]/20 text-[#435664] border-[#a3af87]", dotColor: "bg-[#a3af87]" },
  ready_pickup: { label: "Siap Diambil", color: "bg-[#a3af87]/30 text-[#303646] border-[#a3af87]", dotColor: "bg-[#435664]" },
  shipped: { label: "Dikirim", color: "bg-[#a3af87]/20 text-[#435664] border-[#a3af87]", dotColor: "bg-[#a3af87]" },
  delivered: { label: "Terkirim", color: "bg-[#a3af87]/30 text-[#303646] border-[#a3af87]", dotColor: "bg-[#435664]" },
  completed: { label: "Selesai", color: "bg-[#a3af87]/40 text-[#303646] border-[#a3af87]", dotColor: "bg-[#435664]" },
  cancelled: { label: "Dibatalkan", color: "bg-gray-100 text-gray-700 border-gray-300", dotColor: "bg-gray-500" },
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#a3af87] text-white rounded-xl font-semibold hover:bg-[#435664] transition-colors"
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
              <div className="bg-[#fdf8d4]/30 rounded-2xl border-2 border-[#a3af87]/30 p-6">
                <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#a3af87]" />
                  Info Customer
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#435664]">Nama</p>
                    <p className="font-semibold text-[#303646]">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#435664]">Telepon</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#a3af87]" />
                      <a href={`tel:${order.customer_phone}`} className="font-semibold text-[#303646] hover:text-[#a3af87]">
                        {order.customer_phone}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-[#435664]">Alamat</p>
                    <p className="text-sm text-[#303646]">{order.customer_address}</p>
                  </div>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-[#fdf8d4]/30 rounded-2xl border-2 border-[#a3af87]/30 p-6">
                <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#a3af87]" />
                  Ringkasan Pesanan
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs text-[#435664] font-semibold uppercase">Produk</p>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-[#435664]">{item.quantity}x {item.product_name}</span>
                        <span className="font-semibold text-[#303646]">Rp {item.subtotal.toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#a3af87]/30">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#435664]">Subtotal</span>
                      <span className="font-semibold text-[#303646]">Rp {order.subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#435664]">Ongkir</span>
                      <span className="font-semibold text-[#303646]">Rp {order.shipping_cost.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#435664]">Biaya Layanan</span>
                      <span className="font-semibold text-[#303646]">Rp {order.service_fee.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-[#a3af87]">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#303646]">Total</span>
                      <span className="text-xl font-bold text-[#303646]">Rp {order.total_amount.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  {order.paid_at && (
                    <div className="pt-3 border-t border-[#a3af87]/30">
                      <div className="bg-[#a3af87]/20 border border-[#a3af87] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="h-4 w-4 text-[#435664]" />
                          <p className="text-sm font-semibold text-[#435664]">Sudah Dibayar</p>
                        </div>
                        <p className="text-xs text-[#435664]">
                          {new Date(order.paid_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Method Card */}
              <div className="bg-[#fdf8d4]/30 rounded-2xl border-2 border-[#a3af87]/30 p-6">
                <h3 className="font-bold text-[#303646] mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#a3af87]" />
                  Metode Pengiriman
                </h3>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#a3af87]/30">
                  <div className="w-10 h-10 bg-[#a3af87]/10 rounded-lg flex items-center justify-center">
                    <ShippingIcon className="h-5 w-5 text-[#435664]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#303646] text-sm">{order.shipping_method || "Ekspedisi"}</p>
                    <p className="text-xs text-[#435664]">
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
                <div className="bg-[#fdf8d4]/20 rounded-2xl border-2 border-[#a3af87]/30 p-6">
                  <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-[#a3af87]" />
                    Input Nomor Resi
                  </h3>

                  <div className="space-y-6">
                    {/* Waybill Input - Enhanced */}
                    <div className="p-5 bg-[#fdf8d4] rounded-2xl border-2 border-[#a3af87]/20">
                      <label className="block text-base font-bold text-[#303646] mb-3 flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#a3af87]" />
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
                            errors.waybillId ? "border-red-300 focus:border-red-400" : "border-[#a3af87]/30 focus:border-[#a3af87]"
                          }`}
                        />
                      </div>
                      
                      {errors.waybillId && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.waybillId}
                        </p>
                      )}
                      
                      <p className="text-xs text-[#435664] mt-2">
                        Masukkan nomor resi yang Anda terima dari agen kurir
                      </p>
                    </div>

                    {/* Courier Display - Read Only */}
                    <div>
                      <label className="block text-sm font-semibold text-[#303646] mb-2">
                        Kurir Ekspedisi <span className="text-xs text-[#435664] font-normal">(dipilih oleh customer)</span>
                      </label>
                      <div className="relative">
                        <Truck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#a3af87] pointer-events-none" />
                        <div className="w-full pl-12 pr-4 py-3.5 bg-[#fdf8d4] border-2 border-[#a3af87]/30 rounded-xl text-[#303646] font-semibold">
                          {resiData.courierCode ? 
                            COURIER_OPTIONS.find(c => c.value === resiData.courierCode)?.label || resiData.courierCode.toUpperCase()
                            : "Belum dipilih"}
                        </div>
                      </div>
                      <p className="text-xs text-[#435664] mt-2">
                        Kurir ini dipilih oleh customer saat checkout
                      </p>
                    </div>

                    <button
                      onClick={handleInputResi}
                      disabled={isUpdating}
                      className="w-full px-6 py-4 bg-[#a3af87] hover:bg-[#435664] text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
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
                <div className="bg-[#fdf8d4]/20 rounded-2xl border-2 border-[#a3af87]/30 p-6">
                  <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-[#a3af87]" />
                    Informasi Pengiriman
                  </h3>

                  <div className="p-4 bg-[#a3af87]/20 border border-[#a3af87] rounded-xl mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-[#435664]" />
                      <p className="font-semibold text-[#435664]">Paket Sudah Dikirim</p>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div>
                        <p className="text-xs text-[#435664]">Nomor Resi</p>
                        <p className="font-bold text-[#303646] text-lg">{order.shipping_tracking_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#435664]">Kurir</p>
                        <p className="font-semibold text-[#303646]">
                          {COURIER_OPTIONS.find((c) => c.value === order.shipping_courier)?.label || order.shipping_courier?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {order.tracking_history && order.tracking_history.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-[#303646] mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#a3af87]" />
                        Tracking History
                      </h4>
                      <div className="space-y-3">
                        {order.tracking_history.map((history) => (
                          <div key={history.id} className="flex items-start gap-3 p-3 bg-[#fdf8d4]/50 rounded-xl border border-[#a3af87]/20">
                            <div className="w-8 h-8 rounded-full bg-[#a3af87]/20 flex items-center justify-center flex-shrink-0">
                              <Package className="h-4 w-4 text-[#435664]" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-[#303646] text-sm">{history.status}</p>
                              <p className="text-sm text-[#435664]">{history.note}</p>
                              {history.location && (
                                <p className="text-xs text-[#435664] flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {history.location}
                                </p>
                              )}
                              <p className="text-xs text-[#435664] mt-1">
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
                <div className="bg-[#fdf8d4]/20 rounded-2xl border-2 border-[#a3af87]/30 p-6">
                  <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                    <Bike className="h-5 w-5 text-[#a3af87]" />
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
                          errors.driverName ? "border-red-300 focus:border-red-400 bg-red-50" : "border-[#a3af87]/30 focus:border-[#a3af87] bg-white"
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
                          errors.driverWhatsapp ? "border-red-300 focus:border-red-400 bg-red-50" : "border-[#a3af87]/30 focus:border-[#a3af87] bg-white"
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
                      <CustomDateTimePicker
                        value={trackingData.departureTime || ""}
                        onChange={(value) => setTrackingData({ ...trackingData, departureTime: value })}
                        error={errors.departureTime}
                      />
                      {errors.departureTime && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.departureTime}
                        </p>
                      )}
                      <p className="text-xs text-[#435664] mt-2">
                        Klik untuk memilih tanggal dan waktu keberangkatan driver
                      </p>
                    </div>

                    <button
                      onClick={handleSaveEcomaggieTracking}
                      disabled={isUpdating}
                      className="w-full px-6 py-4 bg-[#a3af87] hover:bg-[#435664] text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
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
                <div className="bg-[#fdf8d4]/20 rounded-2xl border-2 border-[#a3af87]/30 p-6">
                  <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                    <Bike className="h-5 w-5 text-[#a3af87]" />
                    Informasi Pengiriman
                  </h3>

                  <div className="p-4 bg-[#a3af87]/20 border border-[#a3af87] rounded-xl mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-[#435664]" />
                      <p className="font-semibold text-[#435664]">Pesanan Sedang Diantar</p>
                    </div>
                    {order.notes && <p className="text-sm text-[#435664] mt-2">{order.notes}</p>}
                  </div>

                  {order.status === "shipped" && (
                    <button
                      onClick={() => handleStatusUpdate("delivered")}
                      disabled={isUpdating}
                      className="w-full py-3 bg-[#a3af87] text-white rounded-xl font-bold hover:bg-[#435664] transition-colors disabled:opacity-50 mb-3"
                    >
                      {isUpdating ? "Memproses..." : "Tandai Sudah Sampai"}
                    </button>
                  )}
                </div>
              )}

              {/* Self Pickup */}
              {shippingType === "self-pickup" && (
                <div className="bg-[#fdf8d4]/20 rounded-2xl border-2 border-[#a3af87]/30 p-6">
                  <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                    <Store className="h-5 w-5 text-[#a3af87]" />
                    Ambil di Toko
                  </h3>

                  {order.status === "ready_pickup" ? (
                    <div className="p-6 bg-[#a3af87]/20 border border-[#a3af87] rounded-xl text-center">
                      <CheckCircle2 className="h-12 w-12 text-[#435664] mx-auto mb-3" />
                      <h4 className="font-bold text-[#303646] mb-2">Pesanan Siap Diambil</h4>
                      <p className="text-sm text-[#435664] mb-4">Customer sudah diberitahu bahwa pesanan siap untuk diambil di toko.</p>
                      <button
                        onClick={() => handleStatusUpdate("completed")}
                        disabled={isUpdating}
                        className="px-6 py-3 bg-[#a3af87] text-white rounded-xl font-semibold hover:bg-[#435664] transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? "Memproses..." : "Tandai Sudah Diambil (Selesai)"}
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 bg-[#fdf8d4] border border-[#a3af87] rounded-xl text-center">
                      <Store className="h-12 w-12 text-[#a3af87] mx-auto mb-3" />
                      <h4 className="font-bold text-[#303646] mb-2">Pesanan Ambil di Toko</h4>
                      <p className="text-sm text-[#435664] mb-4">Customer akan mengambil pesanan langsung di toko. Pastikan pesanan sudah siap.</p>
                      <button
                        onClick={() => handleStatusUpdate("ready_pickup")}
                        disabled={isUpdating}
                        className="px-6 py-3 bg-[#a3af87] text-white rounded-xl font-semibold hover:bg-[#435664] transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? "Memproses..." : "Tandai Siap Diambil"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Internal Notes */}
              <div className="bg-[#fdf8d4]/20 rounded-2xl border-2 border-[#a3af87]/30 p-6">
                <h3 className="font-bold text-[#303646] mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#a3af87]" />
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#a3af87]/30 focus:border-[#a3af87] focus:outline-none transition-colors resize-none text-[#303646] placeholder:text-gray-400 bg-white"
                  />
                </div>

                <button
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="w-full mt-4 px-6 py-3 bg-[#a3af87]/20 hover:bg-[#a3af87]/30 text-[#303646] rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-[#a3af87]/30"
                >
                  <Save className="h-5 w-5" />
                  {isUpdating ? "Menyimpan..." : "Simpan Catatan"}
                </button>
              </div>

              {/* Status Change Actions */}
              {!isAlreadyShipped && order.status !== "cancelled" && order.status !== "ready_pickup" && shippingType !== "self-pickup" && (
                <div className="bg-gradient-to-br from-[#a3af87]/10 to-[#fdf8d4]/30 rounded-2xl border-2 border-[#a3af87]/20 p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-[#a3af87] mt-0.5" />
                    <div>
                      <h3 className="font-bold text-[#303646] mb-1">Info Penting</h3>
                      <p className="text-sm text-[#435664]">
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
                <div className="bg-[#a3af87]/10 rounded-2xl border-2 border-[#a3af87] p-8 text-center">
                  <CheckCircle2 className="h-16 w-16 text-[#a3af87] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#303646] mb-2">
                    {order.status === "completed" ? "Pesanan Selesai" : "Pesanan Dibatalkan"}
                  </h3>
                  <p className="text-[#435664]">
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
