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
} from "lucide-react";

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
  };
}

const mockTrackingEvents: TrackingEvent[] = [
  {
    time: "14:30",
    date: "30 Des 2025",
    description: "Paket dalam perjalanan ke alamat Anda",
    location: "Banda Aceh, Aceh",
    status: "current",
  },
  {
    time: "10:15",
    date: "30 Des 2025",
    description: "Paket sudah dijemput kurir",
    location: "Pusat Distribusi Eco-maggie",
    status: "completed",
  },
  {
    time: "08:00",
    date: "30 Des 2025",
    description: "Paket sedang dikemas oleh petani",
    location: "Toko: Kebun Maggot Berkah",
    status: "completed",
  },
  {
    time: "20:45",
    date: "29 Des 2025",
    description: "Pesanan dikonfirmasi",
    location: "Sistem Eco-maggie",
    status: "completed",
  },
];

export function TrackingDetail({
  isOpen,
  onClose,
  transaction,
}: TrackingDetailProps) {
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
            <div className="sticky top-0 bg-white border-b-2 border-gray-100 px-6 py-4 rounded-t-3xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-[#2D5016]">
                  Lacak Pesanan
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  No. Pesanan:{" "}
                  <span className="font-bold text-[#2D5016]">
                    {transaction.orderId}
                  </span>
                </p>
                {transaction.trackingNumber && (
                  <p className="text-sm text-gray-600">
                    No. Resi:{" "}
                    <span className="font-bold text-[#2D5016]">
                      {transaction.trackingNumber}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Map Placeholder (Local Delivery) */}
            {transaction.shippingMethod === "Local Delivery" && (
              <div className="mx-6 mt-4 mb-6">
                <div className="relative w-full h-48 bg-gradient-to-br from-green-100 to-green-50 rounded-xl overflow-hidden border-2 border-[#2D5016]/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-[#2D5016] mx-auto mb-2" />
                      <p className="text-sm font-bold text-[#2D5016]">
                        Estimasi Kurir di Area Anda
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Banda Aceh, Aceh
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-[#2D5016] shadow-lg">
                    ± 15 menit lagi
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="px-6 pb-6">
              <h3 className="text-sm font-bold text-[#2D5016] mb-4">
                Riwayat Pengiriman
              </h3>
              <div className="space-y-4">
                {mockTrackingEvents.map((event, index) => (
                  <div key={index} className="relative flex gap-4">
                    {/* Timeline Line */}
                    {index < mockTrackingEvents.length - 1 && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
                    )}

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.status === "current"
                            ? "bg-gradient-to-br from-[#2D5016] to-[#2D5016]/80 shadow-lg shadow-[#2D5016]/30"
                            : event.status === "completed"
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {event.status === "current" ? (
                          <Truck className="h-5 w-5 text-white" />
                        ) : event.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span
                          className={`text-sm font-bold ${
                            event.status === "current"
                              ? "text-[#2D5016]"
                              : event.status === "completed"
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        >
                          {event.time}
                        </span>
                        <span className="text-xs text-gray-500">
                          {event.date}
                        </span>
                      </div>
                      <p
                        className={`text-sm font-bold mb-1 ${
                          event.status === "current"
                            ? "text-[#2D5016]"
                            : "text-gray-700"
                        }`}
                      >
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
            </div>
          </motion.div>

          {/* Desktop Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="hidden lg:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl"
          >
            <div className="sticky top-0 bg-white border-b-2 border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-[#2D5016]">
                  Lacak Pesanan
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="flex gap-6">
                <p className="text-sm text-gray-600">
                  No. Pesanan:{" "}
                  <span className="font-bold text-[#2D5016]">
                    {transaction.orderId}
                  </span>
                </p>
                {transaction.trackingNumber && (
                  <p className="text-sm text-gray-600">
                    No. Resi:{" "}
                    <span className="font-bold text-[#2D5016]">
                      {transaction.trackingNumber}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-100px)]">
              {/* Map Placeholder */}
              {transaction.shippingMethod === "Local Delivery" && (
                <div className="p-6 pb-0">
                  <div className="relative w-full h-64 bg-gradient-to-br from-green-100 to-green-50 rounded-xl overflow-hidden border-2 border-[#2D5016]/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-16 w-16 text-[#2D5016] mx-auto mb-3" />
                        <p className="text-base font-bold text-[#2D5016]">
                          Estimasi Kurir di Area Anda
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Banda Aceh, Aceh
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold text-[#2D5016] shadow-lg">
                      ± 15 menit lagi
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="p-6">
                <h3 className="text-sm font-bold text-[#2D5016] mb-4">
                  Riwayat Pengiriman
                </h3>
                <div className="space-y-4">
                  {mockTrackingEvents.map((event, index) => (
                    <div key={index} className="relative flex gap-4">
                      {index < mockTrackingEvents.length - 1 && (
                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            event.status === "current"
                              ? "bg-gradient-to-br from-[#2D5016] to-[#2D5016]/80 shadow-lg shadow-[#2D5016]/30"
                              : event.status === "completed"
                              ? "bg-green-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {event.status === "current" ? (
                            <Truck className="h-5 w-5 text-white" />
                          ) : event.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span
                            className={`text-sm font-bold ${
                              event.status === "current"
                                ? "text-[#2D5016]"
                                : event.status === "completed"
                                ? "text-gray-700"
                                : "text-gray-400"
                            }`}
                          >
                            {event.time}
                          </span>
                          <span className="text-xs text-gray-500">
                            {event.date}
                          </span>
                        </div>
                        <p
                          className={`text-sm font-bold mb-1 ${
                            event.status === "current"
                              ? "text-[#2D5016]"
                              : "text-gray-700"
                          }`}
                        >
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
