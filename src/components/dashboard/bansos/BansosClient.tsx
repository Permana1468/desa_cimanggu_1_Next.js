"use client";

import { useState, useEffect } from "react";
import { getBansosList, updateBansosData, getBansosStats } from "@/actions/bansos";
import { Loader2, HeartHandshake, Search, Filter, Edit, Check, X } from "lucide-react";

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
            className="cursor-pointer transition-all duration-200 hover:text-teal-600 select-all font-mono"
            title="Arahkan kursor atau klik untuk melihat lengkap"
        >
            {visible ? value : getMasked(value)}
        </span>
    );
}

export function BansosClient({ session }: { session: any }) {
    const role = session?.user?.role;
    const [wargaList, setWargaList] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editModeId, setEditModeId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const [list, st] = await Promise.all([
            getBansosList(),
            getBansosStats()
        ]);
        setWargaList(list);
        setStats(st);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (warga: any) => {
        setEditModeId(warga.id);
        setEditForm({
            desil: warga.bansosData?.desil || "",
            jenisBantuan: warga.bansosData?.jenisBantuan || [],
            status: warga.bansosData?.status || "AKTIF",
            keterangan: warga.bansosData?.keterangan || ""
        });
    };

    const handleSave = async (wargaId: string) => {
        setActionLoading(true);
        const res = await updateBansosData({
            wargaId,
            desil: editForm.desil ? parseInt(editForm.desil) : null,
            jenisBantuan: editForm.jenisBantuan,
            status: editForm.status,
            keterangan: editForm.keterangan
        });
        setActionLoading(false);
        if (res.success) {
            setEditModeId(null);
            fetchData();
        } else {
            alert("Gagal menyimpan data bansos");
        }
    };

    const toggleBantuan = (jenis: string) => {
        setEditForm((prev: any) => {
            const current = prev.jenisBantuan || [];
            if (current.includes(jenis)) {
                return { ...prev, jenisBantuan: current.filter((j: string) => j !== jenis) };
            } else {
                return { ...prev, jenisBantuan: [...current, jenis] };
            }
        });
    };

    const filteredList = wargaList.filter(w => 
        w.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) || 
        w.noKK.includes(searchTerm) || 
        w.nik.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">🤝 Data Bansos & Kesejahteraan</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Sistem manajemen data desil dan penerima bantuan sosial
                    </p>
                </div>
            </div>

            {/* STATS */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Total Warga" value={stats.totalWarga} />
                    <StatCard title="Total Penerima" value={stats.totalPenerima} color="emerald" />
                    <StatCard title="Penerima PKH" value={stats.pkhCount} color="indigo" />
                    <StatCard title="Penerima BPNT" value={stats.bpntCount} color="rose" />
                </div>
            )}

            {/* LIST */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari berdasarkan NIK, No KK, atau Nama..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:border-teal-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-teal-600 mb-4" size={32} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat data...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="p-4 rounded-l-xl">Identitas Warga</th>
                                    <th className="p-4">Desil (1-10)</th>
                                    <th className="p-4">Jenis Bantuan</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right rounded-r-xl">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredList.map((warga) => {
                                    const isEditing = editModeId === warga.id;
                                    const bd = warga.bansosData;
                                    
                                    return (
                                        <tr key={warga.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800">{warga.namaLengkap}</div>
                                                <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">NIK: <HoverMask value={warga.nik} /> | RT {warga.rt}/RW {warga.rw}</div>
                                            </td>
                                            
                                            <td className="p-4">
                                                {isEditing ? (
                                                    <input 
                                                        type="number" 
                                                        min="1" max="10"
                                                        value={editForm.desil}
                                                        onChange={e => setEditForm({...editForm, desil: e.target.value})}
                                                        className="w-16 border border-slate-300 rounded px-2 py-1 text-xs font-bold text-center"
                                                    />
                                                ) : (
                                                    <span className={`px-3 py-1 rounded text-xs font-black ${
                                                        bd?.desil ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                        {bd?.desil ? `Desil ${bd.desil}` : '-'}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                {isEditing ? (
                                                    <div className="flex gap-2 flex-wrap max-w-[200px]">
                                                        {["PKH", "BPNT", "BLT-DD", "KIP", "KIS"].map(j => (
                                                            <button
                                                                key={j}
                                                                onClick={() => toggleBantuan(j)}
                                                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${
                                                                    editForm.jenisBantuan?.includes(j) 
                                                                    ? 'bg-teal-50 border-teal-200 text-teal-700' 
                                                                    : 'bg-white border-slate-200 text-slate-400'
                                                                }`}
                                                            >
                                                                {j}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {bd?.jenisBantuan && bd.jenisBantuan.length > 0 ? bd.jenisBantuan.map((j: string) => (
                                                            <span key={j} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                                                {j}
                                                            </span>
                                                        )) : <span className="text-xs text-slate-400 font-semibold">-</span>}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                {isEditing ? (
                                                    <select 
                                                        value={editForm.status}
                                                        onChange={e => setEditForm({...editForm, status: e.target.value})}
                                                        className="border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                                                    >
                                                        <option value="AKTIF">AKTIF</option>
                                                        <option value="NON-AKTIF">NON-AKTIF</option>
                                                        <option value="USULAN_RT">USULAN RT</option>
                                                    </select>
                                                ) : (
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                                                        bd?.status === "AKTIF" ? "bg-indigo-50 text-indigo-600" :
                                                        bd?.status === "USULAN_RT" ? "bg-amber-50 text-amber-600" :
                                                        "bg-rose-50 text-rose-600"
                                                    }`}>
                                                        {bd?.status || "-"}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 text-right">
                                                {isEditing ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => setEditModeId(null)}
                                                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleSave(warga.id)}
                                                            disabled={actionLoading}
                                                            className="p-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleEdit(warga)}
                                                        className="text-[10px] font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                                                    >
                                                        <Edit size={12} /> Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredList.length === 0 && (
                            <div className="text-center py-10 text-slate-400 font-semibold">
                                Tidak ada data warga.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, color = "teal" }: { title: string, value: number, color?: string }) {
    const colors: Record<string, string> = {
        teal: "bg-teal-50 text-teal-600 border-teal-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100"
    };

    return (
        <div className={`p-4 rounded-2xl border ${colors[color]} flex flex-col items-center justify-center text-center shadow-sm`}>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">{title}</span>
            <span className="text-2xl font-black">{value}</span>
        </div>
    );
}
