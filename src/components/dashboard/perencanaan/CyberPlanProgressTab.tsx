"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  HardHat, 
  TrendingUp, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Layers, 
  Plus, 
  FileText, 
  Printer, 
  Clock,
  Hammer
} from "lucide-react";

interface CyberPlanProgressTabProps {
  onBack: () => void;
  defaultMode?: "scurve" | "progress";
  isHackerTheme?: boolean;
}

export function CyberPlanProgressTab({ onBack, defaultMode = "progress", isHackerTheme }: CyberPlanProgressTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"progress" | "scurve">(defaultMode);
  const [filterTahap, setFilterTahap] = useState<string>("ALL");

  // Mock synchronized physical construction projects for Desa Cimanggu I
  const [projects, setProjects] = useState([
    {
      id: "PRJ-01",
      nama: "Pembangunan Jalan Rabat Beton Dusun I (RW 001 - RW 002)",
      volume: "650 m x 3 m x 0.15 m",
      anggaran: 185000000,
      sumberDana: "DDS (Dana Desa) Tahap 1",
      targetRencana: 100,
      realisasiFisik: 100,
      deviasi: 0,
      status: "SELESAI",
      tahap: "TAHAP 1",
      mingguBerjalan: "Minggu 8",
      pelaksana: "TPK Desa Cimanggu I",
      weeklyCurve: [
        { minggu: "M1", rencana: 12, realisasi: 15 },
        { minggu: "M2", rencana: 25, realisasi: 28 },
        { minggu: "M3", rencana: 40, realisasi: 42 },
        { minggu: "M4", rencana: 58, realisasi: 60 },
        { minggu: "M5", rencana: 75, realisasi: 78 },
        { minggu: "M6", rencana: 88, realisasi: 90 },
        { minggu: "M7", rencana: 95, realisasi: 98 },
        { minggu: "M8", rencana: 100, realisasi: 100 },
      ]
    },
    {
      id: "PRJ-02",
      nama: "Pembangunan Tembok Penahan Tanah (TPT) Tebing Dusun II",
      volume: "80 m x 2.5 m",
      anggaran: 94500000,
      sumberDana: "DDS (Dana Desa) Tahap 2",
      targetRencana: 65,
      realisasiFisik: 72,
      deviasi: +7,
      status: "PROSES",
      tahap: "TAHAP 2",
      mingguBerjalan: "Minggu 4",
      pelaksana: "TPK Dusun II",
      weeklyCurve: [
        { minggu: "M1", rencana: 15, realisasi: 18 },
        { minggu: "M2", rencana: 30, realisasi: 35 },
        { minggu: "M3", rencana: 48, realisasi: 55 },
        { minggu: "M4", rencana: 65, realisasi: 72 },
        { minggu: "M5", rencana: 82, realisasi: null },
        { minggu: "M6", rencana: 100, realisasi: null },
      ]
    },
    {
      id: "PRJ-03",
      nama: "Rehabilitasi Drainase Pemukiman RW 003 Dusun II",
      volume: "320 m",
      anggaran: 62400000,
      sumberDana: "BHPRD 2026",
      targetRencana: 50,
      realisasiFisik: 48,
      deviasi: -2,
      status: "PROSES",
      tahap: "TAHAP 2",
      mingguBerjalan: "Minggu 3",
      pelaksana: "LPM & TPK",
      weeklyCurve: [
        { minggu: "M1", rencana: 18, realisasi: 16 },
        { minggu: "M2", rencana: 35, realisasi: 32 },
        { minggu: "M3", rencana: 50, realisasi: 48 },
        { minggu: "M4", rencana: 70, realisasi: null },
        { minggu: "M5", rencana: 85, realisasi: null },
        { minggu: "M6", rencana: 100, realisasi: null },
      ]
    },
    {
      id: "PRJ-04",
      nama: "Pengaspalan Hotmix Jalan Lingkungan RW 004",
      volume: "400 m x 2.5 m",
      anggaran: 125000000,
      sumberDana: "Bantuan Keuangan Kabupaten (BANKEU)",
      targetRencana: 20,
      realisasiFisik: 20,
      deviasi: 0,
      status: "PROSES",
      tahap: "TAHAP 3",
      mingguBerjalan: "Minggu 1",
      pelaksana: "Pihak Ketiga & Swakelola",
      weeklyCurve: [
        { minggu: "M1", rencana: 20, realisasi: 20 },
        { minggu: "M2", rencana: 45, realisasi: null },
        { minggu: "M3", rencana: 70, realisasi: null },
        { minggu: "M4", rencana: 90, realisasi: null },
        { minggu: "M5", rencana: 100, realisasi: null },
      ]
    }
  ]);

  const filteredProjects = projects.filter(p => {
    if (filterTahap === "ALL") return true;
    return p.tahap === filterTahap;
  });

  const totalAnggaran = projects.reduce((acc, curr) => acc + curr.anggaran, 0);
  const avgProgress = Math.round(projects.reduce((acc, curr) => acc + curr.realisasiFisik, 0) / projects.length);

  return (
    <div className="space-y-6 font-sans relative pb-16 animate-in fade-in duration-300">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all cursor-pointer shrink-0"
            title="Kembali ke Dashboard Kaur Perencanaan"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <HardHat size={20} />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {activeSubTab === "scurve" ? "S-Curve Tracker Pembangunan" : "Progress Control Fisik Lapangan"}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-100 text-sky-800">
                TA 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kendali progres fisik infrastruktur desa, monitoring kurva S, deviasi mingguan, dan pencairan anggaran.
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher Pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveSubTab("progress")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "progress"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Progress Control
          </button>
          <button
            onClick={() => setActiveSubTab("scurve")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "scurve"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            S-Curve Tracker
          </button>
        </div>
      </div>

      {/* 2. Live Aggregate Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Paket Pekerjaan</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{projects.length} Proyek</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Aktif</span>
          </div>
          <p className="text-[11px] text-slate-500">1 Selesai, 3 Sedang Berjalan</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rata-Rata Progres Fisik</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-600">{avgProgress}%</span>
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">On-Track</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${avgProgress}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Nilai Pagu Proyek</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">Rp {totalAnggaran.toLocaleString("id-ID")}</span>
          </div>
          <p className="text-[11px] text-slate-500">DDS + BHPRD + BANKEU</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deviasi Rata-Rata</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">+1.25%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Lebih Cepat</span>
          </div>
          <p className="text-[11px] text-slate-500">Realisasi melampaui kurva rencana</p>
        </div>
      </div>

      {/* 3. Main Project Cards & S-Curve Details */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-6">
        
        {/* Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Tahap:</span>
            {["ALL", "TAHAP 1", "TAHAP 2", "TAHAP 3"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTahap(t)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterTahap === t
                    ? "bg-sky-500 text-white shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {t === "ALL" ? "Semua Tahap" : t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Sinkron dengan modul APBDes & AHSP</span>
          </div>
        </div>

        {/* Project List */}
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all space-y-4 bg-slate-50/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-200 text-slate-700 rounded-md">
                      {project.id}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">
                      {project.tahap}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      project.status === "SELESAI" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">{project.nama}</h3>
                  <p className="text-xs text-slate-500">
                    Volume: <strong className="text-slate-700">{project.volume}</strong> • Sumber: <strong className="text-slate-700">{project.sumberDana}</strong> • Pelaksana: {project.pelaksana}
                  </p>
                </div>

                <div className="text-right sm:shrink-0">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Pagu Anggaran</p>
                  <p className="text-base font-black text-slate-900">Rp {project.anggaran.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {/* Progress Bars (Target vs Realisasi) */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Realisasi Fisik Lapangan:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sky-700 font-mono font-black">{project.realisasiFisik}%</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      project.deviasi >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      Deviasi: {project.deviasi >= 0 ? `+${project.deviasi}%` : `${project.deviasi}%`}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
                  <div 
                    className="bg-gradient-to-r from-sky-500 to-blue-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${project.realisasiFisik}%` }} 
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Target Rencana Kumulatif: {project.targetRencana}%</span>
                  <span>{project.mingguBerjalan}</span>
                </div>
              </div>

              {/* S-Curve Weekly Milestone Table (when scurve view active) */}
              {activeSubTab === "scurve" && (
                <div className="pt-3 border-t border-slate-200/60 space-y-2">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Activity size={14} className="text-sky-600" /> Kurva S Mingguan (Rencana vs Aktual):
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {project.weeklyCurve.map((w, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200 text-center space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block">{w.minggu}</span>
                        <div className="text-[11px] font-mono font-bold text-slate-700">
                          {w.realisasi !== null ? `${w.realisasi}%` : "-"}
                        </div>
                        <span className="text-[9px] text-slate-400 block border-t border-slate-100 pt-0.5">
                          Ren: {w.rencana}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

