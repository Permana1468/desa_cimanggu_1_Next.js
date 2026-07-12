import { getAuditLogs } from "@/actions/master";
import { History, Terminal, Globe, ShieldAlert, Activity, Command, ShieldCheck, ArrowRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";



export default async function AuditLogsPage({
    searchParams
}: {
    searchParams: Promise<{ category?: string; tenantId?: string }>
}) {
    return (
        <Suspense fallback={<AuditLogsSkeleton />}>
            <AuditLogsContent searchParams={searchParams} />
        </Suspense>
    );
}

async function AuditLogsContent({
    searchParams
}: {
    searchParams: Promise<{ category?: string; tenantId?: string }>
}) {
    const { category, tenantId } = await searchParams;
    let logs: any[] = [];
    try {
        logs = await getAuditLogs(1, 100, category, tenantId);
    } catch (error) {
        console.warn("Failed to fetch data for static shell rendering:", error);
    }
    const activeTab = category === "SECURITY" ? "security" : "general";

    return (
        <div className="space-y-12 pb-20 px-4 md:px-0 animate-in fade-in duration-700">
            {/* EPIC HEADER */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                        <Terminal size={12} /> Forensic & Audit Terminal
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        System <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-600 to-amber-600">Audit Logs</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                        Pantau integritas sistem melalui jejak aktivitas real-time, audit keamanan, dan pemantauan transaksi database di seluruh jaringan desa.
                    </p>
                </div>

                {/* TABS - Epic Style */}
                <div className="flex items-center gap-3 p-2 bg-slate-100 rounded-[2rem] w-fit shadow-inner">
                    <Link 
                        href="/master-admin/logs"
                        className={`px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'general' ? 'bg-white text-slate-950 shadow-xl shadow-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Activity size={18} /> General
                    </Link>
                    <Link 
                        href="/master-admin/logs?category=SECURITY"
                        className={`px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'security' ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/20' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <ShieldAlert size={18} /> Security
                    </Link>
                </div>
            </div>

            {/* LOG CONTENT */}
            <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp / Event</th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Aktor</th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action & Payload</th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ecosystem Node</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Origin IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.length > 0 ? logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${log.category === 'SECURITY' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                                {log.category === 'SECURITY' ? <ShieldAlert size={20} /> : <Command size={20} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{formatRelativeTime(log.createdAt)}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-slate-900/10 group-hover:bg-blue-600 transition-colors">
                                                {log.user?.fullName.charAt(0) || "S"}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-800 leading-tight mb-0.5">{log.user?.fullName || "System Core"}</span>
                                                <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest leading-none">{log.user?.role || "AUTOMATION"}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="space-y-2">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                                log.category === 'SECURITY' 
                                                ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            }`}>
                                                <Activity size={12} /> {log.action.replace(/_/g, ' ')}
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-bold italic line-clamp-1 max-w-[200px]">
                                                {log.entity} • ID: {log.entityId?.substring(0, 12)}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-tight">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                            {log.tenant?.name || "Global Control"}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="inline-flex items-center gap-2 text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                            <Globe size={12} /> {log.ipAddress || "0.0.0.0"}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center space-y-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                            <History size={40} />
                                        </div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Jejak log tidak ditemukan.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* QUICK FOOTER INFO */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 p-10 rounded-[3rem] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/10 shadow-2xl">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <p className="text-lg font-black tracking-tight">Data Integrity Guaranteed</p>
                        <p className="text-slate-400 text-xs font-medium max-w-sm mt-1">Sistem melakukan pencadangan log setiap 6 jam secara otomatis untuk keperluan audit forensik.</p>
                    </div>
                </div>
                <Link href="/master-admin/stats" className="w-full md:w-auto bg-white text-slate-950 px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 relative z-10">
                    Analytics Dashboard <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
}

function AuditLogsSkeleton() {
    return (
        <div className="space-y-12 animate-pulse p-6">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                    <div className="h-10 w-80 bg-slate-200 rounded" />
                </div>
                <div className="h-14 w-64 bg-slate-200 rounded-full" />
            </div>
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl h-[500px]" />
        </div>
    );
}
