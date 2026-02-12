"use client";

import { motion } from "framer-motion";
import { Bug, Zap, Fish, Droplets, TrendingUp, Recycle } from "lucide-react";

const maggotBenefits = [
  {
    icon: Zap,
    title: "Konsumsi Cepat",
    description: "Mengurai sampah organik dengan sangat efisien",
    color: "#a3af87",
    bgColor: "#EEF8F0",
  },
  {
    icon: Fish,
    title: "Protein Tinggi",
    description: "Sumber protein alternatif berkualitas untuk pakan ternak",
    color: "#435664",
    bgColor: "#FBF0EC",
  },
  {
    icon: Droplets,
    title: "Pupuk Organik",
    description: "Residu penguraian menghasilkan pupuk berkualitas",
    color: "#8a9670",
    bgColor: "#F1F2F7",
  },
  {
    icon: Recycle,
    title: "Ekonomi Sirkular",
    description: "Mengubah limbah menjadi produk bernilai ekonomi",
    color: "#303646",
    bgColor: "#FBF3E8",
  },
];

export default function AboutMaggot() {
  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-20 right-20 w-80 h-80 rounded-full"
          style={{ backgroundColor: "#a3af87" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-64 h-64 rounded-full"
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
            style={{ backgroundColor: "#fdf8d4", border: "2px solid #a3af87" }}
          >
            <Bug className="h-4 w-4" style={{ color: "#435664" }} />
            <span
              className="text-xs font-bold tracking-wider uppercase"
              style={{ color: "#303646" }}
            >
              Solusi Inovatif
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: "#303646" }}
          >
            Mengapa <span style={{ color: "#8a9670" }}>Maggot BSF?</span>
          </h2>
          <p
            className="text-sm sm:text-base lg:text-lg max-w-3xl mx-auto"
            style={{ color: "#435664" }}
          >
            Alasan kenapa maggot menjadi solusi ekonomi sirkular yang aplikatif
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12">
          {/* Left: Benefit Cards */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          >
            {maggotBenefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-5 sm:p-6 rounded-xl shadow-lg border-2 hover:shadow-2xl transition-all duration-300"
                  style={{
                    backgroundColor: benefit.bgColor,
                    borderColor: benefit.color,
                  }}
                >
                  <div className="flex flex-col space-y-3">
                    <div
                      className="p-3 rounded-full w-fit"
                      style={{ backgroundColor: `${benefit.color}20` }}
                    >
                      <Icon
                        className="h-6 w-6 sm:h-7 sm:w-7"
                        style={{ color: benefit.color }}
                      />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-base sm:text-lg mb-2"
                        style={{ color: "#303646" }}
                      >
                        {benefit.title}
                      </h3>
                      <p
                        className="text-xs sm:text-sm leading-relaxed"
                        style={{ color: "#435664" }}
                      >
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Main Text */}
            <div className="space-y-5">
              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: "#435664" }}
              >
                <span className="font-bold" style={{ color: "#303646" }}>
                  Maggot merupakan organisme dengan kemampuan konsumsi dan
                  penguraian bahan organik yang sangat tinggi.
                </span>{" "}
                Maggot mampu menguraikan sisa makanan, limbah pasar, dan sampah
                organik lainnya secara cepat menjadi biomassa bernilai ekonomi.
              </p>

              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: "#435664" }}
              >
                Hasil budidayanya dapat dimanfaatkan sebagai sumber{" "}
                <span className="font-semibold" style={{ color: "#303646" }}>
                  protein alternatif untuk pakan ternak dan ikan
                </span>
                , serta menghasilkan residu berupa pupuk organik dari sisa
                penguraiannya.
              </p>

              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: "#435664" }}
              >
                Proses ini membantu{" "}
                <span className="font-semibold" style={{ color: "#303646" }}>
                  mengurangi volume sampah, menekan potensi pencemaran
                  lingkungan
                </span>
                , dan sekaligus membuka peluang usaha bagi masyarakat.
              </p>

              {/* Highlight Box */}
              <div
                className="p-5 sm:p-6 rounded-xl border-2"
                style={{ backgroundColor: "#fdf8d4", borderColor: "#8a9670" }}
              >
                <div className="flex items-start gap-3">
                  <TrendingUp
                    className="h-6 w-6 flex-shrink-0 mt-1"
                    style={{ color: "#8a9670" }}
                  />
                  <p
                    className="text-sm sm:text-base leading-relaxed"
                    style={{ color: "#303646" }}
                  >
                    <span className="font-bold">
                      Dengan mengubah limbah menjadi produk bernilai dalam satu
                      siklus berkelanjutan
                    </span>
                    , budidaya maggot menjadi contoh penerapan ekonomi sirkular
                    yang nyata dan aplikatif.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
