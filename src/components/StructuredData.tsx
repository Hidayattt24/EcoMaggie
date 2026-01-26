import Script from "next/script";

export default function StructuredData() {
  const baseUrl = "https://www.ecomaggie.com";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "EcoMaggie",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/assets/logo.svg`,
          width: 250,
          height: 100,
        },
        description:
          "Platform digital untuk pengelolaan sampah organik dan budidaya maggot BSF di Indonesia",
        email: "info@ecomaggie.com",
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
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "EcoMaggie",
        description:
          "Platform Sampah Organik & Budidaya Maggot Indonesia",
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
        inLanguage: "id-ID",
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/market/products?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/#webpage`,
        url: baseUrl,
        name: "EcoMaggie - Platform Sampah Organik & Budidaya Maggot",
        isPartOf: {
          "@id": `${baseUrl}/#website`,
        },
        about: {
          "@id": `${baseUrl}/#organization`,
        },
        description:
          "Platform digital untuk menghubungkan penghasil sampah organik dengan peternak maggot BSF. Ciptakan ekonomi sirkular berkelanjutan bersama EcoMaggie.",
        inLanguage: "id-ID",
      },
      {
        "@type": "Service",
        name: "Supply Connect",
        description:
          "Sistem yang menghubungkan produsen sampah organik dengan peternak maggot BSF untuk budidaya berkelanjutan",
        provider: {
          "@id": `${baseUrl}/#organization`,
        },
        serviceType: "Waste Management Platform",
        areaServed: {
          "@type": "Country",
          name: "Indonesia",
        },
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          price: "0",
          priceCurrency: "IDR",
        },
      },
      {
        "@type": "Service",
        name: "Maggot Market",
        description: "Marketplace untuk jual beli produk maggot BSF, pupa, dan turunannya",
        provider: {
          "@id": `${baseUrl}/#organization`,
        },
        serviceType: "Agricultural Marketplace",
        areaServed: {
          "@type": "Country",
          name: "Indonesia",
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "IDR",
          lowPrice: "50000",
          highPrice: "500000",
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${baseUrl}/#localbusiness`,
        name: "EcoMaggie",
        image: `${baseUrl}/assets/logo.svg`,
        description:
          "Platform digital pengelolaan sampah organik dan budidaya maggot BSF",
        url: baseUrl,
        telephone: "+6281234567890",
        email: "info@ecomaggie.com",
        address: {
          "@type": "PostalAddress",
          addressCountry: "ID",
          addressLocality: "Jakarta",
          addressRegion: "DKI Jakarta",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: -6.2088,
          longitude: 106.8456,
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "00:00",
          closes: "23:59",
        },
        priceRange: "$$",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Maggot Market",
            item: `${baseUrl}/market`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Supply Connect",
            item: `${baseUrl}/supply`,
          },
        ],
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
