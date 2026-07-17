import type { Metadata } from 'next';

import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Sensus App | Desa Digital',
  description: 'Aplikasi pendataan sensus dan GIS lapangan untuk surveyor desa.',
  icons: {
    icon: '/images/LOGO GIS.png',
  },
};

export default function SensusAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden antialiased">
      {children}
      <Toaster position="bottom-center" />
    </div>
  );
}
