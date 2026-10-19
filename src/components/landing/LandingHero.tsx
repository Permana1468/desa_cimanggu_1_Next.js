"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, 
    MapPin, 
    Store, 
    Users, 
    Send, 
    Sun, 
    Clock, 
    Calendar, 
    Megaphone, 
    Radio 
} from 'lucide-react';
import ScrollReveal from '../ScrollReveal';
import { useLandingTheme } from './LandingThemeProvider';
import { CampoSantoHero } from './CampoSantoHero';

interface HeroProps {
    siteData: any;
    heroImages: string[];
}

export const LandingHero = ({ siteData, heroImages }: HeroProps) => {
    const { isDualMode } = useLandingTheme();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [weather, setWeather] = useState<{ temp: number; text: string }>({ temp: 28, text: 'Cerah' });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(timer);
    }, [heroImages.length]);

    useEffect(() => {
        setCurrentTime(new Date());
        const clockTimer = setInterval(() => setCurrentTime(new Date()), 60000);

        const fetchWeather = async () => {
            try {
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.5944&longitude=106.7892&current_weather=true');
                const data = await res.json();
                if (data?.current_weather) {
                    const code = data.current_weather.weathercode;
                    let text = 'Cerah';
                    if (code >= 1 && code <= 3) text = 'Berawan';
                    else if (code >= 45 && code <= 48) text = 'Berkabut';
                    else if (code >= 51 && code <= 67) text = 'Hujan Ringan';
                    else if (code >= 71) text = 'Hujan Deras';

                    setWeather({
                        temp: Math.round(data.current_weather.temperature),
                        text
                    });
                }
            } catch (err) {
                console.error("Failed to fetch weather", err);
            }
        };
        fetchWeather();

        return () => clearInterval(clockTimer);
    }, []);

    if (isDualMode) {
        return <CampoSantoHero siteData={siteData} />;
    }

    return (
        <section id="beranda" className="relative min-h-[100dvh] flex flex-col justify-between px-4 sm:px-8 overflow-hidden pt-20 pb-16">
            {/* BACKGROUND CAROUSEL OR VIDEO WITH DYNAMIC CYBER OVERLAYS */}
            <div className="absolute inset-0 z-0 bg-[#060b17] overflow-hidden">
                {siteData?.hero_video ? (
                    <div className="absolute inset-0 opacity-100 z-10">
                        <video
                            src={siteData.hero_video}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="object-cover object-center w-full h-full filter brightness-[0.8] contrast-[1.1]"
                        />
                    </div>
                ) : (
                    heroImages.map((src, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                        >
                            <Image
                                src={src}
                                alt={`Hero Slide ${index + 1}`}
                                fill
                                priority={index === 0}
                                sizes="100vw"
                                className={`object-cover object-center transition-transform duration-[14000ms] ease-out ${index === currentSlide ? 'scale-110 translate-y-0' : 'scale-100 translate-y-2'
                                    }`}
                            />
                        </div>
                    ))
                )}

                {/* Cyber Gradient Vignette Overlays */}
                <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#060a17]/90 via-[#060a17]/70 to-[#060b17]"></div>
                <div className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/30 to-black/80"></div>

                {/* Seamless Bottom Gradient Transition to Purple Section (Matching Desktop) */}
                <div className="absolute bottom-0 left-0 w-full h-44 bg-gradient-to-t from-purple-950 via-purple-950/60 to-transparent z-25 pointer-events-none"></div>

                {/* Animated Vertical Cyber Scanner Line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 z-25 animate-laser-scan pointer-events-none"></div>
            </div>

            {/* HERO CONTENT */}
            <div className="relative z-30 w-full flex flex-col items-center justify-center gap-6 mt-4">
                
                {/* Mobile Kades Photo - 3D Pop Out Effect */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-44 h-44 sm:w-56 sm:h-56 mt-2"
                >
                    <motion.div 
                        animate={{ backgroundColor: ["rgba(245,158,11,0.4)", "rgba(16,185,129,0.4)", "rgba(245,158,11,0.4)"] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full backdrop-blur-sm border-2 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.15)]" 
                    />
                    
                    <div className="absolute inset-0 rounded-full overflow-hidden z-10 pointer-events-none">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[135%]">
                            <Image
                                src="/images/KADES_baru.png"
                                alt="Kepala Desa"
                                fill
                                priority
                                className="object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                            />
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[135%] z-20 pointer-events-none" style={{ clipPath: 'inset(0 0 40% 0)' }}>
                        <Image
                            src="/images/KADES_baru.png"
                            alt="Kepala Desa"
                            fill
                            priority
                            className="object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                        />
                    </div>

                    {/* Pill Name Tag */}
                    <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-40 w-[90%]"
                    >
                        <Link
                            href="/profil/sambutan"
                            className="flex flex-col items-center justify-center py-1.5 rounded-full bg-[#dcfce7] border-2 border-[#22c55e] text-slate-950 shadow-[0_5px_15px_rgba(34,197,94,0.4)]"
                        >
                            <span className="text-[11px] font-black uppercase tracking-wider underline decoration-[1.5px] underline-offset-2 mb-0.5">HERNAWAN M. SODIK</span>
                            <span className="text-[8px] uppercase tracking-widest font-extrabold text-slate-800">
                                KADES CIMANGGU I
                            </span>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Welcome Text Section */}
                <ScrollReveal delay={200} className="w-full mt-4">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-[1.5px] bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.25em] [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">Selamat Datang Di</span>
                            <span className="w-5 h-[1.5px] bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                        </div>
                        
                        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight uppercase tracking-wide [text-shadow:0_4px_8px_rgba(0,0,0,0.8)] mb-2">
                            {siteData?.title || "DESA CIMANGGU I"}
                        </h1>

                        <div className="inline-flex items-center px-3 py-1.5 bg-emerald-500/15 border border-emerald-400/30 rounded-full backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4)] mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Sistem Digitalisasi Desa</span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium px-4 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                            Melangkah maju dengan tata kelola pemerintahan yang <strong className="text-emerald-400 font-bold">transparan</strong> dan pelayanan publik yang <strong className="text-emerald-400 font-bold">cepat</strong>.
                        </p>
                    </div>
                </ScrollReveal>

                {/* Weather & Live Time Widget (Matched from Desktop) */}
                <ScrollReveal delay={250} className="w-full px-2">
                    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 flex items-center justify-between shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                                <Sun size={20} className="animate-[spin_20s_linear_infinite]" />
                            </div>
                            <div className="text-left">
                                <span className="text-xs font-black text-white block">{weather.temp}°C • {weather.text}</span>
                                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                    <Clock size={11} className="text-cyan-400" />
                                    {currentTime ? currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '00:00'} WIB
                                </span>
                            </div>
                        </div>

                        <div className="text-right border-l border-white/10 pl-3">
                            <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider block">Kondisi Wilayah</span>
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center justify-end gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Standby Online
                            </span>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Quick Feature Buttons Grid */}
                <ScrollReveal delay={300} className="w-full px-2">
                    <div className="grid grid-cols-4 gap-2">
                        <Link href="/profil/sejarah" className="flex flex-col items-center gap-1.5 bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-2.5 hover:bg-slate-800 transition-all">
                            <div className="w-9 h-9 rounded-full border border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)] flex items-center justify-center bg-emerald-950/60">
                                <MapPin className="text-emerald-400" size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Sejarah</span>
                        </Link>

                        <Link href="/umkm" className="flex flex-col items-center gap-1.5 bg-slate-900/50 border border-amber-500/30 rounded-2xl p-2.5 hover:bg-slate-800 transition-all">
                            <div className="w-9 h-9 rounded-full border border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)] flex items-center justify-center bg-amber-950/60">
                                <Store className="text-amber-400" size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">UMKM</span>
                        </Link>

                        <Link href="/organisasi/aparatur" className="flex flex-col items-center gap-1.5 bg-slate-900/50 border border-blue-500/30 rounded-2xl p-2.5 hover:bg-slate-800 transition-all">
                            <div className="w-9 h-9 rounded-full border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)] flex items-center justify-center bg-blue-950/60">
                                <Users className="text-blue-400" size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Aparatur</span>
                        </Link>

                        <Link href="/kontak" className="flex flex-col items-center gap-1.5 bg-slate-900/50 border border-purple-500/30 rounded-2xl p-2.5 hover:bg-slate-800 transition-all">
                            <div className="w-9 h-9 rounded-full border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)] flex items-center justify-center bg-purple-950/60">
                                <Send className="text-purple-400" size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Kontak</span>
                        </Link>
                    </div>
                </ScrollReveal>

                {/* Agenda & Pengumuman Mobile Cards (Matched from Desktop) */}
                <ScrollReveal delay={350} className="w-full px-2">
                    <div className="grid grid-cols-1 gap-2.5">
                        {/* Agenda Desa Card */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                                    <Calendar size={18} />
                                </div>
                                <div className="text-left">
                                    <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider block">Agenda Desa</span>
                                    <h4 className="text-xs font-bold text-white leading-tight">{siteData?.agenda_title || 'Penyuluhan Pertanian Digital'}</h4>
                                    <span className="text-[10px] text-slate-300">{siteData?.agenda_date || '20 OKT 2026 • Balai Desa'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Pengumuman Community Hub Card */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                                    <Megaphone size={18} />
                                </div>
                                <div className="text-left">
                                    <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider block">Community Hub</span>
                                    <h4 className="text-xs font-bold text-white leading-tight">{siteData?.pengumuman_title || 'Pengumuman: Lomba Kebersihan Lingkungan'}</h4>
                                </div>
                            </div>
                            <Link 
                                href={siteData?.pengumuman_link || "/informasi-publik"} 
                                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-extrabold text-[10px] uppercase tracking-wider shrink-0 hover:bg-cyan-500/30 transition-colors"
                            >
                                Info
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Main CTA Buttons */}
                <ScrollReveal delay={400} className="w-full px-2 mt-1">
                    <div className="flex flex-col gap-2.5 w-full">
                        <Link
                            href="/login"
                            className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 text-xs tracking-wide uppercase"
                        >
                            <ShieldCheck size={16} className="text-slate-950" />
                            <span>Masuk ke Sistem Digital</span>
                        </Link>

                        <a
                            href="#peta-interaktif"
                            className="w-full bg-slate-900/80 backdrop-blur-md text-white border border-cyan-500/40 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-cyan-200 uppercase tracking-wide"
                        >
                            <MapPin size={15} className="text-cyan-400" />
                            <span>Jelajahi WebGIS Desa</span>
                        </a>
                    </div>
                </ScrollReveal>
            </div>

            {/* Sponsor Logos Marquee (Matched from Desktop) */}
            <div className="relative z-30 w-full mt-6 overflow-hidden pointer-events-auto py-2" style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
                <motion.div 
                    animate={{ x: ["0%", "-50%"] }} 
                    transition={{ ease: "linear", duration: 20, repeat: Infinity }}
                    className="flex items-center gap-6 w-max"
                >
                    {[
                        '/images/logo-bogor.png', '/images/PUSKESOS-1.png', '/images/logo-katar.png',
                        '/images/dinsos.png', '/images/pokmas.png', '/images/PSM_v2.png',
                        '/images/ASTA_v2.png', '/images/BPBD_v2.png', '/images/DINKES_v2.png', '/images/DPMD.png',
                        // Duplicate for infinite loop
                        '/images/logo-bogor.png', '/images/PUSKESOS-1.png', '/images/logo-katar.png',
                        '/images/dinsos.png', '/images/pokmas.png', '/images/PSM_v2.png',
                        '/images/ASTA_v2.png', '/images/BPBD_v2.png', '/images/DINKES_v2.png', '/images/DPMD.png'
                    ].map((src, i) => (
                        <div key={i} className="relative w-8 h-8 shrink-0 opacity-70 grayscale hover:grayscale-0 transition-all">
                            <Image src={src} alt="Sponsor" fill className="object-contain" />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

