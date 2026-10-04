import { getLembagaList } from '@/actions/landing';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { LandingThemeProvider } from '@/components/landing/LandingThemeProvider';


export default async function KelembagaanPage() {
    const lembagaRes = await getLembagaList();
    
    return (
        <LandingThemeProvider>
            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-black">
                <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4 px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold transition-colors">
                        <ArrowLeft size={18} /> Kembali ke Beranda
                    </Link>
                </header>

                <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto min-h-screen flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-xs font-black uppercase tracking-widest mb-6">
                        MITRA KERJA PEMDES
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-12">
                        Lembaga Kemasyarakatan Desa
                    </h1>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                        {lembagaRes?.map((item: any) => (
                            <div key={item.id} className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 text-center hover:border-amber-400/50 transition-all group shadow-xl hover:-translate-y-2">
                                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10">
                                    <ShieldCheck size={32} />
                                </div>
                                <span className="text-sm font-extrabold text-white uppercase block leading-tight">
                                    {item.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </LandingThemeProvider>
    );
}
