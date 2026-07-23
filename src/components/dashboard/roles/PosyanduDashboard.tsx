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
import { PosyanduRegisterTab } from "../kesra/PosyanduRegisterTab";
import { PosyanduJadwalAbsensiTab } from "../kesra/PosyanduJadwalAbsensiTab";
import { PosyanduInventarisTab } from "../kesra/PosyanduInventarisTab";
import { KesraPmtTab } from "../kesra/KesraPmtTab";
import { POSYANDU_UNITS, getPosyanduUnit, detectUserPosyanduUnit } from "@/lib/posyandu";
import {
  Activity, AlertTriangle, Baby, Calendar, HeartPulse, Plus,
  FileText, Users, Stethoscope, ClipboardList, CheckCircle2,
  TrendingUp, TrendingDown, ArrowRight, Clock, MapPin, ShieldAlert,
  BarChart3, Sparkles, Filter, ChevronDown, Download, Lock
} from "lucide-react";
import { getPosyanduDashboardStats, exportPosyanduReport } from "@/actions/posyandu";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const CHART_COLORS = {
  teal: "#0d9488",
  pink: "#ec4899",
  indigo: "#6366f1",
  amber: "#f59e0b",
  rose: "#f43f5e",
  slate: "#94a3b8",
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

  // Detect user's assigned Posyandu unit (e.g. Mawar I)
  const userUnit = detectUserPosyanduUnit(session?.user);
  const isLockedToUnit = !!userUnit;

  const [selectedPosyandu, setSelectedPosyandu] = useState<string>(() => {
    if (userUnit) return userUnit.id;
    return "mawar1";
  });
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getPosyanduDashboardStats(selectedPosyandu);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch posyandu stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") fetchStats();
  }, [activeTab, selectedPosyandu]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const csvData = await exportPosyanduReport(selectedPosyandu);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Laporan_${selectedPosyandu}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Gagal mengunduh laporan.");
    } finally {
      setExporting(false);
    }
  };

  const currentUnitObj = getPosyanduUnit(selectedPosyandu);

  const totalSasaran = (stats?.totalBalita || 0) + (stats?.totalIbuHamil || 0) + (stats?.totalLansia || 0);

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

  const agendaHariIni = stats?.activeJadwals || [];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full px-1 sm:px-0 pb-20 sm:pb-10">
      {/* DAPUR POSYANDU HEADER BAR - MOBILE ENHANCED */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xl border border-slate-800 space-y-3.5 sm:space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-teal-500/20 shrink-0">
              <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-base sm:text-xl font-black text-white truncate max-w-full">
                  {currentUnitObj ? `${currentUnitObj.name}` : "Rekapan Seluruh Dapur Posyandu"}
                </h2>
                {currentUnitObj ? (
                  <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-bold whitespace-nowrap">
                    📌 {currentUnitObj.rtDescription}
                  </span>
                ) : (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-bold whitespace-nowrap">
                    🌐 Gabungan Mawar I s/d VII
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-snug">
                {isLockedToUnit ? (
                  <span className="text-teal-300 font-semibold flex items-center gap-1.5">
                    <Lock size={12} className="text-teal-400 shrink-0" /> Dapur Khusus Terkunci ({userUnit?.name})
                  </span>
                ) : (
                  "Pilih Dapur Posyandu di bawah untuk mengelola rekapan khusus"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <Download size={15} />
              <span>{exporting ? "Mengekspor..." : `Export Rekapan ${currentUnitObj ? currentUnitObj.name.replace("Posyandu ", "") : "Posyandu"}`}</span>
            </button>
          </div>
        </div>

        {/* Dapur Tabs Selector Bar - SMOOTH MOBILE SCROLLABLE SLIDER */}
        {!isLockedToUnit && (
          <div className="pt-2.5 sm:pt-3 border-t border-slate-800">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Filter size={12} className="text-teal-400" /> Pilih Dapur Posyandu:
            </div>
            
            {/* Mobile horizontal scroll container */}
            <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-2 overflow-x-auto pb-1 sm:pb-0 scroll-smooth -mx-1 px-1">
              {POSYANDU_UNITS.map((unit) => {
                const isActive = selectedPosyandu === unit.id;
                return (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedPosyandu(unit.id)}
                    className={`px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border shrink-0 flex flex-col items-center justify-center min-w-[110px] sm:min-w-0 ${
                      isActive
                        ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 border-teal-300 font-black shadow-lg shadow-teal-500/20 scale-[1.02]"
                        : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="whitespace-nowrap">{unit.name.replace("Posyandu ", "")}</span>
                    <span className="text-[9px] font-semibold opacity-85 mt-0.5">({unit.rws.map(r => `RW ${r}`).join("&")})</span>
                  </button>
                );
              })}

              <button
                onClick={() => setSelectedPosyandu("ALL")}
                className={`px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border shrink-0 flex flex-col items-center justify-center min-w-[100px] sm:min-w-0 ${
                  selectedPosyandu === "ALL"
                    ? "bg-blue-500 text-white border-blue-400 font-black shadow-lg shadow-blue-500/20 scale-[1.02]"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="whitespace-nowrap">🌐 Semua</span>
                <span className="text-[9px] font-semibold opacity-85 mt-0.5">(Gabungan)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + selectedPosyandu}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-6">

              {/* ---- HERO BANNER MOBILE RESPONSIVE ---- */}
              <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 text-white shadow-xl shadow-teal-900/20 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 sm:mb-4 border border-white/20 backdrop-blur-sm">
                        <Activity size={12} className="animate-pulse text-teal-300" />
                        {currentUnitObj ? `${currentUnitObj.name}` : "Dapur Seluruh Posyandu"}
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black mb-2 leading-tight">
                        {currentUnitObj ? `Pengelolaan ${currentUnitObj.name}` : "Posyandu Desa Cimanggu I"}
                      </h1>
                      <p className="text-teal-100/90 text-xs sm:text-sm max-w-lg leading-relaxed">
                        Selamat datang, <strong>{session?.user?.fullName || "Kader Posyandu"}</strong>.
                        Rekapan khusus <strong>{currentUnitObj ? currentUnitObj.rtDescription : "Seluruh RW Desa Cimanggu I"}</strong> terintegrasi Data Kependudukan.
                      </p>
                      
                      {/* Quick stats pills - Grid on mobile */}
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-4 mt-4 sm:mt-5">
                        {[
                          { label: "Total Sasaran", val: totalSasaran },
                          { label: "Balita Terdaftar", val: stats?.totalBalita ?? "-" },
                          { label: "Ibu Hamil", val: stats?.totalIbuHamil ?? "-" },
                          { label: "Lansia", val: stats?.totalLansia ?? "-" },
                        ].map((item) => (
                          <div key={item.label} className="bg-white/10 border border-white/15 backdrop-blur-md px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-left">
                            <p className="text-[9px] sm:text-[10px] text-teal-200 uppercase font-semibold truncate">{item.label}</p>
                            <p className="text-base sm:text-lg font-black">{item.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 sm:gap-3 shrink-0 pt-2 sm:pt-0">
                      <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-white hover:bg-teal-50 text-teal-900 font-bold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-xs sm:text-sm disabled:opacity-50 active:scale-98 cursor-pointer"
                      >
                        <FileText size={16} />
                        <span>{exporting ? "Mengunduh..." : "Export Laporan CSV"}</span>
                      </button>
                      <Link
                        href="/dashboard?tab=balita"
                        className="bg-teal-500/40 hover:bg-teal-500/60 border border-white/30 text-white font-bold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs sm:text-sm backdrop-blur-sm active:scale-98"
                      >
                        <Plus size={16} /> Input Data Balita
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-100 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* ---- SECTION 1: 4 MAIN METRIC CARDS (2-GRID MOBILE) ---- */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                    {[
                      {
                        label: "Layanan Balita", val: stats?.layananBalitaCount ?? 0,
                        sub: "total pelayanan",
                        icon: Stethoscope, bg: "bg-teal-50", color: "text-teal-600",
                        trend: "up", href: "/dashboard?tab=layanan-balita"
                      },
                      {
                        label: "Layanan Ibu Hamil", val: stats?.layananIbuHamilCount ?? 0,
                        sub: "total pelayanan",
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
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link href={card.href} className="block group">
                          <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all h-full">
                            <div className="flex items-start justify-between mb-2 sm:mb-4">
                              <div className={`w-9 h-9 sm:w-11 sm:h-11 ${card.bg} rounded-lg sm:rounded-xl flex items-center justify-center ${card.color} shrink-0`}>
                                <card.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                card.trend === "up" ? "bg-green-50 text-green-600" :
                                card.trend === "down" ? "bg-red-50 text-red-600" :
                                "bg-slate-50 text-slate-500"
                              }`}>
                                {card.trend === "up" ? <TrendingUp size={10} /> : card.trend === "down" ? <TrendingDown size={10} /> : null}
                              </div>
                            </div>
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">{card.label}</p>
                            <p className="text-xl sm:text-2xl font-black text-slate-800">{card.val}</p>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1 sm:mt-1.5 flex items-center gap-1 group-hover:text-teal-600 transition-colors truncate">
                              {card.sub} <ArrowRight size={9} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* ---- SECTION 2: CHARTS GRID MOBILE OPTIMIZED ---- */}
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">

                    {/* Bar chart pertumbuhan balita */}
                    <div className="xl:col-span-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-start justify-between mb-4 sm:mb-5 gap-2">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm sm:text-base">Grafik Pertumbuhan Balita</h3>
                          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Rata-rata berat & tinggi badan per bulan</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-teal-600 font-semibold bg-teal-50 px-2.5 py-1 rounded-full shrink-0">
                          <BarChart3 size={11} /> Tahun Ini
                        </div>
                      </div>
                      <div className="h-[210px] sm:h-[260px] w-full">
                        {stats?.chartData && stats.chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} dy={6} />
                              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                              <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,.1)", fontSize: "12px" }}
                                cursor={{ fill: "#f8fafc" }}
                              />
                              <Legend iconType="circle" wrapperStyle={{ fontSize: "10px", paddingTop: "12px" }} />
                              <Bar yAxisId="left" dataKey="beratRataRata" name="Berat (Kg)" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} maxBarSize={24} />
                              <Bar yAxisId="right" dataKey="tinggiRataRata" name="Tinggi (Cm)" fill={CHART_COLORS.slate} radius={[4, 4, 0, 0]} maxBarSize={24} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center gap-2">
                            <BarChart3 className="w-10 h-10 text-slate-200" />
                            <p className="text-slate-400 text-xs">Data grafik belum tersedia</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pie chart status gizi */}
                    <div className="xl:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-start justify-between mb-3 sm:mb-5">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm sm:text-base">Status Gizi Balita</h3>
                          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Distribusi kondisi gizi saat ini</p>
                        </div>
                      </div>
                      <div className="h-[180px] sm:h-[200px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusGiziData}
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={72}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {statusGiziData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,.1)", fontSize: "12px" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
                        {statusGiziData.map((item) => (
                          <div key={item.name} className="flex items-center gap-1.5 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-500 font-medium truncate text-[11px]">{item.name}</span>
                            <span className="font-bold text-slate-700 ml-auto text-[11px]">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ---- SECTION 3: RECENT RECORDS & AGENDA ---- */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

                    {/* Recent Records List */}
                    <div className="xl:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm sm:text-base">Aktivitas Pemeriksaan Terbaru</h3>
                          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Catatan kesehatan peserta posyandu</p>
                        </div>
                        <Link href="/dashboard?tab=layanan-balita" className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1 shrink-0">
                          Lihat Semua <ArrowRight size={12} />
                        </Link>
                      </div>

                      <div className="space-y-2.5 sm:space-y-3">
                        {stats?.recentRecords && stats.recentRecords.length > 0 ? (
                          stats.recentRecords.slice(0, 5).map((rec: any) => {
                            const nama = rec.balita?.namaLengkap || rec.ibuHamil?.namaLengkap || rec.lansia?.namaLengkap || "Peserta";
                            const tipe = rec.balita ? "Balita" : rec.ibuHamil ? "Ibu Hamil" : "Lansia";
                            const badgeColor = rec.balita ? "bg-teal-50 text-teal-700" : rec.ibuHamil ? "bg-pink-50 text-pink-700" : "bg-indigo-50 text-indigo-700";

                            return (
                              <div key={rec.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-all gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${badgeColor}`}>
                                    {tipe === "Balita" ? "B" : tipe === "Ibu Hamil" ? "H" : "L"}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{nama}</p>
                                    <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                                      {new Date(rec.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                                      {rec.statusGizi && ` • ${rec.statusGizi}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right text-[11px] font-semibold text-slate-600 shrink-0">
                                  {rec.beratBadan && <div>BB: {rec.beratBadan} kg</div>}
                                  {rec.tinggiBadan && <div className="text-[9px] text-slate-400">TB: {rec.tinggiBadan} cm</div>}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-8 text-center text-slate-400 text-xs">Belum ada pemeriksaan terbaru recorded.</div>
                        )}
                      </div>
                    </div>

                    {/* Active Agenda */}
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3.5 sm:space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base">Agenda Kegiatan</h3>
                        <Link href="/dashboard?tab=jadwal" className="text-xs text-teal-600 font-bold hover:underline">
                          + Tambah
                        </Link>
                      </div>

                      <div className="space-y-2.5 sm:space-y-3">
                        {agendaHariIni.length > 0 ? (
                          agendaHariIni.map((j: any) => (
                            <div key={j.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-800 truncate">{j.namaKegiatan}</span>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 shrink-0">
                                  {j.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500">
                                <Clock size={11} className="text-teal-500 shrink-0" />
                                <span className="truncate">{new Date(j.tanggal).toLocaleDateString("id-ID")} - {j.waktu}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500">
                                <MapPin size={11} className="text-teal-500 shrink-0" />
                                <span className="truncate">{j.lokasi}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-slate-400 text-xs">Tidak ada kegiatan terdekat.</div>
                        )}
                      </div>
                    </div>
                  </div>

                </>
              )}
            </div>
          )}

          {activeTab === "balita" && <PosyanduBalitaTab session={session} selectedPosyandu={selectedPosyandu} />}
          {activeTab === "ibuhamil" && <PosyanduIbuHamilTab session={session} selectedPosyandu={selectedPosyandu} />}
          {activeTab === "lansia" && <PosyanduLansiaTab session={session} selectedPosyandu={selectedPosyandu} />}
          {activeTab === "layanan-balita" && <PosyanduLayananBalitaTab session={session} selectedPosyandu={selectedPosyandu} />}
          {activeTab === "layanan-ibuhamil" && <PosyanduLayananIbuHamilTab session={session} selectedPosyandu={selectedPosyandu} />}
          {activeTab === "layanan-lansia" && <PosyanduLayananLansiaTab session={session} selectedPosyandu={selectedPosyandu} />}
          {activeTab === "jadwal" && <PosyanduJadwalTab session={session} selectedPosyandu={selectedPosyandu} />}
          {activeTab === "kehadiran" && <PosyanduKehadiranTab session={session} selectedPosyandu={selectedPosyandu} />}
          {activeTab === "analisis" && <PosyanduAnalisisTab session={session} selectedPosyandu={selectedPosyandu} />}
          {activeTab === "posyandu-register" && <PosyanduRegisterTab session={session} selectedPosyandu={selectedPosyandu} />}
          {activeTab === "posyandu-jadwal" && <PosyanduJadwalAbsensiTab session={session} selectedPosyandu={selectedPosyandu} />}
          {activeTab === "posyandu-inventaris" && <PosyanduInventarisTab session={session} selectedPosyandu={selectedPosyandu} />}
          {activeTab === "pmt" && <KesraPmtTab session={session} selectedPosyandu={selectedPosyandu} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
