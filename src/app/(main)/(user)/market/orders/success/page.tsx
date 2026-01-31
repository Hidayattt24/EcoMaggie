"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
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
  Loader2,
  AlertCircle,
  XCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getTransactionStatus, forceSyncTransactionStatus } from "@/lib/api/payment.actions";
import { generateInvoicePDF } from "@/utils/generateInvoicePDF";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [transactionData, setTransactionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Fetch transaction data with self-healing
  const fetchTransactionData = useCallback(async (showRefreshIndicator = false) => {
    if (!orderId) {
      setError("Order ID tidak ditemukan");
      setIsLoading(false);
      return;
    }

    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    try {
      console.log("🔍 Fetching transaction data for:", orderId);
      const result = await getTransactionStatus(orderId);

      if (result.success && result.data) {
        setTransactionData(result.data);
        console.log("✅ Transaction data loaded:", result.data);
        console.log("📊 Payment status:", result.data.paymentStatus);
        console.log("📊 Transaction status:", result.data.status);
        
        // Check if status was synced
        if (result.message.includes("disinkronkan")) {
          setSyncMessage("Status berhasil disinkronkan dari Midtrans!");
          setTimeout(() => setSyncMessage(null), 5000);
        }
      } else {
        setError(result.message || "Gagal memuat data transaksi");
      }
    } catch (err) {
      console.error("❌ Error fetching transaction:", err);
      setError("Terjadi kesalahan saat memuat data transaksi");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orderId]);

  // Manual refresh with force sync
  const handleRefresh = async () => {
    if (!orderId) return;
    
    setIsRefreshing(true);
    setSyncMessage(null);
    
    try {
      console.log("🔄 Force syncing transaction status...");
      
      // First, try to force sync from Midtrans
      const syncResult = await forceSyncTransactionStatus(orderId);
      
      if (syncResult.success && syncResult.newStatus) {
        setSyncMessage(`Status berhasil diupdate ke: ${syncResult.newStatus}`);
      }
      
      // Then fetch the latest data
      await fetchTransactionData(false);
      
      // Refresh the page cache
      router.refresh();
      
    } catch (err) {
      console.error("❌ Error during refresh:", err);
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  useEffect(() => {
    fetchTransactionData();

    // Load Midtrans Snap script (auto-switch production/sandbox)
    const snapScript = document.createElement("script");
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_ENVIRONMENT === "production";
    snapScript.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    snapScript.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
    document.body.appendChild(snapScript);

    // Poll for status updates only if pending
    const interval = setInterval(() => {
      // Stop polling if already paid
      if (transactionData?.paymentStatus === "settlement" ||
          transactionData?.paymentStatus === "capture" ||
          transactionData?.status === "paid") {
        return;
      }
      fetchTransactionData();
    }, 5000);

    return () => {
      clearInterval(interval);
      if (snapScript.parentNode) {
        document.body.removeChild(snapScript);
      }
    };
  }, [orderId, fetchTransactionData]);

  // Stop polling when status changes to paid
  useEffect(() => {
    if (transactionData?.status === "paid" || 
        transactionData?.paymentStatus === "settlement" ||
        transactionData?.paymentStatus === "capture") {
      console.log("✅ Payment confirmed, stopping polling");
    }
  }, [transactionData?.status, transactionData?.paymentStatus]);

  const copyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate and download PDF invoice
  const handleDownloadPDF = () => {
    if (!transactionData) return;

    const transaction = transactionData.transaction;
    const payment = transactionData.payment;
    const items = transactionData.items || [];

    // Determine payment status for invoice
    const getInvoicePaymentStatus = (): "paid" | "pending" | "failed" => {
      const status = transactionData.paymentStatus;
      if (status === "settlement" || status === "capture" || status === "paid") {
        return "paid";
      } else if (status === "pending") {
        return "pending";
      }
      return "failed";
    };

    const invoiceData = {
      orderId: transactionData.orderId,
      orderDate: transaction.created_at,
      productName: items[0]?.product_name || "Product",
      quantity: items[0]?.quantity || 1,
      price: items[0]?.unit_price || 0,
      subtotal: transaction.subtotal,
      shippingCost: transaction.shipping_cost,
      shippingMethod: transaction.shipping_method,
      total: transactionData.total,
      customerName: transaction.customer_name,
      customerPhone: transaction.customer_phone,
      customerAddress: transaction.customer_address,
      paymentMethod: payment?.payment_type ? payment.payment_type.replace(/_/g, " ").toUpperCase() : "Midtrans",
      paymentStatus: getInvoicePaymentStatus(),
      items: items.map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.unit_price,
        subtotal: item.subtotal,
      })),
      trackingNumber: transaction.shipping_tracking_number,
      notes: transaction.notes,
    };

    generateInvoicePDF(invoiceData);
  };

  // Get status info based on payment status
  const getStatusInfo = () => {
    const paymentStatus = transactionData?.paymentStatus || transactionData?.status || "pending";

    if (paymentStatus === "settlement" || paymentStatus === "capture" || paymentStatus === "paid") {
      return {
        icon: CheckCircle,
        color: "text-[#435664]",
        bgColor: "bg-gradient-to-br from-[#fdf8d4] to-[#ebfba8]/30",
        borderColor: "border-[#a3af87]",
        title: "Pembayaran Berhasil!",
        message: "Terima kasih, pembayaran Anda telah berhasil diproses.",
      };
    } else if (paymentStatus === "pending") {
      return {
        icon: Clock,
        color: "text-[#5a6c5b]",
        bgColor: "bg-gradient-to-br from-[#fdf8d4] to-[#f5f0c8]",
        borderColor: "border-[#a3af87]/50",
        title: "Menunggu Pembayaran",
        message: "Silakan selesaikan pembayaran Anda sebelum batas waktu.",
      };
    } else {
      return {
        icon: AlertCircle,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        title: "Pesanan Dibuat",
        message: "Pesanan Anda sedang diproses.",
      };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Content Skeleton - Left */}
            <div className="lg:col-span-3 space-y-6">
              {/* Header Card Skeleton */}
              <div className="rounded-2xl shadow-xl border-2 border-gray-200 bg-[#fdf8d4]/20 p-6 sm:p-8">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
                  <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-gray-200">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Details Card Skeleton */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
                <div className="h-6 w-40 bg-gray-200 rounded-lg mb-5 animate-pulse"></div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-xl animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton - Right */}
            <div className="lg:col-span-2 space-y-6">
              {/* Actions Card Skeleton */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="h-6 w-24 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>

              {/* Info Card Skeleton */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="h-5 w-32 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !transactionData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error || "Data transaksi tidak ditemukan"}</h2>
          <Link
            href="/market/products"
            className="mt-4 inline-block px-4 py-2 bg-[#a3af87] text-white rounded-lg hover:bg-[#95a17a] transition-colors"
          >
            Kembali ke Produk
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const transaction = transactionData.transaction;
  const payment = transactionData.payment;
  const items = transactionData.items || [];

  return (
    <div className="min-h-screen bg-white">
      {(
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Content - Left */}
            <div className="lg:col-span-3">
              {/* Success Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl shadow-xl border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} p-6 sm:p-8 mb-6`}
              >
                {/* Status Animation */}
                <div className="flex flex-col items-center mb-6">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative mb-4"
                  >
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 ${statusInfo.bgColor} border-4 ${statusInfo.borderColor} rounded-full flex items-center justify-center shadow-xl`}>
                      <StatusIcon
                        className={`h-10 w-10 sm:h-12 sm:w-12 ${statusInfo.color}`}
                        strokeWidth={3}
                      />
                    </div>
                  </motion.div>
                  <h1 className={`text-2xl sm:text-3xl font-bold ${statusInfo.color} mb-2 text-center`}>
                    {statusInfo.title}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 text-center">
                    {statusInfo.message}
                  </p>
                </div>

                {/* Order ID Card */}
                <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        ID Pesanan
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-[#435664]">
                        {transactionData.orderId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                        title="Refresh Status"
                      >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      </button>
                      <button
                        onClick={copyOrderId}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-[#435664] hover:bg-gray-100 transition-colors"
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

                  {/* Status update info */}
                  {transactionData.paymentStatus === "pending" && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <RefreshCw className="h-3 w-3" />
                      <span>Status akan diperbarui otomatis setiap 5 detik</span>
                    </div>
                  )}
                  
                  {/* Sync message notification */}
                  {syncMessage && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="h-3 w-3" />
                      <span>{syncMessage}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Payment Instructions (for pending payments) */}
              {transactionData.paymentStatus === "pending" && payment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-[#fdf8d4] to-white rounded-2xl shadow-xl border-2 border-[#a3af87]/30 p-6 sm:p-8 mb-6"
                >
                  <h2 className="text-lg font-bold text-[#435664] mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Instruksi Pembayaran
                  </h2>

                  {/* VA Number (Bank Transfer) */}
                  {payment.va_number && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="inline-block px-4 py-2 bg-[#ebfba8]/30 border border-[#a3af87] rounded-xl">
                          <p className="text-sm font-bold text-[#435664]">
                            Bayar dengan {payment.bank?.toUpperCase() || 'Bank Transfer'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-[#5a6c5b] mb-1 font-medium">Bank</p>
                        <p className="text-lg font-bold text-[#435664] uppercase">{payment.bank}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#5a6c5b] mb-1 font-medium">Nomor Virtual Account</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-4 py-3 bg-white border-2 border-[#a3af87]/30 rounded-xl text-lg font-mono font-bold text-[#435664]">
                            {payment.va_number}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(payment.va_number);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="p-3 bg-[#a3af87]/20 border-2 border-[#a3af87]/30 rounded-xl hover:bg-[#a3af87]/30 transition-colors"
                          >
                            {copied ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : (
                              <Copy className="h-5 w-5 text-[#435664]" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-[#5a6c5b] mb-1 font-medium">Total Pembayaran</p>
                        <p className="text-2xl font-bold text-[#435664]">
                          Rp {transactionData.total.toLocaleString("id-ID")}
                        </p>
                      </div>
                      {payment.expiry_time && (
                        <div className="p-4 bg-[#ebfba8]/20 border-2 border-[#a3af87]/30 rounded-xl">
                          <p className="text-sm text-[#5a6c5b] mb-1 font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Batas Waktu Pembayaran
                          </p>
                          <p className="font-bold text-[#435664]">
                            {new Date(payment.expiry_time).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* QRIS */}
                  {payment.payment_type === "qris" && payment.midtrans_response?.actions && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="inline-block px-4 py-2 bg-[#ebfba8]/30 border border-[#a3af87] rounded-xl">
                          <p className="text-sm font-bold text-[#435664]">
                            Bayar dengan QRIS
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-[#5a6c5b] mb-3 font-medium">Scan QR Code untuk membayar</p>
                        <div className="bg-white p-4 rounded-xl border-2 border-[#a3af87]/30 shadow-lg">
                          <img
                            src={payment.midtrans_response.actions.find((a: any) => a.name === "generate-qr-code")?.url}
                            alt="QRIS Code"
                            className="w-64 h-64 object-contain"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-[#5a6c5b] mb-1 font-medium">Total Pembayaran</p>
                        <p className="text-2xl font-bold text-[#435664]">
                          Rp {transactionData.total.toLocaleString("id-ID")}
                        </p>
                      </div>
                      {payment.expiry_time && (
                        <div className="p-4 bg-[#ebfba8]/20 border-2 border-[#a3af87]/30 rounded-xl">
                          <p className="text-sm text-[#5a6c5b] mb-1 font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Batas Waktu Pembayaran
                          </p>
                          <p className="font-bold text-[#435664]">
                            {new Date(payment.expiry_time).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* E-Wallet (GoPay, ShopeePay) */}
                  {(payment.payment_type === "gopay" || payment.payment_type === "shopeepay") && payment.midtrans_response?.actions && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="inline-block px-4 py-2 bg-[#ebfba8]/30 border border-[#a3af87] rounded-xl">
                          <p className="text-sm font-bold text-[#435664]">
                            Bayar dengan {payment.payment_type === "gopay" ? "GoPay" : "ShopeePay"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-[#5a6c5b] font-medium text-center">
                          {payment.payment_type === "gopay"
                            ? "Scan QR Code dengan aplikasi Gojek/GoPay"
                            : "Scan QR Code dengan aplikasi Shopee/ShopeePay"}
                        </p>
                        {payment.midtrans_response.actions.find((a: any) => a.name === "generate-qr-code") && (
                          <div className="bg-white p-4 rounded-xl border-2 border-[#a3af87]/30 shadow-lg">
                            <img
                              src={payment.midtrans_response.actions.find((a: any) => a.name === "generate-qr-code")?.url}
                              alt={`${payment.payment_type} QR Code`}
                              className="w-64 h-64 object-contain"
                            />
                          </div>
                        )}
                        {payment.midtrans_response.actions.find((a: any) => a.name === "deeplink-redirect") && (
                          <a
                            href={payment.midtrans_response.actions.find((a: any) => a.name === "deeplink-redirect")?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-6 py-3 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-xl font-bold text-center hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all"
                          >
                            Buka di Aplikasi {payment.payment_type === "gopay" ? "Gojek" : "Shopee"}
                          </a>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-[#5a6c5b] mb-1 font-medium">Total Pembayaran</p>
                        <p className="text-2xl font-bold text-[#435664]">
                          Rp {transactionData.total.toLocaleString("id-ID")}
                        </p>
                      </div>
                      {payment.expiry_time && (
                        <div className="p-4 bg-[#ebfba8]/20 border-2 border-[#a3af87]/30 rounded-xl">
                          <p className="text-sm text-[#5a6c5b] mb-1 font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Batas Waktu Pembayaran
                          </p>
                          <p className="font-bold text-[#435664]">
                            {new Date(payment.expiry_time).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fallback: If payment method not selected yet, show Snap button */}
                  {!payment.payment_type &&
                   payment.snap_token && (
                    <div className="space-y-5">
                      <div className="text-center">
                        <p className="text-sm text-[#5a6c5b] mb-4 font-medium">
                          Pilih metode pembayaran untuk melanjutkan transaksi
                        </p>
                        <button
                          onClick={() => {
                            // @ts-ignore
                            if (window.snap) {
                              // @ts-ignore
                              window.snap.pay(payment.snap_token, {
                                onSuccess: function() {
                                  console.log("Payment success!");
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 1000);
                                },
                                onPending: function() {
                                  console.log("Payment pending, reloading to show payment details...");
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 1000);
                                },
                                onError: function() {
                                  console.log("Payment error");
                                },
                                onClose: function() {
                                  console.log("Payment popup closed");
                                  setTimeout(() => {
                                    window.location.reload();
                                  }, 500);
                                }
                              });
                            } else {
                              alert("Midtrans belum siap. Silakan refresh halaman.");
                            }
                          }}
                          className="w-full px-8 py-4 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all flex items-center justify-center gap-2"
                        >
                          <CreditCard className="h-5 w-5" />
                          Pilih Metode Pembayaran
                        </button>
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                          <span className="px-3 py-1 bg-[#fdf8d4] border border-[#a3af87]/30 rounded-full text-xs font-medium text-[#435664]">
                            Bank Transfer
                          </span>
                          <span className="px-3 py-1 bg-[#fdf8d4] border border-[#a3af87]/30 rounded-full text-xs font-medium text-[#435664]">
                            QRIS
                          </span>
                          <span className="px-3 py-1 bg-[#fdf8d4] border border-[#a3af87]/30 rounded-full text-xs font-medium text-[#435664]">
                            GoPay
                          </span>
                          <span className="px-3 py-1 bg-[#fdf8d4] border border-[#a3af87]/30 rounded-full text-xs font-medium text-[#435664]">
                            ShopeePay
                          </span>
                          <span className="px-3 py-1 bg-[#fdf8d4] border border-[#a3af87]/30 rounded-full text-xs font-medium text-[#435664]">
                            Credit Card
                          </span>
                        </div>
                      </div>
                      <div className="text-center p-4 bg-[#ebfba8]/20 border border-[#a3af87]/30 rounded-xl">
                        <p className="text-sm text-[#5a6c5b] mb-1 font-medium">Total Pembayaran</p>
                        <p className="text-3xl font-bold text-[#435664]">
                          Rp {transactionData.total.toLocaleString("id-ID")}
                        </p>
                      </div>
                      {payment.expiry_time && (
                        <div className="p-4 bg-[#ebfba8]/20 border-2 border-[#a3af87]/30 rounded-xl">
                          <p className="text-sm text-[#5a6c5b] mb-1 font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Batas Waktu Pembayaran
                          </p>
                          <p className="font-bold text-[#435664]">
                            {new Date(payment.expiry_time).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Order Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl border border-[#a3af87]/20 p-6 sm:p-8"
              >
                <h2 className="text-lg font-bold text-[#435664] mb-5 flex items-center gap-2">
                  <div className="p-1.5 bg-[#fdf8d4] rounded-lg">
                    <Package className="h-5 w-5 text-[#435664]" />
                  </div>
                  Detail Pesanan
                </h2>

                <div className="space-y-4">
                  {/* Products */}
                  {items.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 bg-[#a3af87]/5 rounded-xl border border-[#a3af87]/10">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl flex items-center justify-center border border-[#a3af87]/20 overflow-hidden">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#435664] mb-1">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} {item.unit} × Rp {item.unit_price.toLocaleString("id-ID")}
                        </p>
                        <p className="text-lg font-bold text-[#435664] mt-2">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Shipping Info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#fdf8d4]/30 rounded-xl border border-[#435664]/10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-[#fdf8d4] rounded-lg flex items-center justify-center border border-[#435664]/20">
                          <MapPin className="h-4 w-4 text-[#435664]" />
                        </div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Alamat Pengiriman
                        </p>
                      </div>
                      <p className="font-semibold text-[#435664] text-sm">
                        {transaction.customer_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {transaction.customer_phone}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {transaction.customer_address}
                      </p>
                    </div>

                    <div className="p-4 bg-[#fdf8d4]/30 rounded-xl border border-[#435664]/10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-[#fdf8d4] rounded-lg flex items-center justify-center border border-[#435664]/20">
                          <Truck className="h-4 w-4 text-[#435664]" />
                        </div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Metode Pengiriman
                        </p>
                      </div>
                      <p className="font-semibold text-[#435664] text-sm">
                        {transaction.shipping_method}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Est: {transaction.estimated_delivery}
                      </p>
                      {transaction.shipping_tracking_number && (
                        <p className="text-xs text-[#435664] mt-2 font-mono font-bold">
                          Resi: {transaction.shipping_tracking_number}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="p-4 bg-[#fdf8d4]/30 rounded-xl border border-[#435664]/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#fdf8d4] rounded-lg flex items-center justify-center border border-[#435664]/20">
                          <CreditCard className="h-4 w-4 text-[#435664]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            Pembayaran
                          </p>
                          <p className="font-semibold text-[#435664] text-sm">
                            {payment?.payment_type ? payment.payment_type.replace(/_/g, " ").toUpperCase() : "Midtrans"}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 ${
                        transactionData.paymentStatus === "settlement" || transactionData.paymentStatus === "capture" || transactionData.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : transactionData.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {transactionData.paymentStatus === "settlement" || transactionData.paymentStatus === "capture" || transactionData.paymentStatus === "paid" ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            Dibayar
                          </>
                        ) : transactionData.paymentStatus === "pending" ? (
                          <>
                            <Clock className="h-3.5 w-3.5" />
                            Menunggu Pembayaran
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3.5 w-3.5" />
                            {transactionData.paymentStatus}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-bold text-[#435664]">
                          Rp {transaction.subtotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ongkir</span>
                        <span className="font-bold text-[#435664]">
                          {transaction.shipping_cost === 0 ? "GRATIS" : `Rp ${transaction.shipping_cost.toLocaleString("id-ID")}`}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                        <span className="font-bold text-[#435664]">Total</span>
                        <span className="text-xl font-bold text-[#435664]">
                          Rp {transactionData.total.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Right */}
            <div className="lg:col-span-2 space-y-6">
              {/* Actions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#fdf8d4]/30 rounded-2xl shadow-xl border-2 border-[#435664]/20 p-6"
              >
                <h3 className="text-lg font-bold text-[#435664] mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-[#fdf8d4] rounded-lg border border-[#435664]/20">
                    <svg className="w-5 h-5 text-[#435664]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  Tindakan
                </h3>
                <div className="space-y-3">
                  {/* Cetak PDF Invoice */}
                  <button
                    onClick={handleDownloadPDF}
                    className="group w-full py-3.5 bg-[#a3af87] text-white rounded-xl text-sm font-bold hover:bg-[#95a17a] hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Cetak PDF Invoice
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Lanjut Belanja */}
                  <Link
                    href="/market/products"
                    className="group w-full py-3.5 border-2 border-[#a3af87] text-[#435664] rounded-xl text-sm font-bold hover:bg-[#a3af87]/10 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Lanjut Belanja
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* Lihat Semua Pesanan */}
                  <Link
                    href="/transaction"
                    className="block w-full py-3 text-gray-500 text-sm text-center hover:text-[#435664] font-medium transition-colors"
                  >
                    Lihat Semua Pesanan
                  </Link>
                </div>
              </motion.div>

              {/* Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#fdf8d4]/30 rounded-2xl border-2 border-[#435664]/20 p-6"
              >
                <h3 className="text-sm font-bold text-[#435664] mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-[#fdf8d4] rounded-lg border border-[#435664]/20">
                    <svg className="w-4 h-4 text-[#435664]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  Langkah Selanjutnya
                </h3>
                <div className="space-y-4">
                  {transactionData.paymentStatus === "pending" ? (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-orange-700">1</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#435664]">
                            Selesaikan Pembayaran
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Bayar sebelum batas waktu {payment?.expiry_time && new Date(payment.expiry_time).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#fdf8d4] border border-[#435664]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-[#435664]">2</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#435664]">
                            Konfirmasi Otomatis
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Halaman akan update otomatis setelah pembayaran terverifikasi
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#fdf8d4] border border-[#435664]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-[#435664]">3</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#435664]">
                            Pesanan Diproses
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Pesanan akan diproses dan dikirim ke alamat Anda
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#ebfba8] border border-[#435664]/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-[#435664]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#435664]">
                            Pembayaran Diterima
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Pesanan Anda sedang diproses
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#fdf8d4] border border-[#435664]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-[#435664]">2</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#435664]">
                            Pesanan Dikemas
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Kami sedang menyiapkan pesanan Anda
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#fdf8d4] border border-[#435664]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-[#435664]">3</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#435664]">
                            Pesanan Dikirim
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Lacak pengiriman di halaman transaksi
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Help Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-[#fdf8d4]/30 rounded-2xl shadow-lg border-2 border-[#435664]/20 p-5"
              >
                <h3 className="text-sm font-bold text-[#435664] mb-3 flex items-center gap-2">
                  <div className="p-1.5 bg-[#fdf8d4] rounded-lg border border-[#435664]/20">
                    <svg className="w-4 h-4 text-[#435664]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Butuh Bantuan?
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Hubungi kami jika ada pertanyaan tentang pesanan Anda.
                </p>
                <a
                  href="https://wa.me/6289534198039"
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

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content Skeleton - Left */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header Card Skeleton */}
            <div className="rounded-2xl shadow-xl border-2 border-gray-200 bg-[#fdf8d4]/20 p-6 sm:p-8">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
                <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-gray-200">
                <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Details Card Skeleton */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
              <div className="h-6 w-40 bg-gray-200 rounded-lg mb-5 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton - Right */}
          <div className="lg:col-span-2 space-y-6">
            {/* Actions Card Skeleton */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="h-6 w-24 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>

            {/* Info Card Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="h-5 w-32 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
