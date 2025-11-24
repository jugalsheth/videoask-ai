import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable server components and optimize for production
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  turbopack: {
    // Configure Turbopack to handle transformers.js properly
  },
  // Webpack configuration (fallback if webpack is explicitly used)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude transformers from client bundle (they run in API routes)
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
