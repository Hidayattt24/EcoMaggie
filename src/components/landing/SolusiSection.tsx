"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export default function SolusiSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const solutions = [
    {
      id: "maggot-market",
      title: "Maggot Market",
      subtitle: "Marketplace Produk Maggot",
      description:
        "Platform jual-beli produk maggot BSF (Black Soldier Fly) untuk pakan ternak berkualitas tinggi. Hubungkan peternak maggot dengan pembeli dari seluruh Indonesia dengan harga transparan, sistem verifikasi kualitas, dan pengiriman terpercaya.",
      image: "/assets/landing/solusi/maggot-market.svg",
      borderColor: "#A3AF87",
      buttonColor: "#A3AF87",
      buttonHoverColor: "#8d9975",
      buttonText: "Ayo Mulai Petualangan dengan Maggot Market",
      href: "/market",
    },
    {
      id: "supply-connect",
      title: "Supply Connect",
      subtitle: "Pengelolaan Sampah Organik",
      description:
        "Sistem penghubung antara penghasil sampah organik dengan petani maggot. Kelola limbah organik Anda dengan mudah melalui penjadwalan pengambilan, tracking real-time, dan verifikasi kualitas untuk mendukung budidaya maggot yang berkelanjutan.",
      image: "/assets/landing/solusi/supply-connect.svg",
      borderColor: "#303646",
      buttonColor: "#303646",
      buttonHoverColor: "#435664",
      buttonText: "Ayo Mulai Petualangan dengan Supply Connect",
      href: "/supply",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % solutions.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + solutions.length) % solutions.length);
  };

  return (
    <section
      id="solusi-section"
      ref={sectionRef}
      className="flex items-center justify-center overflow-hidden py-12 lg:py-20 bg-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{
                backgroundColor: "rgba(163, 175, 135, 0.1)",
                color: "#5a6c5b",
              }}
            >
              Solusi Kami
            </span>
            <h2
              className="text-3xl lg:text-4xl font-bold mb-3"
              style={{ color: "#303646" }}
            >
              Dua Platform, Satu Ekosistem
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Solusi terintegrasi untuk pengelolaan sampah organik dan
              perdagangan produk maggot
            </p>
          </motion.div>

          {/* Desktop Grid View */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                {/* Background Image with Overlay */}
                <div className="relative h-[500px]">
                  <Image
                    src={solution.image}
                    alt={solution.title}
                    fill
                    className="object-cover"
                    loading="lazy"
                    quality={80}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                  />
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

                  {/* Colored Border */}
                  <div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      border: `4px solid ${solution.borderColor}`,
                    }}
                  />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  {/* Title */}
                  <div>
                    <h3 className="text-white text-3xl lg:text-4xl font-bold leading-tight mb-1">
                      {solution.title}
                    </h3>
                    <p className="text-white/80 text-lg font-medium">
                      {solution.subtitle}
                    </p>
                  </div>

                  {/* Description & CTA */}
                  <div className="space-y-6">
                    {/* Glass Card Description */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                      <p className="text-white text-sm leading-relaxed">
                        {solution.description}
                      </p>
                    </div>

                    {/* CTA Button - Full Width */}
                    <Link
                      href={solution.href}
                      className="flex items-center justify-center gap-2 w-full px-6 py-4 text-white rounded-full font-semibold transition-all duration-300 hover:gap-3 group/btn"
                      style={{
                        backgroundColor: solution.buttonColor,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          solution.buttonHoverColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          solution.buttonColor;
                      }}
                    >
                      <span>{solution.buttonText}</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Slider View */}
          <div className="lg:hidden relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {solutions.map((solution) => (
                  <div
                    key={solution.id}
                    className="w-full flex-shrink-0 px-2"
                  >
                    <div className="group relative rounded-3xl overflow-hidden shadow-xl">
                      {/* Background Image with Overlay */}
                      <div className="relative h-[500px]">
                        <Image
                          src={solution.image}
                          alt={solution.title}
                          fill
                          className="object-cover"
                          loading="lazy"
                          quality={80}
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                        />
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

                        {/* Colored Border */}
                        <div
                          className="absolute inset-0 rounded-3xl"
                          style={{
                            border: `4px solid ${solution.borderColor}`,
                          }}
                        />
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        {/* Title */}
                        <div>
                          <h3 className="text-white text-2xl font-bold leading-tight mb-1">
                            {solution.title}
                          </h3>
                          <p className="text-white/80 text-base font-medium">
                            {solution.subtitle}
                          </p>
                        </div>

                        {/* Description & CTA */}
                        <div className="space-y-4">
                          {/* Glass Card Description */}
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                            <p className="text-white text-sm leading-relaxed">
                              {solution.description}
                            </p>
                          </div>

                          {/* CTA Button - Full Width */}
                          <Link
                            href={solution.href}
                            className="flex items-center justify-center gap-2 w-full px-6 py-3 text-white rounded-full font-semibold transition-all duration-300"
                            style={{
                              backgroundColor: solution.buttonColor,
                            }}
                          >
                            <span className="text-sm">{solution.buttonText}</span>
                            <ArrowRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              {/* Previous Button */}
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>

              {/* Indicators */}
              <div className="flex gap-2">
                {solutions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? "w-8 bg-[#A3AF87]"
                        : "w-2 bg-gray-300"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
