"use client";

import { motion } from "framer-motion";
import { Leaf, Apple, Salad, Flower, Lightbulb, Sprout } from "lucide-react";

const organicWasteTypes = [
  {
    icon: Apple,
    title: "Sisa Makanan",
    description: "Sisa hidangan, buah busuk",
    color: "#a3af87",
    bgColor: "#EEF8F0",
  },
  {
    icon: Salad,
    title: "Sayur & Buah",
    description: "Potongan sayur, kulit buah",
    color: "#435664",
    bgColor: "#FBF0EC",
  },
  {
    icon: Leaf,
    title: "Daun Kering",
    description: "Ranting, daun gugur",
    color: "#303646",
    bgColor: "#F1F2F7",
  },
  {
    icon: Flower,
    title: "Limbah Pasar",
    description: "Sayuran busuk, sisa dagang",
    color: "#8a9670",
    bgColor: "#FBF3E8",
  },
];

export default function AboutOrganic() {
  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-10 left-10 w-64 h-64 rounded-full"
          style={{ backgroundColor: "#a3af87" }}
        ></div>
        <div
          className="absolute bottom-10 right-10 w-96 h-96 rounded-full"
          style={{ backgroundColor: "#435664" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{ backgroundColor: "#ffffff", border: "2px solid #a3af87" }}
          >
            <Leaf className="h-4 w-4" style={{ color: "#435664" }} />
            <span
              className="text-xs font-bold tracking-wider uppercase"
              style={{ color: "#303646" }}
            >
              Edukasi
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: "#303646" }}
          >
            Apa Itu <span style={{ color: "#8a9670" }}>Sampah Organik?</span>
          </h2>
        </motion.div>

        {/* Main Content - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Tahukah Kamu Badge */}
            <div className="inline-block">
              <div
                className="px-4 py-2 rounded-lg flex items-center gap-2"
                style={{ backgroundColor: "#a3af87" }}
              >
                <Lightbulb className="h-5 w-5" style={{ color: "#ffffff" }} />
                <p
                  className="text-base sm:text-lg font-bold"
                  style={{ color: "#ffffff" }}
                >
                  Tahukah kamu?
                </p>
              </div>
            </div>

            {/* Main Text */}
            <div className="space-y-4">
              <p
                className="text-base sm:text-lg font-semibold leading-relaxed"
                style={{ color: "#303646" }}
              >
                Sampah organik bukan sekadar sisa pembuangan, melainkan sumber
                daya yang berharga.
              </p>

              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: "#435664" }}
              >
                Sampah organik adalah segala bahan sisa yang berasal dari
                makhluk hidup seperti sisa makanan, potongan sayur, buah-buahan
                busuk, hingga daun kering yang dapat terurai secara alami oleh
                alam.
              </p>

              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: "#435664" }}
              >
                Namun, jika hanya dibuang ke TPA tanpa dikelola, sampah ini akan
                menghasilkan{" "}
                <span className="font-semibold" style={{ color: "#303646" }}>
                  gas metana yang berbahaya bagi iklim kita
                </span>
                . Di sinilah{" "}
                <span className="font-bold" style={{ color: "#8a9670" }}>
                  Eco-maggie hadir
                </span>
                . Kami melihat potensi besar di balik setiap sisa dapur dan
                pasar untuk diubah menjadi protein pakan ternak berkualitas
                melalui bantuan maggot BSF (Black Soldier Fly).
              </p>

              <div
                className="p-4 sm:p-6 rounded-xl border-2"
                style={{ backgroundColor: "#ffffff", borderColor: "#a3af87" }}
              >
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: "#435664" }}
                >
                  <span className="font-semibold" style={{ color: "#303646" }}>
                    Dengan memilah sampah organik
                  </span>
                  , kamu tidak hanya membantu membersihkan lingkungan, tetapi
                  juga ikut menggerakkan roda ekonomi sirkular yang memberikan
                  manfaat nyata bagi para peternak dan ekosistem kita.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Visual Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-4 sm:gap-6"
          >
            {organicWasteTypes.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-4 sm:p-6 rounded-xl shadow-lg border-2 hover:shadow-2xl transition-all duration-300"
                  style={{
                    backgroundColor: item.bgColor,
                    borderColor: item.color,
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div
                      className="p-3 sm:p-4 rounded-full"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Icon
                        className="h-6 w-6 sm:h-8 sm:w-8"
                        style={{ color: item.color }}
                      />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-sm sm:text-base mb-1"
                        style={{ color: "#303646" }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-xs sm:text-sm"
                        style={{ color: "#435664" }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom CTA Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 lg:mt-16 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <Sprout className="h-6 w-6" style={{ color: "#8a9670" }} />
            <p
              className="text-base sm:text-lg font-semibold"
              style={{ color: "#303646" }}
            >
              Mulai perjalanan hijau Anda bersama kami!
            </p>
            <Sprout className="h-6 w-6" style={{ color: "#8a9670" }} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
