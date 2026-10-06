"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronRight, ShieldCheck, Sparkles, Sun, Moon, QrCode, Layers } from 'lucide-react';
import { useLandingTheme } from './LandingThemeProvider';

interface LandingNavbarProps {
    siteData: any;
}

export const LandingNavbar = ({ siteData }: LandingNavbarProps) => {
    const { isNightMode, toggleNightMode, isDualMode, toggleDualMode } = useLandingTheme();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const handleScroll = () => {
            const nextScrolled = window.scrollY > 20;
            setIsScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const activeEl = itemRefs.current[activeIndex];
        if (activeEl) {
            setPillStyle({
                left: (activeEl as HTMLElement).offsetLeft,
                width: (activeEl as HTMLElement).offsetWidth,
                opacity: 1
            });
        }
    }, [activeIndex]);

    // Ensure navbar is always visible in all modes

    const handleMouseEnter = (index: number) => {
        const el = itemRefs.current[index];
        if (el) {
            setPillStyle({
                left: (el as HTMLElement).offsetLeft,
                width: (el as HTMLElement).offsetWidth,
                opacity: 1
            });
        }
    };

    const handleMouseLeave = () => {
        const activeEl = itemRefs.current[activeIndex];
        if (activeEl) {
            setPillStyle({
                left: activeEl.offsetLeft,
                width: activeEl.offsetWidth,
                opacity: 1
            });
        }
    };

    const handleMouseEnterDropdown = (id: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveDropdown(id);
    };

    const handleMouseLeaveDropdown = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 150);
    };

    const toggleMobileExpand = (id: string) => {
        setMobileExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const navMenuItems = [
        { name: 'Beranda', id: 'beranda' },
        {
            name: 'Informasi Publik',
            id: 'informasi-publik',
            hasDropdown: true,
            columns: [
                {
                    title: 'Profil',
                    items: [
                        { name: 'Sejarah & Visi Misi', id: 'profil' },
                        { name: 'Struktur Organisasi', id: 'organisasi' },
                    ]
                },
                {
                    title: 'Wilayah',
                    items: [
                        { name: 'Peta Interaktif WebGIS', id: 'peta-interaktif' },
                        { name: 'Wilayah Dusun/RW/RT', id: 'wilayah' },
                    ]
                },
                {
                    title: 'Layanan Digital',
                    items: [
                        { name: 'E-Tupoksi & RAB', id: 'layanan' },
                        { name: 'E-KMS Posyandu', id: 'layanan' },
                    ]
                }
            ]
        },
        {
            name: 'Lembaga Desa',
            id: 'lembaga-desa',
            hasDropdown: true,
            items: [
                { name: 'Karang Taruna', id: 'lembaga' },
                { name: 'LPM & BPD', id: 'lembaga' },
                { name: 'PKK & Posyandu', id: 'lembaga' },
            ]
        },
        {
            name: 'Kabar & Data',
            id: 'kabar-data',
            hasDropdown: true,
            items: [
                { name: 'Berita Terbaru', id: 'berita' },
                { name: 'Statistik Demografi', id: 'statistik' },
                { name: 'Peta Wilayah', id: 'peta-interaktif' },
            ]
        },
        { name: 'Wirausaha UMKM', id: 'umkm', isRoute: true, path: '/umkm' },
    ];

    return (
        <header className="fixed top-0 w-full z-50 bg-transparent py-5 sm:py-6 transition-all duration-300">
            <div className="w-full px-6 sm:px-12 flex justify-between items-center">
                {/* Left Side: Logo + Nav Links directly after */}
                <div className="flex items-center gap-8 xl:gap-12">
                    {/* Logo & Branding */}
                    <div className="flex items-center gap-3 group shrink-0">
                        <div className="relative w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-110 shrink-0">
                            <Image
                                src={siteData?.logo || "/images/logo-bogor.png"}
                                alt="Logo Desa"
                                fill
                                sizes="40px"
                                priority
                                className="object-contain drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="text-white font-black text-xs sm:text-[15px] md:text-[17px] tracking-wide leading-none uppercase whitespace-nowrap drop-shadow">
                                    {siteData?.title || "DESA CIMANGGU I"}
                                </span>
                                <span className="flex h-2 w-2 relative shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </div>
                            <span className="text-yellow-400 font-semibold text-[9px] sm:text-[11px] leading-none mt-1 tracking-wider whitespace-nowrap drop-shadow">
                                Kecamatan Cibungbulang
                            </span>
                        </div>
                    </div>

                    {/* Desktop Clean Nav Menu (Directly after Logo, pure text links without card box) */}
                    <nav
                        className="hidden xl:flex items-center gap-6 xl:gap-8"
                        onMouseLeave={handleMouseLeaveDropdown}
                    >
                        {navMenuItems.map((menu, idx) => {
                            const commonClass = `relative z-10 text-[12px] xl:text-[13px] font-extrabold tracking-wide uppercase transition-colors duration-300 flex items-center gap-1.5 cursor-pointer drop-shadow ${activeIndex === idx ? 'text-yellow-400 border-b-2 border-yellow-400 pb-0.5' : 'text-slate-100 hover:text-yellow-400'
                                }`;

                            return (
                                <div
                                    key={idx}
                                    ref={(el) => { itemRefs.current[idx] = el; }}
                                    className="relative flex items-center"
                                    onMouseEnter={() => {
                                        setActiveIndex(idx);
                                        if (menu.hasDropdown) {
                                            handleMouseEnterDropdown(menu.id);
                                        } else {
                                            setActiveDropdown(null);
                                        }
                                    }}
                                    onMouseLeave={handleMouseLeaveDropdown}
                                >
                                    {menu.isRoute ? (
                                        <Link href={menu.path} className={commonClass} onClick={() => setActiveIndex(idx)}>
                                            {menu.name}
                                        </Link>
                                    ) : (
                                        <a href={`#${menu.id}`} className={commonClass} onClick={() => setActiveIndex(idx)}>
                                            <span>{menu.name}</span>
                                            {menu.hasDropdown && (
                                                <ChevronDown
                                                    size={13}
                                                    className={`opacity-80 transition-transform duration-300 ${activeDropdown === menu.id ? 'rotate-180 text-yellow-400' : ''}`}
                                                />
                                            )}
                                        </a>
                                    )}

                                    {/* Dropdown Megamenu (Informasi Publik) */}
                                    {menu.hasDropdown && menu.id === 'informasi-publik' && activeDropdown === 'informasi-publik' && (
                                        <div
                                            className="absolute top-full left-0 mt-4 w-[550px] bg-black/60 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-6 shadow-2xl z-50 animate-in fade-in slide-in-from-top-3 duration-300 flex gap-6"
                                            onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
                                            onMouseLeave={handleMouseLeaveDropdown}
                                        >
                                            {menu.columns?.map((column, cIdx) => (
                                                <div key={cIdx} className="flex-1 space-y-3">
                                                    <div className="text-[11px] font-black text-cyan-300 uppercase tracking-widest pb-2 border-b border-white/15 flex items-center gap-1.5">
                                                        <Sparkles size={12} /> {column.title}
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        {column.items.map((subItem, sIdx) => (
                                                            <a
                                                                key={sIdx}
                                                                href={`#${subItem.id}`}
                                                                onClick={() => setActiveDropdown(null)}
                                                                className="text-slate-200 hover:text-yellow-400 text-[12px] font-semibold transition-colors block py-1 hover:translate-x-1 duration-200"
                                                            >
                                                                {subItem.name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Standard Dropdown */}
                                    {menu.hasDropdown && menu.id !== 'informasi-publik' && activeDropdown === menu.id && (
                                        <div
                                            className="absolute top-full left-0 mt-4 w-[220px] bg-black/60 backdrop-blur-2xl border border-white/20 rounded-[1.5rem] p-3.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-3 duration-300 flex flex-col gap-1.5"
                                            onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
                                            onMouseLeave={handleMouseLeaveDropdown}
                                        >
                                            {menu.items?.map((subItem, sIdx) => (
                                                <a
                                                    key={sIdx}
                                                    href={`#${subItem.id}`}
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="text-slate-200 hover:text-yellow-400 text-[12px] font-semibold py-1.5 px-3 rounded-xl hover:bg-white/15 transition-all flex items-center justify-between group/sub"
                                                >
                                                    <span>{subItem.name}</span>
                                                    <ChevronRight size={14} className="text-slate-300 group-hover/sub:text-yellow-400 group-hover/sub:translate-x-1 transition-transform" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Side: Quick Controls, Log In & Sign Up at Far Right */}
                <div className="hidden lg:flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2">

                        <button
                            onClick={toggleDualMode}
                            className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center relative overflow-hidden group cursor-pointer ${isDualMode
                                    ? 'border-amber-400 text-amber-300 bg-gradient-to-br from-amber-600/80 to-rose-600/80 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-105'
                                    : 'border-white/20 text-cyan-300 bg-white/10 backdrop-blur-md hover:scale-110'
                                }`}
                            title={isDualMode ? "Matikan Dual Mode" : "Aktifkan Dual Mode"}
                        >
                            <Layers size={16} className={isDualMode ? "animate-pulse text-amber-200" : ""} />
                        </button>

                        <Link
                            href="/absensi"
                            className="w-9 h-9 rounded-full border border-white/20 text-emerald-300 bg-white/10 backdrop-blur-md hover:scale-110 transition-all flex items-center justify-center relative overflow-hidden group cursor-pointer"
                            title="Halaman Absensi Full Screen"
                        >
                            <QrCode size={16} className="animate-pulse text-emerald-300" />
                        </Link>
                    </div>

                    {/* Log In & Sign Up Buttons at Far Right Corner */}
                    <div className="flex items-center gap-3 pl-2">
                        <Link
                            href="/login"
                            className="text-white hover:text-yellow-400 font-extrabold text-xs xl:text-sm tracking-wide uppercase transition-colors px-3 py-1.5 drop-shadow"
                        >
                            Log In
                        </Link>

                        <Link
                            href="/login"
                            className="px-6 py-2.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 text-white font-black text-xs xl:text-sm uppercase tracking-wider transition-all shadow-lg hover:border-yellow-400 flex items-center gap-1.5"
                        >
                            <span>Sign Up</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="hidden text-slate-300 hover:text-white p-2 rounded-xl bg-black/40 border border-white/20 backdrop-blur-md active:scale-95 transition-all"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle Navigation Menu"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`hidden absolute top-full left-0 w-full bg-slate-950/98 backdrop-blur-3xl border-b border-cyan-500/30 transition-all duration-300 overflow-y-auto ${isMobileMenuOpen ? 'max-h-[85vh] py-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
                }`}>
                <nav className="flex flex-col px-6 sm:px-8 gap-2.5 custom-scrollbar">
                    {navMenuItems.map((menu, idx) => {
                        if (menu.hasDropdown) {
                            const isExpanded = !!mobileExpanded[menu.id];
                            return (
                                <div key={idx} className="flex flex-col bg-slate-900/40 border border-white/5 rounded-2xl p-3">
                                    <button
                                        onClick={() => toggleMobileExpand(menu.id)}
                                        className="flex justify-between items-center text-sm font-bold text-slate-200 hover:text-yellow-400 py-1"
                                    >
                                        <span>{menu.name}</span>
                                        <ChevronDown size={16} className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180 text-yellow-400' : 'text-slate-400'}`} />
                                    </button>
                                    {isExpanded && (
                                        <div className="flex flex-col pl-3 border-l-2 border-cyan-500/40 gap-2 mt-2 pt-2 border-t border-white/5">
                                            {menu.columns ? (
                                                menu.columns.map((column, cIdx) => (
                                                    <div key={cIdx} className="space-y-1.5">
                                                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mt-1">{column.title}</span>
                                                        {column.items.map((subItem, sIdx) => (
                                                            <a
                                                                key={sIdx}
                                                                href={`#${subItem.id}`}
                                                                onClick={() => {
                                                                    setIsMobileMenuOpen(false);
                                                                    setActiveIndex(idx);
                                                                }}
                                                                className="text-xs font-semibold text-slate-300 hover:text-yellow-400 block py-1.5 pl-2 rounded-lg hover:bg-cyan-500/10 transition-colors"
                                                            >
                                                                {subItem.name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                ))
                                            ) : (
                                                menu.items?.map((subItem, sIdx) => (
                                                    <a
                                                        key={sIdx}
                                                        href={`#${subItem.id}`}
                                                        onClick={() => {
                                                            setIsMobileMenuOpen(false);
                                                            setActiveIndex(idx);
                                                        }}
                                                        className="text-xs font-semibold text-slate-300 hover:text-yellow-400 block py-1.5 pl-2 rounded-lg hover:bg-cyan-500/10 transition-colors"
                                                    >
                                                        {subItem.name}
                                                    </a>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        const commonProps = {
                            onClick: () => {
                                setActiveIndex(idx);
                                setIsMobileMenuOpen(false);
                            },
                            className: `text-sm font-bold tracking-wide transition-colors ${activeIndex === idx ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' : 'text-slate-200 hover:text-white border-white/5'} py-3 px-4 rounded-2xl border bg-slate-900/40`
                        };

                        return menu.isRoute ? (
                            <Link key={idx} href={menu.path} {...commonProps}>{menu.name}</Link>
                        ) : (
                            <a key={idx} href={`#${menu.id}`} {...commonProps}>{menu.name}</a>
                        );
                    })}

                    {/* Mobile Quick Mode Toggles */}
                    <div className="grid grid-cols-1 gap-2 mt-2">

                        {/* Mobile Dual Mode Toggle */}
                        <button
                            onClick={() => {
                                toggleDualMode();
                                setIsMobileMenuOpen(false);
                            }}
                            className={`border text-center py-3 rounded-2xl font-bold uppercase text-[11px] tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${isDualMode
                                    ? 'bg-amber-600/80 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                                    : 'bg-slate-900/60 border-cyan-500/30 text-cyan-300'
                                }`}
                        >
                            <Layers size={16} className={isDualMode ? "text-amber-200" : "text-cyan-400"} />
                            <span>{isDualMode ? "Dual ON" : "Dual Mode"}</span>
                        </button>
                    </div>

                    {/* Mobile Absensi Link */}
                    <Link
                        href="/absensi"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-center py-3 rounded-2xl font-bold uppercase text-xs tracking-wider mt-1 flex items-center justify-center gap-2"
                    >
                        <QrCode size={16} className="animate-pulse text-emerald-400" />
                        <span>Kios E-Absensi</span>
                    </Link>

                    <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white text-center py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider mt-1 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
                    >
                        <ShieldCheck size={18} />
                        <span>Masuk ke Sistem</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
};
