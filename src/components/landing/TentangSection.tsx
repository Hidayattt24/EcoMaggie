"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Recycle, Users, Leaf } from "lucide-react";

const carouselImages = [
  {
    src: "/assets/landing/tentang/image-1.svg",
    caption: "Tim EcoMaggie - Bersama Membangun Masa Depan Berkelanjutan",
  },
  {
    src: "/assets/landing/tentang/image-2.svg",
    caption: "Petani Maggot Lokal - Mengubah Limbah Menjadi Berkah",
  },
  {
    src: "/assets/landing/tentang/image-3.svg",
    caption: "Proses Budidaya - Teknologi Modern untuk Hasil Maksimal",
  },
  {
    src: "/assets/landing/tentang/image-4.svg",
    caption: "Produk Berkualitas - Dari Alam untuk Kehidupan",
  },
];

export default function TentangSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="tentang-section"
      className="relative py-20 bg-white overflow-hidden"
    >

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Left: Auto-scrolling Carousel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Main Carousel Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              {/* Images */}
              {carouselImages.map((image, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: currentIndex === idx ? 1 : 0,
                    scale: currentIndex === idx ? 1 : 1.1,
                  }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={image.src}
                    alt={image.caption}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
                  
                  {/* Green Border */}
                  <div className="absolute inset-0 border-4 border-[#A3AF87] rounded-3xl" />
                  
                  {/* Caption Overlay with Glass Effect */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: currentIndex === idx ? 1 : 0,
                        y: currentIndex === idx ? 0 : 20,
                      }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20"
                    >
                      <p className="text-white text-sm md:text-base font-medium leading-relaxed">
                        {image.caption}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {carouselImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === idx
                      ? "w-8 bg-[#A3AF87]"
                      : "w-2 bg-[#A3AF87]/30 hover:bg-[#A3AF87]/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-block">
              <span className="px-4 py-2 bg-[#A3AF87]/10 text-[#5a6c5b] rounded-full text-sm font-medium">
                Tentang Kami
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-[#2d3e2f] leading-tight">
              Solusi Cerdas Kelola Limbah,{" "}
              <span className="text-[#A3AF87]">Berdayakan Petani Lokal</span>
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed">
              &quot;Di Banda Aceh, sampah organik bukan lagi masalah, melainkan
              potensi. EcoMaggie adalah platform yang menyederhanakan cara kita
              mengelola limbah dengan menghubungkan langsung sumber sampah ke
              tangan petani maggot.&quot;
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: Recycle,
                  title: "Kelola Limbah Organik",
                  desc: "Ubah sampah menjadi sumber daya berharga",
                },
                {
                  icon: Users,
                  title: "Dukung Petani Lokal",
                  desc: "Berdayakan ekonomi petani maggot",
                },
                {
                  icon: Leaf,
                  title: "Jaga Lingkungan",
                  desc: "Kurangi jejak karbon dan limbah TPA",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-[#A3AF87]/30 hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#A3AF87]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[#A3AF87]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2d3e2f] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="w-full"
            >
              <Link
                href="/market"
                className="group inline-flex items-center justify-center gap-3 w-full px-8 py-4 poppins-semibold text-white text-base lg:text-lg transition-all duration-300 hover:scale-105"
                style={{
                  borderRadius: "15px",
                  background: "#303646",
                  boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
                }}
              >
                <span>Jelajahi</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
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
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
