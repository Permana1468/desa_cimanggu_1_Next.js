"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Users, HeartPulse } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

const CountUp = ({ end, duration = 2000 }: { end: number, duration?: number }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.1 }
        );
        if (elementRef.current) observer.observe(elementRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        
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
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return <span ref={elementRef}>{count.toLocaleString()}</span>;
};

interface LandingStatsProps {
    statsData: any;
}

export const LandingStats = ({ statsData }: LandingStatsProps) => {
    return (
        <div className="space-y-32">
            {/* Wilayah Administratif */}
            <section id="wilayah" className="scroll-mt-32">
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <h3 className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-3">Statistik Demografi</h3>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white">Wilayah Administratif</h2>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    <ScrollReveal delay={0}>
                        <StatCardIcon icon={MapIcon} value={4} label="Kepala Dusun" color="blue" />
                    </ScrollReveal>
                    <ScrollReveal delay={200}>
                        <StatCardIcon icon={Users} value={9} label="Rukun Warga (RW)" color="purple" />
                    </ScrollReveal>
                    <ScrollReveal delay={400}>
                        <StatCardIcon icon={HeartPulse} value={32} label="Rukun Tetangga (RT)" color="green" />
                    </ScrollReveal>
                </div>
            </section>

            {/* Statistik Penduduk */}
            {statsData && (
                <section id="statistik" className="scroll-mt-32">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <h3 className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-3">Data Penduduk</h3>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Statistik Kependudukan</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                            <StatCardSmall label="Total Penduduk" value={statsData.totalWarga} color="blue" />
                            <StatCardSmall label="Total Keluarga (KK)" value={statsData.totalKK} color="indigo" />
                            <StatCardSmall label="Laki-laki" value={statsData.totalLaki} color="blue" />
                            <StatCardSmall label="Perempuan" value={statsData.totalPerempuan} color="pink" />
                        </div>
                    </ScrollReveal>
                </section>
            )}
        </div>
    );
};

const StatCardIcon = ({ icon: Icon, value, label, color }: any) => {
    const colors: any = {
        blue: "from-blue-900/40 border-blue-500/20 hover:border-blue-500/50 text-blue-400 bg-blue-500/10",
        purple: "from-purple-900/40 border-purple-500/20 hover:border-purple-500/50 text-purple-400 bg-purple-500/10",
        green: "from-green-900/40 border-green-500/20 hover:border-green-500/50 text-green-400 bg-green-500/10"
    };

    return (
        <div className={`bg-gradient-to-br to-slate-900/80 border rounded-3xl p-8 text-center transition-colors group h-full flex flex-col justify-center ${colors[color]}`}>
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                color === 'blue' ? 'bg-blue-500/10' : 
                color === 'purple' ? 'bg-purple-500/10' : 
                'bg-green-500/10'
            }`}>
                <Icon size={36} />
            </div>
            <h2 className="text-6xl font-black text-white mb-2 group-hover:text-inherit transition-colors">
                <CountUp end={value} />
            </h2>
            <p className="text-lg text-slate-400 font-medium uppercase tracking-widest">{label}</p>
        </div>
    );
};

const StatCardSmall = ({ label, value, color }: any) => {
    const borderColors: any = {
        blue: "hover:border-blue-500/30 text-blue-400 bg-blue-500/20",
        indigo: "hover:border-indigo-500/30 text-indigo-400 bg-indigo-500/20",
        pink: "hover:border-pink-500/30 text-pink-400 bg-pink-500/20"
    };

    return (
        <div className={`bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center shadow-xl transition-all group ${
            color === 'blue' ? 'hover:border-blue-500/30' :
            color === 'indigo' ? 'hover:border-indigo-500/30' :
            'hover:border-pink-500/30'
        }`}>
            <h4 className={`text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-4 transition-colors ${
                color === 'blue' ? 'group-hover:text-blue-400' :
                color === 'indigo' ? 'group-hover:text-indigo-400' :
                'group-hover:text-pink-400'
            }`}>{label}</h4>
            <p className={`text-4xl font-black text-white`}><CountUp end={value} /></p>
            <div className={`w-12 h-1 mx-auto mt-4 rounded-full ${
                color === 'blue' ? 'bg-blue-500/20' :
                color === 'indigo' ? 'bg-indigo-500/20' :
                'bg-pink-500/20'
            }`}></div>
        </div>
    );
}
