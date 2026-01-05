import type { Metadata } from "next";
import NavbarLandingPage from "@/components/landing/NavbarLandingPage";
import HeroSection from "@/components/landing/HeroSection";
import StatisticsSection from "@/components/landing/StatisticsSection";
import TentangSection from "@/components/landing/TentangSection";
import SolusiSection from "@/components/landing/SolusiSection";
import DampakSection from "@/components/landing/DampakSection";
import TestimoniSection from "@/components/landing/TestimoniSection";
import FooterSection from "@/components/landing/FooterSection";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";

export const metadata: Metadata = {
  title: "EcoMaggie - Platform Sampah Organik & Budidaya Maggot",
  description:
    "Platform digital untuk pengelolaan sampah organik dan budidaya maggot BSF di Indonesia. Hubungkan penghasil sampah dengan peternak maggot untuk ekonomi sirkular berkelanjutan. Solusi ramah lingkungan berbasis teknologi.",
  keywords: [
    "pengelolaan sampah organik",
    "budidaya maggot",
    "maggot BSF",
    "black soldier fly",
    "peternak maggot Indonesia",
    "ekonomi sirkular",
    "platform sampah organik",
    "supply connect",
    "maggot market",
  ],
  openGraph: {
    title: "EcoMaggie - Platform Sampah Organik & Budidaya Maggot",
    description:
      "Platform digital untuk menghubungkan penghasil sampah organik dengan peternak maggot BSF. Ciptakan ekonomi sirkular berkelanjutan.",
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
      {/* Navbar Fixed */}
      <NavbarLandingPage />

      {/* Scroll Sections */}
      <main className="scroll-smooth">
        {/* Hero Section - Introduction to EcoMaggie */}
        <HeroSection />

        {/* Statistics showcasing platform impact */}
        <StatisticsSection />

        {/* About EcoMaggie - Mission and Vision */}
        <TentangSection />

        {/* Solutions - Supply Connect & Maggot Market */}
        <SolusiSection />

        {/* Environmental Impact - Sustainability Benefits */}
        <DampakSection />

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
