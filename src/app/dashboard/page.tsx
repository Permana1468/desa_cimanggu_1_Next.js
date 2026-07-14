import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getVillageDashboardStats, getSuratList } from "@/actions/village";
import { getDashboardRealtimeStats } from "@/actions/dashboard";

// Role Components
import { ExecutiveDashboard } from "@/components/dashboard/roles/ExecutiveDashboard";
import { WilayahDashboard } from "@/components/dashboard/roles/WilayahDashboard";
import { WargaDashboard } from "@/components/dashboard/roles/WargaDashboard";
import { PelayananDashboard } from "@/components/dashboard/roles/PelayananDashboard";
import { KeuanganDashboard } from "@/components/dashboard/roles/KeuanganDashboard";
import { KesejahteraanDashboard } from "@/components/dashboard/roles/KesejahteraanDashboard";
import { KelembagaanDashboard } from "@/components/dashboard/roles/KelembagaanDashboard";
import { EkonomiDashboard } from "@/components/dashboard/roles/EkonomiDashboard";
import { OperatorDashboard } from "@/components/dashboard/roles/OperatorDashboard";
import { PerencanaanDashboard } from "@/components/dashboard/roles/PerencanaanDashboard";
import { PosyanduDashboard } from "@/components/dashboard/roles/PosyanduDashboard";
import { PuskesosDashboard } from "@/components/dashboard/roles/PuskesosDashboard";

export default async function VillageDashboardPage() {
  const session = await getServerSession(authOptions);
  
  const stats = await getVillageDashboardStats();
  const latestSurat = await getSuratList();
  const realtimeStats = await getDashboardRealtimeStats();

  const email = session?.user?.email || "";
  const baseRole = (session?.user as any)?.role || "WARGA";

  // Dynamic mapping for KAUR & KASI sub-roles based on email
  let role = baseRole;
  if (baseRole === "KAUR") {
    if (email.includes("perencanaan")) {
      role = "KAUR_PERENCANAAN";
    } else if (email.includes("keuangan")) {
      role = "KAUR_KEUANGAN";
    } else if (email.includes("tu") || email.includes("umum")) {
      role = "KAUR_TU";
    }
  } else if (baseRole === "KASI") {
    if (email.includes("pemerintahan")) {
      role = "KASI_PEMERINTAHAN";
    } else if (email.includes("pelayanan")) {
      role = "KASI_PELAYANAN";
    } else if (email.includes("kesejahteraan")) {
      role = "KASI_KESEJAHTERAAN";
    }
  }

  // 1. EXECUTIVE ROLES (Pimpinan & Manajemen Umum)
  if (["ADMIN_DESA", "KADES", "SEKDES", "ADMIN_MASTER"].includes(role)) {
    if (email.includes("operator")) {
      return <OperatorDashboard session={session} stats={stats} />;
    }
    return <ExecutiveDashboard session={session} stats={stats} latestSurat={latestSurat} realtimeStats={realtimeStats} />;
  }

  // 2. PELAYANAN & TATA USAHA (Administrasi Pemerintahan & Petugas)
  if (["KAUR_TU", "KASI_PEMERINTAHAN", "KASI_PELAYANAN", "PERANGKAT_DESA", "PETUGAS_SENSUS"].includes(role)) {
    return <PelayananDashboard session={session} stats={stats} />;
  }

  // 3. PERENCANAAN
  if (role === "KAUR_PERENCANAAN") {
    return <PerencanaanDashboard session={session} stats={stats} />;
  }

  // 3b. KEUANGAN
  if (role === "KAUR_KEUANGAN") {
    return <KeuanganDashboard session={session} stats={stats} />;
  }

  // 4. KESEJAHTERAAN SOSIAL
  if (role === "KASI_KESEJAHTERAAN") {
    return <KesejahteraanDashboard session={session} stats={stats} />;
  }

  // 4b. PUSKESOS (SLRT)
  if (role === "PUSKESOS") {
    return <PuskesosDashboard session={session} stats={stats} />;
  }

  // 5. KELEMBAGAAN MASYARAKAT
  if (["TP_PKK", "PKK", "LPM", "BPD", "KARANG_TARUNA"].includes(role)) {
    return <KelembagaanDashboard session={session} stats={stats} />;
  }

  // 5b. POSYANDU
  if (role === "POSYANDU") {
    return <PosyanduDashboard session={session} stats={stats} />;
  }

  // 6. KEWILAYAHAN (Dusun, RT, RW)
  if (["KADUS", "RT", "RW"].includes(role)) {
    return <WilayahDashboard session={session} stats={stats} />;
  }

  // 7. EKONOMI & BISNIS (BUMDES & UMKM)
  if (["BUMDES", "PEMILIK_TOKO_UMKM"].includes(role)) {
    return <EkonomiDashboard session={session} stats={stats} />;
  }

  // 8. TEKNIS & OPERATOR
  if (role === "OPERATOR_DESA") {
    return <OperatorDashboard session={session} stats={stats} />;
  }

  // 9. WARGA (Default Fallback)
  return <WargaDashboard session={session} stats={stats} latestSurat={latestSurat} />;
}
