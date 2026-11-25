"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  Clock, 
  Activity,
  BellRing,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Building2
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PhysicalMutationAlertBanner } from "@/components/dashboard/mutasi/PhysicalMutationAlertBanner";
import { getPelayananQueues, getPelayananLoketStatus } from "@/actions/pelayanan";

export function DashboardUtama({ session, stats }: { session: any, stats: any }) {
  const userName = session?.user?.name || session?.user?.fullName || "Kasi Pelayanan";

  const [notifications] = useState([
    { id: 1, text: "Permohonan Surat Keterangan Usaha (SKU) baru dari Bpk. Budi.", time: "2 menit lalu", unread: true, tag: "Surat" },
    { id: 2, text: "Antrean loket A (Persuratan Offline) telah mencapai 14 pemohon.", time: "15 menit lalu", unread: true, tag: "Loket" },
    { id: 3, text: "Laporan mutasi kematian warga dari RT 02/RW 01 menunggu verifikasi fisik.", time: "30 menit lalu", unread: true, tag: "Mutasi" },
    { id: 4, text: "Laporan bulanan kependudukan periode berjalan siap ditinjau.", time: "1 jam lalu", unread: false, tag: "Kependudukan" }
  ]);

  // Live visitors & Loket status
  const [liveVisitors, setLiveVisitors] = useState(15);
  const [loketStatus, setLoketStatus] = useState<{
    loket1: { serving: string | null; waitingCount: number; status: "Sibuk" | "Siap Panggil" };
    loket2: { serving: string | null; waitingCount: number; status: "Sibuk" | "Siap Panggil" };
    loket3: { serving: string | null; waitingCount: number; status: "Sibuk" | "Siap Panggil" };
  }>({
    loket1: { serving: "A-001", waitingCount: 2, status: "Sibuk" },
    loket2: { serving: "Antrean: B-008", waitingCount: 1, status: "Siap Panggil" },
    loket3: { serving: "Antrean: C-003", waitingCount: 1, status: "Siap Panggil" },
  });

  const loadLoketData = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    try {
      const [queueRes, loketRes] = await Promise.all([
        getPelayananQueues(),
        getPelayananLoketStatus(),
      ]);
      if (queueRes.success) {
        setLiveVisitors(queueRes.stats.waiting + queueRes.stats.processing);
      }
      if (loketRes) {
        setLoketStatus(loketRes);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    loadLoketData();
    const handleRefresh = () => loadLoketData();
    window.addEventListener("refresh-notifications", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    const interval = setInterval(loadLoketData, 20000);
    return () => {
      window.removeEventListener("refresh-notifications", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      clearInterval(interval);
    };
  }, [loadLoketData]);

  // Weekly service stats data with realistic numbers
  const weeklyData = [
    { day: "Sen", total: 32, label: "Senin", surat: 20, adm: 12 },
    { day: "Sel", total: 45, label: "Selasa", surat: 28, adm: 17 },
    { day: "Rab", total: 28, label: "Rabu", surat: 18, adm: 10 },
    { day: "Kam", total: 54, label: "Kamis", surat: 35, adm: 19 },
    { day: "Jum", total: 38, label: "Jumat", surat: 25, adm: 13 },
    { day: "Sab", total: 18, label: "Sabtu", surat: 12, adm: 6 },
    { day: "Min", total: 6, label: "Minggu", surat: 4, adm: 2 }
  ];

  const maxWeekly = Math.max(...weeklyData.map(d => d.total));

  return (
    <div className="space-y-6">
      {/* 1. HEADER CARD - CLEAN, ROYAL NAVY / INDIGO ELEGANCE */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 rounded-[2.5rem] p-7 md:p-9 relative overflow-hidden shadow-xl shadow-indigo-900/15 border border-white/10"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-[90px] -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/15 rounded-full blur-[70px] -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 text-white max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md shadow-sm">
              <Building2 size={13} className="text-cyan-300" />
              <span>Seksi Pelayanan & Administrasi Warga</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">
              Dashboard Pelayanan Masyarakat
            </h1>
            
            <p className="text-blue-100/90 text-xs md:text-sm leading-relaxed">
              Selamat bertugas, <strong className="text-white font-black">{userName}</strong>. Pantau pergerakan antrean loket, status verifikasi berkas fisik, dan penerbitan surat secara real-time.
            </p>
          </div>

          {/* Quick Metrics Inside Header */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider">Antrean Aktif</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="mt-2 text-3xl font-black text-white">{liveVisitors}</div>
              <div className="mt-1 text-[10px] text-cyan-200 flex items-center gap-1 font-semibold">
                <TrendingUp size={11} className="text-emerald-300" /> +2 jam ini
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Surat Selesai</span>
                <CheckCircle2 size={14} className="text-emerald-300" />
              </div>
              <div className="mt-2 text-3xl font-black text-white">{stats?.suratCount || 45}</div>
              <div className="mt-1 text-[10px] text-blue-200 font-semibold">
                Hari ini
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. PERINGATAN MUTASI BERKAS FISIK (Multi-Role Alert Banner) */}
      <PhysicalMutationAlertBanner role="KASI_PELAYANAN" />

      {/* 3. MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLUMNS: CHART & KEY STATS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Activity size={18} className="text-blue-600" />
                  <span>Statistik Pelayanan Warga</span>
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Akumulasi kunjungan loket dan permohonan persuratan 7 hari terakhir.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60">
                  Total: <strong className="text-blue-600 font-extrabold">221 Layanan</strong>
                </span>
                <Link
                  href="/dashboard?tab=tracking-layanan"
                  className="text-xs font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1"
                >
                  <span>Detail</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

            {/* Interactive Bar Chart Visualization with Visible Values */}
            <div className="pt-4 pb-2">
              <div className="h-56 flex items-end justify-between gap-3 px-2 border-b border-dashed border-slate-200">
                {weeklyData.map((d, i) => {
                  const heightPercent = Math.max(15, Math.round((d.total / maxWeekly) * 100));
                  const isPeak = d.total === maxWeekly;

                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl transition-all shadow-xl whitespace-nowrap z-20 flex items-center gap-1.5">
                        <span>{d.label}:</span>
                        <span className="text-cyan-400 font-black">{d.total} Layanan</span>
                      </div>

                      {/* Bar Value Indicator */}
                      <span className="text-[11px] font-mono font-bold text-slate-600 mb-1.5 group-hover:text-blue-600 transition-colors">
                        {d.total}
                      </span>

                      {/* Vibrant Gradient Bar */}
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className={`w-full max-w-[48px] rounded-t-2xl transition-all relative ${
                          isPeak
                            ? "bg-gradient-to-t from-blue-700 via-indigo-600 to-cyan-400 shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/30"
                            : "bg-gradient-to-t from-slate-200 via-blue-500/70 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        }`}
                      >
                        {/* Top cap highlight */}
                        <div className="w-full h-1.5 bg-white/40 rounded-t-2xl" />
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              {/* Day Labels */}
              <div className="flex items-center justify-between gap-3 px-2 mt-3">
                {weeklyData.map((d) => (
                  <div key={d.day} className="flex-1 text-center">
                    <span className="text-xs font-black text-slate-700 tracking-tight block">
                      {d.day}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 block -mt-0.5">
                      {d.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 3 Balanced Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1: Keluhan / Aduan */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
                <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                  Perlu Respon
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">2 Aduan</div>
                <p className="text-slate-500 text-xs mt-0.5">Keluhan pelayanan warga dalam proses tindak lanjut.</p>
              </div>
              <Link
                href="/dashboard?tab=tracking-layanan"
                className="mt-3 text-[11px] font-extrabold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <span>Tinjau Aduan</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {/* Card 2: Total Warga Terlayani */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Bulan Ini
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">128 Warga</div>
                <p className="text-slate-500 text-xs mt-0.5">Pemohon administrasi dan surat terlayani.</p>
              </div>
              <Link
                href="/dashboard/warga"
                className="mt-3 text-[11px] font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <span>Data Warga</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {/* Card 3: Kecepatan Layanan (SLA) */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  Efisiensi SLA
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">± 7 Menit</div>
                <p className="text-slate-500 text-xs mt-0.5">Rata-rata waktu pencetakan dan verifikasi per surat.</p>
              </div>
              <div className="mt-3 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Standar Prima Tercapai</span>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: STATUS LOKET & NOTIFIKASI */}
        <div className="space-y-6">

          {/* Loket Pelayanan Live Status */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Status Loket Terpadu</span>
              </h3>
              <Link
                href="/dashboard?tab=antrian-loket"
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
              >
                Atur Loket
              </Link>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-800">Loket 1: Persuratan & SKTM</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {loketStatus.loket1.status === "Sibuk" ? "Melayani: " : "Status: "}
                    <strong className="text-slate-800">{loketStatus.loket1.serving || "Kosong"}</strong>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                  loketStatus.loket1.status === "Sibuk"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {loketStatus.loket1.status}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-800">Loket 2: KTP & Kependudukan</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {loketStatus.loket2.status === "Sibuk" ? "Melayani: " : "Status: "}
                    <strong className="text-slate-800">{loketStatus.loket2.serving || "Kosong"}</strong>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                  loketStatus.loket2.status === "Sibuk"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {loketStatus.loket2.status}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-800">Loket 3: Konsultasi & Bansos</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {loketStatus.loket3.status === "Sibuk" ? "Melayani: " : "Status: "}
                    <strong className="text-slate-800">{loketStatus.loket3.serving || "Kosong"}</strong>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                  loketStatus.loket3.status === "Sibuk"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {loketStatus.loket3.status}
                </span>
              </div>
            </div>

            <Link
              href="/dashboard?tab=antrian-loket"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5"
            >
              <span>Buka Layanan Loket</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Notifikasi Pelayanan */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <BellRing size={16} className="text-blue-600" />
                <span>Pemberitahuan Pelayanan</span>
              </h3>
              <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {notifications.filter(n => n.unread).length} Baru
              </span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl transition-all border ${
                    notif.unread
                      ? "bg-blue-50/50 border-blue-200/70"
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100/60"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        notif.unread ? "bg-blue-600 animate-pulse" : "bg-slate-300"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-black uppercase text-blue-700 tracking-wider">
                          {notif.tag}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {notif.time}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 leading-snug ${
                        notif.unread ? "font-bold text-slate-900" : "font-medium text-slate-600"
                      }`}>
                        {notif.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard?tab=buat-surat"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5"
            >
              <FileText size={14} className="text-blue-600" />
              <span>Buat Permohonan Surat Baru</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
