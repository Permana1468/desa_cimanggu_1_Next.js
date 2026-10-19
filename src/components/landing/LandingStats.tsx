"use client";
import React, { useEffect, useRef } from 'react';
import { useInView, animate } from 'framer-motion';
import { Users, FileText, HeartPulse, ShieldCheck, BarChart3, Sparkles, Layers, Zap } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

const TickCountUp = ({ end, duration = 1.4, suffix = '', prefix = '' }: { end: number, duration?: number, suffix?: string, prefix?: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-20px" });
    const actualDuration = duration > 50 ? duration / 1000 : duration;

    useEffect(() => {
        if (isInView && ref.current) {
            const controls = animate(0, end, {
                duration: actualDuration,
                ease: "easeOut",
                onUpdate(value) {
                    if (ref.current) {
                        ref.current.textContent = prefix + Math.floor(value).toLocaleString('id-ID') + suffix;
                    }
                }
            });
            return () => controls.stop();
        }
    }, [isInView, end, actualDuration, suffix, prefix]);

    return <span ref={ref}>{prefix}{end ? end.toLocaleString('id-ID') : 0}{suffix}</span>;
};

interface LandingStatsProps {
    statsData: any;
}

export const LandingStats = ({ statsData }: LandingStatsProps) => {
    const totalWarga = statsData?.totalWarga || 405;
    const totalKK = statsData?.totalKK || 121;
    const totalLaki = statsData?.totalLaki || 213;
    const totalPerempuan = statsData?.totalPerempuan || 192;

    const calculatedTotal = (totalLaki + totalPerempuan) > 0 ? (totalLaki + totalPerempuan) : totalWarga;
    const lakiPercentage = calculatedTotal > 0 ? (totalLaki / calculatedTotal) * 100 : 52.6;
    const perempuanPercentage = calculatedTotal > 0 ? (totalPerempuan / calculatedTotal) * 100 : 47.4;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
            {/* Header Matched from Desktop */}
            <ScrollReveal>
                <div className="text-center space-y-2.5">
                    <div className="inline-flex items-center gap-2 text-amber-400 font-extrabold tracking-widest uppercase text-xs">
                        <BarChart3 size={16} />
                        <span>TELEMETRI DEMOGRAFI REAL-TIME</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        Statistik Penduduk & Kesejahteraan
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm font-light max-w-lg mx-auto">
                        Sinkronisasi data kependudukan dan pemantauan jaminan sosial desa secara akurat dan transparan.
                    </p>
                </div>
            </ScrollReveal>

            {/* 4 Core Telemetry Cards Matched from Desktop */}
            <ScrollReveal delay={100}>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {/* 1. Total Penduduk */}
                    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-amber-400/50 transition-all text-center space-y-2 shadow-xl">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto mb-1 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <Users size={22} />
                        </div>
                        <span className="block text-2xl sm:text-4xl font-black text-white">
                            <TickCountUp end={totalWarga} />
                        </span>
                        <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                            Total Penduduk
                        </span>
                    </div>

                    {/* 2. Total Kepala Keluarga */}
                    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-cyan-400/50 transition-all text-center space-y-2 shadow-xl">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mx-auto mb-1 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            <FileText size={22} />
                        </div>
                        <span className="block text-2xl sm:text-4xl font-black text-white">
                            <TickCountUp end={totalKK} />
                        </span>
                        <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                            Kepala Keluarga (KK)
                        </span>
                    </div>

                    {/* 3. Cakupan UHC BPJS */}
                    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-emerald-400/50 transition-all text-center space-y-2 shadow-xl">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mx-auto mb-1 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                            <HeartPulse size={22} />
                        </div>
                        <span className="block text-2xl sm:text-4xl font-black text-white">
                            <TickCountUp end={100} suffix="%" />
                        </span>
                        <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                            Cakupan UHC BPJS
                        </span>
                    </div>

                    {/* 4. Posyandu Mawar 1-7 */}
                    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-purple-400/50 transition-all text-center space-y-2 shadow-xl">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400 mx-auto mb-1 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                            <ShieldCheck size={22} />
                        </div>
                        <span className="block text-2xl sm:text-4xl font-black text-white">
                            <TickCountUp end={7} suffix=" Posyandu" />
                        </span>
                        <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                            Posyandu Mawar 1-7
                        </span>
                    </div>
                </div>
            </ScrollReveal>

            {/* Demografi Gender Distribution Card */}
            <ScrollReveal delay={200}>
                <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex justify-between items-center text-xs font-black">
                        <span className="text-cyan-400 flex items-center gap-1.5">
                            <Zap size={14} />
                            Laki-laki ({totalLaki})
                        </span>
                        <span className="text-yellow-400 font-extrabold uppercase text-[10px] tracking-widest flex items-center gap-1">
                            <Sparkles size={12} /> DISTRIBUSI GENDER
                        </span>
                        <span className="text-pink-400 flex items-center gap-1.5">
                            <HeartPulse size={14} />
                            Perempuan ({totalPerempuan})
                        </span>
                    </div>

                    {/* Gender Dual Gradient Progress Bar */}
                    <div className="h-3.5 w-full bg-black/60 rounded-full overflow-hidden flex p-0.5 border border-white/20 shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-cyan-300 rounded-l-full transition-all duration-1000 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                            style={{ width: `${lakiPercentage}%` }}
                        />
                        <div
                            className="h-full bg-gradient-to-r from-pink-400 via-pink-500 to-rose-600 rounded-r-full transition-all duration-1000 shadow-[0_0_15px_rgba(244,114,182,0.8)]"
                            style={{ width: `${perempuanPercentage}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                        <span>{lakiPercentage.toFixed(1)}% Rasio Laki-laki</span>
                        <span>{perempuanPercentage.toFixed(1)}% Rasio Perempuan</span>
                    </div>
                </div>
            </ScrollReveal>

            {/* Territorial Breakdown Cards (Kadus, RW, RT) */}
            <ScrollReveal delay={300}>
                <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl text-center space-y-1">
                        <span className="block text-2xl font-black text-amber-400">
                            <TickCountUp end={4} />
                        </span>
                        <span className="text-[10px] font-extrabold text-white uppercase block leading-tight">Kepala Dusun</span>
                        <span className="text-[9px] text-slate-400 block font-light">Kadus I - IV</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl text-center space-y-1">
                        <span className="block text-2xl font-black text-cyan-400">
                            <TickCountUp end={9} />
                        </span>
                        <span className="text-[10px] font-extrabold text-white uppercase block leading-tight">Rukun Warga (RW)</span>
                        <span className="text-[9px] text-slate-400 block font-light">9 Zona</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl text-center space-y-1">
                        <span className="block text-2xl font-black text-emerald-400">
                            <TickCountUp end={32} />
                        </span>
                        <span className="text-[10px] font-extrabold text-white uppercase block leading-tight">Rukun Tetangga (RT)</span>
                        <span className="text-[9px] text-slate-400 block font-light">32 Titik WebGIS</span>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    );
};
