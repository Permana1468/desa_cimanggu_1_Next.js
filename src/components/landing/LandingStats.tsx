"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Users, HeartPulse, Activity, Zap, Layers, Sparkles } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';
import { useScrollProgress } from './DreamScrollCanvas';

const TickCountUp = ({ end, duration = 1400 }: { end: number, duration?: number }) => {
    const progress = useScrollProgress();
    const [displayCount, setDisplayCount] = useState(1);
    const hasAnimatedRef = useRef(false);

    // Active if in Parallax stage 2 (0.26-0.52) OR if standalone (progress === 0 or undefined)
    const isInStage = !progress || progress === 0 || (progress >= 0.26 && progress <= 0.52);

    useEffect(() => {
        // Reset animation trigger when scrolling out of stage
        if (!isInStage) {
            hasAnimatedRef.current = false;
            setDisplayCount(1);
            return;
        }

        if (hasAnimatedRef.current) return;
        hasAnimatedRef.current = true;

        let startTimestamp: number | null = null;
        let animationFrameId: number;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            const progressRatio = Math.min(elapsed / duration, 1);

            // Fast high-tech easeOutExpo ticking curve
            const easeOutExpo = progressRatio === 1 ? 1 : 1 - Math.pow(2, -10 * progressRatio);
            const currentVal = Math.floor(1 + easeOutExpo * (end - 1));

            setDisplayCount(currentVal);

            if (progressRatio < 1) {
                animationFrameId = requestAnimationFrame(step);
            } else {
                setDisplayCount(end);
            }
        };

        animationFrameId = requestAnimationFrame(step);

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isInStage, end, duration]);

    return <span>{displayCount.toLocaleString()}</span>;
};

interface LandingStatsProps {
    statsData: any;
}

