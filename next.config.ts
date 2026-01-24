import type { NextConfig } from "next";
// @ts-ignore
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "react-leaflet"],
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  // Production optimization
  reactStrictMode: true,
  poweredByHeader: false,
  // Compress responses
  compress: true,
  // Turbopack config
  turbopack: {},
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Optimize workbox
  buildExcludes: [/middleware-manifest\.json$/, /_buildManifest\.js$/, /_ssgManifest\.js$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "google-fonts-stylesheets",
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-font-assets",
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-image-assets",
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-image",
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-js-assets",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-style-assets",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "next-data",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        },
        networkTimeoutSeconds: 3,
      },
    },
    {
      urlPattern: ({ url }: { url: URL }) => {
        const isSameOrigin = self.origin === url.origin;
        if (!isSameOrigin) return false;
        const pathname = url.pathname;
        if (pathname.startsWith("/api/")) return false;
        if (pathname.startsWith("/_next/static")) return false;
        return true;
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        },
        networkTimeoutSeconds: 5,
      },
    },
  ],
})(nextConfig);
