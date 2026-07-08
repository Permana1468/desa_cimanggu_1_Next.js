"use client";

import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { PosyanduBalitaTab } from "../posyandu/PosyanduBalitaTab";
import { PosyanduIbuHamilTab } from "../posyandu/PosyanduIbuHamilTab";
import { PosyanduLansiaTab } from "../posyandu/PosyanduLansiaTab";
import { PosyanduLayananBalitaTab } from "../posyandu/PosyanduLayananBalitaTab";
import { PosyanduLayananIbuHamilTab } from "../posyandu/PosyanduLayananIbuHamilTab";
import { PosyanduLayananLansiaTab } from "../posyandu/PosyanduLayananLansiaTab";
import { PosyanduJadwalTab } from "../posyandu/PosyanduJadwalTab";
import { PosyanduKehadiranTab } from "../posyandu/PosyanduKehadiranTab";
import { PosyanduAnalisisTab } from "../posyandu/PosyanduAnalisisTab";
import {
  Activity, AlertTriangle, Baby, Calendar, HeartPulse, Plus,
  FileText, Users, Stethoscope, ClipboardList, CheckCircle2,
  TrendingUp, TrendingDown, ArrowRight, Clock, MapPin, ShieldAlert,
  BarChart3, Sparkles
} from "lucide-react";
import { getPosyanduDashboardStats, exportPosyanduReport } from "@/actions/posyandu";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const CHART_COLORS = {
  teal:   "#0d9488",
  pink:   "#ec4899",
  indigo: "#6366f1",
  amber:  "#f59e0b",
  rose:   "#f43f5e",
  slate:  "#94a3b8",
};

export function PosyanduDashboard({ session }: any) {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PosyanduDashboardContent session={session} />
    </Suspense>
  );
}

