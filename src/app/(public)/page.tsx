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
  title: "EcoMaggie - Ubah Sampah Jadi Profit! Platform #1 Maggot BSF Indonesia",
  description:
    "Tahukah Anda sampah organik bisa jadi sumber penghasilan? EcoMaggie menghubungkan penghasil limbah dengan peternak maggot BSF untuk ciptakan passive income. Sudah 500+ mitra sukses! Apakah Anda siap bergabung dalam revolusi ekonomi sirkular Indonesia?",
  keywords: [
    "ubah sampah jadi uang",
    "passive income dari sampah",
    "pengelolaan sampah organik",
    "budidaya maggot",
    "maggot BSF",
    "black soldier fly",
    "peternak maggot Indonesia",
    "ekonomi sirkular",
    "platform sampah organik",
    "supply connect",
    "maggot market",
    "bisnis maggot",
    "penghasilan dari limbah",
  ],
  openGraph: {
    title: "EcoMaggie - Ubah Sampah Jadi Profit! Platform #1 Maggot BSF Indonesia",
    description:
      "Tahukah Anda sampah organik bisa jadi sumber penghasilan? Bergabunglah dengan 500+ mitra sukses yang sudah menghasilkan passive income dari sampah. Mulai transformasi Anda hari ini!",
    url: "https://www.ecomaggie.com",
    type: "website",
  },
  alternates: {
    canonical: "https://www.ecomaggie.com",
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
