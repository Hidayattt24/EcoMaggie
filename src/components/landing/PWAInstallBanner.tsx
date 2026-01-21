"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Always show banner on page load (removed localStorage check)
    // Banner will show every time user visits or refreshes the page

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if it's iOS Safari (doesn't support beforeinstallprompt)
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode =
      "standalone" in window.navigator && (window.navigator as any).standalone;

    if (isIOS && !isInStandaloneMode) {
      // Show banner for iOS users
      setShowBanner(true);
    }

    // For other browsers, show banner after a short delay
    const timer = setTimeout(() => {
      if (!isInstalled) {
        setShowBanner(true);
      }
    }, 1000); // Show after 1 second

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS, show instructions
      alert(
        "Untuk install di iOS:\n1. Tap tombol Share (ikon kotak dengan panah)\n2. Scroll dan pilih 'Add to Home Screen'\n3. Tap 'Add'"
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  const handleClose = () => {
    // Only hide banner temporarily (until page refresh)
    setShowBanner(false);
    // Removed localStorage to ensure banner shows again on refresh
  };

  if (!showBanner || isInstalled) return null;

  return (
    <>
      {/* Desktop Banner - Bottom Right Corner with Glassmorphism */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-50 animate-slide-up-right">
        <div className="relative w-[420px]">
          {/* Glow Effect Background */}
          <div className="absolute inset-0 bg-[#a3af87]/20 blur-2xl rounded-3xl"></div>
          
          {/* Main Card with Glass Effect */}
          <div className="relative bg-[#435664]/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all duration-200 z-10 backdrop-blur-sm"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Header with Icon */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 bg-[#fdf8d4]/20 backdrop-blur-md p-3 rounded-xl border border-[#fdf8d4]/30">
                  <Sparkles className="w-6 h-6 text-[#fdf8d4]" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-white font-bold text-lg leading-tight mb-1">
                    Hai! Ada Kabar Gembira Nih!
                  </h3>
                  <p className="text-white/70 text-xs">
                    Fitur baru tersedia untuk kamu
                  </p>
                </div>
              </div>

              {/* Description Card with Glass Effect */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Smartphone className="w-5 h-5 text-[#fdf8d4]" />
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">
                    Sekarang EcoMaggie bisa kamu simpan langsung di HP loh!
                    Akses jadi jauh lebih cepat, lebih ringan, dan nggak perlu
                    repot buka browser lagi. Yuk, pasang aplikasinya sekarang
                    supaya kelola sampah jadi makin praktis dan lancar!
                  </p>
                </div>
              </div>

              {/* Install Button */}
              <button
                onClick={handleInstallClick}
                className="w-full bg-[#fdf8d4] hover:bg-[#fdf8d4]/90 text-[#435664] px-5 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                Pasang Sekarang
              </button>

              <p className="text-white/50 text-xs text-center mt-3">
                Gratis & tidak memakan banyak ruang
              </p>
            </div>

            {/* Decorative Gradient Line */}
            <div className="h-1 bg-gradient-to-r from-[#a3af87] via-[#fdf8d4] to-[#a3af87] opacity-50"></div>
          </div>
        </div>
      </div>

      {/* Mobile Banner - Bottom Full Width with Glassmorphism */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-[#a3af87]/20 blur-xl"></div>
          
          {/* Main Card */}
          <div className="relative bg-[#435664]/95 backdrop-blur-xl border-t-2 border-white/20 shadow-2xl">
            <div className="p-4">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all duration-200 backdrop-blur-sm"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="pr-10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 bg-[#fdf8d4]/20 backdrop-blur-md p-2 rounded-lg border border-[#fdf8d4]/30">
                    <Sparkles className="w-5 h-5 text-[#fdf8d4]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base mb-1">
                      Hai! Ada Kabar Gembira Nih!
                    </h3>
                    <p className="text-white/80 text-xs leading-relaxed">
                      Sekarang EcoMaggie bisa kamu simpan langsung di HP! Akses
                      lebih cepat & nggak perlu buka browser lagi.
                    </p>
                  </div>
                </div>

                {/* Install Button */}
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-[#fdf8d4] hover:bg-[#fdf8d4]/90 text-[#435664] px-4 py-3 rounded-lg font-semibold hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Pasang Aplikasi
                </button>
              </div>
            </div>

            {/* Decorative Gradient Line */}
            <div className="h-1 bg-gradient-to-r from-[#a3af87] via-[#fdf8d4] to-[#a3af87] opacity-50"></div>
          </div>
        </div>
      </div>
    </>
  );
}
