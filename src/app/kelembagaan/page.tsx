"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
    getLembagaByName, 
    getLembagaMembers, 
    getLembagaPrograms,
    addLembagaProgram,
    deleteLembagaProgram,
    addLembagaMember,
    deleteLembagaMember
} from "@/actions/village";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { 
    Users, 
    FileText, 
    ShieldCheck, 
    MapPin, 
    Clock, 
    CheckCircle2, 
    Plus, 
    X, 
    Loader2, 
    Save, 
    Calendar, 
    DollarSign,
    Trash2,
    Mail,
    Phone,
    Shield
} from "lucide-react";

export default function KelembagaanDashboard() {
    const { data: session, status } = useSession();
    const [lembaga, setLembaga] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAddProgramModal, setShowAddProgramModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form states
    const [programFormData, setProgramFormData] = useState({
        title: "",
        description: "",
        date: "",
        status: "RENCANA",
        budget: ""
    });

    const [memberFormData, setMemberFormData] = useState({
        name: "",
        nik: "",
        position: "",
        photo: "",
        email: "",
        phoneNumber: "",
        level: 2
    });

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            fetchLembagaData();
        }
    }, [status, session]);

    const fetchLembagaData = async () => {
        setLoading(true);
        try {
            const role = (session?.user as any)?.role || "";
            // Find corresponding Lembaga (e.g. LPM)
            const lembData = await getLembagaByName(role);
            if (lembData) {
                setLembaga(lembData);
                const [memData, progData] = await Promise.all([
                    getLembagaMembers(lembData.id),
                    getLembagaPrograms(lembData.id)
                ]);
                setMembers(memData);
                setPrograms(progData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProgram = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lembaga) return;
        setSaving(true);
        try {
            await addLembagaProgram({
                lembagaId: lembaga.id,
                title: programFormData.title,
                description: programFormData.description,
                date: programFormData.date ? new Date(programFormData.date) : new Date(),
                status: programFormData.status,
                budget: programFormData.budget ? Number(programFormData.budget) : undefined
            });
            setShowAddProgramModal(false);
            // Refresh
            const progData = await getLembagaPrograms(lembaga.id);
            setPrograms(progData);
            setProgramFormData({
                title: "",
                description: "",
                date: "",
                status: "RENCANA",
                budget: ""
            });
        } catch (error) {
            alert("Gagal menambahkan program kerja.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProgram = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus program kerja ini?")) return;
        try {
            await deleteLembagaProgram(id);
            const progData = await getLembagaPrograms(lembaga.id);
            setPrograms(progData);
        } catch (error) {
            alert("Gagal menghapus program kerja.");
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lembaga) return;
        setSaving(true);
        try {
            await addLembagaMember({
                ...memberFormData,
                lembagaId: lembaga.id,
                level: Number(memberFormData.level)
            });
            setShowAddMemberModal(false);
            // Refresh
            const memData = await getLembagaMembers(lembaga.id);
            setMembers(memData);
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
            setSaving(false);
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus pengurus ini?")) return;
        try {
            await deleteLembagaMember(id);
            const memData = await getLembagaMembers(lembaga.id);
            setMembers(memData);
        } catch (error) {
            alert("Gagal menghapus pengurus.");
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (!lembaga) {
        return (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200/60 max-w-xl mx-auto mt-10">
                <ShieldCheck size={48} className="text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-black text-slate-800">Lembaga Tidak Terdaftar</h2>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Akun/Role Anda ({(session?.user as any)?.role}) belum terdaftar sebagai Lembaga di sistem utama. Silakan hubungi Admin Desa untuk mendaftarkan lembaga ini terlebih dahulu.
                </p>
            </div>
        );
    }

    const completedProgramsCount = programs.filter(p => p.status === "SELESAI").length;

    return (
        <div className="space-y-8 pb-12">
            {/* WELCOME BANNER */}
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <ShieldCheck size={14} className="text-blue-500" /> Panel Koordinasi {lembaga.name}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            {lembaga.fullName}
                        </h1>
                        <p className="text-slate-400 max-w-xl text-sm font-medium">
                            Kelola program kerja, rancang anggaran kegiatan, serta kelola susunan pengurus struktural lembaga secara mandiri.
                        </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <button 
                            onClick={() => setShowAddProgramModal(true)}
                            className="bg-blue-600 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/15 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-1.5"
                        >
                            <Plus size={16} /> Tambah Kegiatan
                        </button>
                        <button 
                            onClick={() => setShowAddMemberModal(true)}
                            className="bg-white/10 hover:bg-white/15 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                        >
                            <Plus size={16} /> Tambah Pengurus
                        </button>
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={Users} label="Pengurus Struktural" value={`${members.length} Orang`} color="bg-amber-600" />
                <StatCard icon={FileText} label="Total Program Kerja" value={`${programs.length} Kegiatan`} color="bg-blue-600" />
                <StatCard icon={CheckCircle2} label="Program Selesai" value={`${completedProgramsCount} Kegiatan`} color="bg-emerald-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Program Kerja (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800">Program Kerja & Kegiatan</h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <MapPin size={14} /> Desa Cimanggu I
                            </div>
                        </div>

                        {programs.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                    <Clock size={32} />
                                </div>
                                <p className="text-slate-400 font-medium text-sm">Belum ada program kerja yang diinput.</p>
                                <button onClick={() => setShowAddProgramModal(true)} className="text-xs font-black text-blue-600 uppercase tracking-widest mt-2 hover:underline">Buat Program Kerja Pertama</button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {programs.map(program => (
                                    <div key={program.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-start justify-between gap-6 group hover:bg-white hover:border-blue-100 hover:shadow-md transition-all">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    program.status === "SELESAI" ? "bg-emerald-100 text-emerald-700" :
                                                    program.status === "BERJALAN" ? "bg-blue-100 text-blue-700" :
                                                    "bg-slate-200 text-slate-600"
                                                }`}>
                                                    {program.status}
                                                </span>
                                                {program.budget && (
                                                    <span className="text-[10px] font-black text-slate-500 flex items-center gap-1">
                                                        <DollarSign size={12} /> Rp {program.budget.toLocaleString("id-ID")}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-black text-slate-800 text-lg leading-tight">{program.title}</h4>
                                            <p className="text-slate-500 text-xs font-medium leading-relaxed">{program.description}</p>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest pt-2">
                                                <Calendar size={14} />
                                                {new Date(program.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                            </div>
                                        </div>

                                        <button onClick={() => handleDeleteProgram(program.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Struktur Pengrus (1 col) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800">Susunan Pengurus</h3>
                            <button onClick={() => setShowAddMemberModal(true)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
                                <Plus size={12} /> Tambah
                            </button>
                        </div>

                        {members.length === 0 ? (
                            <div className="py-12 text-center flex flex-col items-center gap-3">
                                <Users size={32} className="text-slate-200" />
                                <p className="text-slate-400 text-xs font-medium">Belum ada pengurus terdaftar.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden relative shadow-inner shrink-0 border border-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                                                {member.photo ? (
                                                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    member.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-slate-800 text-xs leading-tight">{member.name}</h5>
                                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-wider mt-0.5">{member.position}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteMember(member.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ADD PROGRAM MODAL */}
            {showAddProgramModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddProgramModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Tambah Kegiatan</h2>
                                <p className="text-slate-500 text-xs font-medium">Buat rencana program kerja atau aktivitas baru.</p>
                            </div>
                            <button onClick={() => setShowAddProgramModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddProgram} className="p-8 overflow-y-auto space-y-5 custom-scrollbar">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kegiatan</label>
                                <input required placeholder="Contoh: Kerja Bakti Bulanan LPM" value={programFormData.title} onChange={e => setProgramFormData({...programFormData, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Rencana</label>
                                    <input type="date" required value={programFormData.date} onChange={e => setProgramFormData({...programFormData, date: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anggaran Kegiatan (Rp)</label>
                                    <input type="number" placeholder="Opsional" value={programFormData.budget} onChange={e => setProgramFormData({...programFormData, budget: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Pelaksanaan</label>
                                <select value={programFormData.status} onChange={e => setProgramFormData({...programFormData, status: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20">
                                    <option value="RENCANA">Rencana</option>
                                    <option value="BERJALAN">Sedang Berjalan</option>
                                    <option value="SELESAI">Selesai</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rincian / Deskripsi Kegiatan</label>
                                <textarea required placeholder="Jelaskan tujuan dan rencana rinci kegiatan..." value={programFormData.description} onChange={e => setProgramFormData({...programFormData, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 min-h-[100px]" />
                            </div>

                            <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Simpan Kegiatan</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD MEMBER MODAL */}
            {showAddMemberModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddMemberModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Tambah Pengurus</h2>
                                <p className="text-slate-500 text-xs font-medium">Daftarkan personil pengurus struktural baru.</p>
                            </div>
                            <button onClick={() => setShowAddMemberModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddMember} className="p-8 overflow-y-auto space-y-5 custom-scrollbar">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                <input required placeholder="Contoh: Budi Santoso" value={memberFormData.name} onChange={e => setMemberFormData({...memberFormData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK (Opsional)</label>
                                <input placeholder="Contoh: 3201..." value={memberFormData.nik} onChange={e => setMemberFormData({...memberFormData, nik: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jabatan Struktur</label>
                                <input required placeholder="Contoh: Ketua, Sekretaris I, Anggota Humas" value={memberFormData.position} onChange={e => setMemberFormData({...memberFormData, position: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tingkat Struktur</label>
                                <select value={memberFormData.level} onChange={e => setMemberFormData({...memberFormData, level: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20">
                                    <option value={0}>Ketua Lembaga</option>
                                    <option value={1}>Sekretaris / Bendahara</option>
                                    <option value={2}>Anggota / Staf</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                    <input type="email" placeholder="Opsional" value={memberFormData.email} onChange={e => setMemberFormData({...memberFormData, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                                    <input placeholder="Opsional" value={memberFormData.phoneNumber} onChange={e => setMemberFormData({...memberFormData, phoneNumber: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-amber-500/20" />
                                </div>
                            </div>

                            <div className="pt-2">
                                <ImageUpload onUploadSuccess={url => setMemberFormData({...memberFormData, photo: url})} defaultValue={memberFormData.photo} label="Foto Profil" />
                            </div>

                            <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Simpan Pengurus</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200/60 flex items-center gap-6">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/10`}>
                <Icon size={28} />
            </div>
            <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <p className="text-xl font-black text-slate-800 mt-1">{value}</p>
            </div>
        </div>
    )
}
