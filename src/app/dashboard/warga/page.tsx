"use client";

import { useState, useEffect } from "react";
import { searchWarga } from "@/app/actions/village";
import { 
    Users, 
    Search, 
    Filter, 
    ChevronRight, 
    UserPlus, 
    Download,
    Calendar,
    MapPin
} from "lucide-react";

export default function WargaManagementPage() {
    const [query, setQuery] = useState("");
    const [warga, setWarga] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        handleSearch();
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        const data = await searchWarga(query);
        setWarga(data);
        setLoading(false);
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
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                        <UserPlus size={16} /> Tambah Warga
                    </button>
                </div>
            </div>

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
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                            <div key={i} className="h-40 bg-slate-50 animate-pulse rounded-[2rem]" />
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
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <MapPin size={14} className="text-slate-400" />
                                        <span>RT {item.rt} / RW {item.rw}, {item.dusun}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar size={14} className="text-slate-400" />
                                        <span>{item.tempatLahir}, {new Date(item.tanggalLahir).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button className="w-full mt-4 py-3 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-xl text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-2">
                                    Detail Lengkap <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center text-slate-400 italic">
                            Tidak ada data warga ditemukan. Silakan masukkan kata kunci pencarian.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
