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
      className="min-h-screen flex items-center justify-center overflow-hidden py-20 lg:py-32"
      style={{ background: "var(--brand-sage)" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-6 transition-all duration-700 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                border: "2px solid",
                borderColor: "rgba(163, 175, 135, 0.2)",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: "#A3AF87" }}
                ></span>
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: "#A3AF87" }}
                ></span>
              </span>
              <span
                className="text-sm font-semibold poppins-semibold"
                style={{ color: "#A3AF87" }}
              >
                Solusi Kami
              </span>
            </div>
            <h2
              className={`text-4xl md:text-5xl font-bold mb-4 poppins-bold transition-all duration-700 delay-100 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ color: "#303646" }}
            >
              Dipercaya oleh Masyarakat
            </h2>
            <p
              className={`text-lg md:text-xl max-w-2xl mx-auto poppins-regular transition-all duration-700 delay-200 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ color: "#303646" }}
            >
              Solusi Menyeluruh Tanpa Ribet
            </p>
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
                <div
                  className="absolute top-0 right-0 w-14 h-14 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                  style={{ borderColor: "var(--brand-sage-light)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-green)";
                    e.currentTarget.style.transform =
                      "rotate(12deg) scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--brand-sage-light)";
                    e.currentTarget.style.transform = "rotate(0deg) scale(1)";
                  }}
                >
                  <Package
                    className="w-7 h-7 transition-colors duration-300"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--accent-green)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  />
                </div>

                {/* Card Header */}
                <div className="mb-6 pr-16">
                  <h3
                    className="text-2xl lg:text-3xl poppins-bold mb-3"
                    style={{ color: "#303646" }}
                  >
                    Supply Connect
                  </h3>
                  <p
                    className="poppins-regular text-sm lg:text-base leading-relaxed"
                    style={{ color: "#5a6c5b" }}
                  >
                    Menghubungkan penghasil sampah organik dengan petani maggot
                  </p>
                </div>

                {/* Image Placeholder */}
                <div
                  className="relative w-full h-48 lg:h-56 rounded-2xl mb-6 flex items-center justify-center overflow-hidden shadow-lg transition-shadow duration-500"
                  style={{
                    backgroundColor: "rgba(163, 175, 135, 0.1)",
                    border: "1px solid rgba(163, 175, 135, 0.2)",
                  }}
                >
                  <div className="text-center p-6 relative z-10">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                      <Package
                        className="w-10 h-10"
                        style={{ color: "#A3AF87" }}
                      />
                    </div>
                    <p
                      className="poppins-semibold text-sm"
                      style={{ color: "#303646" }}
                    >
                      Supply Chain Integration
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 group/item">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: "rgba(163, 175, 135, 0.3)" }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#A3AF87" }}
                      />
                    </div>
                    <p
                      className="poppins-regular text-sm lg:text-base leading-relaxed"
                      style={{ color: "#303646" }}
                    >
                      Pengumpulan sampah organik terjadwal
                    </p>
                  </div>
                  <div className="flex items-start gap-3 group/item">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: "rgba(163, 175, 135, 0.3)" }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#A3AF87" }}
                      />
                    </div>
                    <p
                      className="poppins-regular text-sm lg:text-base leading-relaxed"
                      style={{ color: "#303646" }}
                    >
                      Sistem tracking dan monitoring real-time
                    </p>
                  </div>
                  <div className="flex items-start gap-3 group/item">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: "rgba(163, 175, 135, 0.3)" }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#A3AF87" }}
                      />
                    </div>
                    <p
                      className="poppins-regular text-sm lg:text-base leading-relaxed"
                      style={{ color: "#303646" }}
                    >
                      Verifikasi kualitas sampah organik
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Maggot Market Card */}
            <div
              className={`group relative rounded-3xl p-8 lg:p-10 transition-all duration-700 delay-300 ease-out hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ backgroundColor: "#FDF8D4" }}
            >
              {/* Background Decorative Elements */}
              <div
                className="absolute top-0 left-0 w-40 h-40 rounded-full blur-3xl -translate-y-10 -translate-x-10 group-hover:scale-150 transition-transform duration-700"
                style={{ backgroundColor: "rgba(163, 175, 135, 0.1)" }}
              />
              <div
                className="absolute bottom-0 right-0 w-36 h-36 rounded-full blur-2xl translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"
                style={{ backgroundColor: "rgba(163, 175, 135, 0.08)" }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon Circle */}
                <div
                  className="absolute top-0 right-0 w-14 h-14 bg-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                  style={{
                    border: "2px solid",
                    borderColor: "rgba(163, 175, 135, 0.3)",
                  }}
                >
                  <ShoppingCart
                    className="w-7 h-7"
                    style={{ color: "#A3AF87" }}
                  />
                </div>

                {/* Card Header */}
                <div className="mb-6 pr-16">
                  <h3
                    className="text-2xl lg:text-3xl poppins-bold mb-3"
                    style={{ color: "#303646" }}
                  >
                    Maggot Market
                  </h3>
                  <p
                    className="poppins-regular text-sm lg:text-base leading-relaxed"
                    style={{ color: "#5a6c5b" }}
                  >
                    Marketplace produk maggot untuk pakan ternak berkualitas
                  </p>
                </div>

                {/* Image Placeholder */}
                <div
                  className="relative w-full h-48 lg:h-56 rounded-2xl mb-6 flex items-center justify-center overflow-hidden shadow-lg transition-shadow duration-500"
                  style={{
                    backgroundColor: "rgba(163, 175, 135, 0.1)",
                    border: "1px solid rgba(163, 175, 135, 0.2)",
                  }}
                >
                  <div className="text-center p-6 relative z-10">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                      <ShoppingCart
                        className="w-10 h-10"
                        style={{ color: "#A3AF87" }}
                      />
                    </div>
                    <p
                      className="poppins-semibold text-sm"
                      style={{ color: "#303646" }}
                    >
                      Digital Marketplace
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 group/item">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: "rgba(163, 175, 135, 0.3)" }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#A3AF87" }}
                      />
                    </div>
                    <p
                      className="poppins-regular text-sm lg:text-base leading-relaxed"
                      style={{ color: "#303646" }}
                    >
                      Jual beli maggot segar dan kering
                    </p>
                  </div>
                  <div className="flex items-start gap-3 group/item">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: "rgba(163, 175, 135, 0.3)" }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#A3AF87" }}
                      />
                    </div>
                    <p
                      className="poppins-regular text-sm lg:text-base leading-relaxed"
                      style={{ color: "#303646" }}
                    >
                      Harga transparan dan kompetitif
                    </p>
                  </div>
                  <div className="flex items-start gap-3 group/item">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: "rgba(163, 175, 135, 0.3)" }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#A3AF87" }}
                      />
                    </div>
                    <p
                      className="poppins-regular text-sm lg:text-base leading-relaxed"
                      style={{ color: "#303646" }}
                    >
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
