import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://titan360.com.tr/api/:path*",
      },
      {
        source: "/static/:path*",
        destination: "https://titan360.com.tr/static/:path*",
      },
    ];
  },
};

export default nextConfig;
