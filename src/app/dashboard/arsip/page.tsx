"use client";

import { useEffect, useState } from "react";
import { getVillageDocuments, upsertVillageDocument, deleteVillageDocument } from "@/actions/dashboard";
import { useSession } from "next-auth/react";
import { Archive, Plus, Trash2, Search, FileText, Download } from "lucide-react";

export default function ArsipDigitalPage() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;
    const canEdit = !["ADMIN_DESA", "RT", "RW", "LPM", "WARGA"].includes(role);
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [filterJenis, setFilterJenis] = useState("SEMUA");
    const [formData, setFormData] = useState<any>({
        judul: "", jenisDokumen: "PERDES", nomorDokumen: "", tanggalDitetapkan: "", fileUrl: ""
    });

    const loadData = async () => {
        setIsLoading(true);
        const data = await getVillageDocuments(session?.user?.tenantId || "");
        setDocuments(data);
        setIsLoading(false);
    };

    useEffect(() => {
        if (session?.user?.tenantId) {
            loadData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await upsertVillageDocument({
                ...formData,
                tanggalDitetapkan: formData.tanggalDitetapkan ? new Date(formData.tanggalDitetapkan) : null,
                tenantId: session?.user?.tenantId
            });
            setShowModal(false);
            setFormData({ judul: "", jenisDokumen: "PERDES", nomorDokumen: "", tanggalDitetapkan: "", fileUrl: "" });
            loadData();
        } catch (error) {
            alert("Gagal menyimpan dokumen");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Hapus arsip ini?")) {
            await deleteVillageDocument(id);
            loadData();
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchSearch = doc.judul.toLowerCase().includes(search.toLowerCase()) || (doc.nomorDokumen || "").toLowerCase().includes(search.toLowerCase());
        const matchFilter = filterJenis === "SEMUA" || doc.jenisDokumen === filterJenis;
        return matchSearch && matchFilter;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 ">
            {/* HERO CARD */}
            <div className="bg-slate-900 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden text-white flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">
                        <Archive size={14} /> Knowledge Base
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight">Arsip Digital & Regulasi</h1>
                    <p className="text-slate-400 text-sm md:text-base font-medium max-w-lg leading-relaxed">
                        Pusat penyimpanan Peraturan Desa (Perdes), SK, dan dokumen hukum lainnya.
                    </p>
                </div>
                <div className="relative z-10 shrink-0">
                    {canEdit && (
                        <button onClick={() => setShowModal(true)} className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl shadow-amber-500/20 hover:-translate-y-1">
                            <Plus size={20} /> Unggah Dokumen
                        </button>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100 overflow-x-auto">
                        {["SEMUA", "PERDES", "PERKADES", "SK", "UMUM"].map(jenis => (
                            <button
                                key={jenis}
                                onClick={() => setFilterJenis(jenis)}
                                className={`whitespace-nowrap shrink-0 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${filterJenis === jenis ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {jenis}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            placeholder="Cari nomor atau judul..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-72 pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <div className="col-span-full py-12 text-center text-slate-400 font-medium animate-pulse">Memuat arsip...</div>
                    ) : filteredDocs.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-slate-400 font-medium bg-slate-50 border border-slate-100 border-dashed rounded-[2rem]">
                            Belum ada dokumen yang sesuai.
                        </div>
                    ) : filteredDocs.map((doc: any) => (
                        <div key={doc.id} className="group relative bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl hover:border-amber-200 transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-[1.25rem] bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                    <FileText size={24} />
                                </div>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black tracking-widest uppercase">
                                    {doc.jenisDokumen}
                                </span>
                            </div>
                            
                            <h3 className="text-lg font-black text-slate-800 mb-2 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">
                                {doc.judul}
                            </h3>
                            <p className="text-xs font-bold text-slate-500 mb-6">Nomor: {doc.nomorDokumen || "-"}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <div className="text-[10px] text-slate-400 font-medium">
                                    {doc.tanggalDitetapkan ? new Date(doc.tanggalDitetapkan).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : "-"}
                                </div>
                                <div className="flex items-center gap-2">
                                    {canEdit && (
                                        <button onClick={() => handleDelete(doc.id)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <a href={doc.fileUrl || "#"} target="_blank" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-amber-500 hover:text-white transition-colors">
                                        <Download size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL UNGGAH */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><Archive size={20}/></div>
                            <h2 className="text-xl font-black text-slate-800">Unggah Regulasi</h2>
                        </div>
                        
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600">Judul Dokumen</label>
                                <input required value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} className="w-full px-4 py-3 mt-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Contoh: Perdes APBDes 2024" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Jenis</label>
                                    <select required value={formData.jenisDokumen} onChange={e => setFormData({...formData, jenisDokumen: e.target.value})} className="w-full px-4 py-3 mt-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold">
                                        <option value="PERDES">Perdes</option>
                                        <option value="PERKADES">Perkades</option>
                                        <option value="SK">SK Kades</option>
                                        <option value="UMUM">Umum</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Nomor</label>
                                    <input value={formData.nomorDokumen} onChange={e => setFormData({...formData, nomorDokumen: e.target.value})} className="w-full px-4 py-3 mt-1.5 rounded-xl border border-slate-200" placeholder="Opsional" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600">Tanggal Ditetapkan</label>
                                <input type="date" value={formData.tanggalDitetapkan} onChange={e => setFormData({...formData, tanggalDitetapkan: e.target.value})} className="w-full px-4 py-3 mt-1.5 rounded-xl border border-slate-200" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600">URL File Dokumen (S3 / Drive)</label>
                                <input required type="url" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="w-full px-4 py-3 mt-1.5 rounded-xl border border-slate-200" placeholder="https://..." />
                                <p className="text-[10px] text-slate-400 mt-1">*Untuk saat ini, masukkan link eksternal (Google Drive/S3).</p>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Batal</button>
                                <button type="submit" className="px-6 py-3 bg-amber-500 text-slate-900 rounded-xl font-black hover:bg-amber-400">Simpan Arsip</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