export const LandingStats = ({ statsData }: LandingStatsProps) => {
    // Calculate population metrics & ratios
    const totalWarga = statsData?.totalWarga || 405;
    const totalKK = statsData?.totalKK || 121;
    const totalLaki = statsData?.totalLaki || 213;
    const totalPerempuan = statsData?.totalPerempuan || 192;

    const calculatedTotal = (totalLaki + totalPerempuan) > 0 ? (totalLaki + totalPerempuan) : totalWarga;
    const lakiPercentage = calculatedTotal > 0 ? (totalLaki / calculatedTotal) * 100 : 52.6;
    const perempuanPercentage = calculatedTotal > 0 ? (totalPerempuan / calculatedTotal) * 100 : 47.4;

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col justify-center items-center text-center space-y-8 lg:space-y-12 py-4">
            {/* 3D TITLE HEADER (Pure Floating Typography - Zero Box Cards) */}
            <ScrollReveal>
                <div className="flex flex-col items-center space-y-3">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/30 border border-yellow-400/40 text-yellow-300 font-extrabold text-[11px] uppercase tracking-[0.25em] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] backdrop-blur-md">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                        </span>
                        <span>TELEMETRI PUSAT KOMANDO • DATA & STATISTIK REAL-TIME</span>
                    </div>

                    <h2 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300 tracking-tight drop-shadow-[0_8px_30px_rgba(0,0,0,0.95)]">
                        Demografi & Territorial Desa
                    </h2>
                </div>
            </ScrollReveal>

            {/* MAIN DEMOGRAPHIC 3D MONOLITHS (Standing Numbers with Dynamic Fast-Ticking Animation) */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 items-end">
                {/* 1. Total Penduduk */}
                <ScrollReveal delay={0}>
                    <div className="flex flex-col items-center group transition-transform duration-500 hover:-translate-y-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] mb-1 flex items-center gap-1.5">
                            <Users size={14} className="text-yellow-400" /> JUMLAH PENDUDUK
                        </span>
                        <div className="text-5xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-yellow-500 tracking-tight drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]">
                            <TickCountUp end={totalWarga} duration={1400} />
                        </div>
                        <span className="text-xs font-extrabold text-slate-200 uppercase tracking-widest mt-1 drop-shadow">
                            Jiwa Terdaftar
                        </span>
                    </div>
                </ScrollReveal>

                {/* 2. Total Kepala Keluarga */}
                <ScrollReveal delay={100}>
                    <div className="flex flex-col items-center group transition-transform duration-500 hover:-translate-y-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] mb-1 flex items-center gap-1.5">
                            <Layers size={14} className="text-amber-400" /> KEPALA KELUARGA
                        </span>
                        <div className="text-5xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-yellow-500 tracking-tight drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]">
                            <TickCountUp end={totalKK} duration={1200} />
                        </div>
                        <span className="text-xs font-extrabold text-slate-200 uppercase tracking-widest mt-1 drop-shadow">
                            KK Terdata
                        </span>
                    </div>
                </ScrollReveal>

                {/* 3. Laki-Laki */}
                <ScrollReveal delay={200}>
                    <div className="flex flex-col items-center group transition-transform duration-500 hover:-translate-y-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] mb-1 flex items-center gap-1.5">
                            <Zap size={14} className="text-cyan-400" /> LAKI-LAKI
                        </span>
                        <div className="text-5xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-500 tracking-tight drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]">
                            <TickCountUp end={totalLaki} duration={1300} />
                        </div>
                        <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mt-1 drop-shadow">
                            {lakiPercentage.toFixed(1)}% Rasio
                        </span>
                    </div>
                </ScrollReveal>

                {/* 4. Perempuan */}
                <ScrollReveal delay={300}>
                    <div className="flex flex-col items-center group transition-transform duration-500 hover:-translate-y-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-pink-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] mb-1 flex items-center gap-1.5">
                            <HeartPulse size={14} className="text-pink-400" /> PEREMPUAN
                        </span>
                        <div className="text-5xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-pink-200 via-pink-400 to-rose-500 tracking-tight drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]">
                            <TickCountUp end={totalPerempuan} duration={1300} />
                        </div>
                        <span className="text-xs font-mono font-bold text-pink-300 uppercase tracking-wider mt-1 drop-shadow">
                            {perempuanPercentage.toFixed(1)}% Rasio
                        </span>
                    </div>
                </ScrollReveal>
            </div>

            {/* WILAYAH STRUCTURE ROW (4 Dusun, 9 RW, 32 RT - Pure Floating Text Monoliths with Ticking Numbers) */}
            <ScrollReveal delay={400}>
                <div className="w-full flex flex-wrap items-center justify-center gap-8 lg:gap-16 pt-4 border-t border-white/20">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl lg:text-5xl font-black text-amber-300 drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
                            <TickCountUp end={4} duration={800} />
                        </span>
                        <div className="text-left">
                            <div className="text-xs font-extrabold text-white uppercase tracking-wider">Kepala Dusun</div>
                            <div className="text-[10px] font-medium text-slate-200">Wilayah Kadus I - IV</div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/20 hidden sm:block"></div>

                    <div className="flex items-center gap-3">
                        <span className="text-4xl lg:text-5xl font-black text-amber-300 drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
                            <TickCountUp end={9} duration={900} />
                        </span>
                        <div className="text-left">
                            <div className="text-xs font-extrabold text-white uppercase tracking-wider">Rukun Warga (RW)</div>
                            <div className="text-[10px] font-medium text-slate-200">9 Zona Terintegrasi</div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/20 hidden sm:block"></div>

                    <div className="flex items-center gap-3">
                        <span className="text-4xl lg:text-5xl font-black text-amber-300 drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
                            <TickCountUp end={32} duration={1100} />
                        </span>
                        <div className="text-left">
                            <div className="text-xs font-extrabold text-white uppercase tracking-wider">Rukun Tetangga (RT)</div>
                            <div className="text-[10px] font-medium text-slate-200">32 Titik Terpeta WebGIS</div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* PURE FLOATING GENDER BALANCE BAR (No dark card boxes) */}
            <ScrollReveal delay={500}>
                <div className="w-full max-w-2xl mx-auto space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        <span className="text-cyan-300 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_10px_rgba(6,182,212,1)]"></span>
                            Laki-laki ({totalLaki})
                        </span>
                        <span className="text-xs text-yellow-300 font-extrabold tracking-widest uppercase flex items-center gap-1">
                            <Sparkles size={12} /> DISTRIBUSI DEMOGRAFI
                        </span>
                        <span className="text-pink-300 flex items-center gap-2">
                            Perempuan ({totalPerempuan})
                            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block shadow-[0_0_10px_rgba(244,114,182,1)]"></span>
                        </span>
                    </div>

                    <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden flex p-0.5 border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-cyan-300 rounded-l-full transition-all duration-1000 shadow-[0_0_15px_rgba(6,182,212,0.9)]"
                            style={{ width: `${lakiPercentage}%` }}
                        ></div>
                        <div
                            className="h-full bg-gradient-to-r from-pink-400 via-pink-500 to-rose-600 rounded-r-full transition-all duration-1000 shadow-[0_0_15px_rgba(244,114,182,0.9)]"
                            style={{ width: `${perempuanPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    );
};
