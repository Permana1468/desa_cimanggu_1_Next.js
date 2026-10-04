"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, ArrowRight, Cpu, Sparkles, Store, Users, Send } from 'lucide-react';
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

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
        }, 8000);
        return () => clearInterval(timer);
    }, [heroImages.length]);

    if (isDualMode) {
        return <CampoSantoHero siteData={siteData} />;
    }

    return (
        <section id="beranda" className="relative min-h-[100dvh] flex flex-col justify-center px-4 sm:px-8 md:px-20 lg:px-32 overflow-hidden py-16 sm:py-0">
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
                    ))
                )}

                {/* Cyber Gradient Vignette Overlays */}
                <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#060a17]/90 via-[#060a17]/60 to-transparent sm:via-[#060a17]/85"></div>
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#060b17] via-transparent to-black/40"></div>

                {/* Animated Vertical Cyber Scanner Line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 z-25 animate-laser-scan pointer-events-none"></div>
            </div>

            {/* HERO TEXT & HUD CONTENT (Mobile App Style) */}
            <div className="relative z-30 w-full mt-10 flex flex-col items-center justify-center gap-6">
                
                {/* Mobile Kades Photo - 3D Pop Out Effect */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-48 h-48 sm:w-56 sm:h-56 mt-4"
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
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-40 w-[85%]"
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
                <ScrollReveal delay={200} className="w-full mt-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="w-6 h-[1.5px] bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.3em] [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">Selamat Datang Di</span>
                            <span className="w-6 h-[1.5px] bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                        </div>
                        
                        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight uppercase tracking-wide [text-shadow:0_4px_8px_rgba(0,0,0,0.8)] mb-2">
                            {siteData?.title || "DESA CIMANGGU I"}
                        </h1>

                        <div className="inline-flex items-center px-3 py-1.5 bg-emerald-500/15 border border-emerald-400/30 rounded-full backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4)] mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Sistem Digitalisasi Desa</span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium px-6 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                            Melangkah maju dengan tata kelola pemerintahan yang <strong className="text-emerald-400 font-bold">transparan</strong> dan <strong className="text-emerald-400 font-bold">cepat</strong>.
                        </p>
                    </div>
                </ScrollReveal>

                {/* Quick Feature Buttons Grid */}
                <ScrollReveal delay={300} className="w-full px-6 mt-2">
                    <div className="flex items-center justify-center gap-3">
                        <Link href="/profil/sejarah" className="flex flex-col items-center gap-1.5">
                            <div className="w-10 h-10 rounded-full border border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)] flex items-center justify-center bg-emerald-950/60 backdrop-blur-md">
                                <MapPin className="text-emerald-400" size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Sejarah</span>
                        </Link>
                        <Link href="/umkm" className="flex flex-col items-center gap-1.5">
                            <div className="w-10 h-10 rounded-full border border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)] flex items-center justify-center bg-amber-950/60 backdrop-blur-md">
                                <Store className="text-amber-400" size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">UMKM</span>
                        </Link>
                        <Link href="/organisasi/aparatur" className="flex flex-col items-center gap-1.5">
                            <div className="w-10 h-10 rounded-full border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)] flex items-center justify-center bg-blue-950/60 backdrop-blur-md">
                                <Users className="text-blue-400" size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Aparatur</span>
                        </Link>
                        <Link href="/kontak" className="flex flex-col items-center gap-1.5">
                            <div className="w-10 h-10 rounded-full border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)] flex items-center justify-center bg-purple-950/60 backdrop-blur-md">
                                <Send className="text-purple-400" size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Kontak</span>
                        </Link>
                    </div>
                </ScrollReveal>

                {/* Main CTA Buttons */}
                <ScrollReveal delay={400} className="w-full px-6 mt-4">
                    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                        <Link
                            href="/login"
                            className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2.5 text-xs sm:text-sm tracking-wide"
                        >
                            <ShieldCheck size={16} className="text-slate-950" />
                            <span>Masuk ke Sistem</span>
                        </Link>

                        <a
                            href="#peta-interaktif"
                            className="w-full bg-slate-900/80 backdrop-blur-md text-white border border-cyan-500/40 px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-cyan-200"
                        >
                            <MapPin size={16} className="text-cyan-400" />
                            <span>Jelajahi Peta Wilayah</span>
                        </a>
                    </div>
                </ScrollReveal>
            </div>

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
