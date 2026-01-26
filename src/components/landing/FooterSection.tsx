"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Leaf,
  Mail,
  MapPin,
  ArrowUp,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
    { name: "Beranda", href: "/" },
    { name: "Tentang Kami", href: "/about" },
    { name: "Solusi", href: "/#solusi-section" },
    { name: "Dampak", href: "/#dampak-section" },
    { name: "Testimoni", href: "/#testimoni-section" },
  ];

  const services = [
    {
      name: "Supply Connect",
      href: "#",
      icon: Package,
      description: "Kelola sampah organik",
    },
    {
      name: "Maggot Market",
      href: "#",
      icon: ShoppingCart,
      description: "Jual beli maggot BSF",
    },
  ];

  const socialMedia = [
    {
      name: "Facebook",
      href: "#",
      icon: Facebook,
      bgColor: "#fdf8d4",
      iconColor: "#303646",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/ecomaggie/",
      icon: Instagram,
      bgColor: "#435664",
      iconColor: "#ebfba8",
    },
    {
      name: "Twitter",
      href: "#",
      icon: Twitter,
      bgColor: "#303646",
      iconColor: "#fdf8d4",
    },
    {
      name: "LinkedIn",
      href: "#",
      icon: Linkedin,
      bgColor: "#ebfba8",
      iconColor: "#303646",
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#a3af87]">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 w-full h-2 bg-[#ebfba8]" />

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl bg-[#ebfba8]/10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl bg-[#303646]/5" />

      {/* Leaf Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-20">
          <Leaf className="w-32 h-32 rotate-45 text-[#303646]" />
        </div>
        <div className="absolute top-40 right-32">
          <Leaf className="w-24 h-24 -rotate-12 text-[#435664]" />
        </div>
        <div className="absolute bottom-20 left-1/3">
          <Leaf className="w-40 h-40 rotate-90 text-[#fdf8d4]" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main Footer Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
        >
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6 group">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/assets/logo.svg"
                  alt="Logo EcoMaggie - Platform Pengelolaan Sampah Organik dan Budidaya Maggot Indonesia"
                  width={120}
                  height={120}
                  className="w-32 h-32"
                  loading="lazy"
                />
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6 poppins-regular text-white/90">
              Platform inovatif yang menghubungkan produsen sampah organik
              dengan peternak maggot untuk menciptakan ekonomi sirkular
              berkelanjutan.
            </p>

            {/* Social Media */}
            <div className="flex items-center gap-3">
              {socialMedia.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-md hover:shadow-lg"
                    style={{
                      backgroundColor: social.bgColor,
                      color: social.iconColor,
                    }}
                    aria-label={social.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 poppins-bold flex items-center gap-2 text-white">
              <span className="w-1 h-6 rounded-full bg-[#ebfba8]" />
              Navigasi Cepat
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="transition-all duration-300 poppins-regular text-sm flex items-center gap-2 group text-white/80 hover:text-[#ebfba8] hover:translate-x-2"
                  >
                    <span className="w-0 h-0.5 bg-[#ebfba8] transition-all duration-300 group-hover:w-4" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6 poppins-bold flex items-center gap-2 text-white">
              <span className="w-1 h-6 rounded-full bg-[#ebfba8]" />
              Layanan Kami
            </h3>
            <div className="space-y-4">
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <a
                    key={service.name}
                    href={service.href}
                    className="block group"
                  >
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-[#ebfba8]/30 hover:border-[#ebfba8]">
                      <div className="w-10 h-10 rounded-lg bg-[#fdf8d4] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-5 h-5 text-[#303646]" />
                      </div>
                      <div>
                        <h4 className="poppins-semibold text-white text-sm mb-1">
                          {service.name}
                        </h4>
                        <p className="text-xs text-white/70 poppins-regular">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 poppins-bold flex items-center gap-2 text-white">
              <span className="w-1 h-6 rounded-full bg-[#ebfba8]" />
              Hubungi Kami
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm poppins-regular">
                <div className="w-10 h-10 rounded-lg bg-[#435664] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#ebfba8]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1 text-white">Email</p>
                  <p className="text-white/80 mb-2">egomaggie1@gmail.com,</p>
                  <a
                    href="mailto:egomaggie1@gmail.com"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ebfba8] text-[#303646] text-xs font-medium hover:bg-[#fdf8d4] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Kirim Email
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm poppins-regular">
                <div className="w-10 h-10 rounded-lg bg-[#303646] flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-[#fdf8d4]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1 text-white">WhatsApp</p>
                  <p className="text-white/80 mb-2">+62 895-3419-8039</p>
                  <a
                    href="https://wa.me/6289534198039"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-medium hover:bg-[#20BA5A] transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Chat WhatsApp
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm poppins-regular">
                <div className="w-10 h-10 rounded-lg bg-[#fdf8d4] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#303646]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1 text-white">Alamat</p>
                  <p className="text-white/80 mb-2">
                    Jl.T. Batee Treun Gampong Ganoe Desa Lamdingin Kec. Kuta
                    Alam Banda Aceh
                  </p>
                  <a
                    href="https://maps.google.com/?q=Jl.T.+Batee+Treun+Gampong+Ganoe+Desa+Lamdingin+Kec.+Kuta+Alam+Banda+Aceh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#4285F4] text-white text-xs font-medium hover:bg-[#3367D6] transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Buka di Maps
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm poppins-regular">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/assets/footer/shopee.png"
                    alt="Shopee"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1 text-white">Shopee</p>
                  <p className="text-white/80 mb-2">Belanja produk kami</p>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EE4D2D] text-white text-xs font-medium hover:bg-[#D73211] transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.5 8.5h-17c-.276 0-.5.224-.5.5v11c0 .276.224.5.5.5h17c.276 0 .5-.224.5-.5V9c0-.276-.224-.5-.5-.5zm-8.5 9c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM3 7h18v1H3V7zm2-3h14v1H5V4z"/>
                    </svg>
                    Kunjungi Toko
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Payment Gateway Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pt-8 pb-6 border-t border-[#ebfba8]/30"
        >
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm poppins-medium text-white/90 text-center">
              Pembayaran Aman & Terpercaya
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-[#ebfba8]/30">
                <p className="text-xs poppins-regular text-white/80">
                  Powered by <span className="font-semibold text-[#ebfba8]">Midtrans</span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs poppins-regular text-white/70">
                <span>Transfer Bank</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span>E-Wallet</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span>Kartu Kredit</span>
              </div>
            </div>
            <p className="text-xs poppins-regular text-white/60 text-center max-w-2xl">
              Semua transaksi pembayaran diproses melalui payment gateway resmi Midtrans yang terdaftar dan diawasi oleh Bank Indonesia. 
              Dengan menggunakan layanan kami, Anda setuju dengan{" "}
              <Link href="/terms-conditions" className="text-[#ebfba8] hover:underline font-medium">
                Syarat & Ketentuan
              </Link>
              {" "}dan{" "}
              <Link href="/privacy-policy" className="text-[#ebfba8] hover:underline font-medium">
                Kebijakan Privasi
              </Link>
              {" "}kami terkait pemrosesan pembayaran dan perlindungan data pribadi Anda.
            </p>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-6 border-t border-[#ebfba8]/30"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm poppins-regular text-center md:text-left text-white/80">
              © {new Date().getFullYear()} EcoMaggie. Platform Ekonomi Sirkular
              Berkelanjutan
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy-policy"
                className="transition-colors poppins-regular text-white/80 hover:text-[#ebfba8] hover:underline"
              >
                Kebijakan Privasi
              </Link>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <Link
                href="/terms-conditions"
                className="transition-colors poppins-regular text-white/80 hover:text-[#ebfba8] hover:underline"
              >
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 w-12 h-12 rounded-full bg-gradient-to-br from-[#ebfba8] to-[#fdf8d4] shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 z-40 group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 text-[#303646] group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      )}
    </footer>
  );
}
