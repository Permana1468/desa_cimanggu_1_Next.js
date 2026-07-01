"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSuratRequest } from "@/actions/resident";
import { FileText, Send, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function BaruSuratPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        jenisSurat: "Surat Keterangan Usaha (SKU)",
        keperluan: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createSuratRequest(formData);
            alert("Pengajuan surat berhasil dikirim! Silakan tunggu verifikasi.");
            router.push("/resident/surat");
        } catch (error: any) {
            alert(error.message || "Terjadi kesalahan saat mengajukan surat.");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link 
                    href="/resident/surat"
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm border border-slate-200/60 transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pengajuan Baru</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Isi formulir di bawah ini untuk mengajukan surat.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-200/60">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Jenis Surat
                        </label>
                        <select 
                            required
                            value={formData.jenisSurat}
                            onChange={(e) => setFormData({...formData, jenisSurat: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-900"
                        >
                            <option value="Surat Keterangan Usaha (SKU)">Surat Keterangan Usaha (SKU)</option>
                            <option value="Surat Keterangan Tidak Mampu (SKTM)">Surat Keterangan Tidak Mampu (SKTM)</option>
                            <option value="Surat Keterangan Domisili">Surat Keterangan Domisili</option>
                            <option value="Surat Pengantar Nikah">Surat Pengantar Nikah</option>
                            <option value="Surat Keterangan Kematian">Surat Keterangan Kematian</option>
                            <option value="Surat Keterangan Pindah">Surat Keterangan Pindah</option>
                            <option value="Lainnya">Lainnya...</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Keperluan / Tujuan Pembuatan
                        </label>
                        <textarea 
                            required
                            rows={4}
                            placeholder="Contoh: Untuk persyaratan pengajuan KUR di Bank BRI"
                            value={formData.keperluan}
                            onChange={(e) => setFormData({...formData, keperluan: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-medium focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-900 resize-none"
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    Kirim Pengajuan <Send size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
