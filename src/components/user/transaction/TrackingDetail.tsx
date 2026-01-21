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
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";

// ============================================
// COURIER TRACKING CONFIG
// ============================================

interface CourierConfig {
  name: string;
  trackingUrl: (awb: string) => string;
  logo?: string;
  color: string;
}

const COURIER_CONFIGS: Record<string, CourierConfig> = {
  jne: {
    name: "JNE",
    trackingUrl: (awb) => `https://www.jne.co.id/id/tracking/trace/${awb}`,
    color: "#E62129",
  },
  jnt: {
    name: "J&T Express",
    trackingUrl: (awb) => `https://www.jet.co.id/track?awb=${awb}`,
    color: "#D7192D",
  },
  "j&t": {
    name: "J&T Express",
    trackingUrl: (awb) => `https://www.jet.co.id/track?awb=${awb}`,
    color: "#D7192D",
  },
  sicepat: {
    name: "SiCepat",
    trackingUrl: (awb) => `https://www.sicepat.com/checkAwb/${awb}`,
    color: "#5A4FCF",
  },
  anteraja: {
    name: "AnterAja",
    trackingUrl: (awb) => `https://anteraja.id/tracking?awb=${awb}`,
    color: "#F15B5A",
  },
  ninja: {
    name: "Ninja Xpress",
    trackingUrl: (awb) => `https://www.ninjaxpress.co/id-id/tracking?id=${awb}`,
    color: "#00A651",
  },
  "ninja xpress": {
    name: "Ninja Xpress",
    trackingUrl: (awb) => `https://www.ninjaxpress.co/id-id/tracking?id=${awb}`,
    color: "#00A651",
  },
  idexpress: {
    name: "ID Express",
    trackingUrl: (awb) => `https://www.idexpress.com/tracking/${awb}`,
    color: "#FF6B00",
  },
  "id express": {
    name: "ID Express",
    trackingUrl: (awb) => `https://www.idexpress.com/tracking/${awb}`,
    color: "#FF6B00",
  },
  pos: {
    name: "POS Indonesia",
    trackingUrl: (awb) => `https://www.posindonesia.co.id/id/tracking?barcode=${awb}`,
    color: "#ED1C24",
  },
  "pos indonesia": {
    name: "POS Indonesia",
    trackingUrl: (awb) => `https://www.posindonesia.co.id/id/tracking?barcode=${awb}`,
    color: "#ED1C24",
  },
  sap: {
    name: "SAP Express",
    trackingUrl: (awb) => `https://www.sapexpress.co.id/tracking?resi=${awb}`,
    color: "#0066B3",
  },
  "sap express": {
    name: "SAP Express",
    trackingUrl: (awb) => `https://www.sapexpress.co.id/tracking?resi=${awb}`,
    color: "#0066B3",
  },
  lion: {
    name: "Lion Parcel",
    trackingUrl: (awb) => `https://lionparcel.com/tracking?barcode=${awb}`,
    color: "#FFCC00",
  },
  "lion parcel": {
    name: "Lion Parcel",
    trackingUrl: (awb) => `https://lionparcel.com/tracking?barcode=${awb}`,
    color: "#FFCC00",
  },
};

/**
 * Detect courier from courier name or tracking number
 */
function detectCourier(courierName?: string, trackingNumber?: string): CourierConfig | null {
  if (courierName) {
    const normalized = courierName.toLowerCase().trim();
    return COURIER_CONFIGS[normalized] || null;
  }

  // Fallback: Try to detect from AWB pattern
  if (trackingNumber) {
    const awb = trackingNumber.toUpperCase();
    if (awb.startsWith("JNE") || awb.match(/^\d{10,15}$/)) return COURIER_CONFIGS.jne;
    if (awb.startsWith("JT") || awb.match(/^JT\d+$/)) return COURIER_CONFIGS.jnt;
    if (awb.startsWith("000")) return COURIER_CONFIGS.sicepat;
    if (awb.startsWith("AA")) return COURIER_CONFIGS.anteraja;
    if (awb.startsWith("NLIDAP")) return COURIER_CONFIGS.ninja;
  }

  return null;
}

