"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Star,
  ExternalLink,
  PackageCheck,
  Loader2,
  X,
  PartyPopper,
} from "lucide-react";
import Link from "next/link";
import { StatusLabel } from "@/components/user/transaction/StatusLabel";
import { TransactionDetailItem } from "@/components/user/transaction/TransactionDetailItem";
import { generateInvoicePDF } from "@/utils/generateInvoicePDF";
import { getCustomerOrderDetail, confirmOrderReceivedByCustomer } from "@/lib/api/orders.actions";
import type { Order as DbOrder } from "@/lib/api/orders.actions";
import { OrderDetailSkeleton } from "@/components/user/orders/OrdersSkeleton";

// ============================================
// TYPES
// ============================================
type OrderStatus = "unpaid" | "packed" | "shipped" | "completed" | "cancelled";

interface Product {
  id: number;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
  slug: string;
}

interface Order {
  id: string;
  orderId: string;
  farmName: string;
  farmerId: number;
  farmerPhone: string;
  status: OrderStatus;
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

/**
 * Map database status to UI status
 */
function mapDbStatusToUiStatus(dbStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
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

/**
 * Parse address string to components
 */
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

/**
 * Transform database order to UI order format
 */
function transformDbOrderToOrder(dbOrder: DbOrder): Order {
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
    farmerPhone: "6282172319892", // Eco-maggie contact
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
// CONFETTI COMPONENT
// ============================================
function Confetti({ isActive }: { isActive: boolean }) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    color: string;
    size: number;
    rotation: number;
  }>>([]);

  useEffect(() => {
    if (isActive) {
      const colors = ["#A3AF87", "#FDF8D4", "#5a6c5b", "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"];
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
      }));
      setParticles(newParticles);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -20, x: `${particle.x}vw`, opacity: 1, rotate: 0 }}
          animate={{
            y: "110vh",
            rotate: particle.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3,
            delay: particle.delay,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// CONFIRM RECEIVED MODAL
// ============================================
function ConfirmReceivedModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  orderId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  orderId: string;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#A3AF87] to-[#95a17a] rounded-full flex items-center justify-center">
                <PackageCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#5a6c5b]">Konfirmasi Penerimaan</h3>
                <p className="text-sm text-gray-500">{orderId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="bg-[#A3AF87]/10 border border-[#A3AF87]/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <PartyPopper className="h-5 w-5 text-[#5a6c5b] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#5a6c5b]">
                <p className="font-semibold mb-1">Pesanan sudah sampai?</p>
                <p>Dengan mengkonfirmasi, Anda menyatakan bahwa pesanan telah diterima dengan baik. Dana akan diteruskan ke penjual.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Ya, Sudah Diterima
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>("");

  useEffect(() => {
    loadOrderDetail();
  }, [resolvedParams.id]);

  const loadOrderDetail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getCustomerOrderDetail(resolvedParams.id);

      if (result.success && result.data) {
        const transformedOrder = transformDbOrderToOrder(result.data);
        setOrder(transformedOrder);
        setDbStatus(result.data.status); // Store original DB status

        // Generate tracking link based on courier
        if (result.data.shipping_tracking_number && result.data.shipping_courier) {
          const courierCode = result.data.shipping_courier.toLowerCase();
          const waybillId = result.data.shipping_tracking_number;
          
          // Generate tracking link
          const trackingLinks: Record<string, string> = {
            jne: `https://www.jne.co.id/id/tracking/trace/${waybillId}`,
            jnt: `https://www.jet.co.id/track/${waybillId}`,
            sicepat: `https://www.sicepat.com/checkAwb/${waybillId}`,
            anteraja: `https://anteraja.id/tracking/${waybillId}`,
            ninja: `https://www.ninjaxpress.co/id-id/tracking?id=${waybillId}`,
            id_express: `https://www.idexpress.com/tracking/${waybillId}`,
          };
          
          transformedOrder.trackingLink = trackingLinks[courierCode] || `https://www.google.com/search?q=${waybillId}+tracking`;
          setOrder({ ...transformedOrder });
        }
      } else {
        setError(result.message || "Pesanan tidak ditemukan");
      }
    } catch (err) {
      console.error("Error loading order:", err);
      setError("Terjadi kesalahan saat memuat pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReceived = async () => {
    if (!order) return;
    
    setIsConfirming(true);
    try {
      const result = await confirmOrderReceivedByCustomer(order.orderId);
      
      if (result.success) {
        setShowConfirmModal(false);
        setShowConfetti(true);
        
        // Wait for confetti animation then redirect to review
        setTimeout(() => {
          const productSlug = result.data?.productSlug || order.products[0]?.slug;
          if (productSlug) {
            router.push(`/market/products/${productSlug}#ulasan`);
          } else {
            // Reload to show completed status
            loadOrderDetail();
          }
        }, 2500);
      } else {
        setError(result.message || "Gagal mengkonfirmasi penerimaan");
        setShowConfirmModal(false);
      }
    } catch (err) {
      console.error("Error confirming receipt:", err);
      setError("Terjadi kesalahan");
      setShowConfirmModal(false);
    } finally {
      setIsConfirming(false);
    }
  };

  // Check if order can be confirmed as received
  const canConfirmReceived = dbStatus === "shipped" || dbStatus === "delivered" || dbStatus === "ready_pickup";

  const handlePrintInvoice = () => {
    if (!order) return;

    const fullAddress = `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}`;

    generateInvoicePDF({
      orderId: order.orderId,
      orderDate: order.date,
      productName: order.products[0]?.name || "",
      quantity: order.totalItems,
      price: order.products[0]?.price || 0,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      shippingMethod: order.shippingMethod,
      discount: order.discount,
      total: order.totalPrice,
      customerName: order.shippingAddress.name,
      customerPhone: order.shippingAddress.phone,
      customerAddress: fullAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus:
        order.status === "completed"
          ? "paid"
          : order.status === "cancelled"
          ? "failed"
          : "pending",
      items: order.products.map((p) => ({
        name: p.name,
        variant: p.variant,
        quantity: p.quantity,
        unit: "pcs",
        price: p.price,
        subtotal: p.price * p.quantity,
      })),
      trackingNumber: order.trackingNumber,
    });
  };

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A3AF87]/10 via-white to-[#A3AF87]/5 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#5a6c5b] mb-2">
            Pesanan Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Maaf, pesanan yang Anda cari tidak ditemukan."}
          </p>
          <button
            onClick={() => router.push("/transaction")}
            className="px-6 py-3 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-xl font-bold hover:shadow-lg transition-all"
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

  const StatusIconComponent = statusIcons[order.status];

  return (
    <>
      {/* Confetti Effect */}
      <Confetti isActive={showConfetti} />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-br from-[#A3AF87]/10 via-white to-[#A3AF87]/5 pb-6"
      >
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10 lg:static">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 sm:p-2.5 hover:bg-[#A3AF87]/10 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-[#5a6c5b]" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-[#5a6c5b] truncate">
                Detail Pesanan
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 truncate">
                {order.orderId}
              </p>
            </div>
            <button
              onClick={handlePrintInvoice}
              className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-[#A3AF87]/50 text-[#5a6c5b] rounded-lg font-bold text-sm hover:bg-[#A3AF87]/10 transition-all flex-shrink-0"
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
            className="bg-gradient-to-br from-[#A3AF87]/20 to-[#A3AF87]/10 rounded-xl sm:rounded-2xl p-4 sm:p-8 border-2 border-[#A3AF87]/30"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <StatusIconComponent className="h-7 w-7 sm:h-10 sm:w-10 text-[#5a6c5b]" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex justify-center sm:justify-start">
                  <StatusLabel status={order.status} size="lg" />
                </div>
                <p className="text-xs sm:text-sm text-[#5a6c5b] mt-2 px-2 sm:px-0">
                  {order.status === "shipped" && "Pesanan Anda sedang dalam perjalanan"}
                  {order.status === "packed" && "Pesanan Anda sedang dikemas oleh petani"}
                  {order.status === "completed" && "Pesanan telah selesai. Terima kasih!"}
                  {order.status === "unpaid" && "Segera selesaikan pembayaran Anda"}
                  {order.status === "cancelled" && "Pesanan ini telah dibatalkan"}
                </p>
              </div>
              <div className="text-center sm:text-right w-full sm:w-auto">
                <p className="text-xs sm:text-xs text-[#5a6c5b] mb-1">Total Pembayaran</p>
                <p className="text-xl sm:text-3xl font-bold text-[#5a6c5b] break-words">
                  Rp {order.totalPrice.toLocaleString("id-ID")}
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
          className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 overflow-hidden"
        >
          <div className="p-3 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-[#A3AF87]/10 to-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-[#A3AF87] rounded-lg">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h2 className="text-base sm:text-xl font-bold text-[#5a6c5b]">
                Informasi Pengiriman
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <TransactionDetailItem
              icon={Package}
              label="Metode Pengiriman"
              value={`${order.shippingMethod}${order.shippingCourier ? ` (${order.shippingCourier.toUpperCase()})` : ""}`}
            />
            {order.trackingNumber && (
              <TransactionDetailItem
                icon={Hash}
                label="Nomor Resi"
                value={
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="break-all text-sm sm:text-base font-mono">
                      {order.trackingNumber}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(order.trackingNumber!)}
                        className="text-xs px-2 py-1 bg-[#A3AF87]/20 text-[#5a6c5b] rounded font-bold hover:bg-[#A3AF87]/30 transition-colors w-fit"
                      >
                        Salin
                      </button>
                      {order.trackingLink && (
                        <a
                          href={order.trackingLink}
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
                  <p className="font-bold">{order.shippingAddress.name}</p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                  </p>
                </div>
              }
            />
            <TransactionDetailItem
              icon={Package}
              label="Penjual"
              value={
                <div className="space-y-1">
                  <p className="font-bold">{order.farmName}</p>
                  <a
                    href={`https://wa.me/${order.farmerPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#5a6c5b] hover:underline"
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
          className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-[#A3AF87]/10 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#A3AF87] rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#5a6c5b]">
                Rincian Produk
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {order.products.map((product, index) => (
                <div
                  key={product.id}
                  className={`flex gap-4 pb-4 ${
                    index !== order.products.length - 1 ? "border-b-2 border-gray-50" : ""
                  }`}
                >
                  <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#A3AF87]/20 to-[#A3AF87]/10 rounded-xl overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {product.slug ? (
                      <Link
                        href={`/market/products/${product.slug}`}
                        className="font-bold text-sm sm:text-base text-[#5a6c5b] hover:underline line-clamp-2"
                      >
                        {product.name}
                      </Link>
                    ) : (
                      <p className="font-bold text-sm sm:text-base text-[#5a6c5b] line-clamp-2">
                        {product.name}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Varian: {product.variant}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs sm:text-sm text-gray-600">x{product.quantity}</p>
                      <p className="font-bold text-sm sm:text-base text-[#5a6c5b]">
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
          className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b-2 border-gray-50 bg-gradient-to-r from-[#A3AF87]/10 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#A3AF87] rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#5a6c5b]">
                Rincian Pembayaran
              </h2>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({order.totalItems} produk)</span>
                <span className="font-bold text-[#5a6c5b]">
                  Rp {order.subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span className="font-bold text-[#5a6c5b]">
                  Rp {order.shippingCost.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Biaya Layanan (5%)</span>
                <span className="font-bold text-[#5a6c5b]">
                  Rp {order.serviceFee.toLocaleString("id-ID")}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diskon</span>
                  <span className="font-bold text-green-600">
                    - Rp {order.discount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t-2 border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base sm:text-lg text-gray-700">
                    Total Pembayaran
                  </span>
                  <span className="font-bold text-xl sm:text-2xl text-[#5a6c5b]">
                    Rp {order.totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t-2 border-gray-50">
                <TransactionDetailItem
                  icon={CreditCard}
                  label="Metode Pembayaran"
                  value={order.paymentMethod}
                />
              </div>
              <div className="pt-1">
                <TransactionDetailItem
                  icon={Calendar}
                  label="Tanggal Transaksi"
                  value={order.date}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons based on Status */}
        {canConfirmReceived && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-[#A3AF87]/20 to-[#A3AF87]/10 rounded-2xl p-4 sm:p-6 border-2 border-[#A3AF87]/30"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <PackageCheck className="h-5 w-5 text-[#5a6c5b]" />
                  <h3 className="font-bold text-[#5a6c5b]">Pesanan Sudah Sampai?</h3>
                </div>
                <p className="text-sm text-[#5a6c5b]/80">
                  Konfirmasi penerimaan pesanan Anda untuk menyelesaikan transaksi
                </p>
              </div>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                Pesanan Diterima
              </button>
            </div>
          </motion.div>
        )}

        {order.status === "completed" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href={`/market/products/${order.products[0]?.slug || ""}#ulasan`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
            >
              <Star className="h-4 w-4 sm:h-5 sm:w-5" />
              Beri Ulasan
            </Link>
            <button
              onClick={handlePrintInvoice}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-[#A3AF87]/50 text-[#5a6c5b] rounded-xl font-bold text-sm hover:bg-[#A3AF87]/10 transition-all active:scale-95"
            >
              <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
              Cetak Invoice
            </button>
          </motion.div>
        )}

        {order.status === "packed" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <a
              href={`https://wa.me/${order.farmerPhone}?text=${encodeURIComponent(
                `Halo, saya ingin menanyakan status pesanan saya dengan ID: ${order.orderId}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
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
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-[#A3AF87]/50 text-[#5a6c5b] rounded-xl font-bold text-sm hover:bg-[#A3AF87]/10 transition-all active:scale-95"
          >
            <Printer className="h-4 w-4" />
            Cetak Invoice
          </button>
        </motion.div>
      </div>
    </motion.div>

    {/* Confirm Received Modal */}
    <ConfirmReceivedModal
      isOpen={showConfirmModal}
      onClose={() => setShowConfirmModal(false)}
      onConfirm={handleConfirmReceived}
      isLoading={isConfirming}
      orderId={order.orderId}
    />
    </>
  );
}
