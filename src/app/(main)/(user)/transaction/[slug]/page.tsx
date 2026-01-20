"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  Hash,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Star,
} from "lucide-react";
import Link from "next/link";
import { StatusLabel } from "@/components/user/transaction/StatusLabel";
import { TransactionDetailItem } from "@/components/user/transaction/TransactionDetailItem";
import { generateInvoicePDF } from "@/utils/generateInvoicePDF";
import { getCustomerOrderDetail } from "@/lib/api/orders.actions";
import type { Order as DbOrder } from "@/lib/api/orders.actions";

// ============================================
// TYPES
// ============================================
type TransactionStatus = "unpaid" | "packed" | "shipped" | "completed" | "cancelled";

interface Product {
  id: number;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
  slug: string;
}

interface Transaction {
  id: string;
  orderId: string;
  farmName: string;
  farmerId: number;
  farmerPhone: string;
  status: TransactionStatus;
  products: Product[];
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  serviceFee: number;
  discount: number;
  totalPrice: number;
  shippingMethod: string;
  shippingCourier: string;
  trackingNumber?: string;
  trackingLink?: string;
  date: string;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapDbStatusToUiStatus(dbStatus: string): TransactionStatus {
  const statusMap: Record<string, TransactionStatus> = {
    pending: "unpaid",
    paid: "packed",
    confirmed: "packed",
    processing: "packed",
    ready_pickup: "packed",
    shipped: "shipped",
    delivered: "completed",
    completed: "completed",
    cancelled: "cancelled",
    failed: "cancelled",
    expired: "cancelled",
  };
  return statusMap[dbStatus] || "unpaid";
}

function parseAddress(addressString: string): {
  address: string;
  city: string;
  province: string;
  postalCode: string;
} {
  const parts = addressString.split(",").map((p) => p.trim());
  
  if (parts.length >= 4) {
    return {
      address: parts.slice(0, -3).join(", "),
      city: parts[parts.length - 3] || "",
      province: parts[parts.length - 2] || "",
      postalCode: parts[parts.length - 1] || "",
    };
  }
  
  return {
    address: addressString,
    city: "",
    province: "",
    postalCode: "",
  };
}

function transformDbOrderToTransaction(dbOrder: DbOrder): Transaction {
  const products: Product[] = dbOrder.items.map((item, index) => ({
    id: index + 1,
    name: item.product_name,
    variant: item.unit || "Standard",
    quantity: item.quantity,
    price: item.unit_price,
    image: item.product_image || "/assets/dummy/magot.png",
    slug: item.product?.slug || "",
  }));

  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const parsedAddress = parseAddress(dbOrder.customer_address);

  return {
    id: dbOrder.id,
    orderId: dbOrder.order_id,
    farmName: "Eco-maggie Store",
    farmerId: 1,
    farmerPhone: "6282288953268",
    status: mapDbStatusToUiStatus(dbOrder.status),
    products,
    totalItems,
    subtotal: dbOrder.subtotal,
    shippingCost: dbOrder.shipping_cost,
    serviceFee: dbOrder.service_fee,
    discount: 0,
    totalPrice: dbOrder.total_amount,
    shippingMethod: dbOrder.shipping_method || "Regular",
    shippingCourier: dbOrder.shipping_courier || "",
    trackingNumber: dbOrder.shipping_tracking_number || undefined,
    date: new Date(dbOrder.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    paymentMethod: "Midtrans",
    shippingAddress: {
      name: dbOrder.customer_name,
      phone: dbOrder.customer_phone,
      ...parsedAddress,
    },
  };
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactionDetail();
  }, [resolvedParams.slug]);

  const loadTransactionDetail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getCustomerOrderDetail(resolvedParams.slug);

