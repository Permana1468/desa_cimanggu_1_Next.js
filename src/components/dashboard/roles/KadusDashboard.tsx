"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Users, MapPin, FileText, AlertTriangle, TrendingUp, Search, 
  ChevronRight, Building, Plus, Trash2, Home as HomeIcon,
  ShieldCheck, ArrowRight, Loader2, Info, UserPlus, FileSignature, AlertCircle, HardHat, HeartPulse, Map
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getKadusDashboardSummary } from "@/actions/kadus";
import { formatDusun } from "@/lib/formatters";
import { PhysicalMutationAlertBanner } from "@/components/dashboard/mutasi/PhysicalMutationAlertBanner";

export function KadusDashboard({ session, stats: initialStats }: { session: any, stats: any }) {
  const dusun = (session?.user as any)?.rw || "Dusun"; 
  const tenantId = (session?.user as any)?.tenantId;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (showLoading = true) => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    if (showLoading) setLoading(true);
    try {
      const summary = await getKadusDashboardSummary();
      setData(summary);
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);

    const handleRefresh = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      fetchData(false);
    };
    window.addEventListener("refresh-notifications", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("desa_cimanggu_realtime_sync");
        bc.onmessage = () => {
          fetchData(false);
        };
      } catch (e) {}
    }

    const interval = setInterval(handleRefresh, 25000);
    return () => {
      window.removeEventListener("refresh-notifications", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, []);


  if (loading || !data) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        <p className="text-slate-400 mt-4 font-medium animate-pulse">Memuat dashboard {dusun}...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Kepala {formatDusun(dusun)}</h2>
          <p className="text-sm text-slate-500 mt-1">Sistem Informasi Manajemen Wilayah {formatDusun(dusun)} Terintegrasi</p>
        </div>
      </div>

      {/* Peringatan Wajib Pembaruan Berkas Fisik Dusun */}
      <PhysicalMutationAlertBanner 
        role="KADUS" 
        userRw={dusun} 
        onMutationUpdated={fetchData} 
      />

      {/* QUICK ACTIONS FOR MOBILE/DESKTOP */}
      <div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Fitur Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <QuickActionCard href="/dashboard/warga" icon={UserPlus} label="Tambah Warga" color="bg-blue-500" />
            <QuickActionCard href="/dashboard/surat" icon={FileSignature} label="Buat Surat" color="bg-emerald-500" />
            <QuickActionCard href="/dashboard/bansos" icon={HeartPulse} label="Data Bansos" color="bg-pink-500" />
            <QuickActionCard href="/dashboard/map" icon={Map} label="Peta Dusun" color="bg-amber-500" />
            <QuickActionCard href="/dashboard/keamanan" icon={ShieldCheck} label="Lapor Trantibum" color="bg-red-500" />
            <QuickActionCard href="/dashboard/infrastruktur" icon={HardHat} label="Proyek Desa" color="bg-indigo-500" />
        </div>
      </div>

      {/* SUMMARY WIDGETS */}
      <div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Ringkasan Statistik</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatWidget icon={Users} label="Total Warga" value={data.totalWarga} suffix="Jiwa" color="text-teal-600" bg="bg-teal-50" />
            <StatWidget icon={HomeIcon} label="Keluarga (KK)" value={data.totalKeluarga} suffix="KK" color="text-blue-600" bg="bg-blue-50" />
            <StatWidget icon={HeartPulse} label="Penerima Bansos" value={data.totalBansos} suffix="Warga" color="text-pink-600" bg="bg-pink-50" />
            <StatWidget icon={ShieldCheck} label="Laporan Trantibum" value={data.totalKeamanan} suffix="Kasus" color="text-red-600" bg="bg-red-50" />
            <StatWidget icon={AlertCircle} label="Balita Stunting" value={data.totalPosyanduStunting} suffix="Balita" color="text-amber-600" bg="bg-amber-50" />
            <StatWidget icon={HardHat} label="Proyek Infrastruktur" value={data.totalProyek} suffix="Proyek" color="text-indigo-600" bg="bg-indigo-50" />
        </div>
      </div>

      {/* REKAPITULASI MUTASI KEPENDUDUKAN & LAMPID TINGKAT DUSUN */}
      {data.lampidSummary && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-base font-black text-slate-800 tracking-tight">
                  Rekapitulasi Mutasi Kependudukan (LAMPID) Wilayah {formatDusun(dusun)}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Data pergerakan warga bulan {new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(data.lampidSummary.tahun, data.lampidSummary.bulan - 1))} {data.lampidSummary.tahun} lintas RW binaan
              </p>
            </div>
            <div className="flex items-center gap-2">
              {data.lampidSummary.pendingFisikCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {data.lampidSummary.pendingFisikCount} Menunggu Berkas Fisik
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Semua Berkas Fisik Sinkron
                </span>
              )}
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Kelahiran (Lahir)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-emerald-950">+{data.lampidSummary.lahir}</span>
                <span className="text-xs font-bold text-emerald-600">Jiwa</span>
              </div>
            </div>
            <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-4">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Kematian (Mati)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-rose-950">-{data.lampidSummary.mati}</span>
                <span className="text-xs font-bold text-rose-600">Jiwa</span>
              </div>
            </div>
            <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4">
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">Kedatangan (Masuk)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-sky-950">+{data.lampidSummary.datang}</span>
                <span className="text-xs font-bold text-sky-600">Jiwa</span>
              </div>
            </div>
            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Kepindahan (Keluar)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-amber-950">-{data.lampidSummary.pindah}</span>
                <span className="text-xs font-bold text-amber-600">Jiwa</span>
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-slate-900 text-white rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Pertumbuhan Bersih</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-white">
                  {data.lampidSummary.mutasiNetto > 0 ? `+${data.lampidSummary.mutasiNetto}` : data.lampidSummary.mutasiNetto}
                </span>
                <span className="text-xs font-bold text-slate-400">Netto</span>
              </div>
            </div>
          </div>

          {/* RW Breakdown Table */}
          {data.lampidSummary.perRw && data.lampidSummary.perRw.length > 0 && (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Wilayah RW</th>
                    <th className="py-2.5 px-3 text-center text-emerald-700">Lahir (+)</th>
                    <th className="py-2.5 px-3 text-center text-rose-700">Mati (-)</th>
                    <th className="py-2.5 px-3 text-center text-sky-700">Datang (+)</th>
                    <th className="py-2.5 px-3 text-center text-amber-700">Pindah (-)</th>
                    <th className="py-2.5 px-3 text-center text-slate-800">Saldo Mutasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {data.lampidSummary.perRw.map((r: any) => {
                    const netto = (r.lahir + r.datang) - (r.mati + r.pindah);
                    return (
                      <tr key={r.rw} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 px-3 font-bold text-slate-800">RW {r.rw}</td>
                        <td className="py-2 px-3 text-center font-semibold text-emerald-600">+{r.lahir}</td>
                        <td className="py-2 px-3 text-center font-semibold text-rose-600">-{r.mati}</td>
                        <td className="py-2 px-3 text-center font-semibold text-sky-600">+{r.datang}</td>
                        <td className="py-2 px-3 text-center font-semibold text-amber-600">-{r.pindah}</td>
                        <td className="py-2 px-3 text-center font-black text-slate-800">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${netto > 0 ? "bg-emerald-100 text-emerald-800" : netto < 0 ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-600"}`}>
                            {netto > 0 ? `+${netto}` : netto}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Demografi Gender">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.charts.genderData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Demografi Usia">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.ageData}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.charts.ageData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Statistik Pendidikan (Top 5)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.eduData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {data.charts.eduData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Statistik Pekerjaan (Top 5)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.occData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {data.charts.occData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function QuickActionCard({ href, icon: Icon, label, color }: { href: string, icon: any, label: string, color: string }) {
    return (
        <Link href={href} className="group block bg-white border border-slate-200 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:border-slate-300">
            <div className={`w-12 h-12 mx-auto ${color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <p className="text-xs font-bold text-slate-700">{label}</p>
        </Link>
    )
}

function StatWidget({ icon: Icon, label, value, suffix, color, bg }: { icon: any, label: string, value: number, suffix: string, color: string, bg: string }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
            </div>
            <div>
                <h4 className="text-2xl font-black text-slate-800">{value} <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{suffix}</span></h4>
                <p className="text-xs font-bold text-slate-500 mt-1">{label}</p>
            </div>
        </div>
    )
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">{title}</h3>
            <div className="h-[300px] w-full">
                {children}
            </div>
        </div>
    )
}
