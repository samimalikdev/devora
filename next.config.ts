import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/index.html', destination: '/' },
      { source: '/login.html', destination: '/login' },
      { source: '/signup.html', destination: '/signup' },
      { source: '/dashboard.html', destination: '/dashboard' },
    ];
  },
};

export default nextConfig;
