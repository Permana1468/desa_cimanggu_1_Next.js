"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LandingNavbarProps {
    siteData: any;
}

export const LandingNavbar = ({ siteData }: LandingNavbarProps) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

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

    const navMenuItems = [
        { name: 'Beranda', id: 'beranda' },
        { name: 'Profil', id: 'profil' },
        { name: 'Wilayah', id: 'wilayah' },
        { name: 'Statistik', id: 'statistik' },
        { name: 'Layanan', id: 'layanan' },
        { name: 'Peta', id: 'peta-interaktif' },
        { name: 'Lembaga', id: 'lembaga' },
        { name: 'Berita', id: 'berita' },
        { name: 'UMKM', id: 'umkm', isRoute: true, path: '/umkm' },
        { name: 'Organisasi', id: 'organisasi' },
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
                    onMouseLeave={handleMouseLeave}
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
                        const commonProps = {
                            className: `relative z-10 px-4 py-2 text-[12px] xl:text-[14px] font-medium transition-colors duration-300 ${activeIndex === idx ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'} `,
                            onMouseEnter: () => handleMouseEnter(idx),
                            onClick: () => setActiveIndex(idx)
                        };

                        return menu.isRoute ? (
                            <Link key={idx} href={menu.path} ref={(el) => { itemRefs.current[idx] = el; }} {...commonProps}>
                                {menu.name}
                            </Link>
                        ) : (
                            <a key={idx} href={`#${menu.id}`} ref={(el) => { itemRefs.current[idx] = el; }} {...commonProps}>
                                {menu.name}
                            </a>
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
            <div className={`lg:hidden absolute top-full left-0 w-full bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 py-4 shadow-xl' : 'max-h-0 py-0'} `}>
                <nav className="flex flex-col px-6 gap-4">
                    {navMenuItems.map((menu, idx) => {
                        const commonProps = {
                            onClick: () => {
                                setActiveIndex(idx);
                                setIsMobileMenuOpen(false);
                            },
                            className: `text-[15px] font-medium transition-colors ${activeIndex === idx ? 'text-yellow-400' : 'text-gray-300 hover:text-white'} `
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
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 text-center py-2.5 rounded-lg font-bold mt-2 shadow-lg"
                    >
                        Masuk ke Sistem
                    </Link>
                </nav>
            </div>
        </header>
    );
};
