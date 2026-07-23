"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, ArrowRight, Cpu, Sparkles } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

interface HeroProps {
    siteData: any;
    heroImages: string[];
}

export const LandingHero = ({ siteData, heroImages }: HeroProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
        }, 8000);
        return () => clearInterval(timer);
    }, [heroImages.length]);

    return (
        <section id="beranda" className="relative min-h-[100dvh] flex flex-col justify-center px-4 sm:px-8 md:px-20 lg:px-32 overflow-hidden py-16 sm:py-0">
            {/* BACKGROUND CAROUSEL WITH DYNAMIC CYBER OVERLAYS */}
            <div className="absolute inset-0 z-0 bg-[#060b17] overflow-hidden">
                {heroImages.map((src, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        <Image
                            src={src}
                            alt={`Hero Slide ${index + 1}`}
                            fill
                            priority={index === 0}
                            sizes="100vw"
                            className={`object-cover object-center transition-transform duration-[18000ms] ease-out ${index === currentSlide ? 'scale-110 translate-y-0' : 'scale-100 translate-y-2'
                                }`}
                        />
                    </div>
                ))}

                {/* Cyber Gradient Vignette Overlays */}
                <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#060a17]/90 via-[#060a17]/60 to-transparent sm:via-[#060a17]/85"></div>
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#060b17] via-transparent to-black/40"></div>

                {/* Animated Vertical Cyber Scanner Line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 z-25 animate-laser-scan pointer-events-none"></div>
            </div>

            {/* HERO TEXT & HUD CONTENT */}
            <ScrollReveal delay={200} className="relative z-30 w-full max-w-3xl mt-8 sm:mt-12">
                <div className="flex flex-col items-start">
                    {/* Futuristic Live Telemetry Badge */}
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-full px-4 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-[11px] text-cyan-300 mb-4 sm:mb-6 flex items-center gap-2.5 sm:gap-3 shadow-[0_0_20px_rgba(6,182,212,0.2)] max-w-full">
                        <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-cyan-500"></span>
                        </span>
                        <span className="font-semibold uppercase tracking-widest text-[9px] sm:text-[10px] truncate">
                            {siteData?.hero_badge || "SYSTEM DIGITALISATION READY • LIVE NET"}
                        </span>
                        <Sparkles size={13} className="text-yellow-400 animate-spin shrink-0 hidden sm:inline-block" style={{ animationDuration: '8s' }} />
                    </div>

                    {/* Sub-Title */}
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-200 mb-1.5 sm:mb-2 leading-tight tracking-wide flex items-center gap-2.5">
                        {siteData?.hero_title || "Pemerintah Desa"}
                        <Cpu className="text-cyan-400 animate-pulse hidden md:inline-block" size={28} />
                    </h2>

                    {/* Glowing Animated Main Title */}
                    <motion.h1
                        animate={{
                            y: [0, -6, 0],
                            filter: [
                                "drop-shadow(0px 0px 15px rgba(250, 204, 21, 0.3))",
                                "drop-shadow(0px 0px 30px rgba(250, 204, 21, 0.6))",
                                "drop-shadow(0px 0px 15px rgba(250, 204, 21, 0.3))"
                            ]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="text-3xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 mb-4 sm:mb-6 leading-none uppercase tracking-tight select-none cursor-default"
                    >
                        {siteData?.title || "CIMANGGU I"}
                    </motion.h1>

                    {/* Description */}
                    <p className="text-slate-300 text-xs sm:text-base md:text-lg mb-6 sm:mb-10 leading-relaxed max-w-xl font-normal drop-shadow-md border-l-2 border-cyan-500/40 pl-3.5 sm:pl-4 bg-slate-900/40 backdrop-blur-sm py-2 rounded-r-xl">
                        {siteData?.hero_subtitle || "Platform digital terpadu untuk mengelola, memonitor, dan menganalisis data pemberdayaan masyarakat Desa Cimanggu I secara real-time."}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-5 w-full sm:w-auto">
                        <Link
                            href="/login"
                            className="relative group bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold px-6 sm:px-9 py-3.5 sm:py-4 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_45px_rgba(245,158,11,0.8)] flex items-center justify-center gap-2.5 text-xs sm:text-sm tracking-wide w-full sm:w-auto"
                        >
                            <ShieldCheck size={18} className="text-slate-950" />
                            <span>Masuk ke Sistem</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <a
                            href="#peta-interaktif"
                            className="bg-slate-900/80 backdrop-blur-md hover:bg-slate-800/90 text-white border border-cyan-500/40 hover:border-cyan-400 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-cyan-200 w-full sm:w-auto"
                        >
                            <MapPin size={18} className="text-cyan-400" />
                            <span>Jelajahi Peta Wilayah</span>
                        </a>
                    </div>
                </div>
            </ScrollReveal>

            {/* SCROLL PROMPT */}
            <div className="absolute inset-x-0 bottom-4 sm:bottom-8 flex justify-center pointer-events-none z-30">
                <a
                    href="#layanan"
                    className="flex flex-col items-center opacity-80 hover:opacity-100 transition-all pointer-events-auto group cursor-pointer"
                >
                    <span className="text-[9px] sm:text-[10px] tracking-[0.3em] text-cyan-400 font-black mb-1 group-hover:text-yellow-400 transition-colors uppercase">
                        SCROLL
                    </span>
                    <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 flex items-center justify-center text-yellow-400 group-hover:border-yellow-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <span className="text-xs sm:text-sm font-bold animate-bounce">↓</span>
                    </div>
                </a>
            </div>
        </section>
    );
};
