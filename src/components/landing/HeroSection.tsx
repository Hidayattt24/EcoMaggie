"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function HeroSection() {
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

  const scrollToNext = () => {
    const nextSection = document.getElementById("tentang-section");
    nextSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="beranda-section"
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {/* Desktop Image */}
        <Image
          src="/assets/landing/beranda.svg"
          alt="Platform EcoMaggie - Pengelolaan Sampah Organik dan Budidaya Maggot BSF untuk Ekonomi Sirkular Berkelanjutan"
          fill
          className="hidden lg:block object-cover brightness-75"
          priority
          fetchPriority="high"
          quality={90}
        />
        {/* Mobile Image */}
        <Image
          src="/assets/landing/beranda-mobile.svg"
          alt="EcoMaggie - Solusi Digital Pengelolaan Sampah Organik dan Budidaya Maggot di Indonesia"
          fill
          className="lg:hidden object-cover brightness-75"
          priority
          fetchPriority="high"
          quality={90}
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(253, 248, 212, 0.00) 0%, rgba(163, 175, 135, 0.95) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full py-20 lg:py-0 px-4 sm:px-6 lg:px-0">
        <div className="max-w-4xl text-left mx-auto lg:mx-0 lg:ml-[135px]">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 backdrop-blur-xl rounded-full mb-4 sm:mb-6 transition-all duration-1000 shadow-lg ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              border: "2px solid rgba(163, 175, 135, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{
                background: "linear-gradient(135deg, #A3AF87 0%, #5a6c5b 100%)",
                boxShadow: "0 0 10px rgba(163, 175, 135, 0.6)",
              }}
            ></div>
            <span
              className="text-xs sm:text-sm poppins-semibold"
              style={{
                color: "#0A2710",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            >
              Platform Digital Pengelolaan Sampah Organik
            </span>
          </div>

          {/* Main Heading */}
          <h1
            className={`text-white mb-4 sm:mb-5 poppins-bold leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-[52px] transition-all duration-1000 delay-150 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{
              textShadow:
                "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            Dari Maggot Kecil,
            <br />
            Lahir Perubahan Besar
          </h1>

          {/* Description */}
          <p
            className={`text-white mb-6 sm:mb-8 poppins-medium max-w-2xl lg:mx-0 leading-relaxed text-sm sm:text-base lg:text-lg transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{
              textShadow:
                "0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)",
            }}
          >
            EcoMaggie menghubungkan penghasil sampah organik dengan petani
            maggot melalui platform digital untuk menciptakan solusi pengelolaan
            limbah yang berkelanjutan dan bernilai ekonomi.
          </p>

          {/* Stats */}
          <div
            className={`flex flex-wrap justify-start gap-3 sm:gap-4 mb-6 sm:mb-8 transition-all duration-700 delay-300 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div
              className="flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 backdrop-blur-xl rounded-xl hover:scale-105 transition-transform duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                border: "2px solid rgba(163, 175, 135, 0.3)",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(163, 175, 135, 0.1)",
              }}
            >
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #A3AF87 0%, #5a6c5b 100%)",
                  boxShadow: "0 4px 12px rgba(163, 175, 135, 0.4)",
                }}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: "white" }}
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <span
                className="text-xs sm:text-sm poppins-bold"
                style={{
                  color: "#0A2710",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                }}
              >
                100+ Partner
              </span>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 backdrop-blur-xl rounded-xl hover:scale-105 transition-transform duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                border: "2px solid rgba(163, 175, 135, 0.3)",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(163, 175, 135, 0.1)",
              }}
            >
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #A3AF87 0%, #5a6c5b 100%)",
                  boxShadow: "0 4px 12px rgba(163, 175, 135, 0.4)",
                }}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: "white" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span
                className="text-xs sm:text-sm poppins-bold"
                style={{
                  color: "#0A2710",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                }}
              >
                Tersedia 24/7
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <div
            className={`flex justify-start transition-all duration-700 delay-400 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <button
              onClick={scrollToNext}
              className="group relative inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:px-9 sm:py-4 poppins-bold rounded-full transition-all duration-300 hover:shadow-2xl hover:scale-105 text-sm sm:text-base"
              style={{
                background: "rgba(255, 255, 255, 0.98)",
                color: "#0A2710",
                border: "2px solid rgba(163, 175, 135, 0.4)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)",
              }}
            >
              <span style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}>
                Jelajahi EcoMaggie
              </span>
              <span
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-white rounded-full group-hover:translate-x-1 transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #A3AF87 0%, #5a6c5b 100%)",
                  boxShadow: "0 4px 12px rgba(163, 175, 135, 0.5)",
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <button
          onClick={scrollToNext}
          className="flex flex-col items-center gap-2 text-white hover:text-white/90 transition-all duration-300 hover:scale-110"
          aria-label="Scroll ke section selanjutnya"
          style={{
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)",
          }}
        >
          <span className="text-sm poppins-semibold">Scroll untuk lanjut</span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </button>
      </div>
    </section>
  );
}
