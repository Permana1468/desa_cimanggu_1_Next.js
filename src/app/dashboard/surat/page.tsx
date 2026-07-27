"use client";

import { useState, useEffect } from "react";
import { getLetterTemplates, createLetterTemplate, updateLetterTemplate, uploadTemplateFile, deleteLetterTemplate } from "@/actions/documents";
import { generateTemplateWithAI } from "@/actions/ai-template";
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
    History,
    Sparkles,
    Play,
    Trash2
} from "lucide-react";

export default function TemplateRepositoryPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [query, setQuery] = useState("");
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        code: "",
        fileUrl: "",
        variables: "",
        instruction: ""
    });
    const [showTestModal, setShowTestModal] = useState<string | null>(null);
    const [testData, setTestData] = useState<any>({});
    const [isTesting, setIsTesting] = useState(false);
    const [fileBase64, setFileBase64] = useState<string>("");
    const [fileName, setFileName] = useState<string>("");
    
    // Form Builder State
    const [formFields, setFormFields] = useState<any[]>([]);

    const addField = () => {
        setFormFields([...formFields, { label: "", name: "", type: "text" }]);
    };
    const updateField = (index: number, key: string, value: string) => {
        const newFields = [...formFields];
        newFields[index][key] = value;
        setFormFields(newFields);
    };
    const removeField = (index: number) => {
        setFormFields(formFields.filter((_, i) => i !== index));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File terlalu besar. Maksimum 5MB.");
                return;
            }
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                setFileBase64(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    async function loadTemplates() {
        setLoading(true);
        const data = await getLetterTemplates();
        setTemplates(data);
        setLoading(false);
    }

    const handleScanAI = async () => {
        if (!fileBase64) {
            alert("Harap unggah file template .docx terlebih dahulu untuk di-scan.");
            return;
        }
        setIsScanning(true);
        try {
            const res = await generateTemplateWithAI(fileBase64, formData.instruction);
            if (!res.success || !res.data) {
                alert(res.error || "Gagal melakukan scan dengan AI.");
                return;
            }
            // Update formData with AI results
            setFormData({
                ...formData,
                name: res.data.name,
                code: res.data.code,
                variables: res.data.variables
            });
            
            // Auto-generate form fields from AI variables
            if (res.data.variables) {
                const vars = res.data.variables.split(',').map((v: string) => v.trim());
                setFormFields(vars.map((v: string) => ({
                    label: v.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    name: v,
                    type: v.includes('tanggal') ? 'date' : 'text'
                })));
            }
            // Update the file base64 with the modified XML version
            setFileBase64(res.data.modifiedBase64);
            alert("AI berhasil mengidentifikasi dan menyisipkan variabel ke dalam dokumen!");
        } catch (error) {
            alert("Gagal menghubungi AI.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const variablesArray = formData.variables ? formData.variables.split(',').map(v => v.trim()) : [];
            if (formData.id) {
                // UPDATE EXISTING TEMPLATE
                if (fileBase64) {
                    const uploadRes = await uploadTemplateFile(formData.code, fileBase64);
                    if (!uploadRes.success) {
                        alert(uploadRes.error);
                        return;
                    }
                }
                
                await updateLetterTemplate(formData.id, {
                    name: formData.name,
                    code: formData.code,
                    ...(fileBase64 ? { fileUrl: `/templates/${formData.code}.docx` } : {}),
                    variables: variablesArray,
                    formSchema: formFields
                });
            } else {
                // CREATE NEW TEMPLATE
                if (!fileBase64) {
                    alert("Harap unggah file template .docx terlebih dahulu.");
                    setSaving(false);
                    return;
                }
                const uploadRes = await uploadTemplateFile(formData.code, fileBase64);
                if (!uploadRes.success) {
                    alert(uploadRes.error);
                    return;
                }

                await createLetterTemplate({
                    name: formData.name,
                    code: formData.code,
                    fileUrl: `/templates/${formData.code}.docx`,
                    variables: variablesArray,
                    formSchema: formFields
                });
            }
            
            setShowModal(false);
            setFileName("");
            setFileBase64("");
            setFormFields([]);
            setFormData({ id: "", name: "", code: "", fileUrl: "", variables: "", instruction: "" });
            loadTemplates();
            alert("Template berhasil ditambahkan ke repository.");
        } catch (error: any) {
            console.error(error);
            alert("Terjadi kesalahan saat menyimpan: " + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus template ini?")) return;
        
        try {
            const res = await deleteLetterTemplate(id);
            if (!res.success) {
                alert("Gagal menghapus template: " + res.error);
                return;
            }
            alert("Template berhasil dihapus.");
            loadTemplates();
        } catch (error) {
            alert("Terjadi kesalahan saat menghapus template.");
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Pengelolaan Master Surat & Form</h1>
                    <p className="text-slate-500 text-sm mt-1">Buat, uji coba, dan kelola form dinamis untuk tiap jenis surat.</p>
                </div>
                <button 
                    onClick={() => {
                        setFormData({ id: "", name: "", code: "", fileUrl: "", variables: "", instruction: "" });
                        setFormFields([]);
                        setFileName("");
                        setFileBase64("");
                        setShowModal(true);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
                >
                    <Plus size={16} /> Buat Form / Template Baru
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-4">
                <div className="bg-amber-100 p-2 rounded-xl text-amber-600 mt-0.5">
                    <Info size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-amber-900 text-sm">PANDUAN PEMBUATAN FORM</h3>
                    <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                        Anda dapat merancang form dinamis (Teks, Tanggal, dll) yang nanti akan diisi oleh Kasi Pelayanan/Warga. Form ini akan otomatis dipetakan ke dalam template dokumen Word (.docx) saat dicetak.
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
                                            <button 
                                                className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1.5 border border-slate-200 hover:border-blue-200"
                                                title="Lihat rancangan file .docx"
                                            >
                                                <FileText size={14} /> Lihat Surat
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setFormData({
                                                        id: tpl.id,
                                                        name: tpl.name,
                                                        code: tpl.code,
                                                        fileUrl: tpl.fileUrl,
                                                        variables: tpl.variables ? tpl.variables.join(", ") : "",
                                                        instruction: ""
                                                    });
                                                    setFormFields(tpl.formSchema || []);
                                                    setShowModal(true);
                                                }}
                                                className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all flex items-center gap-1.5 border border-slate-200 hover:border-amber-200"
                                                title="Edit struktur form input"
                                            >
                                                <Settings size={14} /> Lihat / Edit Form
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setShowTestModal(tpl.id);
                                                    const initData: any = {};
                                                    (tpl.formSchema || []).forEach((v: any) => initData[v.name] = "");
                                                    setTestData(initData);
                                                }}
                                                className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex items-center gap-1.5 border border-slate-200 hover:border-indigo-200"
                                            >
                                                <Play size={14} /> Uji Coba Form
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(tpl.id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Hapus Master"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileType size={32} />
                                </div>
                                <p className="text-slate-500 font-medium text-sm">Belum ada Master Surat & Form yang dibuat.</p>
                                <p className="text-slate-400 text-xs mt-1">Klik "Buat Form / Template Baru" di pojok kanan atas.</p>
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
                    <div className="bg-white rounded-[3rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 md:p-10 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Template Baru</h2>
                                <p className="text-slate-500 text-xs font-medium">Unggah file .docx standar pemerintah.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 overflow-y-auto custom-scrollbar">
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
                            <div className="space-y-4 mt-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                                    <span>Form Builder (Isian Kasi Pelayanan)</span>
                                </label>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                                    {formFields.length === 0 ? (
                                        <p className="text-xs text-slate-400 text-center py-4">Belum ada field khusus. (Otomatis ditambahkan dari Scan AI atau klik + Tambah)</p>
                                    ) : (
                                        formFields.map((field, i) => (
                                            <div key={i} className="flex flex-col md:flex-row gap-2 md:items-center bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                                                <input placeholder="Label (ex: Nama Usaha)" value={field.label} onChange={e => updateField(i, 'label', e.target.value)} className="w-full md:flex-[2] p-2 text-xs font-bold rounded-lg border-none bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                                <input placeholder="Key (ex: nama_usaha)" value={field.name} onChange={e => updateField(i, 'name', e.target.value)} className="w-full md:flex-[2] p-2 text-xs rounded-lg border-none bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-500 font-mono" />
                                                <div className="flex gap-2 w-full md:flex-1">
                                                    <select value={field.type} onChange={e => updateField(i, 'type', e.target.value)} className="flex-1 p-2 text-xs rounded-lg border-none bg-slate-50 font-bold text-slate-700 outline-none">
                                                        <option value="text">Teks Singkat</option>
                                                        <option value="textarea">Teks Panjang</option>
                                                        <option value="date">Tanggal</option>
                                                    </select>
                                                    <button type="button" onClick={() => removeField(i)} className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg transition-colors shrink-0"><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <button type="button" onClick={addField} className="text-xs font-black text-blue-600 bg-blue-100/50 hover:bg-blue-100 px-4 py-3 rounded-xl w-full text-center transition-colors border border-blue-200 border-dashed">
                                        + Tambah Kolom Isian
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instruksi Khusus AI (Opsional)</label>
                                <textarea 
                                    placeholder="Contoh: Tolong cari juga isian yang menggunakan format Titik Dua lalu digarisbawahi."
                                    value={formData.instruction} 
                                    onChange={e => setFormData({...formData, instruction: e.target.value})} 
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-950 resize-none h-24" 
                                />
                            </div>
                            
                            <label className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center flex flex-col items-center gap-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer relative">
                                <input 
                                    type="file" 
                                    accept=".docx" 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                />
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                    <Upload size={32} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800">
                                        {fileName ? `File: ${fileName}` : formData.id ? `File .docx saat ini: ${formData.fileUrl.split('/').pop()}` : "Klik untuk Unggah .docx"}
                                    </p>
                                    <p className="text-xs text-slate-400 font-bold mt-1">
                                        {fileName ? "Klik lagi untuk mengganti file" : "Maksimal ukuran file: 5MB"}
                                    </p>
                                </div>
                            </label>

                            {fileBase64 && (
                                <button 
                                    type="button" 
                                    onClick={handleScanAI} 
                                    disabled={isScanning || saving} 
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isScanning ? (
                                        <><Loader2 className="animate-spin" size={20} /> AI SEDANG MEMINDAI DOKUMEN...</>
                                    ) : (
                                        <><Sparkles size={20} /> SCAN OTOMATIS DENGAN AI</>
                                    )}
                                </button>
                            )}

                            <button type="submit" disabled={saving || isScanning} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4">
                                {saving ? <Loader2 className="animate-spin" size={24} /> : "Simpan Template"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* TEST TEMPLATE MODAL */}
            {showTestModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowTestModal(null)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-10 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Uji Coba Form</h2>
                                <p className="text-slate-500 text-xs font-medium">Input data acak untuk melihat hasil generate.</p>
                            </div>
                            <button onClick={() => setShowTestModal(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-10 space-y-6 overflow-y-auto">
                            {templates.find(t => t.id === showTestModal)?.formSchema && templates.find(t => t.id === showTestModal)?.formSchema.map((field: any, idx: number) => (
                                <div key={idx} className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea 
                                            rows={3}
                                            value={testData[field.name] || ""}
                                            onChange={e => setTestData({...testData, [field.name]: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-800 outline-none resize-none"
                                        ></textarea>
                                    ) : field.type === 'date' ? (
                                        <input 
                                            type="date"
                                            value={testData[field.name] || ""}
                                            onChange={e => setTestData({...testData, [field.name]: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-800 outline-none"
                                        />
                                    ) : (
                                        <input 
                                            type="text"
                                            value={testData[field.name] || ""}
                                            onChange={e => setTestData({...testData, [field.name]: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-800 outline-none"
                                        />
                                    )}
                                </div>
                            ))}

                            <button 
                                type="button" 
                                onClick={async () => {
                                    setIsTesting(true);
                                    try {
                                        const { generateTestTemplate } = await import("@/actions/template-test");
                                        const res = await generateTestTemplate(showTestModal, testData);
                                        if (!res.success) {
                                            alert("Gagal uji coba: " + res.error);
                                            return;
                                        }
                                        
                                        const link = document.createElement("a");
                                        link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${res.base64}`;
                                        link.download = res.filename || "Uji_Coba.docx";
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        
                                    } catch (err) {
                                        alert("Gagal mengunduh hasil uji coba.");
                                    } finally {
                                        setIsTesting(false);
                                    }
                                }}
                                disabled={isTesting} 
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-amber-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                            >
                                {isTesting ? <Loader2 className="animate-spin" size={24} /> : "Generate Uji Coba"}
                            </button>
                        </div>
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
