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
    ],
  },
};

export default nextConfig;
