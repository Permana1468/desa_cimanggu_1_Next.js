"use client";
/* eslint-disable security/detect-object-injection */

import React, { useState } from "react";
import { 
    MapPin, Plus, Trash2, Edit2, Save, X, ChevronRight, 
    ChevronDown, Home, Building2, Map, Users, Layout, 
    CheckCircle2, Loader2, Info, ArrowRight, Layers
} from "lucide-react";
import { updateVillageStructure } from "@/actions/master";
import toast from "react-hot-toast";

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
    const [activeDusun, setActiveDusun] = useState<number | null>(initialStructure?.dusun?.length > 0 ? 0 : null);
    const [activeRW, setActiveRW] = useState<number | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        const toastId = toast.loading("Menyimpan struktur wilayah...");
        try {
            await updateVillageStructure(structure);
            toast.success("Struktur wilayah Cimanggu I berhasil disinkronkan!", { id: toastId });
        } catch (error) {
            toast.error("Gagal menyimpan struktur wilayah.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const addDusun = () => {
        const newStructure = structuredClone(structure);
        const newDusun: Dusun = { name: `Dusun Baru ${newStructure.dusun.length + 1}`, rw: [] };
        newStructure.dusun.push(newDusun);
        setStructure(newStructure);
        if (activeDusun === null) setActiveDusun(newStructure.dusun.length - 1);
        toast.success("Dusun baru ditambahkan");
    };

    const addRW = (dusunIndex: number) => {
        if (!structure.dusun[dusunIndex]) return;
        const newStructure = structuredClone(structure);
        const rwCount = newStructure.dusun[dusunIndex].rw.length + 1;
        const formattedRW = rwCount < 10 ? `RW 00${rwCount}` : `RW 0${rwCount}`;
        const newRW: RW = { name: formattedRW, rt: [] };
        newStructure.dusun[dusunIndex].rw.push(newRW);
        setStructure(newStructure);
        toast.success(`${formattedRW} ditambahkan`);
    };

    const addRT = (dusunIndex: number, rwIndex: number) => {
        if (!structure.dusun[dusunIndex] || !structure.dusun[dusunIndex].rw[rwIndex]) return;
        const newStructure = structuredClone(structure);
        const rtCount = newStructure.dusun[dusunIndex].rw[rwIndex].rt.length + 1;
        const formattedRT = rtCount < 10 ? `RT 00${rtCount}` : `RT 0${rtCount}`;
        newStructure.dusun[dusunIndex].rw[rwIndex].rt.push(formattedRT);
        setStructure(newStructure);
    };

    const removeDusun = (index: number) => {
        if (!confirm("Hapus Dusun ini beserta seluruh RW dan RT di dalamnya?")) return;
        const newStructure = structuredClone(structure);
        newStructure.dusun = newStructure.dusun.filter((_, i) => i !== index);
        setStructure(newStructure);
        if (activeDusun === index) setActiveDusun(newStructure.dusun.length > 0 ? 0 : null);
        toast.success("Dusun berhasil dihapus");
    };

    const removeRW = (dusunIndex: number, rwIndex: number) => {
        const newStructure = structuredClone(structure);
        newStructure.dusun[dusunIndex].rw = newStructure.dusun[dusunIndex].rw.filter((_, i) => i !== rwIndex);
        setStructure(newStructure);
        toast.success("RW berhasil dihapus");
    };

    const removeRT = (dusunIndex: number, rwIndex: number, rtIndex: number) => {
        const newStructure = structuredClone(structure);
        newStructure.dusun[dusunIndex].rw[rwIndex].rt = newStructure.dusun[dusunIndex].rw[rwIndex].rt.filter((_, i) => i !== rtIndex);
        setStructure(newStructure);
    };

    const updateName = (type: 'dusun' | 'rw' | 'rt', value: string, dIdx: number, rIdx?: number, rtIdx?: number) => {
        const newStructure = structuredClone(structure);
        if (type === 'dusun') newStructure.dusun[dIdx].name = value;
        if (type === 'rw' && rIdx !== undefined) newStructure.dusun[dIdx].rw[rIdx].name = value;
        if (type === 'rt' && rIdx !== undefined && rtIdx !== undefined) newStructure.dusun[dIdx].rw[rIdx].rt[rtIdx] = value;
        setStructure(newStructure);
    };

    return (
        <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-500">
            {/* 1. HERO COMMAND HEADER (ALIGNED WITH ADMIN DESA EXECUTIVE STYLE) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a1122] to-slate-950 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-[90px] pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none -mb-20" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                            <Map size={12} className="text-blue-400" />
                            Village Territory Orchestrator
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                            Wilayah & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Administrasi</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-xs sm:text-sm leading-relaxed">
                            Pusat kendali struktur wilayah Cimanggu I. Kelola Dusun, RW, dan RT secara terpusat untuk sinkronisasi data kependudukan yang presisi.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button 
                            type="button"
                            onClick={addDusun}
                            className="px-4.5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold border border-white/15 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                        >
                            <Plus size={16} /> Tambah Dusun
                        </button>
                        <button 
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} 
                            <span>Simpan Struktur</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. DUSUN LIST & RW/RT WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 2A. DUSUN LIST (Left Navigation Panel) */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Daftar Dusun</h3>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                            {structure?.dusun?.length || 0} Unit
                        </span>
                    </div>

                    <div className="space-y-2">
                        {structure?.dusun?.map((dusun, idx) => (
                            <div
                                key={idx}
                                onClick={() => { setActiveDusun(idx); setActiveRW(null); }}
                                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all group cursor-pointer border ${
                                    activeDusun === idx 
                                    ? 'bg-slate-900 text-white shadow-md border-slate-800' 
                                    : 'bg-white text-slate-700 hover:bg-slate-50/80 border-slate-200/80 shadow-2xs'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                        activeDusun === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                                    }`}>
                                        <Home size={16} />
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                        <input 
                                            value={dusun.name}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => updateName('dusun', e.target.value, idx)}
                                            className={`bg-transparent border-none p-0 focus:ring-0 text-sm font-black w-full outline-none truncate ${
                                                activeDusun === idx ? 'text-white' : 'text-slate-900'
                                            }`}
                                        />
                                        <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                                            activeDusun === idx ? 'text-blue-300' : 'text-slate-400'
                                        }`}>
                                            {dusun.rw?.length || 0} RW Terdaftar
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeDusun(idx); }}
                                        title="Hapus Dusun"
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {(!structure?.dusun || structure.dusun.length === 0) && (
                            <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                                Belum ada dusun. Klik &quot;Tambah Dusun&quot; untuk membuat.
                            </div>
                        )}
                    </div>
                </div>

                {/* 2B. RW & RT MANAGEMENT (Main Interactive Workspace) */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    {activeDusun !== null && structure?.dusun?.[activeDusun] ? (
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[9px] font-black uppercase tracking-wider">
                                            Active Focus
                                        </span>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                            {structure.dusun[activeDusun]?.name || "Dusun Baru"}
                                        </h2>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Kelola pembagian RW dan RT di bawah naungan {structure.dusun[activeDusun]?.name || "Dusun"}.
                                    </p>
                                </div>

                                <button 
                                    type="button"
                                    onClick={() => addRW(activeDusun)}
                                    className="px-4.5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
                                >
                                    <Layers size={15} /> Tambah RW Baru
                                </button>
                            </div>

                            {(!structure.dusun[activeDusun]?.rw || structure.dusun[activeDusun]?.rw.length === 0) ? (
                                <div className="py-14 px-6 text-center bg-slate-50/70 rounded-2xl border-2 border-dashed border-slate-200">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300 shadow-xs">
                                        <Layers size={28} />
                                    </div>
                                    <p className="text-base font-black text-slate-800">Belum ada RW di Dusun ini</p>
                                    <p className="text-xs text-slate-400 font-medium mt-1">
                                        Klik tombol &quot;Tambah RW Baru&quot; di atas untuk mulai memetakan wilayah.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {structure.dusun[activeDusun]?.rw.map((rw, rIdx) => (
                                        <div key={rIdx} className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/70 hover:border-blue-300 transition-all space-y-4 group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <Layout size={18} />
                                                    </div>
                                                    <div>
                                                        <input 
                                                            value={rw.name}
                                                            onChange={(e) => updateName('rw', e.target.value, activeDusun, rIdx)}
                                                            className="bg-transparent border-none p-0 focus:ring-0 text-base font-black text-slate-900 outline-none w-28"
                                                        />
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                            {rw.rt?.length || 0} RT
                                                        </p>
                                                    </div>
                                                </div>

                                                <button 
                                                    type="button"
                                                    onClick={() => removeRW(activeDusun, rIdx)}
                                                    title="Hapus RW"
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="space-y-2 pt-2 border-t border-slate-200/60">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                                                        Daftar RT ({rw.rt?.length || 0})
                                                    </span>
                                                    <button 
                                                        type="button"
                                                        onClick={() => addRT(activeDusun, rIdx)}
                                                        className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                                                    >
                                                        <Plus size={12} /> Tambah RT
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {(rw.rt || []).map((rt, rtIdx) => (
                                                        <div key={rtIdx} className="flex items-center justify-between gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs group/rt">
                                                            <input 
                                                                value={rt}
                                                                onChange={(e) => updateName('rt', e.target.value, activeDusun, rIdx, rtIdx)}
                                                                className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-slate-700 outline-none w-full"
                                                            />
                                                            <button 
                                                                type="button"
                                                                onClick={() => removeRT(activeDusun, rIdx, rtIdx)}
                                                                title="Hapus RT"
                                                                className="opacity-0 group-hover/rt:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {(rw.rt || []).length === 0 && (
                                                        <div className="col-span-full py-2 text-center text-[11px] text-slate-400 italic">
                                                            Belum ada RT. Klik &quot;Tambah RT&quot;.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-3xl border border-slate-200/80 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                                <ArrowRight size={32} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Pilih Dusun Terlebih Dahulu</h2>
                            <p className="text-xs text-slate-400 font-medium max-w-xs mt-1">
                                Silakan klik salah satu dusun pada panel sebelah kiri untuk mengatur struktur RW dan RT.
                            </p>
                        </div>
                    )}

                    {/* 3. SYNC NOTICE & BEST PRACTICE INFO CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200/60 flex items-start gap-3.5">
                            <div className="w-9 h-9 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                                <Info size={18} />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Sinkronisasi Instan</h4>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    Setiap pembaruan Dusun/RW/RT akan langsung muncul di formulir pendaftaran warga baru, buku tamu, dan layanan administrasi desa.
                                </p>
                            </div>
                        </div>

                        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/60 flex items-start gap-3.5">
                            <div className="w-9 h-9 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                                <CheckCircle2 size={18} />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Akurasi Basis Data</h4>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    Mencegah perbedaan format penamaan wilayah dan memastikan seluruh data spasial sinkron di seluruh database Desa Cimanggu I.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
