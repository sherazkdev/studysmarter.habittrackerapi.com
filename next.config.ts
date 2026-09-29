import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  experimental: {
    proxyClientMaxBodySize: "16mb",
  },
};

export default nextConfig;
