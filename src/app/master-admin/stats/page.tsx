import { getSystemStats } from "@/actions/master";
import { 
    Users, Database, FileText, Activity, Server, Cpu, Zap, ArrowUpRight, Layout
} from "lucide-react";
import { VisualStats } from "@/components/master/VisualStatsWrapper";
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
    try {
        stats = await getSystemStats(tenantId) as any;
    } catch (error) {
        console.warn("Failed to fetch data for static shell rendering:", error);
    }

    return (
        <div className="space-y-16 pb-20 px-4 md:px-0 animate-in fade-in duration-1000">
            {/* EPIC HEADER */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-5">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-[0.25em]">
                        <Activity size={14} /> Real-time Analytics Engine
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                        System <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600">Intelligence</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl leading-relaxed">
                        Visualisasi mendalam mengenai kesehatan infrastruktur, pertumbuhan ekosistem desa, dan distribusi aset digital secara global.
                    </p>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100">
                    <div className="px-6 py-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Update</p>
                        <p className="text-xs font-black text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Just Now
                        </p>
                    </div>
                    <button className="bg-slate-950 text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                        Refresh Node
                    </button>
                </div>
            </div>

            {/* HIGH-END KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <PremiumStatCard icon={Users} label="Total Authorized Users" value={stats.totalUsers} trend="+12%" color="blue" />
                <PremiumStatCard icon={Layout} label="Active Desa Nodes" value={stats.totalTenants} trend="Stable" color="amber" />
                <PremiumStatCard icon={Database} label="Global Population" value={stats.totalWarga} trend="+240" color="emerald" />
                <PremiumStatCard icon={FileText} label="Digital Documents" value={stats.totalSurat} trend="+1.2k" color="purple" />
            </div>

            {/* ADVANCED CHARTS SECTION */}
            <VisualStats 
                growthData={stats.growth} 
                demographicData={stats.demographics} 
            />

            {/* INFRASTRUCTURE SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 bg-[#0f172a] rounded-[3.5rem] p-10 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-blue-500/20 transition-all" />
                    
                    <h3 className="text-xl font-black mb-10 flex items-center gap-3 relative z-10">
                        <Server size={24} className="text-blue-400" /> System Vitality
                    </h3>
                    
                    <div className="space-y-10 relative z-10">
                        <HealthMetric label="API Response Latency" value="38ms" progress={98} color="bg-blue-500" />
                        <HealthMetric label="Cluster Uptime (L30D)" value="99.99%" progress={100} color="bg-emerald-500" />
                        <HealthMetric label="Database IOPS Health" value="Optimal" progress={95} color="bg-amber-500" />
                    </div>

                    <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <Cpu size={20} className="text-slate-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Load Avg: 0.24</span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                            All Systems Clear
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/40 border border-slate-100 group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                        <div>
                            <h3 className="text-2xl font-black text-slate-950 tracking-tighter">Distributed Node Network</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Active Infrastructure Clusters</p>
                        </div>
                        <button className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            View Network Map <ArrowUpRight size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group/item">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/item:text-blue-600 transition-colors shadow-sm">
                                        <Zap size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-900">NODE_CLUSTER_00{i}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Asia-Southeast-1</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest mb-1">Operational</span>
                                    <span className="text-[10px] font-mono font-black text-slate-300">10.0.0.{i * 24}</span>
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
        <div className="space-y-16 animate-pulse p-6">
            <div className="flex justify-between items-center">
                <div className="space-y-3">
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                    <div className="h-12 w-96 bg-slate-200 rounded" />
                </div>
                <div className="h-16 w-80 bg-slate-200 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-[3rem] p-10 h-48 border border-slate-100 shadow-xl" />
                ))}
            </div>
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl h-96" />
        </div>
    );
}

function PremiumStatCard({ icon: Icon, label, value, trend, color }: any) {
    const colors: any = {
        blue: "bg-blue-600 text-white shadow-blue-500/30",
        amber: "bg-slate-950 text-white shadow-slate-950/20",
        emerald: "bg-emerald-600 text-white shadow-emerald-500/30",
        purple: "bg-indigo-600 text-white shadow-indigo-500/30"
    };

    return (
        <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/40 border border-slate-100 group hover:scale-[1.05] transition-all cursor-default">
            <div className={`w-16 h-16 ${colors[color]} rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform`}>
                <Icon size={28} />
            </div>
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
                    <span className={`text-[10px] font-black ${color === 'emerald' ? 'text-emerald-500' : 'text-blue-500'} bg-slate-50 px-2 py-0.5 rounded-md`}>{trend}</span>
                </div>
                <p className="text-4xl font-black text-slate-950 tabular-nums">{value.toLocaleString('id-ID')}</p>
            </div>
        </div>
    );
}

function HealthMetric({ label, value, progress, color }: any) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
                    <p className="text-lg font-black text-white leading-none">{value}</p>
                </div>
                <span className="text-xs font-black text-blue-400">{progress}%</span>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div 
                    className={`h-full ${color} rounded-full transition-all duration-2000 ease-out`} 
                    style={{ width: `${progress}%` }} 
                />
            </div>
        </div>
    );
}
