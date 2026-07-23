"use client";

import { useState, useEffect } from "react";
import { 
  Users, FileText, ClipboardList, Printer, Mail, ChevronRight,
  MonitorSmartphone, Sparkles, Activity, ShieldCheck, ExternalLink,
  ShoppingBag, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { getKarangTarunaPerformanceSummaryForKasiPelayanan } from "@/actions/karangTarunaPortal";

export function PelayananDashboard({ session, stats }: { session: any, stats: any }) {
  const roleName = session?.user?.role?.replace(/_/g, ' ') || "Pelayanan Administrasi";
  const [ktSummary, setKtSummary] = useState<any>(null);
  const [loadingKt, setLoadingKt] = useState(true);

  useEffect(() => {
    async function loadKt() {
      try {
        const data = await getKarangTarunaPerformanceSummaryForKasiPelayanan();
        setKtSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingKt(false);
      }
    }
    loadKt();
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER CARD - INDIGO */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-indigo-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/20 rounded-full blur-[60px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                    <MonitorSmartphone size={14} /> Tata Usaha & Pelayanan
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    {roleName}
                </h1>
                <p className="text-indigo-100 max-w-xl leading-relaxed text-sm">
                    Halo, <span className="text-white font-bold">{session?.user?.name}</span>. Kelola arsip desa, registrasi kependudukan, serta pantau rekapan kinerja Karang Taruna Desa secara real-time.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-indigo-100 mb-1 uppercase">Surat Masuk</span>
                    <span className="block text-3xl font-black text-white">24</span>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-indigo-100 mb-1 uppercase">Antrean Warga</span>
                    <span className="block text-3xl font-black text-white">5</span>
                </div>
            </div>
        </div>
      </div>

      {/* KARANG TARUNA INTEGRATION BANNER FOR KASI PELAYANAN */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-[2.5rem] p-6 sm:p-8 border border-indigo-500/20 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-xl">
              KT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Monitoring Kinerja Pemuda (Karang Taruna)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ✓ Real-Time Sync
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">Rekapan terintegrasi kegiatan pemuda, kewirausahaan UEP, dan keuangan kas Karang Taruna</p>
            </div>
          </div>

          <Link
            href="/karang-taruna"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            Buka Portal Dedicated <ExternalLink size={14} />
          </Link>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-indigo-500/20">
            <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider block">Anggota Pemuda Aktif</span>
            <span className="text-2xl font-black text-white mt-1 block">
              {loadingKt ? "..." : ktSummary?.activeMembersCount || 0} Orang
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-indigo-500/20">
            <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider block">Proker Berjalan</span>
            <span className="text-2xl font-black text-white mt-1 block">
              {loadingKt ? "..." : ktSummary?.runningProgramsCount || 0} Program
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-indigo-500/20">
            <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider block">Proker Selesai</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {loadingKt ? "..." : ktSummary?.completedProgramsCount || 0} Program
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-indigo-500/20">
            <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider block">Saldo Kas Terbuka</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block truncate">
              {loadingKt ? "..." : `Rp ${(ktSummary?.saldoKas || 0).toLocaleString("id-ID")}`}
            </span>
          </div>
        </div>

        {/* RECENT ACTIVITY LOGS FOR KASI PELAYANAN */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Laporan Kinerja Terbaru dari Anggota Karang Taruna</h3>
          {loadingKt ? (
            <p className="text-xs text-slate-400 italic">Memuat rekapan kegiatan...</p>
          ) : !ktSummary?.recentLogs || ktSummary.recentLogs.length === 0 ? (
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400 text-center">
              Belum ada masukan laporan kegiatan pemuda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {ktSummary.recentLogs.slice(0, 4).map((log: any) => (
                <div key={log.id} className="p-3 bg-slate-950/70 rounded-xl border border-indigo-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white truncate">{log.fileName}</span>
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">{log.category || "Sosial"}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{log.size || "Oleh: Anggota Karang Taruna"}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Antrean Loket Pelayanan</h2>
                        <p className="text-slate-500 text-sm">Proses dokumen warga yang menunggu di balai desa atau via online.</p>
                    </div>
                </div>
                <div className="p-12 text-center text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-2xl text-xs">
                    Semua antrean pelayanan telah diselesaikan.
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-800 mb-4">Pintasan Layanan</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer">
                        <Printer size={24} />
                        <span className="text-[10px] font-bold text-center">Cetak Surat</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                        <ClipboardList size={24} />
                        <span className="text-[10px] font-bold text-center">Buku Tamu</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                        <Users size={24} />
                        <span className="text-[10px] font-bold text-center">Mutasi Warga</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                        <Mail size={24} />
                        <span className="text-[10px] font-bold text-center">Arsip Digital</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
