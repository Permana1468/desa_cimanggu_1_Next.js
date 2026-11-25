"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Wallet,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Coins,
  Scale
} from "lucide-react";
import Link from "next/link";
import { getRkkdPagus } from "@/lib/rkkdStore";

function formatSingkat(val: number): string {
  if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(2)} Miliar`;
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Juta`;
  return `Rp ${val.toLocaleString("id-ID")}`;
}

export function KeuanganDashboard({ session, stats }: { session: any, stats: any }) {
  const displayRole = "Kaur Keuangan & Pengelolaan APBDes";

  const [finances, setFinances] = useState({
    totalPendapatan: 4522746299,
    totalBelanja: 3991335183,
    serapanPercent: 88.2,
    sisaAnggaran: 531411116,
    danaDesa: 1530723000,
  });

  const calculateLiveApbdes = useCallback(() => {
    try {
      const rkkdPagus = getRkkdPagus();
      let padSum = 1000000;
      let ddsSum = rkkdPagus.DDS || 1530723000;
      let pbhSum = rkkdPagus.PBH || 445623299;
      let addSum = rkkdPagus.ADD || 916400000;
      let banprovSum = rkkdPagus.PBP || 130000000;
      let bankabSum = rkkdPagus.PBK || 1500000000;

      if (typeof window !== "undefined") {
        const savedPenStr = localStorage.getItem("apbdes_pendapatan_list_v1");
        if (savedPenStr) {
          const penItems: any[] = JSON.parse(savedPenStr);
          penItems.forEach(p => {
            const s = (p.sumberDana || "").toUpperCase();
            const pagu = Number(p.paguAnggaran) || 0;
            if (s.includes("PAD")) padSum += pagu;
            else if (s.includes("DDS") || s.includes("DD")) ddsSum = pagu;
            else if (s.includes("PBH") || s.includes("BHPRD")) pbhSum = pagu;
            else if (s.includes("ADD")) addSum = pagu;
            else if (s.includes("PBP") || s.includes("BANPROV")) banprovSum = pagu;
            else if (s.includes("PBK") || s.includes("BANKEU") || s.includes("BANKAB")) bankabSum = pagu;
          });
        }
      }

      const totalPendapatan = padSum + ddsSum + pbhSum + addSum + banprovSum + bankabSum;
      const bidang1 = 1522247183;
      const bidang2 = 1922158000;
      const bidang3 = 273755000;
      const bidang4 = 46375000;
      const bidang5 = 226800000;
      const totalBelanja = bidang1 + bidang2 + bidang3 + bidang4 + bidang5;

      const serapan = totalPendapatan > 0 ? (totalBelanja / totalPendapatan) * 100 : 0;
      const sisa = totalPendapatan - totalBelanja;

      setFinances({
        totalPendapatan,
        totalBelanja,
        serapanPercent: Number(serapan.toFixed(1)),
        sisaAnggaran: sisa,
        danaDesa: ddsSum,
      });
    } catch (e) {
      console.warn("Failed to calculate live APBDes in KeuanganDashboard:", e);
    }
  }, []);

  useEffect(() => {
    calculateLiveApbdes();

    const handleRefresh = () => calculateLiveApbdes();
    window.addEventListener("refresh-notifications", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    return () => {
      window.removeEventListener("refresh-notifications", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, [calculateLiveApbdes]);

  return (
    <div className="space-y-6">
      {/* HEADER CARD - AMBER/ORANGE */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-amber-900/15 border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-900/20 rounded-full blur-[60px] -ml-32 -mb-32 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                    <Wallet size={14} /> Keuangan & Anggaran Desa Riil
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm">
                    {displayRole}
                </h1>
                <p className="text-amber-100 max-w-xl leading-relaxed text-xs md:text-sm">
                    Halo, <span className="text-white font-bold">{session?.user?.name}</span>. Data alokasi belanja, serapan anggaran, dan ringkasan APBDes 2026 tersinkronisasi langsung dari modul perencanaan & kasir desa.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 shrink-0">
                <div className="bg-white/15 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-amber-100 mb-1 uppercase tracking-wider">Serapan Anggaran</span>
                    <span className="block text-3xl font-black text-white">{finances.serapanPercent}%</span>
                </div>
                <div className="bg-white/15 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-amber-100 mb-1 uppercase tracking-wider">Sisa Anggaran</span>
                    <span className="block text-xl font-black text-white mt-1">{formatSingkat(finances.sisaAnggaran)}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Konsolidasi APBDes 2026 (Live Data)</h2>
                        <p className="text-slate-500 text-sm">Alokasi pagu pendapatan dan realisasi belanja per bidang.</p>
                    </div>
                    <Link 
                      href="/dashboard?tab=apbdes"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <span>Buka Lembar APBDes</span>
                      <ExternalLink size={13} />
                    </Link>
                </div>
                
                <div className="space-y-4">
                    <div className="p-5 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-amber-200 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <ArrowDownRight size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Pendapatan Desa Konsolidasi</h4>
                                <span className="text-xs text-slate-400">Total 6 Sumber Dana (DDS, ADD, Banprov, Bankab, PBH, PAD)</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-emerald-600">{formatSingkat(finances.totalPendapatan)}</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">100% Pagu Ditetapkan</span>
                        </div>
                    </div>

                    <div className="p-5 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-amber-200 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                <ArrowUpRight size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Alokasi Belanja Desa</h4>
                                <span className="text-xs text-slate-400">5 Bidang Penyelenggaraan & Pembangunan</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-rose-600">{formatSingkat(finances.totalBelanja)}</span>
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{finances.serapanPercent}% Terplot</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-800 mb-4">Navigasi Keuangan</h2>
                <div className="grid grid-cols-2 gap-3">
                    <Link 
                      href="/dashboard?tab=rab"
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors text-center"
                    >
                        <FileSpreadsheet size={24} />
                        <span className="text-[10px] font-bold">RAB Pembangunan</span>
                    </Link>
                    <Link 
                      href="/dashboard?tab=apbdes"
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors text-center"
                    >
                        <PieChart size={24} />
                        <span className="text-[10px] font-bold">Infografis APBDes</span>
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
