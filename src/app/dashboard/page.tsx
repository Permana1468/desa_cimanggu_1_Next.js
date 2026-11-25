import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getVillageDashboardStats, getSuratList } from "@/actions/village";
import { getDashboardRealtimeStats } from "@/actions/dashboard";
import { getVillageProfile } from "@/actions/landing";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

const RoleLoading = () => (
  <div className="p-10 flex flex-col items-center justify-center min-h-[360px] gap-3">
    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    <p className="text-sm font-medium text-slate-500">Memuat modul...</p>
  </div>
);

// Dynamic Role Components (split bundle & compilation per role)
const ExecutiveDashboard = dynamic(() => import("@/components/dashboard/roles/ExecutiveDashboard").then(m => m.ExecutiveDashboard), { loading: RoleLoading });
const WilayahDashboard = dynamic(() => import("@/components/dashboard/roles/WilayahDashboard").then(m => m.WilayahDashboard), { loading: RoleLoading });
const KadusDashboard = dynamic(() => import("@/components/dashboard/roles/KadusDashboard").then(m => m.KadusDashboard), { loading: RoleLoading });
const WargaDashboard = dynamic(() => import("@/components/dashboard/roles/WargaDashboard").then(m => m.WargaDashboard), { loading: RoleLoading });
const PelayananDashboard = dynamic(() => import("@/components/dashboard/roles/PelayananDashboard").then(m => m.PelayananDashboard), { loading: RoleLoading });
const KeuanganDashboard = dynamic(() => import("@/components/dashboard/roles/KeuanganDashboard").then(m => m.KeuanganDashboard), { loading: RoleLoading });
const KesejahteraanDashboard = dynamic(() => import("@/components/dashboard/roles/KesejahteraanDashboard").then(m => m.KesejahteraanDashboard), { loading: RoleLoading });
const KelembagaanDashboard = dynamic(() => import("@/components/dashboard/roles/KelembagaanDashboard").then(m => m.KelembagaanDashboard), { loading: RoleLoading });
const EkonomiDashboard = dynamic(() => import("@/components/dashboard/roles/EkonomiDashboard").then(m => m.EkonomiDashboard), { loading: RoleLoading });
const OperatorDashboard = dynamic(() => import("@/components/dashboard/roles/OperatorDashboard").then(m => m.OperatorDashboard), { loading: RoleLoading });
const PerencanaanDashboard = dynamic(() => import("@/components/dashboard/roles/PerencanaanDashboard").then(m => m.PerencanaanDashboard), { loading: RoleLoading });
const PosyanduDashboard = dynamic(() => import("@/components/dashboard/roles/PosyanduDashboard").then(m => m.PosyanduDashboard), { loading: RoleLoading });
const PuskesosDashboard = dynamic(() => import("@/components/dashboard/roles/PuskesosDashboard").then(m => m.PuskesosDashboard), { loading: RoleLoading });
const KasiPelayananDashboard = dynamic(() => import("@/components/dashboard/roles/KasiPelayananDashboard").then(m => m.KasiPelayananDashboard), { loading: RoleLoading });

export default async function VillageDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.email === "petagis@cimanggu1.desa.id") {
    redirect("/gis-dashboard");
  }

  const email = (session?.user?.email || "").toLowerCase();
  const userName = (session?.user?.name || "").toLowerCase();
  const baseRole = (session?.user as any)?.role || "WARGA";

  // Dynamic mapping for KAUR & KASI sub-roles based on email or name
  let role = baseRole;
  if (baseRole === "KAUR") {
    if (email.includes("perencanaan") || userName.includes("perencanaan")) {
      role = "KAUR_PERENCANAAN";
    } else if (email.includes("keuangan") || userName.includes("keuangan")) {
      role = "KAUR_KEUANGAN";
    } else if (email.includes("tu") || email.includes("umum") || userName.includes("tata usaha") || userName.includes("tu")) {
      role = "KAUR_TU";
    }
  } else if (baseRole === "KASI") {
    if (email.includes("pemerintahan") || userName.includes("pemerintahan")) {
      role = "KASI_PEMERINTAHAN";
    } else if (email.includes("pelayanan") || userName.includes("pelayanan")) {
      role = "KASI_PELAYANAN";
    } else if (email.includes("kesejahteraan") || email.includes("kesra") || userName.includes("kesejahteraan") || userName.includes("kesra")) {
      role = "KASI_KESEJAHTERAAN";
    }
  }

  const isExecutive = ["ADMIN_DESA", "KADES", "SEKDES", "ADMIN_MASTER"].includes(role) && !email.includes("operator");
  const isWarga = role === "WARGA";
  const needsSurat = isExecutive || isWarga;
  const isPerencanaan = role === "KAUR_PERENCANAAN";
  const needsStats = !isPerencanaan;

  // Fetch only what this role needs, executing in parallel to eliminate waterfall latency
  const [stats, latestSurat, realtimeStats, villageProfile] = await Promise.all([
    needsStats 
      ? getVillageDashboardStats() 
      : Promise.resolve({ suratPending: 0, laporanVerified: 0, totalAparatur: 0, totalProposals: 0, unverifiedWarga: 0 }),
    needsSurat ? getSuratList() : Promise.resolve([] as any[]),
    isExecutive ? getDashboardRealtimeStats() : Promise.resolve(null),
    isExecutive ? getVillageProfile() : Promise.resolve(null)
  ]);

  // 1. EXECUTIVE ROLES (Pimpinan & Manajemen Umum)
  if (["ADMIN_DESA", "KADES", "SEKDES", "ADMIN_MASTER"].includes(role)) {
    if (email.includes("operator")) {
      return <OperatorDashboard session={session} stats={stats} />;
    }
    return <ExecutiveDashboard session={session} stats={stats} latestSurat={latestSurat} realtimeStats={realtimeStats} villageProfile={villageProfile} />;
  }

  // 2. PELAYANAN & TATA USAHA (Administrasi Pemerintahan & Petugas)
  if (["KAUR_TU", "KASI_PEMERINTAHAN", "PERANGKAT_DESA", "PETUGAS_SENSUS"].includes(role)) {
    return <PelayananDashboard session={session} stats={stats} />;
  }
  
  if (role === "KASI_PELAYANAN") {
    return <KasiPelayananDashboard session={session} stats={stats} />;
  }

  // 3. PERENCANAAN
  if (role === "KAUR_PERENCANAAN") {
    const isHackerTheme = false;
    return <PerencanaanDashboard session={session} stats={stats} isHackerTheme={isHackerTheme} />;
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
  if (role === "KADUS") {
    return <KadusDashboard session={session} stats={stats} />;
  }
  if (["RT", "RW"].includes(role)) {
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
