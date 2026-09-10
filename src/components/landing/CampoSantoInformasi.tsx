"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    Play, 
    ShieldCheck, 
    MapPin, 
    Sparkles, 
    FileText, 
    CheckCircle2, 
    Globe, 
    ArrowRight,
    Award,
    Compass,
    Radio
} from 'lucide-react';

interface CampoSantoInformasiProps {
    siteData?: any;
    onBackToHero?: () => void;
}

export function CampoSantoInformasi({ siteData, onBackToHero }: CampoSantoInformasiProps) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parallax mouse move
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            setMousePos({
                x: (e.clientX - centerX) / (rect.width / 2),
                y: (e.clientY - centerY) / (rect.height / 2)
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div 
            ref={containerRef}
            className="w-full min-h-screen bg-[#1c0410] text-white font-sans selection:bg-amber-500 selection:text-slate-950 pb-16 overflow-x-hidden"
        >
            {/* ========================================================================= */}
            {/* 1. FIREWATCH STYLE PARALLAX HERO BANNER WITH CLIFF SILHOUETTE (SCREENSHOT 2) */}
            {/* ========================================================================= */}
            <div className="relative w-full h-[650px] sm:h-[750px] overflow-hidden bg-[#240614] flex flex-col justify-between items-center text-center">
                {/* Background Parallax Sky & Sunset Gradient */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/images/sawah.png"
                        alt="Sunset Scenery"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center filter saturate-[1.3] brightness-90 opacity-60"
                        style={{
                            transform: `translate3d(${mousePos.x * -10}px, ${mousePos.y * -6}px, 0)`
                        }}
                    />
                    {/* Firewatch Golden Sunset Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#ff8c00]/30 via-[#d9381e]/40 to-[#1c0410]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(251,146,60,0.5)_0%,rgba(28,4,16,0.95)_75%)]" />
                </div>

                {/* Firewatch Sun Gradient Circle */}
                <div 
                    className="absolute left-1/2 -translate-x-1/2 top-16 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-amber-400/40 rounded-full blur-3xl opacity-70 pointer-events-none z-[1]"
                    style={{
                        transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 8}px, 0)`
                    }}
                />

                {/* Cliff & Character Standing Silhouette (Firewatch Hero Iconography) */}
                <div 
                    className="absolute left-[8%] sm:left-[12%] bottom-0 w-48 sm:w-72 h-72 sm:h-96 pointer-events-none z-[3] transition-transform duration-200 ease-out"
                    style={{
                        transform: `translate3d(${mousePos.x * -24}px, ${mousePos.y * -12}px, 0)`
                    }}
                >
                    <svg viewBox="0 0 200 300" fill="#1c0410" className="w-full h-full drop-shadow-2xl">
                        {/* Rock Cliff */}
                        <path d="M0,300 L0,120 L40,80 L80,100 L110,60 L140,90 L180,300 Z" stroke="#1c0410" strokeWidth="2" />
                        {/* Hiker / Lookout Character standing on cliff edge looking out */}
                        <circle cx="105" cy="42" r="5" />
                        <path d="M105,47 L105,58 M98,50 L112,50 M102,58 L98,68 M108,58 L112,68" stroke="#1c0410" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                </div>

                {/* HERO TITLE & TEXT */}
                <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 sm:pt-36 space-y-4">
                    <span className="text-amber-400 font-bold text-xs sm:text-sm tracking-[0.35em] uppercase drop-shadow">
                        PORTAL INFORMASI PUBLIK
                    </span>

                    {/* Firewatch Style Header */}
                    <h1 
                        className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase select-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
                        style={{
                            fontFamily: "'Impact', 'Trebuchet MS', 'Arial Black', sans-serif",
                            textShadow: '0 4px 16px rgba(0,0,0,0.9), 0 0 50px rgba(245,158,11,0.4)'
                        }}
                    >
                        DESA CIMANGGU I
                    </h1>

                    <p className="text-amber-100/90 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                        Transparansi tata kelola pemerintahan desa, laporan kinerja pembangunan, pemetaan wilayah WebGIS, dan layanan publik terpadu.
                    </p>
                </div>

                {/* Banner Ribbon (Screenshot 3 Style) */}
                <div className="relative z-10 w-full max-w-4xl px-4 mb-8">
                    <div className="text-amber-300 font-black text-xs uppercase tracking-[0.3em] mb-4 drop-shadow">
                        LAYANAN TERSEDIA SEKARANG UNTUK MASYARAKAT
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-[11px] sm:text-xs py-3 px-4 uppercase tracking-wider rounded-sm shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-1 transition-transform cursor-pointer border border-amber-300">
                            <Globe size={15} />
                            <span>WEBGIS ENGINE</span>
                        </div>
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-[11px] sm:text-xs py-3 px-4 uppercase tracking-wider rounded-sm shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-1 transition-transform cursor-pointer border border-amber-300">
                            <ShieldCheck size={15} />
                            <span>E-ABSENSI REALTIME</span>
                        </div>
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-[11px] sm:text-xs py-3 px-4 uppercase tracking-wider rounded-sm shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-1 transition-transform cursor-pointer border border-amber-300">
                            <FileText size={15} />
                            <span>TRANSPARANSI APBDES</span>
                        </div>
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-[11px] sm:text-xs py-3 px-4 uppercase tracking-wider rounded-sm shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-1 transition-transform cursor-pointer border border-amber-300">
                            <Sparkles size={15} />
                            <span>KMS POSYANDU</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. VIDEO SHOWCASE & NARRATIVE STORY SECTION (SCREENSHOT 4) */}
            {/* ========================================================================= */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16">
                
                {/* Embed Video Showcase Frame */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-4 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.25)] bg-slate-950 group">
                    <Image
                        src="/images/slide_1.webp"
                        alt="Video Preview"
                        fill
                        className="object-cover filter saturate-[1.2] brightness-75 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {!isVideoPlaying ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-6 z-10">
                            <button
                                onClick={() => setIsVideoPlaying(true)}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 cursor-pointer border-2 border-white/50"
                            >
                                <Play size={32} className="ml-1 fill-current" />
                            </button>
                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide drop-shadow">
                                    Dokumentasi Digitalisasi Desa Cimanggu I
                                </h3>
                                <p className="text-amber-200/90 text-xs sm:text-sm font-medium">
                                    Tonton video profil pelayanan publik dan pemetaan wilayah terpadu.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            className="w-full h-full relative z-20"
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                            title="Video Profil Desa"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    )}
                </div>

                {/* Firewatch Warm Text Narrative Story Section */}
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <h2 
                        className="text-2xl sm:text-4xl font-extrabold text-amber-400 leading-tight uppercase"
                        style={{
                            fontFamily: "Georgia, serif",
                            textShadow: '0 2px 10px rgba(245,158,11,0.3)'
                        }}
                    >
                        Desa Cimanggu I adalah pelopor digitalisasi pemerintahan desa di Kecamatan Cibungbulang dengan tata kelola transparan dan inovasi WebGIS.
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-amber-100/80 text-xs sm:text-sm leading-relaxed font-serif pt-4 border-t border-amber-500/20">
                        <p>
                            Terletak di wilayah strategis Kecamatan Cibungbulang, Kabupaten Bogor, Desa Cimanggu I berkomitmen penuh untuk menghadirkan pelayanan publik modern yang cepat, mudah, dan dapat diakses oleh seluruh warga.
                        </p>
                        <p>
                            Melalui penerapan Sistem Digitalisasi Desa (SDD), data kependudukan, batas wilayah RT/RW, rencana anggaran biaya (RAB), dan pencatatan absensi aparatur dikelola secara terpusat demi efisiensi dan akuntabilitas.
                        </p>
                    </div>
                </div>

            </div>

            {/* ========================================================================= */}
            {/* 3. VISUAL GALLERY SECTION (SCREENSHOT 5 STYLE) */}
            {/* ========================================================================= */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
                <div className="text-center space-y-2">
                    <div className="text-amber-400 font-extrabold text-xs tracking-[0.3em] uppercase">
                        GALERI & VISUALISASI DIGITAL
                    </div>
                    <h2 
                        className="text-2xl sm:text-4xl font-black text-amber-300 uppercase tracking-tight"
                        style={{ fontFamily: "Georgia, serif" }}
                    >
                        &quot;SECARA VISUAL MEMUKAU DAN TRANSPARAN.&quot;
                    </h2>
                    <span className="text-amber-200/70 text-xs tracking-widest uppercase block">
                        PUSAT INFORMASI PUBLIK PEMDES CIMANGGU I
                    </span>
                </div>

                {/* 3 Gallery Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#2a091a] border border-amber-500/30 rounded-xl overflow-hidden shadow-xl group hover:border-amber-400 transition-all">
                        <div className="relative h-48 w-full overflow-hidden">
                            <Image
                                src="/images/sawah.png"
                                alt="Peta WebGIS"
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="p-5 space-y-2">
                            <h4 className="text-base font-bold text-amber-300 uppercase">PETA WEBGIS TERPADU</h4>
                            <p className="text-amber-100/70 text-xs leading-relaxed">
                                Pemetaan partisipatif batas wilayah RT/RW, batas dusun, dan lokasi keluarga penerima manfaat.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#2a091a] border border-amber-500/30 rounded-xl overflow-hidden shadow-xl group hover:border-amber-400 transition-all">
                        <div className="relative h-48 w-full overflow-hidden">
                            <Image
                                src="/images/slide_1.webp"
                                alt="E-Absensi Biometrik"
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="p-5 space-y-2">
                            <h4 className="text-base font-bold text-amber-300 uppercase">PRESENSI APARATUR</h4>
                            <p className="text-amber-100/70 text-xs leading-relaxed">
                                Sistem pencatatan kehadiran digital aparatur desa berbasis biometrik dan geofencing realtime.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#2a091a] border border-amber-500/30 rounded-xl overflow-hidden shadow-xl group hover:border-amber-400 transition-all">
                        <div className="relative h-48 w-full overflow-hidden">
                            <Image
                                src="/images/slide_6_.png"
                                alt="E-KMS Posyandu"
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="p-5 space-y-2">
                            <h4 className="text-base font-bold text-amber-300 uppercase">E-KMS & KESEHATAN</h4>
                            <p className="text-amber-100/70 text-xs leading-relaxed">
                                Modul pencatatan digital tumbuh kembang balita Posyandu Mawar 1 hingga 7 Desa Cimanggu I.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Ribbon Buttons (Screenshot 5 Style) */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
                    <a
                        href="#layanan"
                        className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs py-3 px-8 uppercase tracking-widest rounded-sm shadow-xl border border-amber-300 transition-all transform hover:scale-105"
                    >
                        DUKUNGAN TEKNIS & PENGADUAN
                    </a>
                    <a
                        href="#berita"
                        className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs py-3 px-8 uppercase tracking-widest rounded-sm shadow-xl border border-amber-300 transition-all transform hover:scale-105"
                    >
                        TRANSPARANSI DOKUMEN APBDES
                    </a>
                </div>
            </div>

            {/* Campo Santo Style Footer */}
            <div className="max-w-4xl mx-auto px-4 text-center pt-8 border-t border-amber-500/20 space-y-3">
                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400">
                    DESA CIMANGGU I • KECAMATAN CIBUNGBULANG • KABUPATEN BOGOR
                </div>
                <p className="text-[10px] text-amber-200/60 uppercase tracking-widest">
                    © 2026 PEMERINTAH DESA CIMANGGU I. DILINDUNGI UNDANG-UNDANG.
                </p>
            </div>
        </div>
    );
}
