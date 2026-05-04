"use client";

import { useState, useEffect } from "react";
import { getLetterTemplates, createLetterTemplate } from "@/actions/documents";
import { 
    FileText, 
    Plus, 
    Search, 
    FileType, 
    Info, 
    CheckCircle2, 
    AlertCircle,
    X,
    Upload,
    ChevronRight,
    Loader2,
    Settings,
    History
} from "lucide-react";

export default function TemplateRepositoryPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [query, setQuery] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        fileUrl: ""
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        const data = await getLetterTemplates();
        setTemplates(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createLetterTemplate(formData);
            setShowModal(false);
            loadTemplates();
            alert("Template berhasil ditambahkan ke repository.");
        } catch (error) {
            alert("Gagal menambahkan template.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Pusat Persuratan Desa</h1>
                    <p className="text-slate-500 font-medium mt-1">Repository template resmi pemerintah (.docx) dengan sistem Auto-Fill.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black shadow-2xl shadow-slate-900/10 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus size={20} /> Tambah Template Baru
                </button>
            </div>

            {/* INFO BANNER */}
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex gap-4 items-start">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0">
                    <Info size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Petunjuk Auto-Fill</h4>
                    <p className="text-xs text-amber-700 leading-relaxed mt-1">
                        Gunakan placeholder kurung kurawal ganda pada file Word Anda: 
                        <code className="mx-1 bg-white px-1.5 py-0.5 rounded border border-amber-200 text-[10px] font-bold">{"{{nama}}"}</code>, 
                        <code className="mx-1 bg-white px-1.5 py-0.5 rounded border border-amber-200 text-[10px] font-bold">{"{{nik}}"}</code>, 
                        <code className="mx-1 bg-white px-1.5 py-0.5 rounded border border-amber-200 text-[10px] font-bold">{"{{alamat}}"}</code>. 
                        Sistem akan mengisi data secara otomatis saat dicetak.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* TEMPLATE LIST */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 min-h-[500px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800">Daftar Template Aktif</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    type="text" 
                                    placeholder="Cari template..." 
                                    className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : templates.length > 0 ? (
                            <div className="space-y-4">
                                {templates.map((tpl) => (
                                    <div key={tpl.id} className="p-5 rounded-[1.5rem] border border-slate-100 hover:border-blue-200 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                                <FileType size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-800 leading-none mb-1">{tpl.name}</h4>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tpl.code} • Versi {tpl.version}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                <Settings size={18} />
                                            </button>
                                            <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                                    <FileText size={40} />
                                </div>
                                <p className="text-slate-400 font-medium">Belum ada template yang diunggah.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SIDEBAR TOOLS */}
                <div className="space-y-6">
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-xl">
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                            <History size={20} className="text-amber-400" /> Version Control
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                            Sistem akan memastikan semua perangkat desa selalu mendapatkan versi template terbaru setiap kali mencetak surat.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span className="text-[10px] font-bold">Sinkronisasi Cloud Aktif</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                                <AlertCircle size={16} className="text-amber-400" />
                                <span className="text-[10px] font-bold">2 Update Tersedia</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Statistik Persuratan</h3>
                        <div className="space-y-4">
                            <StatRow label="Total Template" value={templates.length.toString()} />
                            <StatRow label="Surat Dicetak (Bln Ini)" value="128" />
                            <StatRow label="Waktu Rata-rata" value="1.2s" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ADD TEMPLATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-10 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Template Baru</h2>
                                <p className="text-slate-500 text-xs font-medium">Unggah file .docx standar pemerintah.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Template</label>
                                <input 
                                    required 
                                    placeholder="Contoh: Surat Keterangan Usaha"
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-950" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kode Template (Shortcode)</label>
                                <input 
                                    required 
                                    placeholder="Contoh: SKU"
                                    value={formData.code} 
                                    onChange={e => setFormData({...formData, code: e.target.value})} 
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-950" 
                                />
                            </div>
                            
                            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center flex flex-col items-center gap-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                    <Upload size={32} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800">Klik untuk Unggah .docx</p>
                                    <p className="text-xs text-slate-400 font-bold mt-1">Maksimal ukuran file: 5MB</p>
                                </div>
                            </div>

                            <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4">
                                {saving ? <Loader2 className="animate-spin" size={24} /> : "Simpan Template"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-xs font-black text-slate-900">{value}</span>
        </div>
    )
}
