"use client";

import { useState, useEffect } from "react";
import { getVillageProfile, updateVillageProfile } from "@/actions/village";
import { smartImportProfile } from "@/actions/cms";
import { MapPin, History, Target, ShieldCheck, Image as ImageIcon, Edit2, X, Loader2, Save, FileType } from "lucide-react";

export default function VillageProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);
    
    const [formData, setFormData] = useState({
        visi: "",
        misi: "", // will be split by newline
        sejarah: "",
        luasWilayah: "",
        batasUtara: "",
        batasSelatan: "",
        batasTimur: "",
        batasBarat: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        const data = await getVillageProfile();
        if (data) {
            setProfile(data);
            setFormData({
                visi: data.visi || "",
                misi: Array.isArray(data.misi) ? data.misi.join("\n") : "",
                sejarah: data.sejarah || "",
                luasWilayah: data.luasWilayah || "",
                batasUtara: data.batasUtara || "",
                batasSelatan: data.batasSelatan || "",
                batasTimur: data.batasTimur || "",
                batasBarat: data.batasBarat || ""
            });
        }
        setLoading(false);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateVillageProfile({
                ...formData,
                misi: formData.misi.split("\n").filter(m => m.trim() !== "")
            });
            setShowEditModal(false);
            fetchProfile();
        } catch (error) {
            console.error(error);
            alert("Gagal memperbarui profil.");
        } finally {
            setSaving(false);
        }
    };

    const handleSmartImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64 = (event.target?.result as string).split(",")[1];
                const res = await smartImportProfile(base64);
                
                if (res.success && res.html) {
                    // Extract text from HTML (strip tags) or use as is for sejarah
                    const cleanText = res.html.replace(/<[^>]*>?/gm, '\n').trim();
                    setFormData(prev => ({
                        ...prev,
                        sejarah: cleanText
                    }));
                    setShowEditModal(true);
                    alert("Konten berhasil diekstrak ke bagian Sejarah. Silakan tinjau dan simpan.");
                } else {
                    alert(res.error);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            alert("Gagal mengimpor file.");
        } finally {
            setImporting(false);
            e.target.value = "";
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
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Profil Desa</h1>
                    <p className="text-slate-500 font-medium mt-1">Informasi dasar, sejarah, visi, dan misi Desa Cimanggu I.</p>
                </div>
                <div className="flex gap-3">
                    <label className="cursor-pointer bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                        {importing ? <Loader2 size={18} className="animate-spin" /> : <FileType size={18} className="text-blue-600" />}
                        Smart Word Import
                        <input type="file" accept=".docx" className="hidden" onChange={handleSmartImport} disabled={importing} />
                    </label>
                    <button 
                        onClick={() => setShowEditModal(true)}
                        className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-xs font-black shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Edit2 size={16} /> Edit Profil
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vision & Mission */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                <Target size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Visi & Misi</h2>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Visi</h4>
                                <p className="text-slate-700 font-bold text-lg leading-relaxed italic">
                                    "{profile?.visi || "Visi belum diisi."}"
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Misi</h4>
                                <ul className="space-y-3">
                                    {(Array.isArray(profile?.misi) ? profile.misi : []).map((misi: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                                            <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-black">{i+1}</div>
                                            {misi}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <History size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Sejarah Singkat</h2>
                        </div>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {profile?.sejarah || "Sejarah belum diisi."}
                        </p>
                    </div>
                </div>

                {/* Geography & Stats */}
                <div className="space-y-8">
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                            <MapPin size={20} className="text-blue-400" /> Geografi
                        </h3>
                        <div className="space-y-4">
                            <GeoRow label="Luas Wilayah" value={profile?.luasWilayah || "-"} />
                            <GeoRow label="Batas Utara" value={profile?.batasUtara || "-"} />
                            <GeoRow label="Batas Selatan" value={profile?.batasSelatan || "-"} />
                            <GeoRow label="Batas Timur" value={profile?.batasTimur || "-"} />
                            <GeoRow label="Batas Barat" value={profile?.batasBarat || "-"} />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                            <ImageIcon size={20} className="text-amber-500" /> Galeri Desa
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="aspect-square bg-slate-100 rounded-2xl" />
                            <div className="aspect-square bg-slate-100 rounded-2xl" />
                            <div className="aspect-square bg-slate-100 rounded-2xl" />
                            <div className="aspect-square bg-slate-100 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Edit Profil Desa</h2>
                                <p className="text-slate-500 text-xs font-medium">Perbarui informasi dasar desa Anda.</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdate} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visi Desa</label>
                                <textarea 
                                    required 
                                    value={formData.visi} 
                                    onChange={e => setFormData({...formData, visi: e.target.value})} 
                                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 min-h-[60px]" 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Misi Desa (Satu per baris)</label>
                                <textarea 
                                    required 
                                    value={formData.misi} 
                                    onChange={e => setFormData({...formData, misi: e.target.value})} 
                                    placeholder="Misi 1&#10;Misi 2&#10;Misi 3"
                                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 min-h-[100px]" 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sejarah Singkat</label>
                                <textarea 
                                    required 
                                    value={formData.sejarah} 
                                    onChange={e => setFormData({...formData, sejarah: e.target.value})} 
                                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 min-h-[150px]" 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Luas Wilayah</label>
                                    <input value={formData.luasWilayah} onChange={e => setFormData({...formData, luasWilayah: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batas Utara</label>
                                    <input value={formData.batasUtara} onChange={e => setFormData({...formData, batasUtara: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batas Selatan</label>
                                    <input value={formData.batasSelatan} onChange={e => setFormData({...formData, batasSelatan: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batas Timur</label>
                                    <input value={formData.batasTimur} onChange={e => setFormData({...formData, batasTimur: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batas Barat</label>
                                    <input value={formData.batasBarat} onChange={e => setFormData({...formData, batasBarat: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                            </div>

                            <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Simpan Perubahan</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function GeoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-xs font-bold">{value}</span>
        </div>
    )
}
