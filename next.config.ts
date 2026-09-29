import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  experimental: {
    proxyClientMaxBodySize: "16mb",
  },
};

export default nextConfig;
