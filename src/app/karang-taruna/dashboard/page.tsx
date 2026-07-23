import { DashboardPortalKT } from "@/components/karang-taruna/DashboardPortalKT";
import { Suspense } from "react";

export const metadata = {
  title: "Dashboard Portal Karang Taruna Desa Cimanggu I",
  description: "Dashboard Mandiri Anggota & Pengurus Karang Taruna Desa Cimanggu I",
};

export default function KarangTarunaDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">Memuat Dashboard Portal Karang Taruna...</div>}>
      <DashboardPortalKT />
    </Suspense>
  );
}
