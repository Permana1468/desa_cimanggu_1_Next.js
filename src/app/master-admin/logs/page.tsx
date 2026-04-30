import { getAuditLogs } from "@/app/actions/master";
import { History, Activity, Terminal, Globe, User as UserIcon } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default async function AuditLogsPage() {
    const logs = await getAuditLogs();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-800">System Audit Logs</h1>
                <p className="text-slate-500 text-sm">Pemantauan real-time seluruh aktivitas database dan perubahan sistem.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                                <th className="pb-4 pl-4">Waktu</th>
                                <th className="pb-4">Aktor</th>
                                <th className="pb-4">Aksi</th>
                                <th className="pb-4">Entitas</th>
                                <th className="pb-4">IP / Perangkat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                            <History size={14} className="text-amber-500" />
                                            {formatRelativeTime(log.createdAt)}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                <UserIcon size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700">{log.user?.fullName || "Sistem"}</span>
                                                <span className="text-[9px] text-amber-600 font-bold uppercase">{log.user?.role || "SYSTEM"}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black uppercase border border-blue-100">
                                            <Terminal size={12} /> {log.action.replace(/_/g, ' ')}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="text-xs font-medium text-slate-600">{log.entity}</span>
                                        <p className="text-[9px] text-slate-400 font-medium">ID: {log.entityId?.substring(0, 8)}...</p>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                            <Globe size={12} /> {log.ipAddress || "127.0.0.1"}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
