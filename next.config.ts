// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (public bucket)
      {
        protocol: "https",
        hostname: "cvduuidzzhcvzcexlifr.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // add any others you use:
      // { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      // { protocol: "https", hostname: "cdn.yoursite.com", pathname: "/**" },
    ],
  },
  eslint: { ignoreDuringBuilds: true }, // (you already set this earlier)
};

export default nextConfig;
