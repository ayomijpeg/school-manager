import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Your existing TypeScript setting
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 2. New Image Configuration for Unsplash
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
