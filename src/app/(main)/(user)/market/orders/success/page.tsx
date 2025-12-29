"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Package, MapPin, CreditCard, FileText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import InvoiceTemplate from "@/components/shared/InvoiceTemplate";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "ECO" + Date.now();
  const [orderData, setOrderData] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    const lastOrder = localStorage.getItem("lastOrder");
    if (lastOrder) {
      setOrderData(JSON.parse(lastOrder));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {showInvoice && orderData ? (
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 mb-4">
            <button
              onClick={() => setShowInvoice(false)}
              className="text-sm font-bold text-[#2D5016] hover:text-[#2D5016]/80 flex items-center gap-2 px-4 py-2 hover:bg-green-50 rounded-lg transition-all"
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          {/* Success Checkmark */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex justify-center mb-6 sm:mb-8"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#2D5016] to-[#2D5016]/80 rounded-full flex items-center justify-center shadow-xl shadow-[#2D5016]/30">
              <Check
                className="h-10 w-10 sm:h-12 sm:w-12 text-white"
                strokeWidth={3}
              />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D5016] mb-2">
              Pesanan Berhasil!
            </h1>
            <p className="text-sm sm:text-base text-[#2D5016]/70 font-medium">
              Terima kasih atas pembelian Anda
            </p>
          </motion.div>

          {/* Order ID */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6 sm:mb-8 pb-6 sm:pb-8 border-b-2 border-[#2D5016]/10"
          >
            <p className="text-xs sm:text-sm text-[#2D5016]/70 font-medium mb-2">
              ID Pesanan
            </p>
            <p className="text-lg sm:text-xl font-bold text-[#2D5016]">
              {orderId}
            </p>
          </motion.div>

          {/* Order Details */}
          {orderData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 sm:space-y-6 mb-6 sm:mb-8"
            >
              {/* Product */}
              <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border-2 border-[#2D5016]/10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2D5016] to-[#2D5016]/80 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#2D5016]/70 font-bold mb-2">
                    Produk
                  </p>
                  <p className="font-bold text-[#2D5016]">
                    {orderData.productName}
                  </p>
                  <p className="text-sm text-[#2D5016]/70 font-medium mt-1">
                    {orderData.quantity} kg
                  </p>
                  <p className="font-bold text-[#2D5016] mt-2">
                    Rp {orderData.total.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Shipping */}
              <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border-2 border-[#2D5016]/10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2D5016] to-[#2D5016]/80 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#2D5016]/70 font-bold mb-2">
                    Alamat Pengiriman
                  </p>
                  <p className="font-bold text-[#2D5016]">
                    {orderData.address.name}
                  </p>
                  <p className="text-sm text-[#2D5016]/70 font-medium mt-1">
                    {orderData.address.address}
                  </p>
                  <p className="text-sm text-[#2D5016]/70 font-medium">
                    {orderData.address.city}, {orderData.address.province}
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border-2 border-[#2D5016]/10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2D5016] to-[#2D5016]/80 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#2D5016]/70 font-bold mb-2">
                    Metode Pembayaran
                  </p>
                  <p className="font-bold text-[#2D5016]">
                    {orderData.payment.name}
                  </p>
                  <p className="text-sm text-[#2D5016]/70 font-medium mt-1">
                    Menunggu pembayaran
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <button
              onClick={() => setShowInvoice(true)}
              disabled={!orderData}
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white rounded-xl text-sm sm:text-base font-bold hover:shadow-xl hover:shadow-[#2D5016]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Lihat Invoice
            </button>

            <Link
              href="/market/orders"
              className="block w-full py-3.5 sm:py-4 border-2 border-[#2D5016] text-[#2D5016] rounded-xl text-sm sm:text-base font-bold hover:bg-green-50 transition-all text-center"
            >
              Lihat Pesanan Saya
            </Link>

            <Link
              href="/market/products"
              className="block w-full py-3 text-[#2D5016]/70 text-xs sm:text-sm text-center hover:text-[#2D5016] font-medium"
            >
              Lanjut Belanja
            </Link>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-[#2D5016]/10"
          >
            <p className="text-[10px] sm:text-xs text-[#2D5016]/70 text-center font-medium">
              Konfirmasi pembayaran akan dikirimkan ke email Anda
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
