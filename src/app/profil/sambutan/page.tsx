import { getVillageProfile } from '@/actions/landing';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LandingThemeProvider } from '@/components/landing/LandingThemeProvider';

export default async function SambutanPage() {
    const profile = await getVillageProfile();
    
    return (
        <LandingThemeProvider>
            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-black">
                {/* Minimal Header */}
                <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4 px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold transition-colors">
                        <ArrowLeft size={18} /> Kembali ke Beranda
                    </Link>
                </header>

                <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest mb-6">
                        PROFIL DESA
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-12">
                        Sambutan Kepala Desa
                    </h1>
                    
                    <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 text-left shadow-2xl w-full">
                        <div className="prose prose-invert prose-lg max-w-none font-light leading-relaxed text-slate-300 whitespace-pre-wrap">
                            {profile?.sambutan_kades || "Belum ada data sambutan dari Kepala Desa."}
                        </div>
                    </div>
                </main>
            </div>
        </LandingThemeProvider>
    );
}
