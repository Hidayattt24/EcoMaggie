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
    <footer
      className="relative overflow-hidden"
      style={{
        backgroundColor: "#FDF8D4",
      }}
    >
      {/* Decorative Elements */}
      <div
        className="absolute top-0 left-0 w-full h-1 opacity-30"
        style={{ backgroundColor: "#A3AF87" }}
      ></div>
      <div
        className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(163, 175, 135, 0.1)" }}
      ></div>
      <div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(163, 175, 135, 0.08)" }}
      ></div>

      {/* Leaf Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-20">
          <Leaf className="w-32 h-32 rotate-45" style={{ color: "#A3AF87" }} />
        </div>
        <div className="absolute top-40 right-32">
          <Leaf className="w-24 h-24 -rotate-12" style={{ color: "#A3AF87" }} />
        </div>
        <div className="absolute bottom-20 left-1/3">
          <Leaf className="w-40 h-40 rotate-90" style={{ color: "#A3AF87" }} />
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
            <p
              className="text-sm leading-relaxed mb-6 poppins-regular"
              style={{ color: "#5a6c5b" }}
            >
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
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{
                      backgroundColor: "rgba(163, 175, 135, 0.2)",
                      color: "#A3AF87",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#A3AF87";
                      e.currentTarget.style.color = "#FDF8D4";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(163, 175, 135, 0.2)";
                      e.currentTarget.style.color = "#A3AF87";
                    }}
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
            <h3
              className="text-lg font-bold mb-6 poppins-bold flex items-center gap-2"
              style={{ color: "#303646" }}
            >
              <span
                className="w-1 h-6 rounded-full"
                style={{ backgroundColor: "#A3AF87" }}
              ></span>
              Navigasi Cepat
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="transition-colors duration-300 poppins-regular text-sm flex items-center gap-2 group"
                    style={{ color: "#5a6c5b" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#A3AF87";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#5a6c5b";
                    }}
                  >
                    <span
                      className="w-0 h-0.5 transition-all duration-300 group-hover:w-4"
                      style={{ backgroundColor: "#A3AF87" }}
                    ></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3
              className="text-lg font-bold mb-6 poppins-bold flex items-center gap-2"
              style={{ color: "#303646" }}
            >
              <span
                className="w-1 h-6 rounded-full"
                style={{ backgroundColor: "#A3AF87" }}
              ></span>
              Layanan Kami
            </h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <a
                    href={service.href}
                    className="transition-colors duration-300 poppins-regular text-sm flex items-center gap-2 group"
                    style={{ color: "#5a6c5b" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#A3AF87";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#5a6c5b";
                    }}
                  >
                    <span
                      className="w-0 h-0.5 transition-all duration-300 group-hover:w-4"
                      style={{ backgroundColor: "#A3AF87" }}
                    ></span>
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3
              className="text-lg font-bold mb-6 poppins-bold flex items-center gap-2"
              style={{ color: "#303646" }}
            >
              <span
                className="w-1 h-6 rounded-full"
                style={{ backgroundColor: "#A3AF87" }}
              ></span>
              Hubungi Kami
            </h3>
            <ul className="space-y-4">
              <li
                className="flex items-start gap-3 text-sm poppins-regular"
                style={{ color: "#5a6c5b" }}
              >
                <Mail
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  style={{ color: "#A3AF87" }}
                />
                <div>
                  <p
                    className="font-semibold mb-1"
                    style={{ color: "#303646" }}
                  >
                    Email
                  </p>
                  <a
                    href="mailto:info@ecomaggie.id"
                    className="transition-colors"
                    style={{ color: "#5a6c5b" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#A3AF87";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#5a6c5b";
                    }}
                  >
                    cs@Ecomaggie.id
                  </a>
                </div>
              </li>
              <li
                className="flex items-start gap-3 text-sm poppins-regular"
                style={{ color: "#5a6c5b" }}
              >
                <Phone
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  style={{ color: "#A3AF87" }}
                />
                <div>
                  <p
                    className="font-semibold mb-1"
                    style={{ color: "#303646" }}
                  >
                    Telepon
                  </p>
                  <a
                    href="tel:+6281234567890"
                    className="transition-colors"
                    style={{ color: "#5a6c5b" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#A3AF87";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#5a6c5b";
                    }}
                  >
                    +62 822-8895-3268
                  </a>
                </div>
              </li>
              <li
                className="flex items-start gap-3 text-sm poppins-regular"
                style={{ color: "#5a6c5b" }}
              >
                <MapPin
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  style={{ color: "#A3AF87" }}
                />
                <div>
                  <p
                    className="font-semibold mb-1"
                    style={{ color: "#303646" }}
                  >
                    Alamat
                  </p>
                  <p>
                    Jl.T. Batee Treun Gampong Ganoe Desa Lamdingin Kec. Kuta
                    Alam Banda Aceh
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              className="text-sm poppins-regular text-center md:text-left"
              style={{ color: "#5a6c5b" }}
            >
              © {new Date().getFullYear()} EcoMaggie.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="#"
                className="transition-colors poppins-regular"
                style={{ color: "#5a6c5b" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#A3AF87";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#5a6c5b";
                }}
              >
                Kebijakan Privasi
              </a>
              <a
                href="#"
                className="transition-colors poppins-regular"
                style={{ color: "#5a6c5b" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#A3AF87";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#5a6c5b";
                }}
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
          className="fixed bottom-6 left-6 w-12 h-12 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 z-40 group"
          style={{
            backgroundColor: "#A3AF87",
            color: "#FDF8D4",
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      )}
    </footer>
  );
}
