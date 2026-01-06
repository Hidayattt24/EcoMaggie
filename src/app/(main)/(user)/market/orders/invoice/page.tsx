"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  ShoppingBag,
  Copy,
  Check,
  AlertCircle,
  ArrowLeft,
  Download,
} from "lucide-react";
import Link from "next/link";
import { getTransactionStatus } from "@/lib/api/payment.actions";

// =====================================================
// TYPES
// =====================================================

interface InvoiceData {
  orderId: string;
  status: string;
  paymentStatus: string;
  paymentType?: string;
  total: number;
  paidAt?: string;
  transaction: any;
  payment: any;
  items: any[];
}

// =====================================================
// INVOICE CONTENT COMPONENT
// =====================================================

function InvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch invoice data
  useEffect(() => {
    async function fetchInvoice() {
      if (!orderId) {
        setError("Order ID tidak ditemukan");
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔍 Fetching invoice for order:", orderId);
        const result = await getTransactionStatus(orderId);

        if (result.success && result.data) {
          setInvoiceData(result.data);
          console.log("✅ Invoice data loaded:", result.data);
        } else {
          setError(result.message || "Gagal memuat invoice");
        }
      } catch (err) {
        console.error("❌ Error fetching invoice:", err);
        setError("Terjadi kesalahan saat memuat invoice");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvoice();
  }, [orderId]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get status info
  const getStatusInfo = () => {
    const status = invoiceData?.paymentStatus || invoiceData?.status || "pending";

    if (status === "settlement" || status === "capture" || status === "paid") {
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        title: "Pembayaran Berhasil!",
        message: "Terima kasih, pembayaran Anda telah berhasil diproses.",
      };
    } else if (status === "pending") {
      return {
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        title: "Menunggu Pembayaran",
        message: "Silakan selesaikan pembayaran Anda sebelum batas waktu.",
      };
    } else if (status === "deny" || status === "cancel" || status === "expire" || status === "failure") {
      return {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        title: "Pembayaran Gagal",
        message: "Pembayaran Anda gagal atau dibatalkan. Silakan coba lagi.",
      };
    } else {
      return {
        icon: AlertCircle,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        title: "Status Tidak Diketahui",
        message: "Status pembayaran sedang diproses.",
      };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), white, rgba(163, 175, 135, 0.05))",
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3AF87] mx-auto mb-4"></div>
          <p className="text-[#5a6c5b] font-medium">Memuat invoice...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), white, rgba(163, 175, 135, 0.05))",
      }}>
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error || "Invoice tidak ditemukan"}</h2>
          <Link
            href="/market/products"
            className="mt-4 inline-block px-4 py-2 bg-[#A3AF87] text-white rounded-lg hover:bg-[#95a17a] transition-colors"
          >
            Kembali ke Produk
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const transaction = invoiceData.transaction;
  const payment = invoiceData.payment;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), white, rgba(163, 175, 135, 0.05))",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/market/products"
          className="inline-flex items-center gap-2 text-sm hover:text-[#5a6c5b] transition-colors mb-6 group"
          style={{ color: "rgba(90, 108, 91, 0.7)" }}
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Kembali ke Produk</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Status Card */}
          <div
            className={`p-6 rounded-2xl border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} mb-6`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${statusInfo.bgColor} border-2 ${statusInfo.borderColor}`}>
                <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
              </div>
              <div className="flex-1">
                <h1 className={`text-2xl font-bold ${statusInfo.color} mb-1`}>
                  {statusInfo.title}
                </h1>
                <p className="text-gray-600">{statusInfo.message}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Order ID:</span>
                  <code className="px-3 py-1 bg-white border-2 border-gray-200 rounded-lg text-sm font-mono font-bold text-[#5a6c5b]">
                    {invoiceData.orderId}
                  </code>
                  <button
                    onClick={() => copyToClipboard(invoiceData.orderId)}
                    className="p-1.5 hover:bg-white rounded-lg transition-colors"
                    title="Copy Order ID"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions (for pending payments) */}
          {invoiceData.paymentStatus === "pending" && payment?.va_number && (
            <div className="p-6 rounded-2xl border-2 border-orange-200 bg-orange-50 mb-6">
              <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Instruksi Pembayaran
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-orange-700 mb-1">Bank</p>
                  <p className="font-bold text-orange-900 uppercase">{payment.bank}</p>
                </div>
                <div>
                  <p className="text-sm text-orange-700 mb-1">Nomor Virtual Account</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 bg-white border-2 border-orange-200 rounded-xl text-lg font-mono font-bold text-orange-900">
                      {payment.va_number}
                    </code>
                    <button
                      onClick={() => copyToClipboard(payment.va_number)}
                      className="p-3 bg-white border-2 border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Copy className="h-5 w-5 text-orange-600" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-orange-700 mb-1">Total Pembayaran</p>
                  <p className="text-2xl font-bold text-orange-900">
                    Rp {invoiceData.total.toLocaleString("id-ID")}
                  </p>
                </div>
                {payment.expiry_time && (
                  <div>
                    <p className="text-sm text-orange-700 mb-1">Batas Waktu Pembayaran</p>
                    <p className="font-medium text-orange-900">
                      {new Date(payment.expiry_time).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Order Details */}
              <div className="border-2 border-[#A3AF87]/20 bg-white rounded-2xl p-6">
                <h3 className="font-bold text-[#5a6c5b] mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Detail Pesanan
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID</span>
                    <span className="font-bold text-[#5a6c5b]">{invoiceData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal</span>
                    <span className="font-medium text-[#5a6c5b]">
                      {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-lg font-bold text-xs ${
                      invoiceData.status === "paid" ? "bg-green-100 text-green-700" :
                      invoiceData.status === "pending" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {invoiceData.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-2 border-[#A3AF87]/20 bg-white rounded-2xl p-6">
                <h3 className="font-bold text-[#5a6c5b] mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Alamat Pengiriman
                </h3>
                <div className="text-sm space-y-1">
                  <p className="font-bold text-[#5a6c5b]">{transaction.customer_name}</p>
                  <p className="text-gray-600">{transaction.customer_phone}</p>
                  <p className="text-gray-600 mt-2">{transaction.customer_address}</p>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="border-2 border-[#A3AF87]/20 bg-white rounded-2xl p-6">
                <h3 className="font-bold text-[#5a6c5b] mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Metode Pengiriman
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kurir</span>
                    <span className="font-bold text-[#5a6c5b]">{transaction.shipping_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimasi</span>
                    <span className="font-medium text-[#5a6c5b]">{transaction.estimated_delivery}</span>
                  </div>
                  {transaction.shipping_tracking_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">No. Resi</span>
                      <code className="font-mono font-bold text-[#5a6c5b]">
                        {transaction.shipping_tracking_number}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Products */}
              <div className="border-2 border-[#A3AF87]/20 bg-white rounded-2xl p-6">
                <h3 className="font-bold text-[#5a6c5b] mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Produk ({invoiceData.items.length})
                </h3>
                <div className="space-y-4">
                  {invoiceData.items.map((item: any) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 rounded-xl flex-shrink-0 overflow-hidden border-2 border-[#A3AF87]/10">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#5a6c5b] text-sm mb-1">{item.product_name}</p>
                        <p className="text-xs text-gray-600 mb-2">
                          {item.quantity} {item.unit} × Rp {item.unit_price.toLocaleString("id-ID")}
                        </p>
                        <p className="font-bold text-[#5a6c5b]">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-2 border-[#A3AF87]/20 bg-white rounded-2xl p-6">
                <h3 className="font-bold text-[#5a6c5b] mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Ringkasan Pembayaran
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-[#5a6c5b]">
                      Rp {transaction.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ongkir</span>
                    <span className="font-medium text-[#5a6c5b]">
                      {transaction.shipping_cost === 0 ? "GRATIS" : `Rp ${transaction.shipping_cost.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biaya Layanan</span>
                    <span className="font-medium text-[#5a6c5b]">
                      Rp {transaction.service_fee.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="pt-3 border-t-2 border-[#A3AF87]/20">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#5a6c5b]">Total</span>
                      <span className="text-xl font-bold text-[#5a6c5b]">
                        Rp {invoiceData.total.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                  {payment?.payment_type && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Metode Pembayaran</span>
                        <span className="font-bold text-[#5a6c5b] uppercase">
                          {payment.payment_type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  )}
                  {invoiceData.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dibayar pada</span>
                      <span className="font-medium text-green-600">
                        {new Date(invoiceData.paidAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/market/products"
              className="flex-1 py-3 px-6 bg-[#A3AF87] text-white font-bold rounded-xl hover:bg-[#95a17a] transition-colors text-center"
            >
              Belanja Lagi
            </Link>
            <Link
              href="/market/orders"
              className="flex-1 py-3 px-6 border-2 border-[#A3AF87] text-[#5a6c5b] font-bold rounded-xl hover:bg-[#A3AF87]/10 transition-colors text-center"
            >
              Lihat Pesanan Saya
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN PAGE COMPONENT
// =====================================================

export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{
          background: "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), white, rgba(163, 175, 135, 0.05))",
        }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3AF87] mx-auto mb-4"></div>
            <p className="text-[#5a6c5b] font-medium">Memuat invoice...</p>
          </div>
        </div>
      }
    >
      <InvoiceContent />
    </Suspense>
  );
}
