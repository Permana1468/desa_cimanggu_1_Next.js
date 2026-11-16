"use client";

import { useState, useEffect } from "react";
import { 
    HeartPulse, Plus, Trash2, Calendar, Activity, Users, 
    Percent, Baby, Sparkles, Edit3, X, RefreshCw, ShieldCheck
} from "lucide-react";
import { 
    getRwHealthData, addRwHealthData, updateRwHealthData, 
    deleteRwHealthData, getRwHealthRealtimeSummary 
} from "@/actions/rw";

export function RwHealthTab({ session }: { session: any }) {
    const rwNo = (session?.user as any)?.rw || "009";
    const [dataList, setDataList] = useState<any[]>([]);
    const [realtimeSummary, setRealtimeSummary] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    const [form, setForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        posyanduName: "",
        balitaTotal: 0,
        balitaStunting: 0,
        ibuHamil: 0,
        lansia: 0,
        imunisasiPercentage: 0,
        notes: ""
    });

    const canEdit = session?.user?.role === "RW" || session?.user?.role === "POSYANDU" || session?.user?.role === "ADMIN_DESA" || session?.user?.role === "KADES";

    const loadData = async () => {
        setLoading(true);
        const [data, summary] = await Promise.all([
            getRwHealthData(),
            getRwHealthRealtimeSummary()
        ]);
        setDataList(data);
        setRealtimeSummary(summary);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApplyRealtimeStats = () => {
        if (!realtimeSummary) return;
        setForm(prev => ({
            ...prev,
            balitaTotal: realtimeSummary.totalBalita || prev.balitaTotal,
            lansia: realtimeSummary.totalLansia || prev.lansia
        }));
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        await addRwHealthData({
            ...form,
            month: Number(form.month),
            year: Number(form.year),
            balitaTotal: Number(form.balitaTotal),
            balitaStunting: Number(form.balitaStunting),
            ibuHamil: Number(form.ibuHamil),
            lansia: Number(form.lansia),
            imunisasiPercentage: Number(form.imunisasiPercentage)
        });
        setForm({
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            posyanduName: "",
            balitaTotal: 0,
            balitaStunting: 0,
            ibuHamil: 0,
            lansia: 0,
            imunisasiPercentage: 0,
            notes: ""
        });
        setSubmitting(false);
        loadData();
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setSubmitting(true);
        await updateRwHealthData(editingItem.id, {
            month: Number(editingItem.month),
            year: Number(editingItem.year),
            posyanduName: editingItem.posyanduName,
            balitaTotal: Number(editingItem.balitaTotal),
            balitaStunting: Number(editingItem.balitaStunting),
            ibuHamil: Number(editingItem.ibuHamil),
            lansia: Number(editingItem.lansia),
            imunisasiPercentage: Number(editingItem.imunisasiPercentage),
            notes: editingItem.notes
        });
        setSubmitting(false);
        setEditingItem(null);
        loadData();
    };

    return (
        <div className="space-y-6">
            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700 rounded-[2.5rem] p-7 md:p-8 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[70px] -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-rose-100 text-[11px] font-bold backdrop-blur-md mb-3 border border-white/20">
                            <Sparkles size={13} className="text-amber-300" />
                            <span>Kesehatan Masyarakat & Posyandu Lingkungan RW {rwNo}</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black mb-2 flex items-center gap-3">
                            <HeartPulse className="shrink-0" /> Pemantauan Kesehatan & Posyandu RW {rwNo}
                        </h2>
                        <p className="text-rose-100 max-w-xl text-xs sm:text-sm leading-relaxed">
                            Integrasi data bulanan posyandu, pencegahan stunting, pemantauan kesehatan ibu hamil, dan layanan posbindu lansia.
                        </p>
                    </div>

                    <button 
                        onClick={loadData}
                        className="self-start md:self-center p-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                        title="Segarkan Data"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* REAL-TIME RESIDENT DEMOGRAPHICS STATS CARD */}
            {realtimeSummary && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                                Integrasi Data Riil Kependudukan
                            </span>
                            <h3 className="text-sm font-black text-slate-800">Populasi Sasaran Posyandu di Wilayah RW {rwNo}</h3>
                        </div>
                        {canEdit && (
                            <button
                                type="button"
                                onClick={handleApplyRealtimeStats}
                                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-rose-200/60"
                            >
                                Gunakan Angka Riil ke Form Input
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Warga RW</span>
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-slate-600" />
                                <span className="text-xl font-black text-slate-800">{realtimeSummary.totalWarga} Jiwa</span>
                            </div>
                        </div>

                        <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100">
                            <span className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Balita (0-5 Thn)</span>
                            <div className="flex items-center gap-2">
                                <Baby size={16} className="text-blue-600" />
                                <span className="text-xl font-black text-blue-700">{realtimeSummary.totalBalita} Anak</span>
                            </div>
                        </div>

                        <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100">
                            <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Lansia (&ge; 60 Thn)</span>
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-amber-600" />
                                <span className="text-xl font-black text-amber-700">{realtimeSummary.totalLansia} Jiwa</span>
                            </div>
                        </div>

                        <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100">
                            <span className="text-[10px] font-bold text-purple-600 uppercase block mb-1">Kepala Keluarga</span>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-purple-600" />
                                <span className="text-xl font-black text-purple-700">{realtimeSummary.totalKK} KK</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM INPUT BULANAN (KIRI) */}
                {canEdit && (
                    <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-xs h-fit space-y-4">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                            <Plus size={18} className="text-rose-600" /> Input Rekapitulasi Posyandu
                        </h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Bulan</label>
                                    <select 
                                        required 
                                        value={form.month} 
                                        onChange={e => setForm({...form, month: Number(e.target.value)})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900"
                                    >
                                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                            <option key={m} value={m}>Bulan {m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Tahun</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={form.year} 
                                        onChange={e => setForm({...form, year: Number(e.target.value)})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nama Posyandu / Lokasi</label>
                                <input 
                                    required 
                                    value={form.posyanduName} 
                                    onChange={e => setForm({...form, posyanduName: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    placeholder="Contoh: Posyandu Mawar RW 09" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Total Balita Ditimbang</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="0"
                                        value={form.balitaTotal} 
                                        onChange={e => setForm({...form, balitaTotal: Number(e.target.value)})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-wider block mb-1">Balita Stunting</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="0"
                                        value={form.balitaStunting} 
                                        onChange={e => setForm({...form, balitaStunting: Number(e.target.value)})} 
                                        className="w-full bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-xs font-bold" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Ibu Hamil Dipantau</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="0"
                                        value={form.ibuHamil} 
                                        onChange={e => setForm({...form, ibuHamil: Number(e.target.value)})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Lansia Terlayani</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="0"
                                        value={form.lansia} 
                                        onChange={e => setForm({...form, lansia: Number(e.target.value)})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Capaian Imunisasi (%)</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    min="0"
                                    max="100"
                                    required 
                                    value={form.imunisasiPercentage} 
                                    onChange={e => setForm({...form, imunisasiPercentage: Number(e.target.value)})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    placeholder="Contoh: 92.5" 
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Catatan Tambahan / Hambatan</label>
                                <textarea 
                                    value={form.notes} 
                                    onChange={e => setForm({...form, notes: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold min-h-[70px] text-slate-900" 
                                    placeholder="Catatan kegiatan PMT atau kunjungan rumah..." 
                                />
                            </div>

                            <button 
                                disabled={submitting} 
                                type="submit" 
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-all text-xs shadow-md shadow-rose-600/20 cursor-pointer"
                            >
                                {submitting ? "Menyimpan..." : "Simpan Rekap Posyandu"}
                            </button>
                        </form>
                    </div>
                )}

                {/* DAFTAR LAPORAN (KANAN) */}
                <div className={`lg:col-span-${canEdit ? '2' : '3'} space-y-6`}>
                    {loading ? (
                        <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-200/80">
                            <RefreshCw className="animate-spin text-rose-600 mx-auto mb-3" size={32} />
                            <p className="text-xs font-bold text-slate-500">Memuat data posyandu RW...</p>
                        </div>
                    ) : dataList.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-200/80 text-slate-500 space-y-3">
                            <HeartPulse className="mx-auto text-slate-300" size={42} />
                            <p className="font-bold text-sm text-slate-700">Belum ada rekapan data kesehatan bulanan.</p>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                Masukkan laporan posyandu melalui formulir di samping untuk memantau status kesehatan balita dan lansia.
                            </p>
                        </div>
                    ) : dataList.map(item => (
                        <div key={item.id} className="bg-white p-7 lg:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-xs relative group overflow-hidden hover:border-rose-200 transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Calendar size={13} className="text-rose-500" />
                                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                            Bulan {item.month} / Tahun {item.year}
                                        </span>
                                    </div>
                                    <h4 className="font-black text-slate-900 text-xl tracking-tight">{item.posyanduName}</h4>
                                </div>

                                {canEdit && (
                                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                        <button 
                                            onClick={() => setEditingItem(item)}
                                            className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                                            title="Edit Data"
                                        >
                                            <Edit3 size={15} />
                                        </button>
                                        <button 
                                            onClick={async () => { 
                                                if (confirm(`Hapus data posyandu "${item.posyanduName}" Bulan ${item.month}/${item.year}?`)) { 
                                                    await deleteRwHealthData(item.id); 
                                                    loadData(); 
                                                } 
                                            }} 
                                            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
                                            title="Hapus Data"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Total Balita</span>
                                    <div className="flex items-center gap-2">
                                        <Baby size={18} className="text-blue-500" />
                                        <span className="text-xl font-black text-blue-800">{item.balitaTotal}</span>
                                    </div>
                                </div>

                                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
                                    <span className="text-[10px] font-bold text-rose-600 uppercase block mb-1">Stunting</span>
                                    <div className="flex items-center gap-2">
                                        <Activity size={18} className="text-rose-500" />
                                        <span className="text-xl font-black text-rose-700">{item.balitaStunting}</span>
                                    </div>
                                </div>

                                <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4">
                                    <span className="text-[10px] font-bold text-purple-600 uppercase block mb-1">Ibu Hamil</span>
                                    <div className="flex items-center gap-2">
                                        <HeartPulse size={18} className="text-purple-500" />
                                        <span className="text-xl font-black text-purple-800">{item.ibuHamil}</span>
                                    </div>
                                </div>

                                <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4">
                                    <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Lansia</span>
                                    <div className="flex items-center gap-2">
                                        <Users size={18} className="text-amber-500" />
                                        <span className="text-xl font-black text-amber-800">{item.lansia}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-5 border-t border-slate-100 text-xs">
                                <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200/60">
                                    <Percent size={13} className="text-emerald-600" />
                                    <span className="font-black text-emerald-800">Partisipasi Imunisasi: {item.imunisasiPercentage}%</span>
                                </div>
                                {item.notes && (
                                    <p className="text-slate-500 italic text-[11px] max-w-md">
                                        &ldquo;{item.notes}&rdquo;
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL EDIT DATA KESEHATAN */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="font-black text-slate-900 text-base">Edit Rekapitulasi Posyandu</h4>
                            <button onClick={() => setEditingItem(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Bulan</label>
                                    <select 
                                        required 
                                        value={editingItem.month} 
                                        onChange={e => setEditingItem({...editingItem, month: Number(e.target.value)})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900"
                                    >
                                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                            <option key={m} value={m}>Bulan {m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Tahun</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={editingItem.year} 
                                        onChange={e => setEditingItem({...editingItem, year: Number(e.target.value)})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nama Posyandu</label>
                                <input 
                                    required 
                                    value={editingItem.posyanduName} 
                                    onChange={e => setEditingItem({...editingItem, posyanduName: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Total Balita</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={editingItem.balitaTotal} 
                                        onChange={e => setEditingItem({...editingItem, balitaTotal: Number(e.target.value)})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-wider block mb-1">Balita Stunting</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={editingItem.balitaStunting} 
                                        onChange={e => setEditingItem({...editingItem, balitaStunting: Number(e.target.value)})} 
                                        className="w-full bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-xs font-bold" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Ibu Hamil</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={editingItem.ibuHamil} 
                                        onChange={e => setEditingItem({...editingItem, ibuHamil: Number(e.target.value)})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Lansia</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={editingItem.lansia} 
                                        onChange={e => setEditingItem({...editingItem, lansia: Number(e.target.value)})} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Imunisasi (%)</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    required 
                                    value={editingItem.imunisasiPercentage} 
                                    onChange={e => setEditingItem({...editingItem, imunisasiPercentage: Number(e.target.value)})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900" 
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Catatan Tambahan</label>
                                <textarea 
                                    value={editingItem.notes || ""} 
                                    onChange={e => setEditingItem({...editingItem, notes: e.target.value})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold min-h-[60px] text-slate-900" 
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                                    Batal
                                </button>
                                <button disabled={submitting} type="submit" className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-md">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
