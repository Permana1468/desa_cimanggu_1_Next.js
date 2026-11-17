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
        <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-500">
            {/* 1. CLEAN TITLE & TABS BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-black uppercase tracking-wider mb-2 border border-rose-500/20">
                        <Terminal size={12} /> Forensic & Audit Terminal
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        System <span className="text-rose-600">Audit Logs</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1 max-w-xl">
                        Pantau integritas sistem melalui jejak aktivitas real-time, audit keamanan, dan rekaman aksi pengguna sistem.
                    </p>
                </div>

                {/* TABS - Clean Admin Desa Style */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 w-fit">
                    <Link 
                        href="/master-admin/logs"
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'general' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <Activity size={15} /> General Activity
                    </Link>
                    <Link 
                        href="/master-admin/logs?category=SECURITY"
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'security' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <ShieldAlert size={15} /> Security Protocol
                    </Link>
                </div>
            </div>

            {/* 2. LOG TABLE CONTAINER */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Timestamp / Event</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Authorized Aktor</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action & Payload</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Wilayah / Node</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Origin IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.length > 0 ? logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.category === 'SECURITY' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                                {log.category === 'SECURITY' ? <ShieldAlert size={15} /> : <Command size={15} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">{formatRelativeTime(log.createdAt)}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-black shrink-0">
                                                {log.user?.fullName?.charAt(0) || "S"}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900">{log.user?.fullName || "System Core"}</span>
                                                <span className="text-[10px] text-blue-600 font-bold uppercase">{log.user?.role || "AUTOMATION"}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase ${
                                                log.category === 'SECURITY' 
                                                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                                <Activity size={12} /> {log.action.replace(/_/g, ' ')}
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                                                {log.entity} • ID: {log.entityId?.substring(0, 12)}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-600">{log.tenant?.name || "Global Control"}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-[11px] font-mono text-slate-400">{log.ipAddress || "127.0.0.1"}</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center space-y-2">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto text-slate-300">
                                            <History size={24} />
                                        </div>
                                        <p className="text-slate-400 font-bold text-xs">Jejak log tidak ditemukan.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* QUICK FOOTER INFO */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 p-6 sm:p-8 rounded-3xl text-white overflow-hidden relative border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/10 shadow-sm shrink-0">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <p className="text-base sm:text-lg font-black tracking-tight">Data Integrity Guaranteed</p>
                        <p className="text-slate-400 text-xs font-medium max-w-sm mt-0.5">Sistem melakukan pencadangan log setiap 6 jam secara otomatis untuk keperluan audit forensik.</p>
                    </div>
                </div>
                <Link href="/master-admin/stats" className="w-full md:w-auto bg-white text-slate-950 px-6 sm:px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-sm hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2.5 relative z-10">
                    Analytics Dashboard <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
}

function AuditLogsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                    <div className="h-10 w-80 bg-slate-200 rounded" />
                </div>
                <div className="h-10 w-64 bg-slate-200 rounded-xl" />
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm h-[500px]" />
        </div>
    );
}
