"use client";
import React, { useState } from 'react';
import { Send, FileText } from 'lucide-react';
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

    const handleAspirationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAspirationForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAspirationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmittingAspiration(true);
            // Simulating aspiration submission
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            alert('✅ Aspirasi Anda berhasil dikirim! Terima kasih atas partisipasi Anda.');
            setAspirationForm({
                nama_warga: '',
                rt_rw: '',
                kategori: 'Infrastruktur',
                wilayah_tujuan: '001',
                isi_pesan: ''
            });
        } catch (error) {
            alert('❌ Gagal mengirim aspirasi. Silakan lengkapi formulir dan coba lagi.');
        } finally {
            setIsSubmittingAspiration(false);
        }
    };

    return (
        <section id="aspirasi" className="scroll-mt-32">
            <ScrollReveal>
                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[2.5rem] p-8 md:p-16 border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                                <Send size={14} /> Suara Warga
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">Sampaikan Aspirasi & <span className="text-yellow-400">Saran Anda</span></h2>
                            <p className="text-slate-400 text-lg leading-relaxed mb-8">Partisipasi Anda sangat berarti bagi kemajuan Desa Cimanggu I. Kirimkan saran, keluhan, atau aspirasi Anda secara langsung melalui formulir digital ini.</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-slate-300">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                        <FileText size={18} className="text-yellow-500" />
                                    </div>
                                    <span className="text-sm font-medium">Tersambung langsung ke Admin Desa</span>
                                </div>
                            </div>
                        </div>
                        <form onSubmit={handleAspirationSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="nama_warga"
                                    placeholder="Nama Lengkap"
                                    required
                                    value={aspirationForm.nama_warga}
                                    onChange={handleAspirationChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                                />
                                <input
                                    type="text"
                                    name="rt_rw"
                                    placeholder="RT/RW (Contoh: 01/05)"
                                    required
                                    value={aspirationForm.rt_rw}
                                    onChange={handleAspirationChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                                />
                            </div>
                            <select
                                name="kategori"
                                value={aspirationForm.kategori}
                                onChange={handleAspirationChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-yellow-500/50 transition-colors appearance-none"
                            >
                                <option value="Infrastruktur">Infrastruktur</option>
                                <option value="Kesehatan">Kesehatan</option>
                                <option value="Pendidikan">Pendidikan</option>
                                <option value="Keamanan">Keamanan</option>
                                <option value="Layanan Publik">Layanan Publik</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                            <textarea
                                name="isi_pesan"
                                placeholder="Tuliskan aspirasi Anda di sini..."
                                rows={4}
                                required
                                value={aspirationForm.isi_pesan}
                                onChange={handleAspirationChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-yellow-500/50 transition-colors resize-none"
                            ></textarea>
                            <button
                                type="submit"
                                disabled={isSubmittingAspiration}
                                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black rounded-2xl transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50"
                            >
                                {isSubmittingAspiration ? 'Mengirim...' : 'Kirim Aspirasi Sekarang'}
                            </button>
                        </form>
                    </div>
                </div>
            </ScrollReveal>
        </section>
    );
};
