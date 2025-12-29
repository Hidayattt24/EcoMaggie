"use client";

import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Package,
  Calendar,
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
    <div className="max-w-4xl mx-auto bg-white">
      {/* Action Button (hidden in print) */}
      <div className="flex justify-end mb-6 print:hidden">
        <button
          onClick={handleCetakInvoice}
          className="px-6 py-3 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white text-sm font-bold rounded-xl hover:shadow-xl hover:shadow-[#2D5016]/30 transition-all"
        >
          Cetak Invoice
        </button>
      </div>

      {/* Invoice Container */}
      <div className="border-2 border-[#2D5016]/20 rounded-2xl p-8 print:border-0 print:rounded-none shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-[#2D5016]/10">
          <div>
            <h1 className="text-3xl font-bold text-[#2D5016] mb-1">
              Eco-maggie
            </h1>
            <p className="text-sm text-[#2D5016]/70 font-medium">
              Invoice Pesanan
            </p>
          </div>
          <div className="text-right">
            <div className="px-4 py-2 bg-gradient-to-br from-green-50 to-green-100 border-2 border-[#2D5016]/20 rounded-xl text-sm font-bold text-[#2D5016] inline-block mb-2">
              {orderId}
            </div>
            <p className="text-xs text-[#2D5016]/70 font-medium">
              {new Date(orderDate).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Company & Customer Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* From */}
          <div className="p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border-2 border-[#2D5016]/10">
            <h3 className="text-xs font-bold text-[#2D5016] uppercase mb-3">
              Dari
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-[#2D5016] mt-0.5" />
                <div>
                  <p className="font-bold text-[#2D5016]">
                    PT Eco-maggie Indonesia
                  </p>
                  <p className="text-sm text-[#2D5016]/70 font-medium">
                    Jl. Teuku Umar No. 99
                  </p>
                  <p className="text-sm text-[#2D5016]/70 font-medium">
                    Banda Aceh, Aceh 23111
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#2D5016]" />
                <p className="text-sm text-[#2D5016]/70 font-medium">
                  +62 812-3456-7890
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#2D5016]" />
                <p className="text-sm text-[#2D5016]/70 font-medium">
                  info@ecomaggie.id
                </p>
              </div>
            </div>
          </div>

          {/* To */}
          <div className="p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border-2 border-[#2D5016]/10">
            <h3 className="text-xs font-bold text-[#2D5016] uppercase mb-3">
              Kepada
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#2D5016] mt-0.5" />
                <div>
                  <p className="font-bold text-[#2D5016]">{customerName}</p>
                  <p className="text-sm text-[#2D5016]/70 font-medium">
                    {customerAddress}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#2D5016]" />
                <p className="text-sm text-[#2D5016]/70 font-medium">
                  {customerPhone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-[#2D5016] uppercase mb-3">
            Detail Pesanan
          </h3>
          <div className="border-2 border-[#2D5016]/20 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-green-100/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#2D5016]">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[#2D5016]">
                    Jumlah
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-[#2D5016]">
                    Harga Satuan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-[#2D5016]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#2D5016]/10">
                <tr>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-[#2D5016]" />
                      <span className="text-sm font-bold text-[#2D5016]">
                        {productName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-[#2D5016]/70 font-medium">
                    {quantity} kg
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-[#2D5016]/70 font-medium">
                    Rp {price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-bold text-[#2D5016]">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/2 space-y-3 p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border-2 border-[#2D5016]/10">
            <div className="flex justify-between text-sm">
              <span className="text-[#2D5016]/70 font-medium">Subtotal</span>
              <span className="text-[#2D5016] font-bold">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#2D5016]/70 font-medium">
                Ongkir ({shippingMethod})
              </span>
              <span className="text-[#2D5016] font-bold">
                {shippingCost === 0
                  ? "GRATIS"
                  : `Rp ${shippingCost.toLocaleString("id-ID")}`}
              </span>
            </div>
            <div className="pt-3 border-t-2 border-[#2D5016]/20 flex justify-between">
              <span className="font-bold text-[#2D5016]">Total</span>
              <span className="text-xl font-bold text-[#2D5016]">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-8 pt-6 border-t-2 border-[#2D5016]/10 grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold text-[#2D5016] uppercase mb-2">
              Metode Pembayaran
            </h4>
            <p className="text-sm text-[#2D5016] font-bold">{paymentMethod}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2D5016] uppercase mb-2">
              Status Pembayaran
            </h4>
            <div>
              {paymentStatus === "paid" && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white text-xs font-bold rounded-lg inline-block">
                  Lunas
                </span>
              )}
              {paymentStatus === "pending" && (
                <span className="px-3 py-1.5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-[#2D5016]/20 text-[#2D5016] text-xs font-bold rounded-lg inline-block">
                  Menunggu Pembayaran
                </span>
              )}
              {paymentStatus === "failed" && (
                <span className="px-3 py-1.5 bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold rounded-lg inline-block">
                  Gagal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t-2 border-[#2D5016]/10">
          <p className="text-xs text-[#2D5016]/70 text-center font-medium">
            Terima kasih atas pesanan Anda. Invoice ini dibuat secara otomatis
            dan sah tanpa tanda tangan.
          </p>
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
