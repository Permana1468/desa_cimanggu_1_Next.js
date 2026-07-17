"use client";

import { useState, useEffect } from "react";
import { HeartPulse, Plus, Trash2, Calendar, Activity, Users, Percent, Baby } from "lucide-react";
import { getRwHealthData, addRwHealthData, deleteRwHealthData } from "@/actions/rw";

export function RwHealthTab({ session }: { session: any }) {
    const [dataList, setDataList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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

    const canEdit = session?.user?.role === "RW" || session?.user?.role === "POSYANDU";

    const loadData = async () => {
        setLoading(true);
        const data = await getRwHealthData();
        setDataList(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);


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

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -mr-32 -mt-32" />
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black mb-2 flex items-center gap-3"><HeartPulse /> Rekapitulasi Posyandu RW</h2>
                        <p className="text-rose-100 max-w-md text-sm">Pemantauan kesehatan warga secara terpadu meliputi kondisi balita, ibu hamil, dan lansia.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {canEdit && (
                    <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
                        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Plus size={18} className="text-emerald-500" /> Input Data Bulanan
                        </h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase">Bulan</label>
                                    <select required value={form.month} onChange={e => setForm({...form, month: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold">
                                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                            <option key={m} value={m}>Bulan {m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase">Tahun</label>
                                    <input type="number" required value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase">Nama Posyandu</label>
                                <input required value={form.posyanduName} onChange={e => setForm({...form, posyanduName: e.target.value})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="Contoh: Mawar Merah 1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase">Total Balita</label>
                                    <input type="number" required value={form.balitaTotal} onChange={e => setForm({...form, balitaTotal: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase text-rose-500">Balita Stunting</label>
                                    <input type="number" required value={form.balitaStunting} onChange={e => setForm({...form, balitaStunting: Number(e.target.value)})} className="w-full mt-1 bg-rose-50 text-rose-700 border-none rounded-xl px-4 py-3 text-sm font-bold" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase">Ibu Hamil</label>
                                    <input type="number" required value={form.ibuHamil} onChange={e => setForm({...form, ibuHamil: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase">Lansia</label>
                                    <input type="number" required value={form.lansia} onChange={e => setForm({...form, lansia: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase">Partisipasi Imunisasi (%)</label>
                                <input type="number" step="0.1" required value={form.imunisasiPercentage} onChange={e => setForm({...form, imunisasiPercentage: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="Contoh: 85.5" />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase">Keterangan / Catatan Tambahan</label>
                                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full mt-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm min-h-[80px]" placeholder="Catatan kegiatan..." />
                            </div>
                            <button disabled={submitting} type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all">
                                {submitting ? "Menyimpan..." : "Simpan Data Posyandu"}
                            </button>
                        </form>
                    </div>
                )}

                <div className={`lg:col-span-${canEdit ? '2' : '3'} space-y-6`}>
                    {loading ? <div className="p-8 text-center animate-pulse">Memuat...</div> : dataList.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-200 text-slate-500 font-medium">Belum ada rekapan data kesehatan.</div>
                    ) : dataList.map(item => (
                        <div key={item.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative group overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10" />
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={14} className="text-slate-400" />
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Bulan {item.month} Tahun {item.year}</span>
                                    </div>
                                    <h4 className="font-black text-slate-800 text-xl">{item.posyanduName}</h4>
                                </div>
                                {canEdit && (
                                    <button onClick={async () => { if(confirm("Hapus data ini?")) { await deleteRwHealthData(item.id); loadData(); } }} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">Total Balita</span>
                                    <div className="flex items-center gap-2">
                                        <Baby size={18} className="text-blue-500" />
                                        <span className="text-xl font-black text-blue-700">{item.balitaTotal}</span>
                                    </div>
                                </div>
                                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
                                    <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">Stunting</span>
                                    <div className="flex items-center gap-2">
                                        <Activity size={18} className="text-rose-500" />
                                        <span className="text-xl font-black text-rose-700">{item.balitaStunting}</span>
                                    </div>
                                </div>
                                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4">
                                    <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">Ibu Hamil</span>
                                    <div className="flex items-center gap-2">
                                        <HeartPulse size={18} className="text-purple-500" />
                                        <span className="text-xl font-black text-purple-700">{item.ibuHamil}</span>
                                    </div>
                                </div>
                                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
                                    <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Lansia</span>
                                    <div className="flex items-center gap-2">
                                        <Users size={18} className="text-amber-500" />
                                        <span className="text-xl font-black text-amber-700">{item.lansia}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                    <Percent size={14} className="text-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-700">Imunisasi: {item.imunisasiPercentage}%</span>
                                </div>
                                {item.notes && <p className="text-xs text-slate-500 italic max-w-sm">&quot;{item.notes}&quot;</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
