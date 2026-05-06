import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getVillageDashboardStats, getSuratList } from "@/actions/village";

// Role Components
import { ExecutiveDashboard } from "@/components/dashboard/roles/ExecutiveDashboard";
import { WilayahDashboard } from "@/components/dashboard/roles/WilayahDashboard";
import { WargaDashboard } from "@/components/dashboard/roles/WargaDashboard";
import { PelayananDashboard } from "@/components/dashboard/roles/PelayananDashboard";
import { KeuanganDashboard } from "@/components/dashboard/roles/KeuanganDashboard";
import { KesejahteraanDashboard } from "@/components/dashboard/roles/KesejahteraanDashboard";
import { KelembagaanDashboard } from "@/components/dashboard/roles/KelembagaanDashboard";
import { EkonomiDashboard } from "@/components/dashboard/roles/EkonomiDashboard";

export default async function VillageDashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Universal Stats
  const stats = await getVillageDashboardStats();
  const latestSurat = await getSuratList();

  const role = (session?.user as any)?.role || "WARGA";

  // 1. EXECUTIVE ROLES (Pimpinan & Manajemen Umum)
  if (["ADMIN_DESA", "KADES", "SEKDES"].includes(role)) {
    return <ExecutiveDashboard session={session} stats={stats} latestSurat={latestSurat} />;
  }

  // 2. PELAYANAN & TATA USAHA (Administrasi Pemerintahan & Sensus)
  if (["KAUR_TU", "KASI_PEMERINTAHAN", "KASI_PELAYANAN", "PETUGAS_SENSUS", "PERANGKAT_DESA"].includes(role)) {
    return <PelayananDashboard session={session} stats={stats} />;
  }

  // 3. PERENCANAAN & KEUANGAN
  if (["KAUR_PERENCANAAN", "KAUR_KEUANGAN"].includes(role)) {
    return <KeuanganDashboard session={session} stats={stats} />;
  }

  // 4. KESEJAHTERAAN SOSIAL
  if (["KASI_KESEJAHTERAAN", "PUSKESOS"].includes(role)) {
    return <KesejahteraanDashboard session={session} stats={stats} />;
  }

  // 5. KELEMBAGAAN MASYARAKAT
  if (["TP_PKK", "PKK", "POSYANDU", "LPM", "BPD", "KARANG_TARUNA"].includes(role)) {
    return <KelembagaanDashboard session={session} stats={stats} />;
  }

  // 6. KEWILAYAHAN (Dusun, RT, RW)
  if (["KADUS", "RT", "RW"].includes(role)) {
    return <WilayahDashboard session={session} stats={stats} />;
  }

  // 7. EKONOMI & BISNIS
  if (["BUMDES", "PEMILIK_TOKO_UMKM"].includes(role)) {
    return <EkonomiDashboard session={session} stats={stats} />;
  }

  // 8. WARGA (Default Fallback)
  return <WargaDashboard session={session} stats={stats} latestSurat={latestSurat} />;
}
