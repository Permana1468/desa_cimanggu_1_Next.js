import { getVillageProfile } from '@/actions/landing';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
export const revalidate = 60;

export default async function VisiMisiPage() {
    const profile = await getVillageProfile();
    
    // Parse misi safely
    let misiList: string[] = [];
    if (Array.isArray(profile?.misi)) {
        misiList = profile.misi as string[];
    } else if (typeof profile?.misi === 'string') {
        try {
            const parsed = JSON.parse(profile.misi);
            if (Array.isArray(parsed)) {
                misiList = parsed;
            } else {
                misiList = [profile.misi];
            }
        } catch {
            misiList = profile.misi.split('\n').filter(Boolean);
        }
    }

    return (
        <LandingThemeProvider>
            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-black">
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
                        Visi & Misi
                    </h1>
                    
                    <div className="w-full space-y-8">
                        {/* Visi */}
                        <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 backdrop-blur-xl rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                            <h2 className="text-2xl font-black text-amber-400 mb-6 uppercase tracking-widest">Visi</h2>
                            <p className="text-xl md:text-3xl font-extrabold text-white leading-snug italic">
                                "{profile?.visi || "Belum ada data visi."}"
                            </p>
                        </div>

                        {/* Misi */}
                        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 text-left shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                            <h2 className="text-2xl font-black text-cyan-400 mb-8 uppercase tracking-widest text-center">Misi</h2>
                            
                            {misiList.length > 0 ? (
                                <ul className="space-y-6">
                                    {misiList.map((misi, idx) => (
                                        <li key={idx} className="flex gap-4">
                                            <CheckCircle2 className="text-cyan-400 shrink-0 mt-1" size={24} />
                                            <p className="text-lg text-slate-300 font-light leading-relaxed">{misi}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-400 text-center">Belum ada data misi.</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </LandingThemeProvider>
    );
}
