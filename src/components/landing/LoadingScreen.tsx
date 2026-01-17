"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = sessionStorage.getItem("hasVisited");

    if (!hasVisited) {
      setIsLoading(true);
      sessionStorage.setItem("hasVisited", "true");

      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsLoading(false), 300);
            return 100;
          }
          return prev + 10;
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, []);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
      >
        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="rounded-3xl p-8">
            <Image
              src="/assets/logo.svg"
              alt="EcoMaggie Logo"
              width={120}
              height={120}
              className="w-32 h-32"
              priority
            />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl md:text-4xl lg:text-5xl poppins-bold text-[#303646] mb-2"
        >
          EcoMaggie
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base md:text-lg poppins-regular text-[#5a6c5b] mb-12"
        >
          Platform Ekonomi Sirkular Berkelanjutan
        </motion.p>

        {/* Progress Bar */}
        <div className="w-64 md:w-80 mb-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-[#a3af87] to-[#ebfba8] rounded-full"
            />
          </div>
        </div>

        {/* Progress Percentage */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm poppins-semibold text-[#5a6c5b]"
        >
          {progress}%
        </motion.p>

        {/* Loading Dots Animation */}
        <div className="flex items-center gap-2 mt-6">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0.3 }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-[#a3af87]"
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
