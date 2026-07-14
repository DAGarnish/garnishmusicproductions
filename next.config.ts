import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { getNextConfigRedirects } from "./src/lib/redirects";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async redirects() {
    return getNextConfigRedirects();
  },
  images: {
    // Allow all image formats including GIFs (used by some WordPress subsite products)
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Cloudinary CDN for all uploaded images and media assets
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/s7pus8t5/**',
      },
      // Wildcard covers all Garnish Multisite subdomains automatically over HTTPS and HTTP
      {
        protocol: 'https',
        hostname: '**.garnishmusicproduction.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**.garnishmusicproduction.com',
        pathname: '/**',
      },
      // Local Docker fallback
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default withPayload(nextConfig);
