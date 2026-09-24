import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  typedRoutes: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
      },
    ],
  },
};

export default nextConfig;
