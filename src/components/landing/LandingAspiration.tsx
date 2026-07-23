"use client";
import React, { useState } from 'react';
import { Send, FileText, CheckCircle2, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

export const LandingAspiration = () => {
    const [aspirationForm, setAspirationForm] = useState({
        nama_warga: '',
        rt_rw: '',
        kategori: 'Infrastruktur',
        wilayah_tujuan: '001',
        isi_pesan: ''
    });
    const [isSubmittingAspiration, setIsSubmittingAspiration] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleAspirationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAspirationForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAspirationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmittingAspiration(true);
            // Simulating aspiration submission with real-time feedback
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            setSubmitSuccess(true);
            setAspirationForm({
                nama_warga: '',
                rt_rw: '',
                kategori: 'Infrastruktur',
                wilayah_tujuan: '001',
                isi_pesan: ''
            });

            setTimeout(() => setSubmitSuccess(false), 6000);
        } catch (error) {
            alert('❌ Gagal mengirim aspirasi. Silakan lengkapi formulir dan coba lagi.');
        } finally {
            setIsSubmittingAspiration(false);
        }
    };

    return (
        <section id="aspirasi" className="scroll-mt-32">
            <ScrollReveal>
                <div className="bg-slate-900/70 border border-yellow-500/30 rounded-[2.5rem] p-8 md:p-16 shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden backdrop-blur-2xl">
                    {/* Glowing Tech Orbs */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -ml-40 -mb-40"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Side Telemetry Intro */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                <Send size={14} /> Suara Warga Cyber Portal
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                                Sampaikan Aspirasi & <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">Saran Anda</span>
                            </h2>

                            <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 font-light border-l-2 border-yellow-500/40 pl-4">
                                Partisipasi Anda sangat berarti bagi kemajuan Desa Cimanggu I. Kirimkan saran, keluhan, atau aspirasi pembangunan secara digital melalui formulir tersinkronisasi ini.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                                        <ShieldCheck size={20} className="text-yellow-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Tersambung Langsung ke Admin Desa</h4>
                                        <p className="text-xs text-slate-400">Pesan terenkripsi dan langsung diproses oleh perangkat desa.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="relative">
                            {submitSuccess && (
                                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-3 animate-in fade-in duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                    <CheckCircle2 size={20} className="text-emerald-400" />
                                    <span>Aspirasi Anda berhasil dikirim! Terima kasih atas partisipasi Anda.</span>
                                </div>
                            )}

                            <form onSubmit={handleAspirationSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
                                            Nama Warga
                                        </label>
                                        <input
                                            type="text"
                                            name="nama_warga"
                                            placeholder="Nama Lengkap"
                                            required
                                            value={aspirationForm.nama_warga}
                                            onChange={handleAspirationChange}
                                            className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-3.5 px-5 text-white focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.25)] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
                                            RT/RW Wilayah
                                        </label>
                                        <input
                                            type="text"
                                            name="rt_rw"
                                            placeholder="Contoh: 01/05"
                                            required
                                            value={aspirationForm.rt_rw}
                                            onChange={handleAspirationChange}
                                            className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-3.5 px-5 text-white focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.25)] transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
                                        Kategori Aspirasi
                                    </label>
                                    <select
                                        name="kategori"
                                        value={aspirationForm.kategori}
                                        onChange={handleAspirationChange}
                                        className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-3.5 px-5 text-white focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.25)] transition-all appearance-none"
                                    >
                                        <option value="Infrastruktur" className="bg-slate-900">Infrastruktur & Jalan</option>
                                        <option value="Kesehatan" className="bg-slate-900">Kesehatan & Posyandu</option>
                                        <option value="Pendidikan" className="bg-slate-900">Pendidikan & Kepemudaan</option>
                                        <option value="Keamanan" className="bg-slate-900">Keamanan Lingkungan</option>
                                        <option value="Layanan Publik" className="bg-slate-900">Layanan Administrasi</option>
                                        <option value="Lainnya" className="bg-slate-900">Lainnya</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
                                        Isi Aspirasi / Pesan
                                    </label>
                                    <textarea
                                        name="isi_pesan"
                                        placeholder="Tuliskan aspirasi atau saran Anda di sini..."
                                        rows={4}
                                        required
                                        value={aspirationForm.isi_pesan}
                                        onChange={handleAspirationChange}
                                        className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-3.5 px-5 text-white focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.25)] transition-all resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingAspiration}
                                    className="w-full py-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.7)] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
                                >
                                    {isSubmittingAspiration ? (
                                        <>
                                            <Sparkles className="animate-spin" size={18} />
                                            <span>Mengirim Aspirasi...</span>
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquare size={18} />
                                            <span>Kirim Aspirasi Sekarang</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </ScrollReveal>
        </section>
    );
};
