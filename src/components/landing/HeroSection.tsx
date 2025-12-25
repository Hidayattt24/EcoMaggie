"use client";

import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  const scrollToNext = () => {
    const nextSection = document.getElementById("tentang-section");
    nextSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="beranda-section"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/landing/sampah-beranda.png"
          alt="Sampah Beranda Background"
          fill
          className="object-cover brightness-75"
          priority
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(156, 171, 132, 0.00) 0%, #16321A 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 w-full py-20 lg:py-0"
        style={{ paddingLeft: "135px" }}
      >
        <div className="max-w-4xl text-left">
          {/* Main Heading */}
          <h1
            className="text-white mb-5 poppins-semibold leading-tight animate-fade-in-up"
            style={{ fontSize: "52px" }}
          >
            Dari Maggot Kecil,
            <br />
            Lahir Perubahan Besar
          </h1>

          {/* Description */}
          <p
            className="text-white mb-10 poppins-regular max-w-3xl leading-relaxed animate-fade-in-up animation-delay-200"
            style={{ fontSize: "16px" }}
          >
            EcoMaggie menghubungkan penghasil sampah organik dengan petani
            maggot melalui platform digital untuk menciptakan solusi pengelolaan
            limbah yang berkelanjutan dan bernilai ekonomi.
          </p>

          {/* CTA Button */}
          <button
            onClick={scrollToNext}
            className="group relative inline-flex items-center gap-2 px-8 py-3 bg-white text-[#16321A] poppins-semibold rounded-full transition-all duration-300 hover:shadow-2xl hover:scale-105 animate-fade-in-up animation-delay-400"
            style={{ fontSize: "14px" }}
          >
            <span>Jelajahi EcoMaggie</span>
            <span className="w-8 h-8 flex items-center justify-center bg-[#16321A] text-white rounded-full group-hover:translate-x-1 transition-transform duration-300">
              <svg
                className="w-4 h-4"
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
