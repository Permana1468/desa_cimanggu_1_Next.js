"use client";

import { useState, useEffect } from "react";
import { getAparatur, addAparatur, updateAparaturSK } from "@/actions/village";
import { useSession } from "next-auth/react";
import { 
    Users, 
    Mail, 
    Phone, 
    ShieldCheck, 
    Briefcase, 
    UserPlus, 
    X, 
    Loader2, 
    Save, 
    ChevronDown,
    Building,
    FileText,
    ExternalLink
} from "lucide-react";

export default function AparaturPage() {
    const { data: session } = useSession();
    const isAdminMaster = (session?.user as any)?.role === "ADMIN_MASTER";
    const [aparatur, setAparatur] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSKModal, setShowSKModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedAparatur, setSelectedAparatur] = useState<any>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        role: "ADMIN_DESA",
        position: "",
        password: ""
    });

    const [skData, setSkData] = useState({
        skNumber: "",
        skUrl: ""
    });

    useEffect(() => {
        fetchAparatur();
    }, []);

    const fetchAparatur = async () => {
        setLoading(true);
        try {
            const data = await getAparatur();
            setAparatur(data);
        } catch (err) {
        }
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
            alert("Gagal menambahkan aparatur.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSK = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAparatur) return;
        setSaving(true);
        try {
            await updateAparaturSK(selectedAparatur.id, skData);
            setShowSKModal(false);
            fetchAparatur();
        } catch (error) {
            alert("Gagal memperbarui SK.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-slate-400 font-bold animate-pulse">Menyiapkan Struktur Organisasi...</p>
            </div>
        );
    }

    const kades = aparatur.find(a => a.role === "KADES");
    const sekdes = aparatur.find(a => a.role === "SEKDES");
    const staff = aparatur.filter(a => a.role !== "KADES" && a.role !== "SEKDES");

    return (
        <div className="space-y-12 pb-24 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Struktur Organisasi</h1>
                    <p className="text-slate-500 text-sm font-medium">Manajemen aparatur dan tata kelola administrasi Desa Cimanggu I.</p>
                </div>
                {isAdminMaster && (
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 group"
                    >
                        <UserPlus size={18} className="group-hover:rotate-12 transition-transform" /> Tambah Aparatur
                    </button>
                )}
            </div>

            {/* HIERARCHY CHART */}
            <div className="relative pt-10">
                <div className="absolute top-20 left-1/2 w-0.5 h-full bg-slate-200 -translate-x-1/2 hidden lg:block" />

                <div className="space-y-20">
                    <div className="flex flex-col items-center relative z-10">
                        <SectionTitle title="Pimpinan Tertinggi" />
                        {kades ? <AparaturCard person={kades} variant="primary" isAdminMaster={isAdminMaster} onEditSK={() => { setSelectedAparatur(kades); setSkData({ skNumber: kades.skNumber || "", skUrl: kades.skUrl || "" }); setShowSKModal(true); }} /> : <EmptySlot label="Kepala Desa" />}
                    </div>

                    <div className="flex flex-col items-center relative z-10">
                        <div className="w-0.5 h-16 bg-slate-200 mb-4" />
                        <SectionTitle title="Administrasi Pusat" />
                        {sekdes ? <AparaturCard person={sekdes} variant="secondary" isAdminMaster={isAdminMaster} onEditSK={() => { setSelectedAparatur(sekdes); setSkData({ skNumber: sekdes.skNumber || "", skUrl: sekdes.skUrl || "" }); setShowSKModal(true); }} /> : <EmptySlot label="Sekretaris Desa" />}
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col items-center mb-12">
                             <div className="w-0.5 h-12 bg-slate-200" />
                             <SectionTitle title="Unsur Pelaksana Teknis & Kewilayahan" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {staff.map((person) => (
                                <AparaturCard 
                                    key={person.id} 
                                    person={person} 
                                    isAdminMaster={isAdminMaster}
                                    onEditSK={() => { 
                                        setSelectedAparatur(person); 
                                        setSkData({ skNumber: person.skNumber || "", skUrl: person.skUrl || "" }); 
                                        setShowSKModal(true); 
                                    }} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ARSIP SK SECTION */}
            <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-200/60 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full -mr-40 -mt-40" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Arsip Digital SK</h2>
                            <p className="text-slate-500 font-medium text-sm mt-1">Dokumentasi Surat Keputusan pengangkatan perangkat desa.</p>
                        </div>
                        <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 shadow-inner">
                             <Briefcase size={32} />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="px-8 py-2">Aparatur</th>
                                    <th className="px-8 py-2">Nomor SK</th>
                                    <th className="px-8 py-2">Status Arsip</th>
                                    <th className="px-8 py-2 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aparatur.map((person) => (
                                    <tr key={person.id} className="group hover:bg-slate-50/30 transition-all">
                                        <td className="bg-white border-y border-l border-slate-100 rounded-l-[2rem] px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                                    {person.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800">{person.fullName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{person.position}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="bg-white border-y border-slate-100 px-8 py-6">
                                            <span className="text-sm font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{person.skNumber || "BELUM TERBIT"}</span>
                                        </td>
                                        <td className="bg-white border-y border-slate-100 px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${person.skUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                <ShieldCheck size={12} /> {person.skUrl ? 'TERARSIP' : 'MENUNGGU'}
                                            </div>
                                        </td>
                                        <td className="bg-white border-y border-r border-slate-100 rounded-r-[2rem] px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3">
                                                {person.skUrl && (
                                                    <a href={person.skUrl} target="_blank" className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                        <ExternalLink size={18} />
                                                    </a>
                                                )}
                                                {isAdminMaster && (
                                                    <button 
                                                        onClick={() => { setSelectedAparatur(person); setSkData({ skNumber: person.skNumber || "", skUrl: person.skUrl || "" }); setShowSKModal(true); }}
                                                        className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ADD APARATUR MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tambah Aparatur</h2>
                                <p className="text-slate-500 text-sm font-medium">Daftarkan perangkat desa ke dalam sistem.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="p-10 overflow-y-auto space-y-8 custom-scrollbar bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputGroup label="Nama Lengkap" value={formData.fullName} onChange={(v: string) => setFormData({...formData, fullName: v})} required />
                                <InputGroup label="Email Resmi" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} type="email" required />
                                <InputGroup label="Jabatan Struktur" placeholder="Contoh: Kasi Pemerintahan" value={formData.position} onChange={(v: string) => setFormData({...formData, position: v})} required />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Role Sistem</label>
                                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold text-slate-950 focus:border-blue-500 focus:bg-white transition-all outline-none appearance-none">
                                        <option value="ADMIN_DESA">Admin Desa</option>
                                        <option value="KADES">Kepala Desa</option>
                                        <option value="SEKDES">Sekretaris Desa</option>
                                        <option value="KASI">Kepala Seksi</option>
                                        <option value="KAUR">Kepala Urusan</option>
                                        <option value="KADUS">Kepala Dusun</option>
                                    </select>
                                </div>
                                <InputGroup label="WhatsApp" value={formData.phoneNumber} onChange={(v: string) => setFormData({...formData, phoneNumber: v})} />
                                <InputGroup label="Password Akses" value={formData.password} onChange={(v: string) => setFormData({...formData, password: v})} type="password" required />
                            </div>
                            <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Simpan Data Aparatur</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* SK MODAL */}
            {showSKModal && selectedAparatur && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSKModal(false)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen SK</h2>
                                <p className="text-slate-500 text-xs font-medium">Update dokumen SK untuk <span className="text-blue-600 font-bold">{selectedAparatur.fullName}</span></p>
                            </div>
                            <button onClick={() => setShowSKModal(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-all"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleUpdateSK} className="p-10 space-y-6 bg-white">
                            <InputGroup label="Nomor SK Pengangkatan" value={skData.skNumber} onChange={(v: string) => setSkData({...skData, skNumber: v})} placeholder="Contoh: 141/05/DS/2024" required />
                            <InputGroup label="Link Dokumen SK (PDF/Drive)" value={skData.skUrl} onChange={(v: string) => setSkData({...skData, skUrl: v})} placeholder="https://drive.google.com/..." />
                            <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Simpan Arsip SK</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function SectionTitle({ title }: { title: string }) {
    return (
        <div className="inline-flex items-center gap-3 mb-8 px-6 py-2 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
            <Building size={14} className="text-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</span>
        </div>
    )
}

function EmptySlot({ label }: { label: string }) {
    return (
        <div className="w-full max-w-sm p-12 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center gap-4 bg-slate-50/30">
            <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-slate-200 shadow-sm">
                <UserPlus size={32} />
            </div>
            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Posisi {label} Kosong</p>
        </div>
    )
}

function AparaturCard({ person, variant = "default", isAdminMaster, onEditSK }: { person: any, variant?: "primary" | "secondary" | "default", isAdminMaster?: boolean, onEditSK: () => void }) {
    const isPrimary = variant === "primary";
    const isSecondary = variant === "secondary";

    return (
        <div className={`
            relative bg-white rounded-[3rem] p-10 transition-all group w-full max-w-sm mx-auto
            ${isPrimary ? 'shadow-[0_35px_60px_-15px_rgba(59,130,246,0.15)] border-2 border-blue-500 ring-8 ring-blue-500/5 scale-105' : 'shadow-xl border border-slate-100'}
            hover:-translate-y-2 hover:shadow-2xl
        `}>
            {isPrimary && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-600/30 whitespace-nowrap">
                    Kepala Wilayah
                </div>
            )}
            <div className="flex flex-col items-center text-center space-y-8">
                <div className={`
                    w-24 h-24 rounded-[2rem] flex items-center justify-center font-black text-4xl shadow-inner relative overflow-hidden
                    ${isPrimary ? 'bg-blue-600 text-white' : isSecondary ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-600'}
                `}>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {person.fullName.charAt(0)}
                </div>
                <div className="space-y-3">
                    <h3 className="font-black text-slate-800 text-2xl leading-tight tracking-tight">{person.fullName}</h3>
                    <div className={`
                        inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${isPrimary ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}
                    `}>
                        <ShieldCheck size={14} /> {person.position}
                    </div>
                </div>
                <div className="w-full grid grid-cols-2 gap-4 pt-8 border-t border-slate-50">
                    <div className="flex flex-col items-center p-4 rounded-[1.5rem] bg-slate-50 hover:bg-blue-50 transition-all group/item cursor-default border border-transparent hover:border-blue-100">
                        <Mail size={18} className="text-slate-300 group-hover/item:text-blue-500 mb-2" />
                        <span className="text-[10px] font-black text-slate-500 truncate w-full">{person.email || "-"}</span>
                    </div>
                    <div className="flex flex-col items-center p-4 rounded-[1.5rem] bg-slate-50 hover:bg-emerald-50 transition-all group/item cursor-default border border-transparent hover:border-emerald-100">
                        <Phone size={18} className="text-slate-300 group-hover/item:text-emerald-500 mb-2" />
                        <span className="text-[10px] font-black text-slate-500 truncate w-full">{person.phoneNumber || "-"}</span>
                    </div>
                </div>
                <div className="flex gap-3 w-full">
                    {isAdminMaster && (
                        <button onClick={onEditSK} className="flex-1 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                            <FileText size={14} /> Arsip SK
                        </button>
                    )}
                    <button className={`${isAdminMaster ? 'p-4' : 'flex-1 py-4'} rounded-2xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2`}>
                        <Users size={16} /> {!isAdminMaster && <span className="text-[10px] font-black uppercase tracking-widest">Detail</span>}
                    </button>
                </div>
            </div>
        </div>
    )
}

function InputGroup({ label, value, onChange, type = "text", required = false, placeholder = "" }: { 
    label: string; 
    value: string; 
    onChange: (v: string) => void; 
    type?: string; 
    required?: boolean; 
    placeholder?: string; 
}) {
    return (
        <div className="space-y-2.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">{label}</label>
            <input 
                type={type}
                required={required}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white transition-all outline-none shadow-sm"
            />
        </div>
    )
}
