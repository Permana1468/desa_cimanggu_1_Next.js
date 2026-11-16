import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MapPin, Clock, MessageSquare, Compass, ShieldCheck, Sparkles, Send } from 'lucide-react';
import { getVillageProfile } from '@/actions/landing';
import { LandingThemeProvider } from '@/components/landing/LandingThemeProvider';

export const metadata = {
    title: 'Kontak & Layanan Desa Cimanggu I | Kecamatan Cibungbulang',
    description: 'Pusat kontak resmi, alamat kantor desa, nomor telepon, dan jam operasional pelayanan Sistem Digitalisasi Desa (SDD) Cimanggu I.',
};

export default async function KontakPage() {
    const profile = await getVillageProfile();

    const defaultTelepon = "(0251) 8642101 / +62 812-8900-1126";
    const defaultEmail = "pemdes@cimanggu1.desa.id";
    const defaultAlamat = "Jl. Raya Cibungbulang - Cimanggu I No. 01, RT 01/RW 01, Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor, Jawa Barat 16630";

    const telepon = profile?.kontak_telepon?.trim() || defaultTelepon;
    const email = profile?.kontak_email?.trim() || defaultEmail;
    const alamat = profile?.kontak_alamat?.trim() || defaultAlamat;

    return (
        <LandingThemeProvider>
            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-black">
                {/* Header */}
                <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4 px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-sm transition-colors">
                        <ArrowLeft size={18} /> Kembali ke Beranda
                    </Link>
                    <Link href="/profil" className="text-xs font-mono text-slate-400 hover:text-white transition-colors">
                        Profil Desa
                    </Link>
                </header>

                <main className="pt-28 pb-24 px-4 sm:px-6 max-w-5xl mx-auto space-y-12">
                    {/* Header Title */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest">
                            <Sparkles size={14} /> PUSAT LAYANAN & PENGADUAN
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            Kontak Resmi Pemdes Cimanggu I
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-light">
                            Layanan informasi publik, administrasi persuratan, dan penanganan aspirasi warga Desa Cimanggu I, Cibungbulang, Bogor.
                        </p>
                    </div>

                    {/* 3 Main Contact Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Phone / WA */}
                        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-8 text-center shadow-xl hover:border-cyan-400/50 hover:-translate-y-1.5 transition-all group flex flex-col justify-between">
                            <div>
                                <div className="w-16 h-16 mx-auto bg-cyan-500/10 border border-cyan-400/30 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/10">
                                    <Phone size={30} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Telepon / WhatsApp</span>
                                <p className="text-lg font-black text-white leading-snug break-words">{telepon}</p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-white/10">
                                <a 
                                    href="https://wa.me/6281289001126" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                                >
                                    <MessageSquare size={14} /> Hubungi WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-8 text-center shadow-xl hover:border-emerald-400/50 hover:-translate-y-1.5 transition-all group flex flex-col justify-between">
                            <div>
                                <div className="w-16 h-16 mx-auto bg-emerald-500/10 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10">
                                    <Mail size={30} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Email Resmi</span>
                                <p className="text-base font-extrabold text-white leading-snug break-all">{email}</p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-white/10">
                                <a 
                                    href={`mailto:${email}`}
                                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                                >
                                    <Send size={14} /> Kirim Surat Elektronik
                                </a>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-8 text-center shadow-xl hover:border-purple-400/50 hover:-translate-y-1.5 transition-all group flex flex-col justify-between">
                            <div>
                                <div className="w-16 h-16 mx-auto bg-purple-500/10 border border-purple-400/30 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/10">
                                    <MapPin size={30} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Alamat Kantor Desa</span>
                                <p className="text-xs text-slate-200 leading-relaxed font-light">{alamat}</p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-white/10">
                                <Link 
                                    href="/dashboard/map"
                                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-bold hover:bg-purple-500 hover:text-slate-950 transition-colors"
                                >
                                    <Compass size={14} /> Buka Peta WebGIS
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Operational Hours & Service Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
                            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-widest">
                                <Clock size={16} /> JAM OPERASIONAL PELAYANAN
                            </div>
                            <h3 className="text-xl font-bold text-white">Jadwal Pelayanan Balai Desa</h3>
                            <ul className="space-y-3 text-sm text-slate-300 font-light">
                                <li className="flex justify-between pb-2 border-b border-white/10">
                                    <span className="font-medium text-white">Senin - Kamis</span>
                                    <span className="font-mono text-amber-400">08:00 - 15:30 WIB</span>
                                </li>
                                <li className="flex justify-between pb-2 border-b border-white/10">
                                    <span className="font-medium text-white">Jum&apos;at</span>
                                    <span className="font-mono text-amber-400">08:00 - 15:00 WIB</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-medium text-slate-400">Sabtu, Minggu & Libur Nasional</span>
                                    <span className="font-mono text-rose-400">Tutup (Layanan Online Aktif)</span>
                                </li>
                            </ul>
                            <p className="text-xs text-slate-400 pt-2 font-light">
                                *Pengajuan berkas online mandiri (E-Surat SDD) dapat diakses 24 jam setiap hari melalui portal login warga.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-widest">
                                    <ShieldCheck size={16} /> SISTEM DIGITALISASI DESA
                                </div>
                                <h3 className="text-xl font-bold text-white">Layanan Mandiri Warga 24 Jam</h3>
                                <p className="text-sm text-slate-300 font-light leading-relaxed">
                                    Warga Desa Cimanggu I kini dapat mengajukan Surat Keterangan Tidak Mampu (SKKM), SPTJM, Surat Domisili, serta permohonan kepesertaan UHC BPJS secara mandiri langsung dari gawai Anda.
                                </p>
                            </div>
                            <div className="pt-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all"
                                >
                                    <span>Buka Portal Pengajuan Mandiri</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </LandingThemeProvider>
    );
}
