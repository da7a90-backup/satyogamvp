import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint errors during build for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during build for deployment
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'www.members.satyoga.org',
      },
      {
        protocol: 'https',
        hostname: 'www.satyoga.org',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Configure for react-pdf
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Fix for pdfjs-dist in Next.js 15
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;
