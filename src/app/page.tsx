import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
import {
    getVillageStats,
    getLatestNews,
    getOrganizationalStructure,
    getVillageProfile,
    getLembagaList
} from '@/actions/landing';

// Import Modular Components
import { TechNightCanvas } from '../components/landing/TechNightCanvas';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingStats } from '../components/landing/LandingStats';
import { LandingNews } from '../components/landing/LandingNews';
import { LandingOrganization } from '../components/landing/LandingOrganization';
import { LandingAspiration } from '../components/landing/LandingAspiration';

export default async function LandingPage() {
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
        about_title: "Sekilas Pandang",
        about_text: "Desa Cimanggu I merupakan salah satu desa unggulan bagian dari program digitalisasi...",
        about_image: "https://images.unsplash.com/photo-1590088925586-7a8df0bbee59?q=80&w=1200&auto=format&fit=crop",
        gallery: ['/images/slide_1.webp', '/images/slide_6_.png', '/images/sawah.png']
    };

    // BACKGROUND HERO SECTION (CAROUSEL)
    const heroImages = (Array.isArray(siteData.gallery) && siteData.gallery.length > 0
        ? siteData.gallery
        : ['/images/slide_1.png', '/images/slide_6_.png', '/images/sawah.png']) as string[];

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
        <div className="bg-[#050914] min-h-screen text-white font-sans overflow-x-hidden relative">
            {/* Real-time Dynamic Ambient Canvas & Particle Night Background */}
            <TechNightCanvas />

            <LandingNavbar siteData={siteData} />
            <LandingHero siteData={siteData} heroImages={heroImages} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32">
                {/* Cyber Interactive Statistics Dashboard */}
                <LandingStats statsData={statsRes} />

                {/* Layanan Digital Section */}
                <section id="layanan" className="scroll-mt-32">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 text-purple-400 font-extrabold tracking-[0.25em] uppercase text-xs mb-3">
                                <Cpu size={16} />
                                <span>EKOSISTEM LAYANAN DIGITAL</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                                Layanan Terpadu Pemdes
                            </h2>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        <FeatureCard
                            icon={MapIcon}
                            title="Peta Wilayah Terpadu"
                            desc="Visualisasi data geografis batas wilayah (RW/RT/Dusun) dan pemetaan lokasi keluarga serta insfrastruktur desa berbasis WebGIS."
                            color="blue"
                            badge="WEBGIS ENGINE"
                        />
                        <FeatureCard
                            icon={HeartPulse}
                            title="E-KMS Posyandu"
                            desc="Sistem pencatatan digital tumbuh kembang balita berbasis wilayah Posyandu Mawar 1 hingga 7 untuk deteksi dini masalah kesehatan."
                            color="yellow"
                            badge="HEALTH NET"
                        />
                        <FeatureCard
                            icon={FileText}
                            title="E-Tupoksi & RAB"
                            desc="Modul khusus aparatur desa untuk manajemen Rencana Anggaran Biaya (RAB), DED, dan pendataan kemiskinan (UHC)."
                            color="purple"
                            badge="MANAGEMENT API"
                        />
                    </div>
                </section>

                {/* Profil Desa Section */}
                <section id="profil" className="scroll-mt-32">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 text-yellow-400 font-extrabold tracking-[0.25em] uppercase text-xs mb-3">
                                <Globe size={16} />
                                <span>IDENTITAS & PROFILE</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                                Profil {siteData.title}
                            </h2>
                        </div>

                        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col lg:flex-row gap-12 items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                            {/* Image Container with Cyber Overlay */}
                            <div className="w-full lg:w-2/5 aspect-video lg:aspect-square bg-slate-950 rounded-3xl overflow-hidden border border-cyan-500/30 relative group shadow-2xl">
                                <Image
                                    src={siteData.about_image || "https://images.unsplash.com/photo-1590088925586-7a8df0bbee59?q=80&w=1200&auto=format&fit=crop"}
                                    alt="Kantor Desa"
                                    fill
                                    className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-slate-950/80 backdrop-blur-md border-t border-white/10">
                                    <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs mb-1">
                                        <Sparkles size={14} /> PUSAT PELAYANAN UTAMA
                                    </div>
                                    <h4 className="text-2xl font-extrabold text-white">Kantor Kepala Desa</h4>
                                    <p className="text-slate-400 text-xs mt-1">Cibungbulang, Kabupaten Bogor</p>
                                </div>

                                {/* Animated Laser Line Scan */}
                                <div className="absolute inset-x-0 h-0.5 bg-cyan-400 opacity-60 animate-laser-scan pointer-events-none"></div>
                            </div>

                            {/* Profile Details */}
                            <div className="w-full lg:w-3/5 text-slate-300 space-y-6">
                                <h3 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                                    {siteData.about_title}
                                </h3>
                                <p className="leading-relaxed text-slate-300 text-base md:text-lg font-light whitespace-pre-wrap border-l-2 border-cyan-500/40 pl-4 py-1">
                                    {siteData.about_text}
                                </p>

                                <div className="pt-4 flex items-center gap-6">
                                    <Link 
                                        href="/profil" 
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                                    >
                                        <span>Baca Profil Selengkapnya</span>
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </section>

                {/* Peta Interaktif WebGIS Radar Section */}
                <section id="peta-interaktif" className="scroll-mt-32">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 text-cyan-400 font-extrabold tracking-[0.25em] uppercase text-xs mb-3">
                                <Compass size={16} />
                                <span>GEOSPATIAL COMMAND RADAR</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                                Peta Interaktif WebGIS
                            </h2>
                        </div>

                        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col md:flex-row min-h-[520px] relative backdrop-blur-2xl">
                            {/* Left Control Panel */}
                            <div className="w-full md:w-1/3 bg-slate-950/90 p-6 md:p-8 border-r border-white/10 flex flex-col justify-between gap-6 z-10">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                        <span className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                                            <Radio size={16} className="animate-pulse" /> WILAYAH DUSUN
                                        </span>
                                        <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                                            LAT: -6.5892°
                                        </span>
                                    </div>

                                    {/* Live Cyber Search */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Cari wilayah RW / RT / Dusun..."
                                            className="w-full bg-slate-900 border border-cyan-500/30 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                                        />
                                        <Search className="absolute left-4 top-4 text-cyan-400" size={18} />
                                    </div>

                                    <div className="space-y-3 custom-scrollbar max-h-[220px] overflow-y-auto pr-1">
                                        <MapCategory title="Dusun 1" desc="Mencakup RW 01, RW 02 • Pusat Pemerintahan Desa" active />
                                        <MapCategory title="Dusun 2" desc="Mencakup RW 03, RW 04 • Wilayah Pertanian & Pemukiman" />
                                        <MapCategory title="Dusun 3" desc="Mencakup RW 05, RW 06 • Kawasan UMKM Produktif" />
                                        <MapCategory title="Dusun 4" desc="Mencakup RW 07, RW 08, RW 09 • Zona Posyandu & Lembaga" />
                                    </div>
                                </div>

                                <Link
                                    href="/dashboard/maps"
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl text-center transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
                                >
                                    <span>Buka WebGIS Layar Penuh</span>
                                    <ChevronRight size={16} />
                                </Link>
                            </div>

                            {/* Right Map Visual with Rotating Radar Sweep */}
                            <div className="w-full md:w-2/3 bg-slate-950 relative group overflow-hidden flex items-center justify-center min-h-[350px]">
                                <Image
                                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop"
                                    alt="Map Background"
                                    fill
                                    className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000 mix-blend-luminosity"
                                />

                                {/* Radar Line Sweep Animation */}
                                <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-500/20 animate-radar-sweep pointer-events-none flex items-center justify-center">
                                    <div className="w-full h-0.5 bg-gradient-to-r from-cyan-400 via-transparent to-transparent"></div>
                                </div>

                                {/* Concentric Radar Rings */}
                                <div className="absolute w-72 h-72 rounded-full border border-cyan-500/20 pointer-events-none"></div>
                                <div className="absolute w-40 h-40 rounded-full border border-cyan-500/30 pointer-events-none"></div>
                                <div className="absolute w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)] animate-ping pointer-events-none"></div>

                                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-transparent to-slate-950/60 pointer-events-none"></div>

                                <div className="absolute bottom-6 right-6 bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 px-4 py-2 rounded-xl text-[11px] font-mono text-cyan-300 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    WEBGIS RADAR: ONLINE
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </section>

                <LandingNews newsData={newsData} />
                <LandingOrganization orgData={orgData} />

                {/* Lembaga Kemasyarakatan Section */}
                <section id="lembaga" className="scroll-mt-32">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 text-blue-400 font-extrabold tracking-[0.25em] uppercase text-xs mb-3">
                                <ShieldCheck size={16} />
                                <span>MITRA & EKOSISTEM DESA</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                                Lembaga Kemasyarakatan
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                            {lembagaRes?.map((lembaga: any) => (
                                <div 
                                    key={lembaga.id} 
                                    className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all duration-300 group hover:-translate-y-2 shadow-xl hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]"
                                >
                                    <div className="w-16 h-16 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                        <ShieldCheck size={32} className="text-cyan-400" />
                                    </div>
                                    <span className="text-xs font-extrabold text-white uppercase tracking-wider leading-tight block">
                                        {lembaga.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </section>

                <LandingAspiration />

                {/* Footer Section */}
                <footer className="pt-20 border-t border-cyan-500/20 text-slate-400">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <Image src={siteData.logo || "/images/logo-bogor.png"} alt="Logo" width={42} height={42} className="drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]" />
                                <span className="text-2xl font-black text-white tracking-wider uppercase">{siteData.title}</span>
                            </div>
                            <p className="max-w-md text-sm leading-relaxed text-slate-400">
                                Pusat digitalisasi layanan dan informasi Sistem Digitalisasi Desa (SDD) Pemerintah Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor.
                            </p>
                            <div className="flex items-center gap-3 pt-2">
                                <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                                    SDD CYBERNET v2.4 SERVER ONLINE
                                </span>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-extrabold mb-6 uppercase tracking-widest text-xs border-b border-white/10 pb-2">Tautan Cepat</h4>
                            <ul className="space-y-3.5 text-sm font-medium">
                                <li><a href="#beranda" className="hover:text-yellow-400 transition-colors">Beranda Utama</a></li>
                                <li><a href="#profil" className="hover:text-yellow-400 transition-colors">Profil Desa</a></li>
                                <li><a href="#statistik" className="hover:text-yellow-400 transition-colors">Statistik Penduduk</a></li>
                                <li><a href="#berita" className="hover:text-yellow-400 transition-colors">Kabar Desa</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-extrabold mb-6 uppercase tracking-widest text-xs border-b border-white/10 pb-2">Kontak Layanan</h4>
                            <ul className="space-y-3.5 text-sm font-medium">
                                <li>Jl. Raya Cibungbulang No. 1, Bogor</li>
                                <li>Email: info@cimanggu1.desa.id</li>
                                <li>Telp: (0251) 1234567</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8 border-t border-white/5 text-[11px] uppercase font-bold tracking-[0.25em]">
                        <span>© 2026 PEMDES CIMANGGU I. ALL RIGHTS RESERVED.</span>
                        <span className="text-cyan-400">POWERED BY SYSTEM DIGITALISASI DESA (SDD)</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, color, badge }: any) {
    const colorStyles: any = {
        blue: "border-cyan-500/30 text-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.2)]",
        yellow: "border-yellow-500/30 text-yellow-400 bg-yellow-500/15 shadow-[0_0_20px_rgba(250,204,21,0.2)]",
        purple: "border-purple-500/30 text-purple-400 bg-purple-500/15 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
    };

    return (
        <div className="group bg-slate-900/60 backdrop-blur-2xl border border-white/10 hover:border-cyan-400/50 transition-all duration-500 rounded-3xl p-8 flex flex-col justify-between transform hover:-translate-y-3 shadow-xl hover:shadow-[0_0_35px_rgba(6,182,212,0.25)] relative overflow-hidden h-full">
            {/* Top Laser Border Sweep */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div>
                <div className="flex items-center justify-between mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border ${colorStyles[color]}`}>
                        <Icon size={34} />
                    </div>
                    {badge && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                            {badge}
                        </span>
                    )}
                </div>

                <h4 className="text-2xl font-extrabold text-white mb-4 group-hover:text-yellow-400 transition-colors">
                    {title}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                    {desc}
                </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                <span>AKTIF & TERINTEGRASI</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
        </div>
    );
}

function MapCategory({ title, desc, active = false }: any) {
    return (
        <div className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            active 
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800 hover:border-white/15'
        }`}>
            <div className="flex justify-between items-center mb-1">
                <h5 className="font-extrabold text-sm">{title}</h5>
                {active && <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)]"></span>}
            </div>
            <p className="text-slate-400 text-xs font-light">{desc}</p>
        </div>
    );
}
