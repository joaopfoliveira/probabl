import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Generate sitemap after build
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

export default nextConfig;
