import { getSystemStats } from "@/app/actions/master";
import { PieChart, TrendingUp, Users, Database, FileText, Zap, Activity, Shield } from "lucide-react";

export default async function StatisticsPage() {
    const stats = await getSystemStats();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-800">System Analytics & Stats</h1>
                <p className="text-slate-500 text-sm">Wawasan mendalam mengenai pertumbuhan platform dan distribusi data.</p>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-500" />
                <StatCard icon={Shield} label="Tenant Desa" value={stats.totalTenants} color="bg-amber-500" />
                <StatCard icon={Database} label="Total Warga" value={stats.totalWarga} color="bg-emerald-500" />
                <StatCard icon={FileText} label="Surat Diterbitkan" value={stats.totalSurat} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* GROWTH CHART MOCK */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-slate-800">Platform Growth (30 Days)</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            <TrendingUp size={14} /> +12.5%
                        </div>
                    </div>
                    
                    <div className="h-[300px] flex items-end gap-2 px-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-slate-100 rounded-t-xl relative group hover:bg-amber-400 transition-all cursor-pointer" style={{ height: `${h}%` }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Day {i+1}: {h*10}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Minggu 1</span>
                        <span>Minggu 2</span>
                        <span>Minggu 3</span>
                        <span>Minggu 4</span>
                    </div>
                </div>

                {/* DISTRIBUTION / HEALTH */}
                <div className="space-y-6">
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                            <Zap size={20} className="text-amber-400" /> System Health
                        </h3>
                        <div className="space-y-6">
                            <HealthMetric label="API Response" value="45ms" progress={95} />
                            <HealthMetric label="Uptime" value="99.99%" progress={99} />
                            <HealthMetric label="Database Load" value="12%" progress={12} />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-blue-500" /> Aktifitas Server
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-bold text-slate-700">Cluster NODE-{i}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Healthy</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200/60 flex flex-col gap-4">
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <Icon size={24} />
            </div>
            <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <p className="text-3xl font-black text-slate-800 mt-1">{value.toLocaleString('id-ID')}</p>
            </div>
        </div>
    )
}

function HealthMetric({ label, value, progress }: { label: string; value: string; progress: number }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>{label}</span>
                <span className="text-white">{value}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
        </div>
    )
}
