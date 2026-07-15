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

export function KadusDashboard({ session, stats: initialStats }: { session: any, stats: any }) {
  const dusun = (session?.user as any)?.rw || "Dusun"; 
  const tenantId = (session?.user as any)?.tenantId;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const summary = await getKadusDashboardSummary();
      setData(summary);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

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
