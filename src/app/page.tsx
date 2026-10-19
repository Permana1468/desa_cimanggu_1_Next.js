import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import {
    FileText,
    Map as MapIcon,
    HeartPulse,
    ShieldCheck,
    Search,
    ChevronRight,
    Sparkles,
    Globe,
    Cpu,
    Compass,
    Radio
} from 'lucide-react';

import ScrollReveal from '../components/ScrollReveal';
import SmoothScroll from '../components/providers/SmoothScroll';
import {
    getVillageStats,
    getLatestNews,
    getOrganizationalStructure,
    getVillageProfile,
    getLembagaList
} from '@/actions/landing';

// Import Modular Components
import { MobileWebGIS } from '../components/landing/MobileWebGIS';
import { LandingThemeProvider } from '../components/landing/LandingThemeProvider';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { MobileBottomNav } from '../components/landing/MobileBottomNav';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingStats } from '../components/landing/LandingStats';
import { LandingNews } from '../components/landing/LandingNews';
import { LandingOrganization } from '../components/landing/LandingOrganization';
import { LandingAspiration } from '../components/landing/LandingAspiration';
import { LandingSectionsWrapper } from '../components/landing/LandingSectionsWrapper';
import { DesktopParallaxLanding } from '../components/landing/DesktopParallaxLanding';
import { LandingModeHandler } from '../components/landing/LandingModeHandler';


