"use client";

import React, { useState } from "react";
import { 
    MapPin, Plus, Trash2, Edit2, Save, X, ChevronRight, 
    ChevronDown, Home, Building2, Map, Users, Layout, 
    CheckCircle2, Loader2, Info, ArrowRight, Layers
} from "lucide-react";
import { updateVillageStructure } from "@/actions/master";

interface RT {
    name: string;
}

interface RW {
    name: string;
    rt: string[];
}

interface Dusun {
    name: string;
    rw: RW[];
}

interface VillageStructure {
    dusun: Dusun[];
}

interface WilayahManagementClientProps {
    initialStructure: VillageStructure;
}

export function WilayahManagementClient({ initialStructure }: WilayahManagementClientProps) {
    const [structure, setStructure] = useState<VillageStructure>(initialStructure);
    const [isSaving, setIsSaving] = useState(false);
    const [activeDusun, setActiveDusun] = useState<number | null>(initialStructure.dusun.length > 0 ? 0 : null);
    const [activeRW, setActiveRW] = useState<number | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateVillageStructure(structure);
            alert("Struktur wilayah Cimanggu I berhasil disinkronkan!");
        } catch (error) {
            alert("Gagal menyimpan struktur wilayah.");
        } finally {
            setIsSaving(false);
        }
    };

    const addDusun = () => {
        const newDusun: Dusun = { name: `Dusun Baru ${structure.dusun.length + 1}`, rw: [] };
        setStructure({ ...structure, dusun: [...structure.dusun, newDusun] });
        if (activeDusun === null) setActiveDusun(structure.dusun.length);
    };

    const addRW = (dusunIndex: number) => {
        if (!structure.dusun[dusunIndex]) return;
        const newRW: RW = { name: `RW 0${structure.dusun[dusunIndex].rw.length + 1}`, rt: [] };
        const newDusun = [...structure.dusun];
        newDusun[dusunIndex].rw.push(newRW);
        setStructure({ ...structure, dusun: newDusun });
    };

    const addRT = (dusunIndex: number, rwIndex: number) => {
        if (!structure.dusun[dusunIndex] || !structure.dusun[dusunIndex].rw[rwIndex]) return;
        const newRT = `RT 0${structure.dusun[dusunIndex].rw[rwIndex].rt.length + 1}`;
        const newDusun = [...structure.dusun];
        newDusun[dusunIndex].rw[rwIndex].rt.push(newRT);
        setStructure({ ...structure, dusun: newDusun });
    };

    const removeDusun = (index: number) => {
        if (!confirm("Hapus Dusun ini beserta seluruh RW dan RT di dalamnya?")) return;
        const newDusun = structure.dusun.filter((_, i) => i !== index);
        setStructure({ ...structure, dusun: newDusun });
    };

    const removeRW = (dusunIndex: number, rwIndex: number) => {
        const newDusun = [...structure.dusun];
        newDusun[dusunIndex].rw = newDusun[dusunIndex].rw.filter((_, i) => i !== rwIndex);
        setStructure({ ...structure, dusun: newDusun });
    };

    const removeRT = (dusunIndex: number, rwIndex: number, rtIndex: number) => {
        const newDusun = [...structure.dusun];
        newDusun[dusunIndex].rw[rwIndex].rt = newDusun[dusunIndex].rw[rwIndex].rt.filter((_, i) => i !== rtIndex);
        setStructure({ ...structure, dusun: newDusun });
    };

    const updateName = (type: 'dusun' | 'rw' | 'rt', value: string, dIdx: number, rIdx?: number, rtIdx?: number) => {
        const newDusun = [...structure.dusun];
        if (type === 'dusun') newDusun[dIdx].name = value;
        if (type === 'rw' && rIdx !== undefined) newDusun[dIdx].rw[rIdx].name = value;
        if (type === 'rt' && rIdx !== undefined && rtIdx !== undefined) newDusun[dIdx].rw[rIdx].rt[rtIdx] = value;
        setStructure({ ...structure, dusun: newDusun });
    };

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            {/* HERO HEADER */}
            <div className="relative p-12 md:p-20 rounded-[3.5rem] md:rounded-[4.5rem] bg-slate-950 text-white overflow-hidden shadow-2xl shadow-slate-900/40">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                            <Map size={12} className="animate-pulse" /> Village Territory Orchestrator
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
                            Wilayah & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Administrasi</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-sm md:text-lg leading-relaxed">
                            Pusat kendali struktur wilayah Cimanggu I. Kelola Dusun, RW, dan RT secara terpusat untuk sinkronisasi data kependudukan yang presisi.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={addDusun}
                            className="px-10 py-6 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-[2.5rem] text-sm font-black transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Plus size={20} /> Tambah Dusun
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-12 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] text-sm font-black shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} 
                            Simpan Struktur
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* 1. DUSUN LIST (Side Navigation) */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-4 mb-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Daftar Dusun</h3>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{structure.dusun.length} Unit</span>
                    </div>
                    <div className="space-y-3">
                        {structure.dusun.map((dusun, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setActiveDusun(idx); setActiveRW(null); }}
                                className={`w-full p-6 rounded-[2rem] flex items-center justify-between transition-all group ${
                                    activeDusun === idx 
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 shadow-sm'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                        activeDusun === idx ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                                    }`}>
                                        <Home size={18} />
                                    </div>
                                    <div className="text-left">
                                        <input 
                                            value={dusun.name}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => updateName('dusun', e.target.value, idx)}
                                            className={`bg-transparent border-none p-0 focus:ring-0 text-sm font-black w-full ${activeDusun === idx ? 'text-white' : 'text-slate-900'}`}
                                        />
                                        <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${activeDusun === idx ? 'text-blue-300' : 'text-slate-400'}`}>
                                            {dusun.rw.length} RW Terdaftar
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeDusun(idx); }}
                                        className="p-2 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. RW & RT MANAGEMENT (Main View) */}
                <div className="lg:col-span-9 space-y-8">
                    {activeDusun !== null ? (
                        <div className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-xl shadow-slate-200/40 border border-slate-100 animate-in slide-in-from-right duration-500">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Active Focus</div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{structure.dusun[activeDusun]?.name || "Dusun Baru"}</h2>
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium italic">Kelola struktur RW dan RT di bawah naungan {structure.dusun[activeDusun]?.name || "Dusun"}.</p>
                                </div>
                                <button 
                                    onClick={() => addRW(activeDusun)}
                                    className="px-8 py-4 bg-slate-950 text-white rounded-[1.5rem] text-xs font-black shadow-xl shadow-slate-900/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <Layers size={16} /> Tambah RW Baru
                                </button>
                            </div>

                            {structure.dusun[activeDusun]?.rw.length === 0 ? (
                                <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-sm">
                                        <Layers size={40} />
                                    </div>
                                    <p className="text-lg font-black text-slate-800">Belum ada RW di Dusun ini</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Klik tombol di atas untuk mulai memetakan wilayah.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {structure.dusun[activeDusun]?.rw.map((rw, rIdx) => (
                                        <div key={rIdx} className="bg-slate-50/50 rounded-[3rem] p-8 border border-slate-100 hover:border-blue-200 transition-all group">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <Layout size={24} />
                                                    </div>
                                                    <input 
                                                        value={rw.name}
                                                        onChange={(e) => updateName('rw', e.target.value, activeDusun, rIdx)}
                                                        className="bg-transparent border-none p-0 focus:ring-0 text-xl font-black text-slate-900 w-24"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => removeRW(activeDusun, rIdx)}
                                                    className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-2">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar RT ({rw.rt.length})</h4>
                                                    <button 
                                                        onClick={() => addRT(activeDusun, rIdx)}
                                                        className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1"
                                                    >
                                                        <Plus size={12} /> Add RT
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {rw.rt.map((rt, rtIdx) => (
                                                        <div key={rtIdx} className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-100 group/rt shadow-sm">
                                                            <input 
                                                                value={rt}
                                                                onChange={(e) => updateName('rt', e.target.value, activeDusun, rIdx, rtIdx)}
                                                                className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-slate-600 w-full"
                                                            />
                                                            <button 
                                                                onClick={() => removeRT(activeDusun, rIdx, rtIdx)}
                                                                className="opacity-0 group-hover/rt:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-20 bg-white rounded-[3.5rem] border border-slate-100 text-center">
                             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 text-slate-200">
                                 <ArrowRight size={48} className="animate-bounce-x" />
                             </div>
                             <h2 className="text-2xl font-black text-slate-800 tracking-tight">Pilih Dusun Terlebih Dahulu</h2>
                             <p className="text-sm text-slate-400 font-medium max-w-xs mt-2 uppercase tracking-widest">Silakan pilih dusun di sebelah kiri untuk mengelola struktur RW/RT.</p>
                        </div>
                    )}

                    {/* TIPS & INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 flex items-start gap-6">
                            <div className="w-12 h-12 bg-white text-amber-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                <Info size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Sync Notice</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    Setiap perubahan wilayah di sini akan otomatis muncul sebagai pilihan "Dusun/RW/RT" saat pendaftaran warga baru.
                                </p>
                            </div>
                        </div>
                        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex items-start gap-6">
                            <div className="w-12 h-12 bg-white text-emerald-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                <CheckCircle2 size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Data Accuracy</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    Memastikan tidak ada kesalahan ketik wilayah dalam database kependudukan Cimanggu I.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes bounce-x {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(10px); }
                }
                .animate-bounce-x {
                    animation: bounce-x 1s infinite;
                }
            `}</style>
        </div>
    );
}
