import type { Metadata } from "next";
import { Suspense } from "react";
import { NavbarUser } from "@/components/user/NavbarUser";
import HeroSection from "@/components/landing/HeroSection";
// import Headline from "@/components/landing/Headline";
// import TentangSection from "@/components/landing/TentangSection";
// import SolusiSection from "@/components/landing/SolusiSection";
// import DampakSection from "@/components/landing/DampakSection";
import FeaturedProductsSection from "@/components/landing/FeaturedProductsSection";
import SupplyConnectMapSection from "@/components/landing/SupplyConnectMapSection";
import AdvantagesSection from "@/components/landing/AdvantagesSection";
import TestimoniSection from "@/components/landing/TestimoniSection";
import FooterSection from "@/components/landing/FooterSection";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";
import EmailVerificationRedirect from "@/components/EmailVerificationRedirect";
import HashRemover from "@/components/landing/HashRemover";
import LoadingScreen from "@/components/landing/LoadingScreen";
import PWAInstallBanner from "@/components/landing/PWAInstallBanner";

export const metadata: Metadata = {
  title: "EcoMaggie - Kolaborasi Pengelolaan Sampah Organik & Budidaya Maggot BSF",
  description:
    "Tahukah kamu? EcoMaggie membangun sistem ekonomi sirkular di Gampong Rukoh dengan menghubungkan sumber limbah organik langsung ke petani maggot melalui platform digital. Bersama-sama, kita mengurangi beban sampah di TPA sekaligus menciptakan produk pakan ternak bernilai ekonomi bagi kesejahteraan masyarakat lokal.",
  keywords: [
// --- Brand & Core Concept ---
    "EcoMaggie",
    "supply connect",
    "maggot market",
    "ekonomi sirkular",
    "sustainable waste management",
    "zero waste Indonesia",
    
    // --- Lokasi & Komunitas Spesifik (SEO Lokal) ---
    "Banda Aceh",
    "UMKM Banda Aceh",
    "Gampong Rukoh",
    "Gampong Lamdingin",
    "Syiah Kuala",
    "Pasar Rukoh",
    "Universitas Syiah Kuala",
    "USK",
    "pengelolaan sampah Banda Aceh",
    "maggot BSF Aceh",
    "DLHK3 Banda Aceh",
    
    // --- Masalah & Solusi (Pertanyaan Orang Awam) ---
    "cara olah sampah rumah tangga",
    "tempat buang sampah organik",
    "solusi sampah menumpuk",
    "manfaat maggot BSF",
    "cara memilah sampah",
    "pengomposan praktis",
    "pemanfaatan limbah dapur",
    "pupuk organik cair maggot",
    
    // --- Sektor Peternakan & Bisnis (Target UMKM/Petani) ---
    "pakan ternak alternatif murah",
    "pakan ikan lele Aceh",
    "pakan ayam organik",
    "bisnis maggot BSF",
    "jual maggot hidup Banda Aceh",
    "pakan burung bernutrisi",
    "kemitraan pengolahan sampah",
    "peluang usaha pakan ternak",
    
    // --- Terminologi Teknis & Umum ---
    "maggot BSF",
    "black soldier fly",
    "limbah organik",
    "sampah pasar",
    "maggot farming",
    "biokonversi sampah",
  ],
  openGraph: {
    title: "EcoMaggie - Kolaborasi Pengelolaan Sampah Organik & Budidaya Maggot BSF",
    description:
     "Tahukah kamu? EcoMaggie membangun sistem ekonomi sirkular di Gampong Rukoh dengan menghubungkan sumber limbah organik langsung ke petani maggot melalui platform digital. Bersama-sama, kita mengurangi beban sampah di TPA sekaligus menciptakan produk pakan ternak bernilai ekonomi bagi kesejahteraan masyarakat lokal.",
    url: "https://eco-maggie.vercel.app",
    type: "website",
  },
  alternates: {
    canonical: "https://eco-maggie.vercel.app",
  },
};

export default function Home() {
  return (
    <div className="relative">
      {/* Loading Screen */}
      <LoadingScreen />

      {/* Remove hash from URL on load */}
      <HashRemover />

      {/* Email Verification Auto-Redirect Handler */}
      <Suspense fallback={null}>
        <EmailVerificationRedirect />
      </Suspense>

      {/* Navbar Fixed */}
      <NavbarUser />

      {/* Scroll Sections */}
      <main className="scroll-smooth">
        {/* Hero Section - Introduction to EcoMaggie */}
        <HeroSection />

        {/* Featured Products Section - Produk Unggulan */}
        <FeaturedProductsSection />

        {/* Supply Connect Map Section - Jangkauan Layanan */}
        <SupplyConnectMapSection />

        {/* Advantages Section - Keunggulan Kami */}
        <AdvantagesSection />

        {/* Customer Testimonials */}
        <TestimoniSection />

        {/* OLD SECTIONS - Commented out for now */}
        {/*
        <Headline
          text="TRANSFORMASI SAMPAH JADI PROFIT"
          backgroundColor="#fdf8d4"
          textColor="#303646"
          dotColor="#ebfba8"
        />
        <TentangSection />
        <Headline
          text="BERGABUNG DENGAN 500+ MITRA SUKSES"
          backgroundColor="#a3af87"
          textColor="#ffffff"
          dotColor="#ebfba8"
        />
        <SolusiSection />
        <Headline
          text="MULAI HASILKAN PASSIVE INCOME HARI INI"
          backgroundColor="#435664"
          textColor="#ffffff"
          dotColor="#ebfba8"
        />
        <DampakSection />
        <Headline
          text="BERSAMA MENCIPTAKAN INDONESIA LEBIH HIJAU"
          backgroundColor="#303646"
          textColor="#ffffff"
          dotColor="#ebfba8"
        />
        */}
      </main>

      {/* Footer with Contact Information */}
      <FooterSection />

      {/* Floating WhatsApp Button for Quick Contact */}
      <FloatingWhatsApp />

      {/* PWA Install Banner */}
      <PWAInstallBanner />
    </div>
  );
}
