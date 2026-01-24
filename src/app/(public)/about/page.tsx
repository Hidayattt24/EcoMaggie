"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Recycle,
  Users,
  Leaf,
  Target,
  Eye,
  CheckCircle2,
  TrendingUp,
  Heart,
  Shield,
  Zap,
  ArrowRight
} from "lucide-react";
import { NavbarUser } from "@/components/user/NavbarUser";
import FooterSection from "@/components/landing/FooterSection";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";

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

export default function AboutPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Navbar */}
      <NavbarUser />

      {/* Main Content */}
      <div className="bg-white">
        {/* Hero Section - Tentang Kami */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#A3AF87]/5 via-white to-[#ebfba8]/10 overflow-hidden">
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
                      loading="lazy"
                      quality={80}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
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
                  Tentang EcoMaggie
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-[#2d3e2f] leading-tight">
                Solusi Cerdas Kelola Limbah,{" "}
                <span className="text-[#A3AF87]">Berdayakan Petani Lokal</span>
              </h1>

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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Misi & Visi Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2d3e2f] mb-4">
              Misi & Visi Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Komitmen kami untuk menciptakan ekosistem berkelanjutan
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Visi */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-[#A3AF87]/10 to-[#ebfba8]/20 border-2 border-[#A3AF87]/20"
            >
              <div className="absolute -top-6 left-8 w-12 h-12 rounded-xl bg-[#A3AF87] flex items-center justify-center shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-bold text-[#2d3e2f] mb-4">Visi</h3>
                <p className="text-gray-700 leading-relaxed">
                  Menjadi platform terdepan dalam ekonomi sirkular di Indonesia,
                  mengubah limbah organik menjadi sumber daya berkelanjutan yang
                  memberdayakan petani lokal dan menjaga kelestarian lingkungan.
                </p>
              </div>
            </motion.div>

            {/* Misi */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-[#435664]/5 to-[#303646]/5 border-2 border-[#435664]/20"
            >
              <div className="absolute -top-6 left-8 w-12 h-12 rounded-xl bg-[#435664] flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-bold text-[#2d3e2f] mb-4">Misi</h3>
                <ul className="space-y-3">
                  {[
                    "Menghubungkan penghasil limbah dengan petani maggot BSF",
                    "Menyediakan marketplace produk organik berkualitas",
                    "Meningkatkan kesadaran masyarakat tentang ekonomi sirkular",
                    "Memberdayakan ekonomi petani lokal Banda Aceh"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#A3AF87] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mengapa Memilih EcoMaggie */}
      <section className="py-20 bg-gradient-to-br from-[#ebfba8]/10 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2d3e2f] mb-4">
              Mengapa Memilih <span className="text-[#A3AF87]">EcoMaggie</span>?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Keunggulan yang membedakan kami dari yang lain
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Proses Cepat",
                desc: "Pengambilan limbah organik dalam 1-2 hari setelah request",
                color: "#A3AF87"
              },
              {
                icon: Shield,
                title: "Terpercaya",
                desc: "Bermitra dengan petani maggot terverifikasi di Banda Aceh",
                color: "#435664"
              },
              {
                icon: Heart,
                title: "Berdampak Sosial",
                desc: "Setiap transaksi memberdayakan ekonomi petani lokal",
                color: "#A3AF87"
              },
              {
                icon: TrendingUp,
                title: "Berkelanjutan",
                desc: "Kontribusi nyata untuk ekonomi sirkular dan lingkungan",
                color: "#303646"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative p-6 rounded-2xl bg-white border-2 border-gray-100 hover:border-[#A3AF87]/30 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon className="w-7 h-7" style={{ color: item.color }} />
                </div>
                <h3 className="text-xl font-bold text-[#2d3e2f] mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bergabunglah dengan Kami - CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#A3AF87]/10 via-[#ebfba8]/20 to-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="relative p-12 lg:p-16 text-center bg-gradient-to-br from-[#303646] to-[#435664]">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#A3AF87]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ebfba8]/10 rounded-full blur-3xl" />

              <div className="relative z-10 space-y-6">
                <div className="inline-block">
                  <span className="px-4 py-2 bg-[#A3AF87]/20 text-[#ebfba8] rounded-full text-sm font-medium backdrop-blur-sm">
                    Mari Bergabung
                  </span>
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                  Bergabunglah dengan Gerakan{" "}
                  <span className="text-[#ebfba8]">Ekonomi Sirkular</span>
                </h2>

                <p className="text-gray-200 text-lg max-w-2xl mx-auto leading-relaxed">
                  Bersama EcoMaggie, mari ciptakan masa depan yang lebih berkelanjutan.
                  Setiap langkah kecil Anda membuat perbedaan besar untuk lingkungan dan petani lokal.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-[#303646] rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/market"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
                  >
                    <span>Jelajahi Produk</span>
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-white/20 mt-12">
                  {[
                    { value: "60%", label: "Pengurangan Sampah" },
                    { value: "±1 Ton", label: "Terolah/Bulan" },
                    { value: "50+", label: "Mitra UMKM" },
                    { value: "100%", label: "Ekonomi Sirkular" }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.6 }}
                      className="text-center"
                    >
                      <div className="text-2xl lg:text-3xl font-bold text-[#ebfba8] mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-300">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>

      {/* Footer */}
      <FooterSection />

      {/* Floating WhatsApp */}
      <FloatingWhatsApp />
    </>
  );
}
