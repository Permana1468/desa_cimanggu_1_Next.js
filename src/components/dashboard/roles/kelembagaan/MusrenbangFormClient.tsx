"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { submitMusrenbang } from "@/actions/musrenbang"; // We will create this action

export default function MusrenbangFormClient({ desaName }: { desaName: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    kegiatanPrioritas: "",
    lokasiRt: "",
    lokasiRw: "",
    lokasiDetail: "",
    volume: "",
    satuan: "",
    anggaran: "",
    keterangan: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        await submitMusrenbang({
            ...formData,
            anggaran: parseFloat(formData.anggaran.replace(/[^0-9]/g, "")) || 0
        });
        setSuccess(true);
    } catch (error) {
        alert("Terjadi kesalahan saat mengirim usulan.");
    } finally {
        setLoading(false);
    }
  };

  if (success) {
      return (
          <div className="text-center py-16">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Usulan Berhasil Dikirim!</h2>
              <p className="text-slate-500">Usulan pembangunan Anda telah diteruskan ke Kaur Perencanaan untuk ditinjau dan ditentukan skala prioritasnya.</p>
              <button 
                onClick={() => {
                    setSuccess(false);
                    setFormData({ kegiatanPrioritas: "", lokasiRt: "", lokasiRw: "", lokasiDetail: "", volume: "", satuan: "", anggaran: "", keterangan: "" });
                }} 
                className="mt-8 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors"
              >
                  Kirim Usulan Lainnya
              </button>
          </div>
      );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Kegiatan Prioritas <span className="text-rose-500">*</span></label>
            <input 
                required 
                type="text" 
                value={formData.kegiatanPrioritas}
                onChange={e => setFormData({...formData, kegiatanPrioritas: e.target.value})}
                placeholder="Cth: REHAB JALAN LINGKUNGAN" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none uppercase" 
            />
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">Detail Lokasi</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">RT <span className="text-rose-500">*</span></label>
                    <input required type="text" value={formData.lokasiRt} onChange={e => setFormData({...formData, lokasiRt: e.target.value})} placeholder="Cth: 1" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none bg-white" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">RW <span className="text-rose-500">*</span></label>
                    <input required type="text" value={formData.lokasiRw} onChange={e => setFormData({...formData, lokasiRw: e.target.value})} placeholder="Cth: 1" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none bg-white" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Detail (Nama Kampung/Jalan) <span className="text-rose-500">*</span></label>
                <input required type="text" value={formData.lokasiDetail} onChange={e => setFormData({...formData, lokasiDetail: e.target.value})} placeholder="Cth: KP. CIMANGGU" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none uppercase bg-white" />
            </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">Jumlah Usulan (RAB Sementara)</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Volume <span className="text-rose-500">*</span></label>
                    <input required type="text" value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} placeholder="Cth: 532 x 1 x 0.10" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none bg-white" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Satuan <span className="text-rose-500">*</span></label>
                    <input required type="text" value={formData.satuan} onChange={e => setFormData({...formData, satuan: e.target.value})} placeholder="Cth: METER" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none uppercase bg-white" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Anggaran / Biaya (Rp) <span className="text-rose-500">*</span></label>
                <input required type="text" value={formData.anggaran} onChange={e => setFormData({...formData, anggaran: e.target.value})} placeholder="Cth: 85000000" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none font-black bg-white" />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Keterangan / Pengusul</label>
            <textarea 
                value={formData.keterangan}
                onChange={e => setFormData({...formData, keterangan: e.target.value})}
                placeholder="Cth: BP. HARIYANTO" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none min-h-[80px] uppercase" 
            />
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
                disabled={loading}
                type="submit" 
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Kirim Usulan Musrenbang
            </button>
        </div>
    </form>
  );
}
