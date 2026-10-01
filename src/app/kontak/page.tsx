import { getVillageProfile } from '@/actions/landing';
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
export const revalidate = 60;

export default async function KontakPage() {
    const profile = await getVillageProfile();
    
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
                        HUBUNGI KAMI
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-12">
                        Kontak Desa
                    </h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-8 text-center shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 mx-auto bg-cyan-500/10 border border-cyan-400/30 rounded-2xl flex items-center justify-center text-cyan-400 mb-6">
                                <Phone size={32} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Telepon / WhatsApp</h3>
                            <p className="text-xl font-black text-white">{profile?.kontak_telepon || "-"}</p>
                        </div>
                        
                        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-8 text-center shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 mx-auto bg-emerald-500/10 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
                                <Mail size={32} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Email</h3>
                            <p className="text-lg font-bold text-white break-all">{profile?.kontak_email || "-"}</p>
                        </div>

                        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-8 text-center shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 mx-auto bg-purple-500/10 border border-purple-400/30 rounded-2xl flex items-center justify-center text-purple-400 mb-6">
                                <MapPin size={32} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Alamat Lengkap</h3>
                            <p className="text-base font-medium text-slate-300 leading-relaxed">{profile?.kontak_alamat || "-"}</p>
                        </div>
                    </div>
                </main>
            </div>
        </LandingThemeProvider>
    );
}
