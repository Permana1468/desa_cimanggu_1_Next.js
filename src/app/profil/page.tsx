import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MapPin, Compass, ShieldCheck, Users, HeartPulse, ChevronRight, Award, Building, Sparkles } from 'lucide-react';
import { getVillageProfile, getOrganizationalStructure, getLembagaList } from '@/actions/landing';
import { LandingThemeProvider } from '@/components/landing/LandingThemeProvider';

export const metadata = {
    title: 'Profil Desa Cimanggu I | Kecamatan Cibungbulang - Kabupaten Bogor',
    description: 'Profil lengkap Pemerintah Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor. Sejarah, Visi Misi, Batas Wilayah, dan Struktur Organisasi.',
};

export default async function ProfilIndexPage() {
    const [profile, aparaturRes, lembagaRes] = await Promise.all([
        getVillageProfile(),
        getOrganizationalStructure(),
        getLembagaList()
    ]);

    const defaultAbout = "Desa Cimanggu I adalah salah satu desa strategis yang terletak di wilayah Kecamatan Cibungbulang, Kabupaten Bogor, Provinsi Jawa Barat. Berada di kawasan yang subur dan asri, Desa Cimanggu I memiliki bentang alam persawahan hijau, perkebunan produktif, serta pemukiman warga yang guyub rukun. Terbagi ke dalam 4 Wilayah Dusun, 9 Rukun Warga (RW), dan 36 Rukun Tetangga (RT), Pemerintah Desa Cimanggu I berkomitmen penuh menghadirkan transformasi pelayanan publik modern, transparan, dan terintegrasi melalui Sistem Digitalisasi Desa (SDD), pemantauan kesehatan terpadu Posyandu Mawar, pemberdayaan ekonomi UMKM lokal, serta partisipasi aktif warga dalam pembangunan desa.";
    const defaultVisi = "Terwujudnya Desa Cimanggu I yang Maju, Mandiri, Berakhlak Mulia, dan Sejahtera Berlandaskan Gotong Royong serta Pemanfaatan Teknologi Digital Terpadu.";

    return (
        <LandingThemeProvider>
            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-black">
                {/* Fixed Header */}
                <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4 px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-sm transition-colors">
                        <ArrowLeft size={18} /> Kembali ke Beranda
                    </Link>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        DESA CIMANGGU I
                    </div>
                </header>

                <main className="pt-28 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-16">
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest">
                            <Sparkles size={14} /> INFORMASI RESMI PEMDES
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            Profil Desa Cimanggu I
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-light">
                            Kecamatan Cibungbulang, Kabupaten Bogor, Provinsi Jawa Barat
                        </p>
                    </div>

                    {/* Quick Profile Navigation Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Link 
                            href="/profil/sambutan" 
                            className="group p-5 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-amber-400/50 backdrop-blur-xl transition-all shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                                <Award size={24} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-amber-400 transition-colors">Sambutan Kades</h3>
                                <p className="text-[11px] text-slate-400 mt-1 font-light">Pesan Kepala Desa Hernawan M. Sodik</p>
                            </div>
                            <div className="pt-3 mt-3 border-t border-white/10 flex items-center text-xs font-bold text-amber-400 gap-1">
                                <span>Buka</span> <ChevronRight size={14} />
                            </div>
                        </Link>

                        <Link 
                            href="/profil/visi-misi" 
                            className="group p-5 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-cyan-400/50 backdrop-blur-xl transition-all shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                                <Compass size={24} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-cyan-400 transition-colors">Visi & Misi</h3>
                                <p className="text-[11px] text-slate-400 mt-1 font-light">Arah kebijakan & 5 misi pembangunan</p>
                            </div>
                            <div className="pt-3 mt-3 border-t border-white/10 flex items-center text-xs font-bold text-cyan-400 gap-1">
                                <span>Buka</span> <ChevronRight size={14} />
                            </div>
                        </Link>

                        <Link 
                            href="/profil/sejarah" 
                            className="group p-5 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-emerald-400/50 backdrop-blur-xl transition-all shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                                <Building size={24} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-emerald-400 transition-colors">Sejarah Desa</h3>
                                <p className="text-[11px] text-slate-400 mt-1 font-light">Asal usul, tradisi, dan jejak historis</p>
                            </div>
                            <div className="pt-3 mt-3 border-t border-white/10 flex items-center text-xs font-bold text-emerald-400 gap-1">
                                <span>Buka</span> <ChevronRight size={14} />
                            </div>
                        </Link>

                        <Link 
                            href="/organisasi/aparatur" 
                            className="group p-5 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-purple-400/50 backdrop-blur-xl transition-all shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-purple-400 transition-colors">Aparatur Desa</h3>
                                <p className="text-[11px] text-slate-400 mt-1 font-light">Struktur pamong & perangkat desa</p>
                            </div>
                            <div className="pt-3 mt-3 border-t border-white/10 flex items-center text-xs font-bold text-purple-400 gap-1">
                                <span>Buka</span> <ChevronRight size={14} />
                            </div>
                        </Link>
                    </div>

                    {/* Sekilas Pandang Box */}
                    <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden border border-amber-400/30 shadow-2xl">
                                <Image 
                                    src={profile?.about_image || "/images/sawah.png"} 
                                    alt="Desa Cimanggu I" 
                                    fill 
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/80 backdrop-blur-md rounded-xl border border-white/10 text-xs">
                                    <span className="font-bold text-amber-400 block">KANTOR DESA CIMANGGU I</span>
                                    <span className="text-[10px] text-slate-300">Pusat Integrasi Layanan Sistem Digitalisasi Desa (SDD)</span>
                                </div>
                            </div>
                            <div className="lg:col-span-7 space-y-4">
                                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block">SEKILAS PANDANG</span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white">Mewujudkan Desa Maju, Mandiri & Berkelanjutan</h2>
                                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light border-l-2 border-amber-400 pl-4 py-1">
                                    {profile?.about_text || defaultAbout}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Geografis & Batas Wilayah */}
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-2 text-cyan-400 font-extrabold uppercase text-xs tracking-widest">
                                <Compass size={16} /> GEOGRAFIS WILAYAH
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white">Batas & Pembagian Wilayah Administratif</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl">
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-2">Sebelah Utara</span>
                                <h4 className="text-base font-extrabold text-white">{profile?.batasUtara || "Desa Cibatok I, Kec. Cibungbulang"}</h4>
                                <p className="text-xs text-slate-400 mt-2 font-light">Berbatasan langsung dengan wilayah administrasi Cibatok I.</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-2">Sebelah Selatan</span>
                                <h4 className="text-base font-extrabold text-white">{profile?.batasSelatan || "Desa Situ Udik, Kec. Cibungbulang"}</h4>
                                <p className="text-xs text-slate-400 mt-2 font-light">Kawasan asri persawahan dan perkebunan produktif.</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl">
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2">Sebelah Timur</span>
                                <h4 className="text-base font-extrabold text-white">{profile?.batasTimur || "Desa Dukuh, Kec. Cibungbulang"}</h4>
                                <p className="text-xs text-slate-400 mt-2 font-light">Akses mobilitas warga dan konektivitas antardesa.</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl">
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 block mb-2">Sebelah Barat</span>
                                <h4 className="text-base font-extrabold text-white">{profile?.batasBarat || "Desa Leuweung Kolot, Kec. Cibungbulang"}</h4>
                                <p className="text-xs text-slate-400 mt-2 font-light">Batas alam dan jalur lintasan jalan penghubung.</p>
                            </div>
                        </div>

                        {/* Statistik Wilayah Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <span className="text-2xl sm:text-3xl font-black text-amber-400 block">{profile?.luasWilayah || "± 284,5 Ha"}</span>
                                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mt-1 block">Luas Wilayah</span>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <span className="text-2xl sm:text-3xl font-black text-cyan-400 block">4 Dusun</span>
                                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mt-1 block">Wilayah Dusun</span>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">9 RW / 36 RT</span>
                                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mt-1 block">Rukun Tetangga</span>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <span className="text-2xl sm:text-3xl font-black text-purple-400 block">7 Pos</span>
                                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mt-1 block">Posyandu Mawar 1–7</span>
                            </div>
                        </div>
                    </div>

                    {/* Visi Ringkas */}
                    <div className="bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-cyan-500/10 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-4">
                            VISI PEMERINTAH DESA CIMANGGU I
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-black text-white italic max-w-4xl mx-auto leading-snug">
                            &quot;{profile?.visi || defaultVisi}&quot;
                        </p>
                        <div className="mt-8 flex justify-center">
                            <Link 
                                href="/profil/visi-misi" 
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:from-amber-400 hover:to-yellow-400 transition-all"
                            >
                                <span>Lihat 5 Misi Strategis Pembangunan</span>
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* Kontak & Lokasi Cepat */}
                    <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                        <div className="space-y-2 text-center md:text-left">
                            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">ALAMAT KANTOR DESA</span>
                            <h3 className="text-lg font-bold text-white">Kantor Kepala Desa Cimanggu I</h3>
                            <p className="text-xs text-slate-300 max-w-lg font-light leading-relaxed">
                                {profile?.kontak_alamat || "Jl. Raya Cibungbulang - Cimanggu I No. 01, RT 01/RW 01, Desa Cimanggu I, Kec. Cibungbulang, Kab. Bogor, Jawa Barat 16630"}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link 
                                href="/kontak" 
                                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                                Hubungi Kami
                            </Link>
                            <Link 
                                href="/dashboard/map" 
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-1.5"
                            >
                                <Compass size={14} /> Peta Wilayah WebGIS
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </LandingThemeProvider>
    );
}

