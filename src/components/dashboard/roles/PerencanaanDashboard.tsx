"use client";

import { 
  Terminal,
  Activity,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  MonitorPlay,
  Wallet,
  Ruler,
  Cpu,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CyberPlanRabTab } from "../perencanaan/CyberPlanRabTab";
import { CyberPlanTakeOffTab } from "../perencanaan/CyberPlanTakeOffTab";
import { CyberPlanHargaSatuanTab } from "../perencanaan/CyberPlanHargaSatuanTab";

export function PerencanaanDashboard({ session, stats }: { session: any, stats: any }) {
  const roleName = session?.user?.role?.replace(/_/g, ' ') || "KAUR PERENCANAAN";
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "main");

  // Real-time states
  const [serverLoad, setServerLoad] = useState(24);
  const [dbSync, setDbSync] = useState(100);
  const [serapan, setSerapan] = useState(45.5);

  useEffect(() => {
    const interval = setInterval(() => {
      setServerLoad(prev => Math.max(10, Math.min(95, prev + (Math.random() * 10 - 5))));
      if (Math.random() > 0.8) {
        setDbSync(prev => prev >= 100 ? 98 : 100);
      }
      setSerapan(prev => prev < 100 ? prev + (Math.random() * 0.05) : prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (tabParam === "rab" || activeTab === "rab") {
    return <CyberPlanRabTab onBack={() => {
      setActiveTab("main");
      router.push("/dashboard?tab=overview");
    }} />;
  }

  if (tabParam === "tos" || activeTab === "tos" || tabParam === "takeoff" || activeTab === "takeoff") {
    return <CyberPlanTakeOffTab onBack={() => {
      setActiveTab("main");
      router.push("/dashboard?tab=overview");
    }} />;
  }

  if (tabParam === "harga-satuan" || activeTab === "harga-satuan") {
    return <CyberPlanHargaSatuanTab onBack={() => {
      setActiveTab("main");
      router.push("/dashboard?tab=overview");
    }} />;
  }

  return (
    <div className="space-y-6 min-h-[calc(100vh-80px)] font-sans overflow-hidden relative">
      
      {/* HEADER CARD */}
      <div className="relative z-10 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 text-slate-800">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold uppercase text-[10px] tracking-widest">
              <Terminal size={14} className="animate-pulse text-emerald-600" /> 
              <span>MODUL AKTIF: PERENCANAAN DESA</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 uppercase">
              {roleName}
            </h1>
            
            <p className="text-slate-500 max-w-xl text-sm md:text-base font-normal leading-relaxed">
              Selamat datang, <span className="text-slate-800 font-extrabold">{session?.user?.name}</span>. Memantau progres RAB dan serapan anggaran desa tahun berjalan secara real-time.
            </p>
          </div>

          {/* Key Metric Telemetry Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 min-w-[150px] shadow-sm relative group">
              <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Serapan Dana</span>
              <span className="block text-3xl font-black text-slate-900 font-mono tracking-tight">
                {serapan.toFixed(1)}%
              </span>
            </div>
            
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 min-w-[150px] shadow-sm">
              <span className="block text-[10px] font-black text-emerald-700 mb-2 uppercase tracking-widest">Sisa Anggaran</span>
              <span className="block text-xl md:text-2xl font-black text-emerald-800 font-mono mt-1 tracking-tight">
                Rp 450 Jt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* LEFT COLUMN: ANALISIS APBDES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <Wallet size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-wide flex items-center gap-2">
                    Analisis APBDes 2026
                    <Sparkles size={16} className="text-yellow-500" />
                  </h2>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">Alokasi & Realisasi Anggaran Berjalan</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* PENDAPATAN */}
              <div className="p-5 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-center justify-between hover:border-emerald-300 transition-all duration-300 group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <ArrowDownRight size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 uppercase text-sm tracking-wide">Pendapatan Desa</h4>
                    <span className="text-xs text-slate-500 font-mono">TARGET: RP 1.2M</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-emerald-600 font-mono text-xl tracking-tight">
                    Rp 800.000.000
                  </span>
                  <span className="inline-block mt-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    66% TERCAPAI
                  </span>
                </div>
              </div>

              {/* BELANJA */}
              <div className="p-5 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-center justify-between hover:border-rose-300 transition-all duration-300 group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <ArrowUpRight size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 uppercase text-sm tracking-wide">Belanja Desa</h4>
                    <span className="text-xs text-slate-500 font-mono">PAGU: RP 1.2M</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-rose-600 font-mono text-xl tracking-tight">
                    Rp 450.000.000
                  </span>
                  <span className="inline-block mt-1 text-[10px] font-black text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    37% TERSERAP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROL CENTER & SYSTEM STATUS */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/80">
            
            <h2 className="text-xs font-black text-slate-800 mb-5 uppercase tracking-widest flex items-center gap-2">
              <MonitorPlay size={16} className="text-slate-400" /> PUSAT KENDALI
            </h2>
            
            <div className="grid grid-cols-3 gap-3 relative z-10">
              <button 
                onClick={() => setActiveTab("tos")} 
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-white hover:border-amber-400 hover:text-amber-600 hover:shadow-md transition-all duration-300 group"
              >
                <Ruler size={24} className="group-hover:scale-110 transition-transform text-amber-500" />
                <span className="text-[10px] font-black text-center uppercase tracking-wider">Take Off Sheet</span>
              </button>

              <button 
                onClick={() => setActiveTab("rab")} 
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-white hover:border-emerald-400 hover:text-emerald-600 hover:shadow-md transition-all duration-300 group"
              >
                <Database size={24} className="group-hover:scale-110 transition-transform text-emerald-500" />
                <span className="text-[10px] font-black text-center uppercase tracking-wider">Input RAB</span>
              </button>
              
              <button 
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-white hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all duration-300 group"
              >
                <Activity size={24} className="group-hover:scale-110 transition-transform text-blue-500" />
                <span className="text-[10px] font-black text-center uppercase tracking-wider">Realisasi</span>
              </button>
            </div>
          </div>
          
          {/* SYSTEM STATUS CARD */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
             <div className="flex items-center justify-between text-xs font-mono mb-4 border-b border-slate-100 pb-3">
                <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Cpu size={14} className="text-slate-400" /> SYSTEM STATUS
                </span>
                <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"/> 
                  ONLINE
                </span>
             </div>
             
             <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1.5 font-bold">
                    <span>SERVER LOAD</span>
                    <span className="text-blue-600">{serverLoad.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-in-out" style={{width: `${serverLoad}%`}}></div>
                  </div>
               </div>

               <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1.5 font-bold">
                    <span>DATABASE SYNC</span>
                    <span className="text-emerald-600">{dbSync}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                    <div className="bg-emerald-600 h-2 rounded-full transition-all duration-1000 ease-in-out" style={{width: `${dbSync}%`}}></div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
