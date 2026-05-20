import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/SessionProvider";
import SessionTimeoutHandler from "@/components/providers/SessionTimeoutHandler";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Desa Cimanggu I",
  description: "Platform digital terpadu untuk mengelola, memonitor, dan menganalisis data pemberdayaan masyarakat.",
  icons: {
    icon: "/images/logo-bogor.png",
    apple: "/images/logo-bogor.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b1120] font-sans">
        <AuthProvider>
          <SessionTimeoutHandler />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
