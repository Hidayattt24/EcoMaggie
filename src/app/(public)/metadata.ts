import type { Metadata } from "next";

export const landingPageMetadata: Metadata = {
  title: "EcoMaggie - Platform Sampah Organik & Budidaya Maggot",
  description:
    "Platform digital untuk pengelolaan sampah organik dan budidaya maggot BSF di Indonesia. Hubungkan penghasil sampah dengan peternak maggot untuk ekonomi sirkular berkelanjutan. Solusi ramah lingkungan berbasis teknologi.",
  keywords: [
    "pengelolaan sampah organik",
    "budidaya maggot",
    "maggot BSF",
    "black soldier fly",
    "peternak maggot Indonesia",
    "ekonomi sirkular",
    "platform sampah organik",
    "supply connect",
    "maggot market",
    "sustainable waste management",
    "limbah organik",
    "maggot farming Indonesia",
    "pengomposan organik",
    "zero waste Indonesia",
    "solusi sampah organik",
    "marketplace maggot",
  ],
  openGraph: {
    title: "EcoMaggie - Platform Sampah Organik & Budidaya Maggot",
    description:
      "Platform digital untuk menghubungkan penghasil sampah organik dengan peternak maggot BSF. Ciptakan ekonomi sirkular berkelanjutan bersama EcoMaggie.",
    url: "https://www.ecomaggie.com",
    siteName: "EcoMaggie",
    type: "website",
    locale: "id_ID",
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
    title: "EcoMaggie - Platform Sampah Organik & Budidaya Maggot",
    description:
      "Platform digital untuk menghubungkan penghasil sampah organik dengan peternak maggot BSF. Solusi ramah lingkungan untuk ekonomi sirkular berkelanjutan.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://www.ecomaggie.com",
  },
};
