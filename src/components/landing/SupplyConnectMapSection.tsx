"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Recycle, ArrowRight, Users, Leaf, TrendingUp, Package } from "lucide-react";
import dynamic from "next/dynamic";
import type { Icon as LeafletIcon, DivIcon } from "leaflet";

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: "#fdf8d4" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#a3af87] border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm" style={{ color: "#435664" }}>
            Memuat peta...
          </p>
        </div>
      </div>
    )
  }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Banda Aceh coordinates and supply points (expanded to more points)
const bandaAcehCenter = { lat: 5.5483, lng: 95.3238 };

const supplyPoints = [
  { id: 1, name: "Kec. Kuta Alam", lat: 5.5601, lng: 95.3142, users: 45, waste: "2.3 ton" },
  { id: 2, name: "Kec. Baiturrahman", lat: 5.5511, lng: 95.3195, users: 38, waste: "1.9 ton" },
  { id: 3, name: "Kec. Syiah Kuala", lat: 5.5672, lng: 95.3612, users: 52, waste: "2.8 ton" },
  { id: 4, name: "Kec. Banda Raya", lat: 5.5389, lng: 95.3289, users: 41, waste: "2.1 ton" },
  { id: 5, name: "Kec. Meuraxa", lat: 5.5734, lng: 95.3401, users: 36, waste: "1.8 ton" },
  { id: 6, name: "Kec. Jaya Baru", lat: 5.5456, lng: 95.3456, users: 49, waste: "2.5 ton" },
  { id: 7, name: "Kec. Ulee Kareng", lat: 5.5823, lng: 95.3167, users: 33, waste: "1.6 ton" },
  { id: 8, name: "Kec. Lueng Bata", lat: 5.5298, lng: 95.3512, users: 44, waste: "2.2 ton" },
  { id: 9, name: "Kec. Kuta Raja", lat: 5.5534, lng: 95.3078, users: 50, waste: "2.6 ton" },
  { id: 10, name: "Lampriet", lat: 5.5645, lng: 95.3234, users: 28, waste: "1.4 ton" },
  { id: 11, name: "Lampulo", lat: 5.5423, lng: 95.3089, users: 31, waste: "1.5 ton" },
  { id: 12, name: "Peunayong", lat: 5.5512, lng: 95.3167, users: 42, waste: "2.0 ton" },
  { id: 13, name: "Sukaramai", lat: 5.5589, lng: 95.3345, users: 37, waste: "1.9 ton" },
  { id: 14, name: "Punge", lat: 5.5734, lng: 95.3289, users: 29, waste: "1.3 ton" },
  { id: 15, name: "Gampong Jawa", lat: 5.5467, lng: 95.3123, users: 34, waste: "1.7 ton" },
  { id: 16, name: "Batoh", lat: 5.5612, lng: 95.3534, users: 26, waste: "1.2 ton" },
  { id: 17, name: "Kopelma Darussalam", lat: 5.5789, lng: 95.3678, users: 40, waste: "2.1 ton" },
  { id: 18, name: "Lambhuk", lat: 5.5301, lng: 95.3434, users: 35, waste: "1.8 ton" },
  { id: 19, name: "Keudah", lat: 5.5523, lng: 95.3267, users: 32, waste: "1.6 ton" },
  { id: 20, name: "Neusu Jaya", lat: 5.5678, lng: 95.3189, users: 27, waste: "1.3 ton" },
  { id: 21, name: "Lampaseh Kota", lat: 5.5445, lng: 95.3378, users: 39, waste: "2.0 ton" },
  { id: 22, name: "Kampung Baru", lat: 5.5567, lng: 95.3423, users: 43, waste: "2.2 ton" },
  { id: 23, name: "Laksana", lat: 5.5389, lng: 95.3156, users: 30, waste: "1.5 ton" },
  { id: 24, name: "Mulia", lat: 5.5612, lng: 95.3289, users: 36, waste: "1.8 ton" },
  { id: 25, name: "Peulanggahan", lat: 5.5734, lng: 95.3512, users: 41, waste: "2.1 ton" },
  { id: 26, name: "Geuceu Komplek", lat: 5.5456, lng: 95.3234, users: 33, waste: "1.7 ton" },
  { id: 27, name: "Punge Jurong", lat: 5.5801, lng: 95.3345, users: 28, waste: "1.4 ton" },
  { id: 28, name: "Lamdingin", lat: 5.5523, lng: 95.3401, users: 37, waste: "1.9 ton" },
  { id: 29, name: "Lambaro Skep", lat: 5.5645, lng: 95.3567, users: 45, waste: "2.3 ton" },
  { id: 30, name: "Deah Glumpang", lat: 5.5378, lng: 95.3223, users: 31, waste: "1.5 ton" },
  { id: 31, name: "Peurada", lat: 5.5489, lng: 95.3312, users: 34, waste: "1.7 ton" },
  { id: 32, name: "Lamgugob", lat: 5.5567, lng: 95.3478, users: 38, waste: "1.9 ton" },
  { id: 33, name: "Lamjame", lat: 5.5712, lng: 95.3256, users: 29, waste: "1.4 ton" },
  { id: 34, name: "Lamteumen Barat", lat: 5.5423, lng: 95.3534, users: 42, waste: "2.1 ton" },
  { id: 35, name: "Lamteumen Timur", lat: 5.5445, lng: 95.3589, users: 40, waste: "2.0 ton" },
  { id: 36, name: "Lampaseh Aceh", lat: 5.5601, lng: 95.3378, users: 35, waste: "1.8 ton" },
  { id: 37, name: "Merduati", lat: 5.5534, lng: 95.3445, users: 46, waste: "2.4 ton" },
  { id: 38, name: "Punge Blang Cut", lat: 5.5789, lng: 95.3423, users: 32, waste: "1.6 ton" },
  { id: 39, name: "Rukoh", lat: 5.5656, lng: 95.3689, users: 48, waste: "2.5 ton" },
  { id: 40, name: "Tibang", lat: 5.5312, lng: 95.3367, users: 30, waste: "1.5 ton" },
  { id: 41, name: "Lamdom", lat: 5.5478, lng: 95.3201, users: 33, waste: "1.7 ton" },
  { id: 42, name: "Lamreung", lat: 5.5623, lng: 95.3512, users: 39, waste: "2.0 ton" },
  { id: 43, name: "Lamglumpang", lat: 5.5545, lng: 95.3289, users: 36, waste: "1.8 ton" },
  { id: 44, name: "Lampaseh Kec", lat: 5.5412, lng: 95.3423, users: 41, waste: "2.1 ton" },
  { id: 45, name: "Lam Ara", lat: 5.5689, lng: 95.3334, users: 34, waste: "1.7 ton" },
  { id: 46, name: "Lamseupeung", lat: 5.5567, lng: 95.3156, users: 37, waste: "1.9 ton" },
  { id: 47, name: "Lamcot", lat: 5.5734, lng: 95.3478, users: 43, waste: "2.2 ton" },
  { id: 48, name: "Lamjabat", lat: 5.5401, lng: 95.3267, users: 31, waste: "1.5 ton" },
  { id: 49, name: "Lampaseh Lhok", lat: 5.5623, lng: 95.3401, users: 38, waste: "1.9 ton" },
  { id: 50, name: "Lamsie", lat: 5.5489, lng: 95.3545, users: 44, waste: "2.3 ton" },
  { id: 51, name: "Lamteungoh", lat: 5.5356, lng: 95.3189, users: 29, waste: "1.4 ton" },
  { id: 52, name: "Lampaloh", lat: 5.5678, lng: 95.3512, users: 35, waste: "1.8 ton" },
  { id: 53, name: "Lampeuneurut", lat: 5.5423, lng: 95.3267, users: 32, waste: "1.6 ton" },
  { id: 54, name: "Lamgapang", lat: 5.5534, lng: 95.3356, users: 38, waste: "1.9 ton" },
  { id: 55, name: "Lampoh Daya", lat: 5.5601, lng: 95.3423, users: 41, waste: "2.1 ton" },
  { id: 56, name: "Lamkuta", lat: 5.5467, lng: 95.3289, users: 33, waste: "1.7 ton" },
  { id: 57, name: "Lamnyong", lat: 5.5712, lng: 95.3378, users: 36, waste: "1.8 ton" },
  { id: 58, name: "Lampineung", lat: 5.5389, lng: 95.3445, users: 40, waste: "2.0 ton" },
  { id: 59, name: "Lamteh", lat: 5.5645, lng: 95.3201, users: 28, waste: "1.3 ton" },
  { id: 60, name: "Lamblang", lat: 5.5512, lng: 95.3534, users: 42, waste: "2.2 ton" },
  { id: 61, name: "Lampoh Keude", lat: 5.5578, lng: 95.3312, users: 34, waste: "1.7 ton" },
  { id: 62, name: "Lamjamee", lat: 5.5445, lng: 95.3401, users: 37, waste: "1.9 ton" },
  { id: 63, name: "Lamkruet", lat: 5.5689, lng: 95.3267, users: 31, waste: "1.5 ton" },
  { id: 64, name: "Lampoh Tarom", lat: 5.5401, lng: 95.3356, users: 39, waste: "2.0 ton" },
  { id: 65, name: "Lampeudaya", lat: 5.5556, lng: 95.3478, users: 43, waste: "2.2 ton" },
  { id: 66, name: "Lamtemen", lat: 5.5623, lng: 95.3223, users: 30, waste: "1.5 ton" },
  { id: 67, name: "Lampoh Raya", lat: 5.5478, lng: 95.3389, users: 35, waste: "1.8 ton" },
  { id: 68, name: "Lampeuneuheun", lat: 5.5734, lng: 95.3445, users: 44, waste: "2.3 ton" },
  { id: 69, name: "Lamgeu", lat: 5.5367, lng: 95.3312, users: 27, waste: "1.3 ton" },
  { id: 70, name: "Lampoh Lhok", lat: 5.5612, lng: 95.3567, users: 46, waste: "2.4 ton" },
  { id: 71, name: "Lampeuneurut Aceh", lat: 5.5489, lng: 95.3234, users: 33, waste: "1.6 ton" },
  { id: 72, name: "Lamtanjong", lat: 5.5545, lng: 95.3489, users: 38, waste: "1.9 ton" },
  { id: 73, name: "Lampoh Rayeuk", lat: 5.5656, lng: 95.3312, users: 40, waste: "2.0 ton" },
  { id: 74, name: "Lamkeuneung", lat: 5.5423, lng: 95.3378, users: 32, waste: "1.6 ton" },
  { id: 75, name: "Lampoh Keujruen", lat: 5.5589, lng: 95.3445, users: 41, waste: "2.1 ton" },
];

