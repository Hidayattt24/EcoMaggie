import type { Metadata } from "next";
import { Suspense } from "react";
import NavbarLandingPage from "@/components/landing/NavbarLandingPage";
import HeroSection from "@/components/landing/HeroSection";
import Headline from "@/components/landing/Headline";
import TentangSection from "@/components/landing/TentangSection";
import SolusiSection from "@/components/landing/SolusiSection";
import DampakSection from "@/components/landing/DampakSection";
import TestimoniSection from "@/components/landing/TestimoniSection";
import FooterSection from "@/components/landing/FooterSection";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";
import EmailVerificationRedirect from "@/components/EmailVerificationRedirect";
import HashRemover from "@/components/landing/HashRemover";
import LoadingScreen from "@/components/landing/LoadingScreen";

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
      <NavbarLandingPage />

      {/* Scroll Sections */}
      <main className="scroll-smooth">
        {/* Hero Section - Introduction to EcoMaggie */}
        <HeroSection />

        {/* Headline 1 - Value Proposition */}
        <Headline
          text="TRANSFORMASI SAMPAH JADI PROFIT"
          backgroundColor="#fdf8d4"
          textColor="#303646"
          dotColor="#ebfba8"
        />

        {/* About EcoMaggie - Mission and Vision */}
        <TentangSection />

        {/* Headline 2 - Partnership Growth */}
        <Headline
          text="BERGABUNG DENGAN 500+ MITRA SUKSES"
          backgroundColor="#a3af87"
          textColor="#ffffff"
          dotColor="#ebfba8"
        />

        {/* Solutions - Supply Connect & Maggot Market */}
        <SolusiSection />

        {/* Headline 3 - Call to Action */}
        <Headline
          text="MULAI HASILKAN PASSIVE INCOME HARI INI"
          backgroundColor="#435664"
          textColor="#ffffff"
          dotColor="#ebfba8"
        />

        {/* Environmental Impact - Sustainability Benefits */}
        <DampakSection />

        {/* Headline 4 - Environmental Impact */}
        <Headline
          text="BERSAMA MENCIPTAKAN INDONESIA LEBIH HIJAU"
          backgroundColor="#303646"
          textColor="#ffffff"
          dotColor="#ebfba8"
        />

        {/* Customer Testimonials */}
        <TestimoniSection />
      </main>

      {/* Footer with Contact Information */}
      <FooterSection />

      {/* Floating WhatsApp Button for Quick Contact */}
      <FloatingWhatsApp />
    </div>
  );
}
