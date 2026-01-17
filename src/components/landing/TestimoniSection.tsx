"use client";

import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Budi Santoso",
    role: "Peternak Maggot",
    location: "Bandung",
    body: "EcoMaggie membantu saya mendapatkan pasokan sampah organik berkualitas secara konsisten. Produksi maggot meningkat 300% dalam 6 bulan!",
    img: "BS",
    rating: 5,
  },
  {
    name: "Siti Rahayu",
    role: "Pengusaha Restoran",
    location: "Jakarta",
    body: "Sebelumnya limbah dapur kami jadi masalah. Sekarang semua terkelola dengan baik melalui EcoMaggie. Bahkan ada nilai tambah dari sistem ini!",
    img: "SR",
    rating: 5,
  },
  {
    name: "Ahmad Fauzi",
    role: "Ketua RT 05",
    location: "Depok",
    body: "Program ini mengubah cara warga kami memandang sampah organik. Lingkungan jadi lebih bersih dan warga dapat edukasi tentang ekonomi sirkular.",
    img: "AF",
    rating: 5,
  },
  {
    name: "Dewi Kusuma",
    role: "Pemilik Pasar",
    location: "Bogor",
    body: "Sampah pasar yang tadinya menumpuk sekarang jadi berkah. Terima kasih EcoMaggie sudah memfasilitasi pengelolaan limbah organik kami.",
    img: "DK",
    rating: 5,
  },
  {
    name: "Rudi Hartono",
    role: "Petani Organik",
    location: "Cianjur",
    body: "Maggot dari EcoMaggie kualitasnya bagus untuk pakan ayam kampung saya. Harga terjangkau dan pengiriman cepat!",
    img: "RH",
    rating: 5,
  },
  {
    name: "Linda Wijaya",
    role: "Pengelola Hotel",
    location: "Bandung",
    body: "Kerjasama dengan EcoMaggie membantu hotel kami mencapai target sustainability. Limbah organik terkelola dengan profesional.",
    img: "LW",
    rating: 5,
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  role,
  location,
  body,
  rating,
}: {
  img: string;
  name: string;
  role: string;
  location: string;
  body: string;
  rating: number;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-80 cursor-pointer overflow-hidden rounded-2xl border p-6",
        "border-[#A3AF87]/20 bg-white hover:bg-[#A3AF87]/5 transition-all duration-300",
        "shadow-md hover:shadow-xl"
      )}
    >
      <div className="flex flex-row items-center gap-3 mb-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: "#A3AF87" }}
        >
          {img}
        </div>
        <div className="flex flex-col">
          <figcaption className="text-base font-semibold text-[#303646]">
            {name}
          </figcaption>
          <p className="text-sm text-[#5a6c5b]">{role}</p>
          <p className="text-xs text-gray-500">{location}</p>
        </div>
      </div>

      {/* Rating Stars */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: rating }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
          />
        ))}
      </div>

      {/* Review Text */}
      <blockquote className="text-sm text-gray-700 leading-relaxed">
        &quot;{body}&quot;
      </blockquote>
    </figure>
  );
};

export default function TestimoniSection() {
  return (
    <section
      id="testimoni-section"
      className="relative py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden"
    >
      <div className="relative flex w-full flex-col items-center justify-center">
        <Marquee pauseOnHover className="[--duration:40s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:40s]">
          {secondRow.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </Marquee>

        {/* Gradient Overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-gray-50 to-transparent"></div>
      </div>
    </section>
  );
}
