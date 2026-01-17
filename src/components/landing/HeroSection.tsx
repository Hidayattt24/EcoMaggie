"use client";

import Image from "next/image";
import Link from "next/link";
import { TextAnimate } from "@/components/ui/text-animate";
import { useState, useEffect } from "react";

const backgroundImages = [
  {
    src: "/assets/landing/landing-page.svg",
    alt: "EcoMaggie - Platform Pengelolaan Sampah Organik",
  },
  {
    src: "/assets/landing/landing-page-2.svg",
    alt: "EcoMaggie - Budidaya Maggot BSF",
  },
  {
    src: "/assets/landing/landing-page-3.svg",
    alt: "EcoMaggie - Ekonomi Sirkular",
  },
];

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const scrollToNext = () => {
    const nextSection = document.getElementById("tentang-section");
    nextSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="beranda-section"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image Carousel with Minimalist Overlay */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
              quality={90}
            />
          </div>
        ))}
        {/* Minimalist Business Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content Container - Responsive */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-24 sm:py-28 md:py-32 lg:py-36">
        {/* Content - Text */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-4xl">
          {/* Main Heading with Animation - Responsive */}
          <div className="space-y-1 sm:space-y-2">
            <TextAnimate
              text="Dari Maggot Kecil,"
              type="whipIn"
              delay={0}
              as="h1"
              className="poppins-semibold text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px]"
              style={{
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            />
            <TextAnimate
              text="Lahir Perubahan Besar"
              type="whipIn"
              delay={0.3}
              as="h1"
              className="poppins-semibold text-warna-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px]"
              style={{
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            />
          </div>

          {/* Description with Animation - Responsive */}
          <TextAnimate
            text="EcoMaggie menghubungkan penghasil sampah organik dengan petani maggot melalui platform digital untuk menciptakan solusi pengelolaan limbah yang berkelanjutan dan bernilai ekonomi."
            type="whipIn"
            delay={0.6}
            as="p"
            className="poppins-medium text-white text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-full sm:max-w-2xl lg:max-w-[815px]"
            style={{
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          />

          {/* CTA Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
            {/* Jelajahi Button */}
            <button
              onClick={scrollToNext}
              className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 poppins-semibold text-white text-sm sm:text-base lg:text-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              style={{
                borderRadius: "15px",
                background: "#A3AF87",
                boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
              }}
            >
              <span>Jelajahi</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>

            {/* Hubungi Button */}
            <Link
              href="/contact"
              className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 poppins-semibold text-warna-1 text-sm sm:text-base lg:text-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              style={{
                borderRadius: "15px",
                background: "#303646",
                boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
              }}
            >
              <span>Hubungi</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Image Indicators - Minimalist */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentImageIndex
                ? "w-8 h-2 bg-warna-5"
                : "w-2 h-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
