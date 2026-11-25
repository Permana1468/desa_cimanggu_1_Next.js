"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from "recharts";
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Layers, 
  ShieldCheck, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Ruler, 
  Database, 
  Building2, 
  RefreshCw, 
  ExternalLink, 
  Zap, 
  Sparkles, 
  ChevronRight,
  Radio,
  MapPin,
  Lock,
  Workflow,
  Eye,
  Check
} from "lucide-react";
import { 
  getPerencanaanRealtimeAnalytics, 
  type PerencanaanRealtimeData,
  type PhysicalProjectProgress,
  type InterUserNode,
  type InterUserActivityLog
} from "@/actions/perencanaanRealtime";

interface KaurPerencanaanRealtimeHubProps {
  onNavigateTab: (tab: string) => void;
  isHackerTheme?: boolean;
}

function formatRupiahShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(2)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(0)} Jt`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function KaurPerencanaanRealtimeHub({ onNavigateTab, isHackerTheme }: KaurPerencanaanRealtimeHubProps) {
  const [data, setData] = useState<PerencanaanRealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<"ALL" | "CHARTS" | "TRACKING" | "PROJECTS">("ALL");
  const [selectedProject, setSelectedProject] = useState<PhysicalProjectProgress | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Baru Saja");

  // Load Real-time Data
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await getPerencanaanRealtimeAnalytics();
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.activeProjects.length > 0 && !selectedProject) {
          setSelectedProject(res.data.activeProjects[0]);
        }
        setLastSyncTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch (err) {
      console.warn("Failed to load real-time perencanaan hub data:", err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  }, [selectedProject]);

  useEffect(() => {
    loadData();

    // Listen to real-time events and broadcast channel
    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener("refresh-notifications", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("desa_cimanggu_realtime_sync");
        bc.onmessage = () => {
          loadData();
        };
      } catch (e) {}
    }

    // Polling every 25 seconds when page is visible
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadData();
      }
    }, 25000);

    return () => {
      window.removeEventListener("refresh-notifications", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, [loadData]);

  if (loading && !data) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center">
        <div className="inline-flex items-center gap-2 text-sky-600 font-bold text-sm animate-pulse">
          <RefreshCw size={18} className="animate-spin" />
          <span>Menghubungkan ke Real-Time Engine Perencanaan Desa & Node Lintas Aparatur...</span>
        </div>
      </div>
    );
  }

  const summary = data?.summary;
  const sCurveData = data?.sCurveData || [];
  const musrenbangWilayah = data?.musrenbangWilayah || [];
  const activeProjects = data?.activeProjects || [];
  const tosBreakdown = data?.tosBreakdown || [];
  const interUserNodes = data?.interUserNodes || [];
  const interUserActivities = data?.interUserActivities || [];
  const workflowStages = data?.workflowStages || [];

  return (
    <div className="space-y-6">
      
      {/* ============================================================= */}
      {/* HEADER BAR: TITLE, SYNC PULSE, & VIEW SELECTOR                */}
      {/* ============================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden border border-sky-900/50">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-[10px] font-black uppercase tracking-widest shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                LIVE SYNC ENGINE v2.6
              </span>
              <span className="text-[11px] font-mono text-sky-300/80 flex items-center gap-1">
                <Clock size={12} /> Terakhir diperbarui: {lastSyncTime}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Zap className="text-amber-400 fill-amber-400" size={24} />
              PUSAT KONTROL & REAL-TIME ANALYTICS KAUR
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Monitoring multi-fitur terpadu: Kurva-S realisasi fisik proyek desa, pipa aspirasi Musrenbang RW, Take Off Sheet (TOS), dan tracking aktif integrasi lintas aparatur.
            </p>
          </div>

          {/* Right Action: View Filters & Refresh Button */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <div className="bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 flex items-center gap-1 shadow-inner">
              <button 
                onClick={() => setActiveView("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeView === "ALL" 
                    ? "bg-sky-600 text-white shadow-sm" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Semua
              </button>
              <button 
                onClick={() => setActiveView("CHARTS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeView === "CHARTS" 
                    ? "bg-sky-600 text-white shadow-sm" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Grafik
              </button>
              <button 
                onClick={() => setActiveView("TRACKING")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeView === "TRACKING" 
                    ? "bg-sky-600 text-white shadow-sm" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Tracking Integrasi
              </button>
            </div>

            <button 
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-4 py-2 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title="Sinkronisasi Data Real-Time Sekarang"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-sky-300" : ""} />
              <span>{refreshing ? "Menyinkronkan..." : "Sinkronkan"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 4 HIGH-IMPACT REALTIME KPI METRICS CARDS                      */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Realisasi Fisik Lapangan */}
        <div 
          onClick={() => onNavigateTab("scurve")}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-sky-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Realisasi Fisik Lapangan</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {summary?.rataRataProgres?.toFixed(1) || 74.0}%
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Deviasi +3.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center justify-between">
            <span>{summary?.proyekSelesai || 1} Selesai • {summary?.proyekBerjalan || 4} Berjalan</span>
            <ArrowUpRight size={13} className="text-slate-400 group-hover:text-sky-600 transition-colors" />
          </p>
        </div>

        {/* KPI 2: Pipa Usulan Musrenbang */}
        <div 
          onClick={() => onNavigateTab("musling-rw")}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Pipa Aspirasi Musrenbang</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {summary?.totalUsulanMusrenbang || 19}
            </span>
            <span className="text-xs font-bold text-slate-500">Usulan RW/Dusun</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center justify-between">
            <span>{summary?.usulanDisetujui || 11} Disetujui ({formatRupiahShort(summary?.totalNilaiAspirasi || 844000000)})</span>
            <ArrowUpRight size={13} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
          </p>
        </div>

        {/* KPI 3: Tracking Integrasi Lintas Aparatur */}
        <div 
          onClick={() => setActiveView("TRACKING")}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Node Lintas Aparatur</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight">
              {summary?.nodesOnlineCount || 7} / {interUserNodes.length || 7}
            </span>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 uppercase">
              100% HEALTH
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center justify-between">
            <span>Kades, RW, Kadus, Keuangan, GIS</span>
            <ArrowUpRight size={13} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </p>
        </div>

        {/* KPI 4: Volume TOS & Anggaran Terkelola */}
        <div 
          onClick={() => onNavigateTab("tos")}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Take Off Sheet & Pagu RKKD</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ruler size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {summary?.volumeTosTotalM3?.toFixed(1) || "527.5"} m³
            </span>
            <span className="text-xs font-bold text-slate-500">Volume Terukur</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center justify-between">
            <span>Pagu {formatRupiahShort(summary?.totalAlokasiRkkd || 4618746299)} ({summary?.serapanAnggaranPercent || 88.2}% Serap)</span>
            <ArrowUpRight size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </p>
        </div>

      </div>

      {/* ============================================================= */}
      {/* SECTION A: REAL-TIME CHARTS (KURVA-S & PIPA MUSRENBANG)       */}
      {/* ============================================================= */}
      {(activeView === "ALL" || activeView === "CHARTS") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CHART 1: KURVA-S REALISASI FISIK VS TARGET RENCANA (MINGGUAN) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Kurva-S Realisasi Fisik Desa
                    </h3>
                    <p className="text-slate-500 text-xs font-medium">Target Rencana vs Realisasi Lapangan (Minggu 1 - 8)</p>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigateTab("scurve")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-all border border-sky-200 cursor-pointer self-start sm:self-auto"
                >
                  <span>Detail Kurva-S</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              {/* Chart Container */}
              <div className="h-[270px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRencana" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorRealisasi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="minggu" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '16px', 
                        border: '1px solid #1e293b', 
                        color: '#fff',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                      }}
                      formatter={(val: any, name: any) => [
                        `${val}%`, 
                        name === 'rencana' ? 'Target Rencana' : 'Realisasi Fisik'
                      ]}
                      labelFormatter={(l) => `Progres ${l}`}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      height={30}
                      formatter={(value) => (
                        <span className="text-xs font-bold text-slate-700 capitalize">
                          {value === 'rencana' ? 'Target Rencana (%)' : 'Realisasi Fisik (%)'}
                        </span>
                      )}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rencana" 
                      stroke="#0284c7" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorRencana)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="realisasi" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorRealisasi)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Minggu Berjalan: <span className="font-bold text-slate-900">M5 (78% Aktual vs 74% Target)</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                STATUS: SURPLUS PROGRES (+4.0%)
              </span>
            </div>
          </div>

          {/* CHART 2: PIPA ASPIRASI MUSRENBANG PER WILAYAH */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Pipa Usulan Musrenbang per Wilayah
                    </h3>
                    <p className="text-slate-500 text-xs font-medium">Distribusi Usulan RW & Dusun (Disetujui vs Proses)</p>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigateTab("musling-rw")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold transition-all border border-amber-200 cursor-pointer self-start sm:self-auto"
                >
                  <span>Papan Musrenbang</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              {/* Chart Container */}
              <div className="h-[270px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={musrenbangWilayah} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="wilayah" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '16px', 
                        border: '1px solid #1e293b', 
                        color: '#fff',
                        fontSize: '12px' 
                      }}
                      formatter={(val: any, name: any) => [
                        `${val} Usulan`,
                        name === 'disetujui' ? 'Disetujui' : name === 'verifikasi' ? 'Dalam Verifikasi' : 'Pending'
                      ]}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      height={30}
                      formatter={(value) => (
                        <span className="text-xs font-bold text-slate-700 capitalize">
                          {value === 'disetujui' ? 'Disetujui' : value === 'verifikasi' ? 'Verifikasi' : 'Pending'}
                        </span>
                      )}
                    />
                    <Bar dataKey="disetujui" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="verifikasi" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
              <span className="font-semibold text-slate-700">
                Total Usulan Terinput: <span className="font-bold text-slate-900">{summary?.totalUsulanMusrenbang} Kegiatan</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                TOTAL NILAI: {formatRupiahShort(summary?.totalNilaiAspirasi || 844000000)}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION B: PUSAT TRACKING INTEGRASI MULTI-USER LINTAS APARATUR*/}
      {/* ============================================================= */}
      {(activeView === "ALL" || activeView === "TRACKING") && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-6">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                <Workflow size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Pusat Tracking Integrasi Lintas Aparatur
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-300">
                    REALTIME ACTIVE
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  Matriks konektivitas data perencanaan antara Kaur Perencanaan dengan Kades, RW, Kadus, Bendahara, GIS & Sentry.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-slate-900">7 Node Aktif Terkoneksi</div>
                <div className="text-[10px] text-emerald-600 font-bold">Sinkronisasi Instan via BroadcastChannel</div>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            </div>
          </div>

          {/* 1. VISUAL WORKFLOW PIPELINE PROGRESS (7 TAHAPAN PERENCANAAN) */}
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-sky-600" />
                Pipeline Alur Kerja Terintegrasi (End-to-End Planning Cycle)
              </span>
              <span className="text-xs font-bold text-sky-700 font-mono">
                Tahap 4 & 5 Sedang Berjalan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {workflowStages.map((stage) => {
                const isCompleted = stage.status === "COMPLETED";
                const isActive = stage.status === "ACTIVE";
                return (
                  <div 
                    key={stage.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isActive 
                        ? "bg-sky-50/90 border-sky-400 shadow-sm ring-2 ring-sky-300/40" 
                        : isCompleted 
                        ? "bg-white border-emerald-300 shadow-xs" 
                        : "bg-white/60 border-slate-200 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isCompleted 
                          ? "bg-emerald-600 text-white" 
                          : isActive 
                          ? "bg-sky-600 text-white animate-pulse" 
                          : "bg-slate-200 text-slate-600"
                      }`}>
                        {isCompleted ? <Check size={11} /> : stage.id}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isCompleted 
                          ? "bg-emerald-100 text-emerald-800" 
                          : isActive 
                          ? "bg-sky-100 text-sky-800 animate-pulse" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {isCompleted ? "Selesai" : isActive ? "Aktif" : "Menunggu"}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                      {stage.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      {stage.actor}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-1000 ${
                          isCompleted ? "bg-emerald-500" : isActive ? "bg-sky-600" : "bg-slate-300"
                        }`}
                        style={{ width: `${stage.progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. INTERACTIVE NODE MATRIX (7 APARATUR/ROLE DESA TERINTEGRASI) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Radio size={14} className="text-emerald-600 animate-pulse" />
                Status Node Aparatur yang Terkoneksi Real-time
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">Klik pada node untuk membuka modul terkait</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {interUserNodes.map((node) => {
                const isOnline = node.status === "ONLINE";
                const isSynced = node.status === "SYNCED";
                const isActionRequired = node.status === "ACTION_REQUIRED";

                return (
                  <div 
                    key={node.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-sky-400 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Role & Status Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                            {node.department}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                            {node.roleTitle}
                          </h4>
                          <p className="text-[11px] font-bold text-slate-600">
                            {node.userName}
                          </p>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                          isOnline 
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                            : isSynced 
                            ? "bg-sky-100 text-sky-800 border border-sky-300" 
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? "bg-emerald-500 animate-ping" : isSynced ? "bg-sky-500" : "bg-amber-500"
                          }`} />
                          {node.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Last Active Action Description */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-700 leading-relaxed font-medium">
                        "{node.lastAction}"
                      </div>
                    </div>

                    {/* Node Footer: Health & Feature Pill */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Clock size={11} /> {node.lastActiveTime}
                      </span>
                      <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        {node.integratedFeature}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. LIVE ACTIVITY FEED (REALTIME EVENT STREAM) */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-emerald-400 animate-pulse" />
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  Live Activity Stream Lintas Aktor (Real-time Feed)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Terhubung ke WebSocket / Storage Sync
              </span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {interUserActivities.map((act) => {
                return (
                  <div 
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center shrink-0 font-black text-xs">
                        {act.actorRole.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-white">{act.actorName}</span>
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-slate-700 text-sky-300">
                            {act.actorRole}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                          <span className="font-bold text-sky-400">{act.actionTitle}:</span> {act.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-[10px] font-mono text-slate-400">
                      <span>{act.timestamp}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION C: TAKE OFF SHEET (TOS) & PROYEK DETAIL MONITORING    */}
      {/* ============================================================= */}
      {(activeView === "ALL" || activeView === "PROJECTS") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* C1: TAKE OFF SHEET (TOS) REALTIME VOLUME BREAKDOWN */}
          <div className="lg:col-span-1 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                    <Ruler size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Take Off Sheet (TOS)
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Realisasi Volume Bahan Terhitung</p>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigateTab("tos")}
                  className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                  title="Buka Modul TOS"
                >
                  <ArrowUpRight size={16} />
                </button>
              </div>

              {/* Volume Progress List */}
              <div className="space-y-3.5">
                {tosBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.kategori}</span>
                      <span className="font-mono font-black text-indigo-700">
                        {item.volumeTerealisasi} / {item.volumeRencana} {item.satuan}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-700" 
                        style={{ width: `${item.persentase}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Efisiensi Material AHSP:</span>
              <span className="font-black text-emerald-600 font-mono">98.4% Sesuai SNI</span>
            </div>
          </div>

          {/* C2: ACTIVE PHYSICAL CONSTRUCTION PROJECTS LIVE CARD */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Daftar Proyek Fisik Berjalan (Monitoring Lapangan)
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">5 Kegiatan Strategis APBDes 2026</p>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigateTab("rab")}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all border border-blue-200 cursor-pointer self-start sm:self-auto"
                >
                  <span>Kelola RAB Kegiatan</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              {/* Projects Table / Cards */}
              <div className="space-y-2.5">
                {activeProjects.slice(0, 4).map((prj) => (
                  <div 
                    key={prj.id}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {prj.id}
                        </span>
                        <h4 className="text-xs font-black text-slate-900">
                          {prj.nama}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                        <span>Lokasi: <span className="text-slate-800 font-semibold">{prj.lokasi}</span></span>
                        <span>•</span>
                        <span>Anggaran: <span className="text-slate-800 font-bold font-mono">{formatRupiahShort(prj.anggaran)}</span></span>
                        <span>•</span>
                        <span>Sumber: <span className="text-sky-700 font-semibold">{prj.sumberDana}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-black font-mono text-slate-900">
                          {prj.realisasiFisik}% / {prj.targetRencana}%
                        </div>
                        <div className={`text-[10px] font-bold ${
                          prj.deviasi >= 0 ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          Deviasi {prj.deviasi >= 0 ? `+${prj.deviasi}%` : `${prj.deviasi}%`}
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        prj.status === "SELESAI" 
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                          : "bg-sky-100 text-sky-800 border border-sky-300"
                      }`}>
                        {prj.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total Alokasi Fisik: <span className="font-bold text-slate-900">Rp 500.900.000</span></span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> Seluruh Proyek Terverifikasi GIS & Lapangan
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

