"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, useSpring, useInView, animate } from 'framer-motion';

const LandingWebGIS = dynamic(() => import('./LandingWebGIS'), { ssr: false });
import {
    Search,
    ChevronRight,
    Sparkles,
    Globe,
    Compass,
    Radio,
    ShieldCheck,
    FileText,
    HeartPulse,
    Cpu,
    Users,
    ChevronLeft,
    CheckCircle2,
    ArrowUpRight,
    MapPin,
    BarChart3,
    Send,
    Layers,
    ChevronDown,
    Store,
    Sun,
    Calendar,
    Clock
} from 'lucide-react';
import { LandingOrganization } from './LandingOrganization';
import { LandingNews } from './LandingNews';
import { LandingAspiration } from './LandingAspiration';
import { useLandingTheme } from './LandingThemeProvider';
import { CampoSantoHero } from './CampoSantoHero';
import ScrollReveal from '../ScrollReveal';

interface DesktopParallaxLandingProps {
    siteData: any;
    statsRes: any;
    newsData: any[];
    orgData: any;
    lembagaRes: any[];
}

const AnimatedCounter = ({ end, duration = 2, suffix = '', prefix = '' }: { end: number, duration?: number, suffix?: string, prefix?: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView && ref.current) {
            const controls = animate(0, end, {
                duration,
                ease: "easeOut",
                onUpdate(value) {
                    if (ref.current) {
                        ref.current.textContent = prefix + Math.floor(value).toLocaleString('id-ID') + suffix;
                    }
                }
            });
            return () => controls.stop();
        }
    }, [isInView, end, duration, suffix, prefix]);

    return <span ref={ref}>{prefix}0{suffix}</span>;
};

