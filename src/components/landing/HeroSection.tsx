"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle2,
  Sprout,
  Drumstick,
  Recycle,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useState } from "react";

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  const stats = [
    { value: "60%", label: "Pengurangan Sampah", color: "#8a9670" },
    { value: "±1 Ton", label: "Terolah/Bulan", color: "#435664" },
    { value: "50+", label: "Mitra UMKM", color: "#8a9670" },
    { value: "100%", label: "Ekonomi Sirkular", color: "#303646" },
  ];

  const mitraData = [
    {
      image: "/assets/landing/beranda/mitra-1.svg",
      caption:
        "META MAGGOT,BSF FARM - Mitra Terpercaya dalam Transformasi Limbah Organik",
    },
    {
      image: "/assets/landing/beranda/mitra-2.svg",
      caption:
        "META MAGGOT,BSF FARM - Budidaya Maggot BSF Berkualitas untuk Ekonomi Sirkular",
    },
  ];

  const mitraInfo = {
    name: "Meta Maggot",
    description:
      "Meta Maggot adalah mitra pertama EcoMaggie yang berkomitmen dalam transformasi sampah organik menjadi produk bernilai ekonomi tinggi. Dengan pendekatan inovatif dan berkelanjutan, Meta Maggot membuktikan bahwa pengelolaan limbah organik dapat menjadi peluang bisnis yang menguntungkan sekaligus ramah lingkungan.",
    highlights: [
      { text: "Mitra Terpercaya Sejak Awal", bgColor: "#EEF8F0" },
      { text: "Budidaya Maggot BSF Berkualitas", bgColor: "#FBF0EC" },
      { text: "Pengolahan Sampah Organik Efisien", bgColor: "#F1F2F7" },
      { text: "Kontribusi Ekonomi Sirkular", bgColor: "#FBF3E8" },
    ],
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + 3) % 3);
  };

  return (
    <section
      id="beranda-section"
      className="relative min-h-screen flex items-center overflow-hidden bg-white"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20"
          style={{ backgroundColor: "#ebfba8" }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/4 right-20 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: "#a3af87" }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-48 h-48 rounded-full opacity-15"
          style={{ backgroundColor: "#fdf8d4" }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-5 lg:space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2"
              style={{
                backgroundColor: "#fdf8d4",
                borderColor: "#a3af87",
              }}
            >
              <Sparkles className="h-4 w-4" style={{ color: "#435664" }} />
              <span
                className="text-xs sm:text-sm font-semibold tracking-wider uppercase poppins-semibold"
                style={{ color: "#303646" }}
              >
                #UpStreamToDownStream
              </span>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight poppins-bold"
                style={{ color: "#303646" }}
              >
                Ubah{" "}
                <span
                  className="relative inline-block"
                  style={{ color: "#8a9670" }}
                >
                  Limbah Organik
                  <motion.div
                    className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-2 sm:h-3 opacity-30"
                    style={{ backgroundColor: "#ebfba8" }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                </span>
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-2xl sm:text-3xl lg:text-4xl poppins-bold"
                style={{ color: "#303646" }}
              >
                Jadi Pakan Ternak Bernutrisi
              </motion.h2>
            </div>

            {/* Description with Hook */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-2"
            >
              <p
                className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl poppins-semibold"
                style={{ color: "#8a9670" }}
              >
                Tahukah kamu?
              </p>
              <p
                className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl poppins-semibold"
                style={{ color: "#435664" }}
              >
                Sampah organikmu bisa menyelamatkan lingkungan sekaligus menjadi
                sumber pakan berkualitas. EcoMaggie menghubungkan penghasil
                limbah dengan peternak maggot BSF untuk menciptakan ekosistem{" "}
                <span className="poppins-bold" style={{ color: "#8a9670" }}>
                  ekonomi sirkular
                </span>{" "}
                yang produktif.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Link href="/supply">
                <motion.div
                  className="group relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-white text-sm sm:text-base rounded-xl shadow-lg overflow-hidden poppins-semibold cursor-pointer focus:outline-none"
                  style={{ backgroundColor: "#a3af87" }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 15px 30px rgba(163, 175, 135, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                    transition={{ duration: 0.3 }}
                  />
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Setor Sampah Sekarang</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Link>

              <Link href="/market">
                <motion.div
                  className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all poppins-semibold cursor-pointer focus:outline-none"
                  style={{
                    color: "#435664",
                    borderColor: "#a3af87",
                    backgroundColor: "transparent",
                  }}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "#a3af87",
                    color: "#ffffff",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Cek Maggot Market</span>
                </motion.div>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-3"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="text-center"
                >
                  <div
                    className="text-xl sm:text-2xl lg:text-3xl mb-1 poppins-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-[10px] sm:text-xs poppins-semibold"
                    style={{ color: "#435664" }}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Glassmorphism Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg">
              {/* Main Glassmorphism Card */}
              <motion.div
                className="relative"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Glow Effect */}
                <div
                  className="absolute inset-0 rounded-3xl blur-3xl opacity-40"
                  style={{ backgroundColor: "#a3af87" }}
                />

                {/* Main Card with Glassmorphism */}
                <div
                  className="relative rounded-3xl p-6 shadow-2xl border border-white/40"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(253, 248, 212, 0.8) 100%)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Live Monitor Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/50"
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      <span
                        className="text-xs poppins-semibold"
                        style={{ color: "#435664" }}
                      >
                        Live Monitor
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" style={{ color: "#8a9670" }} />
                      <span
                        className="text-xs poppins-semibold"
                        style={{ color: "#8a9670" }}
                      >
                        Active
                      </span>
                    </div>
                  </motion.div>

                  {/* Circular Economy Flow */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex items-center justify-center gap-4 mb-6"
                  >
                    {/* Step 1: Limbah */}
                    <motion.div
                      className="flex flex-col items-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-2"
                        style={{ backgroundColor: "#fdf8d4" }}
                        animate={{
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                        }}
                      >
                        <Sprout className="w-8 h-8 text-[#435664]" />
                      </motion.div>
                      <span
                        className="text-[10px] poppins-semibold"
                        style={{ color: "#435664" }}
                      >
                        Limbah
                      </span>
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                      animate={{
                        x: [0, 5, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      <ArrowRight
                        className="h-5 w-5"
                        style={{ color: "#a3af87" }}
                      />
                    </motion.div>

                    {/* Step 2: EcoMaggie */}
                    <motion.div
                      className="flex flex-col items-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-2"
                        style={{ backgroundColor: "#ebfba8" }}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <Recycle className="w-8 h-8 text-[#a3af87]" />
                      </motion.div>
                      <span
                        className="text-[10px] poppins-semibold"
                        style={{ color: "#435664" }}
                      >
                        EcoMaggie
                      </span>
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                      animate={{
                        x: [0, 5, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 0.3,
                      }}
                    >
                      <ArrowRight
                        className="h-5 w-5"
                        style={{ color: "#a3af87" }}
                      />
                    </motion.div>

                    {/* Step 3: Pakan */}
                    <motion.div
                      className="flex flex-col items-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-2"
                        style={{ backgroundColor: "#a3af87" }}
                        animate={{
                          rotate: [0, -5, 5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                        }}
                      >
                        <Drumstick className="w-8 h-8 text-white" />
                      </motion.div>
                      <span className="text-[10px] poppins-semibold text-white">
                        Pakan Ternak
                      </span>
                    </motion.div>
                  </motion.div>

                  {/* Impact Score */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/60"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs poppins-semibold"
                        style={{ color: "#435664" }}
                      >
                        Impact Score
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.9 + i * 0.1 }}
                          >
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="h-4 w-4"
                        style={{ color: "#8a9670" }}
                      />
                      <span
                        className="text-xs poppins-semibold"
                        style={{ color: "#8a9670" }}
                      >
                        60% Reduksi Sampah Tercapai
                      </span>
                    </div>
                  </motion.div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1 }}
                      className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/60"
                    >
                      <div
                        className="text-lg poppins-bold"
                        style={{ color: "#8a9670" }}
                      >
                        ±1 Ton
                      </div>
                      <div
                        className="text-[10px] poppins-semibold"
                        style={{ color: "#435664" }}
                      >
                        Terolah/Bulan
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                      className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/60"
                    >
                      <div
                        className="text-lg poppins-bold"
                        style={{ color: "#435664" }}
                      >
                        50+ UMKM
                      </div>
                      <div
                        className="text-[10px] poppins-semibold"
                        style={{ color: "#435664" }}
                      >
                        Mitra Aktif
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge: Supply Connect */}
              <motion.div
                className="absolute -top-4 -left-4 bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-2 shadow-xl border border-white/60"
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                whileHover={{ scale: 1.05, rotate: -5 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-green-500"
                    animate={{
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  <div>
                    <div
                      className="text-[10px] poppins-semibold"
                      style={{ color: "#435664" }}
                    >
                      Supply Connect
                    </div>
                    <div
                      className="text-xs poppins-bold"
                      style={{ color: "#8a9670" }}
                    >
                      Limbah Terjemput ✓
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge: Market Price */}
              <motion.div
                className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-xl rounded-2xl px-4 py-2 shadow-xl border border-white/60"
                initial={{ opacity: 0, scale: 0, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp
                    className="h-4 w-4"
                    style={{ color: "#8a9670" }}
                  />
                  <div>
                    <div
                      className="text-[10px] poppins-semibold"
                      style={{ color: "#435664" }}
                    >
                      Market Price
                    </div>
                    <div
                      className="text-xs poppins-bold"
                      style={{ color: "#303646" }}
                    >
                      Rp 95.000 / Kg
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge: Circular Economy */}
              <motion.div
                className="absolute top-1/2 -right-8 bg-white/90 backdrop-blur-xl rounded-full w-16 h-16 flex items-center justify-center shadow-xl border border-white/60"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                transition={{
                  opacity: { duration: 0.5, delay: 1.4 },
                  scale: { duration: 0.5, delay: 1.4 },
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                }}
              >
                <Recycle className="w-8 h-8 text-[#a3af87]" />
              </motion.div>

              {/* Decorative Floating Elements */}
              <motion.div
                className="absolute top-10 -left-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: "#fdf8d4" }}
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <TrendingUp className="w-6 h-6 text-[#a3af87]" />
              </motion.div>

              <motion.div
                className="absolute bottom-16 -left-6 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: "white",
                  border: "2px solid #a3af87",
                }}
                animate={{
                  y: [0, 12, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <Users className="w-5 h-5 text-[#a3af87]" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Mitra Section - Partner Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 lg:mt-24"
        >
          {/* Section Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                backgroundColor: "#fdf8d4",
                border: "2px solid #a3af87",
              }}
            >
              <Building2 className="h-4 w-4" style={{ color: "#435664" }} />
              <span
                className="text-xs font-bold tracking-wider uppercase"
                style={{ color: "#303646" }}
              >
                Mitra Kami
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold"
              style={{ color: "#303646" }}
            >
              Partner <span style={{ color: "#8a9670" }}>Terpercaya</span>
            </h2>
          </div>

          {/* Carousel Container */}
          <div className="relative max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Image Card with Aspect Ratio */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl min-h-[350px] sm:min-h-[500px] lg:min-h-[650px]">
                {/* Image Slides */}
                {mitraData.map((mitra, index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      opacity: activeSlide === index ? 1 : 0,
                      scale: activeSlide === index ? 1 : 1.1,
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Image */}
                    <img
                      src={mitra.image}
                      alt={mitra.caption}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

                    {/* Border */}
                    <div
                      className="absolute inset-0 border-2 sm:border-4 rounded-2xl sm:rounded-3xl"
                      style={{ borderColor: "#a3af87" }}
                    />

                    {/* Caption at Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-6">
                      <motion.div
                        className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: activeSlide === index ? 1 : 0,
                          y: activeSlide === index ? 0 : 20,
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <p className="text-white text-xs sm:text-sm md:text-base font-medium leading-relaxed poppins-semibold">
                          {mitra.caption}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}

                {/* Slide 3 - Partner Information */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center px-12 py-3 sm:p-8 lg:p-12"
                  initial={false}
                  animate={{
                    opacity: activeSlide === 2 ? 1 : 0,
                    scale: activeSlide === 2 ? 1 : 1.1,
                  }}
                  transition={{ duration: 0.6 }}
                  style={{ backgroundColor: "#fdf8d4" }}
                >
                  <div className="w-full max-w-3xl space-y-2 sm:space-y-6 lg:space-y-8 my-auto">
                    {/* Mitra Name */}
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                      <div
                        className="p-1.5 sm:p-3 lg:p-4 rounded-full"
                        style={{ backgroundColor: "#a3af87" }}
                      >
                        <Building2 className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                      </div>
                      <h3
                        className="text-lg sm:text-3xl md:text-4xl lg:text-5xl poppins-bold"
                        style={{ color: "#303646" }}
                      >
                        {mitraInfo.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p
                      className="text-[10px] sm:text-base md:text-lg lg:text-xl leading-snug sm:leading-relaxed poppins-semibold"
                      style={{ color: "#435664" }}
                    >
                      {mitraInfo.description}
                    </p>

                    {/* Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3 lg:gap-4">
                      {mitraInfo.highlights.map((highlight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: activeSlide === 2 ? 1 : 0,
                            x: activeSlide === 2 ? 0 : -10,
                          }}
                          transition={{
                            duration: 0.4,
                            delay: 0.2 + index * 0.1,
                          }}
                          className="flex items-start gap-1.5 sm:gap-3 p-1.5 sm:p-3 lg:p-4 rounded-lg"
                          style={{ backgroundColor: highlight.bgColor }}
                        >
                          <CheckCircle2
                            className="h-3 w-3 sm:h-5 sm:w-5 lg:h-6 lg:w-6 flex-shrink-0 mt-0.5 sm:mt-1"
                            style={{ color: "#8a9670" }}
                          />
                          <span
                            className="text-[10px] sm:text-sm md:text-base lg:text-lg poppins-semibold"
                            style={{ color: "#303646" }}
                          >
                            {highlight.text}
                          </span>
                        </motion.div>
                      ))}
                      '
                    </div>
                  </div>
                </motion.div>

                {/* Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full shadow-xl hover:scale-110 transition-all z-30"
                  style={{
                    backgroundColor:
                      activeSlide === 2
                        ? "#a3af87"
                        : "rgba(255, 255, 255, 0.2)",
                    borderWidth: "1px",
                    borderColor:
                      activeSlide === 2
                        ? "#a3af87"
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                  aria-label="Previous slide"
                >
                  <ChevronLeft
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    style={{ color: activeSlide === 2 ? "#ffffff" : "#ffffff" }}
                  />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full shadow-xl hover:scale-110 transition-all z-30"
                  style={{
                    backgroundColor:
                      activeSlide === 2
                        ? "#a3af87"
                        : "rgba(255, 255, 255, 0.2)",
                    borderWidth: "1px",
                    borderColor:
                      activeSlide === 2
                        ? "#a3af87"
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                  aria-label="Next slide"
                >
                  <ChevronRight
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    style={{ color: activeSlide === 2 ? "#ffffff" : "#ffffff" }}
                  />
                </button>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: activeSlide === index ? "32px" : "8px",
                      backgroundColor:
                        activeSlide === index ? "#a3af87" : "#a3af87",
                      opacity: activeSlide === index ? 1 : 0.3,
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
