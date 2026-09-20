"use client";
import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

export const LandingAspiration = () => {
    const [aspirationForm, setAspirationForm] = useState({
        nama_warga: '',
        rt_rw: '',
        kategori: 'Infrastruktur',
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
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            setSubmitSuccess(true);
            setAspirationForm({
                nama_warga: '',
                rt_rw: '',
                kategori: 'Infrastruktur',
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
        <section id="aspirasi" className="w-full max-w-7xl mx-auto py-4">
            <ScrollReveal>
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Left Side Telemetry Intro (Pure Floating Typography - Zero Card Boxes) */}
                    <div className="space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/30 border border-yellow-400/40 text-yellow-300 text-[11px] font-black uppercase tracking-widest drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] backdrop-blur-md">
                            <Send size={14} /> SUARA WARGA CYBER PORTAL
                        </div>

                        <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight drop-shadow-[0_6px_25px_rgba(0,0,0,0.95)]">
                            Sampaikan Aspirasi & <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">Saran Anda</span>
                        </h2>

                        <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-light border-l-2 border-yellow-400/60 pl-4 py-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                            Partisipasi Anda sangat berarti bagi kemajuan Desa Cimanggu I. Kirimkan saran, keluhan, atau aspirasi pembangunan secara digital melalui formulir tersinkronisasi ini.
                        </p>

                        <div className="flex items-center gap-4 pt-2">
                            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-400/50 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                <ShieldCheck size={20} className="text-yellow-400" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-white drop-shadow">Tersambung Langsung ke Admin Desa</h4>
                                <p className="text-[11px] text-slate-300 drop-shadow">Pesan terenkripsi dan langsung diproses oleh perangkat desa.</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Side (Clean Semi-Transparent Inputs, Floating Style) */}
                    <div className="relative">
                        {submitSuccess && (
                            <div className="mb-4 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                                <span>Aspirasi Anda berhasil dikirim! Terima kasih atas partisipasi Anda.</span>
                            </div>
                        )}

                        <form onSubmit={handleAspirationSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-1 ml-1 drop-shadow">
                                        Nama Warga
                                    </label>
                                    <input
                                        type="text"
                                        name="nama_warga"
                                        placeholder="Nama Lengkap"
                                        required
                                        value={aspirationForm.nama_warga}
                                        onChange={handleAspirationChange}
                                        className="w-full bg-black/40 border border-white/20 rounded-2xl py-3 px-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-1 ml-1 drop-shadow">
                                        RT/RW Wilayah
                                    </label>
                                    <input
                                        type="text"
                                        name="rt_rw"
                                        placeholder="Contoh: 01/05"
                                        required
                                        value={aspirationForm.rt_rw}
                                        onChange={handleAspirationChange}
                                        className="w-full bg-black/40 border border-white/20 rounded-2xl py-3 px-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-1 ml-1 drop-shadow">
                                    Kategori Aspirasi
                                </label>
                                <select
                                    name="kategori"
                                    value={aspirationForm.kategori}
                                    onChange={handleAspirationChange}
                                    className="w-full bg-black/40 border border-white/20 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all appearance-none"
                                >
                                    <option value="Infrastruktur" className="bg-slate-900 text-white">Infrastruktur & Jalan</option>
                                    <option value="Kesehatan" className="bg-slate-900 text-white">Kesehatan & Posyandu</option>
                                    <option value="Pendidikan" className="bg-slate-900 text-white">Pendidikan & Kepemudaan</option>
                                    <option value="Keamanan" className="bg-slate-900 text-white">Keamanan Lingkungan</option>
                                    <option value="Layanan Publik" className="bg-slate-900 text-white">Layanan Administrasi</option>
                                    <option value="Lainnya" className="bg-slate-900 text-white">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-1 ml-1 drop-shadow">
                                    Isi Aspirasi / Pesan
                                </label>
                                <textarea
                                    name="isi_pesan"
                                    placeholder="Tuliskan aspirasi atau saran Anda di sini..."
                                    rows={3}
                                    required
                                    value={aspirationForm.isi_pesan}
                                    onChange={handleAspirationChange}
                                    className="w-full bg-black/40 border border-white/20 rounded-2xl py-3 px-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingAspiration}
                                className="w-full py-3.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_35px_rgba(245,158,11,0.8)] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                            >
                                {isSubmittingAspiration ? (
                                    <>
                                        <Sparkles className="animate-spin" size={16} />
                                        <span>Mengirim Aspirasi...</span>
                                    </>
                                ) : (
                                    <>
                                        <MessageSquare size={16} />
                                        <span>Kirim Aspirasi Sekarang</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </ScrollReveal>
        </section>
    );
};
