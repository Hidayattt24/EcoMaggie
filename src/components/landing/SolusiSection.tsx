"use client";

import { useEffect, useRef, useState } from "react";
import { Package, ShoppingCart } from "lucide-react";

export default function SolusiSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="solusi-section"
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center bg-[#16321A] overflow-hidden py-20 lg:py-32"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-left mb-12 lg:mb-16">
            <h2
              className={`text-4xl md:text-5xl lg:text-6xl poppins-semibold text-white leading-tight transition-all duration-700 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              Solusi Menyeluruh
              <br />
              Tanpa Ribet
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Supply Connect Card */}
            <div
              className={`group relative bg-white rounded-3xl p-8 lg:p-10 transition-all duration-700 delay-150 ease-out hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              {/* Background Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-100/40 to-emerald-100/40 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-50/50 to-transparent rounded-full blur-2xl translate-y-10 -translate-x-10 group-hover:scale-150 transition-transform duration-700" />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon Circle */}
                <div className="absolute top-0 right-0 w-14 h-14 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-full flex items-center justify-center group-hover:border-[#2D5016] group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Package className="w-7 h-7 text-gray-500 group-hover:text-[#2D5016] transition-colors duration-300" />
                </div>

                {/* Card Header */}
                <div className="mb-6 pr-16">
                  <h3 className="text-2xl lg:text-3xl poppins-bold text-gray-900 mb-3 group-hover:text-[#2D5016] transition-colors duration-300">
                    Supply Connect
                  </h3>
                  <p className="text-gray-600 poppins-regular text-sm lg:text-base leading-relaxed">
                    Menghubungkan penghasil sampah organik dengan petani maggot
                  </p>
                </div>

                {/* Image Placeholder */}
                <div className="relative w-full h-48 lg:h-56 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden group-hover:shadow-xl transition-shadow duration-500 border border-green-100">
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 w-20 h-20 border-2 border-green-300 rounded-lg rotate-12 group-hover:rotate-45 transition-transform duration-700" />
                    <div className="absolute bottom-4 right-4 w-16 h-16 border-2 border-emerald-300 rounded-full group-hover:scale-125 transition-transform duration-700" />
                  </div>
                  <div className="text-center p-6 relative z-10">
                    <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Package className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="text-gray-600 poppins-semibold text-sm">
                      Supply Chain Integration
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 group/item">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
                    </div>
                    <p className="text-gray-700 poppins-regular text-sm lg:text-base leading-relaxed">
                      Pengumpulan sampah organik terjadwal
                    </p>
                  </div>
                  <div className="flex items-start gap-3 group/item">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
                    </div>
                    <p className="text-gray-700 poppins-regular text-sm lg:text-base leading-relaxed">
                      Sistem tracking dan monitoring real-time
                    </p>
                  </div>
                  <div className="flex items-start gap-3 group/item">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
                    </div>
                    <p className="text-gray-700 poppins-regular text-sm lg:text-base leading-relaxed">
                      Verifikasi kualitas sampah organik
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Maggot Market Card */}
            <div
              className={`group relative bg-gradient-to-br from-[#E8F5A8] via-[#DCF099] to-[#D4E896] rounded-3xl p-8 lg:p-10 transition-all duration-700 delay-300 ease-out hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              {/* Background Decorative Elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/30 rounded-full blur-3xl -translate-y-10 -translate-x-10 group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-0 right-0 w-36 h-36 bg-yellow-100/40 rounded-full blur-2xl translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700" />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon Circle */}
                <div className="absolute top-0 right-0 w-14 h-14 bg-white/80 backdrop-blur-sm border-2 border-gray-800/20 rounded-full flex items-center justify-center group-hover:border-[#2D5016] group-hover:-rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <ShoppingCart className="w-7 h-7 text-gray-700 group-hover:text-[#2D5016] transition-colors duration-300" />
                </div>

                {/* Card Header */}
                <div className="mb-6 pr-16">
                  <h3 className="text-2xl lg:text-3xl poppins-bold text-gray-900 mb-3 group-hover:text-[#2D5016] transition-colors duration-300">
                    Maggot Market
                  </h3>
                  <p className="text-gray-800 poppins-regular text-sm lg:text-base leading-relaxed">
                    Marketplace produk maggot untuk pakan ternak berkualitas
                  </p>
                </div>

                {/* Image Placeholder */}
                <div className="relative w-full h-48 lg:h-56 bg-gradient-to-br from-white/70 via-yellow-50/50 to-lime-50/50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden backdrop-blur-sm group-hover:shadow-xl transition-shadow duration-500 border border-white/60">
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-6 right-6 w-24 h-24 border-2 border-yellow-400 rounded-full group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute bottom-6 left-6 w-16 h-16 border-2 border-lime-400 rounded-lg -rotate-12 group-hover:-rotate-45 transition-transform duration-700" />
                  </div>
                  <div className="text-center p-6 relative z-10">
                    <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <ShoppingCart className="w-10 h-10 text-gray-700" />
                    </div>
                    <p className="text-gray-700 poppins-semibold text-sm">
                      Digital Marketplace
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 group/item">
                    <div className="w-6 h-6 rounded-full bg-[#2D5016]/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2D5016]" />
                    </div>
                    <p className="text-gray-800 poppins-regular text-sm lg:text-base leading-relaxed">
                      Jual beli maggot segar dan kering
                    </p>
                  </div>
                  <div className="flex items-start gap-3 group/item">
                    <div className="w-6 h-6 rounded-full bg-[#2D5016]/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2D5016]" />
                    </div>
                    <p className="text-gray-800 poppins-regular text-sm lg:text-base leading-relaxed">
                      Harga transparan dan kompetitif
                    </p>
                  </div>
                  <div className="flex items-start gap-3 group/item">
                    <div className="w-6 h-6 rounded-full bg-[#2D5016]/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2D5016]" />
                    </div>
                    <p className="text-gray-800 poppins-regular text-sm lg:text-base leading-relaxed">
                      Pengiriman ke seluruh Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
