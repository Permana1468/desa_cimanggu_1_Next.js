"use client";

import { useState, useEffect, useRef } from "react";
import { 
    Building2, Plus, Trash2, Users, Search, UserPlus, Edit3, 
    Printer, Sparkles, X, Check, Phone, Shield, HeartPulse, 
    BookOpen, Trash, RefreshCw
} from "lucide-react";
import { 
    getRwInstitutions, addRwInstitution, updateRwInstitution, 
    deleteRwInstitution, addRwInstitutionMember, updateRwInstitutionMember, 
    removeRwInstitutionMember 
} from "@/actions/rw";

export function RwInstitutionsTab({ session }: { session: any }) {
    const rwNo = (session?.user as any)?.rw || "009";
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Forms
    const [instForm, setInstForm] = useState({ name: "", description: "" });
    const [memberForm, setMemberForm] = useState({ institutionId: "", name: "", position: "", phoneNumber: "" });
    
    // Edit States
    const [editingInst, setEditingInst] = useState<any | null>(null);
    const [editingMember, setEditingMember] = useState<any | null>(null);

    const [submittingInst, setSubmittingInst] = useState(false);
    const [submittingMember, setSubmittingMember] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const isRw = session?.user?.role === "RW" || session?.user?.role === "ADMIN_DESA" || session?.user?.role === "KADES";

    const loadInstitutions = async () => {
        setLoading(true);
        const data = await getRwInstitutions();
        setInstitutions(data);
        setLoading(false);
    };

    useEffect(() => {
        loadInstitutions();
    }, []);

    const handleAddInst = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instForm.name.trim()) return;
        setSubmittingInst(true);
        await addRwInstitution(instForm);
        setInstForm({ name: "", description: "" });
        setSubmittingInst(false);
        loadInstitutions();
    };

    const handleQuickAdd = async (name: string, description: string) => {
        if (!confirm(`Tambahkan template kelembagaan "${name}"?`)) return;
        setActionLoading(true);
        await addRwInstitution({ name, description });
        setActionLoading(false);
        loadInstitutions();
    };

    const handleUpdateInst = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingInst) return;
        setActionLoading(true);
        await updateRwInstitution(editingInst.id, {
            name: editingInst.name,
            description: editingInst.description
        });
        setActionLoading(false);
        setEditingInst(null);
        loadInstitutions();
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberForm.institutionId || !memberForm.name.trim() || !memberForm.position.trim()) {
            alert("Harap lengkapi nama dan jabatan pengurus!");
            return;
        }
        setSubmittingMember(true);
        await addRwInstitutionMember(memberForm.institutionId, {
            name: memberForm.name,
            position: memberForm.position,
            phoneNumber: memberForm.phoneNumber
        });
        setMemberForm({ institutionId: memberForm.institutionId, name: "", position: "", phoneNumber: "" });
        setSubmittingMember(false);
        loadInstitutions();
    };

    const handleUpdateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;
        setActionLoading(true);
        await updateRwInstitutionMember(editingMember.id, {
            name: editingMember.name,
            position: editingMember.position,
            phoneNumber: editingMember.phoneNumber
        });
        setActionLoading(false);
        setEditingMember(null);
        loadInstitutions();
    };

    const handlePrintDirectory = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Buku Direktori Kelembagaan RW ${rwNo} - Desa Cimanggu I</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; padding: 25px; color: #111; line-height: 1.5; }
        .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 16px; text-transform: uppercase; }
        .header h2 { margin: 4px 0 0; font-size: 13px; color: #333; }
        .meta { margin-top: 5px; font-size: 11px; color: #555; }
        .inst-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 18px; page-break-inside: avoid; }
        .inst-title { font-size: 13px; font-weight: bold; color: #1e3a8a; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 8px; }
        .inst-desc { font-size: 10px; color: #555; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th { background: #f1f5f9; padding: 6px 8px; text-align: left; font-size: 10px; border-bottom: 1px solid #94a3b8; }
        td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        .footer { margin-top: 30px; display: flex; justify-content: flex-end; }
        .sig { text-align: center; width: 220px; }
        .sig-line { margin-top: 65px; border-bottom: 1px solid #111; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>STRUKTUR KELEMBAGAAN & MITRA KERJA RW ${rwNo}</h1>
        <h2>PEMERINTAH DESA CIMANGGU I KECAMATAN CIBUNGBULANG</h2>
        <div class="meta">Status per: ${dateStr}</div>
    </div>

    ${institutions.map(inst => `
        <div class="inst-box">
            <div class="inst-title">${inst.name}</div>
            ${inst.description ? `<div class="inst-desc">${inst.description}</div>` : ''}
            <table>
                <thead>
                    <tr>
                        <th style="width: 30px;">No</th>
                        <th>Jabatan</th>
                        <th>Nama Pengurus</th>
                        <th>Kontak HP/WA</th>
                    </tr>
                </thead>
                <tbody>
                    ${inst.members && inst.members.length > 0 ? inst.members.map((m: any, idx: number) => `
                        <tr>
                            <td>${idx + 1}</td>
                            <td><strong>${m.position}</strong></td>
                            <td>${m.name}</td>
                            <td>${m.phoneNumber || '-'}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="4" style="text-align:center;color:#888;">Belum ada pengurus terdaftar</td></tr>'}
                </tbody>
            </table>
        </div>
    `).join('')}

    <div class="footer">
        <div class="sig">
            <div>Bogor, ${dateStr}</div>
            <div style="font-weight:bold;margin-top:4px;">Ketua RW ${rwNo}</div>
            <div class="sig-line"></div>
            <div style="font-size:9px;color:#555;margin-top:3px;">Tanda Tangan & Cap RW</div>
        </div>
    </div>
</body>
</html>`;
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 350);
    };

    const filteredInstitutions = institutions.filter(inst => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const matchName = inst.name?.toLowerCase().includes(q);
        const matchDesc = inst.description?.toLowerCase().includes(q);
        const matchMember = inst.members?.some((m: any) => 
            m.name?.toLowerCase().includes(q) || 
            m.position?.toLowerCase().includes(q) ||
            m.phoneNumber?.includes(q)
        );
        return matchName || matchDesc || matchMember;
    });

    const totalPengurus = institutions.reduce((acc, inst) => acc + (inst.members?.length || 0), 0);

    return (
        <div className="space-y-6">
            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[2.5rem] p-7 md:p-8 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-[11px] font-bold backdrop-blur-md mb-3 border border-white/20">
                            <Sparkles size={13} className="text-amber-300" />
                            <span>Mitra & Lembaga Kemasyarakatan RW {rwNo}</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black mb-2 flex items-center gap-3">
                            <Building2 className="shrink-0" /> Kelembagaan Lingkungan RW {rwNo}
                        </h2>
                        <p className="text-indigo-100 max-w-xl text-xs sm:text-sm leading-relaxed">
                            Database struktur kepengurusan dan organisasi mitra pendukung RW seperti PKK RW, Karang Taruna RW, DKM / Majelis Taklim, Posyandu, dan Bank Sampah.
                        </p>
                    </div>

                    <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[130px] text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-200">Total Lembaga</span>
                            <span className="block text-2xl font-black mt-0.5">{institutions.length}</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[130px] text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-200">Total Pengurus</span>
                            <span className="block text-2xl font-black mt-0.5">{totalPengurus} Jiwa</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS & SEARCH BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari nama lembaga, pengurus, atau jabatan..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 shadow-xs text-slate-900"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={loadInstitutions}
                        className="p-3 rounded-2xl bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                        title="Segarkan Data"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin text-indigo-600" : ""} />
                    </button>
                    {institutions.length > 0 && (
                        <button 
                            onClick={handlePrintDirectory}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                        >
                            <Printer size={15} />
                            <span>Cetak Direktori Kelembagaan</span>
                        </button>
                    )}
                </div>
            </div>

            {/* QUICK-ADD TEMPLATES FOR RW */}
            {isRw && (
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-indigo-900 text-xs font-black uppercase tracking-wider mb-2">
                        <Sparkles size={14} className="text-indigo-600" /> Template Lembaga RW Cepat
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                        <button 
                            disabled={actionLoading}
                            onClick={() => handleQuickAdd(`PKK RW ${rwNo}`, `Gerakan Pemberdayaan & Kesejahteraan Keluarga RW ${rwNo} fokus pada dasawisma dan gizi warga.`)}
                            className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200/60 transition-all shadow-2xs"
                        >
                            + PKK RW {rwNo}
                        </button>
                        <button 
                            disabled={actionLoading}
                            onClick={() => handleQuickAdd(`Karang Taruna Sub RW ${rwNo}`, `Wadah pembinaan kepemudaan, olahraga, seni budaya, dan sosial lingkungan RW ${rwNo}.`)}
                            className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200/60 transition-all shadow-2xs"
                        >
                            + Karang Taruna RW {rwNo}
                        </button>
                        <button 
                            disabled={actionLoading}
                            onClick={() => handleQuickAdd(`DKM & Keagamaan RW ${rwNo}`, `Dewan Kemakmuran Masjid & Majelis Taklim pembinaan keagamaan di wilayah RW ${rwNo}.`)}
                            className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200/60 transition-all shadow-2xs"
                        >
                            + DKM & Keagamaan RW {rwNo}
                        </button>
                        <button 
                            disabled={actionLoading}
                            onClick={() => handleQuickAdd(`Bank Sampah & Lingkungan RW ${rwNo}`, `Pengelolaan kebersihan, pilah sampah lingkungan, dan kelestarian RW ${rwNo}.`)}
                            className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200/60 transition-all shadow-2xs"
                        >
                            + Bank Sampah RW {rwNo}
                        </button>
                        <button 
                            disabled={actionLoading}
                            onClick={() => handleQuickAdd(`Posyandu RW ${rwNo}`, `Pos Pelayanan Terpadu kesehatan balita, ibu hamil, dan lansia RW ${rwNo}.`)}
                            className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200/60 transition-all shadow-2xs"
                        >
                            + Posyandu RW {rwNo}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* FORMS SIDEBAR (LEFT) */}
                {isRw && (
                    <div className="xl:col-span-1 space-y-6">
                        {/* FORM TAMBAH LEMBAGA */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-xs h-fit space-y-4">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                                <Plus size={18} className="text-indigo-600" /> Tambah Lembaga Baru
                            </h3>
                            <form onSubmit={handleAddInst} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nama Lembaga / Organisasi</label>
                                    <input 
                                        required 
                                        value={instForm.name} 
                                        onChange={e => setInstForm({...instForm, name: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-indigo-500 text-slate-900" 
                                        placeholder={`Contoh: PKK RW ${rwNo}`} 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Deskripsi & Fokus Kegiatan (Opsional)</label>
                                    <textarea 
                                        value={instForm.description} 
                                        onChange={e => setInstForm({...instForm, description: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 min-h-[80px] text-slate-900" 
                                        placeholder="Fokus kegiatan dan bidang pengabdian..." 
                                    />
                                </div>
                                <button 
                                    disabled={submittingInst} 
                                    type="submit" 
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-all text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
                                >
                                    {submittingInst ? "Menyimpan..." : "Simpan Lembaga"}
                                </button>
                            </form>
                        </div>

                        {/* FORM TAMBAH PENGURUS */}
                        {institutions.length > 0 && (
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-xs h-fit space-y-4">
                                <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                                    <UserPlus size={18} className="text-emerald-600" /> Tambah Pengurus Lembaga
                                </h3>
                                <form onSubmit={handleAddMember} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Pilih Lembaga Induk</label>
                                        <select 
                                            required 
                                            value={memberForm.institutionId} 
                                            onChange={e => setMemberForm({...memberForm, institutionId: e.target.value})} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900"
                                        >
                                            <option value="">-- Pilih Lembaga --</option>
                                            {institutions.map(inst => (
                                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nama Lengkap Pengurus</label>
                                        <input 
                                            required 
                                            value={memberForm.name} 
                                            onChange={e => setMemberForm({...memberForm, name: e.target.value})} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900" 
                                            placeholder="Contoh: Ibu Siti Rahmah" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Jabatan</label>
                                            <input 
                                                required 
                                                value={memberForm.position} 
                                                onChange={e => setMemberForm({...memberForm, position: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900" 
                                                placeholder="Ketua, Sekretaris, dll" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nomor WhatsApp / HP</label>
                                            <input 
                                                value={memberForm.phoneNumber} 
                                                onChange={e => setMemberForm({...memberForm, phoneNumber: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900" 
                                                placeholder="08xxxxxxxxxx" 
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        disabled={submittingMember || !memberForm.institutionId} 
                                        type="submit" 
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-all text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                                    >
                                        {submittingMember ? "Menyimpan..." : "Tambah Pengurus"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* LIST OF INSTITUTIONS (RIGHT) */}
                <div className={`xl:col-span-${isRw ? '2' : '3'} space-y-6`}>
                    {loading ? (
                        <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-200/80">
                            <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-3" size={32} />
                            <p className="text-xs font-bold text-slate-500">Memuat database kelembagaan RW...</p>
                        </div>
                    ) : filteredInstitutions.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-200/80 text-slate-500 space-y-3">
                            <Building2 className="mx-auto text-slate-300" size={42} />
                            <p className="font-bold text-sm text-slate-700">Belum ada data kelembagaan ditemukan.</p>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                {searchQuery ? "Tidak ada hasil yang cocok dengan kata kunci pencarian Anda." : "Gunakan tombol template cepat di atas atau form di samping untuk mulai mendaftarkan lembaga."}
                            </p>
                        </div>
                    ) : filteredInstitutions.map(inst => (
                        <div key={inst.id} className="bg-white p-7 lg:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-200 transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">{inst.name}</h4>
                                        {inst.description && <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl font-medium leading-relaxed">{inst.description}</p>}
                                    </div>
                                </div>

                                {isRw && (
                                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                        <button 
                                            onClick={() => setEditingInst(inst)}
                                            className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                                            title="Edit Lembaga"
                                        >
                                            <Edit3 size={15} />
                                        </button>
                                        <button 
                                            onClick={async () => { 
                                                if (confirm(`Hapus lembaga "${inst.name}" beserta seluruh pengurusnya?`)) { 
                                                    await deleteRwInstitution(inst.id); 
                                                    loadInstitutions(); 
                                                } 
                                            }} 
                                            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
                                            title="Hapus Lembaga"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={14} className="text-indigo-600" /> Daftar Pengurus ({inst.members?.length || 0})
                                    </h5>
                                </div>
                                
                                {inst.members && inst.members.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {inst.members.map((member: any) => (
                                            <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100 group/member hover:bg-white hover:border-indigo-100 hover:shadow-xs transition-all">
                                                <div>
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block mb-0.5">
                                                        {member.position}
                                                    </span>
                                                    <span className="font-black text-slate-900 block text-xs sm:text-sm">
                                                        {member.name}
                                                    </span>
                                                    {member.phoneNumber && (
                                                        <a 
                                                            href={`https://wa.me/${member.phoneNumber.replace(/\D/g, '')}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline mt-1"
                                                        >
                                                            <Phone size={11} /> {member.phoneNumber}
                                                        </a>
                                                    )}
                                                </div>
                                                {isRw && (
                                                    <div className="flex items-center gap-1 opacity-0 group-hover/member:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => setEditingMember(member)}
                                                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                                                            title="Edit Pengurus"
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>
                                                        <button 
                                                            onClick={async () => { 
                                                                if (confirm(`Hapus pengurus "${member.name}"?`)) { 
                                                                    await removeRwInstitutionMember(member.id); 
                                                                    loadInstitutions(); 
                                                                } 
                                                            }} 
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                            title="Hapus Pengurus"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-semibold">
                                        Belum ada pengurus yang didaftarkan pada lembaga ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL EDIT LEMBAGA */}
            {editingInst && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="font-black text-slate-900 text-base">Edit Data Lembaga</h4>
                            <button onClick={() => setEditingInst(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateInst} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nama Lembaga</label>
                                <input 
                                    required 
                                    value={editingInst.name} 
                                    onChange={e => setEditingInst({...editingInst, name: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Deskripsi</label>
                                <textarea 
                                    value={editingInst.description || ""} 
                                    onChange={e => setEditingInst({...editingInst, description: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold min-h-[80px] text-slate-900"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setEditingInst(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                                    Batal
                                </button>
                                <button disabled={actionLoading} type="submit" className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDIT PENGURUS */}
            {editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="font-black text-slate-900 text-base">Edit Pengurus Lembaga</h4>
                            <button onClick={() => setEditingMember(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateMember} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                                <input 
                                    required 
                                    value={editingMember.name} 
                                    onChange={e => setEditingMember({...editingMember, name: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Jabatan</label>
                                <input 
                                    required 
                                    value={editingMember.position} 
                                    onChange={e => setEditingMember({...editingMember, position: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nomor WhatsApp / HP</label>
                                <input 
                                    value={editingMember.phoneNumber || ""} 
                                    onChange={e => setEditingMember({...editingMember, phoneNumber: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900"
                                    placeholder="08..."
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                                    Batal
                                </button>
                                <button disabled={actionLoading} type="submit" className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
