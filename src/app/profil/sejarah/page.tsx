import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Compass, MapPin, Sparkles, History, Calendar, CheckCircle2 } from 'lucide-react';
import { getVillageProfile } from '@/actions/landing';
import { LandingThemeProvider } from '@/components/landing/LandingThemeProvider';

export const metadata = {
    title: 'Sejarah Desa Cimanggu I | Kecamatan Cibungbulang - Kabupaten Bogor',
    description: 'Sejarah panjang, asal usul nama, tradisi kearifan lokal Sunda, dan rekam jejak transformasi Desa Cimanggu I, Cibungbulang, Kabupaten Bogor.',
};

export default async function SejarahPage() {
    const profile = await getVillageProfile();

    const defaultSejarah = `Desa Cimanggu I memiliki jejak historis yang panjang dan sarat dengan nilai-nilai kearifan lokal Sunda di kawasan barat Kabupaten Bogor. Nama 'Cimanggu' berakar dari tradisi leluhur setempat yang erat kaitannya dengan sumber air yang melimpah (Cai/Ci) dan kesuburan tanah yang menjadi berkah bagi kehidupan masyarakat agraris sejak masa lampau. Pohon Manggu (manggis) yang dahulu rimbun menaungi aliran mata air di lembah desa menjadi penanda alami permukiman warga.

Sejak dekade-dekade awal pembentukannya di Kecamatan Cibungbulang, Desa Cimanggu I dikenal sebagai lumbung pangan dan penghasil komoditas pertanian unggulan, seperti padi sawah, palawija, serta olahan singkong dan talas Bogor. Keterikatan masyarakat terhadap tanah leluhur melahirkan tradisi gotong royong yang kokoh, tercermin dalam budaya 'rereongan' saat masa tanam dan panen, maupun dalam pemeliharaan sarana umum desa.

Seiring dinamika pemekaran wilayah dan pertumbuhan penduduk, Desa Cimanggu I terus berbenah secara administratif. Struktur wilayah ditata menjadi 4 Dusun strategis, membawahi 9 Rukun Warga (RW) dan 36 Rukun Tetangga (RT). Masing-masing dusun memiliki karakteristik unik yang saling melengkapi:
- Dusun 1: Pusat pemerintahan desa dan pelayanan administrasi warga.
- Dusun 2: Kawasan persawahan produktif, lumbung pangan, dan keasrian alam desa.
- Dusun 3: Sentra pengrajin makanan olahan tradisional dan denyut UMKM lokal.
- Dusun 4: Pusat fasilitas sosial, kesehatan Posyandu Mawar, dan sarana ibadah warga.

Memasuki era modern, di bawah kepemimpinan Kepala Desa Hernawan M. Sodik beserta jajaran perangkat desa dan dukungan penuh Badan Permusyawaratan Desa (BPD) serta tokoh masyarakat, Desa Cimanggu I melangkah lebih jauh menjadi desa pelopor digitalisasi di Kabupaten Bogor. Melalui implementasi Sistem Digitalisasi Desa (SDD) dan pemetaan WebGIS batas wilayah, Desa Cimanggu I memadukan kelestarian tradisi leluhur dengan kecanggihan teknologi untuk menjamin masa depan generasi yang lebih berdaya saing dan sejahtera.`;

    const sejarahText = profile?.sejarah?.trim() || defaultSejarah;

    return (
        <LandingThemeProvider>
            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-black">
                {/* Header */}
                <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4 px-6 flex items-center justify-between">
                    <Link href="/profil" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-sm transition-colors">
                        <ArrowLeft size={18} /> Kembali ke Profil Desa
                    </Link>
                    <Link href="/" className="text-xs font-mono text-slate-400 hover:text-white transition-colors">
                        Beranda Utama
                    </Link>
                </header>

                <main className="pt-28 pb-24 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
                    {/* Header Title */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-widest">
                            <History size={14} /> KILAS HISTORIS WILAYAH
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            Sejarah Desa Cimanggu I
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-base font-light">
                            Menelusuri Akar Kearifan Lokal, Tradisi Rereongan, dan Transformasi Era Modern
                        </p>
                    </div>

                    {/* Featured Image */}
                    <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-emerald-400/30 shadow-2xl">
                        <Image
                            src="/images/sawah.png"
                            alt="Bentang Alam Persawahan Asri Desa Cimanggu I"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-amber-400 font-bold">
                                <MapPin size={14} /> Hamparan Sawah & Lingkungan Hijau Cimanggu I
                            </div>
                            <span className="text-[10px] text-slate-300 font-mono">BOGOR BARAT</span>
                        </div>
                    </div>

                    {/* Timeline Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
                            <span className="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">ASAL USUL</span>
                            <h4 className="font-extrabold text-sm text-white">Cai & Pohon Manggu</h4>
                            <p className="text-[11px] text-slate-400 mt-1 font-light">Mata air jernih pembawa berkah kehidupan agraris.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
                            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest block mb-1">BUDAYA</span>
                            <h4 className="font-extrabold text-sm text-white">Tradisi Rereongan</h4>
                            <p className="text-[11px] text-slate-400 mt-1 font-light">Semangat gotong royong warga sejak masa lampau.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block mb-1">PENATAAN</span>
                            <h4 className="font-extrabold text-sm text-white">4 Dusun & 9 RW</h4>
                            <p className="text-[11px] text-slate-400 mt-1 font-light">Tata kelola administratif terpadu 36 RT.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
                            <span className="text-xs font-black text-purple-400 uppercase tracking-widest block mb-1">ERA MODERN</span>
                            <h4 className="font-extrabold text-sm text-white">Digitalisasi SDD</h4>
                            <p className="text-[11px] text-slate-400 mt-1 font-light">Pelopor keterbukaan informasi & WebGIS desa.</p>
                        </div>
                    </div>

                    {/* Detailed History Prose */}
                    <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-12 shadow-2xl space-y-6">
                        <div className="inline-flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-widest">
                            <BookOpen size={16} /> CATATAN HISTORIS
                        </div>
                        <div className="prose prose-invert prose-lg max-w-none font-light leading-relaxed text-slate-300 whitespace-pre-line text-sm sm:text-base space-y-4">
                            {sejarahText}
                        </div>
                    </div>

                    {/* Geografis Quick Cards */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-slate-900/80 to-amber-500/10 border border-emerald-500/30 backdrop-blur-xl">
                        <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block mb-2">POSISI STRATEGIS DESA</span>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Pemerintah Desa Cimanggu I, Cibungbulang, Kabupaten Bogor</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                                <span className="text-slate-400 block font-mono text-[10px]">Utara</span>
                                <span className="font-bold text-white">Desa Cibatok I</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                                <span className="text-slate-400 block font-mono text-[10px]">Selatan</span>
                                <span className="font-bold text-white">Desa Situ Udik</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                                <span className="text-slate-400 block font-mono text-[10px]">Timur</span>
                                <span className="font-bold text-white">Desa Dukuh</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
                                <span className="text-slate-400 block font-mono text-[10px]">Barat</span>
                                <span className="font-bold text-white">Desa Leuweung Kolot</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Links */}
                    <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-white/10 text-xs">
                        <Link href="/profil/visi-misi" className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
                            Lihat Visi & Misi Desa →
                        </Link>
                        <Link href="/organisasi/aparatur" className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                            Lihat Struktur Aparatur Desa →
                        </Link>
                    </div>
                </main>
            </div>
        </LandingThemeProvider>
    );
}
