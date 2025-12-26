"use client";

import { useEffect, useRef, useState } from "react";
import { Quote, Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  content: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Budi Santoso",
    role: "Peternak Maggot",
    location: "Bandung, Jawa Barat",
    content:
      "EcoMaggie membantu saya mendapatkan pasokan sampah organik berkualitas secara konsisten. Produksi maggot meningkat 300% dalam 6 bulan!",
    rating: 5,
    avatar: "BS",
  },
  {
    id: 2,
    name: "Siti Rahayu",
    role: "Pengusaha Restoran",
    location: "Jakarta Selatan",
    content:
      "Sebelumnya limbah dapur kami jadi masalah. Sekarang semua terkelola dengan baik melalui EcoMaggie. Bahkan ada nilai tambah dari sistem ini!",
    rating: 5,
    avatar: "SR",
  },
  {
    id: 3,
    name: "Ahmad Fauzi",
    role: "Ketua RT 05",
    location: "Depok, Jawa Barat",
    content:
      "Program ini mengubah cara warga kami memandang sampah organik. Lingkungan jadi lebih bersih dan warga dapat edukasi tentang ekonomi sirkular.",
    rating: 5,
    avatar: "AF",
  },
  {
    id: 4,
    name: "Dewi Kusuma",
    role: "Pemilik Pasar Tradisional",
    location: "Bogor, Jawa Barat",
    content:
      "Sampah sayuran dan buah yang biasanya menumpuk kini tersalurkan produktif. Pasar kami jadi contoh pengelolaan limbah organik yang berkelanjutan.",
    rating: 5,
    avatar: "DK",
  },
];

export default function TestimoniSection() {
  const [isVisible, setIsVisible] = useState(false);
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

  return (
    <section
      id="testimoni-section"
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden relative"
    >
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#2D5016]/20 rounded-full mb-6 transition-all duration-700 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D5016] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2D5016]"></span>
              </span>
              <span className="text-sm font-semibold text-[#2D5016] poppins-semibold">
                Testimoni Pengguna
              </span>
            </div>

            <h2
              className={`text-4xl md:text-5xl font-bold text-[#2D5016] mb-4 poppins-bold transition-all duration-700 delay-100 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              Dipercaya oleh Masyarakat
            </h2>
            <p
              className={`text-lg md:text-xl text-gray-600 max-w-2xl mx-auto poppins-regular transition-all duration-700 delay-200 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              Cerita sukses dari para petani maggot, pengusaha, dan masyarakat
              yang telah bergabung dengan EcoMaggie
            </p>
          </div>

          {/* Testimonial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#2D5016]/30 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDelay: `${300 + index * 100}ms`,
                }}
              >
                {/* Quote Icon */}
                <div className="mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2D5016] to-[#3d6b1e] rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Quote className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 text-base leading-relaxed mb-6 poppins-regular">
                  "{testimonial.content}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D5016] to-[#3d6b1e] flex items-center justify-center text-white font-bold poppins-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 poppins-semibold">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 poppins-regular">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-gray-500 poppins-regular">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div
            className={`mt-16 text-center transition-all duration-700 delay-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          ></div>
        </div>
      </div>
    </section>
  );
}
