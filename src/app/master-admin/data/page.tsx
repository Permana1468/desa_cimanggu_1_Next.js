import { getGlobalResidents, getAllTenantsMinimal, getVillageStructure } from "@/actions/master";
import { ResidentManagementGlobal } from "@/components/master/ResidentManagementGlobal";
import { Users, Database, Activity } from "lucide-react";
import { Suspense } from "react";


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
    let residents: any[] = [];
    let tenants: any[] = [];
    let structure: any = null;

    try {
        const [r, t, s] = await Promise.all([
            getGlobalResidents(),
            getAllTenantsMinimal(),
            getVillageStructure()
        ]);
        residents = r;
        tenants = t;
        structure = s;
    } catch (error) {
        console.warn("Failed to fetch data for static shell rendering:", error);
    }

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
        <div className="bg-white group p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 transition-all hover:shadow-md cursor-default">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} text-white shadow-xs`}>
                <Icon size={22} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
            </div>
        </div>
    );
}

function GlobalDataSkeleton() {
    return (
        <div className="space-y-6 sm:space-y-8 animate-pulse">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-200" />
                        <div className="space-y-2 flex-1">
                            <div className="h-2 w-20 bg-slate-200 rounded" />
                            <div className="h-6 w-16 bg-slate-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
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
