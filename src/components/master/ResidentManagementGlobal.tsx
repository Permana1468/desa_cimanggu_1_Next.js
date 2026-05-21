"use client";

import React, { useState, useMemo } from "react";
import { 
    Users, Search, Plus, Edit2, Trash2, X, Download, Upload, 
    Filter, MapPin, CheckCircle2, AlertCircle, Loader2, FileText,
    ChevronLeft, ChevronRight, MoreHorizontal, User, Briefcase, Map,
    FileSpreadsheet, UserPlus, Fingerprint, Home, Heart, GraduationCap, Users2, Globe,
    Activity, ShieldCheck, Building, History, Settings
} from "lucide-react";
import { upsertResident, deleteResident, bulkImportResidents } from "@/actions/master";
import ExcelJS from "exceljs";

interface Resident {
    id: string;
    nik: string;
    noKK: string;
    namaLengkap: string;
    jenisKelamin: string;
    alamat: string;
    rt: string;
    rw: string;
    dusun: string;
    tenant: { name: string };
    tenantId: string;
    pekerjaan: string | null;
    agama: string;
    pendidikan: string | null;
    golonganDarah: string | null;
    statusKawin: string;
    hubunganKeluarga: string;
    kewarganegaraan: string;
    namaAyah: string | null;
    namaIbu: string | null;
    tanggalLahir: any;
    tempatLahir: string;
}

interface ResidentManagementGlobalProps {
    initialResidents: Resident[];
    tenants: { id: string; name: string }[];
    villageStructure: { dusun: { name: string, rw: { name: string, rt: string[] }[] }[] };
}