      if (result.success && result.data) {
        const transformedTransaction = transformDbOrderToTransaction(result.data);
        setTransaction(transformedTransaction);

        // Generate tracking link based on courier
        if (result.data.shipping_tracking_number && result.data.shipping_courier) {
          const courierCode = result.data.shipping_courier.toLowerCase();
          const waybillId = result.data.shipping_tracking_number;
          
          const trackingLinks: Record<string, string> = {
            jne: `https://www.jne.co.id/id/tracking/trace/${waybillId}`,
            jnt: `https://www.jet.co.id/track/${waybillId}`,
            sicepat: `https://www.sicepat.com/checkAwb/${waybillId}`,
            anteraja: `https://anteraja.id/tracking/${waybillId}`,
            ninja: `https://www.ninjaxpress.co/id-id/tracking?id=${waybillId}`,
            id_express: `https://www.idexpress.com/tracking/${waybillId}`,
          };
          
          transformedTransaction.trackingLink = trackingLinks[courierCode] || `https://www.google.com/search?q=${waybillId}+tracking`;
          setTransaction({ ...transformedTransaction });
        }
      } else {
        setError(result.message || "Transaksi tidak ditemukan");
      }
    } catch (err) {
      console.error("Error loading transaction:", err);
      setError("Terjadi kesalahan saat memuat transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!transaction) return;

    const fullAddress = `${transaction.shippingAddress.address}, ${transaction.shippingAddress.city}, ${transaction.shippingAddress.province} ${transaction.shippingAddress.postalCode}`;

    generateInvoicePDF({
      orderId: transaction.orderId,
      orderDate: transaction.date,
      productName: transaction.products[0]?.name || "",
      quantity: transaction.totalItems,
      price: transaction.products[0]?.price || 0,
      subtotal: transaction.subtotal,
      shippingCost: transaction.shippingCost,
      shippingMethod: transaction.shippingMethod,
      discount: transaction.discount,
      total: transaction.totalPrice,
      customerName: transaction.shippingAddress.name,
      customerPhone: transaction.shippingAddress.phone,
      customerAddress: fullAddress,
      paymentMethod: transaction.paymentMethod,
      paymentStatus:
        transaction.status === "completed"
          ? "paid"
          : transaction.status === "cancelled"
          ? "failed"
          : "pending",
      items: transaction.products.map((p) => ({
        name: p.name,
        variant: p.variant,
        quantity: p.quantity,
        unit: "pcs",
        price: p.price,
        subtotal: p.price * p.quantity,
      })),
      trackingNumber: transaction.trackingNumber,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-6">
        {/* Header Skeleton */}
        <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10 lg:static">
          <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-6 sm:h-8 bg-gray-200 rounded-lg animate-pulse w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-32"></div>
              </div>
              <div className="hidden sm:block w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Status Header Skeleton */}
            <div className="bg-[#fdf8d4] rounded-xl sm:rounded-2xl p-4 sm:p-8 border-2 border-[#435664]/20">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl animate-pulse"></div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="h-8 bg-white/60 rounded-lg animate-pulse w-32 mx-auto sm:mx-0"></div>
                  <div className="h-4 bg-white/40 rounded-lg animate-pulse w-48 mx-auto sm:mx-0"></div>
                </div>
                <div className="text-center sm:text-right space-y-2">
                  <div className="h-4 bg-white/40 rounded-lg animate-pulse w-24"></div>
                  <div className="h-8 bg-white/60 rounded-lg animate-pulse w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
          {/* Shipping Info Skeleton */}
          <div className="bg-[#fdf8d4] rounded-xl sm:rounded-2xl border-2 border-[#435664]/20 overflow-hidden">
            <div className="p-3 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-white to-[#fdf8d4]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 bg-white rounded-lg animate-pulse"></div>
                <div className="h-6 bg-white rounded-lg animate-pulse w-48"></div>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-white/60 rounded-lg animate-pulse w-32"></div>
                  <div className="h-5 bg-white/40 rounded-lg animate-pulse w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Details Skeleton */}
          <div className="bg-[#fdf8d4] rounded-2xl border-2 border-[#435664]/20 overflow-hidden">
            <div className="p-4 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-white to-[#fdf8d4]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg animate-pulse"></div>
                <div className="h-6 bg-white rounded-lg animate-pulse w-40"></div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b-2 border-gray-50 last:border-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-white/60 rounded-lg animate-pulse w-3/4"></div>
                      <div className="h-4 bg-white/40 rounded-lg animate-pulse w-1/2"></div>
                      <div className="h-4 bg-white/40 rounded-lg animate-pulse w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Details Skeleton */}
          <div className="bg-[#fdf8d4] rounded-2xl border-2 border-[#435664]/20 overflow-hidden">
            <div className="p-4 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-white to-[#fdf8d4]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg animate-pulse"></div>
                <div className="h-6 bg-white rounded-lg animate-pulse w-48"></div>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-white/60 rounded-lg animate-pulse w-32"></div>
                  <div className="h-4 bg-white/60 rounded-lg animate-pulse w-24"></div>
                </div>
              ))}
              <div className="pt-3 border-t-2 border-gray-100">
                <div className="flex justify-between">
                  <div className="h-6 bg-white/60 rounded-lg animate-pulse w-40"></div>
                  <div className="h-6 bg-white/60 rounded-lg animate-pulse w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#303646] mb-2">Transaksi Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || "Maaf, transaksi yang Anda cari tidak ditemukan."}</p>
          <button
            onClick={() => router.push("/transaction")}
            className="px-6 py-3 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all"
          >
            Kembali ke Transaksi
          </button>
        </div>
      </div>
    );
  }

  const statusIcons = {
    unpaid: Clock,
    packed: Package,
    shipped: Truck,
    completed: CheckCircle2,
    cancelled: XCircle,
  };

  const StatusIconComponent = statusIcons[transaction.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white pb-6"
    >
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10 lg:static">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 sm:p-2.5 hover:bg-[#435664]/10 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-[#435664]" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-[#303646] truncate">Detail Transaksi</h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 truncate">{transaction.orderId}</p>
            </div>
            <button
              onClick={handlePrintInvoice}
              className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-[#435664]/30 text-[#435664] rounded-lg font-bold text-sm hover:bg-[#435664]/10 transition-all flex-shrink-0"
            >
              <Printer className="h-4 w-4" />
              Cetak Invoice
            </button>
          </div>

          {/* Status Header */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#fdf8d4] to-[#f5efc0] rounded-xl sm:rounded-2xl p-4 sm:p-8 border-2 border-[#435664]/20"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <StatusIconComponent className="h-7 w-7 sm:h-10 sm:w-10 text-[#435664]" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex justify-center sm:justify-start">
                  <StatusLabel status={transaction.status} size="lg" />
                </div>
                <p className="text-xs sm:text-sm text-[#435664] mt-2 px-2 sm:px-0">
                  {transaction.status === "shipped" && "Pesanan Anda sedang dalam perjalanan"}
                  {transaction.status === "packed" && "Pesanan Anda sedang dikemas oleh petani"}
                  {transaction.status === "completed" && "Pesanan telah selesai. Terima kasih!"}
                  {transaction.status === "unpaid" && "Segera selesaikan pembayaran Anda"}
                  {transaction.status === "cancelled" && "Pesanan ini telah dibatalkan"}
                </p>
              </div>
              <div className="text-center sm:text-right w-full sm:w-auto">
                <p className="text-xs sm:text-xs text-[#435664] mb-1">Total Pembayaran</p>
                <p className="text-xl sm:text-3xl font-bold text-[#303646] break-words">
                  Rp {transaction.totalPrice.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Shipping Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl sm:rounded-2xl border-2 border-[#435664]/20 overflow-hidden"
        >
          <div className="p-3 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-[#fdf8d4] to-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#435664] to-[#303646] rounded-lg">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h2 className="text-base sm:text-xl font-bold text-[#303646]">Informasi Pengiriman</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <TransactionDetailItem
              icon={Package}
              label="Metode Pengiriman"
              value={`${transaction.shippingMethod}${transaction.shippingCourier ? ` (${transaction.shippingCourier.toUpperCase()})` : ""}`}
            />
            {transaction.trackingNumber && (
              <TransactionDetailItem
                icon={Hash}
                label="Nomor Resi"
                value={
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="break-all text-sm sm:text-base font-mono">{transaction.trackingNumber}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(transaction.trackingNumber!)}
                        className="text-xs px-2 py-1 bg-[#435664]/20 text-[#435664] rounded font-bold hover:bg-[#435664]/30 transition-colors w-fit"
                      >
                        Salin
                      </button>
                      {transaction.trackingLink && (
                        <a
                          href={transaction.trackingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold hover:bg-blue-200 transition-colors w-fit flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Lacak
                        </a>
                      )}
                    </div>
                  </div>
                }
              />
            )}
            <TransactionDetailItem
              icon={MapPin}
              label="Alamat Pengiriman"
              value={
                <div className="space-y-1">
                  <p className="font-bold">{transaction.shippingAddress.name}</p>
                  <p className="text-sm text-gray-600">{transaction.shippingAddress.phone}</p>
                  <p className="text-sm text-gray-600">{transaction.shippingAddress.address}</p>
                  <p className="text-sm text-gray-600">
                    {transaction.shippingAddress.city}, {transaction.shippingAddress.province} {transaction.shippingAddress.postalCode}
                  </p>
                </div>
              }
            />
            <TransactionDetailItem
              icon={Package}
              label="Penjual"
              value={
                <div className="space-y-1">
                  <p className="font-bold">{transaction.farmName}</p>
                  <a
                    href={`https://wa.me/${transaction.farmerPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#435664] hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    Hubungi Penjual
                  </a>
                </div>
              }
            />
          </div>
        </motion.div>

        {/* Product Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border-2 border-[#435664]/20 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-[#fdf8d4] to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#435664] to-[#303646] rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#303646]">Rincian Produk</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {transaction.products.map((product, index) => (
                <div
                  key={product.id}
                  className={`flex gap-4 pb-4 ${index !== transaction.products.length - 1 ? "border-b-2 border-gray-50" : ""}`}
                >
                  <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#fdf8d4] to-[#f5efc0] rounded-xl overflow-hidden border border-[#435664]/10">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {product.slug ? (
                      <Link
                        href={`/market/products/${product.slug}`}
                        className="font-bold text-sm sm:text-base text-[#303646] hover:underline line-clamp-2"
                      >
                        {product.name}
                      </Link>
                    ) : (
                      <p className="font-bold text-sm sm:text-base text-[#303646] line-clamp-2">{product.name}</p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Varian: {product.variant}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs sm:text-sm text-gray-600">x{product.quantity}</p>
                      <p className="font-bold text-sm sm:text-base text-[#303646]">
                        Rp {(product.price * product.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Payment Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border-2 border-[#435664]/20 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-[#fdf8d4] to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#435664] to-[#303646] rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#303646]">Rincian Pembayaran</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({transaction.totalItems} produk)</span>
                <span className="font-bold text-[#303646]">Rp {transaction.subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span className="font-bold text-[#303646]">Rp {transaction.shippingCost.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Biaya Layanan (5%)</span>
                <span className="font-bold text-[#303646]">Rp {transaction.serviceFee.toLocaleString("id-ID")}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diskon</span>
                  <span className="font-bold text-green-600">- Rp {transaction.discount.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="pt-3 border-t-2 border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base sm:text-lg text-gray-700">Total Pembayaran</span>
                  <span className="font-bold text-xl sm:text-2xl text-[#303646]">
                    Rp {transaction.totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t-2 border-gray-50">
                <TransactionDetailItem icon={CreditCard} label="Metode Pembayaran" value={transaction.paymentMethod} />
              </div>
              <div className="pt-1">
                <TransactionDetailItem icon={Calendar} label="Tanggal Transaksi" value={transaction.date} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {transaction.status === "completed" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href={`/market/products/${transaction.products[0]?.slug || ""}#ulasan`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all active:scale-95"
            >
              <Star className="h-4 w-4 sm:h-5 sm:w-5" />
              Beri Ulasan
            </Link>
            <button
              onClick={handlePrintInvoice}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-[#435664]/30 text-[#435664] rounded-2xl font-bold text-sm hover:bg-[#435664]/10 transition-all active:scale-95"
            >
              <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
              Cetak Invoice
            </button>
          </motion.div>
        )}

        {transaction.status === "packed" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <a
              href={`https://wa.me/${transaction.farmerPhone}?text=${encodeURIComponent(
                `Halo, saya ingin menanyakan status pesanan saya dengan ID: ${transaction.orderId}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all active:scale-95"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              Hubungi Penjual via WhatsApp
            </a>
          </motion.div>
        )}

        {/* Print Invoice Button (Mobile) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="sm:hidden pb-2"
        >
          <button
            onClick={handlePrintInvoice}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-[#435664]/30 text-[#435664] rounded-2xl font-bold text-sm hover:bg-[#435664]/10 transition-all active:scale-95"
          >
            <Printer className="h-4 w-4" />
            Cetak Invoice
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
