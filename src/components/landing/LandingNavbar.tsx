"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

interface LandingNavbarProps {
    siteData: any;
}

export const LandingNavbar = ({ siteData }: LandingNavbarProps) => {
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
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
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
        <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
            isScrolled 
                ? 'bg-[#080e1c]/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_10px_30px_rgba(6,182,212,0.15)] py-3' 
                : 'bg-transparent py-6'
        }`}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                {/* Logo & Branding */}
                <div className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
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
                        <div className="flex items-center gap-2">
                            <span className="text-white font-black text-[15px] md:text-[17px] tracking-wide leading-none uppercase">
                                {siteData?.title || "DESA CIMANGGU I"}
                            </span>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </div>
                        <span className="text-yellow-400 font-semibold text-[11px] leading-none mt-1 tracking-wider">
                            Kecamatan Cibungbulang
                        </span>
                    </div>
                </div>

                {/* Desktop Cyber Nav Menu */}
                <nav
                    className="hidden lg:flex relative items-center bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-full p-1.5 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    onMouseLeave={() => {
                        handleMouseLeave();
                        handleMouseLeaveDropdown();
                    }}
                >
                    {/* Glowing Selection Pill */}
                    <div
                        className="absolute top-1.5 bottom-1.5 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border border-yellow-400/50 rounded-full transition-all duration-300 ease-out z-0 shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                        style={{
                            left: `${pillStyle.left}px`,
                            width: `${pillStyle.width}px`,
                            opacity: pillStyle.opacity
                        }}
                    />

                    {navMenuItems.map((menu, idx) => {
                        const commonClass = `relative z-10 px-4 py-2 text-[12px] xl:text-[13px] font-bold tracking-wide uppercase transition-colors duration-300 flex items-center gap-1.5 cursor-pointer ${
                            activeIndex === idx ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'
                        }`;

                        return (
                            <div
                                key={idx}
                                ref={(el) => { itemRefs.current[idx] = el; }}
                                className="relative flex items-center"
                                onMouseEnter={() => {
                                    handleMouseEnter(idx);
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
                                                size={14} 
                                                className={`opacity-70 transition-transform duration-300 ${activeDropdown === menu.id ? 'rotate-180 text-yellow-400' : ''}`} 
                                            />
                                        )}
                                    </a>
                                )}

                                {/* Dropdown Megamenu (Informasi Publik) */}
                                {menu.hasDropdown && menu.id === 'informasi-publik' && activeDropdown === 'informasi-publik' && (
                                    <div
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/30 rounded-[2rem] p-7 shadow-[0_10px_40px_rgba(6,182,212,0.3)] z-50 animate-in fade-in slide-in-from-top-3 duration-300 flex gap-8"
                                        onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
                                        onMouseLeave={handleMouseLeaveDropdown}
                                    >
                                        {menu.columns?.map((column, cIdx) => (
                                            <div key={cIdx} className="flex-1 space-y-4">
                                                <div className="text-[11px] font-black text-cyan-400 uppercase tracking-widest pb-2 border-b border-cyan-500/20 flex items-center gap-1.5">
                                                    <Sparkles size={12} /> {column.title}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {column.items.map((subItem, sIdx) => (
                                                        <a
                                                            key={sIdx}
                                                            href={`#${subItem.id}`}
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="text-slate-300 hover:text-yellow-400 text-[13px] font-semibold transition-colors block py-1 hover:translate-x-1 duration-200"
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
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[230px] bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/30 rounded-[1.5rem] p-4 shadow-[0_10px_40px_rgba(6,182,212,0.3)] z-50 animate-in fade-in slide-in-from-top-3 duration-300 flex flex-col gap-1.5"
                                        onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
                                        onMouseLeave={handleMouseLeaveDropdown}
                                    >
                                        {menu.items?.map((subItem, sIdx) => (
                                            <a
                                                key={sIdx}
                                                href={`#${subItem.id}`}
                                                onClick={() => setActiveDropdown(null)}
                                                className="text-slate-300 hover:text-yellow-400 text-[13px] font-semibold py-2 px-3.5 rounded-xl hover:bg-cyan-500/10 transition-all flex items-center justify-between group/sub"
                                            >
                                                <span>{subItem.name}</span>
                                                <ChevronRight size={14} className="text-slate-500 group-hover/sub:text-yellow-400 group-hover/sub:translate-x-1 transition-transform" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Login Button */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link 
                        href="/login" 
                        className="relative group bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] flex items-center gap-2"
                    >
                        <ShieldCheck size={16} />
                        <span>Masuk</span>
                    </Link>
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="lg:hidden text-slate-300 hover:text-white p-2 rounded-xl bg-slate-900/80 border border-cyan-500/30"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`lg:hidden absolute top-full left-0 w-full bg-slate-950/98 backdrop-blur-2xl border-t border-cyan-500/30 transition-all duration-300 overflow-y-auto ${
                isMobileMenuOpen ? 'max-h-[85vh] py-6 shadow-2xl' : 'max-h-0 py-0'
            }`}>
                <nav className="flex flex-col px-8 gap-3">
                    {navMenuItems.map((menu, idx) => {
                        if (menu.hasDropdown) {
                            const isExpanded = !!mobileExpanded[menu.id];
                            return (
                                <div key={idx} className="flex flex-col">
                                    <button
                                        onClick={() => toggleMobileExpand(menu.id)}
                                        className="flex justify-between items-center text-[15px] font-bold text-slate-300 hover:text-yellow-400 py-2.5 border-b border-white/5"
                                    >
                                        <span>{menu.name}</span>
                                        <ChevronDown size={16} className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180 text-yellow-400' : ''}`} />
                                    </button>
                                    {isExpanded && (
                                        <div className="flex flex-col pl-4 border-l-2 border-cyan-500/30 gap-2 mt-2 mb-3">
                                            {menu.columns ? (
                                                menu.columns.map((column, cIdx) => (
                                                    <div key={cIdx} className="space-y-1.5">
                                                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mt-2">{column.title}</span>
                                                        {column.items.map((subItem, sIdx) => (
                                                            <a
                                                                key={sIdx}
                                                                href={`#${subItem.id}`}
                                                                onClick={() => {
                                                                    setIsMobileMenuOpen(false);
                                                                    setActiveIndex(idx);
                                                                }}
                                                                className="text-[14px] font-semibold text-slate-400 hover:text-yellow-400 block py-1"
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
                                                        className="text-[14px] font-semibold text-slate-400 hover:text-yellow-400 block py-1"
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
                            className: `text-[15px] font-bold tracking-wide transition-colors ${activeIndex === idx ? 'text-yellow-400' : 'text-slate-300 hover:text-white'} py-2.5 border-b border-white/5`
                        };

                        return menu.isRoute ? (
                            <Link key={idx} href={menu.path} {...commonProps}>{menu.name}</Link>
                        ) : (
                            <a key={idx} href={`#${menu.id}`} {...commonProps}>{menu.name}</a>
                        );
                    })}
                    <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center py-3 rounded-xl font-black uppercase text-sm mt-4 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    >
                        Masuk ke Sistem
                    </Link>
                </nav>
            </div>
        </header>
    );
};
