"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
        <section id="beranda" className="relative h-[90vh] md:h-screen flex flex-col justify-center px-6 md:px-24 lg:px-32 overflow-hidden">
            {/* BACKGROUND ANIMASI KEN BURNS */}
            <div className="absolute inset-0 z-0 bg-black overflow-hidden">
                {heroImages.map((src, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            } `}
                    >
                        <Image
                            src={src}
                            alt={`Hero Slide ${index + 1}`}
                            fill
                            priority={index === 0}
                            sizes="100vw"
                            className={`object-cover transition-transform duration-[15000ms] ease-out ${index === currentSlide ? 'scale-105' : 'scale-100'}`}
                        />
                    </div>
                ))}
                <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#0b1120] via-[#0b1120]/70 to-transparent"></div>
            </div>

            {/* KONTEN TEKS HERO */}
            <ScrollReveal delay={200} className="relative z-30 w-full max-w-2xl mt-12">
                <div className="flex flex-col items-start">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 text-[11px] text-gray-300 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
                        Sistem Digitalisasi Desa (SDD)
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
                        {siteData?.hero_title || "Pemerintah Desa"}
                    </h1>
                    <h1 className="text-4xl md:text-6xl font-black text-yellow-400 mb-6 leading-tight drop-shadow-lg uppercase">
                        {siteData?.title || "CIMANGGU I"}
                    </h1>

                    <p className="text-gray-300 text-sm md:text-base mb-10 leading-relaxed max-w-lg drop-shadow-md">
                        {siteData?.hero_subtitle || "Platform digital terpadu untuk mengelola, memonitor, dan menganalisis data pemberdayaan masyarakat."}
                    </p>

                    <div className="flex flex-wrap gap-5">
                        <Link href="/login" className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-900 font-bold px-8 py-3.5 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] flex items-center gap-2 text-sm">
                            Masuk ke Sistem <span>→</span>
                        </Link>
                        <a href="#peta-interaktif" className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 px-8 py-3.5 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 text-sm font-semibold">
                            Jelajahi Peta Wilayah <span>→</span>
                        </a>
                    </div>
                </div>
            </ScrollReveal>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0b1120] to-transparent z-20 pointer-events-none"></div>

            {/* INDIKATOR BAWAH */}
            <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none z-30">
                <div className="flex flex-col items-center gap-3 pointer-events-auto">
                    <div className="flex gap-1.5">
                        {heroImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${index === currentSlide ? 'w-6 bg-yellow-400' : 'w-1.5 bg-white/30 hover:bg-white/60'
                                    } `}
                                aria-label={`Slide ${index + 1}`}
                            />
                        ))}
                    </div>
                    <div className="flex flex-col items-center opacity-60 mt-2">
                        <span className="text-[9px] tracking-[0.2em] text-gray-300 uppercase font-bold mb-0.5">Scroll</span>
                        <span className="text-[10px] text-gray-300 animate-bounce">∨</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
