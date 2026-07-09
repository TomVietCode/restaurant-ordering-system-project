import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.35'],
  output: "standalone",
};

export default nextConfig;
