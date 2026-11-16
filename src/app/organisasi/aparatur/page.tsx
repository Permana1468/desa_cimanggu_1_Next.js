import React from 'react';
import { getOrganizationalStructure } from '@/actions/landing';
import { ArrowLeft, Users, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { LandingThemeProvider } from '@/components/landing/LandingThemeProvider';
import { LandingOrganization } from '@/components/landing/LandingOrganization';

export const metadata = {
    title: 'Aparatur & Struktur Organisasi Desa Cimanggu I | Kab. Bogor',
    description: 'Bagan struktur kepengurusan dan aparatur Pemerintah Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor.',
};

export default async function AparaturDesaPage() {
    const aparaturRes = await getOrganizationalStructure();
    
    const mapPejabat = (obj: any) => ({
        name: obj.name,
        role: obj.position,
        foto: obj.photo
    });

    const defaultStaff = [
        { name: "Ahmad Subagja", role: "Kaur Keuangan", foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop" },
        { name: "Dedi Mulyadi", role: "Kaur Umum & Tata Usaha", foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop" },
        { name: "Siti Rahmawati", role: "Kaur Perencanaan", foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop" },
        { name: "Hendra Wijaya", role: "Kasi Pemerintahan", foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop" },
        { name: "Ujang Suryana", role: "Kasi Kesejahteraan", foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop" },
        { name: "Asep Saepudin", role: "Kasi Pelayanan", foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop" }
    ];

    const defaultKadus = [
        { name: "Kepala Dusun 1", role: "Kepala Dusun 1 (RW 01 & RW 02)", foto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop" },
        { name: "Kepala Dusun 2", role: "Kepala Dusun 2 (RW 03 & RW 08)", foto: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop" },
        { name: "Kepala Dusun 3", role: "Kepala Dusun 3 (RW 05, RW 06, RW 07)", foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop" },
        { name: "Kepala Dusun 4", role: "Kepala Dusun 4 (RW 04 & RW 09)", foto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop" }
    ];

    const staffList = (aparaturRes && aparaturRes.filter((x: any) => x.level === 2).length > 0)
        ? aparaturRes.filter((x: any) => x.level === 2).map(mapPejabat)
        : defaultStaff;

    const kadusList = (aparaturRes && aparaturRes.filter((x: any) => x.level === 3).length > 0)
        ? aparaturRes.filter((x: any) => x.level === 3).map(mapPejabat)
        : defaultKadus;

    const orgData = {
        kades: aparaturRes?.find((x: any) => x.level === 0) ? mapPejabat(aparaturRes.find((x: any) => x.level === 0)) : { name: "Hernawan M. Sodik", role: "Kepala Desa Cimanggu I", foto: "/images/KADES_baru.png" },
        sekdes: aparaturRes?.find((x: any) => x.level === 1) ? mapPejabat(aparaturRes.find((x: any) => x.level === 1)) : { name: "Fajar Tri Apriana", role: "Sekretaris Desa", foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" },
        staff: staffList,
        kadus: kadusList
    };

    return (
        <LandingThemeProvider>
            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-black pb-24">
                <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4 px-6 flex items-center justify-between">
                    <Link href="/profil" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-sm transition-colors">
                        <ArrowLeft size={18} /> Kembali ke Profil Desa
                    </Link>
                    <Link href="/" className="text-xs font-mono text-slate-400 hover:text-white transition-colors">
                        Beranda Utama
                    </Link>
                </header>

                <main className="pt-28 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center space-y-12">
                    <div className="w-full">
                        <LandingOrganization orgData={orgData} />
                    </div>

                    <div className="w-full max-w-4xl p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                        <div className="space-y-1 text-center sm:text-left">
                            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">MITRA LEMBAGA DESA</span>
                            <h3 className="text-lg font-bold text-white">Lembaga Kemasyarakatan Desa (LKD)</h3>
                            <p className="text-xs text-slate-300 font-light">
                                Telusuri mitra kerja pemerintah desa: BPD, LPM, TP-PKK, Posyandu Mawar, Karang Taruna, dan Puskesos.
                            </p>
                        </div>
                        <Link 
                            href="/organisasi/kelembagaan"
                            className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all shrink-0 flex items-center gap-2"
                        >
                            <span>Lihat Lembaga Desa</span>
                            <ChevronRight size={15} />
                        </Link>
                    </div>
                </main>
            </div>
        </LandingThemeProvider>
    );
}
