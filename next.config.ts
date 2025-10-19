import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // keep your Supabase & Unsplash entries if present
      { protocol: "https", hostname: "cvduuidzzhcvzcexlifr.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      // add Picsum
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
