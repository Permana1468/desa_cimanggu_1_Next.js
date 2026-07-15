"use client";

import { useState, useEffect, useMemo } from "react";
import { searchWarga, addWarga, updateWarga, deleteWarga } from "@/actions/village";
import { exportWargaExcel, getLetterTemplates, generateSurat } from "@/actions/documents";
import { getFullVillageStructure as getVillageStructure } from "@/actions/rt";
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
    Info,
    Fingerprint, 
    Home as HomeIcon, 
    User as LucideUser, 
    Users as LucideUsers, 
    Heart as HeartIcon, 
    GraduationCap, 
    Users2, 
    Globe, 
    Map as MapIcon, 
    ShieldCheck, 
    Activity as ActivityIcon
} from "lucide-react";
import { WARGA_FIELDS, DEFAULT_WARGA_FORM, isWargaDataIncomplete } from "@/lib/wargaSchema";

function HoverMask({ value }: { value: string }) {
    const [visible, setVisible] = useState(false);
    if (!value) return <span>-</span>;
    const getMasked = (val: string) => {
        if (val.length <= 6) return "*".repeat(val.length);
        return val.substring(0, 6) + "*".repeat(val.length - 6);
    };
    return (
        <span 
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onClick={() => setVisible(!visible)}
            className="cursor-pointer transition-all duration-200 hover:text-blue-600 select-all font-mono"
            title="Arahkan kursor atau klik untuk melihat lengkap"
        >
            {visible ? value : getMasked(value)}
        </span>
    );
}

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
    const [villageStructure, setVillageStructure] = useState<{ dusun: { name: string, rw: { name: string, rt: string[] }[] }[] } | null>(null);

    // Filters
    const [filters, setFilters] = useState({
        rt: "",
        rw: "",
        dusun: ""
    });

    const [formData, setFormData] = useState({
        ...DEFAULT_WARGA_FORM
    });
    const [filterIncomplete, setFilterIncomplete] = useState(false);
    const [sortBy, setSortBy] = useState("default");

    const displayedWarga = useMemo(() => {
        const filtered = warga.filter(w => !filterIncomplete || isWargaDataIncomplete(w));

        const PENDIDIKAN_ORDER: Record<string, number> = {
            "TIDAK_SEKOLAH": 0,
            "SD": 1,
            "SMP": 2,
            "SMA": 3,
            "D3": 4,
            "S1": 5,
            "S2": 6,
            "S3": 7
        };

        return [...filtered].sort((a, b) => {
            if (sortBy === "kk") {
                const kkA = a.noKK || "";
                const kkB = b.noKK || "";
                if (kkA !== kkB) return kkA.localeCompare(kkB);
                const roleOrder: Record<string, number> = {
                    "KEPALA_KELUARGA": 0,
                    "ISTRI": 1,
                    "ANAK": 2,
                    "MERTUA": 3,
                    "ORANG_TUA": 4,
                    "LAINNYA": 5
                };
                const orderA = roleOrder[a.hubunganKeluarga] ?? 99;
                const orderB = roleOrder[b.hubunganKeluarga] ?? 99;
                return orderA - orderB;
            }
            if (sortBy === "umur-asc") {
                const dateA = a.tanggalLahir ? new Date(a.tanggalLahir).getTime() : 0;
                const dateB = b.tanggalLahir ? new Date(b.tanggalLahir).getTime() : 0;
                return dateB - dateA; // Youngest first (most recent date)
            }
            if (sortBy === "umur-desc") {
                const dateA = a.tanggalLahir ? new Date(a.tanggalLahir).getTime() : 0;
                const dateB = b.tanggalLahir ? new Date(b.tanggalLahir).getTime() : 0;
                return dateA - dateB; // Oldest first
            }
            if (sortBy === "pendidikan") {
                const orderA = PENDIDIKAN_ORDER[a.pendidikan || ""] ?? -1;
                const orderB = PENDIDIKAN_ORDER[b.pendidikan || ""] ?? -1;
                return orderB - orderA; // Higher education first
            }
            return a.namaLengkap.localeCompare(b.namaLengkap);
        });
    }, [warga, filterIncomplete, sortBy]);

    const stats = useMemo(() => {
        const total = warga.length;
        const male = warga.filter(w => w.jenisKelamin === "LAKI_LAKI").length;
        const female = warga.filter(w => w.jenisKelamin === "PEREMPUAN").length;
        const incomplete = warga.filter(isWargaDataIncomplete).length;
        return { total, male, female, incomplete };
    }, [warga]);

    useEffect(() => {
        handleSearch();
        loadTemplates();
        loadVillageStructure();
    }, []);

    async function loadVillageStructure() {
        try {
            const data = await getVillageStructure();
            setVillageStructure(data);
        } catch (e) {
            console.error("Failed to load village structure", e);
        }
    }

    async function loadTemplates() {
        const data = await getLetterTemplates();
        setTemplates(data);
    }

    async function handleSearch() {
        setLoading(true);
        // Combine query with filters if needed in the future
        const data = await searchWarga(query);
        let filtered = data;
        
        if (filters.rt) filtered = filtered.filter(w => w.rt === filters.rt);
        if (filters.rw) filtered = filtered.filter(w => w.rw === filters.rw);
        if (filters.dusun) filtered = filtered.filter(w => w.dusun === filters.dusun);

        setWarga(filtered);
        setLoading(false);
    }

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
            nik: item.nik || "",
            noKK: item.noKK || "",
            namaLengkap: item.namaLengkap || "",
            tempatLahir: item.tempatLahir || "",
            tanggalLahir: item.tanggalLahir ? new Date(item.tanggalLahir).toISOString().split('T')[0] : "",
            jenisKelamin: item.jenisKelamin || "LAKI_LAKI",
            alamat: item.alamat || "",
            rt: item.rt || "",
            rw: item.rw || "",
            dusun: item.dusun || "",
            agama: item.agama || "ISLAM",
            statusKawin: item.statusKawin || "BELUM_KAWIN",
            hubunganKeluarga: item.hubunganKeluarga || "KEPALA_KELUARGA",
            pekerjaan: item.pekerjaan || "",
            pendidikan: item.pendidikan || "SD",
            golonganDarah: item.golonganDarah || "-",
            kewarganegaraan: item.kewarganegaraan || "WNI",
            namaAyah: item.namaAyah || "",
            namaIbu: item.namaIbu || ""
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
                                ...DEFAULT_WARGA_FORM
                            });
                            setShowModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <UserPlus size={18} /> Tambah Warga
                    </button>
                </div>
            </div>

            {/* STATS SUMMARY */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-[2rem] border border-slate-200/60 bg-blue-50/50 text-blue-800 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                        <Users size={20} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Total Warga</span>
                        <span className="text-2xl font-black text-slate-800">{stats.total} <span className="text-xs font-semibold text-slate-500">Orang</span></span>
                    </div>
                </div>
                <div className="p-5 rounded-[2rem] border border-slate-200/60 bg-emerald-50/50 text-emerald-800 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                        <LucideUser size={20} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Laki-Laki</span>
                        <span className="text-2xl font-black text-slate-800">{stats.male} <span className="text-xs font-semibold text-slate-500">Orang</span></span>
                    </div>
                </div>
                <div className="p-5 rounded-[2rem] border border-slate-200/60 bg-pink-50/50 text-pink-800 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-pink-600 shadow-sm shrink-0">
                        <LucideUsers size={20} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Perempuan</span>
                        <span className="text-2xl font-black text-slate-800">{stats.female} <span className="text-xs font-semibold text-slate-500">Orang</span></span>
                    </div>
                </div>
                <div className="p-5 rounded-[2rem] border border-slate-200/60 bg-rose-50/50 text-rose-800 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm shrink-0">
                        <AlertCircle size={20} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Belum Lengkap</span>
                        <span className="text-2xl font-black text-slate-800">{stats.incomplete} <span className="text-xs font-semibold text-slate-500">Orang</span></span>
                    </div>
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
                            <option value="Dusun 4">Dusun 4</option>
                        </select>
                        <select 
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="bg-slate-50 border-none rounded-2xl px-4 py-2 text-[10px] font-black uppercase focus:ring-0"
                        >
                            <option value="default">Urutkan: Nama (A-Z)</option>
                            <option value="kk">Urutkan: No KK</option>
                            <option value="umur-desc">Urutkan: Umur (Tua ke Muda)</option>
                            <option value="umur-asc">Urutkan: Umur (Muda ke Tua)</option>
                            <option value="pendidikan">Urutkan: Pendidikan</option>
                        </select>
                        <button 
                            type="button"
                            onClick={() => setFilterIncomplete(prev => !prev)}
                            className={`flex items-center gap-1.5 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                                filterIncomplete 
                                    ? "bg-rose-50 text-rose-600 border-rose-100 shadow-sm" 
                                    : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100"
                            }`}
                        >
                            <AlertCircle size={14} /> Perlu Sinkronisasi ({warga.filter(isWargaDataIncomplete).length})
                        </button>
                        <button 
                            onClick={handleSearch}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Filter size={16} /> Terapkan Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-8 px-8">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                                <th className="py-5 pl-6 w-12 text-center">No</th>
                                <th className="py-5 px-4">Nama Lengkap & NIK</th>
                                <th className="py-5 px-4 w-44">No. KK</th>
                                <th className="py-5 px-4 w-16 text-center">JK</th>
                                <th className="py-5 px-4 w-44">Wilayah (RT/RW/Dusun)</th>
                                <th className="py-5 px-4 w-44">Lahir</th>
                                <th className="py-5 px-4 w-32 text-center">Status</th>
                                <th className="py-5 pr-6 text-right w-44">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-6 pl-6"><div className="h-4 w-4 bg-slate-100 rounded mx-auto" /></td>
                                        <td className="py-6 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-28 bg-slate-100 rounded" />
                                                    <div className="h-3 w-20 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                                        <td className="py-6 px-4"><div className="h-4 w-6 bg-slate-100 rounded mx-auto" /></td>
                                        <td className="py-6 px-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                                        <td className="py-6 px-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                                        <td className="py-6 px-4"><div className="h-6 w-20 bg-slate-100 rounded mx-auto" /></td>
                                        <td className="py-6 pr-6"><div className="h-8 w-28 bg-slate-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : displayedWarga.length > 0 ? displayedWarga.map((item, index) => (
                                <tr key={item.id} className="group hover:bg-slate-50/30 transition-colors">
                                    <td className="py-5 pl-6 text-center text-xs font-bold text-slate-400">
                                        {index + 1}
                                    </td>
                                    <td className="py-5 px-4 min-w-[200px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-blue-600 text-sm font-black shadow-sm shrink-0">
                                                {item.namaLengkap.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-slate-800 text-sm truncate leading-tight">{item.namaLengkap}</div>
                                                <div className="text-[10px] text-slate-400 font-bold tracking-wider mt-0.5 uppercase">
                                                    NIK: <HoverMask value={item.nik} />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4 text-xs font-bold text-slate-600">
                                        <HoverMask value={item.noKK} />
                                    </td>
                                    <td className="py-5 px-4 text-center">
                                        <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                            item.jenisKelamin === "LAKI_LAKI" 
                                                ? "bg-blue-50 text-blue-600 border border-blue-100" 
                                                : "bg-pink-50 text-pink-600 border border-pink-100"
                                        }`}>
                                            {item.jenisKelamin === "LAKI_LAKI" ? "L" : "P"}
                                        </span>
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="text-xs font-bold text-slate-700 uppercase">{item.alamat} RT {item.rt}/RW {item.rw}</div>
                                        <div className="text-[10px] text-slate-400 font-medium uppercase">Dusun {item.dusun}</div>
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="text-xs font-bold text-slate-700">{item.tempatLahir}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            {new Date(item.tanggalLahir).toLocaleDateString('id-ID')}
                                        </div>
                                    </td>
                                    <td className="py-5 px-4 text-center">
                                        {isWargaDataIncomplete(item) ? (
                                            <span className="inline-flex px-2.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-md text-[9px] font-black uppercase tracking-tight items-center gap-1">
                                                <AlertCircle size={10} /> Belum Lengkap
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[9px] font-black uppercase tracking-tight items-center gap-1">
                                                Lengkap
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-5 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button 
                                                onClick={() => {
                                                    setSelectedWarga(item);
                                                    setShowPrintModal(true);
                                                }}
                                                className="p-2 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                                title="Cetak Persuratan"
                                            >
                                                <Printer size={15} />
                                            </button>
                                            <button 
                                                onClick={() => handleEdit(item)} 
                                                className="p-2 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)} 
                                                className="p-2 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Hapus"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <Users size={32} />
                                            </div>
                                            <div>
                                                <p className="text-slate-800 font-black text-base">Tidak ada data warga.</p>
                                                <p className="text-slate-400 text-xs mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {WARGA_FIELDS.map((field) => {
                                    if (field.key === "dusun") {
                                        return (
                                            <div key={field.key} className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                                <select 
                                                    required={field.required}
                                                    value={formData.dusun} 
                                                    onChange={e => setFormData({...formData, dusun: e.target.value, rw: "", rt: ""})} 
                                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-950 appearance-none"
                                                >
                                                    <option value="">- Pilih Dusun -</option>
                                                    {villageStructure?.dusun?.map(d => (
                                                        <option key={d.name} value={d.name}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    }
                                    if (field.key === "rw") {
                                        return (
                                            <div key={field.key} className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                                <select 
                                                    required={field.required}
                                                    value={formData.rw} 
                                                    onChange={e => setFormData({...formData, rw: e.target.value, rt: ""})} 
                                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-950 appearance-none"
                                                    disabled={!formData.dusun}
                                                >
                                                    <option value="">- Pilih RW -</option>
                                                    {villageStructure?.dusun?.find(d => d.name === formData.dusun)?.rw.map(r => (
                                                        <option key={r.name} value={r.name}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    }
                                    if (field.key === "rt") {
                                        return (
                                            <div key={field.key} className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                                <select 
                                                    required={field.required}
                                                    value={formData.rt} 
                                                    onChange={e => setFormData({...formData, rt: e.target.value})} 
                                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-950 appearance-none"
                                                    disabled={!formData.rw}
                                                >
                                                    <option value="">- Pilih RT -</option>
                                                    {villageStructure?.dusun?.find(d => d.name === formData.dusun)?.rw.find(r => r.name === formData.rw)?.rt.map(rt => (
                                                        <option key={rt} value={rt}>{rt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    }

                                    if (field.type === "select") {
                                        return (
                                            <div key={field.key} className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                                <select 
                                                    value={formData[field.key as keyof typeof formData] || ""} 
                                                    onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-950 appearance-none"
                                                >
                                                    {field.options?.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={field.key} className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                                            <input 
                                                required={field.required}
                                                type={field.type}
                                                value={formData[field.key as keyof typeof formData] || ""} 
                                                onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                                                placeholder={field.placeholder} 
                                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-950"
                                            />
                                        </div>
                                    );
                                })}
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


