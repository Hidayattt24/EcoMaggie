"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Package,
  MapPin,
  CreditCard,
  FileText,
  Truck,
  Clock,
  ShoppingBag,
  ArrowRight,
  Copy,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import InvoiceTemplate from "@/components/shared/InvoiceTemplate";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "ECO" + Date.now();
  const [orderData, setOrderData] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const lastOrder = localStorage.getItem("lastOrder");
    if (lastOrder) {
      setOrderData(JSON.parse(lastOrder));
    }
  }, []);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A3AF87]/5 via-white to-[#A3AF87]/10">
      {showInvoice && orderData ? (
        <div className="py-8">
          <div className="max-w-5xl mx-auto px-4 mb-4">
            <button
              onClick={() => setShowInvoice(false)}
              className="text-sm font-bold text-[#5a6c5b] hover:text-[#5a6c5b]/80 flex items-center gap-2 px-4 py-2 hover:bg-[#A3AF87]/10 rounded-lg transition-all"
            >
              ← Kembali
            </button>
          </div>
          <InvoiceTemplate
            orderId={orderId}
            orderDate={orderData.date}
            productName={orderData.productName}
            quantity={orderData.quantity}
            price={orderData.price}
            subtotal={orderData.subtotal}
            shippingCost={orderData.shipping.price}
            total={orderData.total}
            customerName={orderData.address.name}
            customerPhone={orderData.address.phone}
            customerAddress={`${orderData.address.address}, ${orderData.address.district}, ${orderData.address.city}, ${orderData.address.province} ${orderData.address.postalCode}`}
            shippingMethod={orderData.shipping.name}
            paymentMethod={orderData.payment.name}
            paymentStatus="pending"
          />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Content - Left */}
            <div className="lg:col-span-3">
              {/* Success Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-[#A3AF87]/20 p-6 sm:p-8 mb-6"
              >
                {/* Success Animation */}
                <div className="flex flex-col items-center mb-6">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative mb-4"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#A3AF87] rounded-full flex items-center justify-center shadow-xl shadow-[#A3AF87]/30">
                      <Check
                        className="h-10 w-10 sm:h-12 sm:w-12 text-white"
                        strokeWidth={3}
                      />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white"
                    >
                      <CheckCircle className="h-5 w-5 text-white" />
                    </motion.div>
                  </motion.div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#5a6c5b] mb-2 text-center">
                    Pesanan Berhasil Dibuat!
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500 text-center">
                    Terima kasih telah berbelanja di EcoMaggie
                  </p>
                </div>

                {/* Order ID Card */}
                <div className="bg-gradient-to-r from-[#A3AF87]/10 to-[#A3AF87]/5 rounded-xl p-4 sm:p-5 border border-[#A3AF87]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        ID Pesanan
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-[#5a6c5b]">
                        {orderId}
                      </p>
                    </div>
                    <button
                      onClick={copyOrderId}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#A3AF87]/30 text-sm font-medium text-[#5a6c5b] hover:bg-[#A3AF87]/10 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-green-500">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Order Details */}
              {orderData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-xl border border-[#A3AF87]/20 p-6 sm:p-8"
                >
                  <h2 className="text-lg font-bold text-[#5a6c5b] mb-5 flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#A3AF87]" />
                    Detail Pesanan
                  </h2>

                  <div className="space-y-4">
                    {/* Product */}
                    <div className="flex items-start gap-4 p-4 bg-[#A3AF87]/5 rounded-xl border border-[#A3AF87]/10">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl flex items-center justify-center border border-[#A3AF87]/20 overflow-hidden">
                        <img
                          src="/assets/dummy/magot.png"
                          alt={orderData.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#5a6c5b] mb-1">
                          {orderData.productName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {orderData.quantity} kg
                        </p>
                        <p className="text-lg font-bold text-[#5a6c5b] mt-2">
                          Rp {orderData.total.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#A3AF87]/5 rounded-xl border border-[#A3AF87]/10">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-[#A3AF87] rounded-lg flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            Alamat Pengiriman
                          </p>
                        </div>
                        <p className="font-semibold text-[#5a6c5b] text-sm">
                          {orderData.address.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {orderData.address.phone}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {orderData.address.address}, {orderData.address.city}
                        </p>
                      </div>

                      <div className="p-4 bg-[#A3AF87]/5 rounded-xl border border-[#A3AF87]/10">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-[#A3AF87] rounded-lg flex items-center justify-center">
                            <Truck className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            Metode Pengiriman
                          </p>
                        </div>
                        <p className="font-semibold text-[#5a6c5b] text-sm">
                          {orderData.shipping.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Est: {orderData.shipping.estimatedDays}
                        </p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="p-4 bg-[#A3AF87]/5 rounded-xl border border-[#A3AF87]/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#A3AF87] rounded-lg flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              Pembayaran
                            </p>
                            <p className="font-semibold text-[#5a6c5b] text-sm">
                              {orderData.payment.name}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Menunggu Pembayaran
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar - Right */}
            <div className="lg:col-span-2 space-y-6">
              {/* Actions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl border border-[#A3AF87]/20 p-6"
              >
                <h3 className="text-lg font-bold text-[#5a6c5b] mb-4">
                  Tindakan
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowInvoice(true)}
                    disabled={!orderData}
                    className="group w-full py-3.5 bg-[#A3AF87] text-white rounded-xl text-sm font-bold hover:bg-[#95a17a] hover:shadow-lg hover:shadow-[#A3AF87]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="h-5 w-5" />
                    Lihat & Cetak Invoice
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <Link
                    href="/transaction"
                    className="group w-full py-3.5 border-2 border-[#A3AF87] text-[#5a6c5b] rounded-xl text-sm font-bold hover:bg-[#A3AF87]/10 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Lihat Pesanan Saya
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/market/products"
                    className="block w-full py-3 text-gray-500 text-sm text-center hover:text-[#5a6c5b] font-medium transition-colors"
                  >
                    Lanjut Belanja
                  </Link>
                </div>
              </motion.div>

              {/* Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[#A3AF87]/10 to-white rounded-2xl border border-[#A3AF87]/20 p-6"
              >
                <h3 className="text-sm font-bold text-[#5a6c5b] mb-4">
                  Langkah Selanjutnya
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#A3AF87]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#5a6c5b]">
                        1
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#5a6c5b]">
                        Selesaikan Pembayaran
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Bayar sebelum batas waktu habis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#A3AF87]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#5a6c5b]">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#5a6c5b]">
                        Konfirmasi Otomatis
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Pesanan diproses setelah pembayaran
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#A3AF87]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#5a6c5b]">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#5a6c5b]">
                        Pesanan Dikirim
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Lacak pengiriman di halaman transaksi
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Help Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-lg border border-[#A3AF87]/20 p-5"
              >
                <h3 className="text-sm font-bold text-[#5a6c5b] mb-3">
                  Butuh Bantuan?
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Hubungi kami jika ada pertanyaan tentang pesanan Anda.
                </p>
                <a
                  href="https://wa.me/6282288953268"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  Hubungi via WhatsApp
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
