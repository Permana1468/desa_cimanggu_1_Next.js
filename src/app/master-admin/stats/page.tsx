import { getSystemStats } from "@/actions/master";
import { getRealtimeSystemHealth } from "@/actions/systemMonitor";
import { 
    Users, Database, FileText, Activity, Server, Cpu, Zap, ArrowUpRight, Layout, HardDrive
} from "lucide-react";
import { VisualStats } from "@/components/master/VisualStatsWrapper";
import { SystemHealthCacheManager } from "@/components/master/SystemHealthCacheManager";
import { RefreshNodeButton } from "@/components/master/RefreshNodeButton";
import { Suspense } from "react";

export default async function StatisticsPage({
    searchParams
}: {
    searchParams: Promise<{ tenantId?: string }>
}) {
    return (
        <Suspense fallback={<StatsSkeleton />}>
            <StatsContent searchParams={searchParams} />
        </Suspense>
    );
}

async function StatsContent({
    searchParams
}: {
    searchParams: Promise<{ tenantId?: string }>
}) {
    const { tenantId } = await searchParams;
    let stats = {
        totalUsers: 0,
        totalTenants: 0,
        totalWarga: 0,
        totalSurat: 0,
        growth: [] as any[],
        demographics: [] as any[]
    };
    let systemHealth: any = null;

    try {
        const [statsData, healthData] = await Promise.all([
            getSystemStats(tenantId),
            getRealtimeSystemHealth()
        ]);
        stats = statsData as any;
        systemHealth = healthData;
    } catch (error) {
        console.warn("Failed to fetch data for static shell rendering:", error);
    }

    return (
        <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-700">
            {/* COMMAND HEADER SYSTEM INTELLIGENCE */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-gradient-to-br from-slate-950 via-[#0a1122] to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-950/20 border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32" />
                <div className="space-y-3 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <Activity size={13} /> Real-time Analytics & System Vitality
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        System <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400">Intelligence</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-xs sm:text-sm max-w-2xl leading-relaxed">
                        Visualisasi mendalam mengenai kesehatan infrastruktur server, beban memori cache, pertumbuhan kependudukan, dan integritas ekosistem desa secara global.
                    </p>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 relative z-10 self-start xl:self-end">
                    <div className="px-3.5 py-1.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status Sinkronisasi</p>
                        <p className="text-xs font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Terhubung Live
                        </p>
                    </div>
                    <RefreshNodeButton />
                </div>
            </div>

            {/* HIGH-END KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <PremiumStatCard icon={Users} label="Total Authorized Users" value={stats.totalUsers} trend="+12% Aktif" color="blue" />
                <PremiumStatCard icon={Layout} label="Active Desa Nodes" value={stats.totalTenants} trend="Stabil (Cimanggu I)" color="amber" />
                <PremiumStatCard icon={Database} label="Global Population" value={stats.totalWarga} trend="Sensus Riil" color="emerald" />
                <PremiumStatCard icon={FileText} label="Digital Documents" value={stats.totalSurat} trend="Terarsip Otomatis" color="purple" />
            </div>

            {/* CACHE GARBAGE COLLECTOR & REALTIME SYSTEM RESOURCE MANAGER */}
            <SystemHealthCacheManager initialData={systemHealth} />

            {/* ADVANCED CHARTS SECTION */}
            <VisualStats 
                growthData={stats.growth} 
                demographicData={stats.demographics} 
            />

            {/* INFRASTRUCTURE SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-1 bg-slate-950/95 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                    
                    <h3 className="text-base sm:text-lg font-black mb-6 flex items-center gap-2.5 relative z-10">
                        <Server size={18} className="text-blue-400" /> Infrastructure Node Status
                    </h3>
                    
                    <div className="space-y-5 relative z-10">
                        <HealthMetric 
                            label="Alokasi Heap Node.js" 
                            value={`${systemHealth?.memory?.heapUsedMb || 0} MB / ${systemHealth?.memory?.heapTotalMb || 0} MB`} 
                            progress={systemHealth?.memory ? Math.round((systemHealth.memory.heapUsedMb / Math.max(1, systemHealth.memory.heapTotalMb)) * 100) : 30} 
                            color="bg-blue-500" 
                        />
                        <HealthMetric 
                            label="RAM Server Terpakai" 
                            value={`${systemHealth?.memory?.osUsagePercent || 0}% (${systemHealth?.memory?.osUsedMemMb || 0} MB)`} 
                            progress={systemHealth?.memory?.osUsagePercent || 25} 
                            color={(systemHealth?.memory?.osUsagePercent || 0) > 80 ? "bg-rose-500" : "bg-emerald-500"} 
                        />
                        <HealthMetric 
                            label="Uptime Server Operasional" 
                            value={`${systemHealth?.serverUptimeHours || 0} Jam`} 
                            progress={100} 
                            color="bg-indigo-500" 
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between relative z-10 text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Cpu size={16} className="text-slate-500" />
                            <span className="font-mono">{systemHealth?.cpu?.cores || 1} CPU Cores</span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                            Linux x64 Active
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3 border-b border-slate-100 pb-5">
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Active Node Services</h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">Layanan mikro yang berjalan pada ekosistem desa</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 self-start md:self-auto">
                            Semua Layanan Berjalan Normal
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {[
                            { name: "C++ Geodesic & Census Core", sub: "Spatial & Demographic Engine", status: "Active (Microseconds)", tag: "C++ Native" },
                            { name: "Python Posyandu AI Engine", sub: "WHO Anthropometry & Stunting", status: "Active (MGRS Z-Score)", tag: "Python AI" },
                            { name: "C++ AHSP RAB Construction", sub: "Permen PUPR & Material Logistik", status: "Active (O(N) Core)", tag: "C++ Native" },
                            { name: "Python MCDM Musrenbang", sub: "TOPSIS Priority Decision Core", status: "Active (Normalized)", tag: "Python AI" },
                        ].map((srv, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/70 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                                        <Zap size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900">{srv.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-medium">{srv.sub}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider block mb-1">
                                        {srv.tag}
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 justify-end">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {srv.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsSkeleton() {
    return (
        <div className="space-y-6 sm:space-y-8 animate-pulse">
            <div className="h-36 bg-slate-200 rounded-3xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-slate-100 rounded-2xl h-36 border border-slate-200/70" />
                ))}
            </div>
            <div className="bg-slate-100 rounded-3xl h-56 border border-slate-200/70" />
            <div className="bg-slate-100 rounded-3xl h-80 border border-slate-200/70" />
        </div>
    );
}

function PremiumStatCard({ icon: Icon, label, value, trend, color }: any) {
    const colors: any = {
        blue: "bg-blue-600 text-white shadow-blue-500/20",
        amber: "bg-amber-600 text-white shadow-amber-500/20",
        emerald: "bg-emerald-600 text-white shadow-emerald-500/20",
        purple: "bg-indigo-600 text-white shadow-indigo-500/20"
    };

    return (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 group hover:shadow-md hover:border-slate-300 transition-all cursor-default flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 ${colors[color]} rounded-xl flex items-center justify-center shadow-xs`}>
                    <Icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100/90 px-2.5 py-1 rounded-full border border-slate-200/60">{trend}</span>
            </div>
            <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{label}</span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">{(value || 0).toLocaleString('id-ID')}</p>
            </div>
        </div>
    );
}

function HealthMetric({ label, value, progress, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end text-xs">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="text-sm font-black text-white mt-0.5">{value}</p>
                </div>
                <span className="font-mono text-xs font-bold text-blue-400">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <div 
                    className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
                    style={{ width: `${Math.min(100, Math.max(progress, 4))}%` }} 
                />
            </div>
        </div>
    );
}
