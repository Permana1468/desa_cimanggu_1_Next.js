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
    Layers
} from 'lucide-react';
import { LandingOrganization } from './LandingOrganization';
import { LandingNews } from './LandingNews';
import { LandingAspiration } from './LandingAspiration';
import { useLandingTheme } from './LandingThemeProvider';
import { CampoSantoHero } from './CampoSantoHero';

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
    const { isDualMode, toggleDualMode } = useLandingTheme();

    const containerRef = useRef<HTMLDivElement>(null);
    const [heroBgIndex, setHeroBgIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFeatureTab, setActiveFeatureTab] = useState<'surat' | 'webgis' | 'posyandu' | 'tupoksi'>('surat');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
    const heroSceneries = [
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
            setHeroBgIndex((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    if (isDualMode) {
        return (
            <div ref={containerRef} className="w-full min-h-screen">
                <CampoSantoHero siteData={siteData} />
            </div>
        );
    }

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
                <nav className="flex items-center gap-7 text-xs xl:text-sm font-extrabold uppercase tracking-wide">
                    <a href="#beranda" className="text-amber-400 hover:text-amber-300 transition-colors drop-shadow-md">
                        Beranda
                    </a>
                    <a href="#layanan-fitur" className="text-slate-200 hover:text-amber-400 transition-colors drop-shadow-md">
                        Tentang
                    </a>
                    <a href="#statistik" className="text-slate-200 hover:text-amber-400 transition-colors drop-shadow-md">
                        Statistik & Data
                    </a>
                    <a href="#berita" className="text-slate-200 hover:text-amber-400 transition-colors drop-shadow-md">
                        Berita
                    </a>
                    <a href="#organisasi" className="text-slate-200 hover:text-amber-400 transition-colors drop-shadow-md">
                        Struktur Organisasi
                    </a>
                    <Link href="/umkm" className="text-slate-200 hover:text-amber-400 transition-colors drop-shadow-md">
                        UMKM
                    </Link>
                </nav>

                {/* Right: Mode Toggle + Absensi + Sign In + Sign Up Button */}
                <div className="flex items-center gap-4">
                    {/* CampoSanto Mode Toggle */}
                    <button
                        onClick={toggleDualMode}
                        className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center relative overflow-hidden group cursor-pointer ${isDualMode
                            ? 'border-amber-400 text-amber-300 bg-gradient-to-br from-amber-600/80 to-rose-600/80 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-105'
                            : 'border-white/20 text-cyan-300 bg-white/10 hover:bg-white/20 hover:scale-110'
                            }`}
                        title={isDualMode ? "Matikan Mode CampoSanto" : "Aktifkan Mode CampoSanto"}
                    >
                        <Layers size={16} className={isDualMode ? "animate-pulse text-amber-200" : ""} />
                    </button>

                    {/* Absensi Button */}
                    <Link href="/absensi" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/20 transition-all shadow-inner group" title="Absensi">
                        <MapPin size={16} className="group-hover:text-amber-400 transition-colors" />
                    </Link>

                    {/* Sign In Link */}
                    <Link
                        href="/login"
                        className="text-slate-100 hover:text-amber-400 text-xs font-black uppercase tracking-wider transition-colors drop-shadow"
                    >
                        Sign in
                    </Link>

                    {/* Sign Up / Registration Pill Button */}
                    <Link
                        href="/login"
                        className="px-5 py-1.5 rounded-md border border-amber-400/80 text-amber-300 hover:bg-amber-400 hover:text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)]"
                    >
                        Sign up
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
                    {heroSceneries.map((scenery, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === heroBgIndex ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <Image
                                src={scenery.url}
                                alt="Hero Scenery"
                                fill
                                priority={index === 0}
                                className="object-cover object-center filter brightness-[0.92] contrast-[1.05]"
                            />
                            {/* Tambahan Overlay */}
                            <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                        </div>
                    ))}

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

                {/* Layer 2: Dynamic 3D Floating Golden Leaves (Interacting with Scroll Parallax) */}
                <motion.div
                    style={{ y: leafY1, x: mousePos.x * 0.4, rotate: leafRotate }}
                    className="absolute top-1/4 left-10 xl:left-20 z-20 pointer-events-none"
                >
                    <div className="w-14 h-24 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 rounded-full blur-[0.3px] opacity-85 shadow-[0_0_30px_rgba(245,158,11,0.6)] transform -rotate-45" style={{ borderRadius: '80% 0 80% 0' }} />
                </motion.div>

                <motion.div
                    style={{ y: leafY2, x: mousePos.x * -0.6, rotate: leafRotate }}
                    className="absolute top-1/3 left-1/4 z-20 pointer-events-none"
                >
                    <div className="w-10 h-16 bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-200 rounded-full opacity-75 shadow-[0_0_20px_rgba(245,158,11,0.5)] transform rotate-12" style={{ borderRadius: '80% 0 80% 0' }} />
                </motion.div>

                <motion.div
                    style={{ y: leafY3, x: mousePos.x * 0.5 }}
                    className="absolute top-1/2 right-1/4 z-20 pointer-events-none"
                >
                    <div className="w-12 h-20 bg-gradient-to-tr from-yellow-600 via-amber-400 to-yellow-300 rounded-full opacity-80 shadow-[0_0_25px_rgba(245,158,11,0.6)] transform -rotate-12" style={{ borderRadius: '80% 0 80% 0' }} />
                </motion.div>

                <motion.div
                    style={{ y: leafY4, x: mousePos.x * -0.3 }}
                    className="absolute top-1/4 right-12 xl:right-24 z-20 pointer-events-none"
                >
                    <div className="w-16 h-28 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-100 rounded-full opacity-90 shadow-[0_0_35px_rgba(245,158,11,0.7)] transform rotate-45" style={{ borderRadius: '80% 0 80% 0' }} />
                </motion.div>

                {/* Layer 3: Central Foreground Featured Subject & Registration Button (Reference Image) */}
                <div className="relative z-30 w-full h-full flex flex-col justify-between items-center text-center">

                    {/* Foreground Featured Subject Container with Scroll Parallax */}
                    <motion.div
                        style={{ y: heroSubjectY, scale: heroSubjectScale }}
                        className="relative flex flex-col items-center justify-center my-auto cursor-pointer group"
                    >
                        {/* Foreground Subject Image / Character with Glowing Aura */}
                        <div className="relative w-72 h-72 xl:w-96 xl:h-96 rounded-full overflow-hidden border-4 border-amber-400/40 shadow-[0_0_70px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_90px_rgba(245,158,11,0.7)] transition-all duration-700">
                            <Image
                                src={siteData?.about_image || "/images/sawah.png"}
                                alt="Featured Subject"
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        </div>

                        {/* Exact Pill Button from Reference Image: "Check here for Registration !" */}
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-6 z-40"
                        >
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_10px_40px_rgba(245,158,11,0.75)] hover:shadow-[0_15px_50px_rgba(245,158,11,0.95)] transform hover:scale-105 transition-all duration-300"
                            >
                                <CheckCircle2 size={20} className="text-slate-950" />
                                <span>Check here for Registration !</span>
                            </Link>
                        </motion.div>
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
                </div>
            </section>

            {/* -------------------------------------------------------------------------- */}
            {/* SECTION 2: ABOUT US / SEKILAS PANDANG (Smooth Dark Deep Purple Gradient Fade - Image 2) */}
            {/* -------------------------------------------------------------------------- */}
            <section className="relative w-full py-24 px-6 xl:px-16 bg-gradient-to-b from-purple-950 via-slate-950 to-slate-950 z-20">
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
                                        <MapPin size={14} /> KANTOR KEPALA DESA CIMANGGU I
                                    </div>
                                    <p className="text-xs text-slate-300 mt-1">
                                        Pusat Integrasi Data & Pelayanan Warga Berbasis WebGIS Digital.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Overview Details */}
                        <div className="lg:col-span-7 space-y-6 text-slate-200">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/50 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                                <Globe size={14} /> IDENTITAS RESMI DESA
                            </div>

                            <h3 className="text-3xl xl:text-4xl font-extrabold text-white leading-snug">
                                {siteData?.about_title || "Sekilas Pandang Pemdes Cimanggu I"}
                            </h3>

                            <p className="text-slate-300 text-base leading-relaxed border-l-2 border-amber-400 pl-4 py-1 font-light">
                                {siteData?.about_text || "Desa Cimanggu I merupakan salah satu desa unggulan di Kecamatan Cibungbulang, Kabupaten Bogor. Berkomitmen menghadirkan tata kelola pemerintahan yang transparan, efisien, dan modern melalui pemanfaatan Sistem Digitalisasi Desa (SDD) terpadu."}
                            </p>

                            {/* Quick Highlight Stats */}
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                    <span className="block text-2xl xl:text-3xl font-black text-amber-400">
                                        <AnimatedCounter end={4} />
                                    </span>
                                    <span className="text-[11px] font-extrabold text-slate-300 uppercase">Wilayah Dusun</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                    <span className="block text-2xl xl:text-3xl font-black text-cyan-400">
                                        <AnimatedCounter end={9} />
                                    </span>
                                    <span className="text-[11px] font-extrabold text-slate-300 uppercase">Kawasan RW</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                    <span className="block text-2xl xl:text-3xl font-black text-emerald-400">
                                        <AnimatedCounter end={100} suffix="%" />
                                    </span>
                                    <span className="text-[11px] font-extrabold text-slate-300 uppercase">Digital SDD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------------------------------- */}
            {/* SECTION 3: ROMBAK TOTAL KONSEP MENU & FITUR UTAMA DESKTOP */}
            {/* -------------------------------------------------------------------------- */}
            <section id="layanan-fitur" className="relative w-full py-24 px-6 xl:px-16 bg-slate-950 z-20 border-t border-white/10">
                <div className="max-w-7xl mx-auto space-y-16">

                    {/* Section Header */}
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest">
                            <Cpu size={14} /> EKOSISTEM INTERAKTIF DESA
                        </div>
                        <h2 className="text-3xl xl:text-5xl font-black text-white tracking-tight">
                            Fitur & Layanan Utama
                        </h2>
                        <p className="text-slate-400 text-sm xl:text-base font-light">
                            Platform terintegrasi yang menghubungkan administrasi warga, WebGIS pemetaan wilayah, pemantauan kesehatan Posyandu, hingga transparansi anggaran APBDes.
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
                                    PELAYANAN WARGA
                                </span>
                                <h3 className="text-xl font-extrabold text-white mt-3 mb-2 group-hover:text-amber-300 transition-colors">
                                    E-Surat Mandiri & UHC
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed font-light">
                                    Pengajuan Surat Keterangan Desa (SKKM, SPTJM, Usulan UHC BPJS Kesehatan) secara online dengan pelacakan status berkas real-time.
                                </p>
                            </div>
                            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-bold text-amber-400">
                                <Link href="/login" className="flex items-center gap-1 hover:underline">
                                    <span>Buka Portal Surat</span>
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
                                    PEMETAAN REGIONAL
                                </span>
                                <h3 className="text-xl font-extrabold text-white mt-3 mb-2 group-hover:text-cyan-300 transition-colors">
                                    WebGIS Batas Wilayah
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed font-light">
                                    Peta spasial interaktif Dusun 1-4, kawasan RW/RT, fasilitas umum, infrastruktur desa, serta pemetaan lokasi keluarga.
                                </p>
                            </div>
                            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-bold text-cyan-400">
                                <a href="#webgis" className="flex items-center gap-1 hover:underline">
                                    <span>Jelajahi WebGIS</span>
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
                                    E-KMS Posyandu Mawar
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed font-light">
                                    Pencatatan digital tumbuh kembang balita dan lansia Posyandu Mawar 1 hingga 7 untuk deteksi pencegahan stunting.
                                </p>
                            </div>
                            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-bold text-emerald-400">
                                <Link href="/login" className="flex items-center gap-1 hover:underline">
                                    <span>Lihat KMS Digital</span>
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
                                    MANAJEMEN PEMDES
                                </span>
                                <h3 className="text-xl font-extrabold text-white mt-3 mb-2 group-hover:text-purple-300 transition-colors">
                                    E-Tupoksi & RAB Desa
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed font-light">
                                    Modul khusus aparatur untuk penyusunan Rencana Anggaran Biaya (RAB), DED pembangunan, dan akuntabilitas laporan dana.
                                </p>
                            </div>
                            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-bold text-purple-400">
                                <Link href="/login" className="flex items-center gap-1 hover:underline">
                                    <span>Akses Dashboard</span>
                                    <ArrowUpRight size={15} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------------------------------- */}
            {/* SECTION 4: GEOSPATIAL COMMAND RADAR (WebGIS Interaktif) */}
            {/* -------------------------------------------------------------------------- */}
            <section id="webgis" className="relative w-full py-24 px-6 xl:px-16 bg-slate-950 z-20 border-t border-white/10">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 text-cyan-400 font-extrabold tracking-widest uppercase text-xs">
                            <Radio size={16} className="animate-pulse" />
                            <span>GEOSPATIAL COMMAND RADAR</span>
                        </div>
                        <h2 className="text-3xl xl:text-5xl font-black text-white tracking-tight">
                            Peta Interaktif Desa
                        </h2>
                    </div>

                    <div className="rounded-3xl border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] grid grid-cols-1 lg:grid-cols-12 min-h-[480px] bg-slate-900/80 backdrop-blur-xl">

                        {/* Control Panel */}
                        <div className="lg:col-span-4 p-8 bg-slate-950/90 border-r border-white/10 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                    <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">
                                        PILIH DUSUN & WILAYAH
                                    </span>
                                    <span className="text-[10px] font-mono text-cyan-200 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                                        LAT: -6.5892°
                                    </span>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-400 text-cyan-300 flex justify-between items-center cursor-pointer">
                                        <div>
                                            <h4 className="font-extrabold text-sm">Dusun 1</h4>
                                            <p className="text-xs text-slate-400 font-light">Mencakup RW 001, RW 002</p>
                                        </div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]" />
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/10 text-slate-300 hover:border-white/30 flex justify-between items-center cursor-pointer transition-colors">
                                        <div>
                                            <h4 className="font-extrabold text-sm">Dusun 2</h4>
                                            <p className="text-xs text-slate-400 font-light">Mencakup RW 003, RW 008</p>
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/10 text-slate-300 hover:border-white/30 flex justify-between items-center cursor-pointer transition-colors">
                                        <div>
                                            <h4 className="font-extrabold text-sm">Dusun 3</h4>
                                            <p className="text-xs text-slate-400 font-light">Mencakup RW 005, RW 006, RW 007</p>
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/10 text-slate-300 hover:border-white/30 flex justify-between items-center cursor-pointer transition-colors">
                                        <div>
                                            <h4 className="font-extrabold text-sm">Dusun 4</h4>
                                            <p className="text-xs text-slate-400 font-light">Mencakup RW 004, RW 009</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/dashboard/maps"
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all"
                            >
                                <span>Buka WebGIS Layar Penuh</span>
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
            </section>

            {/* -------------------------------------------------------------------------- */}
            {/* SECTION 5: DEMOGRAFI & TELEMETRI STATISTIK */}
            {/* -------------------------------------------------------------------------- */}
            <section id="statistik" className="relative w-full py-24 px-6 xl:px-16 bg-slate-950 z-20 border-t border-white/10">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 text-amber-400 font-extrabold tracking-widest uppercase text-xs">
                            <BarChart3 size={16} />
                            <span>TELEMETRI DEMOGRAFI REAL-TIME</span>
                        </div>
                        <h2 className="text-3xl xl:text-5xl font-black text-white tracking-tight">
                            Statistik Penduduk & Kesejahteraan
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-amber-400/50 transition-all text-center space-y-2 shadow-xl">
                            <Users className="mx-auto text-amber-400 mb-2" size={32} />
                            <span className="block text-4xl font-black text-white">
                                <AnimatedCounter end={statsRes?.totalWarga || 8450} />
                            </span>
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Penduduk</span>
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-cyan-400/50 transition-all text-center space-y-2 shadow-xl">
                            <FileText className="mx-auto text-cyan-400 mb-2" size={32} />
                            <span className="block text-4xl font-black text-white">
                                <AnimatedCounter end={statsRes?.totalKK || 2310} />
                            </span>
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Kepala Keluarga (KK)</span>
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-emerald-400/50 transition-all text-center space-y-2 shadow-xl">
                            <HeartPulse className="mx-auto text-emerald-400 mb-2" size={32} />
                            <span className="block text-4xl font-black text-white">
                                <AnimatedCounter end={100} suffix="%" />
                            </span>
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Cakupan UHC BPJS</span>
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-purple-400/50 transition-all text-center space-y-2 shadow-xl">
                            <ShieldCheck className="mx-auto text-purple-400 mb-2" size={32} />
                            <span className="block text-4xl font-black text-white">
                                <AnimatedCounter end={7} suffix=" Posyandu" />
                            </span>
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Posyandu Mawar 1-7</span>
                        </div>
                    </div>
                </div>
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
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-2 text-cyan-400 font-extrabold uppercase text-xs tracking-widest">
                                <ShieldCheck size={16} /> MITRA KERJA PEMDES
                            </div>
                            <h3 className="text-2xl xl:text-4xl font-black text-white">Lembaga Kemasyarakatan Desa</h3>
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
                </div>
            </section>

            {/* -------------------------------------------------------------------------- */}
            {/* SECTION 7: ASPIRASI WARGA & MODERN DESKTOP FOOTER */}
            {/* -------------------------------------------------------------------------- */}
            <section id="aspirasi" className="relative w-full py-24 px-6 xl:px-16 bg-slate-950 z-20 border-t border-white/10">
                <div className="max-w-7xl mx-auto space-y-16">
                    <LandingAspiration />

                    {/* Footer */}
                    <footer className="pt-12 border-t border-white/15 text-slate-400">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                            <div className="col-span-2 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Image src={siteData?.logo || "/images/logo-bogor.png"} alt="Logo" width={36} height={36} />
                                    <span className="text-xl font-black text-white uppercase tracking-wider">{siteData?.title || "DESA CIMANGGU I"}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                                    Platform digitalisasi layanan dan informasi terpadu Sistem Digitalisasi Desa (SDD) Pemerintah Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase text-white tracking-widest mb-4 border-b border-white/10 pb-2">Navigasi Landing</h4>
                                <ul className="space-y-2 text-xs font-medium">
                                    <li><a href="#beranda" className="hover:text-amber-400 transition-colors">Overview Utama</a></li>
                                    <li><a href="#layanan-fitur" className="hover:text-amber-400 transition-colors">Layanan Digital</a></li>
                                    <li><a href="#webgis" className="hover:text-amber-400 transition-colors">WebGIS Wilayah</a></li>
                                    <li><a href="#statistik" className="hover:text-amber-400 transition-colors">Statistik Penduduk</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase text-white tracking-widest mb-4 border-b border-white/10 pb-2">Kontak Pemdes</h4>
                                <ul className="space-y-2 text-xs font-medium">
                                    <li>Jl. Raya Cibungbulang No. 1, Bogor</li>
                                    <li>Email: info@cimanggu1.desa.id</li>
                                    <li>Telp: (0251) 1234567</li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            <span>© 2026 PEMDES CIMANGGU I. ALL RIGHTS RESERVED.</span>
                            <span className="text-amber-400">POWERED BY SYSTEM DIGITALISASI DESA (SDD)</span>
                        </div>
                    </footer>
                </div>
            </section>

        </div>
    );
}
