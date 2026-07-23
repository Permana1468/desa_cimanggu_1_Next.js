"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdminKetuaDashboardKT } from "@/components/karang-taruna/AdminKetuaDashboardKT";
import { DashboardPortalKT } from "@/components/karang-taruna/DashboardPortalKT";

function KarangTarunaDashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || "";

  const userRole = (session?.user as any)?.role;

  const isKetua = userRole === "KARANG_TARUNA" || roleParam === "KETUA" || !roleParam;

  if (isKetua) {
    return <AdminKetuaDashboardKT session={session} />;
  }

  return <DashboardPortalKT />;
}

export default function KarangTarunaDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">Memuat Dashboard Karang Taruna...</div>}>
      <KarangTarunaDashboardContent />
    </Suspense>
  );
}
