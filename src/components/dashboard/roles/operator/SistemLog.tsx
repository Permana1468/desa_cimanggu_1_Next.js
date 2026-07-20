"use client";

import { Activity, Clock, Search, ShieldAlert, ShieldCheck, Database, HardDrive } from "lucide-react";
import { useState } from "react";

export function SistemLog({ session, initialLogs }: { session: any, initialLogs: any[] }) {
  const [search, setSearch] = useState("");

  const filteredLogs = initialLogs?.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    log.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Log & Keamanan Sistem</h2>
          <p className="text-slate-500 text-sm mt-1">Pantau seluruh aktivitas *user* dan status kesehatan layanan server.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl flex items-center gap-2 border border-emerald-100">
            <ShieldCheck size={16} /> Sistem Aman
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LOG TABLE */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Clock size={18} className="text-indigo-500" /> Audit Log (Real-time)
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari aktivitas..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors w-full md:w-64" 
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-4">Waktu</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-4">Pengguna</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-4">Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs?.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                            <span className="text-xs font-medium text-slate-500">{new Date(log.createdAt).toLocaleString('id-ID')}</span>
                        </td>
                        <td className="py-4 px-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">{log.user?.fullName || "Sistem"}</span>
                                <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">{log.user?.role || "AUTO"}</span>
                            </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">
                            {log.action} <span className="text-slate-400 block text-xs mt-0.5">{JSON.stringify(log.details)}</span>
                        </td>
                    </tr>
                ))}
                {filteredLogs?.length === 0 && (
                    <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-400 text-sm">Tidak ada log yang ditemukan.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" /> Status Layanan Inti
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                 <div className="flex items-center gap-3">
                    <Database size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-600">Database SQL</span>
                 </div>
                 <span className="text-[10px] uppercase tracking-widest font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                 </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                 <div className="flex items-center gap-3">
                    <HardDrive size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-600">File Storage</span>
                 </div>
                 <span className="text-[10px] uppercase tracking-widest font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                 </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