export default async function LandingPage() {
    // Read Initial Theme Cookie (Server-Side)
    const cookieStore = await cookies();
    const initialIsNightMode = cookieStore.get('landingThemeMode')?.value === 'night';
    const initialIsDualMode = cookieStore.get('landingDualMode')?.value === 'true';

    // FETCH DATA ON SERVER
    const [statsRes, newsRes, profileRes, aparaturRes, lembagaRes] = await Promise.all([
        getVillageStats(),
        getLatestNews(),
        getVillageProfile(),
        getOrganizationalStructure(),
        getLembagaList()
    ]);

    // Data Mapping
    const siteData = profileRes || {
        title: "Desa Cimanggu I",
        hero_title: "Pemerintah Desa",
        hero_subtitle: "Platform digital terpadu untuk mengelola, memonitor, dan menganalisis data pemberdayaan masyarakat.",
        logo: "/images/logo-bogor.png",
        hero_video: "",
        about_title: "Sekilas Pandang",
        about_text: "Desa Cimanggu I merupakan salah satu desa unggulan bagian dari program digitalisasi...",
        about_image: "/images/sawah.png",
        gallery: ['/images/slide_1.webp', '/images/slide_6_.png', '/images/sawah.png']
    };

    // BACKGROUND HERO SECTION (CAROUSEL)
    const heroImages = (Array.isArray(siteData.gallery) && siteData.gallery.length > 0
        ? siteData.gallery.map((item: any) => typeof item === 'string' ? item : (item.url || item.img || '/images/slide_1.webp'))
        : ['/images/slide_1.webp', '/images/slide_6_.png', '/images/sawah.png']) as string[];

    const newsData = newsRes ? newsRes.map((item: any) => ({
        id: item.id,
        title: item.judul,
        date: new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        image: item.gambar || "https://images.unsplash.com/photo-1593113544338-9cb52bce56bc?q=80&w=800&auto=format&fit=crop"
    })) : [];

    const mapPejabat = (obj: any) => ({
        name: obj.name,
        role: obj.position,
        foto: obj.photo
    });

    const orgData = {
        kades: aparaturRes?.find((x: any) => x.level === 0) ? mapPejabat(aparaturRes.find((x: any) => x.level === 0)) : { name: "Hernawan M. Sodik", role: "Kepala Desa" },
        sekdes: aparaturRes?.find((x: any) => x.level === 1) ? mapPejabat(aparaturRes.find((x: any) => x.level === 1)) : { name: "Fajar Tri Apriana", role: "Sekretaris Desa" },
        staff: aparaturRes?.filter((x: any) => x.level === 2).map(mapPejabat) || [],
        kadus: aparaturRes?.filter((x: any) => x.level === 3).map(mapPejabat) || []
    };

    return (
        <LandingThemeProvider initialIsNightMode={initialIsNightMode} initialIsDualMode={initialIsDualMode}>
            <SmoothScroll>
                <LandingModeHandler siteData={siteData}>
                {/* Desktop View: Fullscreen Modern Parallax Smooth Scroll Landing Page */}
                <div className="hidden md:block">
                    <DesktopParallaxLanding 
                        siteData={siteData} 
                        statsRes={statsRes} 
                        newsData={newsData} 
                        orgData={orgData} 
                        lembagaRes={lembagaRes} 
                    />
                </div>

                {/* Mobile View: Exclusively Redesigned to Harmonize with Desktop */}
                <div className="block md:hidden relative w-full bg-slate-950 text-white selection:bg-amber-400 selection:text-black font-sans overflow-x-hidden min-h-screen">
                    <LandingNavbar siteData={siteData} />
                    <MobileBottomNav />
                    
                    {/* SECTION 1: HERO */}
                    <LandingHero siteData={siteData} heroImages={heroImages} />

                    <LandingSectionsWrapper>
                        {/* SECTION 2: ABOUT US / SEKILAS PANDANG */}
                        <section id="profil" className="relative w-full py-16 px-4 sm:px-6 bg-gradient-to-b from-purple-950 via-slate-950 to-slate-950 scroll-mt-20">
                            <ScrollReveal>
                                <div className="max-w-2xl mx-auto space-y-8">
                                    {/* Section Header: "About us" */}
                                    <div className="text-center space-y-2">
                                        <h2 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight drop-shadow-[0_4px_25px_rgba(245,158,11,0.5)] font-serif italic">
                                            About us
                                        </h2>
                                        <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto opacity-70" />
                                    </div>

                                    <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col gap-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                                        {/* Profile Image Container */}
                                        <div className="w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-amber-400/30 relative group shadow-2xl">
                                            <Image
                                                src={siteData.about_image || "/images/sawah.png"}
                                                alt="Kantor Desa"
                                                fill
                                                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                                            <div className="absolute inset-x-0 bottom-0 p-3.5 bg-slate-950/85 backdrop-blur-md border-t border-white/10">
                                                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">
                                                    <Sparkles size={13} /> KANTOR KEPALA DESA CIMANGGU I
                                                </div>
                                                <p className="text-slate-300 text-[11px]">Pusat Integrasi Data & Pelayanan Warga Berbasis WebGIS Digital.</p>
                                            </div>

                                            <div className="absolute inset-x-0 h-0.5 bg-cyan-400 opacity-60 animate-laser-scan pointer-events-none"></div>
                                        </div>

                                        {/* Profile Details */}
                                        <div className="w-full text-slate-300 space-y-4">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/50 border border-purple-400/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                                                <Globe size={13} /> IDENTITAS RESMI DESA
                                            </div>

                                            <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                                                {siteData.about_title || "Sekilas Pandang Pemdes Cimanggu I"}
                                            </h3>

                                            <p className="leading-relaxed text-slate-300 text-xs sm:text-sm font-light border-l-2 border-amber-400 pl-3.5 py-1">
                                                {siteData.about_text || "Desa Cimanggu I merupakan salah satu desa unggulan di Kecamatan Cibungbulang, Kabupaten Bogor. Berkomitmen menghadirkan tata kelola pemerintahan yang transparan, efisien, dan modern melalui pemanfaatan Sistem Digitalisasi Desa (SDD) terpadu."}
                                            </p>

                                            {/* Quick Highlight Stats Counters */}
                                            <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/10">
                                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                                                    <span className="block text-xl font-black text-amber-400">4</span>
                                                    <span className="text-[9px] font-extrabold text-slate-300 uppercase block">Wilayah Dusun</span>
                                                </div>
                                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                                                    <span className="block text-xl font-black text-cyan-400">9</span>
                                                    <span className="text-[9px] font-extrabold text-slate-300 uppercase block">Kawasan RW</span>
                                                </div>
                                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                                                    <span className="block text-xl font-black text-emerald-400">100%</span>
                                                    <span className="text-[9px] font-extrabold text-slate-300 uppercase block">Digital SDD</span>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <Link 
                                                    href="/profil" 
                                                    className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                                                >
                                                    <span>Baca Profil Selengkapnya</span>
                                                    <ChevronRight size={15} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </section>

                        {/* SECTION 3: FITUR & LAYANAN UTAMA */}
                        <section id="layanan" className="relative w-full py-16 px-4 sm:px-6 bg-slate-950 border-t border-white/10 scroll-mt-20">
                            <ScrollReveal>
                                <div className="max-w-2xl mx-auto">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest mb-3">
                                            <Cpu size={14} />
                                            <span>EKOSISTEM INTERAKTIF DESA</span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                            Fitur & Layanan Utama
                                        </h2>
                                        <p className="text-slate-400 text-xs sm:text-sm font-light mt-2 max-w-xl mx-auto">
                                            Platform terintegrasi yang menghubungkan administrasi warga, WebGIS pemetaan wilayah, pemantauan kesehatan Posyandu, hingga akuntabilitas anggaran APBDes.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Pillar 1: E-Surat & UHC */}
                                        <FeatureCard
                                            icon={FileText}
                                            title="E-Surat Mandiri & UHC"
                                            desc="Pengajuan Surat Keterangan Desa (SKKM, SPTJM, Usulan UHC BPJS) secara online dengan pelacakan status berkas real-time."
                                            color="amber"
                                            badge="PELAYANAN WARGA"
                                            link="/login"
                                            linkText="Buka Portal Surat"
                                        />

                                        {/* Pillar 2: WebGIS Batas Wilayah */}
                                        <FeatureCard
                                            icon={Compass}
                                            title="WebGIS Batas Wilayah"
                                            desc="Peta spasial interaktif Dusun 1-4, kawasan RW/RT, fasilitas umum, infrastruktur desa, serta pemetaan lokasi keluarga."
                                            color="blue"
                                            badge="PEMETAAN REGIONAL"
                                            link="#peta-interaktif"
                                            linkText="Jelajahi WebGIS"
                                        />

                                        {/* Pillar 3: E-KMS Posyandu */}
                                        <FeatureCard
                                            icon={HeartPulse}
                                            title="E-KMS Posyandu Mawar"
                                            desc="Pencatatan digital tumbuh kembang balita dan lansia Posyandu Mawar 1 hingga 7 untuk deteksi dini pencegahan stunting."
                                            color="green"
                                            badge="HEALTH MONITORS"
                                            link="/login"
                                            linkText="Lihat KMS Digital"
                                        />

                                        {/* Pillar 4: E-Tupoksi & RAB */}
                                        <FeatureCard
                                            icon={Cpu}
                                            title="E-Tupoksi & RAB Desa"
                                            desc="Modul khusus aparatur untuk penyusunan Rencana Anggaran Biaya (RAB), DED pembangunan, dan akuntabilitas laporan dana."
                                            color="purple"
                                            badge="MANAJEMEN PEMDES"
                                            link="/login"
                                            linkText="Akses Dashboard"
                                        />
                                    </div>
                                </div>
                            </ScrollReveal>
                        </section>

                        {/* SECTION 4: GEOSPATIAL COMMAND RADAR (PETA INTERAKTIF WEBGIS) */}
                        <section id="peta-interaktif" className="relative w-full py-16 px-4 sm:px-6 bg-slate-950 border-t border-white/10 scroll-mt-20">
                            <ScrollReveal>
                                <div className="max-w-2xl mx-auto">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center gap-2 text-cyan-400 font-extrabold tracking-[0.2em] uppercase text-[10px] mb-2">
                                            <Radio size={15} className="animate-pulse" />
                                            <span>GEOSPATIAL COMMAND RADAR</span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                            Peta Interaktif WebGIS
                                        </h2>
                                    </div>

                                    <div className="bg-slate-900/80 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col min-h-[480px] relative backdrop-blur-2xl">
                                        {/* Control Panel */}
                                        <div className="w-full bg-slate-950/90 p-5 border-b border-white/10 flex flex-col justify-between gap-4 z-10">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                                                        <Radio size={14} className="animate-pulse" /> PILIH DUSUN & WILAYAH
                                                    </span>
                                                    <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                                                        LAT: -6.5892°
                                                    </span>
                                                </div>

                                                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                                                    <MapCategory title="Dusun 1" desc="Mencakup RW 001, RW 002 • Pusat Pemerintahan Desa" active />
                                                    <MapCategory title="Dusun 2" desc="Mencakup RW 003, RW 008 • Pertanian & Pemukiman" />
                                                    <MapCategory title="Dusun 3" desc="Mencakup RW 005, RW 006, RW 007 • Kawasan UMKM" />
                                                    <MapCategory title="Dusun 4" desc="Mencakup RW 004, RW 009 • Posyandu & Lembaga" />
                                                </div>
                                            </div>

                                            <Link
                                                href="/dashboard/maps"
                                                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl text-center transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2"
                                            >
                                                <span>Buka WebGIS Layar Penuh</span>
                                                <ChevronRight size={15} />
                                            </Link>
                                        </div>

                                        {/* Interactive Map Visual with WebGIS + Rotating Radar Sweep */}
                                        <div className="w-full bg-slate-950 relative group overflow-hidden flex items-center justify-center min-h-[300px]">
                                            <MobileWebGIS containerId="landing-webgis-map-mobile" />

                                            {/* Radar Line Sweep Animation */}
                                            <div className="absolute w-[360px] h-[360px] rounded-full border border-cyan-500/20 animate-radar-sweep pointer-events-none flex items-center justify-center z-10">
                                                <div className="w-full h-0.5 bg-gradient-to-r from-cyan-400 via-transparent to-transparent"></div>
                                            </div>

                                            {/* Concentric Radar Rings */}
                                            <div className="absolute w-48 h-48 rounded-full border border-cyan-500/20 pointer-events-none z-10"></div>
                                            <div className="absolute w-28 h-28 rounded-full border border-cyan-500/30 pointer-events-none z-10"></div>
                                            <div className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)] animate-ping pointer-events-none z-10"></div>

                                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-transparent to-slate-950/60 pointer-events-none z-10"></div>

                                            <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-lg text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 z-20">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
                                                RADAR ONLINE
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </section>

                        {/* SECTION 5: DEMOGRAFI & TELEMETRI STATISTIK */}
                        <section id="statistik" className="relative w-full py-16 px-4 sm:px-6 bg-slate-950 border-t border-white/10 scroll-mt-20">
                            <LandingStats statsData={statsRes} />
                        </section>

                        {/* SECTION 6: KABAR DESA, STRUKTUR ORGANISASI & LEMBAGA KEMASYARAKATAN */}
                        <section id="organisasi" className="relative w-full py-16 px-4 sm:px-6 bg-slate-950 border-t border-white/10 scroll-mt-20">
                            <div className="max-w-2xl mx-auto space-y-16">
                                <LandingNews newsData={newsData} />
                                
                                <div className="pt-12 border-t border-white/10">
                                    <LandingOrganization orgData={orgData} />
                                </div>

                                {/* Lembaga Kemasyarakatan Section */}
                                <div id="lembaga" className="pt-12 border-t border-white/10 scroll-mt-20">
                                    <ScrollReveal>
                                        <div className="text-center mb-8">
                                            <div className="inline-flex items-center gap-2 text-cyan-400 font-extrabold tracking-[0.2em] uppercase text-[10px] mb-2">
                                                <ShieldCheck size={16} />
                                                <span>MITRA KERJA PEMDES</span>
                                            </div>
                                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                                Lembaga Kemasyarakatan Desa
                                            </h2>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {lembagaRes?.map((lembaga: any) => (
                                                <div 
                                                    key={lembaga.id} 
                                                    className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center hover:border-amber-400/50 transition-all duration-300 group flex flex-col items-center justify-center shadow-lg"
                                                >
                                                    <div className="w-12 h-12 bg-amber-500/10 border border-amber-400/30 rounded-xl flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(245,158,11,0.2)] shrink-0">
                                                        <ShieldCheck size={24} className="text-amber-400" />
                                                    </div>
                                                    <span className="text-[11px] font-extrabold text-white uppercase tracking-wider leading-tight block">
                                                        {lembaga.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollReveal>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 7: ASPIRASI WARGA & MODERN FOOTER */}
                        <section id="aspirasi" className="relative w-full py-16 px-4 sm:px-6 bg-slate-950 border-t border-white/10 scroll-mt-20">
                            <div className="max-w-2xl mx-auto space-y-16">
                                <LandingAspiration />

                                {/* Mobile Footer Section */}
                                <footer className="pt-10 border-t border-white/15 text-slate-400">
                                    <div className="grid grid-cols-1 gap-8 mb-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Image src={siteData.logo || "/images/logo-bogor.png"} alt="Logo" width={36} height={36} className="drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]" />
                                                <span className="text-lg font-black text-white tracking-wider uppercase">{siteData.title}</span>
                                            </div>
                                            <p className="text-xs leading-relaxed text-slate-400">
                                                Pusat digitalisasi layanan dan informasi terpadu Sistem Digitalisasi Desa (SDD) Pemerintah Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor.
                                            </p>
                                            <div className="flex items-center gap-2 pt-1">
                                                <span className="flex h-2 w-2 relative shrink-0">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                                                    SDD CYBERNET v2.4 SERVER ONLINE
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                                            <div>
                                                <h4 className="text-white font-extrabold mb-3 uppercase tracking-widest text-[10px] border-b border-white/10 pb-1.5">Tautan Cepat</h4>
                                                <ul className="space-y-2 text-xs font-medium">
                                                    <li><a href="#beranda" className="hover:text-amber-400 transition-colors">Beranda Utama</a></li>
                                                    <li><a href="#profil" className="hover:text-amber-400 transition-colors">Profil Desa</a></li>
                                                    <li><a href="#layanan" className="hover:text-amber-400 transition-colors">Layanan Digital</a></li>
                                                    <li><a href="#peta-interaktif" className="hover:text-amber-400 transition-colors">WebGIS Wilayah</a></li>
                                                    <li><a href="#statistik" className="hover:text-amber-400 transition-colors">Statistik Penduduk</a></li>
                                                    <li><a href="#berita" className="hover:text-amber-400 transition-colors">Kabar Desa</a></li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="text-white font-extrabold mb-3 uppercase tracking-widest text-[10px] border-b border-white/10 pb-1.5">Kontak Layanan</h4>
                                                <ul className="space-y-2 text-xs font-medium">
                                                    <li>Jl. Raya Cibungbulang No. 1, Bogor</li>
                                                    <li>info@cimanggu1.desa.id</li>
                                                    <li>(0251) 1234567</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-center gap-2 py-6 border-t border-white/5 text-[9px] uppercase font-bold tracking-widest text-center">
                                        <span>© 2026 PEMDES CIMANGGU I. ALL RIGHTS RESERVED.</span>
                                        <span className="text-amber-400">POWERED BY SYSTEM DIGITALISASI DESA (SDD)</span>
                                    </div>
                                </footer>
                            </div>
                        </section>
                    </LandingSectionsWrapper>
                </div>
                </LandingModeHandler>
            </SmoothScroll>
        </LandingThemeProvider>
    );
}

