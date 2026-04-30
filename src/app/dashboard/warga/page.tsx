"use client";

import { useState, useEffect } from "react";
import { searchWarga, addWarga } from "@/app/actions/village";
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
    Loader2
} from "lucide-react";

export default function WargaManagementPage() {
    const [query, setQuery] = useState("");
    const [warga, setWarga] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
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
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        const data = await searchWarga(query);
        setWarga(data);
        setLoading(false);
    };

    const handleAddWarga = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await addWarga({
                ...formData,
                tanggalLahir: new Date(formData.tanggalLahir)
            });
            setShowModal(false);
            handleSearch();
            alert("Data warga berhasil ditambahkan!");
        } catch (error) {
            console.error(error);
            alert("Gagal menambahkan data warga.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Data Kependudukan</h1>
                    <p className="text-slate-500 text-sm">Kelola dan cari data warga Desa Cimanggu I dengan cepat.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                        <Download size={16} /> Export CSV
                    </button>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <UserPlus size={16} /> Tambah Warga
                    </button>
                </div>
            </div>

            {/* SEARCH AREA */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input 
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            type="text" 
                            placeholder="Cari berdasarkan NIK atau Nama Lengkap..." 
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        />
                    </div>
                    <button 
                        onClick={handleSearch}
                        className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
                    >
                        Cari Data
                    </button>
                    <button className="p-3.5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all">
                        <Filter size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-44 bg-slate-50 animate-pulse rounded-[2rem]" />
                        ))
                    ) : warga.length > 0 ? warga.map((item) => (
                        <div key={item.id} className="p-6 rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all group bg-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg">
                                        {item.namaLengkap.charAt(0)}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h3 className="font-bold text-slate-800 truncate">{item.namaLengkap}</h3>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.nik}</span>
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <MapPin size={14} className="text-blue-500" />
                                        <span>RT {item.rt} / RW {item.rw}, {item.dusun}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <Calendar size={14} className="text-amber-500" />
                                        <span>{new Date(item.tanggalLahir).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button className="w-full mt-2 py-3 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all flex items-center justify-center gap-2">
                                    Detail <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                <Users size={32} />
                            </div>
                            <p className="text-slate-400 font-medium text-sm">Tidak ada data warga ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ADD MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Tambah Warga Baru</h2>
                                <p className="text-slate-500 text-xs font-medium">Pastikan NIK sesuai dengan KTP warga.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddWarga} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK</label>
                                    <input required value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 text-slate-800" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <input required value={formData.namaLengkap} onChange={e => setFormData({...formData, namaLengkap: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 text-slate-800" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tempat Lahir</label>
                                    <input required value={formData.tempatLahir} onChange={e => setFormData({...formData, tempatLahir: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 text-slate-800" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                                    <input type="date" required value={formData.tanggalLahir} onChange={e => setFormData({...formData, tanggalLahir: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 text-slate-800" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                                    <select value={formData.jenisKelamin} onChange={e => setFormData({...formData, jenisKelamin: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 text-slate-800">
                                        <option value="LAKI_LAKI">Laki-Laki</option>
                                        <option value="PEREMPUAN">Perempuan</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pekerjaan</label>
                                    <input required value={formData.pekerjaan} onChange={e => setFormData({...formData, pekerjaan: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 text-slate-800" />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Domisili</label>
                                <textarea required value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 min-h-[80px] text-slate-800" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RT</label>
                                    <input required value={formData.rt} onChange={e => setFormData({...formData, rt: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 text-center text-slate-800" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RW</label>
                                    <input required value={formData.rw} onChange={e => setFormData({...formData, rw: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 text-center text-slate-800" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dusun</label>
                                    <input required value={formData.dusun} onChange={e => setFormData({...formData, dusun: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 text-slate-800" />
                                </div>
                            </div>

                            <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={18} /> : "Simpan Data Warga"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