function PosyanduDashboardContent({ session }: any) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (activeTab === "overview") fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getPosyanduDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch posyandu stats", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const csvData = await exportPosyanduReport();
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Laporan_Posyandu_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Gagal mengunduh laporan.");
    } finally {
      setExporting(false);
    }
  };

  const totalSasaran = (stats?.totalBalita || 0) + (stats?.totalIbuHamil || 0) + (stats?.totalLansia || 0);
  const stuntingRate = stats?.totalBalita
    ? ((stats.stuntingBalita / stats.totalBalita) * 100).toFixed(1)
    : "0";

  // Dynamic statusGiziData calculations
  const normalGizi = stats?.giziStats?.normal || 0;
  const kurangGizi = stats?.giziStats?.kurang || 0;
  const stuntingGizi = stats?.stuntingBalita || 0;
  const lebihGizi = stats?.giziStats?.lebih || 0;
  const totalRecordsGizi = normalGizi + kurangGizi + stuntingGizi + lebihGizi;

  const statusGiziData = totalRecordsGizi > 0 ? [
    { name: "Normal", value: Math.round((normalGizi / totalRecordsGizi) * 100), color: CHART_COLORS.teal },
    { name: "Gizi Kurang", value: Math.round((kurangGizi / totalRecordsGizi) * 100), color: CHART_COLORS.amber },
    { name: "Stunting", value: Math.round((stuntingGizi / totalRecordsGizi) * 100), color: CHART_COLORS.rose },
    { name: "Gizi Lebih", value: Math.round((lebihGizi / totalRecordsGizi) * 100), color: CHART_COLORS.indigo },
  ] : [
    { name: "Normal", value: 100, color: CHART_COLORS.teal },
    { name: "Gizi Kurang", value: 0, color: CHART_COLORS.amber },
    { name: "Stunting", value: 0, color: CHART_COLORS.rose },
    { name: "Gizi Lebih", value: 0, color: CHART_COLORS.indigo },
  ];

  // Kehadiran tren
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const currentYear = new Date().getFullYear();
  const attendanceChartMap: Record<string, { name: string; balita: number; ibuHamil: number; lansia: number }> = {};
  monthLabels.forEach(m => {
    attendanceChartMap[m] = { name: m, balita: 0, ibuHamil: 0, lansia: 0 };
  });

  if (stats?.kehadiranList) {
    stats.kehadiranList.forEach((k: any) => {
      const date = new Date(k.tanggal);
      if (date.getFullYear() === currentYear && k.hadir) {
        const mLabel = monthLabels[date.getMonth()];
        if (k.kategori === "Balita") {
          attendanceChartMap[mLabel].balita += 1;
        } else if (k.kategori === "Ibu Hamil") {
          attendanceChartMap[mLabel].ibuHamil += 1;
        } else if (k.kategori === "Lansia") {
          attendanceChartMap[mLabel].lansia += 1;
        }
      }
    });
  }
  const dynamicKehadiranChart = monthLabels.map(m => attendanceChartMap[m]).slice(-6); // Last 6 months

  const agendaHariIni = stats?.activeJadwals || [];
  const totalHadir = stats?.kehadiranList?.filter((k: any) => k.hadir).length || 0;
  const totalTidakHadir = stats?.kehadiranList?.filter((k: any) => !k.hadir).length || 0;

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && (
            <div className="space-y-6">

              {/* ---- HERO BANNER ---- */}
              <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-teal-900/30 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-white/20 backdrop-blur-sm">
                        <Activity size={12} className="animate-pulse" /> Dashboard Kader Aktif
                      </div>
                      <h1 className="text-3xl font-black mb-2 leading-tight">
                        Posyandu Desa Cimanggu I
                      </h1>
                      <p className="text-teal-100/90 text-sm max-w-lg leading-relaxed">
                        Selamat datang, <strong>{session?.user?.fullName || "Kader"}</strong>. 
                        Pantau kondisi kesehatan balita, ibu hamil, dan lansia secara real-time dari satu dashboard terpadu.
                      </p>
                      {/* Quick stats bar */}
                      <div className="flex flex-wrap gap-4 mt-5">
                        {[
                          { label: "Total Sasaran", val: totalSasaran },
                          { label: "Balita Terdaftar", val: stats?.totalBalita ?? "-" },
                          { label: "Ibu Hamil", val: stats?.totalIbuHamil ?? "-" },
                          { label: "Lansia", val: stats?.totalLansia ?? "-" },
                        ].map((s) => (
                          <div key={s.label} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5">
                            <p className="text-[10px] text-teal-200 font-bold uppercase tracking-wider">{s.label}</p>
                            <p className="text-xl font-black">{s.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        {exporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileText size={16} />}
                        Export Laporan Format 1-7
                      </button>
                      <Link
                        href="/dashboard?tab=layanan-balita"
                        className="bg-white text-teal-700 hover:bg-teal-50 px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-teal-900/20 text-center"
                      >
                        <Plus size={16} /> Input Pelayanan Baru
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* ---- LOADING STATE ---- */}
              {loading && (
                <div className="p-12 flex justify-center">
                  <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading && (
                <>
                  {/* ---- SECTION 1: KPI CARDS ---- */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Total Balita", val: stats?.totalBalita ?? 0,
                        sub: `${stats?.stuntingBalita ?? 0} stunting terdeteksi`,
                        icon: Baby, bg: "bg-blue-50", color: "text-blue-600",
                        trend: "up", href: "/dashboard?tab=balita"
                      },
                      {
                        label: "Ibu Hamil", val: stats?.totalIbuHamil ?? 0,
                        sub: "terdaftar aktif",
                        icon: HeartPulse, bg: "bg-pink-50", color: "text-pink-600",
                        trend: "up", href: "/dashboard?tab=ibuhamil"
                      },
                      {
                        label: "Lansia", val: stats?.totalLansia ?? 0,
                        sub: "dalam pemantauan",
                        icon: Users, bg: "bg-indigo-50", color: "text-indigo-600",
                        trend: "neutral", href: "/dashboard?tab=lansia"
                      },
                      {
                        label: "Kasus Stunting", val: stats?.stuntingBalita ?? 0,
                        sub: `${stuntingRate}% dari total balita`,
                        icon: AlertTriangle, bg: "bg-rose-50", color: "text-rose-600",
                        trend: "down", href: "/dashboard?tab=analisis"
                      },
                      {
                        label: "Layanan Balita", val: stats?.layananBalitaCount ?? 0,
                        sub: "total layanan diberikan",
                        icon: Stethoscope, bg: "bg-teal-50", color: "text-teal-600",
                        trend: "up", href: "/dashboard?tab=layanan-balita"
                      },
                      {
                        label: "Layanan Ibu Hamil", val: stats?.layananIbuHamilCount ?? 0,
                        sub: "total layanan diberikan",
                        icon: HeartPulse, bg: "bg-pink-50", color: "text-pink-600",
                        trend: "up", href: "/dashboard?tab=layanan-ibuhamil"
                      },
                      {
                        label: "Jadwal Aktif", val: stats?.totalJadwal ?? 0,
                        sub: "kegiatan terencana",
                        icon: ClipboardList, bg: "bg-amber-50", color: "text-amber-600",
                        trend: "neutral", href: "/dashboard?tab=jadwal"
                      },
                      {
                        label: "Rekap Kehadiran", val: stats?.kehadiranList?.length ?? 0,
                        sub: "peserta tercatat",
                        icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600",
                        trend: "neutral", href: "/dashboard?tab=kehadiran"
                      },
                    ].map((card, i) => (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link href={card.href} className="block group">
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all h-full">
                            <div className="flex items-start justify-between mb-4">
                              <div className={`w-11 h-11 ${card.bg} rounded-xl flex items-center justify-center ${card.color}`}>
                                <card.icon size={20} />
                              </div>
                              <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                                card.trend === "up" ? "bg-green-50 text-green-600" :
                                card.trend === "down" ? "bg-red-50 text-red-600" :
                                "bg-slate-50 text-slate-500"
                              }`}>
                                {card.trend === "up" ? <TrendingUp size={11} /> : card.trend === "down" ? <TrendingDown size={11} /> : null}
                              </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{card.label}</p>
                            <p className="text-2xl font-black text-slate-800">{card.val}</p>
                            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 group-hover:text-teal-600 transition-colors">
                              {card.sub} <ArrowRight size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* ---- SECTION 2: CHARTS GRID ---- */}
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                    {/* Bar chart pertumbuhan balita */}
                    <div className="xl:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">Grafik Pertumbuhan Balita</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Rata-rata berat & tinggi badan per bulan (kg / cm)</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-teal-600 font-semibold bg-teal-50 px-3 py-1 rounded-full">
                          <BarChart3 size={12} /> Tahun Ini
                        </div>
                      </div>
                      <div className="h-[260px]">
                        {stats?.chartData && stats.chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dy={8} />
                              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                              <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,.1)" }}
                                cursor={{ fill: "#f8fafc" }}
                              />
                              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "16px" }} />
                              <Bar yAxisId="left" dataKey="beratRataRata" name="Berat (Kg)" fill={CHART_COLORS.teal} radius={[5, 5, 0, 0]} maxBarSize={32} />
                              <Bar yAxisId="right" dataKey="tinggiRataRata" name="Tinggi (Cm)" fill={CHART_COLORS.slate} radius={[5, 5, 0, 0]} maxBarSize={32} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center gap-3">
                            <BarChart3 className="w-12 h-12 text-slate-200" />
                            <p className="text-slate-400 text-sm">Data grafik belum tersedia</p>
                            <p className="text-slate-300 text-xs">Tambahkan data layanan balita untuk melihat grafik</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pie chart status gizi */}
                    <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">Status Gizi Balita</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Distribusi kondisi gizi saat ini</p>
                        </div>
                        <Link href="/dashboard?tab=analisis" className="text-[10px] text-teal-600 font-bold hover:underline flex items-center gap-0.5">
                          Detail <ArrowRight size={10} />
                        </Link>
                      </div>
                      <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={statusGiziData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                              {statusGiziData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,.1)" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {statusGiziData.map((d) => (
                          <div key={d.name} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                            <span className="text-[10px] text-slate-500 truncate">{d.name} <span className="font-bold text-slate-700">{d.value}%</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ---- SECTION 3: Kehadiran area chart + Jadwal Hari Ini ---- */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Area chart kehadiran */}
                    <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">Tren Kehadiran Peserta</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Kehadiran per kategori dalam 6 bulan terakhir</p>
                        </div>
                        <Link href="/dashboard?tab=kehadiran" className="text-[10px] text-teal-600 font-bold hover:underline flex items-center gap-0.5">
                          Lihat Rekap <ArrowRight size={10} />
                        </Link>
                      </div>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dynamicKehadiranChart} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gradBalita" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS.teal} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={CHART_COLORS.teal} stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="gradBumil" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS.pink} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={CHART_COLORS.pink} stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="gradLansia" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS.indigo} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={CHART_COLORS.indigo} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,.1)" }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "16px" }} />
                            <Area type="monotone" dataKey="balita" name="Balita" stroke={CHART_COLORS.teal} strokeWidth={2} fill="url(#gradBalita)" dot={false} />
                            <Area type="monotone" dataKey="ibuHamil" name="Ibu Hamil" stroke={CHART_COLORS.pink} strokeWidth={2} fill="url(#gradBumil)" dot={false} />
                            <Area type="monotone" dataKey="lansia" name="Lansia" stroke={CHART_COLORS.indigo} strokeWidth={2} fill="url(#gradLansia)" dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Jadwal Hari Ini Widget */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">Agenda Terdekat</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Kegiatan terjadwal bulan ini</p>
                        </div>
                        <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                          <Calendar size={16} />
                        </div>
                      </div>
                      <div className="space-y-3">
                        {agendaHariIni.length > 0 ? (
                          agendaHariIni.map((a: any, i: number) => (
                            <div
                              key={i}
                              className={`p-3.5 rounded-xl border transition-all ${
                                a.status === "Berlangsung"
                                  ? "border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50"
                                  : "border-slate-100 bg-slate-50/50"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${a.status === "Berlangsung" ? "bg-teal-500 animate-pulse" : "bg-slate-300"}`} />
                                <span className="text-[10px] font-bold text-slate-400 font-mono">
                                  {new Date(a.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} - {a.waktu}
                                </span>
                                {a.status === "Berlangsung" && (
                                  <span className="text-[9px] font-bold bg-teal-500 text-white px-1.5 py-0.5 rounded-full">AKTIF</span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-800">{a.namaKegiatan}</p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={9} /> {a.lokasi}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            Tidak ada jadwal kegiatan dalam waktu dekat.
                          </div>
                        )}
                      </div>
                      <Link
                        href="/dashboard?tab=jadwal"
                        className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs font-bold hover:bg-slate-50 hover:text-teal-600 hover:border-teal-200 transition-all flex items-center justify-center gap-1.5"
                      >
                        <ClipboardList size={13} /> Kelola Semua Jadwal
                      </Link>
                    </div>
                  </div>

                  {/* ---- SECTION 4: Kunjungan Terbaru ---- */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Kunjungan Terbaru */}
                    <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">Riwayat Kunjungan Terbaru</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Histori pemeriksaan dan penimbangan terakhir</p>
                        </div>
                        <Link href="/dashboard?tab=analisis" className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1">
                          Lihat Semua <ArrowRight size={12} />
                        </Link>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs">
                              <th className="px-3 py-2.5 rounded-l-xl font-semibold">Tanggal</th>
                              <th className="px-3 py-2.5 font-semibold">Nama</th>
                              <th className="px-3 py-2.5 font-semibold">Kategori</th>
                              <th className="px-3 py-2.5 font-semibold">Pemeriksaan</th>
                              <th className="px-3 py-2.5 rounded-r-xl font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {stats?.recentRecords && stats.recentRecords.length > 0
                              ? stats.recentRecords.map((r: any) => (
                                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-3 py-3 text-slate-500 text-xs whitespace-nowrap">
                                      {new Date(r.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                    </td>
                                    <td className="px-3 py-3 font-semibold text-slate-800 text-xs">
                                      {r.balita?.namaLengkap || r.ibuHamil?.namaLengkap || r.lansia?.namaLengkap || "-"}
                                    </td>
                                    <td className="px-3 py-3">
                                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                        r.balita ? "bg-blue-100 text-blue-700" : r.ibuHamil ? "bg-pink-100 text-pink-700" : "bg-indigo-100 text-indigo-700"
                                      }`}>
                                        {r.balita ? "Balita" : r.ibuHamil ? "Ibu Hamil" : "Lansia"}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3 text-xs text-slate-500">
                                      {r.beratBadan && <span>BB: {r.beratBadan}kg </span>}
                                      {r.tinggiBadan && <span>TB: {r.tinggiBadan}cm</span>}
                                      {!r.beratBadan && !r.tinggiBadan && "-"}
                                    </td>
                                    <td className="px-3 py-3">
                                      <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Selesai
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              : (
                                <tr>
                                  <td colSpan={5} className="px-3 py-10 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                      <Clock className="w-10 h-10 text-slate-200" />
                                      <p className="text-slate-400 text-xs">Belum ada data kunjungan terbaru</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right side: Alert + Shortcut Widgets */}
                    <div className="space-y-4">

                      {/* Alert Stunting */}
                      {(stats?.stuntingBalita ?? 0) > 0 ? (
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center">
                              <ShieldAlert size={15} className="text-white" />
                            </div>
                            <h4 className="font-bold text-rose-700 text-sm">Peringatan Stunting!</h4>
                          </div>
                          <p className="text-xs text-rose-600/80 leading-relaxed mb-3">
                            Terdeteksi <strong>{stats.stuntingBalita} balita</strong> dengan status stunting ({stuntingRate}%). Segera lakukan tindak lanjut.
                          </p>
                          <div className="bg-white rounded-xl p-3 border border-rose-100">
                            <div className="w-full bg-rose-100 rounded-full h-1.5 mb-1.5">
                              <div
                                className="bg-rose-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min(parseFloat(stuntingRate), 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-rose-500 font-semibold">{stuntingRate}% Stunting Rate</p>
                          </div>
                          <Link
                            href="/dashboard?tab=balita"
                            className="mt-3 w-full py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-1.5"
                          >
                            Lihat Data Balita <ArrowRight size={11} />
                          </Link>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
                              <CheckCircle2 size={15} className="text-white" />
                            </div>
                            <h4 className="font-bold text-emerald-700 text-sm">Status Gizi Baik</h4>
                          </div>
                          <p className="text-xs text-emerald-600/80 leading-relaxed">
                            Tidak ada kasus stunting terdeteksi. Pertahankan kualitas pelayanan!
                          </p>
                        </div>
                      )}

                      {/* Shortcut Menu */}
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h4 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-teal-500" /> Akses Cepat
                        </h4>
                        <div className="space-y-2">
                          {[
                            { label: "Input Layanan Balita", href: "/dashboard?tab=layanan-balita", color: "text-teal-600 bg-teal-50 hover:bg-teal-100" },
                            { label: "Input Layanan Bumil", href: "/dashboard?tab=layanan-ibuhamil", color: "text-pink-600 bg-pink-50 hover:bg-pink-100" },
                            { label: "Input Layanan Lansia", href: "/dashboard?tab=layanan-lansia", color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" },
                            { label: "Tambah Jadwal", href: "/dashboard?tab=jadwal", color: "text-amber-600 bg-amber-50 hover:bg-amber-100" },
                            { label: "Rekap Kehadiran", href: "/dashboard?tab=kehadiran", color: "text-slate-600 bg-slate-50 hover:bg-slate-100" },
                          ].map((s) => (
                            <Link
                              key={s.label}
                              href={s.href}
                              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${s.color}`}
                            >
                              {s.label}
                              <ArrowRight size={12} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ---- SECTION 5: Progress / Summary Footer Row ---- */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Data Summary */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                          <Baby size={16} />
                        </div>
                        <p className="font-bold text-sm">Manajemen Data</p>
                      </div>
                      <div className="space-y-2">
                        {[
                          { label: "Balita Terdaftar", val: stats?.totalBalita ?? 0, max: 100 },
                          { label: "Ibu Hamil", val: stats?.totalIbuHamil ?? 0, max: 50 },
                          { label: "Lansia", val: stats?.totalLansia ?? 0, max: 80 },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between text-[10px] font-medium text-blue-100 mb-1">
                              <span>{item.label}</span>
                              <span>{item.val} orang</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-1.5">
                              <div
                                className="bg-white h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min((item.val / item.max) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pelayanan Kesehatan */}
                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-5 text-white">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                          <Stethoscope size={16} />
                        </div>
                        <p className="font-bold text-sm">Pelayanan Kesehatan</p>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: "Layanan Balita", count: stats?.layananBalitaCount ?? 0, icon: Baby },
                          { label: "Layanan Ibu Hamil", count: stats?.layananIbuHamilCount ?? 0, icon: HeartPulse },
                          { label: "Layanan Lansia", count: stats?.layananLansiaCount ?? 0, icon: Users },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-3 bg-white/15 rounded-xl px-3 py-2.5">
                            <item.icon size={14} className="shrink-0 text-pink-100" />
                            <div>
                              <p className="text-[11px] font-bold">{item.label}</p>
                              <p className="text-[9px] text-pink-200">{item.count} Pelayanan Tercatat</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Jadwal & Kehadiran */}
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                          <Calendar size={16} />
                        </div>
                        <p className="font-bold text-sm">Jadwal & Kehadiran</p>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white/20 rounded-xl p-3">
                          <p className="text-[10px] font-bold text-amber-100 mb-1">Total Kegiatan Terdaftar</p>
                          <p className="text-2xl font-black">{stats?.totalJadwal ?? 0} <span className="text-sm font-normal">Kegiatan</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/20 rounded-xl p-3 text-center">
                            <p className="text-[9px] text-amber-100 mb-0.5">Total Hadir</p>
                            <p className="text-lg font-black">{totalHadir}</p>
                          </div>
                          <div className="bg-white/20 rounded-xl p-3 text-center">
                            <p className="text-[9px] text-amber-100 mb-0.5">Tidak Hadir</p>
                            <p className="text-lg font-black">{totalTidakHadir}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </>
              )}
            </div>
          )}

          {activeTab === "balita" && <PosyanduBalitaTab session={session} />}
          {activeTab === "ibuhamil" && <PosyanduIbuHamilTab session={session} />}
          {activeTab === "lansia" && <PosyanduLansiaTab session={session} />}
          {activeTab === "layanan-balita" && <PosyanduLayananBalitaTab session={session} />}
          {activeTab === "layanan-ibuhamil" && <PosyanduLayananIbuHamilTab session={session} />}
          {activeTab === "layanan-lansia" && <PosyanduLayananLansiaTab session={session} />}
          {activeTab === "jadwal" && <PosyanduJadwalTab session={session} />}
          {activeTab === "kehadiran" && <PosyanduKehadiranTab session={session} />}
          {activeTab === "analisis" && <PosyanduAnalisisTab session={session} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
