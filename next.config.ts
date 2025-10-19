
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Don’t fail the production build on ESLint errors
    ignoreDuringBuilds: true,
  },
  images: {
    // keep your existing config here if you had one
  },
};

export default nextConfig;
