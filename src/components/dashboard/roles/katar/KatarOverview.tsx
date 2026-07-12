"use client";

import React, { useState, useEffect } from "react";
import { Users, Banknote, Activity, Mail } from "lucide-react";
import { getKatarOverviewStats, getKatarPrograms } from "@/actions/katar";

export function KatarOverview({ session }: { session: any }) {
  const [stats, setStats] = useState({ totalMembers: 0, saldoKas: 0, programBerjalan: 0, totalSurat: 0 });
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [s, p] = await Promise.all([getKatarOverviewStats(), getKatarPrograms()]);
      setStats(s);
      setPrograms(p.filter((x: any) => x.status === "Berjalan").slice(0, 3));
      setLoading(false);
    }
    load();
  }, []);

  const fmt = (n: number) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Anggota Aktif", value: loading ? "..." : stats.totalMembers, icon: Users, color: "blue" },
          { label: "Saldo Kas", value: loading ? "..." : fmt(stats.saldoKas), icon: Banknote, color: "emerald" },
          { label: "Program Berjalan", value: loading ? "..." : stats.programBerjalan, icon: Activity, color: "indigo" },
          { label: "Total Surat", value: loading ? "..." : stats.totalSurat, icon: Mail, color: "amber" },
        ].map((item) => (
          <div key={item.label} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center shrink-0`}>
              <item.icon size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{item.label}</span>
              <span className="text-xl font-black text-slate-800 leading-none">{String(item.value)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-800 mb-6">Program Kerja Aktif</h2>
          {loading ? (
            <p className="text-slate-400 text-sm">Memuat data...</p>
          ) : programs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto text-slate-200 mb-3" size={40} />
              <p className="text-slate-400 font-medium text-sm">Belum ada program kerja berjalan.</p>
              <p className="text-slate-300 text-xs">Buka menu <strong>Proker</strong> untuk menambahkan program kerja.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {programs.map((p) => (
                <div key={p.id} className="p-4 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">{p.title}</h4>
                    <span className="text-xs font-bold text-blue-600">{p.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                    <span>{p.panitia} Panitia</span>
                    {p.startDate && <span>Mulai: {new Date(p.startDate).toLocaleDateString("id-ID")}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 blur-[50px] rounded-full -mr-24 -mt-24" />
          <h2 className="text-lg font-black mb-4 relative z-10">Tentang Organisasi</h2>
          <div className="space-y-3 relative z-10">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
              <h4 className="font-bold text-amber-300 text-sm mb-1">Karang Taruna</h4>
              <p className="text-xs text-slate-300 leading-relaxed">Organisasi kepemudaan desa yang bertugas menyelenggarakan usaha kesejahteraan sosial dan pengembangan generasi muda.</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
              <h4 className="font-bold text-emerald-300 text-sm mb-1">Periode Kepengurusan</h4>
              <p className="text-xs text-slate-300 leading-relaxed">Tahun 2024 – 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
