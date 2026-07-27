"use client";

import { useState, useEffect } from "react";
import { 
    getLetterTemplates, 
    createLetterTemplate, 
    updateLetterTemplate, 
    uploadTemplateFile, 
    deleteLetterTemplate,
    autoGenerateFormFields,
    getWargaListForSurat
} from "@/actions/documents";
import { generateTemplateWithAI } from "@/actions/ai-template";
import SKKMLetterPreview from "@/components/documents/SKKMLetterPreview";
import Link from "next/link";
import { 
    FileText, 
    Plus, 
    Search, 
    FileType, 
    Info, 
    CheckCircle2, 
    X,
    Upload,
    Loader2,
    Settings,
    History,
    Sparkles,
    Play,
    Trash2,
    Eye,
    Download,
    Check,
    ListFilter,
    Printer,
    UserCheck,
    AlertCircle,
    UserPlus
} from "lucide-react";

const SKKM_MASTER_SCHEMA = [
    { label: "1. Nomor Register (Sebelum - Kesra)", name: "no_register", type: "text", placeholder: "Contoh: 012", required: true },
    { label: "2. Nama Lengkap Pemohon", name: "nama", type: "text", required: true },
    { label: "3. NIK (Otomatis & Dikunci)", name: "nik", type: "text", required: true, readonly: true },
    { label: "4. Tempat Lahir", name: "tempat_lahir", type: "text", required: true },
    { label: "5. Tanggal Lahir", name: "tgl_lahir", type: "date", required: true },
    { label: "6. Jenis Kelamin", name: "jenis_kelamin", type: "select", options: "LAKI-LAKI, PEREMPUAN", required: true },
    { label: "7. Kewarganegaraan", name: "kewarganegaraan", type: "select", options: "Indonesia, Asing (WNA)", default: "Indonesia", required: true },
    { label: "8. Agama", name: "agama", type: "select", options: "Islam, Kristen, Katholik, Hindu, Buddha, Khonghucu", required: true },
    { label: "9. Alamat Domisili (Cukup Kp. RT/RW, Suffix Desa & Kec. Otomatis)", name: "alamat", type: "textarea", placeholder: "Contoh: Kp. Ciaruteun RT.002 RW.002", required: true },
    { label: "10. Nama Ayah Kandung", name: "nama_ayah", type: "text", required: true },
    { label: "11. Nama Ibu Kandung", name: "nama_ibu", type: "text", required: true },
    { label: "12. Nomor KK", name: "no_kk", type: "text", required: true },
    { label: "13. Surat Pengantar RT & RW", name: "rt_rw_pengantar", type: "text", placeholder: "002 RW.002", required: true },
    { label: "14. Nomor / Tanggal Surat Pengantar", name: "no_tgl_pengantar", type: "text", placeholder: " /05/06/2026", required: true },
    { label: "15. Keperluan Administrasi Pendidikan Di (Nama Sekolah)", name: "pendidikan_di", type: "text", placeholder: "Contoh: SMA NEGERI 1 CIBUNGBULANG", required: true },
    { label: "16. Penandatangan (DIKUNCI)", name: "nama_penandatangan", type: "text", default: "FAJAR TRI APRIANA", readonly: true, required: true }
];

