"use client";

import { motion } from "framer-motion";
import { Shield, TrendingUp, Leaf, Award, Clock } from "lucide-react";

// User-focused advantages only (5 items)
const advantages = [
  {
    icon: Shield,
    title: "Produk Berkualitas Terverifikasi",
    description: "Semua produk maggot BSF dari peternak terverifikasi dengan standar kualitas terjamin untuk hasil terbaik.",
    color: "#a3af87",
  },
  {
    icon: TrendingUp,
    title: "Harga Transparan & Kompetitif",
    description: "Dapatkan harga terbaik langsung dari peternak tanpa markup berlebihan dari perantara.",
    color: "#435664",
  },
  {
    icon: Leaf,
    title: "Kontribusi Lingkungan",
    description: "Setiap pembelian dan penyetoran sampah Anda membantu mengurangi limbah organik dan jejak karbon.",
    color: "#303646",
  },
  {
    icon: Clock,
    title: "Pickup Sampah Gratis",
    description: "Nikmati layanan penjemputan sampah organik gratis dengan jadwal fleksibel untuk wilayah Banda Aceh.",
    color: "#a3af87",
  },
  {
    icon: Award,
    title: "Mudah & Praktis",
    description: "Platform user-friendly dengan proses pembelian dan penyetoran sampah yang cepat dan sederhana.",
    color: "#435664",
  },
];

export default function AdvantagesSection() {
  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-3 sm:mb-4" style={{ backgroundColor: "#fdf8d4", border: "2px solid #a3af87" }}>
            <Award className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: "#435664" }} />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase" style={{ color: "#303646" }}>
              Mengapa EcoMaggie?
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4" style={{ color: "#303646" }}>
            Keunggulan <span style={{ color: "#a3af87" }}>Platform Kami</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg max-w-3xl mx-auto" style={{ color: "#435664" }}>
            Nikmati pengalaman berbelanja maggot BSF dan kelola sampah organik dengan mudah, aman, dan berkontribusi untuk lingkungan
          </p>
        </motion.div>

        {/* Advantages Grid - 3 top, 2 bottom centered */}
        <div className="max-w-7xl mx-auto">
          {/* Top Row - 3 items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
            {advantages.slice(0, 3).map((advantage, index) => {
              const Icon = advantage.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={{
                    y: -10,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="group relative bg-white rounded-3xl p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-[#a3af87]/20 hover:border-[#a3af87] flex flex-col items-center text-center"
                >
                  {/* Background Gradient on Hover */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                    style={{ backgroundColor: advantage.color }}
                  ></div>

                  {/* Animated Icon Container */}
                  <div className="relative mb-6">
                    <motion.div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg mx-auto"
                      style={{ backgroundColor: advantage.color }}
                      whileHover={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1,
                      }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Icon className="h-10 w-10 text-white" />
                      </motion.div>
                    </motion.div>

                    {/* Decorative ring on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl border-2 opacity-0 group-hover:opacity-100"
                      style={{ borderColor: advantage.color }}
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Content */}
                  <div className="relative flex-1 flex flex-col items-center">
                    <motion.h3
                      className="text-xl lg:text-2xl font-bold mb-4 group-hover:text-[#a3af87] transition-colors"
                      style={{ color: "#303646" }}
                    >
                      {advantage.title}
                    </motion.h3>
                    <p className="text-sm lg:text-base leading-relaxed" style={{ color: "#435664" }}>
                      {advantage.description}
                    </p>
                  </div>

                  {/* Bottom Accent Line with Animation */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl"
                    style={{ backgroundColor: advantage.color }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                  />

                  {/* Floating particles on hover */}
                  <motion.div
                    className="absolute top-6 right-6 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: advantage.color }}
                    animate={{
                      y: [-5, -15, -5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Row - 2 items centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
            {advantages.slice(3, 5).map((advantage, index) => {
              const Icon = advantage.icon;
              const actualIndex = index + 3;

              return (
                <motion.div
                  key={actualIndex}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={{
                    y: -10,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="group relative bg-white rounded-3xl p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-[#a3af87]/20 hover:border-[#a3af87] flex flex-col items-center text-center"
                >
                  {/* Background Gradient on Hover */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                    style={{ backgroundColor: advantage.color }}
                  ></div>

                  {/* Animated Icon Container */}
                  <div className="relative mb-6">
                    <motion.div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg mx-auto"
                      style={{ backgroundColor: advantage.color }}
                      whileHover={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1,
                      }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Icon className="h-10 w-10 text-white" />
                      </motion.div>
                    </motion.div>

                    {/* Decorative ring on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl border-2 opacity-0 group-hover:opacity-100"
                      style={{ borderColor: advantage.color }}
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Content */}
                  <div className="relative flex-1 flex flex-col items-center">
                    <motion.h3
                      className="text-xl lg:text-2xl font-bold mb-4 group-hover:text-[#a3af87] transition-colors"
                      style={{ color: "#303646" }}
                    >
                      {advantage.title}
                    </motion.h3>
                    <p className="text-sm lg:text-base leading-relaxed" style={{ color: "#435664" }}>
                      {advantage.description}
                    </p>
                  </div>

                  {/* Bottom Accent Line with Animation */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl"
                    style={{ backgroundColor: advantage.color }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                  />

                  {/* Floating particles on hover */}
                  <motion.div
                    className="absolute top-6 right-6 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: advantage.color }}
                    animate={{
                      y: [-5, -15, -5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA - Single color (no gradient) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 lg:mt-16 text-center"
        >
          <div
            className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 rounded-3xl p-6 lg:p-8 shadow-2xl"
            style={{ backgroundColor: "#a3af87" }}
          >
            <div className="flex-1 text-left px-2 sm:px-0">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">
                Siap Bergabung dengan Revolusi Hijau?
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-white/90">
                Daftar sekarang dan mulai berkontribusi untuk masa depan yang lebih berkelanjutan
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <motion.a
                href="/register"
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white rounded-full font-bold text-xs sm:text-sm lg:text-base shadow-lg text-center"
                style={{ color: "#a3af87" }}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                Daftar Gratis
              </motion.a>
              <motion.a
                href="/market/products"
                className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-white text-white rounded-full font-bold text-xs sm:text-sm lg:text-base hover:bg-white transition-colors text-center"
                style={{
                  "--hover-color": "#a3af87"
                } as React.CSSProperties}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#ffffff",
                  color: "#a3af87"
                }}
                whileTap={{ scale: 0.95 }}
              >
                Lihat Produk
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
