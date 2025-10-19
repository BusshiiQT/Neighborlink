// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },       // Supabase Storage
      { protocol: 'https', hostname: 'images.unsplash.com' },  // optional
    ],
  },
};

export default nextConfig;
