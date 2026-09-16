"use client";

import React, { useState, useEffect } from "react";
import { 
  Coins, 
  Banknote, 
  Calculator, 
  TrendingUp, 
  RefreshCw, 
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Hammer,
  Users2,
  HeartHandshake,
  AlertTriangle,
  Wallet,
  Scale,
  Zap,
  Activity
} from "lucide-react";
import { getRkkdPagus } from "@/lib/rkkdStore";

interface ApbdesInfografisBoardProps {
  onNavigateToApbdes?: () => void;
  isHackerTheme?: boolean;
}

function formatRupiah(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return "0";
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const formatted = absVal.toLocaleString("id-ID");
  return isNegative ? `(${formatted})` : formatted;
}

export function ApbdesInfografisBoard({ onNavigateToApbdes, isHackerTheme }: ApbdesInfografisBoardProps) {
  const [mounted, setMounted] = useState(false);
  const [showSyncNotice, setShowSyncNotice] = useState(false);

  // Realtime Financial Data State
  const [pendapatanData, setPendapatanData] = useState({
    pad: 1000000,
    dds: 1530723000,
    bhprd: 445623299,
    add: 916400000,
    banprov: 130000000,
    bankab: 1500000000
  });

  const [belanjaData, setBelanjaData] = useState({
    bidang1: 1522247183, // Penyelenggaraan Pemerintahan
    bidang2: 1922158000, // Pembangunan
    bidang3: 273755000,  // Pembinaan Kemasyarakatan
    bidang4: 46375000,   // Pemberdayaan Masyarakat
    bidang5: 226800000   // Penanggulangan Bencana & Mendesak
  });

  const [pembiayaanData, setPembiayaanData] = useState({
    silpaSebelumnya: 2476884,
    penyertaanModal: 306145000,
    pengeluaranLainnya: 228743000
  });

  // Calculate live totals
  const totalPendapatan = pendapatanData.pad + 
                          pendapatanData.dds + 
                          pendapatanData.bhprd + 
                          pendapatanData.add + 
                          pendapatanData.banprov + 
                          pendapatanData.bankab;

  const totalBelanja = belanjaData.bidang1 + 
                        belanjaData.bidang2 + 
                        belanjaData.bidang3 + 
                        belanjaData.bidang4 + 
                        belanjaData.bidang5;

  const surplusDefisit = totalPendapatan - totalBelanja;

  const totalPenerimaanPembiayaan = pembiayaanData.silpaSebelumnya;
  const totalPengeluaranPembiayaan = pembiayaanData.penyertaanModal + pembiayaanData.pengeluaranLainnya;
  const pembiayaanNetto = totalPenerimaanPembiayaan - totalPengeluaranPembiayaan;

  const silpaTahunBerjalan = surplusDefisit + pembiayaanNetto;

  // Realtime synchronization function
  const syncLiveData = () => {
    try {
      const rkkdPagus = getRkkdPagus();

      let updatedPendapatan = { ...pendapatanData };
      let updatedBelanja = { ...belanjaData };
      let updatedPembiayaan = { ...pembiayaanData };

      const savedPenStr = localStorage.getItem("apbdes_pendapatan_list_v1");
      if (savedPenStr) {
        const penItems: any[] = JSON.parse(savedPenStr);
        let padSum = 0, ddsSum = 0, pbhSum = 0, addSum = 0, pbpSum = 0, pbkSum = 0;
        
        penItems.forEach(p => {
          const s = (p.sumberDana || "").toUpperCase();
          const pagu = Number(p.paguAnggaran) || 0;
          if (s.includes("PAD")) padSum += pagu;
          else if (s.includes("DDS") || s.includes("DD")) ddsSum += pagu;
          else if (s.includes("PBH") || s.includes("BHPRD")) pbhSum += pagu;
          else if (s.includes("ADD")) addSum += pagu;
          else if (s.includes("PBP") || s.includes("BANPROV")) pbpSum += pagu;
          else if (s.includes("PBK") || s.includes("BANKEU") || s.includes("BANKAB")) pbkSum += pagu;
        });

        updatedPendapatan = {
          pad: padSum || 1000000,
          dds: rkkdPagus.DDS || ddsSum || 1530723000,
          bhprd: rkkdPagus.PBH || pbhSum || 445623299,
          add: rkkdPagus.ADD || addSum || 916400000,
          banprov: rkkdPagus.PBP || pbpSum || 130000000,
          bankab: rkkdPagus.PBK || pbkSum || 1500000000
        };
      } else {
        updatedPendapatan.add = rkkdPagus.ADD || 916400000;
        updatedPendapatan.dds = rkkdPagus.DDS || 1530723000;
        updatedPendapatan.bhprd = rkkdPagus.PBH || 445623299;
        updatedPendapatan.banprov = rkkdPagus.PBP || 130000000;
        updatedPendapatan.bankab = rkkdPagus.PBK || 1500000000;
      }

      const savedBelStr = localStorage.getItem("apbdes_belanja_list_v1");
      if (savedBelStr) {
        const belItems: any[] = JSON.parse(savedBelStr);
        let b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
        belItems.forEach(b => {
          const code = String(b.bidangCode || "1");
          const val = Number(b.anggaran) || 0;
          if (code === "1") b1 += val;
          else if (code === "2") b2 += val;
          else if (code === "3") b3 += val;
          else if (code === "4") b4 += val;
          else if (code === "5") b5 += val;
        });

        updatedBelanja = {
          bidang1: b1 || 1522247183,
          bidang2: b2 || 1922158000,
          bidang3: b3 || 273755000,
          bidang4: b4 || 46375000,
          bidang5: b5 || 226800000
        };
      }

      setPendapatanData(updatedPendapatan);
      setBelanjaData(updatedBelanja);
      setPembiayaanData(updatedPembiayaan);
    } catch (err) {
      console.error("Error syncing Executive Board:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    syncLiveData();

    window.addEventListener("rkkd_pagu_updated", syncLiveData);
    window.addEventListener("storage", syncLiveData);
    return () => {
      window.removeEventListener("rkkd_pagu_updated", syncLiveData);
      window.removeEventListener("storage", syncLiveData);
    };
  }, []);

  const handleManualRefresh = () => {
    syncLiveData();
    setShowSyncNotice(true);
    setTimeout(() => setShowSyncNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP TITLE CONTROL BAR & REALTIME STATUS                      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0 animate-pulse-slow">
            <PieChart size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                Pusat Analisis Keuangan APBDes 2026
                <Sparkles size={16} className="text-amber-500 animate-spin" />
              </h2>
            </div>
            <p className="text-slate-500 text-xs font-medium mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Realtime RKKD Active
              </span>
              <span>• Konsolidasi Otomatis Pendapatan, Belanja 5 Bidang & SiLPA</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end relative z-10">
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Sinkronkan Ulang Data dengan RKKD"
          >
            <RefreshCw size={15} className={showSyncNotice ? "animate-spin text-emerald-600" : ""} />
            <span>Sinkronkan RKKD</span>
          </button>

          {onNavigateToApbdes && (
            <button
              onClick={onNavigateToApbdes}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <ExternalLink size={15} /> <span>Detail APBDes (Lampiran 1)</span>
            </button>
          )}
        </div>
      </div>

      {showSyncNotice && (
        <div className="p-3.5 bg-emerald-600 text-white font-extrabold text-xs rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={18} /> Data Statistik APBDes berhasil disinkronkan realtime dari RKKD & local state!
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. 4 KEY PERFORMANCE METRIC CARDS (EPIC EXECUTIVE STATS)       */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL PENDAPATAN */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 border border-emerald-500/30">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
              <Coins size={16} /> Total Pendapatan
            </span>
            <span className="p-1.5 rounded-xl bg-white/20 text-white shadow-xs">
              <ArrowDownRight size={16} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight relative z-10">
            Rp {totalPendapatan.toLocaleString("id-ID")}
          </p>
          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-emerald-100 relative z-10">
            <span>6 Sumber Pendapatan</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">100% Target</span>
          </div>
        </div>

        {/* TOTAL BELANJA */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 border border-slate-800">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:scale-150 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Banknote size={16} className="text-rose-400" /> Total Belanja Desa
            </span>
            <span className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 shadow-xs">
              <ArrowUpRight size={16} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight relative z-10 text-white">
            Rp {totalBelanja.toLocaleString("id-ID")}
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 relative z-10">
            <span>5 Bidang Utama</span>
            <span className="text-rose-400 font-mono text-[10px] font-black">
              {((totalBelanja / totalPendapatan) * 100).toFixed(1)}% Alokasi
            </span>
          </div>
        </div>

        {/* SURPLUS / DEFISIT */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 border border-blue-500/30">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-black uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
              <TrendingUp size={16} /> Surplus / (Defisit)
            </span>
            <span className="p-1.5 rounded-xl bg-white/20 text-white shadow-xs">
              <Scale size={16} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight relative z-10">
            Rp {formatRupiah(surplusDefisit)}
          </p>
          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-blue-100 relative z-10">
            <span>Status Kas APBDes</span>
            <span className="bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
              Surplus Terjaga
            </span>
          </div>
        </div>

        {/* SILPA TAHUN BERJALAN */}
        <div className="bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 border border-violet-500/30">
          <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-black uppercase tracking-wider text-violet-100 flex items-center gap-1.5">
              <Calculator size={16} /> SiLPA Tahun Berjalan
            </span>
            <span className="p-1.5 rounded-xl bg-white/20 text-white shadow-xs">
              <Wallet size={16} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight relative z-10">
            Rp {formatRupiah(silpaTahunBerjalan)}
          </p>
          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-violet-100 relative z-10">
            <span>Net Pembiayaan</span>
            <span className="font-mono text-[10px]">Rp {formatRupiah(pembiayaanNetto)}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. DUAL PANEL: PENDAPATAN VS BELANJA 5 BIDANG (DENSE GRID)    */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT PANEL: BREAKDOWN PENDAPATAN DESA (COL SPAN 5) */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Coins className="text-emerald-600 animate-pulse" size={18} /> Breakdown Pendapatan Desa
              </h3>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                6 Sumber Dana
              </span>
            </div>

            <div className="space-y-3">
              {[
                { key: "DDS", name: "Dana Desa (DDS)", val: pendapatanData.dds, color: "bg-emerald-500", textCol: "text-emerald-700" },
                { key: "PBK", name: "Bantuan Keuangan Kabupaten (PBK)", val: pendapatanData.bankab, color: "bg-blue-600", textCol: "text-blue-700" },
                { key: "ADD", name: "Alokasi Dana Desa (ADD)", val: pendapatanData.add, color: "bg-teal-500", textCol: "text-teal-700" },
                { key: "PBH", name: "Bagi Hasil Pajak & Retribusi (PBH)", val: pendapatanData.bhprd, color: "bg-amber-500", textCol: "text-amber-700" },
                { key: "PBP", name: "Bantuan Keuangan Provinsi (PBP)", val: pendapatanData.banprov, color: "bg-indigo-600", textCol: "text-indigo-700" },
                { key: "PAD", name: "Pendapatan Asli Desa (PAD)", val: pendapatanData.pad, color: "bg-slate-700", textCol: "text-slate-800" }
              ].map(item => {
                const pct = ((item.val / totalPendapatan) * 100).toFixed(1);
                return (
                  <div key={item.key} className="space-y-1 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all hover:bg-white group">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color} group-hover:scale-125 transition-transform`} /> {item.name}
                      </span>
                      <span className={`font-black font-mono ${item.textCol}`}>Rp {item.val.toLocaleString("id-ID")}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className={`h-2 rounded-full ${item.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 font-mono w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100">
            <span className="font-black text-slate-800 text-xs uppercase font-sans">TOTAL PENDAPATAN KONSOLIDASI</span>
            <span className="font-black text-emerald-700 font-mono text-base">Rp {totalPendapatan.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* RIGHT PANEL: ALOKASI BELANJA PER-BIDANG (COL SPAN 7) */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="text-rose-600 animate-pulse" size={18} /> Alokasi Belanja Desa Per-Bidang
              </h3>
              <span className="text-[10px] font-black text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                5 Bidang Utama
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Bidang 1 */}
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-4 rounded-3xl shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-white/20 group-hover:rotate-12 transition-transform">
                    <Building2 size={18} />
                  </span>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full font-mono">
                    {((belanjaData.bidang1 / totalBelanja) * 100).toFixed(1)}% Share
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-orange-100 leading-tight">
                    1. Penyelenggaraan Pemerintahan Desa
                  </h4>
                  <p className="text-lg font-black font-mono mt-1 text-white">
                    Rp {belanjaData.bidang1.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Bidang 2 */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-3xl shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-white/20 group-hover:rotate-12 transition-transform">
                    <Hammer size={18} />
                  </span>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full font-mono">
                    {((belanjaData.bidang2 / totalBelanja) * 100).toFixed(1)}% Share
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-100 leading-tight">
                    2. Pelaksanaan Pembangunan Desa
                  </h4>
                  <p className="text-lg font-black font-mono mt-1 text-white">
                    Rp {belanjaData.bidang2.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Bidang 3 */}
              <div className="bg-gradient-to-br from-cyan-600 to-teal-800 text-white p-4 rounded-3xl shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-white/20 group-hover:rotate-12 transition-transform">
                    <Users2 size={18} />
                  </span>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full font-mono">
                    {((belanjaData.bidang3 / totalBelanja) * 100).toFixed(1)}% Share
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-cyan-100 leading-tight">
                    3. Pembinaan Kemasyarakatan
                  </h4>
                  <p className="text-lg font-black font-mono mt-1 text-white">
                    Rp {belanjaData.bidang3.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Bidang 5 */}
              <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 p-4 rounded-3xl shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-slate-900/15 group-hover:rotate-12 transition-transform">
                    <AlertTriangle size={18} />
                  </span>
                  <span className="text-[10px] font-black bg-slate-900/15 px-2 py-0.5 rounded-full font-mono">
                    {((belanjaData.bidang5 / totalBelanja) * 100).toFixed(1)}% Share
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900 leading-tight">
                    5. Penanggulangan Bencana & Mendesak
                  </h4>
                  <p className="text-lg font-black font-mono mt-1 text-slate-950">
                    Rp {belanjaData.bidang5.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Bidang 4 Full Width */}
              <div className="sm:col-span-2 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white p-4 rounded-3xl shadow-md hover:scale-[1.01] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 group">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-white/20 shrink-0 group-hover:rotate-12 transition-transform">
                    <HeartHandshake size={20} />
                  </span>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-100">
                      4. Pemberdayaan Masyarakat
                    </h4>
                    <p className="text-xs text-purple-200 font-medium">Pembinaan Karang Taruna, PKK, & Lembaga Desa</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black font-mono text-white">
                    Rp {belanjaData.bidang4.toLocaleString("id-ID")}
                  </p>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full font-mono">
                    {((belanjaData.bidang4 / totalBelanja) * 100).toFixed(1)}% Share
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm">
            <span className="font-black uppercase text-xs font-sans">TOTAL ALOKASI BELANJA DESA</span>
            <span className="font-black font-mono text-base text-rose-400">Rp {totalBelanja.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. PEMBIAYAAN & SILPA SECTION                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Calculator className="text-violet-600 animate-pulse" size={18} /> Struktur Pembiayaan Desa & Netto
          </h3>
          <span className="text-[10px] font-black text-violet-800 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
            SILPA Tahun Berjalan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-all">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Penerimaan Pembiayaan</span>
            <p className="text-lg font-black font-mono text-slate-900">Rp {pembiayaanData.silpaSebelumnya.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-slate-500 font-medium">SiLPA Tahun Sebelumnya</p>
          </div>

          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-all">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Pengeluaran Pembiayaan</span>
            <p className="text-lg font-black font-mono text-rose-700">Rp {totalPengeluaranPembiayaan.toLocaleString("id-ID")}</p>
            <p className="text-[11px] text-slate-500 font-medium">Penyertaan Modal + Lainnya</p>
          </div>

          <div className="p-4 rounded-3xl bg-violet-50 border border-violet-200 space-y-2 hover:border-violet-300 transition-all">
            <span className="text-[10px] font-black text-violet-800 uppercase tracking-widest block">Pembiayaan Netto</span>
            <p className="text-lg font-black font-mono text-violet-900">Rp {formatRupiah(pembiayaanNetto)}</p>
            <p className="text-[11px] text-violet-700 font-medium">Netto Penerimaan - Pengeluaran</p>
          </div>
        </div>
      </div>
    </div>
  );
}
