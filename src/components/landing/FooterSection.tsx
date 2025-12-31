"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ArrowUp,
  Heart,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function FooterSection() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks = [
    { name: "Beranda", href: "#beranda-section" },
    { name: "Tentang", href: "#tentang-section" },
    { name: "Solusi", href: "#solusi-section" },
    { name: "Dampak", href: "#dampak-section" },
    { name: "Testimoni", href: "#testimoni-section" },
  ];

  const services = [
    { name: "Supply Connect", href: "#" },
    { name: "Maggot Market", href: "#" },
    { name: "Konsultasi Gratis", href: "#" },
    { name: "Edukasi & Pelatihan", href: "#" },
  ];

  const socialMedia = [
    {
      name: "Facebook",
      icon: Facebook,
      href: "#",
      color: "hover:text-blue-600",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "#",
      color: "hover:text-pink-600",
    },
    { name: "Twitter", icon: Twitter, href: "#", color: "hover:text-sky-600" },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "#",
      color: "hover:text-blue-700",
    },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-[#16321A] via-[#1a3d20] to-[#2D5016] text-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-50"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      {/* Leaf Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-20">
          <Leaf className="w-32 h-32 rotate-45" />
        </div>
        <div className="absolute top-40 right-32">
          <Leaf className="w-24 h-24 -rotate-12" />
        </div>
        <div className="absolute bottom-20 left-1/3">
          <Leaf className="w-40 h-40 rotate-90" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6 group">
              <Image
                src="/assets/logo.svg"
                alt="Logo EcoMaggie - Platform Pengelolaan Sampah Organik dan Budidaya Maggot Indonesia"
                width={120}
                height={120}
                className="w-40 h-40 transform group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 poppins-regular">
              Platform inovatif yang menghubungkan produsen sampah organik
              dengan peternak maggot untuk menciptakan ekonomi sirkular
              berkelanjutan.
            </p>

            {/* Social Media */}
            <div className="flex items-center gap-3">
              {socialMedia.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110 ${social.color}`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 poppins-bold flex items-center gap-2">
              <span className="w-1 h-6 bg-green-400 rounded-full"></span>
              Navigasi Cepat
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-green-400 transition-colors duration-300 poppins-regular text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-green-400 group-hover:w-4 transition-all duration-300"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6 poppins-bold flex items-center gap-2">
              <span className="w-1 h-6 bg-green-400 rounded-full"></span>
              Layanan Kami
            </h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <a
                    href={service.href}
                    className="text-gray-300 hover:text-green-400 transition-colors duration-300 poppins-regular text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-green-400 group-hover:w-4 transition-all duration-300"></span>
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 poppins-bold flex items-center gap-2">
              <span className="w-1 h-6 bg-green-400 rounded-full"></span>
              Hubungi Kami
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-300 text-sm poppins-regular">
                <Mail className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white mb-1">Email</p>
                  <a
                    href="mailto:info@ecomaggie.id"
                    className="hover:text-green-400 transition-colors"
                  >
                    cs@Ecomaggie.id
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm poppins-regular">
                <Phone className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white mb-1">Telepon</p>
                  <a
                    href="tel:+6281234567890"
                    className="hover:text-green-400 transition-colors"
                  >
                    +62 822-8895-3268
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm poppins-regular">
                <MapPin className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white mb-1">Alamat</p>
                  <p>
                    Jl.T. Batee Treun Gampong Ganoe Desa Lamdingin Kec. Kuta
                    Alam Banda Aceh
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2 poppins-bold">
                Dapatkan Update Terbaru
              </h3>
              <p className="text-gray-300 text-sm poppins-regular">
                Berlangganan newsletter kami untuk mendapatkan tips, berita, dan
                penawaran eksklusif.
              </p>
            </div>
            <div>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Masukkan email Anda"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-green-400 focus:bg-white/15 transition-all poppins-regular text-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300 poppins-semibold text-sm whitespace-nowrap"
                >
                  Berlangganan
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm poppins-regular text-center md:text-left">
              © {new Date().getFullYear()} EcoMaggie.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-colors poppins-regular"
              >
                Kebijakan Privasi
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-colors poppins-regular"
              >
                Syarat & Ketentuan
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-[#2D5016] to-[#3d6b1e] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 z-40 group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      )}
    </footer>
  );
}
