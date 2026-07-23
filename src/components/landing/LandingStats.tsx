"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Users, HeartPulse, Activity, Zap, PieChart, Layers } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

const CountUp = ({ end, duration = 2000 }: { end: number, duration?: number }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        const el = elementRef.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.1 }
        );
        if (el) observer.observe(el);
        return () => {
            if (el) observer.unobserve(el);
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        
        let animationFrameId: number;
        let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const currentCount = Math.floor(progress * end);
            
            if (currentCount !== countRef.current) {
                setCount(currentCount);
                countRef.current = currentCount;
            }

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };
        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isVisible, end, duration]);

    return <span ref={elementRef}>{count.toLocaleString()}</span>;
};

// SVG Radial Progress Gauge for Visual Tech Ratio
const CircularGauge = ({ percentage, color, label }: { percentage: number, color: string, label: string }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center relative group">
            <svg className="w-24 h-24 transform -rotate-90">
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                />
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-white">{percentage.toFixed(1)}%</span>
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-2">{label}</span>
        </div>
    );
};

interface LandingStatsProps {
    statsData: any;
}

export const LandingStats = ({ statsData }: LandingStatsProps) => {
    const [activeTab, setActiveTab] = useState<'wilayah' | 'demografi'>('wilayah');

    // Calculate percentage ratios
    const totalWarga = statsData?.totalWarga || 0;
    const totalLaki = statsData?.totalLaki || 0;
    const totalPerempuan = statsData?.totalPerempuan || 0;

    const lakiPercentage = totalWarga > 0 ? (totalLaki / totalWarga) * 100 : 51.2;
    const perempuanPercentage = totalWarga > 0 ? (totalPerempuan / totalWarga) * 100 : 48.8;

    return (
        <div className="space-y-24">
            {/* COMMAND CENTER HEADER & TAB CONTROL */}
            <ScrollReveal>
                <div className="bg-slate-900/60 border border-cyan-500/20 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden">
                    {/* Header Aura & Top Scanner */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <h3 className="text-cyan-400 font-extrabold tracking-[0.25em] uppercase text-xs">
                                    COMMAND CENTER TELEMETRY
                                </h3>
                                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/40">
                                    LIVE SYNCED
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                                Data & Statistik Real-Time
                            </h2>
                        </div>

                        {/* Interactive Tab Switcher */}
                        <div className="flex items-center bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                            <button
                                onClick={() => setActiveTab('wilayah')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                                    activeTab === 'wilayah'
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Layers size={15} />
                                <span>Wilayah Administrasi</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('demografi')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                                    activeTab === 'demografi'
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <PieChart size={15} />
                                <span>Demografi & Gender</span>
                            </button>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* TAB CONTENT 1: WILAYAH ADMINISTRATIF */}
            {activeTab === 'wilayah' && (
                <section id="wilayah" className="scroll-mt-32">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        <ScrollReveal delay={0}>
                            <CyberStatCard
                                icon={MapIcon}
                                value={4}
                                unit="Wilayah"
                                label="Kepala Dusun"
                                color="cyan"
                                description="Terbagi dalam 4 area kerja Kadus terpadu"
                            />
                        </ScrollReveal>
                        <ScrollReveal delay={150}>
                            <CyberStatCard
                                icon={Users}
                                value={9}
                                unit="Wilayah RW"
                                label="Rukun Warga (RW)"
                                color="purple"
                                description="9 Zona RW dengan pengawasan data terpusat"
                            />
                        </ScrollReveal>
                        <ScrollReveal delay={300}>
                            <CyberStatCard
                                icon={HeartPulse}
                                value={32}
                                unit="Wilayah RT"
                                label="Rukun Tetangga (RT)"
                                color="emerald"
                                description="32 Titik RT aktif terpeta secara WebGIS"
                            />
                        </ScrollReveal>
                    </div>
                </section>
            )}

            {/* TAB CONTENT 2: DEMOGRAFI & GENDER BREAKDOWN */}
            {(activeTab === 'demografi' || statsData) && (
                <section id="statistik" className="scroll-mt-32 space-y-8">
                    {/* Primary Demographic Cards */}
                    {statsData && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                            <CyberSmallCard
                                label="Total Penduduk"
                                value={statsData.totalWarga}
                                color="cyan"
                                badge="Warga Terdaftar"
                            />
                            <CyberSmallCard
                                label="Total Kepala Keluarga"
                                value={statsData.totalKK}
                                color="indigo"
                                badge="KK Terdata"
                            />
                            <CyberSmallCard
                                label="Laki-laki"
                                value={statsData.totalLaki}
                                color="blue"
                                badge={`${lakiPercentage.toFixed(1)}% Ratio`}
                            />
                            <CyberSmallCard
                                label="Perempuan"
                                value={statsData.totalPerempuan}
                                color="pink"
                                badge={`${perempuanPercentage.toFixed(1)}% Ratio`}
                            />
                        </div>
                    )}

                    {/* Interactive Visual Ratio Panel */}
                    <ScrollReveal>
                        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-widest">
                                    <Activity size={16} /> Rasio Gender & Distribusi Demografi
                                </div>
                                <h3 className="text-2xl font-bold text-white">Visualisasi Distribusi Penduduk</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Perbandingan jumlah penduduk Laki-Laki dan Perempuan di Desa Cimanggu I tersinkronisasi secara otomatis melalui sistem sensus digital SDD.
                                </p>

                                {/* Visual Progress Bar */}
                                <div className="space-y-2 pt-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-cyan-400 flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                                            Laki-laki ({totalLaki.toLocaleString()})
                                        </span>
                                        <span className="text-pink-400 flex items-center gap-1.5">
                                            Perempuan ({totalPerempuan.toLocaleString()})
                                            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                                        </span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-white/10">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-l-full transition-all duration-1000 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                                            style={{ width: `${lakiPercentage}%` }}
                                        ></div>
                                        <div
                                            className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-r-full transition-all duration-1000 shadow-[0_0_12px_rgba(244,114,182,0.6)]"
                                            style={{ width: `${perempuanPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Radial Gauge Displays */}
                            <div className="flex items-center gap-8 bg-slate-950/60 p-6 rounded-2xl border border-white/10 shadow-inner">
                                <CircularGauge percentage={lakiPercentage} color="#06b6d4" label="Laki-Laki" />
                                <div className="w-px h-16 bg-white/10"></div>
                                <CircularGauge percentage={perempuanPercentage} color="#f472b6" label="Perempuan" />
                            </div>
                        </div>
                    </ScrollReveal>
                </section>
            )}
        </div>
    );
};

const CyberStatCard = ({ icon: Icon, value, unit, label, color, description }: any) => {
    const colorStyles: any = {
        cyan: {
            border: "border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.15)]",
            bgIcon: "bg-cyan-500/15 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
            textGlow: "text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
        },
        purple: {
            border: "border-purple-500/30 hover:border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.15)]",
            bgIcon: "bg-purple-500/15 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
            textGlow: "text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
        },
        emerald: {
            border: "border-emerald-500/30 hover:border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.15)]",
            bgIcon: "bg-emerald-500/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
            textGlow: "text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
        }
    };

    const style = colorStyles[color] || colorStyles.cyan;

    return (
        <div className={`group bg-slate-900/60 backdrop-blur-xl border rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col justify-between relative overflow-hidden ${style.border}`}>
            {/* Top Scanning Line Effect on Hover */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${style.bgIcon}`}>
                        <Icon size={28} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                        {unit}
                    </span>
                </div>

                <h2 className={`text-6xl font-black text-white mb-2 tracking-tight group-hover:scale-105 transition-transform origin-left ${style.textGlow}`}>
                    <CountUp end={value} />
                </h2>
                <h3 className="text-xl font-extrabold text-white mb-2">{label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                    <Zap size={12} className="text-yellow-400" /> WebGIS Synced
                </span>
                <span className="font-mono">STATUS: ACTIVE</span>
            </div>
        </div>
    );
};

const CyberSmallCard = ({ label, value, color, badge }: any) => {
    const colorMap: any = {
        cyan: "border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
        indigo: "border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]",
        blue: "border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]",
        pink: "border-pink-500/30 text-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.15)]"
    };

    return (
        <div className={`bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 group hover:border-cyan-500/40 relative overflow-hidden ${colorMap[color]}`}>
            <div className="flex justify-between items-start mb-3">
                <h4 className="text-slate-400 text-[11px] uppercase font-bold tracking-widest">{label}</h4>
                {badge && (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {badge}
                    </span>
                )}
            </div>
            <p className="text-4xl md:text-5xl font-black text-white tracking-tight group-hover:scale-105 transition-transform origin-left">
                <CountUp end={value} />
            </p>
            <div className="w-16 h-1 mt-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-60 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
};
