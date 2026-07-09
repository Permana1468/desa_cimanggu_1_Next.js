"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HeartHandshake, 
  Stethoscope, 
  Activity, 
  FileText, 
  Users, 
  Database,
  Map,
  Compass,
  Landmark,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { getKesraDtksList, getKesraGisList, getKesraStuntingList, getKesraAtsList, getKesraInsentifList } from "@/actions/kesra";

// Tab Components
import { KesraDtksTab } from "../kesra/KesraDtksTab";
import { KesraGisTab } from "../kesra/KesraGisTab";
import { KesraStuntingTab } from "../kesra/KesraStuntingTab";
import { KesraPmtTab } from "../kesra/KesraPmtTab";
import { KesraAtsTab } from "../kesra/KesraAtsTab";
import { KesraInsentifTab } from "../kesra/KesraInsentifTab";
import { KesraReportTab } from "../kesra/KesraReportTab";

export function KesejahteraanDashboard({ session, stats }: { session: any, stats: any }) {
  return (
    <Suspense fallback={
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    }>
      <KesejahteraanDashboardContent session={session} stats={stats} />
    </Suspense>
  );
}

function KesejahteraanDashboardContent({ session, stats }: { session: any, stats: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";

  const [dtksCount, setDtksCount] = useState(0);
  const [gisCount, setGisCount] = useState(0);
  const [stuntingCount, setStuntingCount] = useState(0);
  const [atsCount, setAtsCount] = useState(0);
  const [insentifCount, setInsentifCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadDashboardStats() {
      setLoadingStats(true);
      try {
        const [dtks, gis, stunting, ats, insentif] = await Promise.all([
          getKesraDtksList().catch(() => []),
          getKesraGisList().catch(() => []),
          getKesraStuntingList().catch(() => []),
          getKesraAtsList().catch(() => []),
          getKesraInsentifList().catch(() => [])
        ]);

        setDtksCount(dtks.length);
        setGisCount(gis.length);
        
        // Count stunting balitas from EWS algorithm
        const stuntingBalitas = stunting.filter((b: any) => {
          const lastRec = b.records?.[b.records.length - 1];
          if (!lastRec) return false;
          // Simple standard stunting indicator check
          const age = Math.floor((new Date().getTime() - new Date(b.tanggalLahir).getTime()) / (1000 * 60 * 60 * 24 * 30.4));
          const expectedHeight = 50 + (age * 1.2);
          const heightZ = (lastRec.tinggiBadan - expectedHeight) / 3;
          return heightZ < -2;
        });
        setStuntingCount(stuntingBalitas.length);

        setAtsCount(ats.length);
        setInsentifCount(insentif.length);
      } catch (e) {
        console.error("Failed to load kesra dashboard stats:", e);
      }
      setLoadingStats(false);
    }

    if (activeTab === "overview") {
      loadDashboardStats();
    }
  }, [activeTab]);

  const handleTabChange = (tabName: string) => {
    router.push(`/dashboard?tab=${tabName}`);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dtks":
        return <KesraDtksTab session={session} />;
      case "gis-kemiskinan":
        return <KesraGisTab session={session} />;
      case "ews-stunting":
        return <KesraStuntingTab session={session} onTabChange={handleTabChange} />;
      case "pmt":
        return <KesraPmtTab session={session} />;
      case "ats":
        return <KesraAtsTab session={session} />;
      case "insentif":
        return <KesraInsentifTab session={session} />;
      case "report":
        return <KesraReportTab session={session} />;
      default:
        return (
          <div className="space-y-6">
            {/* WELCOME HEADER */}
            <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-indigo-600 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-rose-900/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/20 rounded-full blur-[60px] -ml-32 -mb-32" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="space-y-4 text-white">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                          <HeartHandshake size={14} /> Bidang Kesejahteraan & Sosial
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                          Kasi Kesejahteraan
                      </h1>
                      <p className="text-rose-100 max-w-xl leading-relaxed text-sm">
                          Selamat datang kembali, <span className="text-white font-bold">{session?.user?.name}</span>. Pantau indikator sosial, gizi stunting balita, tracking anak putus sekolah, dan penyaluran anggaran APBDes di sini.
                      </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md text-white">
                          <span className="block text-[10px] font-bold text-rose-100 mb-1 uppercase tracking-wider">DTKS Terdata</span>
                          <span className="block text-3xl font-black">{loadingStats ? "..." : dtksCount} KK</span>
                      </div>
                      <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md text-white">
                          <span className="block text-[10px] font-bold text-rose-100 mb-1 uppercase tracking-wider">Stunting Terdeteksi</span>
                          <span className="block text-3xl font-black text-rose-200">{loadingStats ? "..." : stuntingCount} Balita</span>
                      </div>
                  </div>
              </div>
            </div>

            {/* QUICK SNAPSHOT METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Warga Miskin Geotagged", val: gisCount, desc: "Titik koordinat rumah", icon: Map, color: "text-indigo-600 bg-indigo-50" },
                { label: "Anak Putus Sekolah", val: atsCount, desc: "Usia 6 - 21 Tahun", icon: Compass, color: "text-amber-600 bg-amber-50" },
                { label: "Penerima Insentif", val: insentifCount, desc: "Guru ngaji, marbot & petugas", icon: Landmark, color: "text-emerald-600 bg-emerald-50" },
                { label: "Sistem Warning Stunting", val: stuntingCount > 0 ? "WARNING" : "AMAN", desc: "Standard Z-Score WHO", icon: Activity, color: stuntingCount > 0 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50" }
              ].map((m, idx) => {
                const Icon = m.icon;
                return (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.color} shrink-0`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                      <span className="block text-xl font-black text-slate-800 mt-0.5">{loadingStats ? "..." : m.val}</span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">{m.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DETAILED ACTION TILES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { title: "Modul Kemiskinan & Sosial", text: "Lakukan sinkronisasi data DTKS Kemensos, cleansing bansos ganda, serta pemetaan GIS titik koordinat rumah warga rentan sosial.", tab: "dtks", color: "from-rose-500 to-pink-600" },
                { title: "Kesehatan & Stunting Balita", text: "Pantau tumbuh kembang balita dengan EWS Z-score WHO, grafik antropometri, serta kelola manifest stok pengiriman logistik PMT.", tab: "ews-stunting", color: "from-emerald-500 to-teal-600" },
                { title: "Pendidikan & Keagamaan", text: "Advokasi beasiswa kejar paket PKBM untuk anak putus sekolah (ATS) serta bayar massal insentif guru ngaji digital.", tab: "ats", color: "from-amber-500 to-orange-600" }
              ].map(tile => (
                <div key={tile.title} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 text-base">{tile.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{tile.text}</p>
                  </div>
                  <button
                    onClick={() => handleTabChange(tile.tab)}
                    className={`mt-6 w-full py-2.5 rounded-xl text-white bg-gradient-to-r ${tile.color} font-black text-xs flex items-center justify-center gap-1.5 transition-all group-hover:scale-[1.02] shadow-sm`}
                  >
                    Buka Modul Fitur <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Render of Tabs */}
      {renderActiveTab()}
    </div>
  );
}
