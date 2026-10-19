"use client";

import React from "react";
import Link from "next/link";
import { 
  Wrench, 
  ShieldAlert, 
  RefreshCw, 
  ArrowLeft, 
  Home, 
  Clock, 
  Lock, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";

interface MaintenanceNoticeProps {
  featureName?: string;
  reason?: string;
  category?: string;
  isGlobal?: boolean;
  isMasterPreview?: boolean;
  homeUrl?: string;
}

export function MaintenanceNotice({
  featureName = "Layanan Sistem",
  reason = "Sedang dalam proses pemeliharaan atau maintenance. Mohon menunggu beberapa saat selagi tim teknis melakukan pembaruan berkala.",
  category = "Layanan Desa",
  isGlobal = false,
  isMasterPreview = false,
  homeUrl = "/"
}: MaintenanceNoticeProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-6 sm:p-10 md:p-12 relative overflow-hidden text-center space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Ambient Top Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Master Admin Preview Banner */}
        {isMasterPreview && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
            <ShieldAlert size={16} className="text-amber-600 shrink-0" />
            <span>[Preview Master Admin] Tampilan ini yang dilihat oleh pengguna umum saat fitur di-OFF-kan.</span>
          </div>
        )}

        {/* Visual Icon Illustration */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-rose-500/15 to-blue-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-xl shadow-amber-500/10">
            <Wrench size={38} className="animate-bounce" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
            <ShieldAlert size={14} />
          </div>
        </div>

        {/* Header Titles */}
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            {isGlobal ? "PORTAL DALAM PEMELIHARAAN" : "FITUR SEDANG DALAM PEMELIHARAAN"}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {featureName}
          </h1>

          <div className="inline-block px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">
            Kategori: {category}
          </div>
        </div>

        {/* Notice Message Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-6 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-lg mx-auto">
          <p className="text-slate-800 font-bold mb-1">Pemberitahuan Sistem:</p>
          <p>{reason}</p>
        </div>

        {/* Telemetry Status Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-left">
          <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
            <span className="text-xs font-black text-amber-600 flex items-center gap-1.5 mt-0.5">
              <Clock size={12} /> Maintenance
            </span>
          </div>

          <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data Warga</span>
            <span className="text-xs font-black text-emerald-600 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 size={12} /> 100% Aman
            </span>
          </div>

          <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Keamanan</span>
            <span className="text-xs font-black text-blue-600 flex items-center gap-1.5 mt-0.5">
              <Lock size={12} /> Terproteksi
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={homeUrl}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-black transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 group"
          >
            <Home size={16} className="group-hover:-translate-y-0.5 transition-transform" />
            <span>Kembali ke Beranda</span>
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={15} />
            <span>Coba Lagi / Muat Ulang</span>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
          Pusat Kendali Administrasi Desa Cimanggu I • Dikontrol oleh Admin Master
        </p>
      </div>
    </div>
  );
}
