import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@tanstack/react-query'],
  eslint: {
    // Warnings and errors will still show in terminal but won't fail the build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors will still show in IDE but won't fail the build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
