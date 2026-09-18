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
  Sparkles,
  Upload,
  Camera,
  User,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Edit3,
  Check
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CyberPlanRabTab } from "../perencanaan/CyberPlanRabTab";
import { CyberPlanTakeOffTab } from "../perencanaan/CyberPlanTakeOffTab";
import { CyberPlanHargaSatuanTab } from "../perencanaan/CyberPlanHargaSatuanTab";
import { CyberPlanAhspTab } from "../perencanaan/CyberPlanAhspTab";
import { CyberPlanRkkdTab, RkkdSubFeature } from "../perencanaan/CyberPlanRkkdTab";
import { CyberPlanMusrenbangTab, MusrenbangSubFeature } from "../perencanaan/CyberPlanMusrenbangTab";
import { ApbdesInfografisBoard } from "../perencanaan/ApbdesInfografisBoard";
import { LuxuryRingChart } from "./LuxuryRingChart";

export function PerencanaanDashboard({ session, stats, isHackerTheme }: { session: any, stats: any, isHackerTheme?: boolean }) {
  const roleName = session?.user?.role?.replace(/_/g, ' ') || "KAUR PERENCANAAN";
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "main");

  // Real-time states
  const [serverLoad, setServerLoad] = useState(24);
  const [dbSync, setDbSync] = useState(100);
  const [serapan, setSerapan] = useState(56.1);

  // 3D Avatar Profile Image & Custom Name state (with localStorage persistence)
  const [avatarUrl, setAvatarUrl] = useState<string>("/images/Perangkat Oke.png");
  const [kaurName, setKaurName] = useState<string>("MUHAMAD ALDIANSYAH");
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem("kaur_profile_avatar_v1");
      if (savedAvatar) setAvatarUrl(savedAvatar);

      const savedName = localStorage.getItem("kaur_custom_name_v1");
      if (savedName) setKaurName(savedName);
    } catch (err) {}
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const res = reader.result as string;
          setAvatarUrl(res);
          try {
            localStorage.setItem("kaur_profile_avatar_v1", res);
          } catch (err) {}
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = (newName: string) => {
    const trimmed = newName.trim() || "MUHAMAD ALDIANSYAH";
    setKaurName(trimmed);
    try {
      localStorage.setItem("kaur_custom_name_v1", trimmed);
    } catch (err) {}
    setIsEditingName(false);
  };

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

  const musrenbangTabs = ["undangan-musrenbang", "musling-rw", "musling-kadus", "finance", "musrenbang"];
  if (tabParam && musrenbangTabs.includes(tabParam)) {
    const defaultSubTab: MusrenbangSubFeature = (tabParam === "finance" || tabParam === "musrenbang" ? "undangan-musrenbang" : tabParam) as MusrenbangSubFeature;
    return (
      <CyberPlanMusrenbangTab 
        key={tabParam || "musrenbang"}
        defaultTab={defaultSubTab}
        onBack={() => {
          setActiveTab("main");
          router.push("/dashboard?tab=overview");
        }} 
      />
    );
  }

  const rkkdTabs = ["rkp", "apbdes", "rkkd-add", "rkkd-dd", "rkkd-bhprd", "rkkd-bankeu", "rkkd-banprov"];
  if (tabParam && rkkdTabs.includes(tabParam)) {
    const defaultSubTab: RkkdSubFeature = (tabParam === "rkp" ? "apbdes" : tabParam) as RkkdSubFeature;
    return (
      <CyberPlanRkkdTab 
        key={tabParam || "rkp"}
        defaultTab={defaultSubTab}
        onBack={() => {
          setActiveTab("main");
          router.push("/dashboard?tab=overview");
        }} 
      />
    );
  }

  if (tabParam === "rab" || activeTab === "rab") {
    return <CyberPlanRabTab onBack={() => {
      setActiveTab("main");
      router.push("/dashboard?tab=overview");
    }} />;
  }

  if (tabParam === "tos" || activeTab === "tos" || tabParam === "takeoff" || activeTab === "takeoff") {
    return (
      <CyberPlanTakeOffTab 
        onBack={() => {
          setActiveTab("main");
          router.push("/dashboard?tab=overview");
        }}
        onNavigateToRab={() => {
          setActiveTab("rab");
          router.push("/dashboard?tab=rab");
        }} 
      />
    );
  }

  if (tabParam === "harga-satuan" || activeTab === "harga-satuan") {
    return <CyberPlanHargaSatuanTab onBack={() => {
      setActiveTab("main");
      router.push("/dashboard?tab=overview");
    }} />;
  }

  if (tabParam === "ahsp" || activeTab === "ahsp") {
    return <CyberPlanAhspTab onBack={() => {
      setActiveTab("main");
      router.push("/dashboard?tab=overview");
    }} />;
  }

  return (
    <div className={`space-y-6 min-h-[calc(100vh-80px)] font-sans relative pb-28 md:pb-8 ${isHackerTheme ? 'text-cyan-50' : ''}`}>
      
      {/* ------------------------------------------------------------- */}
      {/* 1. EPIC HERO HEADER CARD WITH CIRCULAR 3D AVATAR & UPLOAD      */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 bg-gradient-to-r from-white via-slate-50 to-sky-50/40 border border-slate-200/80 rounded-3xl p-5 sm:p-7 md:p-8 shadow-sm overflow-hidden group">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl group-hover:scale-125 transition-all pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left Welcome Info */}
          <div className="space-y-3 text-slate-800 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100/80 border border-sky-300 text-sky-900 font-extrabold uppercase text-[10px] tracking-widest shadow-xs">
              <Terminal size={14} className="animate-pulse text-sky-600" /> 
              <span>MODUL AKTIF: PERENCANAAN DESA</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase">
              {roleName}
            </h1>
            
            <p className="text-slate-600 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
              Selamat datang, <span className="text-slate-900 font-extrabold">{kaurName}</span>. Memantau progres RAB, serapan anggaran desa, dan alokasi APBDes secara real-time.
            </p>

            {/* Live Metrics Quick Badges */}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <div className="bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                <span className="text-xs font-bold text-slate-700">Serapan Dana: <span className="font-mono font-black text-sky-700">{serapan.toFixed(1)}%</span></span>
              </div>

              <div className="bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Sisa Anggaran: <span className="font-mono font-black text-sky-700">Rp 450 Jt</span></span>
              </div>
            </div>
          </div>

          {/* Right Side: 3D POP-OUT AVATAR CIRCULAR PROFILE FRAME WITH PNG UPLOAD */}
          <div className="flex items-center justify-center lg:justify-end gap-6 shrink-0">
            <div className="relative group/avatar flex flex-col items-center">
              
              {/* Outer 3D Glass Circular Pedestal Frame (Bulat Sempurna) */}
              <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-sky-500/20 via-sky-400/10 to-cyan-500/30 border-2 border-sky-400/60 p-2 shadow-2xl backdrop-blur-md transition-all duration-500 group-hover/avatar:border-sky-300 group-hover/avatar:shadow-sky-500/40">
                
                {/* 3D Pop-out Avatar Container */}
                <div className="relative w-full h-full rounded-full overflow-visible">
                  
                  {/* Avatar Image popping out of circular frame border */}
                  <div className="absolute inset-x-0 bottom-0 h-44 flex items-end justify-center pointer-events-none transition-transform duration-500 group-hover/avatar:scale-110 group-hover/avatar:-translate-y-2">
                    <img 
                      src={avatarUrl} 
                      alt="Foto Profil 3D Kaur Perencanaan" 
                      className="h-44 object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.35)] transition-all duration-300"
                      onError={(e) => {
                        // Fallback if custom image fails to load
                        (e.target as HTMLImageElement).src = "/images/Perangkat Oke.png";
                      }}
                    />
                  </div>

                  {/* Upload Overlay Button on Hover */}
                  <label 
                    className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs rounded-full opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer z-30 text-white"
                    title="Klik untuk Mengunggah Foto Profil PNG/3D"
                  >
                    <Upload size={20} className="animate-bounce text-sky-400" />
                    <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-center px-1">Unggah PNG</span>
                    <input 
                      type="file" 
                      accept="image/png,image/jpeg,image/webp" 
                      onChange={handleAvatarUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Editable Name Badge below Circular Avatar */}
              <div className="mt-3 text-center">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border-2 border-sky-500 shadow-md">
                    <input 
                      type="text" 
                      value={kaurName} 
                      onChange={(e) => setKaurName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(kaurName); }}
                      autoFocus
                      className="px-2 py-0.5 text-xs font-black text-slate-900 outline-none w-44 text-center uppercase"
                    />
                    <button 
                      onClick={() => handleSaveName(kaurName)}
                      className="p-1 bg-sky-600 text-white rounded-full hover:bg-sky-700 cursor-pointer"
                      title="Simpan Nama"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingName(true)}
                    className="text-[10px] font-black text-sky-950 bg-white border border-sky-300 px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:border-sky-500 hover:shadow-md transition-all cursor-pointer group/name"
                    title="Klik untuk Mengubah Nama"
                  >
                    <Sparkles size={11} className="text-amber-500 animate-spin" /> 
                    <span>{kaurName}</span>
                    <Edit3 size={11} className="text-slate-400 group-hover/name:text-sky-600 transition-colors ml-0.5" />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. DENSE HORIZONTAL TELEMETRY & CONTROL TOOLBAR (FULL WIDTH)   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Shortcut 1: Take Off Sheet */}
        <button 
          onClick={() => setActiveTab("tos")} 
          className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-3.5 group cursor-pointer text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all">
            <Ruler size={22} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-amber-700">Take Off Sheet</h4>
            <p className="text-[11px] text-slate-500 font-medium">Hitung Volume & Ukuran</p>
          </div>
        </button>

        {/* Shortcut 2: Input RAB */}
        <button 
          onClick={() => setActiveTab("rab")} 
          className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm hover:border-sky-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-3.5 group cursor-pointer text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-all">
            <Database size={22} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-sky-700">Input RAB Kegiatan</h4>
            <p className="text-[11px] text-slate-500 font-medium">Manajemen Rincian RAB</p>
          </div>
        </button>

        {/* Shortcut 3: Realisasi */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Activity size={22} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Realisasi Fisik</h4>
            <p className="text-[11px] text-sky-600 font-bold font-mono">100% Progres Lapangan</p>
          </div>
        </div>

        {/* Telemetry: Server & DB Live Status */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <Cpu size={12} className="text-slate-400" /> SERVER LOAD
              </span>
              <span className="text-blue-600 font-black">{serverLoad.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${serverLoad}%` }} />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-sky-500" /> DB SYNC
              </span>
              <span className="text-sky-600 font-black">{dbSync}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-sky-600 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${dbSync}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. FULL-WIDTH DENSE EXECUTIVE FINANCIAL STATS BOARD           */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full">
        <ApbdesInfografisBoard 
          onNavigateToApbdes={() => router.push("/dashboard?tab=apbdes")}
          isHackerTheme={isHackerTheme}
        />
      </div>
    </div>
  );
}
