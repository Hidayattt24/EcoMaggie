"use client";

export default function StatisticsSection() {
  const text = "ECOMAGGIE";

  return (
    <section className="relative py-8 overflow-hidden bg-warna-2">
      {/* Infinite Scrolling Text Container */}
      <div className="relative flex">
        {/* First Set - Moves infinitely */}
        <div className="flex animate-scroll-left whitespace-nowrap">
          {[...Array(10)].map((_, index) => (
            <div key={`first-${index}`} className="flex items-center flex-shrink-0">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl poppins-bold text-white px-8">
                {text}
              </span>
              {/* Separator Dot */}
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-warna-5 mx-8 flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Second Set - Duplicate for seamless loop */}
        <div className="flex animate-scroll-left whitespace-nowrap" aria-hidden="true">
          {[...Array(10)].map((_, index) => (
            <div key={`second-${index}`} className="flex items-center flex-shrink-0">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl poppins-bold text-white px-8">
                {text}
              </span>
              {/* Separator Dot */}
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-warna-5 mx-8 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Fade Edges for Smooth Effect */}
      <div className="absolute inset-y-0 left-0 w-24 sm:w-32 bg-gradient-to-r from-warna-2 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-24 sm:w-32 bg-gradient-to-l from-warna-2 to-transparent pointer-events-none z-10" />
    </section>
  );
}
