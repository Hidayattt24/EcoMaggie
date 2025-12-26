import Script from "next/script";

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://ecomaggie.id/#organization",
        name: "EcoMaggie",
        url: "https://ecomaggie.id",
        logo: {
          "@type": "ImageObject",
          url: "https://ecomaggie.id/assets/logo.svg",
          width: 250,
          height: 100,
        },
        description:
          "Platform digital untuk pengelolaan sampah organik dan budidaya maggot di Indonesia",
        email: "info@ecomaggie.id",
        telephone: "+6281234567890",
        address: {
          "@type": "PostalAddress",
          addressCountry: "ID",
          addressLocality: "Jakarta",
          addressRegion: "DKI Jakarta",
        },
        sameAs: [
          "https://facebook.com/ecomaggie",
          "https://instagram.com/ecomaggie",
          "https://twitter.com/ecomaggie",
          "https://linkedin.com/company/ecomaggie",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://ecomaggie.id/#website",
        url: "https://ecomaggie.id",
        name: "EcoMaggie",
        description:
          "Platform Pengelolaan Sampah Organik & Budidaya Maggot Indonesia",
        publisher: {
          "@id": "https://ecomaggie.id/#organization",
        },
        inLanguage: "id-ID",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://ecomaggie.id/?s={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://ecomaggie.id/#webpage",
        url: "https://ecomaggie.id",
        name: "EcoMaggie - Platform Pengelolaan Sampah Organik & Budidaya Maggot",
        isPartOf: {
          "@id": "https://ecomaggie.id/#website",
        },
        about: {
          "@id": "https://ecomaggie.id/#organization",
        },
        description:
          "Platform digital untuk menghubungkan penghasil sampah organik dengan peternak maggot. Ciptakan ekonomi sirkular berkelanjutan bersama EcoMaggie.",
        inLanguage: "id-ID",
      },
      {
        "@type": "Service",
        name: "Supply Connect",
        description:
          "Sistem yang menghubungkan produsen sampah organik dengan peternak maggot",
        provider: {
          "@id": "https://ecomaggie.id/#organization",
        },
        serviceType: "Waste Management Platform",
        areaServed: {
          "@type": "Country",
          name: "Indonesia",
        },
      },
      {
        "@type": "Service",
        name: "Maggot Market",
        description: "Marketplace untuk jual beli produk maggot dan turunannya",
        provider: {
          "@id": "https://ecomaggie.id/#organization",
        },
        serviceType: "Agricultural Marketplace",
        areaServed: {
          "@type": "Country",
          name: "Indonesia",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Apa itu EcoMaggie?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "EcoMaggie adalah platform digital yang menghubungkan penghasil sampah organik dengan peternak maggot untuk menciptakan ekonomi sirkular berkelanjutan di Indonesia.",
            },
          },
          {
            "@type": "Question",
            name: "Bagaimana cara kerja Supply Connect?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Supply Connect adalah sistem yang menghubungkan produsen sampah organik (restoran, pasar, rumah tangga) dengan peternak maggot yang membutuhkan pasokan berkualitas untuk budidaya mereka.",
            },
          },
          {
            "@type": "Question",
            name: "Apa manfaat bergabung dengan EcoMaggie?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Manfaatnya termasuk pengelolaan sampah organik yang efisien, pengurangan emisi karbon hingga 80%, peningkatan produktivitas peternak maggot hingga 300%, dan kontribusi terhadap ekonomi sirkular berkelanjutan.",
            },
          },
        ],
      },
    ],
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
