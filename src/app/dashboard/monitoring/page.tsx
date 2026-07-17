"use client";

import { useEffect, useState } from "react";
import { getAuditLogs } from "@/actions/master";
import { useSession } from "next-auth/react";
import { Activity, Search, Filter, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function OperatorMonitoringPage() {
    const { data: session } = useSession();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

    const loadLogs = async () => {
        setIsLoading(true);
        // Using getAuditLogs from master actions. In a real app we might want to filter only OPERATOR_DESA roles
        const data = await getAuditLogs(page, 50, undefined, session?.user?.tenantId);
        setLogs(data);
        setIsLoading(false);
    };

    useEffect(() => {
        if (session?.user?.tenantId) {
            loadLogs();
        }
    }, [session, page]);


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 rounded-[1.25rem] flex items-center justify-center text-indigo-600 shadow-inner">
                        <Activity size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Analitik & Monitoring</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Pantau aktivitas operator desa secara real-time.</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats / Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white rounded-xl text-emerald-500 shadow-sm"><ShieldCheck size={20} /></div>
                        <h3 className="text-sm font-black text-emerald-800">Sistem Aman</h3>
                    </div>
                    <p className="text-xs text-emerald-600 font-medium leading-relaxed">Seluruh aktivitas entri data tercatat dalam sistem audit untuk transparansi.</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm"><CheckCircle2 size={20} /></div>
                        <h3 className="text-sm font-black text-blue-800">Log Aktivitas (Audit Trail)</h3>
                    </div>
                    <p className="text-xs text-blue-600 font-medium leading-relaxed">Jejak digital seluruh tindakan krusial. Gunakan tabel di bawah untuk melihat siapa yang merubah data kependudukan, status persuratan, atau konfigurasi sistem.</p>
                </div>
            </div>

            {/* Log Table */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h2 className="text-xl font-black text-slate-800">Riwayat Sistem (Realtime)</h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input placeholder="Cari aktivitas..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all w-64" />
                        </div>
                        <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                                <th className="pb-4 pl-4">Waktu</th>
                                <th className="pb-4">Aktor (User)</th>
                                <th className="pb-4">Aksi / Modul</th>
                                <th className="pb-4">Target Entitas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr><td colSpan={4} className="py-12 text-center text-slate-400 text-sm font-medium animate-pulse">Memuat log sistem...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={4} className="py-12 text-center text-slate-400 text-sm font-medium">Belum ada aktivitas tercatat.</td></tr>
                            ) : logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 pl-4">
                                        <div className="font-bold text-slate-700 text-sm">{new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.createdAt).toLocaleDateString('id-ID')}</div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">
                                                {log.user?.fullName?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{log.user?.fullName || "Sistem"}</div>
                                                <div className="text-[10px] font-black text-indigo-600 tracking-widest uppercase bg-indigo-50 inline-block px-2 py-0.5 rounded">{log.user?.role || "AUTO"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="font-bold text-slate-600 text-xs font-mono bg-slate-50 p-2 rounded-lg inline-block border border-slate-100">
                                            {log.entity} {log.entityId ? `[${log.entityId.substring(0,8)}]` : ''}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-6 flex justify-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50">Prev</button>
                    <span className="px-4 py-2 text-xs font-bold text-slate-400">Hal {page}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 50} className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
}