// ============================================
// TYPES
// ============================================

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

// ============================================
// COMPONENT
// ============================================

export function TrackingDetail({
  isOpen,
  onClose,
  transaction,
  trackingData,
}: TrackingDetailProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackingNumber = trackingData?.waybillId || transaction.trackingNumber;
  const courierFromData = trackingData?.courier?.company || transaction.shippingCourier;

  // Detect courier configuration
  const courierConfig = detectCourier(courierFromData, trackingNumber);
  const courierName = courierConfig?.name || courierFromData?.toUpperCase() || "Kurir";
  const officialTrackingUrl = courierConfig && trackingNumber
    ? courierConfig.trackingUrl(trackingNumber)
    : null;

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

  // Check if we have tracking data
  const hasTrackingData = trackingEvents.length > 0;
  const showFallback = !hasTrackingData && officialTrackingUrl;

  const copyTrackingNumber = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openOfficialTracking = () => {
    if (officialTrackingUrl) {
      window.open(officialTrackingUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

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
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Mobile Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#435664] to-[#303646] px-6 py-5 rounded-t-3xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Lacak Pesanan</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Info Cards */}
              <div className="space-y-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="text-xs text-white/70 mb-1">No. Pesanan</p>
                  <p className="text-sm font-bold text-white">{transaction.orderId}</p>
                </div>

                {trackingNumber && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <p className="text-xs text-white/70 mb-1">No. Resi</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-white font-mono flex-1">{trackingNumber}</p>
                      <button
                        onClick={copyTrackingNumber}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-300" />
                        ) : (
                          <Copy className="h-4 w-4 text-white/70" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {courierConfig && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <p className="text-xs text-white/70 mb-1">Kurir</p>
                    <p className="text-sm font-bold text-white">{courierName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-260px)] px-6 pb-6">
              {/* Fallback: No tracking data - Show official website button */}
              {showFallback && (
                <div className="mt-6">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Tracking Belum Tersedia
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Data tracking belum tersedia di sistem kami.
                      Silakan lacak langsung di website resmi {courierName}.
                    </p>
                    <button
                      onClick={openOfficialTracking}
                      className="w-full px-6 py-3 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-5 w-5" />
                      Lacak di Website {courierName}
                    </button>
                  </div>
                </div>
              )}

              {/* Has tracking data */}
              {hasTrackingData && (
                <>
                  <div className="flex items-center justify-between mt-6 mb-4">
                    <h3 className="text-base font-bold text-[#303646]">Riwayat Pengiriman</h3>
                    {officialTrackingUrl && (
                      <button
                        onClick={openOfficialTracking}
                        className="text-xs text-[#a3af87] hover:text-[#435664] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Website Kurir
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {trackingEvents.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex gap-4"
                      >
                        {index < trackingEvents.length - 1 && (
                          <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-[#a3af87] to-transparent" />
                        )}

                        <div className="flex-shrink-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              event.status === "current"
                                ? "bg-gradient-to-br from-[#a3af87] to-[#8a9670] shadow-lg shadow-[#a3af87]/30 scale-110"
                                : "bg-[#fdf8d4] border-2 border-[#a3af87]/30"
                            }`}
                          >
                            {event.status === "current" ? (
                              <Truck className="h-5 w-5 text-white" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-[#a3af87]" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 pb-6">
                          <div className={`${
                            event.status === "current"
                              ? "bg-gradient-to-r from-[#fdf8d4] to-transparent"
                              : ""
                          } p-3 rounded-xl -ml-1`}>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className={`text-sm font-bold ${
                                event.status === "current" ? "text-[#303646]" : "text-gray-700"
                              }`}>
                                {event.time}
                              </span>
                              <span className="text-xs text-gray-500">{event.date}</span>
                            </div>
                            <p className={`text-sm font-semibold mb-1 ${
                              event.status === "current" ? "text-[#303646]" : "text-gray-700"
                            }`}>
                              {event.description}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* No tracking data and no courier config */}
              {!hasTrackingData && !showFallback && (
                <div className="mt-6">
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-base font-bold text-gray-700 mb-2">
                      Belum Ada Tracking
                    </h3>
                    <p className="text-sm text-gray-500">
                      Informasi tracking akan muncul setelah paket dikirim oleh kurir.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Desktop Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="hidden lg:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border border-[#435664]/20"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#435664] to-[#303646] px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Lacak Pesanan</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="text-xs text-white/70 mb-1">No. Pesanan</p>
                  <p className="text-sm font-bold text-white">{transaction.orderId}</p>
                </div>

                {trackingNumber && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <p className="text-xs text-white/70 mb-1">No. Resi</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-white font-mono flex-1 truncate">{trackingNumber}</p>
                      <button
                        onClick={copyTrackingNumber}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                        title="Copy nomor resi"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-300" />
                        ) : (
                          <Copy className="h-4 w-4 text-white/70" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {courierConfig && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <p className="text-xs text-white/70 mb-1">Kurir</p>
                    <p className="text-sm font-bold text-white">{courierName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="p-8">
                {/* Fallback: No tracking data */}
                {showFallback && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Package className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Tracking Belum Tersedia
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                      Data tracking belum tersedia di sistem kami.
                      Silakan lacak langsung di website resmi {courierName} untuk informasi terkini.
                    </p>
                    <button
                      onClick={openOfficialTracking}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#a3af87]/30 transition-all"
                    >
                      <ExternalLink className="h-5 w-5" />
                      Lacak di Website {courierName}
                    </button>
                  </div>
                )}

                {/* Has tracking data */}
                {hasTrackingData && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-[#303646]">Riwayat Pengiriman</h3>
                      {officialTrackingUrl && (
                        <button
                          onClick={openOfficialTracking}
                          className="text-sm text-[#a3af87] hover:text-[#435664] font-semibold flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-[#fdf8d4]"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Buka Website {courierName}
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {trackingEvents.map((event, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex gap-4"
                        >
                          {index < trackingEvents.length - 1 && (
                            <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-[#a3af87] to-transparent" />
                          )}

                          <div className="flex-shrink-0">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                event.status === "current"
                                  ? "bg-gradient-to-br from-[#a3af87] to-[#8a9670] shadow-lg shadow-[#a3af87]/30 scale-110"
                                  : "bg-[#fdf8d4] border-2 border-[#a3af87]/30"
                              }`}
                            >
                              {event.status === "current" ? (
                                <Truck className="h-6 w-6 text-white" />
                              ) : (
                                <CheckCircle2 className="h-6 w-6 text-[#a3af87]" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 pb-6">
                            <div className={`${
                              event.status === "current"
                                ? "bg-gradient-to-r from-[#fdf8d4] to-transparent"
                                : ""
                            } p-4 rounded-xl -ml-1`}>
                              <div className="flex items-baseline gap-3 mb-2">
                                <span className={`text-base font-bold ${
                                  event.status === "current" ? "text-[#303646]" : "text-gray-700"
                                }`}>
                                  {event.time}
                                </span>
                                <span className="text-sm text-gray-500">{event.date}</span>
                              </div>
                              <p className={`text-sm font-semibold mb-2 ${
                                event.status === "current" ? "text-[#303646]" : "text-gray-700"
                              }`}>
                                {event.description}
                              </p>
                              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {/* No tracking data and no courier config */}
                {!hasTrackingData && !showFallback && (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-12 text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      Belum Ada Tracking
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Informasi tracking akan muncul setelah paket dikirim oleh kurir.
                      Mohon tunggu beberapa saat.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
