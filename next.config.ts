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
    value: 'camera=(self), microphone=(self), geolocation=(self)'
  },
  ...(isProd ? [{
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://yupabeqtuqiajxgnvkup.supabase.co https://www.transparenttextures.com https://*.tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://mt0.google.com https://mt1.google.com https://mt2.google.com https://mt3.google.com; connect-src 'self' https://yupabeqtuqiajxgnvkup.supabase.co https://vitals.vercel-analytics.com wss://*; frame-src 'self';"
  }] : [])
];

const nextConfig: NextConfig = {
  allowedDevOrigins: getDynamicDevOrigins(),
  cacheComponents: false,
  reactCompiler: false, // Turned off for dev speed (AST parsing is heavy)
  compress: true, // Enable gzip/brotli compression
  productionBrowserSourceMaps: false, // Disable sourcemaps in production for smaller builds
  typescript: {
    // Memungkinkan fast-build mode via `npm run build:fast` saat ingin kompilasi instan
    ignoreBuildErrors: process.env.NEXT_IGNORE_TYPECHECK === "1",
  },
  compiler: {
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "date-fns",
      "@turf/turf",
      "leaflet",
      "lenis",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "googleapis",
      "exceljs",
      "pdf-lib",
      "xlsx",
      "docx",
      "mammoth",
      "docxtemplater",
      "@vladmandic/face-api"
    ],
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  onDemandEntries: {
    // Pertahankan cache halaman di dev server hingga 1 jam agar tidak recompiling ulang saat bolak-balik tab
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 64,
  },
  devIndicators: {
    // Geser indikator dev ke kanan bawah agar tidak menutupi status card sidebar kiri
    position: 'bottom-right',
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
// Config re-evaluated at 2026-10-01 to reload updated Prisma Client
