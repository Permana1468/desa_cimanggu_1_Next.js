"use client";

import { useState, useEffect } from "react";
import { getAparatur, addAparatur } from "@/app/actions/village";
import { Users, Mail, Phone, ShieldCheck, Briefcase, Plus, X, Loader2, Save, UserPlus } from "lucide-react";

export default function AparaturPage() {
    const [aparatur, setAparatur] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        role: "ADMIN_DESA",
        position: "",
        password: ""
    });

    useEffect(() => {
        fetchAparatur();
    }, []);

    const fetchAparatur = async () => {
        setLoading(true);
        const data = await getAparatur();
        setAparatur(data);
        setLoading(false);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await addAparatur(formData);
            setShowAddModal(false);
            fetchAparatur();
            setFormData({ fullName: "", email: "", phoneNumber: "", role: "ADMIN_DESA", position: "", password: "" });
        } catch (error) {
            console.error(error);
            alert("Gagal menambahkan aparatur.");
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

    // Grouping for structure
    const kades = aparatur.find(a => a.role === "KADES");
    const sekdes = aparatur.find(a => a.role === "SEKDES");
    const others = aparatur.filter(a => a.role !== "KADES" && a.role !== "SEKDES");

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Aparatur Desa</h1>
                    <p className="text-slate-500 text-sm">Struktur organisasi dan pengurus administrasi Desa Cimanggu I.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                >
                    <UserPlus size={16} /> Tambah Aparatur
                </button>
            </div>

            {/* ORGANIZATIONAL STRUCTURE VIEW */}
            <div className="space-y-12">
                {/* TOP: KADES */}
                <div className="flex justify-center">
                    {kades ? (
                        <AparaturCard person={kades} highlight />
                    ) : (
                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 text-center w-full max-w-sm">
                            Kepala Desa Belum Ditentukan
                        </div>
                    )}
                </div>

                {/* MIDDLE: SEKDES */}
                <div className="flex justify-center relative">
                    <div className="absolute top-[-3rem] left-1/2 w-0.5 h-12 bg-slate-200 -translate-x-1/2" />
                    {sekdes ? (
                        <AparaturCard person={sekdes} />
                    ) : (
                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 text-center w-full max-w-sm bg-white">
                            Sekretaris Desa Belum Ditentukan
                        </div>
                    )}
                </div>

                {/* BOTTOM: OTHERS (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 relative">
                     <div className="absolute top-[-2rem] left-1/2 w-0.5 h-8 bg-slate-200 -translate-x-1/2" />
                     {others.map((person) => (
                        <AparaturCard key={person.id} person={person} />
                    ))}
                </div>
            </div>

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Tambah Aparatur</h2>
                                <p className="text-slate-500 text-xs font-medium">Buat akun untuk perangkat desa baru.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAdd} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jabatan (Struktur)</label>
                                    <input required placeholder="Contoh: Kaur Keuangan" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Sistem</label>
                                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20">
                                        <option value="ADMIN_DESA">Admin Desa</option>
                                        <option value="KADES">Kepala Desa</option>
                                        <option value="SEKDES">Sekretaris Desa</option>
                                        <option value="RT">Ketua RT</option>
                                        <option value="RW">Ketua RW</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                                    <input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Awal</label>
                                    <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                            </div>

                            <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Simpan Aparatur</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function AparaturCard({ person, highlight = false }: { person: any, highlight?: boolean }) {
    return (
        <div className={`bg-white rounded-[2.5rem] p-8 shadow-sm border ${highlight ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-slate-200/60'} hover:shadow-xl transition-all group w-full max-w-sm mx-auto`}>
            <div className="flex items-center gap-6 mb-6">
                <div className={`w-16 h-16 rounded-3xl ${highlight ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'} flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform`}>
                    {person.fullName.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <h3 className="font-black text-slate-800 text-lg leading-tight">{person.fullName}</h3>
                    <div className="inline-flex items-center gap-1.5 mt-1 text-blue-600 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                        <ShieldCheck size={12} /> {person.position || person.role}
                    </div>
                </div>
            </div>

            <div className="space-y-4 border-t border-slate-50 pt-6">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <Mail size={16} className="text-slate-400" /> {person.email || "-"}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <Phone size={16} className="text-slate-400" /> {person.phoneNumber || "-"}
                </div>
            </div>

            <div className="mt-8 flex gap-2">
                <button className="flex-1 py-3 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Detail</button>
                <button className="px-4 py-3 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">Edit</button>
            </div>
        </div>
    )
}
