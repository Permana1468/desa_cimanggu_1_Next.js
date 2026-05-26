"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
                        { name: 'Sejarah', id: 'profil' },
                        { name: 'Visi-Misi', id: 'profil' },
                        { name: 'Struktur Organisasi', id: 'organisasi' },
                    ]
                },
                {
                    title: 'Wilayah',
                    items: [
                        { name: 'Batas Desa', id: 'peta-interaktif' },
                        { name: 'RW/RT', id: 'wilayah' },
                    ]
                },
                {
                    title: 'Layanan',
                    items: [
                        { name: 'Surat Keterangan', id: 'layanan' },
                        { name: 'Bantuan Sosial', id: 'layanan' },
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
                { name: 'LPM', id: 'lembaga' },
                { name: 'BPD', id: 'lembaga', hasSubmenu: true },
            ]
        },
        { 
            name: 'Kabar & Data', 
            id: 'kabar-data',
            hasDropdown: true,
            items: [
                { name: 'Berita', id: 'berita' },
                { name: 'Statistik', id: 'statistik' },
                { name: 'Peta', id: 'peta-interaktif' },
            ]
        },
        { name: 'Wirausaha', id: 'umkm', isRoute: true, path: '/umkm' },
    ];

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0f172a]/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
            } `}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                {/* Logo & Branding */}
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                        <Image
                            src={siteData?.logo || "/images/logo-bogor.png"}
                            alt="Logo Desa"
                            fill
                            sizes="40px"
                            priority
                            className="object-contain drop-shadow-md"
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-white font-bold text-[16px] tracking-wide leading-none mb-1 uppercase">
                            {siteData?.title || "DESA CIMANGGU I"}
                        </span>
                        <span className="text-yellow-400 font-semibold text-[11px] leading-none">
                            Kecamatan Cibungbulang
                        </span>
                    </div>
                </div>

                {/* Desktop Menu */}
                <nav
                    className="hidden lg:flex relative items-center bg-[#1e293b]/50 backdrop-blur-md border border-white/10 rounded-full p-1.5 shadow-xl"
                    onMouseLeave={() => {
                        handleMouseLeave();
                        handleMouseLeaveDropdown();
                    }}
                >
                    <div
                        className="absolute top-1.5 bottom-1.5 bg-white/10 rounded-full transition-all duration-300 ease-out z-0"
                        style={{
                            left: `${pillStyle.left}px`,
                            width: `${pillStyle.width}px`,
                            opacity: pillStyle.opacity
                        }}
                    />

                    {navMenuItems.map((menu, idx) => {
                        const commonClass = `relative z-10 px-4 py-2 text-[12px] xl:text-[14px] font-medium transition-colors duration-300 flex items-center gap-1.5 cursor-pointer ${activeIndex === idx ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'} `;

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
                                        {menu.hasDropdown && <ChevronDown size={14} className={`opacity-70 transition-transform duration-300 ${activeDropdown === menu.id ? 'rotate-180' : ''}`} />}
                                    </a>
                                )}

                                {/* Dropdown Megamenu (Informasi Publik) */}
                                {menu.hasDropdown && menu.id === 'informasi-publik' && activeDropdown === 'informasi-publik' && (
                                    <div
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[580px] bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] p-7 shadow-2xl z-50 animate-in fade-in slide-in-from-top-3 duration-350 flex gap-8"
                                        onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
                                        onMouseLeave={handleMouseLeaveDropdown}
                                    >
                                        {menu.columns?.map((column, cIdx) => (
                                            <div key={cIdx} className="flex-1 space-y-4">
                                                <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-white/5">
                                                    {column.title}
                                                </div>
                                                <div className="flex flex-col gap-2.5">
                                                    {column.items.map((subItem, sIdx) => (
                                                        <a
                                                            key={sIdx}
                                                            href={`#${subItem.id}`}
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="text-slate-300 hover:text-yellow-400 text-[13px] xl:text-[14px] font-bold transition-colors block py-0.5"
                                                        >
                                                            {subItem.name}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Standard Dropdown (Lembaga Desa, Kabar & Data) */}
                                {menu.hasDropdown && menu.id !== 'informasi-publik' && activeDropdown === menu.id && (
                                    <div
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[220px] bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-3 duration-350 flex flex-col gap-1.5"
                                        onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
                                        onMouseLeave={handleMouseLeaveDropdown}
                                    >
                                        {menu.items?.map((subItem, sIdx) => (
                                            <a
                                                key={sIdx}
                                                href={`#${subItem.id}`}
                                                onClick={() => setActiveDropdown(null)}
                                                className="text-slate-300 hover:text-yellow-400 text-[13px] xl:text-[14px] font-bold py-2 px-3.5 rounded-xl hover:bg-white/5 transition-all flex items-center justify-between"
                                            >
                                                <span>{subItem.name}</span>
                                                {subItem.hasSubmenu && <ChevronRight size={14} className="text-slate-500" />}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="hidden lg:flex items-center gap-4">
                    <Link href="/login" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2 rounded-full text-[13px] font-medium transition-all shadow-lg hover:shadow-blue-500/40">
                        Masuk
                    </Link>
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="lg:hidden text-gray-300 hover:text-white p-2"
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
            <div className={`lg:hidden absolute top-full left-0 w-full bg-[#0f172a]/98 backdrop-blur-xl border-t border-white/10 transition-all duration-300 overflow-y-auto ${isMobileMenuOpen ? 'max-h-[85vh] py-6 shadow-2xl' : 'max-h-0 py-0'} `}>
                <nav className="flex flex-col px-8 gap-3">
                    {navMenuItems.map((menu, idx) => {
                        if (menu.hasDropdown) {
                            const isExpanded = !!mobileExpanded[menu.id];
                            return (
                                <div key={idx} className="flex flex-col">
                                    <button
                                        onClick={() => toggleMobileExpand(menu.id)}
                                        className="flex justify-between items-center text-[15px] font-medium text-gray-300 hover:text-white py-2"
                                    >
                                        <span>{menu.name}</span>
                                        <ChevronDown size={16} className={`transform transition-transform duration-350 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isExpanded && (
                                        <div className="flex flex-col pl-4 border-l border-white/10 gap-2.5 mt-1 mb-2">
                                            {menu.columns ? (
                                                menu.columns.map((column, cIdx) => (
                                                    <div key={cIdx} className="space-y-1.5">
                                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mt-2">{column.title}</span>
                                                        {column.items.map((subItem, sIdx) => (
                                                            <a
                                                                key={sIdx}
                                                                href={`#${subItem.id}`}
                                                                onClick={() => {
                                                                    setIsMobileMenuOpen(false);
                                                                    setActiveIndex(idx);
                                                                }}
                                                                className="text-[14px] font-bold text-gray-400 hover:text-yellow-400 block py-1"
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
                                                        className="text-[14px] font-bold text-gray-400 hover:text-yellow-400 block py-1"
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
                            className: `text-[15px] font-medium transition-colors ${activeIndex === idx ? 'text-yellow-400' : 'text-gray-300 hover:text-white'} py-2`
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
                        className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-2.5 rounded-lg font-bold mt-4 shadow-lg"
                    >
                        Masuk ke Sistem
                    </Link>
                </nav>
            </div>
        </header>
    );
};
