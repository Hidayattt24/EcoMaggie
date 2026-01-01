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
        />
        {/* Mobile Image */}
        <Image
          src="/assets/landing/beranda-mobile.svg"
          alt="EcoMaggie - Solusi Digital Pengelolaan Sampah Organik dan Budidaya Maggot di Indonesia"
          fill
          className="lg:hidden object-cover brightness-75"
          priority
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
            className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md rounded-full mb-4 sm:mb-6 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{
              background: "var(--brand-cream)",
              border: "1px solid var(--brand-sage-light)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "var(--accent-green-light)" }}
            ></div>
            <span
              className="text-[10px] sm:text-xs poppins-medium"
              style={{ color: "var(--text-primary)" }}
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
          >
            Dari Maggot Kecil,
            <br />
            Lahir Perubahan Besar
          </h1>

          {/* Description */}
          <p
            className={`text-white/90 mb-6 sm:mb-8 poppins-regular max-w-2xl lg:mx-0 leading-relaxed text-sm sm:text-base lg:text-[16px] transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
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
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm rounded-lg"
              style={{
                background: "var(--brand-cream)",
                border: "1px solid var(--brand-sage-light)",
              }}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ color: "var(--accent-green-light)" }}
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span
                className="text-[10px] sm:text-xs poppins-medium"
                style={{ color: "var(--text-primary)" }}
              >
                100+ Partner
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm rounded-lg"
              style={{
                background: "var(--brand-cream)",
                border: "1px solid var(--brand-sage-light)",
              }}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ color: "var(--accent-green-light)" }}
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span
                className="text-[10px] sm:text-xs poppins-medium"
                style={{ color: "var(--text-primary)" }}
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
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 poppins-semibold rounded-full transition-all duration-300 hover:shadow-2xl hover:scale-105 text-xs sm:text-sm"
              style={{
                background: "var(--brand-cream)",
                color: "var(--text-primary)",
              }}
            >
              <span>Jelajahi EcoMaggie</span>
              <span
                className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-white rounded-full group-hover:translate-x-1 transition-transform duration-300"
                style={{ background: "var(--brand-sage)" }}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
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
          className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors"
          aria-label="Scroll ke section selanjutnya"
        >
          <span className="text-sm poppins-light">Scroll untuk lanjut</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
