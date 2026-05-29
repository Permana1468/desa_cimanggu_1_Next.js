import { getGlobalResidents, getAllTenantsMinimal, getVillageStructure } from "@/actions/master";
import { ResidentManagementGlobal } from "@/components/master/ResidentManagementGlobal";
import { Users, Database, Activity } from "lucide-react";
import { Suspense } from "react";

// Enable instant client navigation validation to prevent page navigation blocking
export const unstable_instant = { prefetch: "static" };

export default async function GlobalDataPage() {
    return (
        <div className="space-y-10 pb-20 px-4 md:px-0">
            {/* HEADER */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                        <Database size={12} /> Master Data Control
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                        Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Kependudukan</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                        Manajemen data warga terpusat lintas desa dengan sistem integrasi data otomatis dan pemantauan demografi real-time.
                    </p>
                </div>
            </div>

            {/* DYNAMIC CONTENT STREAMED BEHIND SKELETON */}
            <Suspense fallback={<GlobalDataSkeleton />}>
                <GlobalDataContent />
            </Suspense>
        </div>
    );
}

async function GlobalDataContent() {
    const [residents, tenants, structure] = await Promise.all([
        getGlobalResidents(),
        getAllTenantsMinimal(),
        getVillageStructure()
    ]);

    const stats = {
        total: residents.length,
        laki: residents.filter(r => r.jenisKelamin === 'LAKI_LAKI').length,
        perempuan: residents.filter(r => r.jenisKelamin === 'PEREMPUAN').length,
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <StatCard label="Total Populasi" value={stats.total.toLocaleString()} icon={Users} gradient="from-blue-600 to-indigo-700" />
                <StatCard label="Laki-Laki" value={stats.laki.toLocaleString()} icon={Activity} gradient="from-emerald-500 to-teal-600" />
                <StatCard label="Perempuan" value={stats.perempuan.toLocaleString()} icon={Activity} gradient="from-rose-500 to-pink-600" />
            </div>

            {/* MAIN INTERFACE */}
            <ResidentManagementGlobal 
                initialResidents={residents as any} 
                tenants={tenants} 
                villageStructure={structure}
            />
        </div>
    );
}

function StatCard({ label, value, icon: Icon, gradient }: { label: string; value: string; icon: any; gradient: string }) {
    return (
        <div className="bg-white group p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-95">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} text-white shadow-lg shadow-current/20 group-hover:rotate-6 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{label}</p>
                <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
            </div>
        </div>
    );
}

function GlobalDataSkeleton() {
    return (
        <div className="space-y-10">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 animate-pulse">
                        <div className="w-14 h-14 rounded-2xl bg-slate-200" />
                        <div className="space-y-2 flex-1">
                            <div className="h-2 w-20 bg-slate-200 rounded" />
                            <div className="h-6 w-16 bg-slate-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden animate-pulse">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="h-10 w-48 bg-slate-200 rounded-full" />
                    <div className="flex gap-4">
                        <div className="h-10 w-32 bg-slate-200 rounded-full" />
                        <div className="h-10 w-32 bg-slate-200 rounded-full" />
                    </div>
                </div>
                <div className="p-8 space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                                <div className="space-y-2">
                                    <div className="h-4 w-36 bg-slate-200 rounded" />
                                    <div className="h-3 w-24 bg-slate-200 rounded" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-28 bg-slate-200 rounded" />
                                <div className="h-3 w-16 bg-slate-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
