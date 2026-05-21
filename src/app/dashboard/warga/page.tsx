"use client";

import { useState, useEffect } from "react";
import { searchWarga, addWarga, updateWarga, deleteWarga } from "@/actions/village";
import { exportWargaExcel, getLetterTemplates, generateSurat } from "@/actions/documents";
import { 
    Users, 
    Search, 
    Filter, 
    ChevronRight, 
    UserPlus, 
    Download,
    Calendar,
    MapPin,
    X,
    Loader2,
    Edit2,
    Trash2,
    Printer,
    FileSpreadsheet,
    FileText,
    AlertCircle,
    Info
} from "lucide-react";

export default function WargaManagementPage() {
    const [query, setQuery] = useState("");
    const [warga, setWarga] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [selectedWarga, setSelectedWarga] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [printing, setPrinting] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [customVariables, setCustomVariables] = useState<Record<string, string>>({});

    // Filters
    const [filters, setFilters] = useState({
        rt: "",
        rw: "",
        dusun: ""
    });

    const [formData, setFormData] = useState({
        nik: "",
        namaLengkap: "",
        tempatLahir: "",
        tanggalLahir: "",
        jenisKelamin: "LAKI_LAKI",
        alamat: "",
        rt: "",
        rw: "",
        dusun: "Dusun 1",
        agama: "ISLAM",
        statusKawin: "BELUM_KAWIN",
        pekerjaan: ""
    });

    useEffect(() => {
        handleSearch();
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        const data = await getLetterTemplates();
        setTemplates(data);
    };

    const handleSearch = async () => {
        setLoading(true);
        // Combine query with filters if needed in the future
        const data = await searchWarga(query);
        let filtered = data;
        
        if (filters.rt) filtered = filtered.filter(w => w.rt === filters.rt);
        if (filters.rw) filtered = filtered.filter(w => w.rw === filters.rw);
        if (filters.dusun) filtered = filtered.filter(w => w.dusun === filters.dusun);

        setWarga(filtered);
        setLoading(false);
    };

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const res = await exportWargaExcel();
            if (res.success && res.data) {
                const link = document.createElement("a");
                link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.data}`;
                link.download = res.filename || "Data_Warga.xlsx";
                link.click();
            } else {
                alert(res.error);
            }
        } catch (error) {
            alert("Gagal mengekspor data");
        } finally {
            setExporting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                tanggalLahir: new Date(formData.tanggalLahir)
            };

            if (editingId) {
                await updateWarga(editingId, payload);
                alert("Data warga berhasil diperbarui!");
            } else {
                await addWarga(payload);
                alert("Data warga berhasil ditambahkan!");
            }
            
            setShowModal(false);
            setEditingId(null);
            handleSearch();
        } catch (error) {
            alert("Terjadi kesalahan.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({
            nik: item.nik,
            namaLengkap: item.namaLengkap,
            tempatLahir: item.tempatLahir,
            tanggalLahir: new Date(item.tanggalLahir).toISOString().split('T')[0],
            jenisKelamin: item.jenisKelamin,
            alamat: item.alamat,
            rt: item.rt,
            rw: item.rw,
            dusun: item.dusun,
            agama: item.agama,
            statusKawin: item.statusKawin,
            pekerjaan: item.pekerjaan
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus data warga ini?")) return;
        try {
            await deleteWarga(id);
            handleSearch();
        } catch (error) {
            alert("Gagal menghapus data.");
        }
    };

    const handleGenerateLetter = async (templateCode: string, customData: Record<string, string> = {}) => {
        if (!selectedWarga) return;
        setPrinting(templateCode);
        try {
            const res = await generateSurat(templateCode, selectedWarga.id, customData);
            if (res.success && res.data) {
                const link = document.createElement("a");
                link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${res.data}`;
                link.download = res.filename || "Surat.docx";
                link.click();
                setShowPrintModal(false);
                setSelectedTemplate(null);
            } else {
                alert(res.error);
            }
        } catch (error) {
            alert("Gagal membuat surat.");
        } finally {
            setPrinting(null);
        }
    };

    return (
        <div className="space-y-6 pb-20 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Manajemen Kependudukan</h1>
                    <p className="text-slate-500 font-medium mt-1">Kelola, cari, dan ekspor data warga secara real-time.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={handleExportExcel}
                        disabled={exporting}
                        className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                        {exporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} className="text-emerald-600" />} 
                        Export Excel
                    </button>
                    <button 
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                nik: "",
                                namaLengkap: "",
                                tempatLahir: "",
                                tanggalLahir: "",
                                jenisKelamin: "LAKI_LAKI",
                                alamat: "",
                                rt: "",
                                rw: "",
                                dusun: "Dusun 1",
                                agama: "ISLAM",
                                statusKawin: "BELUM_KAWIN",
                                pekerjaan: ""
                            });
                            setShowModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <UserPlus size={18} /> Tambah Warga
                    </button>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            type="text" 
                            placeholder="Cari NIK atau Nama Lengkap..." 
                            className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-900"
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl">
                            <span className="text-[10px] font-black text-slate-400 uppercase">RT</span>
                            <input value={filters.rt} onChange={e => setFilters({...filters, rt: e.target.value})} className="w-10 bg-transparent border-none text-xs font-black text-center focus:ring-0" placeholder="00" />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl">
                            <span className="text-[10px] font-black text-slate-400 uppercase">RW</span>
                            <input value={filters.rw} onChange={e => setFilters({...filters, rw: e.target.value})} className="w-10 bg-transparent border-none text-xs font-black text-center focus:ring-0" placeholder="00" />
                        </div>
                        <select 
                            value={filters.dusun}
                            onChange={e => setFilters({...filters, dusun: e.target.value})}
                            className="bg-slate-50 border-none rounded-2xl px-4 py-2 text-[10px] font-black uppercase focus:ring-0"
                        >
                            <option value="">Semua Dusun</option>
                            <option value="Dusun 1">Dusun 1</option>
                            <option value="Dusun 2">Dusun 2</option>
                            <option value="Dusun 3">Dusun 3</option>
                        </select>
                        <button 
                            onClick={handleSearch}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Filter size={16} /> Terapkan Filter
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-56 bg-slate-50 animate-pulse rounded-[2.5rem]" />
                        ))
                    ) : warga.length > 0 ? warga.map((item) => (
                        <div key={item.id} className="p-7 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group bg-white relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors" />
                            
                            <div className="relative z-10 flex-1">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 text-xl font-black shadow-sm">
                                        {item.namaLengkap.charAt(0)}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(item)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mb-6 min-w-0">
                                    <h3 className="text-base font-black text-slate-800 truncate leading-tight mb-1">{item.namaLengkap}</h3>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{item.nik}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Wilayah</span>
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                            <MapPin size={12} className="text-blue-500" />
                                            RT {item.rt}/RW {item.rw}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Lahir</span>
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                            <Calendar size={12} className="text-amber-500" />
                                            {new Date(item.tanggalLahir).toLocaleDateString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    setSelectedWarga(item);
                                    setShowPrintModal(true);
                                }}
                                className="mt-8 py-3.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all flex items-center justify-center gap-2"
                            >
                                <Printer size={14} /> Cetak Persuratan
                            </button>
                        </div>
                    )) : (
                        <div className="col-span-full py-32 text-center flex flex-col items-center gap-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                <Users size={48} />
                            </div>
                            <div>
                                <p className="text-slate-800 font-black text-lg">Tidak ada data warga.</p>
                                <p className="text-slate-400 text-sm mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PRINT MODAL */}
            {showPrintModal && selectedWarga && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowPrintModal(false)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Cetak Surat Resmi</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">Pilih template untuk: <span className="text-blue-600 font-bold">{selectedWarga.namaLengkap}</span></p>
                            </div>
                            <button onClick={() => { setShowPrintModal(false); setSelectedTemplate(null); }} className="p-3 hover:bg-slate-200 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-10 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {selectedTemplate ? (
                                <div className="space-y-6">
                                    <button onClick={() => setSelectedTemplate(null)} className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 mb-4">
                                        &larr; Kembali ke daftar template
                                    </button>
                                    <h4 className="text-lg font-black text-slate-800">Lengkapi Data: {selectedTemplate.name}</h4>
                                    <div className="space-y-4">
                                        {selectedTemplate.variables?.map((v: string) => (
                                            <div key={v} className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{v.replace(/_/g, ' ')}</label>
                                                <input 
                                                    type="text" 
                                                    value={customVariables[v] || ""} 
                                                    onChange={e => setCustomVariables({...customVariables, [v]: e.target.value})} 
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-950" 
                                                    placeholder={`Masukkan ${v.replace(/_/g, ' ')}...`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => handleGenerateLetter(selectedTemplate.code, customVariables)}
                                        disabled={!!printing}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-4 transition-all"
                                    >
                                        {printing === selectedTemplate.code ? <Loader2 className="animate-spin" size={20} /> : "Cetak Surat Sekarang"}
                                    </button>
                                </div>
                            ) : templates.length > 0 ? templates.map((tpl) => (
                                <button 
                                    key={tpl.id}
                                    onClick={() => {
                                        if (tpl.variables && tpl.variables.length > 0) {
                                            setSelectedTemplate(tpl);
                                            setCustomVariables({});
                                        } else {
                                            handleGenerateLetter(tpl.code);
                                        }
                                    }}
                                    disabled={!!printing}
                                    className="w-full p-6 rounded-[2rem] border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 shadow-sm transition-all">
                                            <FileText size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-sm font-black text-slate-800">{tpl.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Kode: {tpl.code}</p>
                                        </div>
                                    </div>
                                    {printing === tpl.code ? (
                                        <Loader2 className="animate-spin text-blue-600" size={20} />
                                    ) : (
                                        <ChevronRight className="text-slate-300 group-hover:text-blue-600" size={20} />
                                    )}
                                </button>
                            )) : (
                                <div className="py-10 text-center space-y-4">
                                    <AlertCircle className="mx-auto text-slate-200" size={48} />
                                    <p className="text-slate-400 text-sm font-medium">Belum ada template persuratan di repository.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                            <Info size={16} className="text-blue-500 shrink-0" />
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                Dokumen akan diunduh dalam format .docx dan sudah terisi otomatis dengan biodata warga sesuai database.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD/EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-white relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{editingId ? "Update Data Warga" : "Tambah Warga Baru"}</h2>
                                <p className="text-slate-500 font-medium mt-1">Manajemen data kependudukan tingkat RT/RW.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8 custom-scrollbar bg-slate-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput label="NIK (Nomor Induk Kependudukan)" value={formData.nik} onChange={(v: string) => setFormData({...formData, nik: v})} placeholder="Masukkan 16 digit NIK" />
                                <FormInput label="Nama Lengkap" value={formData.namaLengkap} onChange={(v: string) => setFormData({...formData, namaLengkap: v})} placeholder="Sesuai KTP" />
                                <FormInput label="Tempat Lahir" value={formData.tempatLahir} onChange={(v: string) => setFormData({...formData, tempatLahir: v})} />
                                <FormInput label="Tanggal Lahir" type="date" value={formData.tanggalLahir} onChange={(v: string) => setFormData({...formData, tanggalLahir: v})} />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                                    <select value={formData.jenisKelamin} onChange={e => setFormData({...formData, jenisKelamin: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-950">
                                        <option value="LAKI_LAKI">Laki-Laki</option>
                                        <option value="PEREMPUAN">Perempuan</option>
                                    </select>
                                </div>
                                <FormInput label="Pekerjaan" value={formData.pekerjaan} onChange={(v: string) => setFormData({...formData, pekerjaan: v})} />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                                <textarea value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 min-h-[100px] text-slate-950" placeholder="Alamat lengkap domisili..." />
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <FormInput label="RT" value={formData.rt} onChange={(v: string) => setFormData({...formData, rt: v})} centered />
                                <FormInput label="RW" value={formData.rw} onChange={(v: string) => setFormData({...formData, rw: v})} centered />
                                <FormInput label="Dusun" value={formData.dusun} onChange={(v: string) => setFormData({...formData, dusun: v})} />
                            </div>

                            <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={24} /> : (editingId ? "Perbarui Data Warga" : "Simpan Data Warga")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function FormInput({ label, value, onChange, type = "text", placeholder, centered }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    centered?: boolean;
}) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input 
                type={type}
                required 
                placeholder={placeholder}
                value={value} 
                onChange={e => onChange(e.target.value)} 
                className={`w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-950 ${centered ? 'text-center' : ''}`} 
            />
        </div>
    )
}


