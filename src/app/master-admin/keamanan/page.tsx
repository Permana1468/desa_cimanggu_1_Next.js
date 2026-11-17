import { Suspense } from "react";
import { getCyberSecurityOverview } from "@/actions/cyberSecurity";
import { CyberSentryDashboard } from "@/components/master/CyberSentryDashboard";
import { ShieldAlert, Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sentry Cyber Sentinel | Master Admin Desa Cimanggu I",
  description: "Pusat Kendali Pengawasan Keamanan Siber & Deteksi Kecurangan Real-Time",
};

export default async function CyberSecurityPage() {
  return (
    <Suspense fallback={<CyberLoadingSkeleton />}>
      <CyberContent />
    </Suspense>
  );
}

async function CyberContent() {
  let initialData: any = null;
  let errorMsg: string | null = null;

  try {
    initialData = await getCyberSecurityOverview();
  } catch (err: any) {
    console.error("Cyber Security Fetch Error:", err);
    errorMsg = err.message || "Gagal memuat data keamanan.";
  }

  if (errorMsg || !initialData) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-3xl flex items-center gap-4">
          <ShieldAlert className="w-8 h-8 shrink-0 text-rose-600" />
          <div>
            <h3 className="font-bold text-base">Gagal Mengakses Node Keamanan Siber</h3>
            <p className="text-sm opacity-90 mt-1">{errorMsg || "Pastikan Anda masuk sebagai Super Administrator (ADMIN_MASTER)."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto space-y-6">
      <CyberSentryDashboard initialData={initialData} />
    </div>
  );
}

function CyberLoadingSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-800">
        <div className="h-6 w-48 bg-slate-800 rounded-full mb-3" />
        <div className="h-10 w-96 bg-slate-800 rounded-xl mb-4" />
        <div className="h-4 w-2/3 bg-slate-800/60 rounded-lg" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-900/40 rounded-2xl border border-slate-800/50" />
        ))}
      </div>

      {/* Big Mesh Canvas Skeleton */}
      <div className="h-[520px] bg-slate-900/40 rounded-3xl border border-slate-800/50 flex flex-col items-center justify-center gap-3">
        <Cpu className="w-10 h-10 text-slate-700 animate-spin" />
        <span className="text-xs font-mono text-slate-500 tracking-wider">MENGHUBUNGKAN 12 SIMPUL TEKNOLOGI PROYEK (C++ & PYTHON)...</span>
      </div>
    </div>
  );
}
