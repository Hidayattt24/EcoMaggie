"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Leaf,
  TrendingDown,
  Users,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function DampakSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [percentageCount, setPercentageCount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const images = [
    "/assets/landing/landing-page.svg",
    "/assets/landing/landing-page-2.svg",
    "/assets/landing/landing-page-3.svg",
  ];

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

  // Auto slide images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const stats = [
    {
      value: "500+",
      unit: "kg",
      label: "Sampah Organik Terkelola",
      icon: Package,
    },
    {
      value: "1.2",
      unit: "ton CO₂",
      label: "Emisi Dicegah",
      icon: TrendingDown,
    },
    {
      value: "150+",
      unit: "",
      label: "Penghasil Sampah Aktif",
      icon: Users,
    },
    {
      value: "60+",
      unit: "",
      label: "Mitra Petani Maggot",
      icon: Leaf,
    },
  ];

  return (
    <section
      id="dampak-section"
      ref={sectionRef}
      className="py-0 bg-white overflow-hidden"
    >
      <div className="w-full">
        {/* Full Width Image Container */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[700px] lg:h-[800px]"
        >
          {/* Background Images - Instant Change, No Animation */}
          <div className="absolute inset-0">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 ${
                  currentImageIndex === index ? "block" : "hidden"
                }`}
              >
                <Image
                  src={image}
                  alt={`Dampak EcoMaggie ${index + 1}`}
                  fill
                  className="object-cover"
                  loading="lazy"
                  quality={80}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Hidden on Mobile */}
          <button
            onClick={prevImage}
            className="hidden lg:block absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextImage}
            className="hidden lg:block absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Content Overlay */}
          <div className="absolute inset-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
              <div className="max-w-7xl mx-auto h-full flex flex-col justify-between py-8 lg:py-12">
                {/* Top: Main Stat - 80% */}
                <motion.div
                  initial={{ opacity: 0, y: -30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex justify-center lg:justify-start"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-white/20">
                    <div className="flex items-center gap-4 lg:gap-6">
                      {/* Circular Progress */}
                      <div className="relative w-24 h-24 lg:w-32 lg:h-32 flex-shrink-0">
                        <svg
                          className="w-full h-full -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          {/* Background Track */}
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth="8"
                          />
                          {/* Progress Circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="#A3AF87"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 42}`}
                            strokeDashoffset={`${
                              2 * Math.PI * 42 * (1 - percentageCount / 100)
                            }`}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl lg:text-4xl font-bold text-white">
                            {percentageCount}%
                          </span>
                        </div>
                      </div>

                      {/* Text */}
                      <div>
                        <p className="text-white text-xl lg:text-2xl font-bold leading-tight">
                          Penghasil Sampah
                        </p>
                        <p className="text-white/80 text-lg lg:text-xl font-medium">
                          Beralih ke EcoMaggie
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Bottom: Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-4 lg:p-5 border border-white/20 hover:bg-white/15 transition-all duration-300"
                    >
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: "#A3AF87" }}
                      >
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>

                      {/* Value */}
                      <div className="mb-1">
                        <span className="text-2xl lg:text-3xl font-bold text-white">
                          {stat.value}
                        </span>
                        {stat.unit && (
                          <span className="text-sm lg:text-base font-semibold text-white/80 ml-1">
                            {stat.unit}
                          </span>
                        )}
                      </div>

                      {/* Label */}
                      <p className="text-white/90 text-xs lg:text-sm font-medium leading-tight">
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