export default function SupplyConnectMapSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [customIcon, setCustomIcon] = useState<LeafletIcon | DivIcon | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Create custom icon using Leaflet
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        const icon = L.icon({
          iconUrl: "/assets/icon-192.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });
        setCustomIcon(icon);
      });
    }
  }, []);

  const totalUsers = useMemo(
    () => supplyPoints.reduce((sum, point) => sum + point.users, 0),
    []
  );
  const totalWaste = useMemo(
    () => supplyPoints.reduce((sum, point) => sum + parseFloat(point.waste), 0).toFixed(1),
    []
  );

  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: "#fdf8d4" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-3 sm:mb-4" style={{ backgroundColor: "#435664" }}>
            <Recycle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-white">
              Supply Connect
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4" style={{ color: "#303646" }}>
            Jangkauan Layanan <span style={{ color: "#a3af87" }}>Banda Aceh</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto" style={{ color: "#435664" }}>
            Ratusan rumah tangga di Banda Aceh telah bergabung dalam gerakan pengelolaan sampah organik berkelanjutan
          </p>
        </motion.div>

        {/* Stats Cards with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2"
            style={{ borderColor: "#a3af87" }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#a3af87" }}
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Users className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <motion.div
                  className="text-3xl font-bold"
                  style={{ color: "#303646" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {totalUsers}+
                </motion.div>
                <div className="text-sm font-medium" style={{ color: "#435664" }}>
                  Pengguna Aktif
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2"
            style={{ borderColor: "#a3af87" }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#a3af87" }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Leaf className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <motion.div
                  className="text-3xl font-bold"
                  style={{ color: "#303646" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {totalWaste} ton
                </motion.div>
                <div className="text-sm font-medium" style={{ color: "#435664" }}>
                  Sampah Terkelola
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2"
            style={{ borderColor: "#a3af87" }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#a3af87" }}
                animate={{
                  rotate: [0, -10, 10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <TrendingUp className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <motion.div
                  className="text-3xl font-bold"
                  style={{ color: "#303646" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {supplyPoints.length}
                </motion.div>
                <div className="text-sm font-medium" style={{ color: "#435664" }}>
                  Titik Layanan
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Map Container with Enhanced Design */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mb-12"
        >
          {/* Decorative background elements */}
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#a3af87]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-[#ebfba8]/30 rounded-full blur-3xl"></div>
          
          <div className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-[#a3af87]">
            <div className="h-[350px] sm:h-[450px] lg:h-[550px] relative">
              {isMounted && customIcon ? (
                <MapContainer
                  center={[bandaAcehCenter.lat, bandaAcehCenter.lng]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {supplyPoints.map((point) => (
                    <Marker key={point.id} position={[point.lat, point.lng]} icon={customIcon}>
                      <Popup>
                        <div className="text-center p-2">
                          <div className="font-bold text-base mb-2" style={{ color: "#303646" }}>
                            {point.name}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2 text-sm">
                              <span style={{ color: "#435664" }}>Pengguna:</span>
                              <span className="font-semibold" style={{ color: "#a3af87" }}>
                                {point.users} rumah
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-sm">
                              <span style={{ color: "#435664" }}>Sampah:</span>
                              <span className="font-semibold" style={{ color: "#a3af87" }}>
                                {point.waste}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center" style={{ backgroundColor: "#fdf8d4" }}>
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#a3af87] border-t-transparent mx-auto mb-4"></div>
                    <p className="text-sm" style={{ color: "#435664" }}>
                      Memuat peta...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Map Legend */}
            <div className="p-4 sm:p-6 lg:p-8 border-t-2 sm:border-t-4" style={{ backgroundColor: "#fdf8d4", borderColor: "#a3af87" }}>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#a3af87" }}>
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm lg:text-base font-semibold" style={{ color: "#435664" }}>
                    {supplyPoints.length} Titik Layanan Aktif
                  </span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse" style={{ backgroundColor: "#a3af87" }}></div>
                  <span className="text-xs sm:text-sm lg:text-base font-medium" style={{ color: "#435664" }}>
                    Area Jangkauan Banda Aceh
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Button - Redesigned with better visual hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link
            href="/supply"
            className="group block relative"
          >
            <motion.div
              className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 shadow-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #a3af87 0%, #8a9670 100%)" }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Animated background patterns */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
              </div>

              {/* Animated pulse indicator */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                <span className="relative flex h-3 w-3 sm:h-4 sm:w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-white"></span>
                </span>
              </div>

              {/* Content Grid */}
              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6 items-center">
                {/* Icon Section */}
                <div className="lg:col-span-2 flex justify-center lg:justify-start">
                  <motion.div
                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl flex items-center justify-center"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-white" />
                  </motion.div>
                </div>

                {/* Text Content */}
                <div className="lg:col-span-8 text-center lg:text-left">
                  <motion.h3 
                    className="text-base sm:text-xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 lg:mb-3"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Input Sampah Organik Sekarang
                  </motion.h3>
                  <p className="text-xs sm:text-sm lg:text-lg text-white/90 mb-2 sm:mb-3 lg:mb-0">
                    Jadwalkan pickup sampah organik Anda dengan mudah dan gratis di area Banda Aceh
                  </p>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 lg:gap-4 mt-2 sm:mt-3 lg:mt-4">
                    <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-white/80 text-[10px] sm:text-xs lg:text-sm">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 rounded-full bg-[#ebfba8]"></div>
                      <span>Gratis Pickup</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-white/80 text-[10px] sm:text-xs lg:text-sm">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 rounded-full bg-[#ebfba8]"></div>
                      <span>Jadwal Fleksibel</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-white/80 text-[10px] sm:text-xs lg:text-sm">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 rounded-full bg-[#ebfba8]"></div>
                      <span>Ramah Lingkungan</span>
                    </div>
                  </div>
                </div>

                {/* Arrow Button */}
                <div className="lg:col-span-2 flex justify-center lg:justify-end">
                  <motion.div
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 45 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" style={{ color: "#a3af87" }} />
                  </motion.div>
                </div>
              </div>

              {/* Bottom decorative line */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 sm:h-2 bg-[#ebfba8]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 }}
              />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
