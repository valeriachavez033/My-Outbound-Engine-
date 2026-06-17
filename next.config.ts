import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  images: {
    domains: [],
  },
};

export default nextConfig;
