import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.ecomaggie.com";
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#beranda-section`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#tentang-section`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#solusi-section`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#dampak-section`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#testimoni-section`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // Add more URLs as they are created
    // {
    //   url: `${baseUrl}/login`,
    //   lastModified: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.5,
    // },
    // {
    //   url: `${baseUrl}/register`,
    //   lastModified: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.5,
    // },
  ];
}
