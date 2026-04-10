import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Proxy API requests to FastAPI backend during local dev
  async rewrites() {
    return [
      {
        source: "/api/ai/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/ai/:path*`,
      },
      {
        source: "/api/map/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/map/:path*`,
      },
      {
        source: "/api/vision/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/vision/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' maps.googleapis.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: maps.gstatic.com *.googleapis.com images.unsplash.com; font-src 'self' fonts.gstatic.com; connect-src 'self' maps.googleapis.com *.google.com localhost:* ws://localhost:*; frame-ancestors 'none'; upgrade-insecure-requests;",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self) http://localhost:*",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
