import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/StructuredData";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "EcoMaggie - Platform Pengelolaan Sampah Organik & Budidaya Maggot Indonesia",
    template: "%s | EcoMaggie",
  },
  description:
    "EcoMaggie adalah platform digital terdepan untuk pengelolaan sampah organik dan budidaya maggot di Indonesia. Hubungkan penghasil sampah organik dengan peternak maggot untuk menciptakan ekonomi sirkular berkelanjutan. Solusi ramah lingkungan untuk masa depan yang lebih hijau.",
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
    url: "https://ecomaggie.id",
    siteName: "EcoMaggie",
    title: "EcoMaggie - Platform Pengelolaan Sampah Organik & Budidaya Maggot",
    description:
      "Platform digital untuk menghubungkan penghasil sampah organik dengan peternak maggot. Ciptakan ekonomi sirkular berkelanjutan bersama EcoMaggie.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EcoMaggie - Platform Pengelolaan Sampah Organik",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EcoMaggie - Platform Pengelolaan Sampah Organik & Budidaya Maggot",
    description:
      "Platform digital untuk menghubungkan penghasil sampah organik dengan peternak maggot. Solusi ramah lingkungan untuk masa depan berkelanjutan.",
    images: ["/og-image.jpg"],
    creator: "@ecomaggie",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  alternates: {
    canonical: "https://ecomaggie.id",
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <StructuredData />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
