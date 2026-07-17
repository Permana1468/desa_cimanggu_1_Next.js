"use client";

import { useState, useEffect } from "react";
import { 
    getLembagas, 
    addLembaga,
    getLembagaMembers,
    addLembagaMember,
    deleteLembagaMember,
    getLembagaPrograms,
    updateLembaga,
    deleteLembaga
} from "@/actions/village";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { 
    Building2, 
    Users, 
    Target, 
    Shield, 
    Plus, 
    X, 
    Loader2, 
    Save, 
    Mail, 
    Phone, 
    Trash2, 
    Calendar, 
    DollarSign,
    Briefcase,
    ShieldAlert,
    Pencil
} from "lucide-react";

export default function KelembagaanPage() {
    const [lembagas, setLembagas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [selectedLembaga, setSelectedLembaga] = useState<any>(null);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showProgramsModal, setShowProgramsModal] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [loadingModalData, setLoadingModalData] = useState(false);
    const [savingMember, setSavingMember] = useState(false);

    // Form data for new Lembaga
    const [formData, setFormData] = useState({
        name: "",
        fullName: "",
        memberCount: 0,
        description: ""
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        id: "",
        name: "",
        fullName: "",
        memberCount: 0,
        description: ""
    });

    // Form data for new member
    const [memberFormData, setMemberFormData] = useState({
        name: "",
        nik: "",
        position: "",
        photo: "",
        email: "",
        phoneNumber: "",
        level: 2
    });

    const fetchLembagas = async () => {
        setLoading(true);
        const data = await getLembagas();
        setLembagas(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchLembagas();
    }, []);


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

    const handleShowMembers = async (lembaga: any) => {
        setSelectedLembaga(lembaga);
        setShowMembersModal(true);
        setLoadingModalData(true);
        try {
            const res = await getLembagaMembers(lembaga.id);
            setMembers(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingModalData(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLembaga) return;
        setSavingMember(true);
        try {
            await addLembagaMember({
                ...memberFormData,
                lembagaId: selectedLembaga.id,
                level: Number(memberFormData.level)
            });
            const res = await getLembagaMembers(selectedLembaga.id);
            setMembers(res);
            setMemberFormData({
                name: "",
                nik: "",
                position: "",
                photo: "",
                email: "",
                phoneNumber: "",
                level: 2
            });
        } catch (error) {
            alert("Gagal menambahkan pengurus.");
        } finally {
            setSavingMember(false);
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus pengurus ini?")) return;
        try {
            await deleteLembagaMember(id);
            const res = await getLembagaMembers(selectedLembaga.id);
            setMembers(res);
        } catch (error) {
            alert("Gagal menghapus pengurus.");
        }
    };

    const handleShowPrograms = async (lembaga: any) => {
        setSelectedLembaga(lembaga);
        setShowProgramsModal(true);
        setLoadingModalData(true);
        try {
            const res = await getLembagaPrograms(lembaga.id);
            setPrograms(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingModalData(false);
        }
    };

    const handleEditLembagaClick = (lembaga: any) => {
        setEditFormData({
            id: lembaga.id,
            name: lembaga.name,
            fullName: lembaga.fullName,
            memberCount: lembaga.memberCount,
            description: lembaga.description
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateLembaga(editFormData.id, {
                name: editFormData.name,
                fullName: editFormData.fullName,
                memberCount: Number(editFormData.memberCount),
                description: editFormData.description
            });
            setShowEditModal(false);
            fetchLembagas();
        } catch (error) {
            alert("Gagal menyimpan perubahan.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLembagaClick = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus lembaga ini?")) return;
        try {
            await deleteLembaga(id);
            fetchLembagas();
        } catch (error) {
            alert("Gagal menghapus lembaga.");
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

            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                                <th className="p-4 rounded-tl-xl">Lembaga</th>
                                <th className="p-4">Anggota</th>
                                <th className="p-4">Deskripsi</th>
                                <th className="p-4 text-center">Kelola</th>
                                <th className="p-4 text-center rounded-tr-xl">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lembagas.length > 0 ? lembagas.map((item) => (
                                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 min-w-[200px]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                                <Building2 size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-slate-800">{item.name}</h3>
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{item.fullName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                                            <Users size={12} /> {item.memberCount} Anggota
                                        </div>
                                    </td>
                                    <td className="p-4 max-w-xs">
                                        <p className="text-slate-500 text-xs font-medium leading-relaxed truncate" title={item.description}>
                                            {item.description}
                                        </p>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleShowMembers(item)}
                                                className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                            >
                                                <Target size={12} /> Pengurus
                                            </button>
                                            <button 
                                                onClick={() => handleShowPrograms(item)}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                            >
                                                <Shield size={12} /> Program
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleEditLembagaClick(item)}
                                                className="p-2 bg-slate-50 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors"
                                                title="Edit Lembaga"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteLembagaClick(item.id)}
                                                className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Hapus Lembaga"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Building2 size={48} className="text-slate-200" />
                                            <p className="text-slate-400 font-medium">Belum ada lembaga yang terdaftar.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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

            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Edit Lembaga</h2>
                                <p className="text-slate-500 text-xs font-medium">Perbarui data lembaga kemasyarakatan desa.</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Singkatan</label>
                                    <input required placeholder="Contoh: LPM" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Anggota</label>
                                    <input type="number" required value={editFormData.memberCount} onChange={e => setEditFormData({...editFormData, memberCount: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Lembaga</label>
                                <input required placeholder="Contoh: Lembaga Pemberdayaan Masyarakat" value={editFormData.fullName} onChange={e => setEditFormData({...editFormData, fullName: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi / Tugas</label>
                                <textarea required value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20 min-h-[100px]" />
                            </div>

                            <button type="submit" disabled={saving} className="w-full bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Perbarui Lembaga</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* LIHAT PENGURUS MODAL */}
            {showMembersModal && selectedLembaga && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMembersModal(false)} />
                    <div className="bg-slate-50 rounded-[2.5rem] w-full max-w-5xl relative z-10 shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                        <div className="p-8 border-b border-slate-200/60 flex items-center justify-between bg-white">
                            <div>
                                <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-amber-600 tracking-widest mb-1">
                                    <Target size={14} /> Pengurus Struktural
                                </div>
                                <h2 className="text-2xl font-black text-slate-800">Organisasi {selectedLembaga.name}</h2>
                            </div>
                            <button onClick={() => setShowMembersModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Left: Structure view */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                {loadingModalData ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="animate-spin text-blue-600" size={32} />
                                    </div>
                                ) : members.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-16 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-white">
                                        <Users size={48} className="text-slate-300 mb-4" />
                                        <h3 className="font-bold text-slate-700">Belum Ada Pengurus</h3>
                                        <p className="text-xs text-slate-400 mt-1">Gunakan form di sebelah kanan untuk menambahkan pengurus baru.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* KETUA SECTION */}
                                        {members.filter(m => m.level === 0).length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Ketua Lembaga</h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {members.filter(m => m.level === 0).map(member => (
                                                        <MemberListItem key={member.id} member={member} onDelete={() => handleDeleteMember(member.id)} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* SEKRETARIS & BENDAHARA */}
                                        {members.filter(m => m.level === 1).length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Sekretaris & Bendahara</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {members.filter(m => m.level === 1).map(member => (
                                                        <MemberListItem key={member.id} member={member} onDelete={() => handleDeleteMember(member.id)} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* ANGGOTA & STAF */}
                                        {members.filter(m => m.level === 2).length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">Anggota / Staf</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {members.filter(m => m.level === 2).map(member => (
                                                        <MemberListItem key={member.id} member={member} onDelete={() => handleDeleteMember(member.id)} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right: Add Form */}
                            <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200/60 p-8 overflow-y-auto custom-scrollbar shrink-0">
                                <h3 className="font-black text-slate-800 text-lg mb-6">Tambah Pengurus</h3>
                                <form onSubmit={handleAddMember} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                        <input required value={memberFormData.name} onChange={e => setMemberFormData({...memberFormData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK (Opsional)</label>
                                        <input value={memberFormData.nik} onChange={e => setMemberFormData({...memberFormData, nik: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jabatan Struktur</label>
                                        <input required placeholder="Contoh: Ketua LPM, Sekretaris I" value={memberFormData.position} onChange={e => setMemberFormData({...memberFormData, position: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tingkat Struktur</label>
                                        <select value={memberFormData.level} onChange={e => setMemberFormData({...memberFormData, level: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20">
                                            <option value={0}>Ketua Lembaga</option>
                                            <option value={1}>Sekretaris / Bendahara</option>
                                            <option value={2}>Anggota / Staf</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                        <input type="email" value={memberFormData.email} onChange={e => setMemberFormData({...memberFormData, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                                        <input value={memberFormData.phoneNumber} onChange={e => setMemberFormData({...memberFormData, phoneNumber: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                                    </div>
                                    <div className="pt-2">
                                        <ImageUpload onUploadSuccess={url => setMemberFormData({...memberFormData, photo: url})} defaultValue={memberFormData.photo} label="Foto Profil" />
                                    </div>

                                    <button type="submit" disabled={savingMember} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
                                        {savingMember ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Simpan Pengurus</>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PROGRAM KERJA MODAL */}
            {showProgramsModal && selectedLembaga && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowProgramsModal(false)} />
                    <div className="bg-slate-50 rounded-[2.5rem] w-full max-w-4xl relative z-10 shadow-2xl overflow-hidden flex flex-col h-[75vh]">
                        <div className="p-8 border-b border-slate-200/60 flex items-center justify-between bg-white">
                            <div>
                                <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-blue-600 tracking-widest mb-1">
                                    <Shield size={14} /> Rencana & Laporan Kerja
                                </div>
                                <h2 className="text-2xl font-black text-slate-800">Program Kerja {selectedLembaga.name}</h2>
                            </div>
                            <button onClick={() => setShowProgramsModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {loadingModalData ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                </div>
                            ) : programs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                                    <ShieldAlert size={48} className="text-slate-300 mb-4" />
                                    <h3 className="font-bold text-slate-700">Belum Ada Program Kerja</h3>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                                        Program kerja diinput langsung oleh pengurus {selectedLembaga.name} melalui akun/dashboard kelembagaan mereka masing-masing.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {programs.map(program => (
                                        <div key={program.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                        program.status === "SELESAI" ? "bg-emerald-50 text-emerald-600" :
                                                        program.status === "BERJALAN" ? "bg-blue-50 text-blue-600" :
                                                        "bg-slate-100 text-slate-500"
                                                    }`}>
                                                        {program.status}
                                                    </span>
                                                    {program.budget && (
                                                        <span className="text-[10px] font-black text-slate-600 flex items-center bg-slate-50 px-2.5 py-1 rounded-lg">
                                                            Rp {program.budget.toLocaleString("id-ID")}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-black text-slate-800 text-lg">{program.title}</h4>
                                                <p className="text-slate-500 text-xs font-medium leading-relaxed">{program.description}</p>
                                            </div>
                                            
                                            <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Calendar size={14} className="text-slate-300" />
                                                {new Date(program.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MemberListItem({ member, onDelete }: { member: any, onDelete: () => void }) {
    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between gap-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 overflow-hidden relative shadow-inner shrink-0 border border-slate-100">
                    {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                        member.name.charAt(0)
                    )}
                </div>
                <div>
                    <h5 className="font-black text-slate-800 text-sm">{member.name}</h5>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">{member.position}</p>
                    
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                        {member.email && (
                            <span className="flex items-center gap-1.5">
                                <Mail size={12} className="text-slate-300" /> {member.email}
                            </span>
                        )}
                        {member.phoneNumber && (
                            <span className="flex items-center gap-1.5">
                                <Phone size={12} className="text-slate-300" /> {member.phoneNumber}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            <button onClick={onDelete} className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all active:scale-95 shrink-0">
                <Trash2 size={16} />
            </button>
        </div>
    )
}
