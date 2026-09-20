"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    ChevronRight,
    Map as MapIcon,
    Sparkles,
    Instagram,
    Facebook,
    Twitter,
    Youtube,
    Globe
} from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

interface DreamHeroOverlayProps {
    siteData: any;
}

export function DreamHeroOverlay({ siteData }: DreamHeroOverlayProps) {
    return (
        <section id="beranda" className="w-full h-full flex flex-col justify-between items-start text-left px-6 sm:px-12 pt-28 sm:pt-36 pb-10 relative z-30 pointer-events-auto">
            {/* Left Content Column - Aligned exactly with DESA CIMANGGU I logo (px-6 sm:px-12) */}
            <div className="w-full flex-1 flex flex-col justify-center items-start max-w-md xl:max-w-lg">
                <ScrollReveal>
                    <div className="flex flex-col items-start text-left space-y-4 sm:space-y-5">
                        {/* Telemetry Pill Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/25 text-cyan-200 text-[10px] sm:text-xs font-bold shadow-lg">
                            <span className="relative flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                            </span>
                            <span className="font-extrabold uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">
                                {siteData?.hero_badge || "SISTEM SIAP DIGITALISASI • JARINGAN LANGSUNG"}
                            </span>
                            <Sparkles size={13} className="text-yellow-400 animate-spin shrink-0" style={{ animationDuration: '8s' }} />
                        </div>

                        {/* Scaled Left-Aligned Title (Sized & positioned so it aligns with logo and clear of center door) */}
                        <div className="space-y-0.5">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                                {siteData?.hero_title || "Pemerintah Desa"}
                            </h2>

                            <motion.h1
                                animate={{
                                    filter: [
                                        "drop-shadow(0px 0px 20px rgba(250, 204, 21, 0.4))",
                                        "drop-shadow(0px 0px 45px rgba(250, 204, 21, 0.8))",
                                        "drop-shadow(0px 0px 20px rgba(250, 204, 21, 0.4))"
                                    ]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 leading-tight uppercase tracking-tight select-none"
                            >
                                {siteData?.title || "CIMANGGU I"}
                            </motion.h1>
                        </div>

                        {/* Compact Subtitle Text (Left-aligned, transparent) */}
                        <p className="text-slate-100 text-xs sm:text-sm lg:text-base leading-relaxed max-w-sm sm:max-w-md font-medium drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
                            {siteData?.hero_subtitle || "Platform digital terpadu untuk mengelola, memonitor, dan menganalisis data pemberdayaan masyarakat Desa Cimanggu I secara real-time."}
                        </p>

                        {/* Sleek Glass CTA Buttons */}
                        <div className="flex flex-row items-center gap-3 sm:gap-4 pt-2">
                            <Link
                                href="/login"
                                className="relative group bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-6 py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-[0_0_25px_rgba(59,130,246,0.6)] flex items-center gap-2 text-xs uppercase tracking-wider"
                            >
                                <ShieldCheck size={16} />
                                <span>Masuk ke Sistem</span>
                                <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <a
                                href="#peta-interaktif"
                                className="bg-white/15 backdrop-blur-xl hover:bg-white/25 text-white border border-white/30 hover:border-white/50 px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider"
                            >
                                <MapIcon size={16} className="text-yellow-300" />
                                <span>Jelajahi Peta</span>
                            </a>
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            {/* Bottom-Left Social Media Bar (Aligned perfectly with logo margin px-6 sm:px-12) */}
            <div className="pt-4 w-full max-w-xs sm:max-w-sm border-t border-white/15 mt-4">
                <div className="flex items-center gap-3 text-white/90">
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-slate-100 hover:bg-white/25 hover:text-yellow-300 hover:scale-110 transition-all shadow-md group"
                        title="Instagram Resmi Desa Cimanggu I"
                    >
                        <Instagram size={16} className="group-hover:rotate-6 transition-transform" />
                    </a>
                    <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-slate-100 hover:bg-white/25 hover:text-yellow-300 hover:scale-110 transition-all shadow-md group"
                        title="Facebook Halaman Pemdes"
                    >
                        <Facebook size={16} className="group-hover:rotate-6 transition-transform" />
                    </a>
                    <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-slate-100 hover:bg-white/25 hover:text-yellow-300 hover:scale-110 transition-all shadow-md group"
                        title="Twitter / X Cyber Net"
                    >
                        <Twitter size={16} className="group-hover:rotate-6 transition-transform" />
                    </a>
                    <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-slate-100 hover:bg-white/25 hover:text-yellow-300 hover:scale-110 transition-all shadow-md group"
                        title="YouTube Media Pemdes"
                    >
                        <Youtube size={16} className="group-hover:rotate-6 transition-transform" />
                    </a>
                    <a
                        href="https://cimanggu1.desa.id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-slate-100 hover:bg-white/25 hover:text-yellow-300 hover:scale-110 transition-all shadow-md group"
                        title="Portal Resmi WebGIS Desa"
                    >
                        <Globe size={16} className="group-hover:rotate-6 transition-transform" />
                    </a>
                </div>
            </div>
        </section>
    );
}
