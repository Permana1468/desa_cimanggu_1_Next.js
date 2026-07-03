"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Trash2, Users, Search, UserPlus } from "lucide-react";
import { getRwInstitutions, addRwInstitution, deleteRwInstitution, addRwInstitutionMember, removeRwInstitutionMember } from "@/actions/rw";

export function RwInstitutionsTab({ session }: { session: any }) {
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Forms
    const [instForm, setInstForm] = useState({ name: "", description: "" });
    const [memberForm, setMemberForm] = useState({ institutionId: "", name: "", position: "", phoneNumber: "" });
    
    const [submittingInst, setSubmittingInst] = useState(false);
    const [submittingMember, setSubmittingMember] = useState(false);

    const isRw = session?.user?.role === "RW";

    useEffect(() => {
        loadInstitutions();
    }, []);

    const loadInstitutions = async () => {
        setLoading(true);
        const data = await getRwInstitutions();
        setInstitutions(data);
        setLoading(false);
    };

    const handleAddInst = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingInst(true);
        await addRwInstitution(instForm);
        setInstForm({ name: "", description: "" });
        setSubmittingInst(false);
        loadInstitutions();
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberForm.institutionId) {
            alert("Pilih lembaga terlebih dahulu!");
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

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -mr-32 -mt-32" />
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black mb-2 flex items-center gap-3"><Building2 /> Kelembagaan Lingkungan RW</h2>
                        <p className="text-indigo-100 max-w-md text-sm">Database pengurus dan struktur organisasi dari mitra RW seperti PKK, Karang Taruna, dan DKM.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {isRw && (
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
                            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Plus size={18} className="text-indigo-500" /> Tambah Lembaga Baru
                            </h3>
                            <form onSubmit={handleAddInst} className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase">Nama Lembaga</label>
                                    <input required value={instForm.name} onChange={e => setInstForm({...instForm, name: e.target.value})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="Contoh: PKK RW 05" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase">Deskripsi (Opsional)</label>
                                    <textarea value={instForm.description} onChange={e => setInstForm({...instForm, description: e.target.value})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm min-h-[80px]" placeholder="Fokus kegiatan lembaga..." />
                                </div>
                                <button disabled={submittingInst} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all">
                                    {submittingInst ? "Menyimpan..." : "Simpan Lembaga"}
                                </button>
                            </form>
                        </div>

                        {institutions.length > 0 && (
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
                                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <UserPlus size={18} className="text-emerald-500" /> Tambah Pengurus
                                </h3>
                                <form onSubmit={handleAddMember} className="space-y-4">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase">Pilih Lembaga</label>
                                        <select required value={memberForm.institutionId} onChange={e => setMemberForm({...memberForm, institutionId: e.target.value})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold">
                                            <option value="">-- Pilih Lembaga --</option>
                                            {institutions.map(inst => (
                                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase">Nama Lengkap</label>
                                        <input required value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="Nama pengurus..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[11px] font-black text-slate-400 uppercase">Jabatan</label>
                                            <input required value={memberForm.position} onChange={e => setMemberForm({...memberForm, position: e.target.value})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="Ketua, dll" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black text-slate-400 uppercase">Nomor HP / WA</label>
                                            <input value={memberForm.phoneNumber} onChange={e => setMemberForm({...memberForm, phoneNumber: e.target.value})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="08..." />
                                        </div>
                                    </div>
                                    <button disabled={submittingMember || !memberForm.institutionId} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all">
                                        {submittingMember ? "Menyimpan..." : "Tambah Pengurus"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                <div className={`xl:col-span-${isRw ? '2' : '3'} space-y-6`}>
                    {loading ? <div className="p-8 text-center animate-pulse">Memuat...</div> : institutions.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-200 text-slate-500 font-medium">Belum ada data kelembagaan.</div>
                    ) : institutions.map(inst => (
                        <div key={inst.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-xl">{inst.name}</h4>
                                        {inst.description && <p className="text-sm text-slate-500 mt-1 max-w-lg">{inst.description}</p>}
                                    </div>
                                </div>
                                {isRw && (
                                    <button onClick={async () => { if(confirm("Hapus lembaga beserta seluruh pengurusnya?")) { await deleteRwInstitution(inst.id); loadInstitutions(); } }} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="mt-6">
                                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Users size={14} /> Daftar Pengurus ({inst.members?.length || 0})</h5>
                                
                                {inst.members && inst.members.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {inst.members.map((member: any) => (
                                            <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div>
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase block mb-1">{member.position}</span>
                                                    <span className="font-bold text-slate-800 block text-sm">{member.name}</span>
                                                    {member.phoneNumber && <span className="text-xs text-slate-500">{member.phoneNumber}</span>}
                                                </div>
                                                {isRw && (
                                                    <button onClick={async () => { if(confirm("Hapus pengurus ini?")) { await removeRwInstitutionMember(member.id); loadInstitutions(); } }} className="text-slate-400 hover:text-rose-500 transition-colors p-2">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center text-sm text-slate-500">
                                        Belum ada pengurus yang didaftarkan pada lembaga ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
