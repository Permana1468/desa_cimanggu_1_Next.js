"use client";

import { useState } from "react";
import { 
    FileText, FileSpreadsheet, Plus, Trash2, ExternalLink, 
    Save, Loader2, Search, Settings, HelpCircle, Layers, CheckCircle2,
    Brain, Upload, ScanLine
} from "lucide-react";
import { saveOfficialTemplates } from "@/actions/master";

interface Template {
    id: string;
    name: string;
    type: "SPREADSHEET" | "DOCUMENT";
    googleId: string;
    range?: string;
    description?: string;
    category?: string;
    createdAt: string;
    aiSchema?: any[];
}

interface TemplateManagementClientProps {
    initialTemplates: Template[];
}

export function TemplateManagementClient({ initialTemplates }: TemplateManagementClientProps) {
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [searchQuery, setSearchQuery] = useState("");
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [type, setType] = useState<"SPREADSHEET" | "DOCUMENT">("SPREADSHEET");
    const [googleId, setGoogleId] = useState("");
    const [range, setRange] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("UMUM");
    const [aiSchema, setAiSchema] = useState<any[]>([]);
    const [scanning, setScanning] = useState(false);

    const handleAiScan = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanning(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/api/ai/scan-template', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || "Gagal scan template.");
            
            if (data.schema && data.schema.length > 0) {
                setAiSchema(data.schema);
                alert("Berhasil mengekstrak " + data.schema.length + " kolom isian otomatis!");
            } else {
                alert("AI tidak mendeteksi titik kosong/isian pada file tersebut.");
            }
        } catch (err: any) {
            alert(err.message || "Gagal menghubungi Gemini AI.");
        } finally {
            setScanning(false);
            e.target.value = null; // reset input
        }
    };

    const handleAddTemplate = () => {
        if (!name || !googleId) {
            alert("Nama template dan Google ID/URL wajib diisi!");
            return;
        }

        const newTemplate: Template = {
            id: "TMP-" + Math.random().toString(36).substring(7).toUpperCase(),
            name,
            type,
            googleId,
            range: type === "SPREADSHEET" ? range : undefined,
            description,
            category,
            aiSchema,
            createdAt: new Date().toISOString()
        };

        const updated = [newTemplate, ...templates];
        setTemplates(updated);
        setShowAddModal(false);

        // Reset form
        setName("");
        setType("SPREADSHEET");
        setGoogleId("");
        setRange("");
        setDescription("");
        setCategory("UMUM");
        setAiSchema([]);
    };

    const handleDelete = (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus template ini dari arsip resmi?")) {
            const updated = templates.filter(t => t.id !== id);
            setTemplates(updated);
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            await saveOfficialTemplates(templates);
            alert("Arsip template resmi berhasil disimpan & disinkronisasikan!");
        } catch (error: any) {
            alert(error.message || "Gagal menyimpan arsip.");
        } finally {
            setSaving(false);
        }
    };

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.googleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-16 pb-20 animate-in fade-in duration-700">
            {/* HERO PANEL */}
            <div className="relative p-12 md:p-20 rounded-[3rem] md:rounded-[4rem] bg-slate-950 text-white overflow-hidden shadow-2xl shadow-slate-900/40">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                            <Layers size={12} /> Arsip & Perpustakaan Desa
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
                            Template <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Dokumen Resmi</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-sm md:text-lg leading-relaxed">
                            Kelola lembar kerja RAB resmi (Spreadsheets) dan kerangka dokumen administrasi (Google Docs) agar dapat langsung disinkronisasikan oleh Kaur Perencanaan, LPM, RT, RW, dan jajaran perangkat desa.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="px-10 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-[2rem] text-sm font-black transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Plus size={18} className="text-blue-400" /> Daftarkan Template
                        </button>
                        <button 
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] text-sm font-black shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari template resmi..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-12 text-xs font-bold text-slate-950 focus:ring-2 focus:ring-blue-600/20"
                    />
                </div>
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" /> {filteredTemplates.length} Template Terdaftar
                </div>
            </div>

            {/* TEMPLATES GRID */}
            {filteredTemplates.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200">
                    <HelpCircle className="mx-auto text-slate-300 mb-6" size={48} />
                    <h3 className="text-lg font-black text-slate-800">Belum ada template resmi</h3>
                    <p className="text-slate-500 text-xs font-semibold mt-2 max-w-sm mx-auto">
                        Klik tombol &quot;Daftarkan Template&quot; untuk menambahkan format spreadsheet atau dokumen baru ke dalam perpustakaan arsip desa.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTemplates.map((item) => (
                        <div key={item.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col justify-between group hover:border-blue-200 transition-all duration-300 relative overflow-hidden">
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.type === "SPREADSHEET" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                                        {item.type === "SPREADSHEET" ? <FileSpreadsheet size={24} /> : <FileText size={24} />}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${item.type === "SPREADSHEET" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                                            {item.type}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                                            {item.category || "UMUM"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-black text-slate-800 tracking-tight text-lg group-hover:text-blue-600 transition-colors leading-snug">{item.name}</h4>
                                    <p className="text-slate-500 text-xs font-medium leading-relaxed">{item.description || "Tidak ada deskripsi tambahan."}</p>
                                </div>

                                {item.type === "SPREADSHEET" && item.range && (
                                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
                                        <span>Rentang Sinkronisasi:</span>
                                        <span className="font-black text-slate-900 bg-slate-200/50 px-2 py-0.5 rounded-lg">{item.range}</span>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Google Resource ID</span>
                                    <code className="text-[10px] font-mono font-bold bg-slate-50 p-2 rounded-lg block truncate border border-slate-100 text-slate-800 select-all">
                                        {item.googleId}
                                    </code>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    title="Hapus Template"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <a 
                                    href={item.googleId.startsWith("http") ? item.googleId : `https://docs.google.com/${item.type === "SPREADSHEET" ? "spreadsheets" : "document"}/d/${item.googleId}/edit`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                                >
                                    Buka Live <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 bg-slate-950 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl" />
                            <div className="relative z-10">
                                <h3 className="text-xl font-black">Daftarkan Template Resmi</h3>
                                <p className="text-slate-400 text-xs font-semibold mt-1">Tambahkan format Google Sheet atau Google Doc baru.</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Template</label>
                                <input 
                                    type="text" 
                                    placeholder="Contoh: Template RAB Pembangunan Fisik" 
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl py-4.5 px-6 text-xs font-bold text-slate-950 focus:ring-2 focus:ring-blue-600/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Dokumen</label>
                                    <select 
                                        value={type}
                                        onChange={e => setType(e.target.value as any)}
                                        className="w-full bg-slate-50 border-none rounded-xl py-4.5 px-6 text-xs font-bold text-slate-950 focus:ring-2 focus:ring-blue-600/20"
                                    >
                                        <option value="SPREADSHEET">Google Sheets</option>
                                        <option value="DOCUMENT">Google Docs</option>
                                    </select>
                                </div>
                                {type === "SPREADSHEET" && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rentang Sel (Range)</label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: Sheet1!B9:F20" 
                                            value={range}
                                            onChange={e => setRange(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-xl py-4.5 px-6 text-xs font-bold text-slate-950 focus:ring-2 focus:ring-blue-600/20"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Pengguna / Sub-Bagian</label>
                                <select 
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl py-4.5 px-6 text-xs font-bold text-slate-950 focus:ring-2 focus:ring-blue-600/20"
                                >
                                    <option value="UMUM">UMUM (Semua Pengguna)</option>
                                    <option value="SEKDES">SEKRETARIS DESA (SEKDES)</option>
                                    <option value="KASI">KASI (Pemerintahan, Kesejahteraan, Pelayanan)</option>
                                    <option value="KAUR">KAUR (TU, Perencanaan, Keuangan)</option>
                                    <option value="KADUS">KEPALA DUSUN (1 - 4)</option>
                                    <option value="PUSKESOS">PUSKESOS / SLRT</option>
                                    <option value="POSYANDU">POSYANDU</option>
                                    <option value="BUMDES">BUMDES</option>
                                    <option value="LEMBAGA_LAIN">Lembaga Lain (LPM, TP-PKK, Karang Taruna)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Spreadsheet / Doc ID</label>
                                <input 
                                    type="text" 
                                    placeholder="Contoh: 1BxiMVs0XRYHgEE..." 
                                    value={googleId}
                                    onChange={e => setGoogleId(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl py-4.5 px-6 text-xs font-bold text-slate-950 focus:ring-2 focus:ring-blue-600/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Brain size={14} className="text-purple-500" /> Analisa Kolom Isian dengan AI
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 cursor-pointer">
                                        <input type="file" className="hidden" accept=".docx,.xlsx" onChange={handleAiScan} disabled={scanning} />
                                        <div className={`w-full py-4 px-6 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${scanning ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100 hover:border-purple-200"}`}>
                                            {scanning ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
                                            {scanning ? "AI Sedang Membaca Dokumen..." : "Unggah & Scan Dokumen Asli (.docx / .xlsx)"}
                                        </div>
                                    </label>
                                </div>
                                
                                {aiSchema && aiSchema.length > 0 && (
                                    <div className="mt-3 p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-2 max-h-40 overflow-y-auto">
                                        <div className="text-[10px] font-black uppercase text-purple-500 tracking-widest flex items-center gap-2 mb-2">
                                            <CheckCircle2 size={12} /> Ditemukan {aiSchema.length} Kolom Isian Otomatis
                                        </div>
                                        {aiSchema.map((field, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg text-[10px] font-bold border border-purple-50 shadow-sm">
                                                <span className="text-slate-700">{field.label || field.name}</span>
                                                <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{field.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi & Catatan Penggunaan</label>
                                <textarea 
                                    placeholder="Jelaskan kegunaan template ini untuk memudahkan jajaran desa..." 
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-xs font-bold text-slate-950 focus:ring-2 focus:ring-blue-600/20 min-h-[80px]"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold active:scale-95 transition-all text-xs"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleAddTemplate}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
                            >
                                Daftarkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
