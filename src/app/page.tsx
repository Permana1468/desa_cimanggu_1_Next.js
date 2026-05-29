import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    FileText, 
    Map as MapIcon, 
    HeartPulse, 
    ShieldCheck, 
    Users, 
    Search, 
    ChevronRight, 
    Calendar, 
    Clock 
} from 'lucide-react';

import ScrollReveal from '../components/ScrollReveal';
import {
    getVillageStats,
    getLatestNews,
    getOrganizationalStructure,
    getVillageProfile,
    getLembagaList
} from '@/actions/landing';

// Import New Modular Components
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingStats } from '../components/landing/LandingStats';
import { LandingNews } from '../components/landing/LandingNews';
import { LandingOrganization } from '../components/landing/LandingOrganization';
import { LandingAspiration } from '../components/landing/LandingAspiration';

export const unstable_instant = false;

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

    const heroImages = (Array.isArray(siteData.gallery) && siteData.gallery.length > 0 
        ? siteData.gallery 
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
        <div className="bg-[#0b1120] min-h-screen text-white font-sans overflow-x-hidden relative">
            <LandingNavbar siteData={siteData} />
            <LandingHero siteData={siteData} heroImages={heroImages} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32">
                <LandingStats statsData={statsRes} />

                {/* Layanan Section */}
                <section id="layanan" className="scroll-mt-32">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <h3 className="text-purple-400 font-bold tracking-widest uppercase text-sm mb-3">Sistem Informasi</h3>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Layanan Digital Pemdes</h2>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        <FeatureCard icon={MapIcon} title="Peta Wilayah Terpadu" desc="Visualisasi data geografis batas wilayah (RW/RT/Dusun) dan pemetaan lokasi keluarga serta insfrastruktur desa berbasis WebGIS." color="blue" />
                        <FeatureCard icon={HeartPulse} title="E-KMS Posyandu" desc="Sistem pencatatan digital tumbuh kembang balita berbasis wilayah Posyandu Mawar 1 hingga 7 untuk deteksi dini masalah kesehatan." color="yellow" />
                        <FeatureCard icon={FileText} title="E-Tupoksi & RAB" desc="Modul khusus aparatur desa untuk manajemen Rencana Anggaran Biaya (RAB), DED, dan pendataan kemiskinan (UHC)." color="purple" />
                    </div>
                </section>

                {/* Profil Section */}
                <section id="profil" className="scroll-mt-32">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <h3 className="text-yellow-400 font-bold tracking-widest uppercase text-sm mb-3">Tentang Desa</h3>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Profil {siteData.title}</h2>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col lg:flex-row gap-12 items-center">
                            <div className="w-full lg:w-2/5 aspect-video lg:aspect-square bg-slate-900/40 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 relative group border-2 border-white/5">
                                <Image
                                    src={siteData.about_image || "https://images.unsplash.com/photo-1590088925586-7a8df0bbee59?q=80&w=1200&auto=format&fit=crop"}
                                    alt="Kantor Desa"
                                    fill
                                    className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent mix-blend-multiply"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h4 className="text-2xl font-bold text-white mb-1 shadow-black drop-shadow-lg">Kantor Kepala Desa</h4>
                                    <p className="text-slate-300 text-sm drop-shadow-md">Pusat Pelayanan Masyarakat</p>
                                </div>
                            </div>
                            <div className="w-full lg:w-3/5 text-slate-300 space-y-8">
                                <h4 className="text-3xl font-bold text-white text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                    {siteData.about_title}
                                </h4>
                                <p className="leading-relaxed text-lg font-light text-slate-400 whitespace-pre-wrap">
                                    {siteData.about_text}
                                </p>
                                <Link href="/profil" className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                                    Baca Selengkapnya <ChevronRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </ScrollReveal>
                </section>

                {/* Peta Interaktif Section */}
                <section id="peta-interaktif" className="scroll-mt-32">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <h3 className="text-green-400 font-bold tracking-widest uppercase text-sm mb-3">Sistem Informasi Geografis</h3>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Peta Interaktif Desa</h2>
                        </div>

                        <div className="bg-slate-800/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">
                            <div className="w-full md:w-1/3 bg-slate-900/80 p-6 border-r border-white/10 flex flex-col gap-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari wilayah/Dusun..."
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                    <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                                </div>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    <MapCategory title="Dusun 1" desc="Mencakup RW 01, RW 02. Pusat pemerintahan." active />
                                    <MapCategory title="Dusun 2" desc="Mencakup RW 03, RW 04." />
                                    <MapCategory title="Dusun 3" desc="Mencakup RW 05, RW 06." />
                                    <MapCategory title="Dusun 4" desc="Mencakup RW 07, RW 08, RW 09." />
                                </div>
                                <Link href="/dashboard/maps" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-center transition-colors">
                                    Buka Peta Layar Penuh
                                </Link>
                            </div>
                            <div className="w-full md:w-2/3 bg-slate-800 relative group overflow-hidden">
                                <Image
                                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop"
                                    alt="Map Background"
                                    fill
                                    className="object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-transparent to-slate-900/50"></div>
                            </div>
                        </div>
                    </ScrollReveal>
                </section>

                <LandingNews newsData={newsData} />
                <LandingOrganization orgData={orgData} />

                {/* Lembaga Section */}
                <section id="lembaga" className="scroll-mt-32">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <h3 className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-3">Ekosistem Desa</h3>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Lembaga Kemasyarakatan</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                            {lembagaRes?.map((lembaga: any) => (
                                <div key={lembaga.id} className="bg-slate-800/40 border border-white/10 rounded-2xl p-6 text-center hover:bg-slate-700/60 transition-all group hover:-translate-y-2">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={32} className="text-blue-400" />
                                    </div>
                                    <span className="text-sm font-bold text-white uppercase tracking-wider">{lembaga.name}</span>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </section>

                <LandingAspiration />

                {/* Footer Section */}
                <footer className="pt-20 border-t border-white/10 text-slate-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <Image src={siteData.logo || "/images/logo-bogor.png"} alt="Logo" width={40} height={40} />
                                <span className="text-xl font-black text-white tracking-widest">{siteData.title}</span>
                            </div>
                            <p className="max-w-md text-sm leading-relaxed mb-8">Pusat digitalisasi layanan dan informasi Pemerintah Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor.</p>
                            <div className="flex gap-4">
                                <SocialIcon />
                                <SocialIcon />
                                <SocialIcon />
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Tautan Cepat</h4>
                            <ul className="space-y-4 text-sm">
                                <li><a href="#beranda" className="hover:text-yellow-400 transition-colors">Beranda</a></li>
                                <li><a href="#profil" className="hover:text-yellow-400 transition-colors">Profil Desa</a></li>
                                <li><a href="#statistik" className="hover:text-yellow-400 transition-colors">Statistik Penduduk</a></li>
                                <li><a href="#berita" className="hover:text-yellow-400 transition-colors">Kabar Desa</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Kontak</h4>
                            <ul className="space-y-4 text-sm">
                                <li>Jl. Raya Cibungbulang No. 1, Bogor</li>
                                <li>Email: info@cimanggu1.desa.id</li>
                                <li>Telp: (0251) 1234567</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8 border-t border-white/5 text-[10px] uppercase font-bold tracking-[0.3em]">
                        <span>© 2024 PEMDES CIMANGGU I. ALL RIGHTS RESERVED.</span>
                        <div className="flex gap-8">
                            <span>Sistem Digitalisasi Desa (SDD) v2.0</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
    const colors: any = {
        blue: "bg-blue-500/20 text-blue-400 hover:text-blue-400",
        yellow: "bg-yellow-500/20 text-yellow-400 hover:text-yellow-400",
        purple: "bg-purple-500/20 text-purple-400 hover:text-purple-400"
    };
    return (
        <div className="group bg-slate-800/40 hover:bg-slate-700/60 transition-all duration-300 backdrop-blur-md border border-white/5 rounded-3xl p-10 flex flex-col items-center text-center transform hover:-translate-y-3 hover:shadow-2xl h-full">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
                <Icon size={40} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-inherit transition-colors">{title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function MapCategory({ title, desc, active = false }: any) {
    return (
        <div className={`p-4 rounded-xl cursor-pointer transition-colors border ${active ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'}`}>
            <h5 className="font-bold mb-1">{title}</h5>
            <p className="text-slate-400 text-[10px]">{desc}</p>
        </div>
    );
}

function SocialIcon() {
    return <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer"></div>;
}
