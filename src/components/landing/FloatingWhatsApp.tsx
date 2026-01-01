"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);

  // Nomor WhatsApp CS (ganti dengan nomor yang sebenarnya)
  const whatsappNumber = "6281234567890"; // Format: 62 + nomor tanpa 0 di awal
  const message = "Halo EcoMaggie! Saya ingin bertanya tentang layanan Anda.";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;

  const handleClick = () => {
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Chat di WhatsApp"
      >
        {/* Main Circle Button */}
        <div className="relative">
          {/* Pulse Animation */}
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{ backgroundColor: "#A3AF87" }}
          />

          {/* Button */}
          <div
            className="relative w-14 h-14 lg:w-16 lg:h-16 rounded-full shadow-lg hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ backgroundColor: "#A3AF87" }}
          >
            {/* WhatsApp Icon */}
            <svg
              className="w-8 h-8 lg:w-9 lg:h-9 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </div>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm poppins-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          Chat dengan kami
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      </button>

      {/* Optional: Chat Preview Popup (uncomment if needed) */}
      {/* {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-white poppins-semibold text-sm">EcoMaggie CS</h3>
                <p className="text-green-100 text-xs">Biasanya membalas dalam beberapa menit</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 bg-green-50">
            <div className="bg-white rounded-lg p-3 shadow-sm mb-3">
              <p className="text-gray-700 text-sm poppins-regular">
                Halo! 👋 Ada yang bisa kami bantu?
              </p>
              <span className="text-xs text-gray-400">Baru saja</span>
            </div>
          </div>

          <div className="p-4 border-t">
            <button
              onClick={handleClick}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg poppins-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Mulai Chat di WhatsApp
            </button>
          </div>
        </div>
      )} */}
    </>
  );
}
