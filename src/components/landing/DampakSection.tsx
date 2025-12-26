"use client";

import { useEffect, useRef, useState } from "react";
import {
  Leaf,
  TrendingDown,
  Users,
  MapPin,
  Package,
  Recycle,
} from "lucide-react";

export default function DampakSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [percentageCount, setPercentageCount] = useState(0);
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

  useEffect(() => {
    if (!isVisible) {
      setPercentageCount(0);
      return;
    }

    const duration = 2000;
    const steps = 80;
    const increment = 80 / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= 80) {
        setPercentageCount(80);
        clearInterval(timer);
      } else {
        setPercentageCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible]);

  const stats = [
    {
      value: "500+",
      unit: "kg",
      label: "Sampah Organik Terkelola",
      icon: Package,
      gradient: "from-green-500 to-emerald-600",
      delay: "delay-150",
    },
    {
      value: "1.2",
      unit: "ton CO₂",
      label: "Emisi Dicegah",
      icon: TrendingDown,
      gradient: "from-emerald-500 to-teal-600",
      delay: "delay-200",
    },
    {
      value: "100%",
      unit: "",
      label: "Pasokan Stabil untuk Petani",
      icon: Recycle,
      gradient: "from-teal-500 to-green-600",
      delay: "delay-250",
    },
    {
      value: "150+",
      unit: "",
      label: "Penghasil Sampah Aktif",
      icon: Users,
      gradient: "from-green-500 to-emerald-600",
      delay: "delay-300",
    },
    {
      value: "60+",
      unit: "",
      label: "Mitra Petani Maggot",
      icon: Leaf,
      gradient: "from-emerald-500 to-teal-600",
      delay: "delay-350",
    },
    {
      value: "5",
      unit: "",
      label: "Kota/Kabupaten Terlayani",
      icon: MapPin,
      gradient: "from-teal-500 to-green-600",
      delay: "delay-400",
    },
  ];

  return (
    <section
      id="dampak-section"
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center bg-white overflow-hidden py-20 lg:py-32 relative"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16 lg:mb-20">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6 transition-all duration-700 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-green-700 text-sm poppins-semibold">
                Dampak Positif
              </span>
            </div>

            <h2
              className={`text-4xl md:text-5xl lg:text-6xl poppins-bold text-gray-900 mb-6 leading-tight transition-all duration-700 delay-100 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              Dampak Nyata untuk{" "}
              <span className="bg-gradient-to-r from-[#2D5016] to-[#3d6b1e] bg-clip-text text-transparent">
                Ekonomi Sirkular
              </span>
            </h2>

            <p
              className={`text-gray-700 poppins-regular text-base lg:text-lg leading-relaxed max-w-3xl mx-auto transition-all duration-700 delay-200 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              EcoMaggie mengubah limbah organik menjadi nilai ekonomi —
              mengalihkan sampah dari TPA, mengurangi emisi, menghemat sumber
              daya, dan menggerakkan ekonomi lokal melalui budidaya maggot.
            </p>
          </div>

          {/* Main Content Grid: Progress Left, Stats Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Circular Progress */}
            <div
              className={`flex items-center justify-center transition-all duration-700 delay-300 ease-out ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
            >
              <div className="relative">
                {/* Decorative Ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-2xl scale-110" />

                <div className="relative w-72 h-72 lg:w-96 lg:h-96">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 200 200"
                  >
                    {/* Background Track */}
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="14"
                    />
                    {/* Progress Circle with Gradient */}
                    <defs>
                      <linearGradient
                        id="progressGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#2D5016" />
                        <stop offset="100%" stopColor="#3d6b1e" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 85}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 85 * (1 - percentageCount / 100)
                      }`}
                      className="transition-all duration-1000 ease-out drop-shadow-lg"
                    />
                  </svg>

                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="text-7xl lg:text-8xl poppins-bold bg-gradient-to-r from-[#2D5016] to-[#3d6b1e] bg-clip-text text-transparent">
                        {percentageCount}%
                      </div>
                      <div className="absolute -top-6 -right-6 w-14 h-14 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                        <Leaf className="w-7 h-7 text-green-600" />
                      </div>
                    </div>
                    <div className="text-base lg:text-lg poppins-semibold text-gray-700 text-center mt-4 px-8">
                      Penghasil Sampah
                      <br />
                      Beralih ke EcoMaggie
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`group relative bg-white rounded-3xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-700 ease-out hover:scale-105 border border-gray-100 overflow-hidden ${
                    stat.delay
                  } ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  {/* Background Gradient Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Value */}
                  <div className="relative mb-2">
                    <span
                      className={`text-4xl lg:text-5xl poppins-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    >
                      {stat.value}
                    </span>
                    {stat.unit && (
                      <span className="text-lg lg:text-xl poppins-semibold text-gray-600 ml-1">
                        {stat.unit}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <p className="text-gray-700 poppins-regular text-sm lg:text-base leading-relaxed relative">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
