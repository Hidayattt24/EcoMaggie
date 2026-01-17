"use client";

interface HeadlineProps {
  text: string;
  backgroundColor: string;
  textColor?: string;
  dotColor?: string;
}

export default function Headline({
  text,
  backgroundColor,
  textColor = "white",
  dotColor = "#ebfba8",
}: HeadlineProps) {
  return (
    <section
      className="relative py-8 overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Infinite Scrolling Text Container */}
      <div className="relative flex">
        {/* First Set - Moves infinitely */}
        <div className="flex animate-scroll-left whitespace-nowrap">
          {[...Array(10)].map((_, index) => (
            <div key={`first-${index}`} className="flex items-center flex-shrink-0">
              <span
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl poppins-semibold px-8"
                style={{ color: textColor }}
              >
                {text}
              </span>
              {/* Separator Dot */}
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mx-8 flex-shrink-0"
                style={{ backgroundColor: dotColor }}
              />
            </div>
          ))}
        </div>

        {/* Second Set - Duplicate for seamless loop */}
        <div
          className="flex animate-scroll-left whitespace-nowrap"
          aria-hidden="true"
        >
          {[...Array(10)].map((_, index) => (
            <div key={`second-${index}`} className="flex items-center flex-shrink-0">
              <span
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl poppins-semibold px-8"
                style={{ color: textColor }}
              >
                {text}
              </span>
              {/* Separator Dot */}
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mx-8 flex-shrink-0"
                style={{ backgroundColor: dotColor }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Fade Edges for Smooth Effect */}
      <div
        className="absolute inset-y-0 left-0 w-24 sm:w-32 bg-gradient-to-r to-transparent pointer-events-none z-10"
        style={{
          backgroundImage: `linear-gradient(to right, ${backgroundColor}, transparent)`,
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-24 sm:w-32 bg-gradient-to-l to-transparent pointer-events-none z-10"
        style={{
          backgroundImage: `linear-gradient(to left, ${backgroundColor}, transparent)`,
        }}
      />
    </section>
  );
}