export function DesktopParallaxLanding({
    siteData,
    statsRes,
    newsData,
    orgData,
    lembagaRes
}: DesktopParallaxLandingProps) {
    const { isDualMode, toggleDualMode, language, setLanguage } = useLandingTheme();

    const containerRef = useRef<HTMLDivElement>(null);
    const [heroBgIndex, setHeroBgIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFeatureTab, setActiveFeatureTab] = useState<'surat' | 'webgis' | 'posyandu' | 'tupoksi'>('surat');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [weather, setWeather] = useState<{ temp: number; text: string; }>({ temp: 28, text: 'Cerah' });

    useEffect(() => {
        // Live Clock
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute

        // Live Weather (Open-Meteo API for Bogor area roughly)
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

        return () => clearInterval(timer);
    }, []);

    // Scroll Progress for Smooth Downward Parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Smooth Spring for Fluid Physics
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Parallax Transforms for Multi-Layer Depth
    const heroBgScale = useTransform(smoothProgress, [0, 0.2], [1, 1.15]);
    const heroBgY = useTransform(smoothProgress, [0, 0.25], ["0%", "25%"]);
    const heroSubjectY = useTransform(smoothProgress, [0, 0.25], ["0%", "-18%"]);
    const heroSubjectScale = useTransform(smoothProgress, [0, 0.25], [1, 1.08]);
    const heroOverlayOpacity = useTransform(smoothProgress, [0, 0.15, 0.25], [0.1, 0.5, 0.95]);

    // Floating Golden Leaves Parallax Translations
    const leafY1 = useTransform(smoothProgress, [0, 0.3], [0, -140]);
    const leafY2 = useTransform(smoothProgress, [0, 0.3], [0, -220]);
    const leafY3 = useTransform(smoothProgress, [0, 0.3], [0, -180]);
    const leafY4 = useTransform(smoothProgress, [0, 0.3], [0, -260]);
    const leafRotate = useTransform(smoothProgress, [0, 0.3], [0, 45]);

    // Birds Silhouette Drift
    const birdsX = useTransform(smoothProgress, [0, 0.3], [0, 80]);

    // Mouse movement parallax for interactive depth
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 30;
            const y = (e.clientY / innerHeight - 0.5) * 30;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Scenery Carousel Images matching Reference Concept
    const heroSceneries = (Array.isArray(siteData?.gallery) && siteData.gallery.length > 0)
        ? siteData.gallery.map((item: any) => 
            typeof item === 'string' 
                ? { url: item, title: "", sub: "" }
                : { url: item.url || item.img, title: item.title || "", sub: item.sub || "" }
          )
        : [
            {
                url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop",
                title: "Desa Cimanggu I",
                sub: "Desa Cimanggu I"
            },
            {
                url: "/images/sawah.png",
                title: "Kawasan Hijau Subur",
                sub: "Pusat Ketahanan Pangan & Ekosistem Lokal"
            },
            {
                url: "/images/slide_1.webp",
                title: "Pemerintah Desa Digital",
                sub: "Layanan Terpadu Berbasis CyberNet SDD"
            }
        ];

    const nextScenery = () => {
        setHeroBgIndex((prev) => (prev + 1) % heroSceneries.length);
    };

    const prevScenery = () => {
        setHeroBgIndex((prev) => (prev - 1 + heroSceneries.length) % heroSceneries.length);
    };

    // Auto change background
    useEffect(() => {
        const timer = setInterval(() => {
            setHeroBgIndex((prev) => (prev + 1) % heroSceneries.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSceneries.length]);


    return (
        <div ref={containerRef} className="relative w-full bg-slate-950 text-white selection:bg-amber-400 selection:text-black font-sans overflow-x-hidden">

            {/* -------------------------------------------------------------------------- */}
            {/* TOP NAVBAR (Exact Reference Header Style: Logo, Menu, Search, Sign in, Sign up) */}
            {/* -------------------------------------------------------------------------- */}
            <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-md border-b border-white/10 py-3.5 px-6 xl:px-12 flex justify-between items-center">

                {/* Left: Brand Logo & Title */}
                <div className="flex items-center gap-3 group">
                    <Image
                        src={siteData?.logo || "/images/logo-bogor.png"}
                        alt="Logo"
                        width={36}
                        height={36}
                        className="object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-black text-base xl:text-lg tracking-tight uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                                {siteData?.title || "DESA CIMANGGU I"}
                            </span>
                            <span className="flex h-2 w-2 relative shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none">
                            KECAMATAN CIBUNGBULANG
                        </span>
                    </div>
                </div>

                {/* Center: Overhauled Navigation Menu Links */}
                <nav className="flex items-center gap-7 text-xs xl:text-sm font-extrabold uppercase tracking-wide z-50">
                    <Link href="/" className="text-amber-400 hover:text-amber-300 transition-colors drop-shadow-md">
                        {language === 'id' ? 'Beranda' : 'Home'}
                    </Link>
                    
                    {/* Dropdown Profil */}
                    <div className="relative group py-4">
                        <button className="text-slate-200 hover:text-amber-400 transition-colors drop-shadow-md uppercase font-extrabold flex items-center gap-1">
                            {language === 'id' ? 'Profil' : 'Profile'} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                        </button>
                        <div className="absolute left-0 top-full -mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col p-2 pointer-events-none group-hover:pointer-events-auto">
                            <Link href="/profil/sambutan" className="px-4 py-2.5 text-slate-300 hover:text-amber-400 hover:bg-white/5 rounded-lg text-xs font-bold transition-colors">{language === 'id' ? 'Sambutan Kepala Desa' : 'Village Head Remarks'}</Link>
                            <Link href="/profil/sejarah" className="px-4 py-2.5 text-slate-300 hover:text-amber-400 hover:bg-white/5 rounded-lg text-xs font-bold transition-colors">{language === 'id' ? 'Sejarah' : 'History'}</Link>
                            <Link href="/profil/visi-misi" className="px-4 py-2.5 text-slate-300 hover:text-amber-400 hover:bg-white/5 rounded-lg text-xs font-bold transition-colors">{language === 'id' ? 'Visi & Misi' : 'Vision & Mission'}</Link>
                        </div>
                    </div>

                    {/* Dropdown Organisasi */}
                    <div className="relative group py-4">
                        <button className="text-slate-200 hover:text-amber-400 transition-colors drop-shadow-md uppercase font-extrabold flex items-center gap-1">
                            {language === 'id' ? 'Organisasi' : 'Organization'} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                        </button>
                        <div className="absolute left-0 top-full -mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col p-2 pointer-events-none group-hover:pointer-events-auto">
                            <Link href="/organisasi/aparatur" className="px-4 py-2.5 text-slate-300 hover:text-amber-400 hover:bg-white/5 rounded-lg text-xs font-bold transition-colors">{language === 'id' ? 'Aparatur Desa' : 'Village Officials'}</Link>
                            <Link href="/organisasi/kelembagaan" className="px-4 py-2.5 text-slate-300 hover:text-amber-400 hover:bg-white/5 rounded-lg text-xs font-bold transition-colors">{language === 'id' ? 'Kelembagaan' : 'Institutions'}</Link>
                        </div>
                    </div>

                    <Link href="/#berita" className="text-slate-200 hover:text-amber-400 transition-colors drop-shadow-md">
                        {language === 'id' ? 'Berita & Informasi' : 'News & Info'}
                    </Link>
                    <Link href="/umkm" className="text-slate-200 hover:text-amber-400 transition-colors drop-shadow-md">
                        {language === 'id' ? 'UMKM' : 'Enterprise'}
                    </Link>
                    <Link href="/kontak" className="text-slate-200 hover:text-amber-400 transition-colors drop-shadow-md">
                        {language === 'id' ? 'Kontak' : 'Contact'}
                    </Link>
                </nav>

                {/* Right: Mode Toggle + Absensi + Sign In + Sign Up Button */}
                <div className="flex items-center gap-3">
                    <div className="relative group py-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-white/10 transition-colors cursor-pointer shadow-inner">
                            {language === 'id' ? (
                                <div className="w-4 h-4 rounded-full overflow-hidden flex flex-col border border-white/20 shrink-0">
                                    <div className="w-full h-1/2 bg-red-600"></div>
                                    <div className="w-full h-1/2 bg-white"></div>
                                </div>
                            ) : (
                                <div className="w-4 h-4 rounded-full overflow-hidden flex border border-white/20 shrink-0 relative bg-blue-800">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full h-[3px] bg-white absolute"></div>
                                        <div className="w-[3px] h-full bg-white absolute"></div>
                                        <div className="w-full h-[1px] bg-red-600 absolute"></div>
                                        <div className="w-[1px] h-full bg-red-600 absolute"></div>
                                    </div>
                                </div>
                            )}
                            <span className="text-slate-200 text-xs font-bold">{language === 'id' ? 'ID' : 'EN'}</span>
                            <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform" />
                        </button>
                        <div className="absolute right-0 top-full -mt-2 w-36 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col p-1.5 pointer-events-none group-hover:pointer-events-auto">
                            <button onClick={() => setLanguage('id')} className={`flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 rounded-lg text-xs font-bold transition-colors ${language === 'id' ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}>
                                <div className="w-4 h-4 rounded-full overflow-hidden flex flex-col border border-white/20 shrink-0">
                                    <div className="w-full h-1/2 bg-red-600"></div>
                                    <div className="w-full h-1/2 bg-white"></div>
                                </div>
                                Indonesia
                            </button>
                            <button onClick={() => setLanguage('en')} className={`flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 rounded-lg text-xs font-bold transition-colors ${language === 'en' ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}>
                                <div className="w-4 h-4 rounded-full overflow-hidden flex border border-white/20 shrink-0 relative bg-blue-800">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full h-[3px] bg-white absolute"></div>
                                        <div className="w-[3px] h-full bg-white absolute"></div>
                                        <div className="w-full h-[1px] bg-red-600 absolute"></div>
                                        <div className="w-[1px] h-full bg-red-600 absolute"></div>
                                    </div>
                                </div>
                                English
                            </button>
                        </div>
                    </div>

                    {/* CampoSanto Mode Toggle */}
                    <button
                        onClick={toggleDualMode}
                        className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center relative overflow-hidden group cursor-pointer ${isDualMode
                            ? 'border-amber-400 text-amber-300 bg-gradient-to-br from-amber-600/80 to-rose-600/80 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-105'
                            : 'border-white/20 text-cyan-400 bg-slate-800/80 hover:bg-slate-700 hover:scale-105 shadow-inner'
                            }`}
                        title={isDualMode ? "Matikan Mode CampoSanto" : "Aktifkan Mode CampoSanto"}
                    >
                        <Layers size={16} className={isDualMode ? "animate-pulse text-amber-200" : ""} />
                    </button>

                    {/* Absensi / Shield Button */}
                    <Link href="/absensi" className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 border border-white/20 transition-all shadow-inner group" title="Sistem Keamanan & Absensi">
                        <ShieldCheck size={16} className="group-hover:text-amber-400 transition-colors" />
                    </Link>

                    {/* Log In / Daftar Pill Button */}
                    <Link
                        href="/login"
                        className="px-5 py-1.5 rounded-full border border-amber-500/60 text-amber-400 hover:bg-amber-500/10 text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] ml-2"
                    >
                        LOG IN / DAFTAR
                    </Link>
                </div>
            </header>

            {/* -------------------------------------------------------------------------- */}
            {/* SECTION 1: HERO PARALLAX STAGE (Exact Visual Elements from Reference Images) */}
            {/* -------------------------------------------------------------------------- */}
            <section id="beranda" className="relative w-full h-[110vh] overflow-hidden flex flex-col justify-between pt-24 pb-12 px-6 xl:px-12">

                {/* Layer 0: Dynamic Background Scenery with Smooth Parallax Zoom */}
                <motion.div
                    style={{ scale: heroBgScale, y: heroBgY }}
                    className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                >
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
                            {/* Tambahan Overlay */}
                            <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                        </div>
                    ) : (
                        heroSceneries.map((scenery: any, index: number) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === heroBgIndex ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                <Image
                                    src={scenery.url || scenery.img || "/images/slide_1.webp"}
                                    alt="Hero Scenery"
                                    fill
                                    priority={index === 0}
                                    className="object-cover object-center filter brightness-[0.92] contrast-[1.05]"
                                />
                                {/* Tambahan Overlay */}
                                <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                            </div>
                        ))
                    )}

                    {/* Top to Bottom Sun Flare & Gradient Blur Atmosphere */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-purple-950/80 pointer-events-none" />

                    {/* Soft Vignette Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/70 pointer-events-none" />
                </motion.div>

                {/* Seamless Bottom Gradient Transition to Next Section */}
                <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-purple-950 to-transparent z-10 pointer-events-none" />

                {/* Layer 1: Birds Silhouette Flying Drifting across Sky */}
                <motion.div
                    style={{ x: birdsX }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-80"
                >
                    <svg width="240" height="70" viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 35 C25 25, 30 30, 35 35 C40 30, 45 25, 50 35" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M70 20 C74 12, 78 16, 82 20 C86 16, 90 12, 94 20" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                        <path d="M120 40 C123 33, 126 36, 129 40 C132 36, 135 33, 138 40" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                        <path d="M170 15 C173 10, 176 13, 179 15 C182 13, 185 10, 188 15" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                </motion.div>

                {/* Layer 2: Animated Tech Circuit Lines */}
                <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none opacity-60 mix-blend-screen">
                    <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 1000">
                        <defs>
                            <linearGradient id="glowLine1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="50%" stopColor="#34d399" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                            <linearGradient id="glowLine2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="50%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                        
                        <motion.path d="M-100,200 L300,200 L400,300 L1100,300" fill="none" stroke="url(#glowLine1)" strokeWidth="4" filter="blur(3px)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.path d="M-100,200 L300,200 L400,300 L1100,300" fill="none" stroke="#6ee7b7" strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />

                        <motion.path d="M1100,600 L700,600 L600,700 L-100,700" fill="none" stroke="url(#glowLine2)" strokeWidth="4" filter="blur(3px)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1 }}
                        />
                        <motion.path d="M1100,600 L700,600 L600,700 L-100,700" fill="none" stroke="#fcd34d" strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1 }}
                        />

                        <motion.path d="M-100,800 L200,800 L300,900 L1100,900" fill="none" stroke="url(#glowLine1)" strokeWidth="4" filter="blur(3px)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2.5 }}
                        />
                        <motion.path d="M-100,800 L200,800 L300,900 L1100,900" fill="none" stroke="#6ee7b7" strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2.5 }}
                        />
                    </svg>
                </div>
                
                {/* Layer 3: Central Foreground Featured Subject & Registration Button (Reference Image) */}
                <div className="relative z-30 w-full h-full flex flex-col justify-between items-center text-center">

                    {/* Left Side Welcome Text (Floating) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="hidden lg:flex absolute left-8 xl:left-16 top-[45%] -translate-y-1/2 z-40 pointer-events-auto text-left"
                    >
                        <motion.div
                            className="flex flex-col gap-5 w-[500px]"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="flex flex-col gap-1"
                            >
                                <div className="flex items-center gap-4 mb-2">
                                    <motion.span 
                                        initial={{ width: 0 }}
                                        animate={{ width: 48 }}
                                        transition={{ duration: 0.8, delay: 0.6 }}
                                        className="h-[2px] bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                                    ></motion.span>
                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-[0.3em] [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">Selamat Datang Di</span>
                                </div>
                                <motion.h2 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                    className="text-4xl xl:text-5xl font-black text-white leading-tight uppercase tracking-wide [text-shadow:0_4px_8px_rgba(0,0,0,0.8)] whitespace-nowrap"
                                >
                                    Desa Cimanggu I
                                </motion.h2>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                                className="flex items-center"
                            >
                                <div className="inline-flex items-center px-4 py-2 bg-emerald-500/15 border border-emerald-400/30 rounded-full backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:bg-emerald-500/25 transition-colors cursor-default">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2.5 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Sistem Digitalisasi Desa</span>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 1 }}
                                className="relative mt-2"
                            >
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: '100%' }}
                                    transition={{ duration: 0.8, delay: 1.2 }}
                                    className="absolute left-0 top-1 bottom-1 w-[2px] bg-gradient-to-b from-emerald-400/80 to-transparent"
                                ></motion.div>
                                <p className="text-sm xl:text-base text-slate-100 leading-relaxed font-medium pl-6 text-justify [text-shadow:0_2px_4px_rgba(0,0,0,0.8)] pr-2">
                                    Melangkah maju dengan tata kelola pemerintahan yang <strong className="text-emerald-400 font-bold">transparan</strong> dan pelayanan publik yang <strong className="text-emerald-400 font-bold">cepat</strong>. Kami mengintegrasikan potensi desa, pemberdayaan UMKM, dan kesejahteraan masyarakat secara terpadu.
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Right Side Info Text (Floating) */}
                    <div className="hidden lg:flex absolute right-6 xl:right-12 top-[55%] -translate-y-1/2 z-40 flex-col gap-10 w-72 pointer-events-auto mix-blend-screen text-right">
                        
                        {/* Weather / Time */}
                        <div className="flex flex-col gap-1.5 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-[0.25em] mb-1">Kondisi Saat Ini</span>
                            <div className="flex items-center justify-end gap-3">
                                <span className="text-5xl font-light text-white">{weather.temp}°C</span>
                                <Sun className="text-amber-400 animate-[spin_20s_linear_infinite]" size={36} />
                            </div>
                            <span className="text-xs text-slate-300 font-mono mt-1 flex items-center justify-end gap-2">
                                <Clock size={13} className="text-slate-400"/> {currentTime ? currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '00:00'} WIB • {weather.text}
                            </span>
                        </div>

                        {/* Agenda Desa */}
                        <div className="flex flex-col gap-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-[0.25em]">Agenda Desa</span>
                            <h4 className="text-lg font-bold text-white leading-tight">{siteData?.agenda_title || 'Penyuluhan Pertanian Digital'}</h4>
                            <span className="text-sm text-slate-300 border-r-2 border-amber-400/50 pr-3">{siteData?.agenda_date || '20 OKT 2026 • Balai Desa'}</span>
                        </div>

                        {/* Pengumuman */}
                        <div className="flex flex-col gap-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-[0.25em]">Community Hub</span>
                            <h4 className="text-lg font-bold text-white leading-tight">{siteData?.pengumuman_title || 'Pengumuman: Lomba Kebersihan Lingkungan'}</h4>
                            <Link href={siteData?.pengumuman_link || "/informasi-publik"} className="text-sm text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 transition-colors">
                                DAFTAR SEKARANG
                            </Link>
                        </div>

                        {/* Local Events Timeline */}
                        <div className="flex flex-col gap-3 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-[0.25em] flex items-center justify-end gap-2">
                                <Calendar size={13} /> Local Events
                            </span>
                            <div className="flex flex-col gap-3 border-r-2 border-slate-600/50 pr-4">
                                {(siteData?.local_events || [
                                    { title: "Penyuluhan Digital", date: "20 Okt", color: "amber" },
                                    { title: "Kegiatan Posyandu", date: "21 Okt", color: "emerald" }
                                ]).map((ev: any, i: number) => {
                                    const bgColor = ev.color === 'emerald' ? 'bg-emerald-400' : ev.color === 'blue' ? 'bg-blue-400' : ev.color === 'purple' ? 'bg-purple-400' : ev.color === 'rose' ? 'bg-rose-400' : 'bg-amber-400';
                                    const shadowColor = ev.color === 'emerald' ? '#34d399' : ev.color === 'blue' ? '#60a5fa' : ev.color === 'purple' ? '#c084fc' : ev.color === 'rose' ? '#fb7185' : '#fbbf24';
                                    
                                    return (
                                        <div key={i} className="relative">
                                            <div className={`absolute -right-[23px] top-1.5 w-2 h-2 rounded-full ${bgColor}`} style={{ boxShadow: `0 0 10px ${shadowColor}` }} />
                                            <p className="text-sm font-semibold text-white leading-snug">{ev.title}</p>
                                            <p className="text-xs text-slate-400">{ev.date}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Foreground Featured Subject Container with Scroll Parallax */}
                    <motion.div
                        style={{ y: heroSubjectY, scale: heroSubjectScale }}
                        className="relative flex flex-col items-center justify-center my-auto cursor-pointer group"
                    >
                        {/* Foreground Subject Image / Character with 3D Pop Out Effect */}
                        <div className="relative w-72 h-72 xl:w-96 xl:h-96 mt-12 mb-4">
                            {/* Animated Glassmorphism Color Background Circle */}
                            <motion.div 
                                animate={{ backgroundColor: ["rgba(245,158,11,0.4)", "rgba(59,130,246,0.4)", "rgba(139,92,246,0.4)", "rgba(236,72,153,0.4)", "rgba(16,185,129,0.4)", "rgba(245,158,11,0.4)"] }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full backdrop-blur-md border-[3px] border-white/30 shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_80px_rgba(255,255,255,0.25)] transition-all duration-700" 
                            />
                            
                            {/* Layer A: Image inside circle (Clips the sides & bottom) */}
                            <div className="absolute inset-0 rounded-full overflow-hidden z-10 pointer-events-none">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[135%]">
                                    <Image
                                        src="/images/KADES_baru.png"
                                        alt="Kepala Desa"
                                        fill
                                        priority
                                        className="object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] group-hover:scale-105 group-hover:-translate-y-4 transition-transform duration-700"
                                    />
                                </div>
                            </div>

                            {/* Layer B: Image top half (Pops out of the circle at the top) */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[135%] z-20 pointer-events-none" style={{ clipPath: 'inset(0 0 40% 0)' }}>
                                <Image
                                    src="/images/KADES_baru.png"
                                    alt="Kepala Desa"
                                    fill
                                    priority
                                    className="object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] group-hover:scale-105 group-hover:-translate-y-4 transition-transform duration-700"
                                />
                            </div>
                        </div>

                        {/* Exact Pill Button from Reference Image */}
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-40 -mt-[50px] sm:-mt-[70px] xl:-mt-[90px]"
                        >
                            <Link
                                href="/profil/sambutan"
                                className="inline-flex flex-col items-center justify-center px-8 sm:px-10 py-1.5 sm:py-2 rounded-full bg-[#dcfce7] border-[3px] border-[#22c55e] hover:bg-[#bbf7d0] text-slate-950 shadow-[0_10px_30px_rgba(34,197,94,0.4)] hover:shadow-[0_15px_40px_rgba(34,197,94,0.6)] transform hover:scale-105 transition-all duration-300"
                            >
                                <span className="text-sm sm:text-base font-black uppercase tracking-wider underline decoration-[2px] underline-offset-2 mb-0.5">HERNAWAN M. SODIK</span>
                                <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-extrabold text-slate-800">
                                    {language === 'id' ? 'KADES CIMANGGU I' : 'HEAD OF CIMANGGU I VILLAGE'}
                                </span>
                            </Link>
                        </motion.div>

                        {/* Quick Feature Hover Buttons */}
                        <div className="relative z-40 mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-2xl px-4">
                            <Link href="/profil/sejarah" className="group relative flex items-center bg-black/30 hover:bg-black/50 backdrop-blur-md border border-emerald-500/50 rounded-full p-1 hover:pr-4 transition-all duration-500 w-[44px] hover:w-[155px] overflow-hidden">
                                <div className="shrink-0 w-9 h-9 rounded-full border border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] flex items-center justify-center bg-emerald-950/60 z-10 transition-transform group-hover:rotate-12 group-hover:scale-110">
                                    <MapPin className="text-emerald-400" size={16} />
                                </div>
                                <span className="whitespace-nowrap ml-2.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    Sejarah Desa
                                </span>
                            </Link>
                            
                            <Link href="/umkm" className="group relative flex items-center bg-black/30 hover:bg-black/50 backdrop-blur-md border border-amber-500/50 rounded-full p-1 hover:pr-4 transition-all duration-500 w-[44px] hover:w-[155px] overflow-hidden">
                                <div className="shrink-0 w-9 h-9 rounded-full border border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] flex items-center justify-center bg-amber-950/60 z-10 transition-transform group-hover:rotate-12 group-hover:scale-110">
                                    <Store className="text-amber-400" size={16} />
                                </div>
                                <span className="whitespace-nowrap ml-2.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    Potensi UMKM
                                </span>
                            </Link>

                            <Link href="/organisasi/aparatur" className="group relative flex items-center bg-black/30 hover:bg-black/50 backdrop-blur-md border border-blue-500/50 rounded-full p-1 hover:pr-4 transition-all duration-500 w-[44px] hover:w-[155px] overflow-hidden">
                                <div className="shrink-0 w-9 h-9 rounded-full border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] flex items-center justify-center bg-blue-950/60 z-10 transition-transform group-hover:rotate-12 group-hover:scale-110">
                                    <Users className="text-blue-400" size={16} />
                                </div>
                                <span className="whitespace-nowrap ml-2.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    Aparatur Desa
                                </span>
                            </Link>

                            <Link href="/kontak" className="group relative flex items-center bg-black/30 hover:bg-black/50 backdrop-blur-md border border-purple-500/50 rounded-full p-1 hover:pr-4 transition-all duration-500 w-[44px] hover:w-[145px] overflow-hidden">
                                <div className="shrink-0 w-9 h-9 rounded-full border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)] flex items-center justify-center bg-purple-950/60 z-10 transition-transform group-hover:rotate-12 group-hover:scale-110">
                                    <Send className="text-purple-400" size={16} />
                                </div>
                                <span className="whitespace-nowrap ml-2.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    Kontak Kami
                                </span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Navigation buttons removed as per request */}

                    {/* Bottom Downward Scroll Hint into Dark Section */}
                    <div className="pb-20 flex flex-col items-center gap-1.5 opacity-90 animate-bounce relative z-20">
                        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-300">
                            Scroll Down to Explore
                        </span>
                        <div className="w-5 h-8 rounded-full border-2 border-amber-400/80 flex items-start justify-center p-1">
                            <div className="w-1 h-2 bg-amber-400 rounded-full animate-pulse" />
                        </div>
                    </div>

                    {/* Sponsor Logos Marquee */}
                    <div className="absolute bottom-16 sm:bottom-24 left-4 sm:left-8 z-50 w-48 sm:w-72 overflow-hidden pointer-events-auto" style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
                        <motion.div 
                            animate={{ x: ["0%", "-50%"] }} 
                            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
                            className="flex items-center gap-6 w-max"
                        >
                            {[
                                '/images/logo-bogor.png', '/images/PUSKESOS-1.png', '/images/logo-katar.png',
                                '/images/dinsos.png', '/images/pokmas.png', '/images/PSM_v2.png',
                                '/images/ASTA_v2.png', '/images/BPBD_v2.png', '/images/DINKES_v2.png', '/images/DPMD.png',
                                // Duplicate for seamless looping
                                '/images/logo-bogor.png', '/images/PUSKESOS-1.png', '/images/logo-katar.png',
                                '/images/dinsos.png', '/images/pokmas.png', '/images/PSM_v2.png',
                                '/images/ASTA_v2.png', '/images/BPBD_v2.png', '/images/DINKES_v2.png', '/images/DPMD.png'
                            ].map((src, i) => (
                                <div key={i} className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                                    <Image src={src} alt="Sponsor" fill className="object-contain" />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------------------------------- */}
            {/* SECTION 2: ABOUT US / SEKILAS PANDANG (Smooth Dark Deep Purple Gradient Fade - Image 2) */}
            {/* -------------------------------------------------------------------------- */}
            <section className="relative w-full py-24 px-6 xl:px-16 bg-gradient-to-b from-purple-950 via-slate-950 to-slate-950 z-20">
                <ScrollReveal>
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* Section Header: "About us" (Exact Typography from Reference Image 2) */}
                    <div className="text-center space-y-3">
                        <h2 className="text-4xl xl:text-5xl font-black text-amber-400 tracking-tight drop-shadow-[0_4px_25px_rgba(245,158,11,0.5)] font-serif italic">
                            About us
                        </h2>
                        <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto opacity-70" />
                    </div>

                    {/* About Us Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                        {/* Profile Image & Glow */}
                        <div className="lg:col-span-5 relative group">
                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-2 border-amber-400/30 shadow-[0_0_50px_rgba(168,85,247,0.3)] group-hover:border-amber-400 transition-all duration-500">
                                <Image
                                    src={siteData?.about_image || "/images/sawah.png"}
                                    alt="Profil Desa"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                                        <MapPin size={14} /> {language === 'id' ? 'KANTOR KEPALA DESA CIMANGGU I' : 'CIMANGGU I VILLAGE HEAD OFFICE'}
                                    </div>
                                    <p className="text-xs text-slate-300 mt-1">
                                        {language === 'id' ? 'Pusat Integrasi Data & Pelayanan Warga Berbasis WebGIS Digital.' : 'WebGIS-Based Digital Data Integration & Citizen Services Center.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Overview Details */}
                        <div className="lg:col-span-7 space-y-6 text-slate-200">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/50 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                                <Globe size={14} /> {language === 'id' ? 'IDENTITAS RESMI DESA' : 'OFFICIAL VILLAGE IDENTITY'}
                            </div>

                            <h3 className="text-3xl xl:text-4xl font-extrabold text-white leading-snug">
                                {siteData?.about_title || (language === 'id' ? "Sekilas Pandang Pemdes Cimanggu I" : "Overview of Cimanggu I Village")}
                            </h3>

                            <p className="text-slate-300 text-base leading-relaxed border-l-2 border-amber-400 pl-4 py-1 font-light">
                                {siteData?.about_text || (language === 'id' 
                                    ? "Desa Cimanggu I merupakan salah satu desa unggulan di Kecamatan Cibungbulang, Kabupaten Bogor. Berkomitmen menghadirkan tata kelola pemerintahan yang transparan, efisien, dan modern melalui pemanfaatan Sistem Digitalisasi Desa (SDD) terpadu." 
                                    : "Cimanggu I Village is one of the leading villages in Cibungbulang District, Bogor Regency. We are committed to providing transparent, efficient, and modern governance through the use of an integrated Village Digitalization System (SDD)."
                                )}
                            </p>

                            {/* Quick Highlight Stats */}
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                    <span className="block text-2xl xl:text-3xl font-black text-amber-400">
                                        <AnimatedCounter end={4} />
                                    </span>
                                    <span className="text-[11px] font-extrabold text-slate-300 uppercase">{language === 'id' ? 'Wilayah Dusun' : 'Hamlets'}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                    <span className="block text-2xl xl:text-3xl font-black text-cyan-400">
                                        <AnimatedCounter end={9} />
                                    </span>
                                    <span className="text-[11px] font-extrabold text-slate-300 uppercase">{language === 'id' ? 'Kawasan RW' : 'RW Areas'}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                    <span className="block text-2xl xl:text-3xl font-black text-emerald-400">
                                        <AnimatedCounter end={100} suffix="%" />
                                    </span>
                                    <span className="text-[11px] font-extrabold text-slate-300 uppercase">{language === 'id' ? 'Digital SDD' : 'SDD Digital'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </ScrollReveal>
            </section>

            {/* -------------------------------------------------------------------------- */}
            {/* SECTION 3: ROMBAK TOTAL KONSEP MENU & FITUR UTAMA DESKTOP */}
            {/* -------------------------------------------------------------------------- */}
            <section id="layanan-fitur" className="relative w-full py-24 px-6 xl:px-16 bg-slate-950 z-20 border-t border-white/10">
                <ScrollReveal>
                <div className="max-w-7xl mx-auto space-y-16">

                    {/* Section Header */}
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest">
                            <Cpu size={14} /> {language === 'id' ? 'EKOSISTEM INTERAKTIF DESA' : 'VILLAGE INTERACTIVE ECOSYSTEM'}
                        </div>
                        <h2 className="text-3xl xl:text-5xl font-black text-white tracking-tight">
                            {language === 'id' ? 'Fitur & Layanan Utama' : 'Key Features & Services'}
                        </h2>
                        <p className="text-slate-400 text-sm xl:text-base font-light">
                            {language === 'id' 
                                ? 'Platform terintegrasi yang menghubungkan administrasi warga, WebGIS pemetaan wilayah, pemantauan kesehatan Posyandu, hingga transparansi anggaran APBDes.' 
                                : 'An integrated platform connecting citizen administration, WebGIS mapping, Posyandu health monitoring, and APBDes budget transparency.'}
                        </p>
                    </div>

                    {/* Interactive 4 Core Feature Pillars Hub */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Feature Pillar 1: Portal Surat & UHC */}
                        <div className="group bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 rounded-3xl border border-white/15 hover:border-amber-400/60 transition-all duration-500 shadow-2xl hover:-translate-y-2 relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                                    <FileText size={28} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                                    {language === 'id' ? 'PELAYANAN WARGA' : 'CITIZEN SERVICES'}
                                </span>
                                <h3 className="text-xl font-extrabold text-white mt-3 mb-2 group-hover:text-amber-300 transition-colors">
                                    {language === 'id' ? 'E-Surat Mandiri & UHC' : 'Self-Service Letters & UHC'}
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed font-light">
                                    {language === 'id' 
                                        ? 'Pengajuan Surat Keterangan Desa (SKKM, SPTJM, Usulan UHC BPJS Kesehatan) secara online dengan pelacakan status berkas real-time.' 
                                        : 'Online submission of Village Certificates (SKKM, SPTJM, UHC BPJS Health Proposals) with real-time file status tracking.'}
                                </p>
                            </div>
                            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-bold text-amber-400">
                                <Link href="/login" className="flex items-center gap-1 hover:underline">
                                    <span>{language === 'id' ? 'Buka Portal Surat' : 'Open Letter Portal'}</span>
                                    <ArrowUpRight size={15} />
                                </Link>
                            </div>
                        </div>

                        {/* Feature Pillar 2: WebGIS Geospatial Radar */}
                        <div className="group bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 rounded-3xl border border-white/15 hover:border-cyan-400/60 transition-all duration-500 shadow-2xl hover:-translate-y-2 relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                                    <Compass size={28} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-400/20 px-2.5 py-1 rounded-full">
                                    {language === 'id' ? 'PEMETAAN REGIONAL' : 'REGIONAL MAPPING'}
                                </span>
                                <h3 className="text-xl font-extrabold text-white mt-3 mb-2 group-hover:text-cyan-300 transition-colors">
                                    {language === 'id' ? 'WebGIS Batas Wilayah' : 'WebGIS Regional Boundaries'}
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed font-light">
                                    {language === 'id' 
                                        ? 'Peta spasial interaktif Dusun 1-4, kawasan RW/RT, fasilitas umum, infrastruktur desa, serta pemetaan lokasi keluarga.' 
                                        : 'Interactive spatial map of Hamlets 1-4, RW/RT areas, public facilities, village infrastructure, and family location mapping.'}
                                </p>
                            </div>
                            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-bold text-cyan-400">
                                <a href="#webgis" className="flex items-center gap-1 hover:underline">
                                    <span>{language === 'id' ? 'Jelajahi WebGIS' : 'Explore WebGIS'}</span>
                                    <ArrowUpRight size={15} />
                                </a>
                            </div>
                        </div>

                        {/* Feature Pillar 3: E-KMS Posyandu Mawar */}
                        <div className="group bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 rounded-3xl border border-white/15 hover:border-emerald-400/60 transition-all duration-500 shadow-2xl hover:-translate-y-2 relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                    <HeartPulse size={28} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                                    HEALTH MONITORS
                                </span>
                                <h3 className="text-xl font-extrabold text-white mt-3 mb-2 group-hover:text-emerald-300 transition-colors">
                                    {language === 'id' ? 'E-KMS Posyandu Mawar' : 'E-KMS Mawar Clinic'}
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed font-light">
                                    {language === 'id' 
                                        ? 'Pencatatan digital tumbuh kembang balita dan lansia Posyandu Mawar 1 hingga 7 untuk deteksi pencegahan stunting.' 
                                        : 'Digital recording of toddler and elderly growth at Mawar Clinics 1 to 7 for stunting prevention detection.'}
                                </p>
                            </div>
                            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-bold text-emerald-400">
                                <Link href="/login" className="flex items-center gap-1 hover:underline">
                                    <span>{language === 'id' ? 'Lihat KMS Digital' : 'View Digital KMS'}</span>
                                    <ArrowUpRight size={15} />
                                </Link>
                            </div>
                        </div>

                        {/* Feature Pillar 4: Tupoksi & RAB Pemdes */}
                        <div className="group bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 rounded-3xl border border-white/15 hover:border-purple-400/60 transition-all duration-500 shadow-2xl hover:-translate-y-2 relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                                    <BarChart3 size={28} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-400/20 px-2.5 py-1 rounded-full">
                                    {language === 'id' ? 'MANAJEMEN PEMDES' : 'GOV MANAGEMENT'}
                                </span>
                                <h3 className="text-xl font-extrabold text-white mt-3 mb-2 group-hover:text-purple-300 transition-colors">
                                    {language === 'id' ? 'E-Tupoksi & RAB Desa' : 'E-Tasks & Village Budget'}
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed font-light">
                                    {language === 'id' 
                                        ? 'Modul khusus aparatur untuk penyusunan Rencana Anggaran Biaya (RAB), DED pembangunan, dan akuntabilitas laporan dana.' 
                                        : 'Special module for officials for drafting Budget Plans (RAB), development DED, and fund report accountability.'}
                                </p>
                            </div>
                            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-bold text-purple-400">
                                <Link href="/login" className="flex items-center gap-1 hover:underline">
                                    <span>{language === 'id' ? 'Akses Dashboard' : 'Access Dashboard'}</span>
                                    <ArrowUpRight size={15} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                </ScrollReveal>
            </section>

            {/* -------------------------------------------------------------------------- */}
            {/* SECTION 4: GEOSPATIAL COMMAND RADAR (WebGIS Interaktif) */}
            {/* -------------------------------------------------------------------------- */}
            <section id="webgis" className="relative w-full py-24 px-6 xl:px-16 bg-slate-950 z-20 border-t border-white/10">
                <ScrollReveal>
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 text-cyan-400 font-extrabold tracking-widest uppercase text-xs">
                            <Radio size={16} className="animate-pulse" />
                            <span>GEOSPATIAL COMMAND RADAR</span>
                        </div>
                        <h2 className="text-3xl xl:text-5xl font-black text-white tracking-tight">
                            {language === 'id' ? 'Peta Interaktif Desa' : 'Interactive Village Map'}
                        </h2>
                    </div>

                    <div className="rounded-3xl border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] grid grid-cols-1 lg:grid-cols-12 min-h-[480px] bg-slate-900/80 backdrop-blur-xl">

                        {/* Control Panel */}
                        <div className="lg:col-span-4 p-8 bg-slate-950/90 border-r border-white/10 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                    <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">
                                        {language === 'id' ? 'PILIH DUSUN & WILAYAH' : 'SELECT HAMLET & REGION'}
                                    </span>
                                    <span className="text-[10px] font-mono text-cyan-200 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                                        LAT: -6.5892°
                                    </span>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-400 text-cyan-300 flex justify-between items-center cursor-pointer">
                                        <div>
                                            <h4 className="font-extrabold text-sm">{language === 'id' ? 'Dusun 1' : 'Hamlet 1'}</h4>
                                            <p className="text-xs text-slate-400 font-light">{language === 'id' ? 'Mencakup RW 001, RW 002' : 'Includes RW 001, RW 002'}</p>
                                        </div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]" />
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/10 text-slate-300 hover:border-white/30 flex justify-between items-center cursor-pointer transition-colors">
                                        <div>
                                            <h4 className="font-extrabold text-sm">{language === 'id' ? 'Dusun 2' : 'Hamlet 2'}</h4>
                                            <p className="text-xs text-slate-400 font-light">{language === 'id' ? 'Mencakup RW 003, RW 008' : 'Includes RW 003, RW 008'}</p>
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/10 text-slate-300 hover:border-white/30 flex justify-between items-center cursor-pointer transition-colors">
                                        <div>
                                            <h4 className="font-extrabold text-sm">{language === 'id' ? 'Dusun 3' : 'Hamlet 3'}</h4>
                                            <p className="text-xs text-slate-400 font-light">{language === 'id' ? 'Mencakup RW 005, RW 006, RW 007' : 'Includes RW 005, RW 006, RW 007'}</p>
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/10 text-slate-300 hover:border-white/30 flex justify-between items-center cursor-pointer transition-colors">
                                        <div>
                                            <h4 className="font-extrabold text-sm">{language === 'id' ? 'Dusun 4' : 'Hamlet 4'}</h4>
                                            <p className="text-xs text-slate-400 font-light">{language === 'id' ? 'Mencakup RW 004, RW 009' : 'Includes RW 004, RW 009'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/dashboard/maps"
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all"
                            >
                                <span>{language === 'id' ? 'Buka WebGIS Layar Penuh' : 'Open Fullscreen WebGIS'}</span>
                                <ChevronRight size={16} />
                            </Link>
                        </div>

                        {/* Interactive Radar Sweep Map Screen */}
                        <div className="lg:col-span-8 relative group bg-slate-950 overflow-hidden flex items-center justify-center min-h-[350px]">
                            <LandingWebGIS />

                            {/* Rotating Radar Line Animation */}
                            <div className="absolute w-[500px] h-[500px] rounded-full border border-cyan-500/20 animate-radar-sweep pointer-events-none flex items-center justify-center z-10">
                                <div className="w-full h-0.5 bg-gradient-to-r from-cyan-400 via-transparent to-transparent" />
                            </div>

                            <div className="absolute w-64 h-64 rounded-full border border-cyan-500/20 pointer-events-none z-10" />
                            <div className="absolute w-36 h-36 rounded-full border border-cyan-500/30 pointer-events-none z-10" />
                            <div className="absolute w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)] animate-ping pointer-events-none z-10" />

                            <div className="absolute bottom-6 right-6 z-20">
                                <span className="block w-4 h-4 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_#34d399]" title="Online" />
                            </div>
                        </div>
                    </div>
                </div>
                </ScrollReveal>
            </section>

            {/* -------------------------------------------------------------------------- */}
            {/* SECTION 5: DEMOGRAFI & TELEMETRI STATISTIK */}
            {/* -------------------------------------------------------------------------- */}
            <section id="statistik" className="relative w-full py-24 px-6 xl:px-16 bg-slate-950 z-20 border-t border-white/10">
                <ScrollReveal>
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 text-amber-400 font-extrabold tracking-widest uppercase text-xs">
                            <BarChart3 size={16} />
                            <span>{language === 'id' ? 'TELEMETRI DEMOGRAFI REAL-TIME' : 'REAL-TIME DEMOGRAPHIC TELEMETRY'}</span>
                        </div>
                        <h2 className="text-3xl xl:text-5xl font-black text-white tracking-tight">
                            {language === 'id' ? 'Statistik Penduduk & Kesejahteraan' : 'Population & Welfare Statistics'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-amber-400/50 transition-all text-center space-y-2 shadow-xl">
                            <Users className="mx-auto text-amber-400 mb-2" size={32} />
                            <span className="block text-4xl font-black text-white">
                                <AnimatedCounter end={statsRes?.totalWarga || 8450} />
                            </span>
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">{language === 'id' ? 'Total Penduduk' : 'Total Population'}</span>
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-cyan-400/50 transition-all text-center space-y-2 shadow-xl">
                            <FileText className="mx-auto text-cyan-400 mb-2" size={32} />
                            <span className="block text-4xl font-black text-white">
                                <AnimatedCounter end={statsRes?.totalKK || 2310} />
                            </span>
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">{language === 'id' ? 'Kepala Keluarga (KK)' : 'Family Heads (KK)'}</span>
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-emerald-400/50 transition-all text-center space-y-2 shadow-xl">
                            <HeartPulse className="mx-auto text-emerald-400 mb-2" size={32} />
                            <span className="block text-4xl font-black text-white">
                                <AnimatedCounter end={100} suffix="%" />
                            </span>
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">{language === 'id' ? 'Cakupan UHC BPJS' : 'BPJS UHC Coverage'}</span>
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-purple-400/50 transition-all text-center space-y-2 shadow-xl">
                            <ShieldCheck className="mx-auto text-purple-400 mb-2" size={32} />
                            <span className="block text-4xl font-black text-white">
                                <AnimatedCounter end={7} suffix=" Posyandu" />
                            </span>
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">{language === 'id' ? 'Posyandu Mawar 1-7' : 'Mawar Clinics 1-7'}</span>
                        </div>
                    </div>
                </div>
                </ScrollReveal>
            </section>

            {/* -------------------------------------------------------------------------- */}
            {/* SECTION 6: KABAR DESA & STRUKTUR ORGANISASI */}
            {/* -------------------------------------------------------------------------- */}
            <section id="organisasi" className="relative w-full py-24 px-6 xl:px-16 bg-slate-950 z-20 border-t border-white/10">
                <div className="max-w-7xl mx-auto space-y-16">
                    <LandingNews newsData={newsData} />
                    
                    <div className="pt-16 border-t border-white/10">
                        <LandingOrganization orgData={orgData} />
                    </div>

                    {/* Lembaga Kemasyarakatan Showcase */}
                    <ScrollReveal>
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-2 text-cyan-400 font-extrabold uppercase text-xs tracking-widest">
                                <ShieldCheck size={16} /> {language === 'id' ? 'MITRA KERJA PEMDES' : 'GOV PARTNERS'}
                            </div>
                            <h3 className="text-2xl xl:text-4xl font-black text-white">{language === 'id' ? 'Lembaga Kemasyarakatan Desa' : 'Village Community Institutions'}</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {lembagaRes?.map((item: any) => (
                                <div key={item.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-center hover:border-amber-400/50 transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <span className="text-xs font-extrabold text-white uppercase block leading-tight">
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* -------------------------------------------------------------------------- */}
            {/* SECTION 7: ASPIRASI WARGA & MODERN DESKTOP FOOTER */}
            {/* -------------------------------------------------------------------------- */}
            <section id="aspirasi" className="relative w-full py-24 px-6 xl:px-16 bg-slate-950 z-20 border-t border-white/10">
                <div className="max-w-7xl mx-auto space-y-16">
                    <LandingAspiration />

                    {/* Footer */}
                    <ScrollReveal>
                    <footer className="pt-12 border-t border-white/15 text-slate-400">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                            <div className="col-span-2 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Image src={siteData?.logo || "/images/logo-bogor.png"} alt="Logo" width={36} height={36} />
                                    <span className="text-xl font-black text-white uppercase tracking-wider">{siteData?.title || "DESA CIMANGGU I"}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                                    {language === 'id' 
                                        ? 'Platform digitalisasi layanan dan informasi terpadu Sistem Digitalisasi Desa (SDD) Pemerintah Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor.' 
                                        : 'Integrated digital service and information platform of the Village Digitalization System (SDD) of Cimanggu I Village Government, Cibungbulang District, Bogor Regency.'}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase text-white tracking-widest mb-4 border-b border-white/10 pb-2">{language === 'id' ? 'Navigasi Landing' : 'Landing Navigation'}</h4>
                                <ul className="space-y-2 text-xs font-medium">
                                    <li><a href="#beranda" className="hover:text-amber-400 transition-colors">{language === 'id' ? 'Overview Utama' : 'Main Overview'}</a></li>
                                    <li><a href="#layanan-fitur" className="hover:text-amber-400 transition-colors">{language === 'id' ? 'Layanan Digital' : 'Digital Services'}</a></li>
                                    <li><a href="#webgis" className="hover:text-amber-400 transition-colors">{language === 'id' ? 'WebGIS Wilayah' : 'Regional WebGIS'}</a></li>
                                    <li><a href="#statistik" className="hover:text-amber-400 transition-colors">{language === 'id' ? 'Statistik Penduduk' : 'Population Statistics'}</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase text-white tracking-widest mb-4 border-b border-white/10 pb-2">{language === 'id' ? 'Kontak Pemdes' : 'Gov Contact'}</h4>
                                <ul className="space-y-2 text-xs font-medium">
                                    <li>{siteData?.kontak_alamat || "Jl. Raya Cibungbulang No. 1, Bogor"}</li>
                                    <li>Email: {siteData?.kontak_email || "info@cimanggu1.desa.id"}</li>
                                    <li>Telp: {siteData?.kontak_telepon || "(0251) 1234567"}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            <span>{language === 'id' ? '© 2026 PEMDES CIMANGGU I. ALL RIGHTS RESERVED.' : '© 2026 CIMANGGU I GOV. ALL RIGHTS RESERVED.'}</span>
                            <span className="text-amber-400">POWERED BY SYSTEM DIGITALISASI DESA (SDD)</span>
                        </div>
                    </footer>
                    </ScrollReveal>
                </div>
            </section>

        </div>
    );
}