export function ResidentManagementGlobal({ initialResidents, tenants, villageStructure }: ResidentManagementGlobalProps) {
    const [residents, setResidents] = useState(initialResidents);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTenant, setSelectedTenant] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [editingResident, setEditingResident] = useState<any>(null);

    // Dynamic Import States
    const [importStep, setImportStep] = useState<"UPLOAD" | "MAPPING" | "PREVIEW">("UPLOAD");
    const [excelData, setExcelData] = useState<any[]>([]);
    const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

    const DB_FIELDS = useMemo(() => [
        { key: "nik", label: "NIK", required: true },
        { key: "noKK", label: "No KK", required: true },
        { key: "namaLengkap", label: "Nama Lengkap", required: true },
        { key: "jenisKelamin", label: "Jenis Kelamin (L/P)", required: true },
        { key: "tempatLahir", label: "Tempat Lahir", required: true },
        { key: "tanggalLahir", label: "Tanggal Lahir", required: true },
        { key: "agama", label: "Agama", required: false },
        { key: "pendidikan", label: "Pendidikan", required: false },
        { key: "pekerjaan", label: "Pekerjaan", required: false },
        { key: "golonganDarah", label: "Golongan Darah", required: false },
        { key: "statusKawin", label: "Status Perkawinan", required: false },
        { key: "hubunganKeluarga", label: "Hubungan Keluarga", required: false },
        { key: "kewarganegaraan", label: "Kewarganegaraan", required: false },
        { key: "namaAyah", label: "Nama Ayah", required: false },
        { key: "namaIbu", label: "Nama Ibu", required: false },
        { key: "alamat", label: "Alamat Lengkap", required: true },
        { key: "rt", label: "RT", required: true },
        { key: "rw", label: "RW", required: true },
        { key: "dusun", label: "Dusun", required: true },
    ], []);

    const [formData, setFormData] = useState({
        nik: "",
        noKK: "",
        namaLengkap: "",
        jenisKelamin: "LAKI_LAKI",
        tempatLahir: "",
        tanggalLahir: "",
        pekerjaan: "",
        agama: "ISLAM",
        pendidikan: "",
        golonganDarah: "-",
        statusKawin: "BELUM_KAWIN",
        hubunganKeluarga: "KEPALA_KELUARGA",
        kewarganegaraan: "WNI",
        namaAyah: "",
        namaIbu: "",
        alamat: "",
        rt: "",
        rw: "",
        dusun: "",
        tenantId: tenants[0]?.id || ""
    });

    const filteredResidents = useMemo(() => {
        return residents.filter(r => {
            const matchSearch = r.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                r.nik.includes(searchQuery) || 
                                (r.noKK && r.noKK.includes(searchQuery));
            const matchTenant = selectedTenant === "all" || r.tenantId === selectedTenant;
            return matchSearch && matchTenant;
        });
    }, [residents, searchQuery, selectedTenant]);

    const handleOpenModal = (resident?: any) => {
        if (resident) {
            setEditingResident(resident);
            setFormData({
                nik: resident.nik,
                noKK: resident.noKK || "",
                namaLengkap: resident.namaLengkap,
                jenisKelamin: resident.jenisKelamin,
                tempatLahir: resident.tempatLahir || "",
                tanggalLahir: resident.tanggalLahir ? new Date(resident.tanggalLahir).toISOString().split('T')[0] : "",
                pekerjaan: resident.pekerjaan || "",
                agama: resident.agama || "ISLAM",
                pendidikan: resident.pendidikan || "",
                golonganDarah: resident.golonganDarah || "-",
                statusKawin: resident.statusKawin || "BELUM_KAWIN",
                hubunganKeluarga: resident.hubunganKeluarga || "KEPALA_KELUARGA",
                kewarganegaraan: resident.kewarganegaraan || "WNI",
                namaAyah: resident.namaAyah || "",
                namaIbu: resident.namaIbu || "",
                alamat: resident.alamat || "",
                rt: resident.rt || "",
                rw: resident.rw || "",
                dusun: resident.dusun || "",
                tenantId: resident.tenantId
            });
        } else {
            setEditingResident(null);
            setFormData({
                nik: "",
                noKK: "",
                namaLengkap: "",
                jenisKelamin: "LAKI_LAKI",
                tempatLahir: "",
                tanggalLahir: "",
                pekerjaan: "",
                agama: "ISLAM",
                pendidikan: "",
                golonganDarah: "-",
                statusKawin: "BELUM_KAWIN",
                hubunganKeluarga: "KEPALA_KELUARGA",
                kewarganegaraan: "WNI",
                namaAyah: "",
                namaIbu: "",
                alamat: "",
                rt: "",
                rw: "",
                dusun: "",
                tenantId: selectedTenant === "all" ? tenants[0]?.id : selectedTenant
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const result = await upsertResident({
                id: editingResident?.id,
                ...formData
            });
            if (editingResident) {
                setResidents(residents.map(r => r.id === editingResident.id ? { ...r, ...result } : r));
            } else {
                setResidents([result as any, ...residents]);
            }
            setIsModalOpen(false);
            alert("Data kependudukan berhasil disimpan!");
        } catch (error) {
            alert("Gagal menyimpan data kependudukan.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus data kependudukan ini?")) return;
        try {
            await deleteResident(id);
            setResidents(residents.filter(r => r.id !== id));
        } catch (error) {
            alert("Gagal menghapus data.");
        }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !formData.tenantId) {
            alert("Pilih file dan tenant tujuan terlebih dahulu.");
            return;
        }

        setIsImporting(true);
        try {
            const buffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer as any);
            const worksheet = workbook.worksheets[0];
            
            const headers: string[] = [];
            worksheet.getRow(1).eachCell((cell, colNumber) => {
                headers.push(cell.text || `Column ${colNumber}`);
            });

            const data: any[] = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) { // Skip header
                    const rowData: Record<string, string> = {};
                    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        const header = headers[colNumber - 1];
                        if (header) rowData[header] = cell.text;
                    });
                    data.push(rowData);
                }
            });

            setExcelHeaders(headers);
            setExcelData(data);

            // Auto-Match logic
            const initialMapping: Record<string, string> = {};
            DB_FIELDS.forEach(field => {
                const match = headers.find(h => 
                    h.toLowerCase().includes(field.label.toLowerCase()) || 
                    field.label.toLowerCase().includes(h.toLowerCase()) || 
                    h.toLowerCase() === field.key.toLowerCase()
                );
                if (match) initialMapping[field.key] = match;
            });
            setColumnMapping(initialMapping);
            setImportStep("MAPPING");

        } catch (error) {
            alert("Gagal membaca file Excel. Pastikan format sesuai.");
        } finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    const executeImport = async () => {
        setIsImporting(true);
        try {
            const formattedData = excelData.map(row => {
                const jkRaw = String(row[columnMapping['jenisKelamin']] || "").toUpperCase();
                const jk = jkRaw === "L" || jkRaw === "LAKI-LAKI" || jkRaw === "LAKI_LAKI" ? "LAKI_LAKI" : "PEREMPUAN";

                return {
                    nik: row[columnMapping['nik']] || "",
                    noKK: row[columnMapping['noKK']] || "",
                    namaLengkap: row[columnMapping['namaLengkap']] || "",
                    jenisKelamin: jk,
                    tempatLahir: row[columnMapping['tempatLahir']] || "",
                    tanggalLahir: row[columnMapping['tanggalLahir']] || "",
                    agama: row[columnMapping['agama']] || "ISLAM",
                    pendidikan: row[columnMapping['pendidikan']] || "",
                    pekerjaan: row[columnMapping['pekerjaan']] || "",
                    golonganDarah: row[columnMapping['golonganDarah']] || "-",
                    statusKawin: row[columnMapping['statusKawin']] || "BELUM_KAWIN",
                    hubunganKeluarga: row[columnMapping['hubunganKeluarga']] || "KEPALA_KELUARGA",
                    kewarganegaraan: row[columnMapping['kewarganegaraan']] || "WNI",
                    namaAyah: row[columnMapping['namaAyah']] || "",
                    namaIbu: row[columnMapping['namaIbu']] || "",
                    alamat: row[columnMapping['alamat']] || "",
                    rt: row[columnMapping['rt']] || "",
                    rw: row[columnMapping['rw']] || "",
                    dusun: row[columnMapping['dusun']] || "",
                };
            });

            await bulkImportResidents(formattedData, formData.tenantId);
            alert(`Berhasil mengimpor ${formattedData.length} data kependudukan!`);
            window.location.reload(); 
        } catch (error) {
            alert("Gagal mengimpor data kependudukan.");
            setIsImporting(false);
        }
    };

    const closeImportModal = () => {
        if (isImporting) return;
        setIsImportOpen(false);
        setTimeout(() => {
            setImportStep("UPLOAD");
            setExcelData([]);
            setExcelHeaders([]);
            setColumnMapping({});
        }, 300);
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            {/* HEADER SECTION */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                        <Fingerprint size={12} /> Big Data Kependudukan
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        Citizen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Database</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                        Manajemen terpusat data kependudukan desa digital. Data ini terintegrasi otomatis dengan pendaftaran akun warga.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative group flex-1 xl:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cari NIK, KK, atau Nama..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xl shadow-slate-200/40"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsImportOpen(true)}
                            className="bg-slate-100 text-slate-700 px-6 py-5 rounded-[2rem] text-sm font-black shadow-xl shadow-slate-200/20 hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Upload size={18} /> Import
                        </button>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="bg-slate-950 text-white px-8 py-5 rounded-[2rem] text-sm font-black shadow-2xl shadow-slate-950/20 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                            <Plus size={20} /> Tambah Data
                        </button>
                    </div>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white p-4 rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-transparent">
                    <Filter size={16} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Wilayah:</span>
                    <select 
                        value={selectedTenant}
                        onChange={e => setSelectedTenant(e.target.value)}
                        className="bg-transparent border-none text-sm font-bold text-slate-800 focus:ring-0 cursor-pointer"
                    >
                        <option value="all">Semua Desa</option>
                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div className="flex-1" />
                <div className="px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                    Total: {filteredResidents.length} Jiwa
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Biodata Lengkap</th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">NIK & NO KK</th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Domisili</th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Info Keluarga</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Manajemen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredResidents.map((r) => (
                                <tr key={r.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${r.jenisKelamin === 'LAKI_LAKI' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                                                {r.namaLengkap.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-none mb-1">{r.namaLengkap}</span>
                                                <div className="flex items-center gap-2">
                                                    <Briefcase size={12} className="text-slate-300" />
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{r.pekerjaan || "BELUM BEKERJA"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl w-fit">
                                                <Fingerprint size={12} className="text-slate-400" />
                                                <code className="text-[11px] font-mono font-black text-slate-600">{r.nik}</code>
                                            </div>
                                            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-xl w-fit">
                                                <Home size={12} className="text-amber-500" />
                                                <code className="text-[11px] font-mono font-black text-amber-700">{r.noKK}</code>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-600 line-clamp-1 max-w-[200px]">{r.alamat}</p>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={12} className="text-blue-400" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RT {r.rt} RW {r.rw}, {r.dusun}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="space-y-1.5">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-600 text-[9px] font-black rounded-lg uppercase border border-purple-100">
                                                <Users2 size={10} /> {r.hubunganKeluarga.replace(/_/g, ' ')}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <Heart size={10} className="text-rose-400" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{r.statusKawin.replace(/_/g, ' ')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                            <button onClick={() => handleOpenModal(r)} className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:text-blue-600 border border-slate-100 rounded-2xl transition-all shadow-xl shadow-slate-200/50">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(r.id)} className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:text-red-500 border border-slate-100 rounded-2xl transition-all shadow-xl shadow-slate-200/50">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden p-5 md:p-8 space-y-6 bg-slate-50/50">
                    {filteredResidents.map((r) => (
                        <div key={r.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 space-y-6 active:scale-95 transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${r.jenisKelamin === 'LAKI_LAKI' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {r.namaLengkap.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-slate-900 leading-none mb-1">{r.namaLengkap}</p>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{r.tenant.name}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(r)} className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(r.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                <div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">NIK / KK</p>
                                    <p className="text-[11px] font-mono font-black text-slate-600 tracking-tight">{r.nik}</p>
                                    <p className="text-[11px] font-mono font-black text-amber-600 tracking-tight">{r.noKK}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Hub. Keluarga</p>
                                    <p className="text-[10px] font-black uppercase text-slate-600">{r.hubunganKeluarga.replace(/_/g, ' ')}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* EPIC MODAL - FULL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => !isSaving && setIsModalOpen(false)} />
                    
                    <div className="bg-white rounded-t-[3.5rem] sm:rounded-[4rem] shadow-2xl w-full max-w-5xl relative overflow-hidden flex flex-col h-[95vh] sm:h-[90vh] animate-in slide-in-from-bottom duration-500">
                        <div className="bg-slate-950 p-10 md:p-12 text-white relative shrink-0">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">{editingResident ? "Update Citizen" : "New Resident"}</h2>
                                    <p className="text-blue-400 text-[10px] font-black mt-4 uppercase tracking-[0.3em]">Official Demographic Registration Terminal</p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                                >
                                    <X size={28} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="p-8 md:p-12 space-y-12 overflow-y-auto custom-scrollbar bg-slate-50/30">
                            {/* SECTION 1: IDENTITAS UTAMA */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20"><User size={16} /></div>
                                    Identitas Utama (NIK & KK)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <FormGroup label="Nomor Induk Kependudukan (NIK)" icon={Fingerprint}>
                                        <input required value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} placeholder="16 Digit NIK" className="form-input-premium" />
                                    </FormGroup>
                                    <FormGroup label="Nomor Kartu Keluarga (NO KK)" icon={Home}>
                                        <input required value={formData.noKK} onChange={e => setFormData({...formData, noKK: e.target.value})} placeholder="16 Digit No KK" className="form-input-premium" />
                                    </FormGroup>
                                    <FormGroup label="Nama Lengkap (Sesuai KTP)" icon={User}>
                                        <input required value={formData.namaLengkap} onChange={e => setFormData({...formData, namaLengkap: e.target.value})} placeholder="Nama Lengkap" className="form-input-premium" />
                                    </FormGroup>
                                </div>
                            </div>

                            {/* SECTION 2: KELAHIRAN & FISIK */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20"><Heart size={16} /></div>
                                    Kelahiran & Informasi Personal
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <FormGroup label="Tempat Lahir" icon={MapPin}>
                                        <input required value={formData.tempatLahir} onChange={e => setFormData({...formData, tempatLahir: e.target.value})} placeholder="Kota / Kabupaten" className="form-input-premium" />
                                    </FormGroup>
                                    <FormGroup label="Tanggal Lahir" icon={FileSpreadsheet}>
                                        <input required type="date" value={formData.tanggalLahir} onChange={e => setFormData({...formData, tanggalLahir: e.target.value})} className="form-input-premium" />
                                    </FormGroup>
                                    <FormGroup label="Jenis Kelamin" icon={Users}>
                                        <select value={formData.jenisKelamin} onChange={e => setFormData({...formData, jenisKelamin: e.target.value})} className="form-input-premium appearance-none">
                                            <option value="LAKI_LAKI">LAKI-LAKI</option>
                                            <option value="PEREMPUAN">PEREMPUAN</option>
                                        </select>
                                    </FormGroup>
                                    <FormGroup label="Golongan Darah" icon={Activity}>
                                        <select value={formData.golonganDarah} onChange={e => setFormData({...formData, golonganDarah: e.target.value})} className="form-input-premium appearance-none">
                                            <option value="-">- TIDAK TAHU -</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="AB">AB</option>
                                            <option value="O">O</option>
                                        </select>
                                    </FormGroup>
                                </div>
                            </div>

                            {/* SECTION 3: SOSIAL & PENDIDIKAN */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20"><GraduationCap size={16} /></div>
                                    Status Sosial & Pendidikan
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <FormGroup label="Agama" icon={ShieldCheck}>
                                        <select value={formData.agama} onChange={e => setFormData({...formData, agama: e.target.value})} className="form-input-premium appearance-none">
                                            <option value="ISLAM">ISLAM</option>
                                            <option value="KRISTEN">KRISTEN</option>
                                            <option value="KATOLIK">KATOLIK</option>
                                            <option value="HINDU">HINDU</option>
                                            <option value="BUDHA">BUDHA</option>
                                            <option value="KONGHUCU">KONGHUCU</option>
                                        </select>
                                    </FormGroup>
                                    <FormGroup label="Pendidikan Terakhir" icon={GraduationCap}>
                                        <select value={formData.pendidikan} onChange={e => setFormData({...formData, pendidikan: e.target.value})} className="form-input-premium appearance-none">
                                            <option value="TIDAK_SEKOLAH">TIDAK SEKOLAH</option>
                                            <option value="SD">SD</option>
                                            <option value="SMP">SMP</option>
                                            <option value="SMA">SMA/SMK</option>
                                            <option value="D3">DIPLOMA (D3)</option>
                                            <option value="S1">SARJANA (S1)</option>
                                            <option value="S2">MAGISTER (S2)</option>
                                            <option value="S3">DOKTOR (S3)</option>
                                        </select>
                                    </FormGroup>
                                    <FormGroup label="Pekerjaan" icon={Briefcase}>
                                        <input value={formData.pekerjaan} onChange={e => setFormData({...formData, pekerjaan: e.target.value})} placeholder="Pekerjaan" className="form-input-premium" />
                                    </FormGroup>
                                    <FormGroup label="Status Perkawinan" icon={Heart}>
                                        <select value={formData.statusKawin} onChange={e => setFormData({...formData, statusKawin: e.target.value})} className="form-input-premium appearance-none">
                                            <option value="BELUM_KAWIN">BELUM KAWIN</option>
                                            <option value="KAWIN">KAWIN</option>
                                            <option value="CERAI_HIDUP">CERAI HIDUP</option>
                                            <option value="CERAI_MATI">CERAI MATI</option>
                                        </select>
                                    </FormGroup>
                                </div>
                            </div>

                            {/* SECTION 4: HUBUNGAN KELUARGA & ORANG TUA */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20"><Users2 size={16} /></div>
                                    Hubungan Keluarga & Orang Tua
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <FormGroup label="Hubungan Dalam Keluarga" icon={Users2}>
                                        <select value={formData.hubunganKeluarga} onChange={e => setFormData({...formData, hubunganKeluarga: e.target.value})} className="form-input-premium appearance-none">
                                            <option value="KEPALA_KELUARGA">KEPALA KELUARGA</option>
                                            <option value="ISTRI">ISTRI</option>
                                            <option value="ANAK">ANAK</option>
                                            <option value="MERTUA">MERTUA</option>
                                            <option value="ORANG_TUA">ORANG TUA</option>
                                            <option value="LAINNYA">LAINNYA</option>
                                        </select>
                                    </FormGroup>
                                    <FormGroup label="Kewarganegaraan" icon={Globe}>
                                        <select value={formData.kewarganegaraan} onChange={e => setFormData({...formData, kewarganegaraan: e.target.value})} className="form-input-premium appearance-none">
                                            <option value="WNI">WNI</option>
                                            <option value="WNA">WNA</option>
                                        </select>
                                    </FormGroup>
                                    <FormGroup label="Nama Ayah" icon={User}>
                                        <input value={formData.namaAyah} onChange={e => setFormData({...formData, namaAyah: e.target.value})} placeholder="Nama Ayah Kandung" className="form-input-premium" />
                                    </FormGroup>
                                    <FormGroup label="Nama Ibu" icon={User}>
                                        <input value={formData.namaIbu} onChange={e => setFormData({...formData, namaIbu: e.target.value})} placeholder="Nama Ibu Kandung" className="form-input-premium" />
                                    </FormGroup>
                                </div>
                            </div>

                            {/* SECTION 5: ALAMAT & TENANT */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20"><MapPin size={16} /></div>
                                    Domisili & Wilayah Administratif
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormGroup label="Alamat Lengkap" icon={Map}>
                                        <textarea required value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} placeholder="Dusun, Kampung, No Rumah..." className="form-input-premium min-h-[120px] pt-5" />
                                    </FormGroup>
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <FormGroup label="Dusun" icon={MapPin}>
                                                <select 
                                                    required 
                                                    value={formData.dusun} 
                                                    onChange={e => setFormData({...formData, dusun: e.target.value, rw: "", rt: ""})} 
                                                    className="form-input-premium appearance-none"
                                                >
                                                    <option value="">- Pilih Dusun -</option>
                                                    {villageStructure.dusun.map(d => (
                                                        <option key={d.name} value={d.name}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </FormGroup>
                                            <FormGroup label="RW" icon={MapPin}>
                                                <select 
                                                    required 
                                                    value={formData.rw} 
                                                    onChange={e => setFormData({...formData, rw: e.target.value, rt: ""})} 
                                                    className="form-input-premium appearance-none"
                                                    disabled={!formData.dusun}
                                                >
                                                    <option value="">- Pilih RW -</option>
                                                    {villageStructure.dusun.find(d => d.name === formData.dusun)?.rw.map(r => (
                                                        <option key={r.name} value={r.name}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </FormGroup>
                                            <FormGroup label="RT" icon={MapPin}>
                                                <select 
                                                    required 
                                                    value={formData.rt} 
                                                    onChange={e => setFormData({...formData, rt: e.target.value})} 
                                                    className="form-input-premium appearance-none"
                                                    disabled={!formData.rw}
                                                >
                                                    <option value="">- Pilih RT -</option>
                                                    {villageStructure.dusun.find(d => d.name === formData.dusun)?.rw.find(r => r.name === formData.rw)?.rt.map(rt => (
                                                        <option key={rt} value={rt}>{rt}</option>
                                                    ))}
                                                </select>
                                            </FormGroup>
                                        </div>
                                        <FormGroup label="Wilayah Desa" icon={Building}>
                                            <select required value={formData.tenantId} onChange={e => setFormData({...formData, tenantId: e.target.value})} className="form-input-premium appearance-none">
                                                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </FormGroup>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER ACTIONS */}
                            <div className="pt-10 flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-slate-50/0 pointer-events-none">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="pointer-events-auto flex-1 py-6 rounded-[2rem] text-sm font-black text-slate-400 uppercase tracking-widest hover:bg-white transition-all border border-transparent hover:border-slate-100">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="pointer-events-auto flex-[2] bg-slate-950 text-white py-6 rounded-[2rem] text-sm font-black shadow-2xl shadow-slate-900/30 transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
                                    {editingResident ? "Perbarui Data Warga" : "Simpan Data Permanen"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* IMPORT MODAL - Premium Layout */}
            {isImportOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={closeImportModal} />
                    <div className={`bg-white w-full rounded-[3.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-500 flex flex-col ${importStep === "UPLOAD" ? 'max-w-lg' : 'max-w-4xl h-[90vh]'}`}>
                        <div className="p-10 bg-slate-950 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">Import Ecosystem</h3>
                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-1">Massive Population Sync</p>
                            </div>
                            <button onClick={closeImportModal} className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {importStep === "UPLOAD" && (
                            <div className="p-10 space-y-8">
                                <FormGroup label="Target Desa Destinasi" icon={Building}>
                                    <select value={formData.tenantId} onChange={e => setFormData({...formData, tenantId: e.target.value})} className="form-input-premium appearance-none">
                                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </FormGroup>

                                <div className="relative p-12 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center gap-6 text-center group hover:border-blue-500/30 transition-all bg-slate-50/50">
                                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-300 group-hover:text-blue-600 transition-all shadow-xl shadow-slate-200/50">
                                        {isImporting ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-800">Tarik File Excel ke Sini</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Format: .xlsx (Max 50MB)</p>
                                    </div>
                                    <input type="file" accept=".xlsx" onChange={handleImportExcel} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isImporting} />
                                </div>
                            </div>
                        )}

                        {importStep === "MAPPING" && (
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                    <h4 className="text-lg font-black text-slate-900">Pencocokan Kolom Data</h4>
                                    <p className="text-xs text-slate-500 mt-1">Sistem mendeteksi kolom dari file Anda. Harap cocokkan dengan field database.</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {DB_FIELDS.map(field => (
                                            <div key={field.key} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                                        {field.label}
                                                        {field.required && <span className="text-rose-500">*</span>}
                                                    </span>
                                                </div>
                                                <select 
                                                    value={columnMapping[field.key] || ""} 
                                                    onChange={e => setColumnMapping({...columnMapping, [field.key]: e.target.value})}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                                                >
                                                    <option value="">-- Abaikan (Kosongkan) --</option>
                                                    {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-white shrink-0">
                                    <button onClick={() => setImportStep("UPLOAD")} className="px-8 py-4 rounded-3xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-all">Kembali</button>
                                    <button onClick={() => setImportStep("PREVIEW")} className="px-8 py-4 rounded-3xl text-sm font-black bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all">Lanjut Pratinjau</button>
                                </div>
                            </div>
                        )}

                        {importStep === "PREVIEW" && (
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                    <h4 className="text-lg font-black text-slate-900">Pratinjau Data Kependudukan</h4>
                                    <p className="text-xs text-slate-500 mt-1">Tinjau ulang 5 data pertama sebelum menyimpan secara permanen.</p>
                                </div>
                                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                                    <table className="w-full text-left border-collapse whitespace-nowrap">
                                        <thead>
                                            <tr className="bg-slate-100">
                                                {DB_FIELDS.map(f => (
                                                    <th key={f.key} className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">{f.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {excelData.slice(0, 5).map((row, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                                    {DB_FIELDS.map(f => {
                                                        const val = row[columnMapping[f.key]];
                                                        const isMissing = f.required && !val;
                                                        return (
                                                            <td key={f.key} className="px-4 py-3 text-xs font-medium text-slate-700">
                                                                {isMissing ? <span className="text-rose-500 text-[10px] font-black uppercase flex items-center gap-1"><AlertCircle size={10}/> Kosong</span> : val || "-"}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {excelData.length > 5 && (
                                        <p className="text-center text-xs font-bold text-slate-400 mt-6">...dan {excelData.length - 5} baris lainnya.</p>
                                    )}
                                </div>
                                <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-white shrink-0">
                                    <button disabled={isImporting} onClick={() => setImportStep("MAPPING")} className="px-8 py-4 rounded-3xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-all disabled:opacity-50">Kembali</button>
                                    <button disabled={isImporting} onClick={executeImport} className="px-8 py-4 rounded-3xl text-sm font-black bg-slate-950 text-white shadow-xl shadow-slate-900/30 hover:bg-blue-600 transition-all flex items-center gap-3 disabled:opacity-50">
                                        {isImporting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                        Mulai Import Massal ({excelData.length} Baris)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .form-input-premium {
                    width: 100%;
                    background-color: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 1.25rem;
                    padding: 1.25rem 1.5rem;
                    font-size: 0.875rem;
                    font-weight: 700;
                    color: #0f172a;
                    transition: all 0.3s;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                }
                .form-input-premium:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
                }
                .form-input-premium::placeholder {
                    color: #cbd5e1;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}

function FormGroup({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Icon size={12} /></div>
                {label}
            </label>
            <div className="relative">
                {children}
            </div>
        </div>
    )
}

