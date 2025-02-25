import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disables ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disables TypeScript type checking during builds
    ignoreBuildErrors: true,
  },
  output: "export",
  /* config options here */
};

export default nextConfig;
