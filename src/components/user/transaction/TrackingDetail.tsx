"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Building2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useState } from "react";

interface TrackingEvent {
  time: string;
  date: string;
  description: string;
  location: string;
  status: "completed" | "current" | "pending";
}

interface TrackingDetailProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    orderId: string;
    farmName: string;
    trackingNumber?: string;
    shippingMethod: string;
    shippingCourier?: string;
  };
  trackingData?: {
    waybillId?: string;
    trackingLink?: string;
    courier?: {
      name?: string;
      company?: string;
    };
    history?: Array<{
      note: string;
      updatedAt: string;
      status?: string;
    }>;
  } | null;
}

export function TrackingDetail({
  isOpen,
  onClose,
  transaction,
  trackingData,
}: TrackingDetailProps) {
  const [copied, setCopied] = useState(false);

  const trackingNumber = trackingData?.waybillId || transaction.trackingNumber;
  const trackingLink = trackingData?.trackingLink;
  const courierName = trackingData?.courier?.name || transaction.shippingCourier?.toUpperCase() || "";

  // Transform history to tracking events
  const trackingEvents: TrackingEvent[] = (trackingData?.history || []).map((h, index) => {
    const date = new Date(h.updatedAt);
    return {
      time: date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      date: date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      description: h.note,
      location: "Indonesia",
      status: index === 0 ? "current" : "completed",
    };
  });

  const copyTrackingNumber = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Mobile Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-[#435664]/20 px-6 py-4 rounded-t-3xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-[#303646]">Lacak Pesanan</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#435664]/10 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  No. Pesanan: <span className="font-bold text-[#303646]">{transaction.orderId}</span>
                </p>
                {trackingNumber && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-gray-600">
                      No. Resi: <span className="font-bold text-[#303646] font-mono">{trackingNumber}</span>
                    </p>
                    <button
                      onClick={copyTrackingNumber}
                      className="p-1.5 hover:bg-[#435664]/10 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    {trackingLink && (
                      <a
                        href={trackingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                      </a>
                    )}
                  </div>
                )}
                {courierName && (
                  <p className="text-sm text-gray-600">
                    Kurir: <span className="font-bold text-[#303646]">{courierName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {trackingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 text-center">Belum ada riwayat pengiriman</p>
                  {trackingLink && (
                    <a
                      href={trackingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-2xl text-sm font-bold flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Lacak di Website Kurir
                    </a>
                  )}
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-[#303646] mb-4 mt-4">Riwayat Pengiriman</h3>
                  <div className="space-y-4">
                    {trackingEvents.map((event, index) => (
                      <div key={index} className="relative flex gap-4">
                        {index < trackingEvents.length - 1 && (
                          <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-[#435664]/20" />
                        )}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              event.status === "current"
                                ? "bg-gradient-to-br from-[#435664] to-[#303646] shadow-lg shadow-[#435664]/30"
                                : "bg-[#fdf8d4] border-2 border-[#435664]/20"
                            }`}
                          >
                            {event.status === "current" ? (
                              <Truck className="h-5 w-5 text-white" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-[#435664]" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className={`text-sm font-bold ${
                              event.status === "current" ? "text-[#303646]" : "text-gray-700"
                            }`}>
                              {event.time}
                            </span>
                            <span className="text-xs text-gray-500">{event.date}</span>
                          </div>
                          <p className={`text-sm font-bold mb-1 ${
                            event.status === "current" ? "text-[#303646]" : "text-gray-700"
                          }`}>
                            {event.description}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Building2 className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Desktop Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="hidden lg:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-[#435664]/20"
          >
            <div className="sticky top-0 bg-white border-b border-[#435664]/20 px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-[#303646]">Lacak Pesanan</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#435664]/10 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="flex gap-6 flex-wrap">
                <p className="text-sm text-gray-600">
                  No. Pesanan: <span className="font-bold text-[#303646]">{transaction.orderId}</span>
                </p>
                {trackingNumber && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">
                      No. Resi: <span className="font-bold text-[#303646] font-mono">{trackingNumber}</span>
                    </p>
                    <button
                      onClick={copyTrackingNumber}
                      className="p-1.5 hover:bg-[#435664]/10 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    {trackingLink && (
                      <a
                        href={trackingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lacak di website kurir"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                      </a>
                    )}
                  </div>
                )}
                {courierName && (
                  <p className="text-sm text-gray-600">
                    Kurir: <span className="font-bold text-[#303646]">{courierName}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-100px)]">
              <div className="p-6">
                {trackingEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 text-center mb-4">Belum ada riwayat pengiriman</p>
                    {trackingLink && (
                      <a
                        href={trackingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-2xl text-sm font-bold flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Lacak di Website Kurir
                      </a>
                    )}
                  </div>
                ) : (
                  <>
                    <h3 className="text-sm font-bold text-[#303646] mb-4">Riwayat Pengiriman</h3>
                    <div className="space-y-4">
                      {trackingEvents.map((event, index) => (
                        <div key={index} className="relative flex gap-4">
                          {index < trackingEvents.length - 1 && (
                            <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-[#435664]/20" />
                          )}
                          <div className="flex-shrink-0">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                event.status === "current"
                                  ? "bg-gradient-to-br from-[#435664] to-[#303646] shadow-lg shadow-[#435664]/30"
                                  : "bg-[#fdf8d4] border-2 border-[#435664]/20"
                              }`}
                            >
                              {event.status === "current" ? (
                                <Truck className="h-5 w-5 text-white" />
                              ) : (
                                <CheckCircle2 className="h-5 w-5 text-[#435664]" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className={`text-sm font-bold ${
                                event.status === "current" ? "text-[#303646]" : "text-gray-700"
                              }`}>
                                {event.time}
                              </span>
                              <span className="text-xs text-gray-500">{event.date}</span>
                            </div>
                            <p className={`text-sm font-bold mb-1 ${
                              event.status === "current" ? "text-[#303646]" : "text-gray-700"
                            }`}>
                              {event.description}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Building2 className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
