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
  Truck,
  MapPin,
  Store,
} from "lucide-react";
import { getFarmerOrderDetail } from "@/lib/api/orders.actions";
import type { Order } from "@/lib/api/orders.actions";

// ============================================
// TYPES
// ============================================
type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "completed" | "cancelled";

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
// SHIPPING TYPE DETECTION
// ============================================
function detectShippingType(shippingMethod: string | null, shippingCourier: string | null): ShippingType {
  if (!shippingMethod) return "expedition";

  const method = shippingMethod.toLowerCase();

  if (method.includes("ecomaggie") || method.includes("delivery") || method.includes("motor")) {
    return "ecomaggie-delivery";
  }

  if (method.includes("pickup") || method.includes("ambil")) {
    return "self-pickup";
  }

  return "expedition";
}

export default function FarmerOrderActionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shippingType, setShippingType] = useState<ShippingType>("expedition");

  // Form states for ecomaggie-delivery
  const [trackingData, setTrackingData] = useState<TrackingData>({});

  // Form states for expedition
  const [resiData, setResiData] = useState<ResiData>({
    waybillId: "",
    courierCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadOrderData();
  }, [resolvedParams.id]);

  const loadOrderData = async () => {
    setIsLoading(true);
    const result = await getFarmerOrderDetail(resolvedParams.id);

    if (result.success && result.data) {
      setOrder(result.data);

      // Detect shipping type
      const type = detectShippingType(result.data.shipping_method, result.data.shipping_courier);
      setShippingType(type);

      // Pre-fill courier from customer's selection (always auto-select)
      // and waybill if already exists
      setResiData({
        waybillId: result.data.shipping_tracking_number || "",
        courierCode: result.data.shipping_courier || "",
      });
    } else {
      console.error("Failed to load order:", result.message);
    }

    setIsLoading(false);
  };

  const validateEcomaggieForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResiForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!resiData.waybillId.trim()) {
      newErrors.waybillId = "Nomor resi wajib diisi";
    }
    // Courier code is auto-filled from customer selection, no need to validate

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEcomaggieTracking = async () => {
    if (!validateEcomaggieForm()) return;

    setIsUpdating(true);

    // TODO: Save to database (for now just simulate)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSuccessMessage("✅ Data tracking berhasil disimpan!");
    setIsUpdating(false);

    setTimeout(() => {
      router.push(`/farmer/orders/${resolvedParams.id}`);
    }, 1500);
  };

  const handleInputResi = async () => {
    if (!validateResiForm()) return;

    if (!order) return;

    setIsUpdating(true);
    setErrors({});
    setSuccessMessage("");

    try {
      // Call API to update waybill
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
        setSuccessMessage("✅ Resi berhasil diinput! Status order telah diupdate ke 'Dikirim'.");

        // Reload order data to get updated tracking
        setTimeout(async () => {
          await loadOrderData();
          router.push(`/farmer/orders/${resolvedParams.id}`);
        }, 2000);
      } else {
        setErrors({ api: result.message || "Gagal menyimpan resi" });
      }
    } catch (error) {
      console.error("Error inputting resi:", error);
      setErrors({ api: "Terjadi kesalahan. Silakan coba lagi." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    // TODO: Implement status update
    setIsUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsUpdating(false);
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
          <h2 className="text-xl font-bold text-[#303646] mb-2">Pesanan Tidak Ditemukan</h2>
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

  const ShippingIcon = shippingType === "ecomaggie-delivery" ? Bike : shippingType === "self-pickup" ? Store : Truck;

  // Check if already shipped
  const isAlreadyShipped = order.status === "shipped" || order.status === "delivered" || order.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-8 pt-4 px-4 md:px-6 lg:px-0"
    >
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 md:p-2.5 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-[#303646]" />
          </button>
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-[#303646] poppins-bold">
              {isAlreadyShipped ? "Info Pengiriman" : "Input Resi Pengiriman"}
            </h1>
            <p className="text-gray-500 text-xs md:text-sm mt-0.5">{order.order_id}</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
        >
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 font-semibold">{successMessage}</p>
        </motion.div>
      )}

      {/* Error Message */}
      {errors.api && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{errors.api}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
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
                <p className="font-semibold text-[#303646]">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Telepon</p>
                <p className="font-semibold text-[#303646]">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Alamat</p>
                <p className="text-sm text-[#303646]">{order.customer_address}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-[#303646] mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-3">
              {/* Products */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-semibold uppercase">Produk</p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity}x {item.product_name}
                    </span>
                    <span className="font-semibold text-[#303646]">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-[#303646]">
                    Rp {order.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Shipping Cost */}
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Biaya Ongkir</span>
                  <span className="font-semibold text-[#303646]">
                    Rp {order.shipping_cost.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Service Fee */}
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Biaya Layanan</span>
                  <span className="font-semibold text-[#303646]">
                    Rp {order.service_fee.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-3 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#303646]">Total Pembayaran</span>
                  <span className="text-xl font-bold text-[#303646]">
                    Rp {order.total_amount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              {order.paid_at && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-semibold text-green-700">Sudah Dibayar</p>
                    </div>
                    <p className="text-xs text-gray-600">
                      {new Date(order.paid_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Method Badge */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-[#303646] mb-3">Metode Pengiriman</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-[#A3AF87]/10 rounded-lg flex items-center justify-center">
                <ShippingIcon className="h-5 w-5 text-[#5a6c5b]" />
              </div>
              <div>
                <p className="font-semibold text-[#303646] text-sm">{order.shipping_method || "Ekspedisi"}</p>
                <p className="text-xs text-gray-500">
                  {shippingType === "expedition"
                    ? "Input resi manual"
                    : shippingType === "ecomaggie-delivery"
                    ? "Delivery motor"
                    : "Ambil di toko"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-[#303646] mb-6 poppins-bold">
              {isAlreadyShipped ? "Informasi Pengiriman" : "Input Data Pengiriman"}
            </h3>

            {/* Expedition: Input Resi */}
            {shippingType === "expedition" && (
              <div className="space-y-4">
                {isAlreadyShipped ? (
                  /* Display existing resi info */
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
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
                            {COURIER_OPTIONS.find((c) => c.value === order.shipping_courier)?.label ||
                              order.shipping_courier?.toUpperCase()}
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
                                  {new Date(history.tracked_at).toLocaleString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => router.push(`/farmer/orders/${resolvedParams.id}`)}
                      className="w-full py-3 bg-[#A3AF87] text-white rounded-xl font-bold hover:bg-[#8a9a6e] transition-colors"
                    >
                      Lihat Detail Pesanan
                    </button>
                  </div>
                ) : (
                  /* Input form for new resi */
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#303646] mb-2">
                        Nomor Resi / Waybill ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={resiData.waybillId}
                          onChange={(e) => setResiData({ ...resiData, waybillId: e.target.value })}
                          placeholder="Contoh: JT123456789"
                          disabled={isUpdating}
                          className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-[#303646] placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all disabled:bg-gray-50 disabled:cursor-not-allowed ${
                            errors.waybillId
                              ? "border-red-300 focus:border-red-400"
                              : "border-gray-200 focus:border-[#A3AF87] focus:shadow-sm focus:shadow-[#A3AF87]/20"
                          }`}
                        />
                      </div>
                      {errors.waybillId && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.waybillId}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Masukkan nomor resi yang Anda terima dari agen kurir (JNE/J&T/SiCepat/dll)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#303646] mb-2">
                        Kurir Ekspedisi <span className="text-xs text-gray-500 font-normal">(dipilih oleh customer)</span>
                      </label>
                      <div className="relative">
                        <Truck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A3AF87] pointer-events-none" />
                        <select
                          value={resiData.courierCode}
                          onChange={(e) => setResiData({ ...resiData, courierCode: e.target.value })}
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
                            <option key={courier.value} value={courier.value}>
                              {courier.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Kurir ini sudah dipilih oleh customer saat checkout dan tidak dapat diubah
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-700">
                            <p className="font-semibold mb-1">Info Penting:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>Pastikan nomor resi sudah benar sebelum menyimpan</li>
                              <li>Setelah disimpan, status pesanan akan berubah menjadi "Dikirim"</li>
                              <li>
                                System akan otomatis melacak pengiriman via Biteship dan memberitahu customer saat paket
                                sampai
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleInputResi}
                        disabled={isUpdating}
                        className="w-full px-6 py-4 bg-gradient-to-r from-[#A3AF87] to-[#8a9a6e] text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-[#A3AF87]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  </>
                )}
              </div>
            )}

            {/* Ecomaggie Delivery: Driver Info */}
            {shippingType === "ecomaggie-delivery" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#303646] mb-2">
                    Nama Driver Motor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={trackingData.driverName || ""}
                      onChange={(e) => setTrackingData({ ...trackingData, driverName: e.target.value })}
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
                    Nomor WhatsApp Driver <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={trackingData.driverWhatsapp || ""}
                      onChange={(e) => setTrackingData({ ...trackingData, driverWhatsapp: e.target.value })}
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
                      onChange={(e) => setTrackingData({ ...trackingData, departureTime: e.target.value })}
                      className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-[#303646] focus:outline-none focus:bg-white transition-all ${
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
                  onClick={handleSaveEcomaggieTracking}
                  disabled={isUpdating}
                  className="w-full px-6 py-3 bg-[#A3AF87] text-white rounded-xl font-bold hover:bg-[#8a9a6e] transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Menyimpan..." : "Simpan & Kirim"}
                </button>
              </div>
            )}

            {/* Self Pickup */}
            {shippingType === "self-pickup" && (
              <div className="space-y-4">
                <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl text-center">
                  <Store className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                  <h4 className="font-bold text-[#303646] mb-2">Pesanan Ambil di Toko</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Customer akan mengambil pesanan langsung di toko. Pastikan pesanan sudah siap untuk diambil.
                  </p>
                  <button
                    onClick={() => handleStatusUpdate("ready_pickup" as OrderStatus)}
                    disabled={isUpdating}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? "Memproses..." : "Tandai Siap Diambil"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
