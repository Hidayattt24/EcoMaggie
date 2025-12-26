"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, Users, Leaf } from "lucide-react";

export default function TentangSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "Puluhan Kilogram / Hari",
      description:
        "Potensi sampah organik yang dapat dikelola secara berkelanjutan.",
      gradient: "from-green-400 to-emerald-600",
      icon: TrendingUp,
    },
    {
      title: "Kolaborasi Multi Pihak",
      description:
        "Mendukung kerja sama antara masyarakat, petani, dan mitra lapangan.",
      gradient: "from-emerald-400 to-teal-600",
      icon: Users,
    },
    {
      title: "Solusi Berkelanjutan",
      description:
        "Pendekatan ramah lingkungan berbasis teknologi dan pemberdayaan masyarakat.",
      gradient: "from-teal-400 to-green-600",
      icon: Leaf,
    },
  ];

  return (
    <section
      id="tentang-section"
      ref={sectionRef}
      className="relative min-h-screen flex items-center bg-white py-20 lg:py-32 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-emerald-200/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 text-sm poppins-semibold">
              Tentang Kami
            </span>
          </div>
          <h2
            className={`text-4xl md:text-5xl lg:text-6xl poppins-bold text-gray-900 mb-6 leading-tight transition-all duration-700 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            DI MANA TEKNOLOGI{" "}
            <span className="bg-gradient-to-r from-[#2D5016] to-[#3d6b1e] bg-clip-text text-transparent">
              BERTEMU ALAM
            </span>
          </h2>
          <p
            className={`text-gray-700 poppins-regular text-base lg:text-lg max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            EcoMaggie memanfaatkan teknologi untuk mendukung pengelolaan sampah
            organik yang lebih efisien, berkelanjutan dan berdampak bagi
            lingkungan serta masyarakat.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${300 + index * 150}ms` }}
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="relative h-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 overflow-hidden">
                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Icon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <feature.icon className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="relative text-xl lg:text-2xl poppins-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="relative text-gray-600 poppins-regular text-sm lg:text-base leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Indicator */}
                <div
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${
                    feature.gradient
                  } transition-all duration-500 ${
                    activeCard === index ? "w-full" : "w-0"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div
          className={`relative bg-white border-2 border-green-100 rounded-3xl p-8 lg:p-12 shadow-xl transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-6">
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-green-700 text-sm poppins-semibold">
                Misi Kami
              </span>
            </div>
            <h3 className="text-2xl lg:text-3xl poppins-bold text-gray-900 mb-4">
              Mengubah Sampah Organik Menjadi Nilai Berkelanjutan
            </h3>
            <p className="text-gray-600 poppins-regular text-base lg:text-lg leading-relaxed mb-6">
              EcoMaggie menghubungkan penghasil sampah organik dengan petani
              maggot, menciptakan ekosistem sirkular yang menguntungkan
              lingkungan dan masyarakat. Melalui platform digital, kami
              memfasilitasi pengelolaan sampah yang efisien dan menghasilkan
              produk bernilai ekonomi tinggi.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-700 poppins-medium text-sm">
                  Ekonomi Sirkular
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-gray-700 poppins-medium text-sm">
                  Pemberdayaan Masyarakat
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-teal-500 rounded-full" />
                <span className="text-gray-700 poppins-medium text-sm">
                  Ramah Lingkungan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
