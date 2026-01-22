import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "./toast-animations.css";
import StructuredData from "@/components/StructuredData";
import { SWRProvider } from "@/lib/swr/provider";

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
      "EcoMaggie - Kolaborasi Pengelolaan Sampah Organik & Budidaya Maggot BSF",
    template: "%s | EcoMaggie",
  },
  description:
    "Tahukah kamu? EcoMaggie mengubah cara kita memandang sampah. Melalui sistem ekonomi sirkular, kami menghubungkan limbah organik di Gampong Rukoh dengan petani maggot untuk menciptakan pakan ternak bernilai tinggi. Mari kurangi beban sampah di TPA dan ciptakan dampak ekonomi nyata bagi masyarakat lokal bersama platform digital kami.",
  keywords: [
 // --- Brand & Core Concept ---
    "EcoMaggie",
    "supply connect",
    "maggot market",
    "ekonomi sirkular",
    "sustainable waste management",
    "zero waste Indonesia",
    
    // --- Lokasi & Komunitas Spesifik (SEO Lokal) ---
    "Banda Aceh",
    "UMKM Banda Aceh",
    "Gampong Rukoh",
    "Gampong Lamdingin",
    "Syiah Kuala",
    "Pasar Rukoh",
    "Universitas Syiah Kuala",
    "USK",
    "pengelolaan sampah Banda Aceh",
    "maggot BSF Aceh",
    "DLHK3 Banda Aceh",
    
    // --- Masalah & Solusi (Pertanyaan Orang Awam) ---
    "cara olah sampah rumah tangga",
    "tempat buang sampah organik",
    "solusi sampah menumpuk",
    "manfaat maggot BSF",
    "cara memilah sampah",
    "pengomposan praktis",
    "pemanfaatan limbah dapur",
    "pupuk organik cair maggot",
    
    // --- Sektor Peternakan & Bisnis (Target UMKM/Petani) ---
    "pakan ternak alternatif murah",
    "pakan ikan lele Aceh",
    "pakan ayam organik",
    "bisnis maggot BSF",
    "jual maggot hidup Banda Aceh",
    "pakan burung bernutrisi",
    "kemitraan pengolahan sampah",
    "peluang usaha pakan ternak",
    
    // --- Terminologi Teknis & Umum ---
    "maggot BSF",
    "black soldier fly",
    "limbah organik",
    "sampah pasar",
    "maggot farming",
    "biokonversi sampah",
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
    title:  "EcoMaggie - Kolaborasi Pengelolaan Sampah Organik & Budidaya Maggot BSF",
    description:
     "Tahukah kamu? EcoMaggie membangun sistem ekonomi sirkular di Gampong Rukoh dengan menghubungkan sumber limbah organik langsung ke petani maggot melalui platform digital. Bersama-sama, kita mengurangi beban sampah di TPA sekaligus menciptakan produk pakan ternak bernilai ekonomi bagi kesejahteraan masyarakat lokal.",
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
       "EcoMaggie - Kolaborasi Pengelolaan Sampah Organik & Budidaya Maggot BSF",
    description:
      "Tahukah kamu? EcoMaggie membangun sistem ekonomi sirkular di Gampong Rukoh dengan menghubungkan sumber limbah organik langsung ke petani maggot melalui platform digital. Bersama-sama, kita mengurangi beban sampah di TPA sekaligus menciptakan produk pakan ternak bernilai ekonomi bagi kesejahteraan masyarakat lokal.",
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
        <SWRProvider>
          {children}
        </SWRProvider>
      </body>
    </html>
  );
}
