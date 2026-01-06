"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ShoppingBag,
  PackageX,
  Truck,
  Clock,
  User,
  Package,
  X,
  AlertTriangle,
} from "lucide-react";
import { getOperationalAlerts } from "@/lib/api/farmer-dashboard.actions";
import type { Alert } from "@/lib/api/farmer-dashboard.actions";

export default function NotificationDropdown() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch alerts when dropdown opens
  useEffect(() => {
    if (isOpen && alerts.length === 0) {
      fetchAlerts();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

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
        return {
          bg: "bg-green-50",
          border: "border-green-100",
          text: "text-green-700",
          iconBg: "bg-green-100",
        };
      case "new_supply_request":
        return {
          bg: "bg-blue-50",
          border: "border-blue-100",
          text: "text-blue-700",
          iconBg: "bg-blue-100",
        };
      case "low_stock":
        return {
          bg: "bg-amber-50",
          border: "border-amber-100",
          text: "text-amber-700",
          iconBg: "bg-amber-100",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-100",
          text: "text-gray-700",
          iconBg: "bg-gray-100",
        };
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

  const unreadCount = alerts.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        title="Notifikasi"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div className="fixed inset-0 bg-black/20 z-40 sm:hidden" onClick={() => setIsOpen(false)} />

          {/* Dropdown Content */}
          <div className="fixed sm:absolute top-0 sm:top-full right-0 sm:right-0 mt-0 sm:mt-2 w-full sm:w-96 max-h-screen sm:max-h-[600px] bg-white sm:rounded-2xl shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white sm:rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#A3AF87]/10 rounded-lg">
                  <Bell className="h-5 w-5 text-[#A3AF87]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#303646]">
                    Notifikasi
                  </h3>
                  <p className="text-xs text-gray-500">10 jam terakhir</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 p-4 border-b border-gray-100 bg-gray-50">
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-lg font-bold text-green-600">
                  {alerts.filter((a) => a.type === "new_order").length}
                </p>
                <p className="text-[10px] text-gray-500">Pesanan</p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-lg font-bold text-blue-600">
                  {alerts.filter((a) => a.type === "new_supply_request").length}
                </p>
                <p className="text-[10px] text-gray-500">Pickup</p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <p className="text-lg font-bold text-amber-600">
                  {alerts.filter((a) => a.type === "low_stock").length}
                </p>
                <p className="text-[10px] text-gray-500">Stok</p>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3AF87] mx-auto mb-2"></div>
                  <p className="text-sm">Memuat notifikasi...</p>
                </div>
              ) : alerts.length > 0 ? (
                alerts.map((alert) => {
                  const colors = getAlertColor(alert.type);
                  
                  // Determine navigation URL based on alert type
                  const getNavigationUrl = () => {
                    if (alert.type === "new_order" && alert.metadata?.orderNumber) {
                      return `/farmer/orders/${alert.metadata.orderNumber}`;
                    }
                    if (alert.type === "new_supply_request") {
                      return "/farmer/supply-monitoring";
                    }
                    if (alert.type === "low_stock") {
                      return "/farmer/products";
                    }
                    return null;
                  };
                  
                  const navUrl = getNavigationUrl();
                  
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${colors.bg} ${colors.border} hover:shadow-sm transition-all cursor-pointer active:scale-[0.98]`}
                      onClick={() => {
                        setIsOpen(false);
                        if (navUrl) {
                          router.push(navUrl);
                        }
                      }}
                    >
                      <div className={`p-2 rounded-lg ${colors.iconBg} flex-shrink-0`}>
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
                      {navUrl && (
                        <span className="text-xs font-medium text-[#A3AF87] whitespace-nowrap flex-shrink-0">
                          {alert.type === "new_order" ? "Lihat" : alert.type === "new_supply_request" ? "Proses" : "Kelola"}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tidak ada notifikasi</p>
                  <p className="text-xs mt-1">Notifikasi akan muncul di sini</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 sm:rounded-b-2xl">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Optional: Navigate to full notifications page
                  }}
                  className="w-full py-2 text-sm font-medium text-[#A3AF87] hover:bg-white rounded-lg transition-colors"
                >
                  Lihat Semua Notifikasi
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
