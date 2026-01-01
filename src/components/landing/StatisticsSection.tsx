"use client";

import { useEffect, useRef, useState } from "react";

interface StatItemProps {
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
}

function StatItem({ value, label, suffix = "+", delay = 0 }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      ref={itemRef}
      className={`text-center transition-all duration-500 ${
        isVisible ? "animate-fade-in-up opacity-100" : "opacity-0"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-5xl md:text-6xl lg:text-7xl poppins-bold text-white mb-2">
        {count}
        <span className="text-4xl md:text-5xl lg:text-6xl">{suffix}</span>
      </h3>
      <p className="text-white/90 poppins-regular text-sm md:text-base">
        {label}
      </p>
    </div>
  );
}

export default function StatisticsSection() {
  const stats = [
    {
      value: 150,
      label: "Pengguna Aktif",
      delay: 0,
    },
    {
      value: 60,
      label: "Mitra Penghasil Sampah",
      delay: 100,
    },
    {
      value: 10,
      label: "Petani Maggot Terlibat",
      delay: 200,
    },
    {
      value: 300,
      label: "Sampah Terkelola",
      delay: 300,
    },
  ];

  return (
    <section
      className="relative py-16 overflow-hidden"
      style={{ backgroundColor: "#A3AF87" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              value={stat.value}
              label={stat.label}
              delay={stat.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
