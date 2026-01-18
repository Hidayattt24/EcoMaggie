"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

// Import leaflet CSS and libraries dynamically to avoid SSR issues
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let L: any;

interface MapViewerProps {
  latitude: number;
  longitude: number;
  address: string;
  markerLabel?: string;
}

export default function MapViewer({
  latitude,
  longitude,
  address,
  markerLabel,
}: MapViewerProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Leaflet libraries dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Import libraries
        const leaflet = await import("leaflet");
        const reactLeaflet = await import("react-leaflet");

        // Fix default icon issue with webpack
        delete (leaflet as any).Icon.Default.prototype._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: "/leaflet/marker-icon-2x.png",
          iconUrl: "/leaflet/marker-icon.png",
          shadowUrl: "/leaflet/marker-shadow.png",
        });

        L = leaflet;
        MapContainer = reactLeaflet.MapContainer;
        TileLayer = reactLeaflet.TileLayer;
        Marker = reactLeaflet.Marker;

        setIsMapLoaded(true);
      } catch (err) {
        console.error("Failed to load Leaflet:", err);
        setError("Gagal memuat peta");
      }
    };

    loadLeaflet();
  }, []);

  // Custom icon with project color
  const customIcon = L && new L.Icon({
    iconUrl: "/leaflet/custom-marker.svg",
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -44],
  });

  // Open in Google Maps
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  // Loading state
  if (!isMapLoaded) {
    return (
      <div className="w-full h-[250px] bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 rounded-2xl border-2 border-[#A3AF87]/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#A3AF87] mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">Memuat peta...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-[250px] bg-red-50 rounded-2xl border-2 border-red-200 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-[#A3AF87]/30 shadow-lg">
        {/* Marker Label Overlay */}
        {markerLabel && (
          <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border-2 border-[#A3AF87]/20">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#A3AF87]" />
              <span className="text-xs font-semibold text-gray-700">
                {markerLabel}
              </span>
            </div>
          </div>
        )}

        {/* Map */}
        <div style={{ height: "250px", width: "100%", zIndex: 1 }}>
          <MapContainer
            center={[latitude, longitude]}
            zoom={15}
            scrollWheelZoom={false}
            dragging={false}
            zoomControl={true}
            doubleClickZoom={false}
            touchZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]} icon={customIcon} />
          </MapContainer>
        </div>
      </div>

      {/* Address Info & Actions */}
      <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
        <div className="flex items-start gap-3 mb-3">
          <MapPin className="h-5 w-5 text-[#A3AF87] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 mb-1">
              Alamat Penjemputan
            </p>
            <p className="text-sm text-gray-900 leading-relaxed">{address}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="font-mono">Lat: {latitude.toFixed(6)}</span>
              <span className="font-mono">Lng: {longitude.toFixed(6)}</span>
            </div>
          </div>
        </div>

        {/* Open in Google Maps Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openInGoogleMaps}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#A3AF87] to-[#95a17a] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
        >
          <ExternalLink className="h-4 w-4" />
          Buka di Google Maps
        </motion.button>
      </div>
    </div>
  );
}
