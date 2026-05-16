"use client";

import { useState, useEffect } from "react";
import { getLembagas, addLembaga } from "@/actions/village";
import { Building2, Users, Target, Shield, Plus, X, Loader2, Save } from "lucide-react";

export default function KelembagaanPage() {
    const [lembagas, setLembagas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        fullName: "",
        memberCount: 0,
        description: ""
    });

    useEffect(() => {
        fetchLembagas();
    }, []);

    const fetchLembagas = async () => {
        setLoading(true);
        const data = await getLembagas();
        setLembagas(data);
        setLoading(false);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await addLembaga({
                ...formData,
                memberCount: Number(formData.memberCount)
            });
            setShowAddModal(false);
            fetchLembagas();
            setFormData({ name: "", fullName: "", memberCount: 0, description: "" });
        } catch (error) {
            alert("Gagal menambahkan lembaga.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kelembagaan Desa</h1>
                    <p className="text-slate-500 text-sm">Kelola struktur dan pengurus lembaga kemasyarakatan desa.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#0f172a] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus size={16} /> Tambah Lembaga
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {lembagas.length > 0 ? lembagas.map((item, i) => (
                    <div key={item.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 flex flex-col md:flex-row gap-8 group hover:border-amber-200 transition-all">
                        <div className="w-24 h-24 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                            <Building2 size={40} />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-slate-800">{item.name}</h3>
                                <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <Users size={12} /> {item.memberCount} Anggota
                                </div>
                            </div>
                            <p className="text-xs font-black text-amber-600 uppercase tracking-widest">{item.fullName}</p>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.description}</p>
                            
                            <div className="pt-4 flex gap-3">
                                <button className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 hover:text-amber-600 transition-colors">
                                    Lihat Pengurus <Target size={14} />
                                </button>
                                <button className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                                    Program Kerja <Shield size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-2 py-20 text-center flex flex-col items-center gap-4 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                        <Building2 size={48} className="text-slate-200" />
                        <p className="text-slate-400 font-medium">Belum ada lembaga yang terdaftar.</p>
                    </div>
                )}
            </div>

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Tambah Lembaga</h2>
                                <p className="text-slate-500 text-xs font-medium">Daftarkan lembaga baru di desa.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAdd} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Singkatan</label>
                                    <input required placeholder="Contoh: LPM" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Anggota</label>
                                    <input type="number" required value={formData.memberCount} onChange={e => setFormData({...formData, memberCount: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Lembaga</label>
                                <input required placeholder="Contoh: Lembaga Pemberdayaan Masyarakat" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi / Tugas</label>
                                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 min-h-[100px]" />
                            </div>

                            <button type="submit" disabled={saving} className="w-full bg-[#0f172a] hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Simpan Lembaga</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
