import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Desa Cimanggu I - Platform Digital Desa',
    short_name: 'Desa Cimanggu I',
    description: 'Platform digital terpadu untuk mengelola, memonitor, dan menganalisis data pemberdayaan masyarakat.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b1120',
    theme_color: '#0b1120',
    icons: [
      {
        src: '/images/LOGO-DESA 2026.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/LOGO-DESA 2026.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
