import NavbarLandingPage from "@/components/landing/NavbarLandingPage";
import HeroSection from "@/components/landing/HeroSection";
import TentangSection from "@/components/landing/TentangSection";
import SolusiSection from "@/components/landing/SolusiSection";
import DampakSection from "@/components/landing/DampakSection";
import ProdukSection from "@/components/landing/ProdukSection";
import TestimoniSection from "@/components/landing/TestimoniSection";

export default function Home() {
  return (
    <div className="relative">
      {/* Navbar Fixed */}
      <NavbarLandingPage />

      {/* Scroll Sections */}
      <main className="scroll-smooth">
        <HeroSection />
        <TentangSection />
        <SolusiSection />
        <DampakSection />
        <ProdukSection />
        <TestimoniSection />
      </main>
    </div>
  );
}
