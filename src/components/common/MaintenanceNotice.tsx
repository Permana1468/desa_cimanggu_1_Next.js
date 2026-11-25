"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  RefreshCw,
  Home,
  Lock,
  CheckCircle2,
  HardHat,
  Wrench,
  Code2,
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
  reason = "Tim pengembang sedang melakukan pembaruan fitur, peningkatan performa, dan penyesuaian sistem agar layanan berjalan lebih optimal.",
  category = "Layanan Desa",
  isGlobal = false,
  isMasterPreview = false,
  homeUrl = "/",
}: MaintenanceNoticeProps) {
  return (
    <div className="min-h-[78vh] w-full flex items-center justify-center p-3 sm:p-6 md:p-10 font-sans">
      <style jsx>{`
        @keyframes hazardSlide {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 56px 0;
          }
        }
        @keyframes workerBob {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes armWork {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-14deg);
          }
        }
        @keyframes sparkPulse {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
        .hazard-tape {
          background-image: repeating-linear-gradient(
            -45deg,
            #f59e0b,
            #f59e0b 14px,
            #0f172a 14px,
            #0f172a 28px
          );
          background-size: 56px 56px;
          animation: hazardSlide 2.2s linear infinite;
        }
        .worker-bob {
          animation: workerBob 2.4s ease-in-out infinite;
        }
        .arm-work {
          transform-origin: 148px 104px;
          animation: armWork 1.2s ease-in-out infinite;
        }
        .spark-pulse {
          animation: sparkPulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="w-full max-w-2xl bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/90 shadow-2xl shadow-slate-300/40 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Top Animated Police / Hazard Line */}
        <div className="hazard-tape h-3.5 w-full shadow-inner" />
        <div className="bg-slate-900 text-amber-400 text-[10px] font-black tracking-[0.2em] uppercase py-1.5 px-4 text-center flex items-center justify-center gap-3">
          <span>⚠ ZONA PEMELIHARAAN SISTEM</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline">UNDER MAINTENANCE</span>
        </div>

        <div className="p-6 sm:p-9 md:p-10 text-center space-y-6 relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-80 h-36 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Master Admin Preview Banner */}
          {isMasterPreview && (
            <div className="bg-amber-50 border border-amber-300/80 text-amber-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
              <ShieldAlert size={16} className="text-amber-600 shrink-0" />
              <span>[Preview Admin Master] Tampilan ini yang dilihat pengguna umum saat mode maintenance aktif.</span>
            </div>
          )}

          {/* Animated Construction / Developer Maintenance Illustration */}
          <div className="relative mx-auto w-full max-w-[340px] pt-1">
            <svg
              viewBox="0 0 340 185"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-sm"
              aria-label="Ilustrasi teknisi sedang melakukan perbaikan sistem"
            >
              {/* Ground Shadow */}
              <ellipse cx="170" cy="170" rx="135" ry="9" fill="#E2E8F0" />

              {/* Rotating Background Gear */}
              <g className="origin-[235px_58px] animate-[spin_12s_linear_infinite]" opacity="0.22">
                <circle cx="235" cy="58" r="22" stroke="#0F172A" strokeWidth="6" strokeDasharray="8 6" />
                <circle cx="235" cy="58" r="9" fill="#F59E0B" />
              </g>
              <g className="origin-[96px_64px] animate-[spin_16s_linear_infinite_reverse]" opacity="0.18">
                <circle cx="96" cy="64" r="16" stroke="#1D4ED8" strokeWidth="5" strokeDasharray="6 5" />
                <circle cx="96" cy="64" r="6" fill="#1D4ED8" />
              </g>

              {/* Server / Code Screen Backdrop */}
              <rect x="115" y="34" width="110" height="72" rx="12" fill="#0F172A" />
              <rect x="122" y="42" width="96" height="52" rx="6" fill="#1E293B" />
              {/* Code Lines */}
              <rect x="130" y="50" width="42" height="5" rx="2.5" fill="#38BDF8" />
              <rect x="178" y="50" width="26" height="5" rx="2.5" fill="#F59E0B" />
              <rect x="130" y="61" width="64" height="5" rx="2.5" fill="#94A3B8" opacity="0.7" />
              <rect x="130" y="72" width="35" height="5" rx="2.5" fill="#10B981" />
              <rect x="170" y="72" width="38" height="5" rx="2.5" fill="#64748B" opacity="0.6" />
              <rect x="130" y="83" width="52" height="5" rx="2.5" fill="#FBBF24" opacity="0.85" />

              {/* Animated Technician / Developer */}
              <g className="worker-bob">
                {/* Torso / Safety Vest */}
                <path
                  d="M144 102 C144 92, 196 92, 196 102 L200 138 L140 138 Z"
                  fill="#F59E0B"
                />
                {/* Vest Reflective Stripes */}
                <rect x="148" y="114" width="44" height="4" rx="2" fill="#FEF3C7" />
                <rect x="146" y="124" width="48" height="4" rx="2" fill="#FEF3C7" />

                {/* Head */}
                <circle cx="170" cy="80" r="15" fill="#FDBA74" />
                {/* Eyes */}
                <circle cx="165" cy="80" r="1.8" fill="#0F172A" />
                <circle cx="175" cy="80" r="1.8" fill="#0F172A" />
                {/* Smile */}
                <path d="M166 86 Q170 89 174 86" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" fill="none" />

                {/* Safety Helmet */}
                <path d="M153 76 C153 63, 187 63, 187 76 Z" fill="#EAB308" />
                <rect x="150" y="74" width="40" height="4.5" rx="2.2" fill="#CA8A04" />
                <rect x="167" y="64" width="6" height="10" rx="2" fill="#FEF08A" />

                {/* Working Arm with Wrench */}
                <g className="arm-work">
                  <path
                    d="M148 104 L124 114"
                    stroke="#0F172A"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  <circle cx="122" cy="114" r="5" fill="#FDBA74" />
                  {/* Wrench */}
                  <path
                    d="M119 112 L106 98"
                    stroke="#64748B"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  <circle cx="104" cy="96" r="5" stroke="#475569" strokeWidth="3" fill="#E2E8F0" />
                </g>

                {/* Right Arm */}
                <path
                  d="M192 104 L212 116"
                  stroke="#0F172A"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <circle cx="214" cy="117" r="5" fill="#FDBA74" />
              </g>

              {/* Spark / Work Indicator */}
              <g className="spark-pulse">
                <path d="M96 88 L100 80 L104 88 L112 92 L104 96 L100 104 L96 96 L88 92 Z" fill="#F59E0B" />
              </g>

              {/* Construction Safety Barrier (Pagar Pembatas) */}
              {/* Barrier Posts */}
              <rect x="52" y="128" width="7" height="40" rx="3" fill="#334155" />
              <rect x="281" y="128" width="7" height="40" rx="3" fill="#334155" />
              {/* Barrier Top Bar (Orange/White Striped) */}
              <rect x="46" y="132" width="248" height="14" rx="4" fill="#EA580C" />
              <path d="M68 132 L80 132 L70 146 L58 146 Z" fill="#FFFFFF" />
              <path d="M108 132 L120 132 L110 146 L98 146 Z" fill="#FFFFFF" />
              <path d="M148 132 L160 132 L150 146 L138 146 Z" fill="#FFFFFF" />
              <path d="M188 132 L200 132 L190 146 L178 146 Z" fill="#FFFFFF" />
              <path d="M228 132 L240 132 L230 146 L218 146 Z" fill="#FFFFFF" />
              <path d="M268 132 L280 132 L270 146 L258 146 Z" fill="#FFFFFF" />

              {/* Police Line Tape Across Barrier */}
              <rect x="34" y="149" width="272" height="9" rx="2" fill="#FACC15" stroke="#0F172A" strokeWidth="1.2" />
              <path d="M52 149 L60 149 L54 158 L46 158 Z" fill="#0F172A" />
              <path d="M84 149 L92 149 L86 158 L78 158 Z" fill="#0F172A" />
              <path d="M116 149 L124 149 L118 158 L110 158 Z" fill="#0F172A" />
              <path d="M148 149 L156 149 L150 158 L142 158 Z" fill="#0F172A" />
              <path d="M180 149 L188 149 L182 158 L174 158 Z" fill="#0F172A" />
              <path d="M212 149 L220 149 L214 158 L206 158 Z" fill="#0F172A" />
              <path d="M244 149 L252 149 L246 158 L238 158 Z" fill="#0F172A" />
              <path d="M276 149 L284 149 L278 158 L270 158 Z" fill="#0F172A" />

              {/* Left Traffic Cone */}
              <path d="M30 168 L42 138 L50 138 L62 168 Z" fill="#F97316" />
              <rect x="36" y="152" width="20" height="4.5" rx="1" fill="#FFFFFF" />
              <rect x="25" y="166" width="42" height="5" rx="2.5" fill="#1E293B" />

              {/* Right Traffic Cone */}
              <path d="M278 168 L290 138 L298 138 L310 168 Z" fill="#F97316" />
              <rect x="284" y="152" width="20" height="4.5" rx="1" fill="#FFFFFF" />
              <rect x="273" y="166" width="42" height="5" rx="2.5" fill="#1E293B" />
            </svg>
          </div>

          {/* Header & Status Badge */}
          <div className="space-y-2.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black uppercase tracking-wider">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600" />
              </span>
              {isGlobal ? "Portal Sedang Dalam Perbaikan" : "Sedang Dalam Pemeliharaan & Pengembangan"}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {featureName}
            </h1>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">
              <Wrench size={12} className="text-slate-500" />
              <span>Kategori: {category}</span>
            </div>
          </div>

          {/* Notice Card */}
          <div className="bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-lg mx-auto">
            <p className="text-slate-900 font-black mb-1 flex items-center justify-center gap-1.5">
              <HardHat size={15} className="text-amber-600" />
              <span>Informasi Pemeliharaan Sistem</span>
            </p>
            <p>{reason}</p>
          </div>

          {/* Status Telemetry Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Layanan</span>
              <span className="text-xs font-black text-amber-600 flex items-center gap-1.5 mt-1">
                <Wrench size={13} /> Sedang Diperbaiki
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Integritas Data</span>
              <span className="text-xs font-black text-emerald-600 flex items-center gap-1.5 mt-1">
                <CheckCircle2 size={13} /> 100% Aman Terjaga
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Akses Publik</span>
              <span className="text-xs font-black text-blue-600 flex items-center gap-1.5 mt-1">
                <Lock size={13} /> Terkunci Sementara
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={homeUrl}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-black transition-all shadow-lg shadow-slate-900/15 flex items-center justify-center gap-2 group"
            >
              <Home size={16} className="group-hover:-translate-y-0.5 transition-transform" />
              <span>Kembali ke Beranda</span>
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={15} />
              <span>Cek Status Terbaru</span>
            </button>
          </div>

          {/* Footer Note + Developer Info */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-medium">
            <span>Sistem Digital Desa Cimanggu I • Mode Pemeliharaan</span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 font-bold transition-colors"
            >
              <Code2 size={12} />
              <span>Akses Developer / Admin Master</span>
            </Link>
          </div>
        </div>

        {/* Bottom Animated Police / Hazard Line */}
        <div className="hazard-tape h-3 w-full" />
      </div>
    </div>
  );
}
