"use client";

import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Package,
  Calendar,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  CreditCard,
} from "lucide-react";
import { generateInvoicePDF } from "@/utils/generateInvoicePDF";

interface InvoiceProps {
  orderId: string;
  orderDate: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  shippingMethod: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
}

export default function InvoiceTemplate({
  orderId,
  orderDate,
  productName,
  quantity,
  price,
  subtotal,
  shippingCost,
  total,
  customerName,
  customerPhone,
  customerAddress,
  shippingMethod,
  paymentMethod,
  paymentStatus,
}: InvoiceProps) {
  const handleCetakInvoice = () => {
    generateInvoicePDF({
      orderId,
      orderDate,
      productName,
      quantity,
      price,
      subtotal,
      shippingCost,
      shippingMethod,
      total,
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      paymentStatus,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Action Buttons (hidden in print) */}
      <div className="flex flex-wrap gap-3 justify-end mb-6 print:hidden">
        <button
          onClick={handleCetakInvoice}
          className="px-5 py-2.5 bg-[#A3AF87] text-white text-sm font-bold rounded-xl hover:bg-[#95a17a] hover:shadow-lg hover:shadow-[#A3AF87]/30 transition-all flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Cetak Invoice
        </button>
      </div>

      {/* Invoice Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-[#A3AF87]/20 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
        {/* Header Band */}
        <div className="bg-gradient-to-r from-[#A3AF87] to-[#95a17a] px-6 sm:px-8 py-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                Eco-maggie
              </h1>
              <p className="text-white/80 text-sm font-medium">
                Invoice Pesanan
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-bold mb-2">
                {orderId}
              </div>
              <p className="text-white/80 text-xs font-medium flex items-center gap-1.5 sm:justify-end">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(orderDate).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Company & Customer Info */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* From */}
            <div className="p-5 bg-[#A3AF87]/5 rounded-xl border border-[#A3AF87]/15">
              <h3 className="text-xs font-bold text-[#5a6c5b] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#A3AF87]" />
                Dari
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-bold text-[#5a6c5b] text-lg">
                    PT Eco-maggie Indonesia
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Jl. Teuku Umar No. 99
                  </p>
                  <p className="text-sm text-gray-500">
                    Banda Aceh, Aceh 23111
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#A3AF87]" />
                    <p className="text-sm text-gray-600">+62 812-3456-7890</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#A3AF87]" />
                    <p className="text-sm text-gray-600">info@ecomaggie.id</p>
                  </div>
                </div>
              </div>
            </div>

            {/* To */}
            <div className="p-5 bg-[#A3AF87]/5 rounded-xl border border-[#A3AF87]/15">
              <h3 className="text-xs font-bold text-[#5a6c5b] uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#A3AF87]" />
                Kepada
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-bold text-[#5a6c5b] text-lg">
                    {customerName}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {customerAddress}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Phone className="h-4 w-4 text-[#A3AF87]" />
                  <p className="text-sm text-gray-600">{customerPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-[#5a6c5b] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#A3AF87]" />
              Detail Pesanan
            </h3>
            <div className="border border-[#A3AF87]/20 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#A3AF87]/10">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-[#5a6c5b] uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-[#5a6c5b] uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-bold text-[#5a6c5b] uppercase tracking-wider hidden sm:table-cell">
                      Harga Satuan
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-[#5a6c5b] uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <td className="px-4 sm:px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#A3AF87]/10 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-[#A3AF87]" />
                        </div>
                        <span className="text-sm font-semibold text-[#5a6c5b]">
                          {productName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center text-sm text-gray-600 font-medium">
                      {quantity} kg
                    </td>
                    <td className="px-4 py-5 text-right text-sm text-gray-600 font-medium hidden sm:table-cell">
                      Rp {price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 sm:px-6 py-5 text-right text-sm font-bold text-[#5a6c5b]">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary & Payment Info */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Payment & Shipping Info */}
            <div className="space-y-4 order-2 lg:order-1">
              <div className="p-4 bg-[#A3AF87]/5 rounded-xl border border-[#A3AF87]/15">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-[#A3AF87]" />
                  <h4 className="text-xs font-bold text-[#5a6c5b] uppercase tracking-wider">
                    Metode Pengiriman
                  </h4>
                </div>
                <p className="text-sm text-[#5a6c5b] font-semibold">
                  {shippingMethod}
                </p>
              </div>

              <div className="p-4 bg-[#A3AF87]/5 rounded-xl border border-[#A3AF87]/15">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-[#A3AF87]" />
                  <h4 className="text-xs font-bold text-[#5a6c5b] uppercase tracking-wider">
                    Metode Pembayaran
                  </h4>
                </div>
                <p className="text-sm text-[#5a6c5b] font-semibold">
                  {paymentMethod}
                </p>
              </div>

              <div className="p-4 bg-[#A3AF87]/5 rounded-xl border border-[#A3AF87]/15">
                <h4 className="text-xs font-bold text-[#5a6c5b] uppercase tracking-wider mb-3">
                  Status Pembayaran
                </h4>
                <div>
                  {paymentStatus === "paid" && (
                    <span className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-lg inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Lunas
                    </span>
                  )}
                  {paymentStatus === "pending" && (
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg inline-flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Menunggu Pembayaran
                    </span>
                  )}
                  {paymentStatus === "failed" && (
                    <span className="px-4 py-2 bg-red-100 text-red-700 text-xs font-bold rounded-lg inline-flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Gagal
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="order-1 lg:order-2">
              <div className="p-5 bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 rounded-xl border border-[#A3AF87]/20">
                <h4 className="text-xs font-bold text-[#5a6c5b] uppercase tracking-wider mb-4">
                  Ringkasan Pembayaran
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-[#5a6c5b] font-semibold">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Ongkir ({shippingMethod})
                    </span>
                    <span className="text-[#5a6c5b] font-semibold">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">GRATIS</span>
                      ) : (
                        `Rp ${shippingCost.toLocaleString("id-ID")}`
                      )}
                    </span>
                  </div>
                  <div className="pt-4 mt-2 border-t-2 border-[#A3AF87]/20 flex justify-between items-center">
                    <span className="font-bold text-[#5a6c5b]">Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#5a6c5b]">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-[#A3AF87]/15">
            <p className="text-xs text-gray-500 text-center">
              Terima kasih atas pesanan Anda. Invoice ini dibuat secara otomatis
              dan sah tanpa tanda tangan.
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Simpan invoice ini sebagai bukti pembayaran Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
