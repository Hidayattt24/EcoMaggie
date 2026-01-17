import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "./toast-animations.css";
import StructuredData from "@/components/StructuredData";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eco-maggie.vercel.app"),
  title: {
    default:
      "EcoMaggie - Ubah Sampah Jadi Profit! Platform #1 Maggot BSF Indonesia",
    template: "%s | EcoMaggie",
  },
  description:
    "Tahukah Anda sampah organik bisa jadi sumber penghasilan? EcoMaggie menghubungkan penghasil limbah dengan peternak maggot BSF untuk ciptakan passive income. Sudah 500+ mitra sukses! Apakah Anda siap bergabung dalam revolusi ekonomi sirkular Indonesia?",
  keywords: [
    "pengelolaan sampah organik",
    "budidaya maggot",
    "peternak maggot Indonesia",
    "ekonomi sirkular",
    "sampah organik",
    "maggot BSF",
    "black soldier fly",
    "platform sampah organik",
    "sustainable waste management",
    "limbah organik",
    "maggot farming",
    "pengomposan",
    "zero waste Indonesia",
    "EcoMaggie",
    "supply connect",
    "maggot market",
  ],
  authors: [{ name: "EcoMaggie Team" }],
  creator: "EcoMaggie",
  publisher: "EcoMaggie",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://eco-maggie.vercel.app",
    siteName: "EcoMaggie",
    title: "EcoMaggie - Menghubungkan Solusi Limbah dengan Budidaya Maggot",
    description:
      "EcoMaggie adalah platform jembatan antara penghasil limbah organik dan petani maggot. Kami menciptakan rantai pasok yang stabil, efisien, dan berkelanjutan untuk ekonomi sirkular yang lebih baik.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EcoMaggie - Platform Sampah Organik & Budidaya Maggot BSF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "EcoMaggie - Ubah Sampah Jadi Profit! Platform #1 Maggot BSF Indonesia",
    description:
      "Apakah Anda tahu limbah organik bisa jadi sumber penghasilan? 500+ mitra sudah sukses! Waktunya Anda bergabung dalam revolusi ekonomi sirkular Indonesia bersama EcoMaggie.",
    images: ["/og-image.jpg"],
    creator: "@ecomaggie",
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  alternates: {
    canonical: "https://eco-maggie.vercel.app",
    languages: {
      "id-ID": "https://eco-maggie.vercel.app",
    },
  },
  category: "Technology",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Critical Resource Preloading */}
        <link
          rel="preload"
          href="/assets/logo.svg"
          as="image"
          type="image/svg+xml"
        />
        <link
          rel="preload"
          href="/assets/landing/beranda.svg"
          as="image"
          type="image/svg+xml"
          media="(min-width: 1024px)"
        />
        <link
          rel="preload"
          href="/assets/landing/beranda-mobile.svg"
          as="image"
          type="image/svg+xml"
          media="(max-width: 1023px)"
        />

        {/* DNS Prefetch for external domains */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        <StructuredData />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
