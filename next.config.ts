import type { NextConfig } from "next";

export default {
  eslint: { ignoreDuringBuilds: true },
  images: {
    // 1. MINIMIZE FORMATS: Prioritize WebP for a good balance of quality and size.
    // We removed 'image/avif' to halve the format transformations.
    formats: ["image/webp"], 
    
    // 2. RESTRICT SIZES: Define only the specific image widths your site needs. 
    // This dramatically limits the number of transformed variants Vercel creates.
    deviceSizes: [640, 750, 828, 1080, 1200], // Common desktop/mobile widths
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Common thumbnail/small sizes

    // 3. RESTRICT QUALITIES: Only allow the default (75) and a lower setting (50).
    // This reduces the number of unique quality variants that can be cached.
    qualities: [75, 50],

    // 4. MAXIMIZE CACHE: Set a long TTL (31 days) for transformed images.
    // This reduces cache writes and transformations by keeping the optimized image longer.
    minimumCacheTTL: 2678400, // 31 days in seconds

    // Retained your existing remote patterns
    remotePatterns: [
      { hostname: "**.githubassets.com", protocol: "https" },
      { hostname: "**.githubusercontent.com", protocol: "https" },
      { hostname: "**.googleusercontent.com", protocol: "https" },
      { hostname: "**.ufs.sh", protocol: "https" },
      { hostname: "**.unsplash.com", protocol: "https" },
      { hostname: "api.github.com", protocol: "https" },
      { hostname: "utfs.io", protocol: "https" },
      { hostname: "via.placeholder.com", protocol: "https" },
      { hostname: "www.shutterstock.com", protocol: "https" },
      { hostname: "https://res.cloudinary.com", protocol: "https" },
      { hostname: "res.cloudinary.com", protocol: "https" },
    ],
  },
} satisfies NextConfig;