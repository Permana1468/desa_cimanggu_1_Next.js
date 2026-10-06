"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    ShieldCheck, 
    QrCode, 
    Layers, 
    ArrowRight, 
    Menu, 
    X,
    Instagram,
    Facebook,
    Youtube,
    Twitter
} from 'lucide-react';
import { useLandingTheme } from './LandingThemeProvider';
import { CampoSantoInformasi } from './CampoSantoInformasi';
import { CampoSantoOrganisasi } from './CampoSantoOrganisasi';

interface CampoSantoHeroProps {
    siteData?: any;
}

export function CampoSantoHero({ siteData }: CampoSantoHeroProps) {
    const { toggleDualMode, language } = useLandingTheme();
    const [activeCircle, setActiveCircle] = useState<number | null>(null);
    const [isTitleHovered, setIsTitleHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'hero' | 'informasi' | 'organisasi'>('hero');
    const containerRef = useRef<HTMLDivElement>(null);

    // Helper to parse gallery items which could be legacy strings or new objects
    const parseGalleryItem = (item: any, fallback: string) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') return item.url || item.img || fallback;
        return fallback;
    };

    // Dynamic background village images based on CMS gallery data
    const bgImages = (Array.isArray(siteData?.gallery) && siteData.gallery.length > 0)
        ? siteData.gallery.map((item: any, index: number) => {
            const fallback = index % 3 === 0 ? "/images/slide_1.webp" : index % 3 === 1 ? "/images/sawah.png" : "/images/slide_6_.png";
            return parseGalleryItem(item, fallback);
        })
        : [
            "/images/slide_1.webp",
            "/images/sawah.png",
            "/images/slide_6_.png",
            "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
        ];
        
    // Pastikan minimal ada 4 gambar untuk 4 fitur utama jika gallery kurang dari 4
    if (bgImages.length < 4) {
        const extraImages = [
            "/images/slide_1.webp",
            "/images/sawah.png",
            "/images/slide_6_.png",
            "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
        ];
        for (let i = bgImages.length; i < 4; i++) {
            bgImages.push(extraImages[i]);
        }
    }

    // Current background hero image based on active hovered circle
    const currentBgImage = activeCircle !== null ? bgImages[activeCircle - 1] : bgImages[0];

    // Handle Subtle Parallax Mouse Movement (Throttled with RAF for max FPS)
    useEffect(() => {
        let rafId: number | null = null;
        const handleMouseMove = (e: MouseEvent) => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const normX = (e.clientX - centerX) / (rect.width / 2);
                const normY = (e.clientY - centerY) / (rect.height / 2);
                
                setMousePos({ x: normX, y: normY });
            });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    // Dynamic circular items based on bgImages
    const circularItems = bgImages.map((img: string, idx: number) => {
        const colors = [
            { glow: "shadow-[0_0_40px_rgba(245,158,11,0.85)] border-amber-300", bg: "rgba(234, 88, 12, 0.35)", marquee: "text-amber-300" },
            { glow: "shadow-[0_0_40px_rgba(16,185,129,0.85)] border-emerald-300", bg: "rgba(16, 185, 129, 0.35)", marquee: "text-emerald-300" },
            { glow: "shadow-[0_0_40px_rgba(6,182,212,0.85)] border-cyan-300", bg: "rgba(6, 182, 212, 0.35)", marquee: "text-cyan-300" },
            { glow: "shadow-[0_0_40px_rgba(168,85,247,0.85)] border-purple-300", bg: "rgba(168, 85, 247, 0.35)", marquee: "text-purple-300" },
            { glow: "shadow-[0_0_40px_rgba(239,68,68,0.85)] border-red-300", bg: "rgba(239, 68, 68, 0.35)", marquee: "text-red-300" }
        ];
        const defaultTitles = language === 'id' ? [
            { title: "PELAYANAN WARGA", sub: "E-Surat Mandiri & UHC", link: "/login" },
            { title: "PEMETAAN REGIONAL", sub: "WebGIS Batas Wilayah", link: "#peta-interaktif" },
            { title: "HEALTH MONITORS", sub: "E-KMS Posyandu Mawar", link: "/login" },
            { title: "MANAJEMEN PEMDES", sub: "E-Tupoksi & RAB Desa", link: "/login" }
        ] : [
            { title: "CITIZEN SERVICES", sub: "Self-Service Letters & UHC", link: "/login" },
            { title: "REGIONAL MAPPING", sub: "WebGIS Border Mapping", link: "#peta-interaktif" },
            { title: "HEALTH MONITORS", sub: "E-KMS Mawar Clinic", link: "/login" },
            { title: "GOVERNMENT MGT", sub: "E-Tasks & Village Budget", link: "/login" }
        ];
        
        const color = colors[idx % colors.length];
        const defaultInfo = defaultTitles[idx % defaultTitles.length];
        
        // If CMS data has titles, use them, otherwise use default Info
        const galleryItem = Array.isArray(siteData?.gallery) ? siteData.gallery[idx] : null;
        const displayTitle = galleryItem?.title ? galleryItem.title : defaultInfo.title;
        const displaySub = galleryItem?.sub ? galleryItem.sub : defaultInfo.sub;

        return {
            id: idx + 1,
            title: displayTitle,
            subtitle: displaySub,
            image: img,
            link: defaultInfo.link,
            colorGlow: color.glow,
            bgAtmosphere: color.bg,
            marqueeColor: color.marquee
        };
    });

    // Navbar Menu Items (STRUKTUR ORGANISASI added right after INFORMASI PUBLIK)
    const navMenuItems = language === 'id' ? [
        { id: 'informasi', name: 'INFORMASI PUBLIK', tab: 'informasi' },
        { id: 'organisasi', name: 'STRUKTUR ORGANISASI', tab: 'organisasi' },
        { id: 'lembaga', name: 'LEMBAGA DESA', path: '#profil' },
        { id: 'kabar', name: 'KABAR & DATA', path: '#berita' },
        { id: 'umkm', name: 'WIRAUSAHA UMKM', path: '/umkm', isRoute: true },
    ] : [
        { id: 'informasi', name: 'PUBLIC INFO', tab: 'informasi' },
        { id: 'organisasi', name: 'ORG STRUCTURE', tab: 'organisasi' },
        { id: 'lembaga', name: 'VILLAGE INST.', path: '#profil' },
        { id: 'kabar', name: 'NEWS & DATA', path: '#berita' },
        { id: 'umkm', name: 'LOCAL ENTERPRISE', path: '/umkm', isRoute: true },
    ];

    // Marquee active color based on hover
    const currentMarqueeColor = activeCircle !== null ? circularItems[activeCircle - 1].marqueeColor : "text-amber-300";

    return (
        <div 
            ref={containerRef}
            className="relative w-full min-h-screen bg-[#18040f] text-white font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between"
        >
            {/* ========================================================================= */}
            {/* 1. SLIM TOP NAVBAR WITH STRUKTUR ORGANISASI ADDED RIGHT AFTER INFORMASI PUBLIK */}
            {/* ========================================================================= */}
            <header className={`fixed top-0 left-0 right-0 w-full z-50 bg-black/90 backdrop-blur-md h-[46px] px-4 sm:px-8 border-b border-white/15 items-center justify-between shadow-md ${activeTab === 'organisasi' ? 'hidden' : 'flex'}`}>
                {/* Left Side: Logo & Pure Animated Color-Changing Gradient Text (Click to return to Hero) */}
                <button 
                    onClick={() => setActiveTab('hero')} 
                    className="flex items-center gap-2.5 text-left cursor-pointer group"
                >
                    <div className="relative w-6 h-6 shrink-0 group-hover:scale-110 transition-transform">
                        <Image
                            src={siteData?.logo || "/images/logo-bogor.png"}
                            alt="Logo Desa"
                            fill
                            sizes="24px"
                            priority
                            className="object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                        />
                    </div>
                    {/* Pure Animated Gradient Text */}
                    <span className="font-black text-xs sm:text-sm tracking-widest uppercase bg-gradient-to-r from-yellow-300 via-amber-400 via-yellow-200 to-amber-300 bg-clip-text text-transparent animate-gradient-shift drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {siteData?.title || "DESA CIMANGGU I"}
                    </span>
                </button>

                {/* Right Side: Menu Navigation Links (STRUKTUR ORGANISASI inserted after INFORMASI PUBLIK) */}
                <nav className="hidden md:flex items-center gap-5 lg:gap-7">
                    {navMenuItems.map((item, idx) => {
                        const isTabActive = item.tab && activeTab === item.tab;

                        if (item.tab) {
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTab(item.tab as any)}
                                    className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-colors cursor-pointer ${
                                        isTabActive 
                                            ? 'text-amber-300 underline underline-offset-4 font-bold drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]' 
                                            : 'text-white/90 hover:text-amber-300 drop-shadow'
                                    }`}
                                >
                                    {item.name}
                                </button>
                            );
                        }

                        return item.isRoute ? (
                            <Link 
                                key={idx} 
                                href={item.path!} 
                                className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-white/90 hover:text-amber-300 transition-colors drop-shadow"
                            >
                                {item.name}
                            </Link>
                        ) : (
                            <a 
                                key={idx} 
                                href={item.path!} 
                                className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-white/90 hover:text-amber-300 transition-colors drop-shadow"
                            >
                                {item.name}
                            </a>
                        );
                    })}
                </nav>

                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-1 text-white hover:text-amber-300 cursor-pointer"
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Mobile Navigation Drawer */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-[46px] left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/20 px-6 py-4 space-y-3 z-50 shadow-2xl">
                        <button
                            onClick={() => {
                                setActiveTab('hero');
                                setIsMobileMenuOpen(false);
                            }}
                            className="block text-left w-full text-xs font-black uppercase tracking-widest text-amber-300 py-1.5 border-b border-white/10"
                        >
                            {language === 'id' ? "BERANDA HERO" : "HOME HERO"}
                        </button>
                        {navMenuItems.map((item, idx) => (
                            item.tab ? (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setActiveTab(item.tab as any);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="block text-left w-full text-xs font-black uppercase tracking-widest text-slate-200 hover:text-amber-300 py-1.5 border-b border-white/10"
                                >
                                    {item.name}
                                </button>
                            ) : (
                                <Link
                                    key={idx}
                                    href={item.path!}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-xs font-black uppercase tracking-widest text-slate-200 hover:text-amber-300 py-1.5 border-b border-white/10"
                                >
                                    {item.name}
                                </Link>
                            )
                        ))}
                    </div>
                )}
            </header>

            {/* ========================================================================= */}
            {/* DYNAMIC TAB CONTENT SWITCHER */}
            {/* ========================================================================= */}
            {activeTab === 'informasi' ? (
                <CampoSantoInformasi siteData={siteData} onBackToHero={() => setActiveTab('hero')} />
            ) : activeTab === 'organisasi' ? (
                <CampoSantoOrganisasi siteData={siteData} onBackToHero={() => setActiveTab('hero')} />
            ) : (
                /* MAIN CAMPO SANTO HERO VIEW */
                <>
                    {/* LIGHT TRANSLUCENT BACKGROUND LANDSCAPE OVERLAY */}
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        {siteData?.hero_video ? (
                            <div className="absolute inset-0 opacity-70 z-10">
                                <video
                                    src={siteData.hero_video}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="object-cover object-center w-full h-full filter saturate-[1.2] brightness-95"
                                />
                            </div>
                        ) : (
                            bgImages.map((src: string, idx: number) => (
                                <div
                                    key={idx}
                                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                        currentBgImage === src ? 'opacity-70 scale-105 z-10' : 'opacity-0 scale-100 z-0'
                                    }`}
                                    style={{
                                        transform: `translate3d(${mousePos.x * -8}px, ${mousePos.y * -5}px, 0)`
                                    }}
                                >
                                    <Image
                                        src={src}
                                        alt={`Village Background Scenery ${idx + 1}`}
                                        fill
                                        priority={idx === 0}
                                        sizes="100vw"
                                        className="object-cover object-center filter saturate-[1.2] brightness-95"
                                    />
                                </div>
                            ))
                        )}

                        <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
                        <div 
                            className="absolute inset-0 z-20 transition-all duration-700 ease-out"
                            style={{
                                background: activeCircle !== null 
                                    ? `radial-gradient(ellipse at 50% 35%, ${circularItems[activeCircle - 1].bgAtmosphere} 0%, rgba(20, 3, 12, 0.8) 80%)`
                                    : `radial-gradient(ellipse at 50% 35%, rgba(245, 158, 11, 0.25) 0%, rgba(20, 3, 12, 0.8) 80%)`
                            }}
                        />
                    </div>

                    {/* HERO CONTENT CONTAINER */}
                    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-6 flex flex-col justify-between items-center text-center min-h-[calc(100vh-46px)]">
                        
                        {/* Title, Marquee & Paragraph Section */}
                        <div className="w-full max-w-3xl space-y-4 my-auto pt-2">
                            {/* Main Title with Hover Color Shift & Wave Animation */}
                            <div className="relative inline-block">
                                <h1 
                                    onMouseEnter={() => setIsTitleHovered(true)}
                                    onMouseLeave={() => setIsTitleHovered(false)}
                                    className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase select-none transition-all duration-500 cursor-pointer ${
                                        isTitleHovered 
                                            ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-cyan-300 bg-clip-text text-transparent animate-wave-bounce scale-105' 
                                            : 'text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]'
                                    }`}
                                    style={{
                                        fontFamily: "'Impact', 'Trebuchet MS', 'Arial Black', sans-serif",
                                        textShadow: isTitleHovered ? '0 0 35px rgba(245,158,11,0.6)' : '0 4px 16px rgba(0,0,0,0.9), 0 0 45px rgba(245,158,11,0.35)'
                                    }}
                                >
                                    {siteData?.hero_title || siteData?.title || "DESA CIMANGGU I"}
                                </h1>
                            </div>

                            {/* RUNNING MARQUEE SUBTITLE */}
                            <div className="w-full overflow-hidden bg-transparent border-0 py-1 max-w-2xl mx-auto">
                                <div className={`whitespace-nowrap animate-marquee flex items-center gap-8 text-xs sm:text-sm font-black uppercase tracking-[0.3em] transition-colors duration-700 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] ${currentMarqueeColor}`}>
                                    <span>{language === 'id' ? 'KECAMATAN CIBUNGBULANG' : 'CIBUNGBULANG DISTRICT'}</span>
                                    <span>•</span>
                                    <span>{language === 'id' ? 'KABUPATEN BOGOR' : 'BOGOR REGENCY'}</span>
                                    <span>•</span>
                                    <span>{language === 'id' ? 'PROVINSI JAWA BARAT' : 'WEST JAVA PROVINCE'}</span>
                                    <span>•</span>
                                    <span>{language === 'id' ? 'KECAMATAN CIBUNGBULANG' : 'CIBUNGBULANG DISTRICT'}</span>
                                    <span>•</span>
                                    <span>{language === 'id' ? 'KABUPATEN BOGOR' : 'BOGOR REGENCY'}</span>
                                </div>
                            </div>

                            {/* PARAGRAPH DESCRIPTION */}
                            <p className="text-white/90 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-xl mx-auto px-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] mt-3">
                                {siteData?.hero_subtitle || (language === 'id' 
                                    ? "Portal digital terpadu Pemdes Cimanggu I untuk transparansi tata kelola, pemetaan WebGIS, dan efisiensi pelayanan publik."
                                    : "Integrated digital portal of Cimanggu I Village for governance transparency, WebGIS mapping, and public service efficiency."
                                )}
                            </p>
                        </div>

                        {/* ROUNDED CIRCULAR BADGES */}
                        <div className="w-full py-4 sm:py-6">
                            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
                                {circularItems.map((item: any) => {
                                    const isHovered = activeCircle === item.id;

                                    return (
                                        <div
                                            key={item.id}
                                            onMouseEnter={() => setActiveCircle(item.id)}
                                            onMouseLeave={() => setActiveCircle(null)}
                                            className="flex flex-col items-center group cursor-pointer"
                                        >
                                            <div className="relative w-38 h-38 sm:w-46 sm:h-46 md:w-50 md:h-50">
                                                <div 
                                                    className={`absolute inset-0 rounded-full transition-all duration-500 ${
                                                        isHovered 
                                                            ? `scale-110 opacity-100 ${item.colorGlow} border-4` 
                                                            : 'scale-100 opacity-60 border-2 border-white/40'
                                                    }`}
                                                />

                                                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl bg-black/60">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.title}
                                                        fill
                                                        sizes="(max-width: 768px) 184px, 200px"
                                                        className={`object-cover transition-transform duration-700 ease-out ${
                                                            isHovered ? 'scale-125 rotate-2' : 'scale-100'
                                                        }`}
                                                    />
                                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${
                                                        isHovered ? 'opacity-30' : 'opacity-60'
                                                    }`} />

                                                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                                                        isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
                                                    }`}>
                                                        <div className="bg-amber-400 text-slate-950 p-3 rounded-full shadow-2xl">
                                                            <ArrowRight size={20} className="font-bold" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 text-center space-y-1">
                                                <Link 
                                                    href={item.link}
                                                    className={`block text-xs sm:text-sm font-black uppercase tracking-widest transition-colors duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
                                                        isHovered ? 'text-amber-300 underline underline-offset-4' : 'text-white hover:text-amber-300'
                                                    }`}
                                                >
                                                    {item.title}
                                                </Link>
                                                <div className="text-[10px] sm:text-[11px] font-bold text-amber-200/80 tracking-wider uppercase drop-shadow">
                                                    {item.subtitle}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* REVISED BOTTOM ACTION BAR */}
                        <div className="w-full max-w-3xl mx-auto space-y-4 pt-3 border-t border-white/10 text-center">
                            
                            {/* Quick Site Links */}
                            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-white/90 drop-shadow">
                                <button onClick={() => setActiveTab('informasi')} className="hover:text-amber-300 transition-colors cursor-pointer">{language === 'id' ? 'INFORMASI PUBLIK' : 'PUBLIC INFO'}</button>
                                <span className="text-amber-500/50">|</span>
                                <button onClick={() => setActiveTab('organisasi')} className="hover:text-amber-300 transition-colors cursor-pointer">{language === 'id' ? 'STRUKTUR ORGANISASI' : 'ORG STRUCTURE'}</button>
                                <span className="text-amber-500/50">|</span>
                                <a href="#peta-interaktif" className="hover:text-amber-300 transition-colors">{language === 'id' ? 'PETA INTERAKTIF' : 'INTERACTIVE MAP'}</a>
                            </div>

                            {/* 3 ACTION BUTTONS */}
                            <div className="flex flex-wrap items-center justify-center gap-3 py-1">
                                <div className="flex items-center gap-2 p-1.5 rounded-full bg-black/60 border border-amber-500/30 backdrop-blur-md shadow-lg">
                                    <button
                                        onClick={toggleDualMode}
                                        className="w-9 h-9 rounded-full border border-amber-400 text-slate-950 bg-amber-400 hover:scale-110 transition-all flex items-center justify-center relative cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                                        title={language === 'id' ? "Matikan Dual Mode (Kembali ke Tema Utama)" : "Disable Dual Mode (Return to Main Theme)"}
                                    >
                                        <Layers size={16} className="animate-pulse" />
                                    </button>

                                    <Link
                                        href="/absensi"
                                        className="w-9 h-9 rounded-full border border-emerald-500/40 text-emerald-400 bg-slate-950/90 hover:scale-110 transition-all flex items-center justify-center cursor-pointer"
                                        title={language === 'id' ? "Halaman Kios E-Absensi" : "E-Attendance Kiosk Page"}
                                    >
                                        <QrCode size={16} className="animate-pulse" />
                                    </Link>
                                </div>

                                <Link 
                                    href="/login"  
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-1.5 cursor-pointer"
                                >
                                    <ShieldCheck size={16} />
                                    <span>{language === 'id' ? 'Masuk Sistem' : 'System Login'}</span>
                                </Link>
                            </div>

                            {/* SOCIAL MEDIA ICONS ROW */}
                            <div className="flex items-center justify-center gap-4 text-white/80 py-1">
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-amber-400 hover:text-slate-950 transition-all duration-200 drop-shadow" title="Instagram Desa">
                                    <Instagram size={16} />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-amber-400 hover:text-slate-950 transition-all duration-200 drop-shadow" title="Facebook Desa">
                                    <Facebook size={16} />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-amber-400 hover:text-slate-950 transition-all duration-200 drop-shadow" title="YouTube Desa">
                                    <Youtube size={16} />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-amber-400 hover:text-slate-950 transition-all duration-200 drop-shadow" title="Twitter / X Desa">
                                    <Twitter size={16} />
                                </a>
                            </div>

                            {/* Footer Copyright */}
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 pt-1">
                                {language === 'id' 
                                    ? '© 2026 PEMERINTAH DESA CIMANGGU I • KECAMATAN CIBUNGBULANG • KABUPATEN BOGOR'
                                    : '© 2026 CIMANGGU I VILLAGE GOV • CIBUNGBULANG DISTRICT • BOGOR REGENCY'
                                }
                            </div>

                        </div>

                    </div>
                </>
            )}

            {/* CSS ANIMATIONS */}
            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: inline-flex;
                    animation: marquee 22s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }

                @keyframes waveBounce {
                    0%, 100% { transform: translateY(0) scale(1.05); }
                    25% { transform: translateY(-6px) scale(1.06); }
                    50% { transform: translateY(3px) scale(1.05); }
                    75% { transform: translateY(-4px) scale(1.06); }
                }
                .animate-wave-bounce {
                    animation: waveBounce 1.2s ease-in-out infinite;
                }

                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-shift {
                    background-size: 200% 200%;
                    animation: gradientShift 6s ease infinite;
                }
            `}</style>
        </div>
    );
}
