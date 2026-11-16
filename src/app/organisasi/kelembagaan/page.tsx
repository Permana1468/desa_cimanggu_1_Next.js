import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Users, Sparkles, ChevronRight, Building2, CheckCircle2 } from 'lucide-react';
import { getLembagaList } from '@/actions/landing';
import { LandingThemeProvider } from '@/components/landing/LandingThemeProvider';

export const metadata = {
    title: 'Lembaga Kemasyarakatan Desa Cimanggu I | Mitra Kerja Pemdes',
    description: 'Daftar lembaga kemasyarakatan, organisasi mitra, dan badan permusyawaratan di Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor.',
};

export default async function KelembagaanPage() {
    const lembagaRes = await getLembagaList();

    const defaultLembagaList = [
        {
            id: "bpd",
            name: "BPD",
            fullName: "Badan Permusyawaratan Desa Cimanggu I",
            description: "Lembaga perwujudan demokrasi desa yang menampung dan menyalurkan aspirasi masyarakat serta mengawasi penyelenggaraan pemerintahan desa.",
            memberCount: 7
        },
        {
            id: "lpm",
            name: "LPM",
            fullName: "Lembaga Pemberdayaan Masyarakat Desa Cimanggu I",
            description: "Mitra strategis Pemerintah Desa dalam merencanakan, melaksanakan, dan menggerakkan prakarsa gotong royong warga dalam pembangunan.",
            memberCount: 9
        },
        {
            id: "pkk",
            name: "TP-PKK",
            fullName: "Tim Penggerak PKK Desa Cimanggu I",
            description: "Gerakan pemberdayaan keluarga menuju peningkatan kesejahteraan, pendidikan keluarga, posyandu balita-lansia, dan ketahanan pangan rumah tangga.",
            memberCount: 25
        },
        {
            id: "katar",
            name: "Karang Taruna",
            fullName: "Karang Taruna Tunas Harapan Cimanggu I",
            description: "Wadah pengembangan potensi generasi muda di bidang kesejahteraan sosial, kewirausahaan pemuda, kesenian daerah, dan olahraga.",
            memberCount: 30
        },
        {
            id: "posyandu",
            name: "Posyandu Mawar",
            fullName: "Forum Kader Posyandu Mawar 1–7",
            description: "Garda terdepan pelayanan kesehatan ibu dan anak, pemantauan gizi tumbuh kembang balita (E-KMS), pencegahan stunting, serta bina lansia di 7 pos.",
            memberCount: 35
        },
        {
            id: "puskesos",
            name: "Puskesos",
            fullName: "Pusat Kesejahteraan Sosial (Puskesos) Cimanggu I",
            description: "Unit layanan rujukan sosial dan advokasi perlindungan sosial terpadu bagi warga pra-sejahtera, verifikasi bansos, serta pendampingan UHC BPJS.",
            memberCount: 8
        },
        {
            id: "mui",
            name: "MUI Desa",
            fullName: "Majelis Ulama Indonesia Desa Cimanggu I",
            description: "Wadah ulama dan tokoh keagamaan dalam membina kerukunan umat beragama, pendidikan akhlak, serta kegiatan keagamaan masyarakat desa.",
            memberCount: 12
        },
        {
            id: "linmas",
            name: "Satlinmas",
            fullName: "Satuan Perlindungan Masyarakat Desa Cimanggu I",
            description: "Satuan keamanan dan ketertiban lingkungan desa yang siaga menjaga ketentraman lingkungan 9 RW serta kesiapsiagaan tanggap bencana.",
            memberCount: 18
        }
    ];

    const displayList = (lembagaRes && lembagaRes.length > 0) ? lembagaRes : defaultLembagaList;

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

                <main className="pt-28 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
                    {/* Header Title */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-widest">
                            <ShieldCheck size={14} /> MITRA KERJA PEMERINTAH DESA
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            Lembaga Kemasyarakatan Desa
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-light">
                            Sinergi kelembagaan dan organisasi mitra dalam membangun Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor.
                        </p>
                    </div>

                    {/* Lembaga Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayList.map((item: any) => (
                            <div 
                                key={item.id} 
                                className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-amber-400/50 backdrop-blur-xl transition-all duration-300 group shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10">
                                            <ShieldCheck size={28} />
                                        </div>
                                        {item.memberCount ? (
                                            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-400/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                                                <Users size={12} /> {item.memberCount} Pengurus
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase block">
                                            {item.name}
                                        </span>
                                        <h3 className="text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors leading-snug">
                                            {item.fullName || item.name}
                                        </h3>
                                    </div>

                                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                                        {item.description || "Mitra kerja aktif Pemerintah Desa Cimanggu I dalam pemberdayaan masyarakat dan pelayanan publik."}
                                    </p>
                                </div>

                                <div className="pt-4 mt-6 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                                    <CheckCircle2 size={13} />
                                    <span>Mitra Resmi Terdaftar Pemdes</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sinergi Box */}
                    <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-slate-900/80 to-amber-500/10 border border-cyan-500/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center md:text-left">
                            <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">KOLABORASI & PARTISIPASI WARGA</span>
                            <h3 className="text-xl font-bold text-white">Gotong Royong Membangun Cimanggu I</h3>
                            <p className="text-xs text-slate-300 max-w-xl font-light leading-relaxed">
                                Seluruh program pembangunan fisik, pemberdayaan ekonomi, kesehatan posyandu, dan pembinaan kepemudaan dirancang melalui Musrenbangdes bersama BPD, LPM, PKK, dan RT/RW.
                            </p>
                        </div>
                        <Link 
                            href="/organisasi/aparatur"
                            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all shrink-0 flex items-center gap-2"
                        >
                            <span>Struktur Aparatur Desa</span>
                            <ChevronRight size={15} />
                        </Link>
                    </div>
                </main>
            </div>
        </LandingThemeProvider>
    );
}
