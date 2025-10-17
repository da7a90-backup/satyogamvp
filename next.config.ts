import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com", "localhost", "127.0.0.1","www.members.satyoga.org","www.satyoga.org"],
  },
};

export default nextConfig;
