"use client";

import { useEffect, useRef, useState } from "react";

export default function TestimoniSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="testimoni-section"
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center bg-white overflow-hidden"
    >
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className={`text-5xl font-bold text-[#2D5016] mb-6 poppins-bold transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Testimoni
          </h2>
          <p
            className={`text-xl text-gray-700 poppins-regular transition-all duration-700 delay-150 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Section Testimoni - Content Coming Soon
          </p>
        </div>
      </div>
    </section>
  );
}
