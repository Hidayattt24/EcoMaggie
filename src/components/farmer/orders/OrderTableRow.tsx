import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  PackageCheck,
  User,
  Bike,
  Store,
  Ban,
  Eye,
  ArrowRight,
} from "lucide-react";

type OrderStatus =
  | "pending" | "paid" | "confirmed" | "processing"
  | "ready_pickup" | "shipped" | "delivered" | "completed" | "cancelled";

type ShippingType = "ecomaggie-delivery" | "self-pickup" | "expedition";

interface OrderProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string | null;
}

interface Order {
  id: string;
  orderId: string;
  status: OrderStatus;
  products: OrderProduct[];
  totalItems: number;
  totalPrice: number;
  netEarnings: number;
  shippingType: ShippingType;
  expeditionName?: string;
  trackingNumber?: string;
  date: string;
  createdAt: string;
  customer: { name: string; phone: string };
  shippingAddress: { city: string; province: string };
}

interface OrderTableRowProps {
  order: Order;
  index: number;
  onCancelClick: (order: Order, e: React.MouseEvent) => void;
}

const shippingTypeConfig: Record<ShippingType, {
  label: string;
  shortLabel: string;
  icon: typeof Bike;
  bgColor: string;
  textColor: string;
}> = {
  "ecomaggie-delivery": {
    label: "Eco-Maggie Delivery",
    shortLabel: "Delivery",
    icon: Bike,
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  "self-pickup": {
    label: "Ambil di Toko",
    shortLabel: "Pickup",
    icon: Store,
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  expedition: {
    label: "Ekspedisi Reguler",
    shortLabel: "Ekspedisi",
    icon: Package,
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
};

const statusConfig: Record<OrderStatus, {
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
  icon: typeof Clock;
}> = {
  pending: { label: "Belum Dibayar", color: "bg-amber-50 text-amber-700 border-amber-200", bgColor: "bg-amber-100", dotColor: "bg-amber-500", icon: Clock },
  paid: { label: "Dibayar", color: "bg-blue-50 text-blue-700 border-blue-200", bgColor: "bg-blue-100", dotColor: "bg-blue-500", icon: CheckCircle2 },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-50 text-blue-700 border-blue-200", bgColor: "bg-blue-100", dotColor: "bg-blue-500", icon: CheckCircle2 },
  processing: { label: "Dikemas", color: "bg-purple-50 text-purple-700 border-purple-200", bgColor: "bg-purple-100", dotColor: "bg-purple-500", icon: Package },
  ready_pickup: { label: "Siap Diambil", color: "bg-orange-50 text-orange-700 border-orange-200", bgColor: "bg-orange-100", dotColor: "bg-orange-500", icon: Store },
  shipped: { label: "Dikirim", color: "bg-[#a3af87]/20 text-[#435664] border-[#a3af87]", bgColor: "bg-[#a3af87]/20", dotColor: "bg-[#a3af87]", icon: Truck },
  delivered: { label: "Terkirim", color: "bg-teal-50 text-teal-700 border-teal-200", bgColor: "bg-teal-100", dotColor: "bg-teal-500", icon: PackageCheck },
  completed: { label: "Selesai", color: "bg-green-50 text-green-700 border-green-200", bgColor: "bg-green-100", dotColor: "bg-green-500", icon: CheckCircle2 },
  cancelled: { label: "Dibatalkan", color: "bg-red-50 text-red-700 border-red-200", bgColor: "bg-red-100", dotColor: "bg-red-500", icon: XCircle },
};

// Check if order is new (within last hour)
function isNewOrder(createdAt: string): boolean {
  const now = new Date();
  const created = new Date(createdAt);
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  return diffHours <= 1;
}

export const OrderTableRow = React.memo(({ order, index, onCancelClick }: OrderTableRowProps) => {
  const router = useRouter();
  const config = statusConfig[order.status];
  const shippingConfig = shippingTypeConfig[order.shippingType];
  const ShippingIcon = shippingConfig.icon;
  const isNew = isNewOrder(order.createdAt);

  return (
    <motion.tr
      key={order.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-[#a3af87]/30 hover:bg-[#fdf8d4]/30 transition-colors group cursor-pointer"
      onClick={() => router.push(`/farmer/orders/${order.orderId}`)}
    >
      {/* ID & Time */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div>
            <p className="font-semibold text-[#303646]">{order.orderId}</p>
            <p className="text-xs text-[#435664]">
              {new Date(order.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          {isNew && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
              NEW
            </motion.span>
          )}
        </div>
      </td>

      {/* Customer */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#a3af87] flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-[#303646]">{order.customer.name}</p>
            <p className="text-xs text-[#435664]">{order.customer.phone}</p>
          </div>
        </div>
      </td>

      {/* Products */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {order.products.slice(0, 2).map((product, idx) => (
              <div key={idx} className="w-8 h-8 rounded-lg border-2 border-white bg-[#fdf8d4]/50 overflow-hidden">
                {product.image ? (
                  <Image src={product.image} alt={product.name} width={32} height={32} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-[#a3af87]" /></div>
                )}
              </div>
            ))}
            {order.products.length > 2 && (
              <div className="w-8 h-8 rounded-lg border-2 border-white bg-[#a3af87]/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#435664]">+{order.products.length - 2}</span>
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-[#303646]">{order.totalItems} item</p>
            <p className="text-xs text-[#435664] truncate max-w-[120px]">{order.products[0]?.name}</p>
          </div>
        </div>
      </td>

      {/* Shipping */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${shippingConfig.bgColor} ${shippingConfig.textColor}`}>
            <ShippingIcon className="h-3.5 w-3.5" />
            {shippingConfig.shortLabel}
          </span>
        </div>
        {order.trackingNumber && (
          <p className="text-[10px] text-[#435664] mt-1 font-mono">{order.trackingNumber}</p>
        )}
      </td>

      {/* Total */}
      <td className="py-4 px-4">
        <p className="font-bold text-[#303646]">Rp {order.totalPrice.toLocaleString("id-ID")}</p>
        <p className="text-xs text-[#a3af87]">+Rp {order.netEarnings.toLocaleString("id-ID")}</p>
      </td>

      {/* Status */}
      <td className="py-4 px-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color}`}>
          <div className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}></div>
          <span className="text-xs font-semibold">{config.label}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/farmer/orders/${order.orderId}`); }}
            className="p-2 bg-[#fdf8d4]/50 rounded-lg hover:bg-[#a3af87]/30 transition-colors"
            title="Lihat Detail"
          >
            <Eye className="h-4 w-4 text-[#435664]" />
          </button>
          {!["completed", "cancelled"].includes(order.status) && (
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/farmer/orders/${order.orderId}`); }}
              className="p-2 bg-[#a3af87] rounded-lg hover:bg-[#435664] transition-colors"
              title="Proses Pesanan"
            >
              <ArrowRight className="h-4 w-4 text-white" />
            </button>
          )}
          {["pending", "paid", "confirmed", "processing", "ready_pickup"].includes(order.status) && (
            <button
              onClick={(e) => onCancelClick(order, e)}
              className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
              title="Batalkan Pesanan"
            >
              <Ban className="h-4 w-4 text-red-600" />
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if order data actually changed
  return (
    prevProps.order.id === nextProps.order.id &&
    prevProps.order.status === nextProps.order.status &&
    prevProps.index === nextProps.index
  );
});

OrderTableRow.displayName = "OrderTableRow";
