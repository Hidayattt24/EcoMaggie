"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapPin,
  Navigation,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  defaultAddress?: string;
}

export default function LocationPicker({
  onLocationSelect,
  initialLat,
  initialLng,
  defaultAddress,
}: LocationPickerProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [address, setAddress] = useState<string>(defaultAddress || "");
  const [error, setError] = useState<string | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [leafletComponents, setLeafletComponents] = useState<any>(null);
  const mapRef = useRef<any>(null);

  // Default to Banda Aceh center
  const defaultCenter: [number, number] = [5.548290, 95.323753];
  const mapCenter = selectedPosition || defaultCenter;

  // Load Leaflet libraries dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // @ts-ignore - CSS import
        await import("leaflet/dist/leaflet.css");
        const leaflet = await import("leaflet");
        const reactLeaflet = await import("react-leaflet");

        delete (leaflet as any).Icon.Default.prototype._getIconUrl;

        setLeafletComponents({
          L: leaflet,
          MapContainer: reactLeaflet.MapContainer,
          TileLayer: reactLeaflet.TileLayer,
          Marker: reactLeaflet.Marker,
          useMapEvents: reactLeaflet.useMapEvents,
        });

        setIsMapLoaded(true);
      } catch (err) {
        console.error("Failed to load Leaflet:", err);
        setError("Gagal memuat peta");
      }
    };

    loadLeaflet();
  }, []);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data.display_name) {
        return data.display_name;
      }
      return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    } catch (err) {
      console.error("Reverse geocode error:", err);
      return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    onLocationSelect(lat, lng, addr);
  };

  // Get user's current location
  const handleUseMyLocation = () => {
    setIsLoadingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung oleh browser Anda");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setSelectedPosition([lat, lng]);
        const addr = await reverseGeocode(lat, lng);
        setAddress(addr);
        onLocationSelect(lat, lng, addr);
        setIsLoadingLocation(false);

        // Fly to user location
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 17, {
            duration: 1.5,
          });
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Gagal mendapatkan lokasi Anda. Pastikan izin lokasi diaktifkan.");
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Clear selection
  const handleClearLocation = () => {
    setSelectedPosition(null);
    setAddress("");
    onLocationSelect(0, 0, "");
  };

  // Loading state
  if (!isMapLoaded || !leafletComponents) {
    return (
      <div className="w-full h-[450px] bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 rounded-2xl border-2 border-[#A3AF87]/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#A3AF87] mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">Memuat peta...</p>
        </div>
      </div>
    );
  }

  // Destructure Leaflet components
  const { MapContainer, TileLayer, Marker, useMapEvents, L } = leafletComponents;

  // Map event handler component
  const MapEvents = () => {
    useMapEvents({
      click: (e: any) => {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  // Custom icon
  const customIcon = new L.Icon({
    iconUrl: "/leaflet/custom-marker.svg",
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -44],
  });

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUseMyLocation}
          disabled={isLoadingLocation}
          type="button"
          className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md ${
            isLoadingLocation
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white hover:shadow-lg"
          }`}
        >
          {isLoadingLocation ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Mendapatkan Lokasi...</span>
              <span className="sm:hidden">Memuat...</span>
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">Gunakan Lokasi Saya</span>
              <span className="sm:hidden">Lokasi Saya</span>
            </>
          )}
        </motion.button>

        {selectedPosition && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearLocation}
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-red-50 text-red-600 rounded-xl font-semibold text-xs sm:text-sm hover:bg-red-100 transition-colors border-2 border-red-200"
          >
            <X className="h-4 w-4" />
            Hapus Lokasi
          </motion.button>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border-2 border-red-200"
          >
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              type="button"
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-red-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Container */}
      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#A3AF87]/30 shadow-xl h-[300px] sm:h-[400px] lg:h-[450px] isolate">
        {/* Hint Text - Top Center */}
        <AnimatePresence>
          {!selectedPosition && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg border border-gray-200 pointer-events-none"
            >
              <p className="text-[10px] sm:text-xs font-semibold text-gray-700">
                👆 Ketuk peta untuk memilih lokasi
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Geocoding Indicator */}
        {isReverseGeocoding && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-full shadow-lg border border-gray-200 pointer-events-none">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Loader2 className="h-3 w-3 text-[#A3AF87] animate-spin" />
              <span className="text-[10px] sm:text-xs font-medium text-gray-700">Memuat alamat...</span>
            </div>
          </div>
        )}

        {/* Map */}
        <div className="relative w-full h-full z-0">
          <MapContainer
            center={mapCenter}
            zoom={selectedPosition ? 17 : 13}
            scrollWheelZoom={true}
            zoomControl={false}
            style={{ height: "100%", width: "100%", position: "relative", zIndex: 0 }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectedPosition && (
              <Marker
                position={selectedPosition}
                icon={customIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e: any) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    handleMapClick(position.lat, position.lng);
                  },
                }}
              />
            )}
            <MapEvents />
          </MapContainer>
        </div>
      </div>

      {/* Selected Location Card - Below Map */}
      <AnimatePresence>
        {selectedPosition && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border-2 border-[#A3AF87]/30">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-green-600 mb-1 sm:mb-2">
                    Lokasi Terpilih
                  </p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3 break-words">
                    {address}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="font-semibold text-gray-500 text-[10px] sm:text-xs">Lat:</span>
                      <span className="font-mono bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg font-medium text-[10px] sm:text-xs">
                        {selectedPosition[0].toFixed(6)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="font-semibold text-gray-500 text-[10px] sm:text-xs">Lng:</span>
                      <span className="font-mono bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg font-medium text-[10px] sm:text-xs">
                        {selectedPosition[1].toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-blue-900 font-medium mb-0.5 sm:mb-1">
            Tips: Geser marker untuk menyesuaikan posisi
          </p>
          <p className="text-[10px] sm:text-xs text-blue-700">
            Lokasi yang presisi membantu kurir menemukan titik penjemputan dengan mudah
          </p>
        </div>
      </div>
    </div>
  );
}