export default function TemplateRepositoryPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal Visibility States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditFormModal, setShowEditFormModal] = useState<any | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState<any | null>(null);
    const [showTestModal, setShowTestModal] = useState<any | null>(null);
    
    // Form & Processing States
    const [saving, setSaving] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isAutoGenerating, setIsAutoGenerating] = useState(false);
    const [query, setQuery] = useState("");
    
    // Form Data State for Creation
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        code: "",
        fileUrl: "",
        variables: "",
        instruction: ""
    });
    const [fileBase64, setFileBase64] = useState<string>("");
    const [fileName, setFileName] = useState<string>("");

    // Form Builder State (Google Form Style)
    const [formFields, setFormFields] = useState<any[]>([]);
    
    // Test Form Data & Warga Integration State
    const [testData, setTestData] = useState<any>({});
    const [savedPreviewData, setSavedPreviewData] = useState<any>(null);
    const [wargaList, setWargaList] = useState<any[]>([]);
    const [selectedWargaId, setSelectedWargaId] = useState<string>("");
    const [nikSearchQuery, setNikSearchQuery] = useState<string>("");
    const [showWargaDropdown, setShowWargaDropdown] = useState<boolean>(false);

    useEffect(() => {
        loadTemplates();
        loadWargaList();
    }, []);

    async function loadTemplates() {
        setLoading(true);
        const data = await getLetterTemplates();
        setTemplates(data);
        setLoading(false);
    }

    async function loadWargaList() {
        const list = await getWargaListForSurat();
        setWargaList(list);
    }

    const handleSelectWarga = (wargaId: string) => {
        setSelectedWargaId(wargaId);
        if (!wargaId) return;

        const w = wargaList.find(item => item.id === wargaId);
        if (w) {
            let tglFormatted = "";
            if (w.tanggalLahir) {
                try {
                    tglFormatted = new Date(w.tanggalLahir).toISOString().split('T')[0];
                } catch (e) {}
            }

            const rtStr = w.rt ? String(w.rt).padStart(3, '0') : "002";
            const rwStr = w.rw ? String(w.rw).padStart(3, '0') : "002";

            let cleanAlamat = w.alamat || `Kp. Ciaruteun RT.${rtStr} RW.${rwStr}`;
            cleanAlamat = cleanAlamat.replace(/desa\s+cimanggu\s+i.*/i, '').trim();

            setTestData((prev: any) => ({
                ...prev,
                warga_id: w.id,
                nama: w.namaLengkap || "",
                nik: w.nik || "",
                jenis_kelamin: w.jenisKelamin ? w.jenisKelamin : "Laki-Laki",
                tempat_lahir: w.tempatLahir || "Bogor",
                tgl_lahir: tglFormatted,
                kewarganegaraan: "Indonesia",
                agama: w.agama || "Islam",
                alamat: cleanAlamat,
                nama_ayah: w.namaAyah || "",
                nama_ibu: w.namaIbu || "",
                no_kk: w.noKK || "",
                rt_rw_pengantar: `${rtStr} RW.${rwStr}`,
                no_tgl_pengantar: prev.no_tgl_pengantar || `       /05/06/2026`,
                no_register: prev.no_register || "",
                pendidikan_di: prev.pendidikan_di || "SMA NEGERI 1 CIBUNGBULANG",
                tanggal_surat: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
                nama_penandatangan: "FAJAR TRI APRIANA"
            }));
        }
    };

    const addField = () => {
        setFormFields([
            ...formFields, 
            { label: "", name: "", type: "text", options: "", required: true }
        ]);
    };

    const updateField = (index: number, key: string, value: any) => {
        const newFields = [...formFields];
        newFields[index][key] = value;
        if (key === 'label' && !newFields[index].name) {
            newFields[index].name = value.toLowerCase().replace(/[^a-z0-9]/g, '_');
        }
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
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            if (!formData.name) {
                setFormData(prev => ({ 
                    ...prev, 
                    name: nameWithoutExt,
                    code: nameWithoutExt.toUpperCase().replace(/[^A-Z0-9_]/g, "_")
                }));
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                setFileBase64(base64);
            };
            reader.readAsDataURL(file);
        }
    };

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

            setFormData(prev => ({
                ...prev,
                name: res.data.name || prev.name,
                code: res.data.code || prev.code,
                variables: Array.isArray(res.data.variables) ? res.data.variables.join(", ") : res.data.variables
            }));
            
            if (res.data.variables && Array.isArray(res.data.variables)) {
                setFormFields(res.data.variables.map((v: string) => ({
                    label: v.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    name: v,
                    type: v.includes('tanggal') || v.includes('tgl') ? 'date' : 'text',
                    options: '',
                    required: true
                })));
            }
            
            if (res.data.modifiedBase64) {
                setFileBase64(res.data.modifiedBase64);
            }
            alert("AI berhasil mengidentifikasi variabel dan membuatkan rancangan form otomatis!");
        } catch (error) {
            alert("Gagal menghubungi AI.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (!fileBase64) {
                alert("Harap unggah file template .docx terlebih dahulu.");
                setSaving(false);
                return;
            }

            const derivedName = formData.name || fileName.replace(/\.[^/.]+$/, "") || "Surat Keterangan";
            const derivedCode = (formData.code || fileName.replace(/\.[^/.]+$/, "") || "SURAT").toUpperCase().replace(/[^A-Z0-9_]/g, "_");

            const uploadRes = await uploadTemplateFile(derivedCode, fileBase64);
            if (!uploadRes.success) {
                alert(uploadRes.error);
                setSaving(false);
                return;
            }

            const variablesArray = formData.variables 
                ? (typeof formData.variables === 'string' ? formData.variables.split(',').map(v => v.trim()) : formData.variables)
                : [];

            await createLetterTemplate({
                name: derivedName,
                code: derivedCode,
                fileUrl: `/templates/${derivedCode}.docx`,
                variables: variablesArray,
                formSchema: formFields
            });
            
            setShowCreateModal(false);
            setFileName("");
            setFileBase64("");
            setFormFields([]);
            setFormData({ id: "", name: "", code: "", fileUrl: "", variables: "", instruction: "" });
            loadTemplates();
            alert("Template & Form Surat berhasil ditambahkan!");
        } catch (error: any) {
            console.error(error);
            alert("Terjadi kesalahan saat menyimpan: " + (error.message || error));
        } finally {
            setSaving(false);
        }
    };

    const handleSaveFormSchema = async () => {
        if (!showEditFormModal) return;
        setSaving(true);
        try {
            await updateLetterTemplate(showEditFormModal.id, {
                name: formData.name,
                code: formData.code,
                formSchema: formFields
            });

            setShowEditFormModal(null);
            loadTemplates();
            alert("Form Isian Surat berhasil diperbarui!");
        } catch (error: any) {
            alert("Gagal menyimpan form: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAutoGenerate = async (templateId: string) => {
        setIsAutoGenerating(true);
        try {
            const res = await autoGenerateFormFields(templateId);
            if (!res.success || !res.fields) {
                alert(res.error || "Gagal meng-generate kolom form.");
                return;
            }
            setFormFields(res.fields);
            setShowEditFormModal((prev: any) => prev ? { ...prev, formSchema: res.fields } : prev);
            loadTemplates();
            alert(`AI Berhasil! Ditemukan ${res.fields.length} kolom form otomatis dari template.`);
        } catch (error: any) {
            alert("Terjadi kesalahan: " + error.message);
        } finally {
            setIsAutoGenerating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus template surat ini?")) return;
        
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

    const filteredTemplates = templates.filter(t => 
        t.name?.toLowerCase().includes(query.toLowerCase()) || 
        t.code?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Pengelolaan Master Surat & Form</h1>
                    <p className="text-slate-500 text-sm mt-1">Buat, rancang form dinamis, dan uji coba pencetakan dokumen resmi desa.</p>
                </div>
                <button 
                    onClick={() => {
                        setFormData({ id: "", name: "", code: "", fileUrl: "", variables: "", instruction: "" });
                        setFormFields([]);
                        setFileName("");
                        setFileBase64("");
                        setShowCreateModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                    <Plus size={18} /> Buat Form / Template Baru
                </button>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-4">
                <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600 mt-0.5 shrink-0">
                    <Info size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wider">Panduan Pengelolaan Surat</h3>
                    <p className="text-amber-800 text-xs mt-1 leading-relaxed font-medium">
                        1. Klik <b>"Lihat Surat"</b> untuk memeriksa format resmi dokumen kosong atau draf hasil uji coba.<br />
                        2. Klik <b>"Lihat / Edit Form"</b> untuk merancang form isian dinamis (Teks, Dropdown, Tanggal, dll) ala Google Form.<br />
                        3. Klik <b>"Uji Coba Form"</b> untuk mensimulasikan pengisian data warga dan mengunduh surat yang langsung jadi.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 min-h-[500px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800">Daftar Template Surat Aktif</h3>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    type="text" 
                                    placeholder="Cari template..." 
                                    className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : filteredTemplates.length > 0 ? (
                            <div className="space-y-4">
                                {filteredTemplates.map((tpl) => (
                                    <div key={tpl.id} className="p-5 rounded-[1.8rem] border border-slate-100 hover:border-blue-200 hover:bg-slate-50/50 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                                <FileType size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-800 leading-none mb-1">{tpl.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{tpl.code}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold">• Versi {tpl.version}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold">• {tpl.formSchema?.length || 0} Isian Form</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                            <button 
                                                onClick={() => setShowPreviewModal(tpl)}
                                                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 hover:border-blue-200"
                                                title="Lihat format surat kosong atau hasil cetak"
                                            >
                                                <Eye size={14} className="text-blue-500" /> Lihat Surat
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setShowEditFormModal(tpl);
                                                    setFormData({
                                                        id: tpl.id,
                                                        name: tpl.name,
                                                        code: tpl.code,
                                                        fileUrl: tpl.fileUrl,
                                                        variables: tpl.variables ? tpl.variables.join(", ") : "",
                                                        instruction: ""
                                                    });
                                                    setFormFields(tpl.formSchema || []);
                                                }}
                                                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 hover:border-amber-200"
                                                title="Edit rancangan kolom form isian"
                                            >
                                                <Settings size={14} className="text-amber-500" /> Lihat / Edit Form
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    let currentTpl = tpl;
                                                    if (!tpl.formSchema || tpl.formSchema.length === 0) {
                                                        const res = await autoGenerateFormFields(tpl.id);
                                                        if (res.success && res.fields) {
                                                            currentTpl = { ...tpl, formSchema: res.fields };
                                                            loadTemplates();
                                                        }
                                                    }
                                                    setShowTestModal(currentTpl);
                                                    const initData: any = {};
                                                    (currentTpl.formSchema || []).forEach((field: any) => {
                                                        initData[field.name] = "";
                                                    });
                                                    setTestData(initData);
                                                }}
                                                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 hover:border-emerald-200"
                                                title="Simulasi isi form & cetak surat"
                                            >
                                                <Play size={14} className="text-emerald-500" /> Uji Coba Form
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(tpl.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Hapus Master"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileType size={32} />
                                </div>
                                <p className="text-slate-600 font-bold text-sm">Belum ada Master Surat & Form yang dibuat.</p>
                                <p className="text-slate-400 text-xs mt-1">Klik tombol "+ Buat Form / Template Baru" di pojok kanan atas.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-xl">
                        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                            <History size={20} className="text-amber-400" /> Version Control
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                            Setiap perubahan format dokumen dan desain form akan disinkronkan secara otomatis ke seluruh perangkat aparat desa.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span className="text-xs font-bold">Sinkronisasi Cloud Aktif</span>
                            </div>
                            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                                <CheckCircle2 size={16} className="text-blue-400" />
                                <span className="text-xs font-bold">Generator .DOCX Siap Digunakan</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Statistik Persuratan</h3>
                        <div className="space-y-4">
                            <StatRow label="Total Master Template" value={templates.length.toString()} />
                            <StatRow label="Surat Dicetak (Bln Ini)" value="128" />
                            <StatRow label="Waktu Cetak Rata-rata" value="1.2s" />
                        </div>
                    </div>
                </div>
            </div>

            {showPreviewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowPreviewModal(null)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-4xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-800">{showPreviewModal.name}</h2>
                                    <p className="text-slate-500 text-xs font-medium">Pratinjau Format Resmi & Download Template ({showPreviewModal.code})</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => window.print()} 
                                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                                >
                                    <Printer size={14} /> Cetak Format Surat
                                </button>
                                <button onClick={() => setShowPreviewModal(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="bg-slate-100 p-4 md:p-6 rounded-3xl border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                        <Eye size={16} className="text-blue-600" /> Tampilan Dokumen Cetak Resmi (HTML)
                                    </h4>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">Format Resmi Desa Cimanggu I</span>
                                </div>
                                
                                <SKKMLetterPreview data={savedPreviewData || testData || {
                                    no_register: "012",
                                    nama: "MUHAMAD RIZKY YUDAYANA",
                                    nik: "3201163101110003",
                                    jenis_kelamin: "Laki-Laki",
                                    tempat_lahir: "Bogor",
                                    tgl_lahir: "2011-01-31",
                                    kewarganegaraan: "Indonesia",
                                    agama: "Islam",
                                    alamat: "Kp. Ciaruteun RT.002 RW.002",
                                    nama_ayah: "ANDRI",
                                    nama_ibu: "WIDIA SILVIA",
                                    no_kk: "3201162210120016",
                                    rt_rw_pengantar: "002 RW.002",
                                    no_tgl_pengantar: "       /05/06/2026",
                                    pendidikan_di: "SMA NEGERI 1 CIBUNGBULANG",
                                    tanggal_surat: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
                                    nama_penandatangan: "FAJAR TRI APRIANA"
                                }} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button 
                                    onClick={async () => {
                                        setIsTesting(true);
                                        try {
                                            const { generateTestTemplate } = await import("@/actions/template-test");
                                            const res = await generateTestTemplate(showPreviewModal.id, {});
                                            if (!res.success) {
                                                alert("Gagal mengunduh contoh surat: " + res.error);
                                                return;
                                            }
                                            const link = document.createElement("a");
                                            link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${res.base64}`;
                                            link.download = res.filename || `Sample_${showPreviewModal.code}.docx`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        } catch (e: any) {
                                            alert("Gagal mengunduh draf sample: " + e.message);
                                        } finally {
                                            setIsTesting(false);
                                        }
                                    }}
                                    disabled={isTesting}
                                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 border border-blue-200"
                                >
                                    {isTesting ? <Loader2 className="animate-spin" size={16} /> : <><Download size={16} /> Unduh File Master Template (.docx)</>}
                                </button>
                                <button 
                                    onClick={() => {
                                        const prevModal = showPreviewModal;
                                        setShowPreviewModal(null);
                                        setShowTestModal(prevModal);
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    <Play size={16} /> Buka Form Uji Coba Pengisian
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditFormModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowEditFormModal(null)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 md:p-8 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                                    <Settings size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800">Desainer Form: {showEditFormModal.name}</h2>
                                    <p className="text-slate-500 text-xs font-medium">Rancang kolom input yang akan diisi pengguna saat membuat surat ini.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEditFormModal(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Surat</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kode Shortcode</label>
                                    <input 
                                        type="text" 
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                        <ListFilter size={16} className="text-amber-500" /> Kolom Input Form (Google Form Builder)
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleAutoGenerate(showEditFormModal.id)}
                                            disabled={isAutoGenerating}
                                            className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                        >
                                            {isAutoGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-purple-600" />}
                                            <span>{isAutoGenerating ? "Memindai..." : "Auto-Generate AI"}</span>
                                        </button>
                                        <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-md">{formFields.length} Kolom</span>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 max-h-96 overflow-y-auto custom-scrollbar">
                                    {formFields.length === 0 ? (
                                        <div className="text-center py-10 space-y-4">
                                            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                                                <Sparkles size={28} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">Belum ada kolom form yang dikonfigurasi.</p>
                                                <p className="text-[11px] text-slate-400 font-medium mt-1">Sistem AI dapat memindai tag template secara otomatis untuk membuatkan form.</p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAutoGenerate(showEditFormModal.id)}
                                                    disabled={isAutoGenerating}
                                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                                                >
                                                    {isAutoGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                                    <span>GENERATE KOLOM FORM DENGAN AI</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={addField}
                                                    className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-2xl text-xs font-bold transition-all"
                                                >
                                                    + Tambah Kolom Manual
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        formFields.map((field, i) => (
                                            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3 relative group">
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <div className="flex-1 space-y-1">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Label Pertanyaan / Form</label>
                                                        <input 
                                                            placeholder="Contoh: Jenis Usaha" 
                                                            value={field.label} 
                                                            onChange={e => updateField(i, 'label', e.target.value)} 
                                                            className="w-full p-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500/20 outline-none" 
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Kode Tag {"{var}"}</label>
                                                        <input 
                                                            placeholder="Contoh: jenis_usaha" 
                                                            value={field.name} 
                                                            onChange={e => updateField(i, 'name', e.target.value)} 
                                                            className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-600" 
                                                        />
                                                    </div>
                                                    <div className="w-full sm:w-40 space-y-1">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Tipe Input</label>
                                                        <select 
                                                            value={field.type} 
                                                            onChange={e => updateField(i, 'type', e.target.value)} 
                                                            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none"
                                                        >
                                                            <option value="text">Teks Singkat</option>
                                                            <option value="textarea">Teks Panjang</option>
                                                            <option value="select">Pilihan Dropdown</option>
                                                            <option value="date">Tanggal</option>
                                                            <option value="number">Angka</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {field.type === 'select' && (
                                                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 space-y-1">
                                                        <label className="text-[9px] font-bold text-amber-800 uppercase">Opsi Pilihan Dropdown (Pisahkan dengan Koma)</label>
                                                        <input 
                                                            placeholder="Contoh: Dagang, Pertanian, Jasa, Peternakan" 
                                                            value={field.options || ""} 
                                                            onChange={e => updateField(i, 'options', e.target.value)} 
                                                            className="w-full p-2 text-xs font-bold rounded-lg border border-amber-200 bg-white text-slate-800 outline-none" 
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={field.required !== false} 
                                                            onChange={e => updateField(i, 'required', e.target.checked)} 
                                                            className="rounded text-amber-600 focus:ring-amber-500" 
                                                        />
                                                        <span className="text-[10px] font-bold text-slate-500">Wajib Diisi (Required)</span>
                                                    </label>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeField(i)} 
                                                        className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                                                    >
                                                        <Trash2 size={14}/> Hapus Kolom
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    <button 
                                        type="button" 
                                        onClick={addField} 
                                        className="text-xs font-black text-amber-700 bg-amber-100/60 hover:bg-amber-100 px-4 py-3.5 rounded-2xl w-full text-center transition-colors border border-amber-200 border-dashed flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} /> Tambah Kolom Form Baru
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="button"
                                onClick={handleSaveFormSchema}
                                disabled={saving}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Check size={18} /> Simpan Perubahan Form</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showTestModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowTestModal(null)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-6xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                        <div className="p-6 border-b border-slate-100 bg-emerald-50/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                                    <Play size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-800">Uji Coba Pengisian Form & Generator Real-time</h2>
                                    <p className="text-slate-500 text-xs font-medium">{showTestModal.name} ({showTestModal.code})</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => window.print()}
                                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                                >
                                    <Printer size={14} /> Cetak HTML
                                </button>
                                <button onClick={() => setShowTestModal(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden flex-1">
                            <div className="lg:col-span-6 p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar border-r border-slate-100 bg-slate-50/50">
                                
                                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-5 rounded-2xl border border-blue-200/80 space-y-3 relative">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                                            <Search size={16} className="text-blue-600" /> Cari Berdasarkan NIK / Nama Warga
                                        </label>
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                                            {wargaList.length} Terdata
                                        </span>
                                    </div>
                                    
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={nikSearchQuery}
                                            onChange={(e) => {
                                                setNikSearchQuery(e.target.value);
                                                setShowWargaDropdown(true);
                                            }}
                                            onFocus={() => setShowWargaDropdown(true)}
                                            placeholder="Ketik NIK 16 Digit atau Nama Warga..."
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-blue-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
                                        />

                                        {showWargaDropdown && (
                                            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                                {wargaList.filter(w => 
                                                    !nikSearchQuery || 
                                                    w.nik?.toLowerCase().includes(nikSearchQuery.toLowerCase()) || 
                                                    w.namaLengkap?.toLowerCase().includes(nikSearchQuery.toLowerCase())
                                                ).slice(0, 10).map((w) => (
                                                    <button
                                                        key={w.id}
                                                        type="button"
                                                        onClick={() => {
                                                            handleSelectWarga(w.id);
                                                            setNikSearchQuery(`${w.nik} - ${w.namaLengkap}`);
                                                            setShowWargaDropdown(false);
                                                        }}
                                                        className="w-full text-left p-2.5 hover:bg-blue-50 rounded-xl transition-all flex items-center justify-between text-xs"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-slate-800">{w.namaLengkap}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono">NIK: {w.nik} | RT.{String(w.rt||'').padStart(3,'0')}/RW.{String(w.rw||'').padStart(3,'0')}</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-lg">Pilih</span>
                                                    </button>
                                                ))}

                                                {wargaList.filter(w => 
                                                    !nikSearchQuery || 
                                                    w.nik?.toLowerCase().includes(nikSearchQuery.toLowerCase()) || 
                                                    w.namaLengkap?.toLowerCase().includes(nikSearchQuery.toLowerCase())
                                                ).length === 0 && (
                                                    <div className="p-3 text-center text-xs text-slate-500 font-medium">
                                                        Warga dengan NIK / Nama tersebut tidak ditemukan.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {wargaList.length === 0 && (
                                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2 text-amber-800 text-xs">
                                            <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-bold">Warga Belum Terdaftar Di Data Kependudukan Desa Cimanggu I.</p>
                                                <p className="text-[11px] mt-0.5 text-amber-700">Wajib menginput Data Kependudukan terlebih dahulu di menu Data Warga.</p>
                                                <Link href="/dashboard/warga" className="inline-flex items-center gap-1 font-black text-blue-700 hover:underline mt-1">
                                                    <UserPlus size={12} /> Buka Menu Data Warga
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {((showTestModal.code === "SKKM" || !showTestModal.formSchema || showTestModal.formSchema.length === 0) 
                                            ? SKKM_MASTER_SCHEMA 
                                            : showTestModal.formSchema
                                        ).map((field: any, idx: number) => {
                                                const isLocked = field.readonly || field.name === 'nik' || field.name === 'nama_penandatangan';
                                                const isFullWidth = field.type === 'textarea' || field.name === 'no_register' || field.name === 'pendidikan_di' || field.name === 'warga_id' || field.name === 'alamat';

                                                return (
                                                    <div key={idx} className={`space-y-1 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm ${isFullWidth ? 'md:col-span-2' : ''}`}>
                                                        <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                                                            <span>{field.label}</span>
                                                            <span className="text-[9px] text-slate-400 font-mono">{"{" + field.name + "}"}</span>
                                                        </label>

                                                        {field.type === 'select' ? (
                                                            <select 
                                                                value={testData[field.name] || field.default || ""} 
                                                                onChange={e => setTestData({...testData, [field.name]: e.target.value})}
                                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                            >
                                                                <option value="">-- Pilih {field.label} --</option>
                                                                {(field.options ? field.options.split(',').map((o: string) => o.trim()) : []).map((opt: string, i: number) => (
                                                                    <option key={i} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        ) : field.type === 'textarea' ? (
                                                            <textarea 
                                                                rows={2}
                                                                value={testData[field.name] || ""}
                                                                onChange={e => setTestData({...testData, [field.name]: e.target.value})}
                                                                placeholder={field.placeholder || `Masukkan ${field.label}...`}
                                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                                                            />
                                                        ) : field.type === 'date' ? (
                                                            <input 
                                                                type="date"
                                                                value={testData[field.name] || ""}
                                                                onChange={e => setTestData({...testData, [field.name]: e.target.value})}
                                                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                            />
                                                        ) : (
                                                            <input 
                                                                type="text"
                                                                disabled={isLocked}
                                                                value={field.name === 'nama_penandatangan' ? 'FAJAR TRI APRIANA' : (testData[field.name] ?? field.default ?? "")}
                                                                onChange={e => setTestData({...testData, [field.name]: e.target.value})}
                                                                placeholder={field.placeholder || `Masukkan ${field.label}...`}
                                                                className={`w-full px-3 py-2 rounded-xl text-xs font-bold outline-none border ${
                                                                    isLocked 
                                                                        ? "bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed font-mono" 
                                                                        : "bg-slate-50 border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                                                                }`}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setSavedPreviewData({ ...testData });
                                        const currentTpl = showTestModal;
                                        setShowTestModal(null);
                                        setShowPreviewModal(currentTpl);
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} /> Simpan Hasil Uji Coba & Lihat Di "Lihat Surat"
                                </button>
                            </div>

                            <div className="lg:col-span-6 p-6 md:p-8 bg-slate-200/70 overflow-y-auto custom-scrollbar flex flex-col justify-start">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                        <Eye size={16} className="text-emerald-600" /> Pratinjau Surat Real-time (HTML)
                                    </h4>
                                    <span className="text-[10px] bg-white text-slate-700 font-bold px-2 py-0.5 rounded shadow-sm">
                                        Desa Cimanggu I
                                    </span>
                                </div>

                                <div className="scale-90 origin-top transform transition-all">
                                    <SKKMLetterPreview data={testData} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Buat Master Template Baru</h2>
                                <p className="text-slate-500 text-xs font-medium">Unggah file .docx standar pemerintah & scan dengan AI.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateSubmit} className="p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Jenis Surat</label>
                                <input 
                                    placeholder="Contoh: Surat Keterangan Usaha"
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 outline-none" 
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kode Shortcode (Unik)</label>
                                <input 
                                    placeholder="Contoh: SKU"
                                    value={formData.code} 
                                    onChange={e => setFormData({...formData, code: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 outline-none" 
                                />
                            </div>

                            <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center gap-3 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer relative">
                                <input 
                                    type="file" 
                                    accept=".docx" 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                />
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                    <Upload size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-800">
                                        {fileName ? `File Terpilih: ${fileName}` : "Klik untuk Unggah File Template (.docx)"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                        {fileName ? "Klik lagi untuk mengganti file" : "Format dokumen Word standar pemerintah (.docx)"}
                                    </p>
                                </div>
                            </label>

                            {fileBase64 && (
                                <button 
                                    type="button" 
                                    onClick={handleScanAI} 
                                    disabled={isScanning || saving} 
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isScanning ? (
                                        <><Loader2 className="animate-spin" size={16} /> AI SEDANG MEMINDAI DOKUMEN...</>
                                    ) : (
                                        <><Sparkles size={16} /> SCAN OTOMATIS DENGAN AI</>
                                    )}
                                </button>
                            )}

                            <button 
                                type="submit" 
                                disabled={saving || isScanning} 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : "Simpan Master Template"}
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
        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
            <span className="text-xs font-bold text-slate-400">{label}</span>
            <span className="text-xs font-black text-slate-800">{value}</span>
        </div>
    );
}