function FeatureCard({ icon: Icon, title, desc, color, badge, link = "/login", linkText = "Lihat Selengkapnya" }: any) {
    const colorStyles: any = {
        amber: "border-amber-400/40 text-amber-400 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
        blue: "border-cyan-400/40 text-cyan-400 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.2)]",
        green: "border-emerald-400/40 text-emerald-400 bg-emerald-500/15 shadow-[0_0_15px_rgba(52,211,153,0.2)]",
        purple: "border-purple-400/40 text-purple-400 bg-purple-500/15 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
    };

    const textColorStyles: any = {
        amber: "text-amber-400",
        blue: "text-cyan-400",
        green: "text-emerald-400",
        purple: "text-purple-400"
    };

    return (
        <div className="group bg-slate-900/60 backdrop-blur-2xl border border-white/15 hover:border-amber-400/50 hover:bg-slate-800/80 transition-all duration-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transform hover:-translate-y-2 shadow-2xl relative overflow-hidden h-full">
            {/* Top Laser Border Sweep */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border ${colorStyles[color] || colorStyles.amber}`}>
                        <Icon size={26} />
                    </div>
                    {badge && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                            {badge}
                        </span>
                    )}
                </div>

                <h4 className="text-lg sm:text-xl font-extrabold text-white mb-2.5 group-hover:text-amber-400 transition-colors">
                    {title}
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                    {desc}
                </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                {link.startsWith('#') ? (
                    <a href={link} className={`flex items-center gap-1.5 hover:underline ${textColorStyles[color] || 'text-cyan-400'}`}>
                        <span>{linkText}</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                ) : (
                    <Link href={link} className={`flex items-center gap-1.5 hover:underline ${textColorStyles[color] || 'text-cyan-400'}`}>
                        <span>{linkText}</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>
        </div>
    );
}

function MapCategory({ title, desc, active = false }: any) {
    return (
        <div className={`p-3 rounded-xl cursor-pointer transition-all border ${
            active 
                ? 'bg-cyan-950/50 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                : 'bg-slate-950/40 border-white/10 text-slate-300 hover:bg-slate-900/60 hover:border-white/20'
        }`}>
            <div className="flex justify-between items-center mb-0.5">
                <h5 className="font-extrabold text-xs">{title}</h5>
                {active && <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)]"></span>}
            </div>
            <p className="text-slate-400 text-[10px] font-light">{desc}</p>
        </div>
    );
}
