import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Target, Sparkles, Cpu, Layers, DollarSign, HeartPulse, TreePine, ChevronRight } from 'lucide-react';
import { getVillageProfile } from '@/actions/landing';
import { LandingThemeProvider } from '@/components/landing/LandingThemeProvider';

export const metadata = {
    title: 'Visi & Misi Desa Cimanggu I | Kecamatan Cibungbulang - Kabupaten Bogor',
    description: 'Visi dan 5 Misi Strategis Pembangunan Pemerintah Desa Cimanggu I menuju desa mandiri, agamis, dan sejahtera berbasis digitalisasi.',
};

export default async function VisiMisiPage() {
    const profile = await getVillageProfile();

    const defaultVisi = "Terwujudnya Desa Cimanggu I yang Maju, Mandiri, Berakhlak Mulia, dan Sejahtera Berlandaskan Gotong Royong serta Pemanfaatan Teknologi Digital Terpadu.";

    const defaultMisiList = [
        {
            title: "Tata Kelola Pemerintahan Bersih & Digital",
            desc: "Meningkatkan kualitas tata kelola pemerintahan desa yang bersih, transparan, akuntabel, dan melayani masyarakat secara prima berbasis Sistem Digitalisasi Desa (SDD).",
            icon: Cpu
        },
        {
            title: "Pemerataan Infrastruktur Antar-Dusun",
            desc: "Mewujudkan pemerataan pembangunan infrastruktur dasar, drainase, jalan usaha tani, sarana fasilitas umum, dan konektivitas antar-wilayah dusun secara berkesinambungan.",
            icon: Layers
        },
        {
            title: "Penguatan Ekonomi & UMKM Lokal",
            desc: "Mendorong pertumbuhan ekonomi desa melalui penguatan kapasitas UMKM, pertanian berkelanjutan, BUMDes, ketahanan pangan, serta pemberdayaan ekonomi kreatif warga.",
            icon: DollarSign
        },
        {
            title: "Kesehatan Terpadu & Sumber Daya Manusia",
            desc: "Meningkatkan kualitas sumber daya manusia melalui pelayanan kesehatan terpadu Posyandu Mawar 1-7, pencegahan stunting, Universal Health Coverage (UHC) BPJS, serta bantuan sosial tepat sasaran.",
            icon: HeartPulse
        },
        {
            title: "Kearifan Lokal & Kelestarian Lingkungan",
            desc: "Memelihara kerukunan antar-warga, nilai-nilai keagamaan, budaya rereongan, kelestarian lingkungan hidup, dan ketertiban umum di seluruh lingkungan 9 RW dan 36 RT.",
            icon: TreePine
        }
    ];

    // Parse misi safely
    let misiStrings: string[] = [];
    if (Array.isArray(profile?.misi) && profile.misi.length > 0) {
        misiStrings = profile.misi as string[];
    } else if (typeof profile?.misi === 'string' && profile.misi.trim()) {
        try {
            const parsed = JSON.parse(profile.misi);
            if (Array.isArray(parsed) && parsed.length > 0) {
                misiStrings = parsed;
            } else {
                misiStrings = [profile.misi];
            }
        } catch {
            misiStrings = profile.misi.split('\n').filter(Boolean);
        }
    }

    const visiText = profile?.visi?.trim() || defaultVisi;

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
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-widest">
                            <Target size={14} /> HALUAN PEMBANGUNAN DESA
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            Visi & Misi Desa Cimanggu I
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-base font-light">
                            Landasan Strategis Pembangunan Pemerintah Desa Cimanggu I, Cibungbulang, Bogor
                        </p>
                    </div>

                    {/* Visi Card */}
                    <div className="bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-purple-950/40 border border-amber-500/30 backdrop-blur-xl rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-6">
                            <Sparkles size={14} /> VISI UTAMA
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white italic leading-snug drop-shadow-md">
                            &quot;{visiText}&quot;
                        </h2>
                        <div className="w-24 h-1 bg-amber-400 mx-auto mt-6 rounded-full opacity-80" />
                    </div>

                    {/* Misi Cards */}
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-widest">
                                <CheckCircle2 size={16} /> 5 PILAR STRATEGIS
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white">Misi Pembangunan Desa</h2>
                        </div>

                        {misiStrings.length > 0 ? (
                            <div className="space-y-4">
                                {misiStrings.map((misi, idx) => {
                                    const defaultItem = defaultMisiList[idx % defaultMisiList.length];
                                    const Icon = defaultItem.icon;
                                    return (
                                        <div key={idx} className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex items-start gap-4 shadow-xl hover:border-cyan-400/40 transition-all group">
                                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
                                                <Icon size={22} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">PILAR {idx + 1}</span>
                                                    {defaultItem && <span className="text-xs font-bold text-slate-400">• {defaultItem.title}</span>}
                                                </div>
                                                <p className="text-sm sm:text-base text-slate-200 font-light leading-relaxed">{misi}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {defaultMisiList.map((misi, idx) => {
                                    const Icon = misi.icon;
                                    return (
                                        <div key={idx} className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex items-start gap-4 shadow-xl hover:border-cyan-400/40 transition-all group">
                                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
                                                <Icon size={22} />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">PILAR {idx + 1}</span>
                                                <h3 className="text-base font-extrabold text-white">{misi.title}</h3>
                                                <p className="text-sm text-slate-300 font-light leading-relaxed">{misi.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Bottom Nav Links */}
                    <div className="flex flex-wrap justify-between items-center gap-4 pt-6 border-t border-white/10 text-xs">
                        <Link href="/profil/sambutan" className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
                            ← Baca Sambutan Kepala Desa
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
