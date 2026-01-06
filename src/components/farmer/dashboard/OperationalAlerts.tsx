"use client";

import { useEffect, useState } from "react";
import { 
  Bell, 
  ShoppingBag, 
  PackageX, 
  Truck, 
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Package,
} from "lucide-react";
import Link from "next/link";
import { getOperationalAlerts } from "@/lib/api/farmer-dashboard.actions";
import type { Alert } from "@/lib/api/farmer-dashboard.actions";

export default function OperationalAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setIsLoading(true);
        const data = await getOperationalAlerts();
        setAlerts(data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        setAlerts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlerts();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchAlerts, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Get icon based on alert type
  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "new_order":
        return <ShoppingBag className="h-4 w-4" />;
      case "new_supply_request":
        return <Truck className="h-4 w-4" />;
      case "low_stock":
        return <PackageX className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get color based on alert type
  const getAlertColor = (type: Alert["type"]) => {
    switch (type) {
      case "new_order":
        return "bg-green-50 border-green-100 text-green-700";
      case "new_supply_request":
        return "bg-blue-50 border-blue-100 text-blue-700";
      case "low_stock":
        return "bg-amber-50 border-amber-100 text-amber-700";
      default:
        return "bg-gray-50 border-gray-100 text-gray-700";
    }
  };

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 10) return `${diffHours} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  // Count by type
  const newOrdersCount = alerts.filter((a) => a.type === "new_order").length;
  const supplyRequestsCount = alerts.filter((a) => a.type === "new_supply_request").length;
  const lowStockCount = alerts.filter((a) => a.type === "low_stock").length;

  // Show only first 3 if not expanded
  const displayedAlerts = isExpanded ? alerts : alerts.slice(0, 3);

  return (
    <div className="bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#A3AF87]/10 rounded-xl">
            <Bell className="h-5 w-5 text-[#A3AF87]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#303646] poppins-bold">
              Notifikasi
            </h3>
            <p className="text-xs text-gray-500">10 jam terakhir</p>
          </div>
        </div>
        {alerts.length > 0 && (
          <span className="px-2.5 py-1 bg-[#A3AF87]/10 text-[#A3AF87] text-xs font-semibold rounded-full">
            {alerts.length}
          </span>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <p className="text-lg font-bold text-green-600">{newOrdersCount}</p>
          <p className="text-[10px] text-gray-500">Pesanan</p>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <p className="text-lg font-bold text-blue-600">{supplyRequestsCount}</p>
          <p className="text-[10px] text-gray-500">Pickup</p>
        </div>
        <div className="text-center p-2 bg-amber-50 rounded-lg">
          <p className="text-lg font-bold text-amber-600">{lowStockCount}</p>
          <p className="text-[10px] text-gray-500">Stok</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {isLoading ? (
          <div className="text-center py-6 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3AF87] mx-auto mb-2"></div>
            <p className="text-sm">Memuat notifikasi...</p>
          </div>
        ) : displayedAlerts.length > 0 ? (
          displayedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-xl border ${getAlertColor(
                alert.type
              )} hover:shadow-sm transition-shadow`}
            >
              <div className="p-2 rounded-lg bg-white/50">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#303646] mb-1">
                  {alert.message}
                </p>
                {alert.metadata && (
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-1">
                    {alert.metadata.customerName && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {alert.metadata.customerName}
                      </span>
                    )}
                    {alert.metadata.amount && (
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {alert.type === "new_supply_request"
                          ? `${alert.metadata.amount}kg`
                          : `Rp ${alert.metadata.amount.toLocaleString("id-ID")}`}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getTimeAgo(alert.createdAt)}
                </p>
              </div>
              {alert.type === "new_order" && alert.metadata?.orderId && (
                <Link
                  href={`/farmer/orders/${alert.metadata.orderId}`}
                  className="text-xs font-medium text-[#A3AF87] hover:underline whitespace-nowrap"
                >
                  Lihat
                </Link>
              )}
              {alert.type === "new_supply_request" && alert.metadata?.supplyId && (
                <Link
                  href={`/farmer/supply-monitoring`}
                  className="text-xs font-medium text-[#A3AF87] hover:underline whitespace-nowrap"
                >
                  Proses
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tidak ada notifikasi</p>
          </div>
        )}
      </div>

      {/* Expand/Collapse Button */}
      {alerts.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 text-sm font-medium text-[#A3AF87] hover:bg-[#A3AF87]/5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Tampilkan Lebih Sedikit
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Lihat Semua ({alerts.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}
