import NavbarLandingPage from "@/components/landing/NavbarLandingPage";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <NavbarLandingPage />

      {/* Main Content */}
      <main className="pt-32 lg:pt-32 pt-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2D5016] mb-6 poppins-bold">
              EcoMaggie
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-700 max-w-3xl poppins-regular px-4">
              Platform Pengelolaan Sampah Organik Berbasis Budidaya Maggot
            </p>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mt-4 poppins-light px-4">
              Menghubungkan penghasil sampah organik, transporter, dan petani
              maggot dalam satu sistem digital terintegrasi untuk menciptakan
              nilai ekonomi berkelanjutan.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
