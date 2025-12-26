import NavbarLandingPage from "@/components/landing/NavbarLandingPage";
import HeroSection from "@/components/landing/HeroSection";
import StatisticsSection from "@/components/landing/StatisticsSection";
import TentangSection from "@/components/landing/TentangSection";
import SolusiSection from "@/components/landing/SolusiSection";
import DampakSection from "@/components/landing/DampakSection";
import TestimoniSection from "@/components/landing/TestimoniSection";
import FooterSection from "@/components/landing/FooterSection";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";

export default function Home() {
  return (
    <div className="relative">
      {/* Navbar Fixed */}
      <NavbarLandingPage />

      {/* Scroll Sections */}
      <main className="scroll-smooth">
        <HeroSection />
        <StatisticsSection />
        <TentangSection />
        <SolusiSection />
        <DampakSection />
        <TestimoniSection />
      </main>

      {/* Footer */}
      <FooterSection />

      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />
    </div>
  );
}
