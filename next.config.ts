import type { NextConfig } from "next";
import os from "os";

// Dynamically get all active IPv4 addresses of the host machine for seamless multi-device Wi-Fi access
function getDynamicDevOrigins(): string[] {
  const origins = ["localhost:3000", "127.0.0.1:3000", "0.0.0.0:3000"];
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === "IPv4" && !net.internal) {
          origins.push(net.address);
          origins.push(`${net.address}:3000`);
          const prefix = net.address.substring(0, net.address.lastIndexOf("."));
          origins.push(`${prefix}.*`);
        }
      }
    }
  } catch (e) {
    // Fallback if os network inspection is restricted
  }
  return origins;
}

const isProd = process.env.NODE_ENV === 'production';

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  ...(isProd ? [{
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  }] : []),
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  ...(isProd ? [{
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://yupabeqtuqiajxgnvkup.supabase.co https://www.transparenttextures.com https://*.tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://mt0.google.com https://mt1.google.com https://mt2.google.com https://mt3.google.com; connect-src 'self' https://yupabeqtuqiajxgnvkup.supabase.co https://vitals.vercel-analytics.com wss://*; frame-src 'self';"
  }] : [])
];

const nextConfig: NextConfig = {
  // @ts-ignore - Next.js internal type might not be updated yet
  allowedDevOrigins: getDynamicDevOrigins(),
  cacheComponents: true,
  reactCompiler: true, // Auto-memoization for much faster rendering
  compiler: {
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts", "date-fns"],
    turbopackFileSystemCacheForDev: true,
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'yupabeqtuqiajxgnvkup.supabase.co',
      },
    ],
  },
};

export default nextConfig;
