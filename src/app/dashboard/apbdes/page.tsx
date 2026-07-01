"use client";

import { useEffect, useState } from "react";
import { getApbdesFinances, upsertApbdesFinance, deleteApbdesFinance } from "@/actions/dashboard";
import { useSession } from "next-auth/react";
import { PieChart, Plus, Trash2, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

export default function ApbdesPage() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;
    const email = session?.user?.email || "";
    const isKaurKeuangan = role === "KAUR_KEUANGAN" || (role === "KAUR" && email.includes("keuangan"));
    const canEdit = ["ADMIN_MASTER", "SEKDES"].includes(role) || isKaurKeuangan;
    const [finances, setFinances] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [tahun, setTahun] = useState(new Date().getFullYear());
    const [formData, setFormData] = useState<any>({
        kategori: "PENDAPATAN", sumberDana: "", anggaranTotal: "", realisasi: "", keterangan: ""
    });

    useEffect(() => {
        if (session?.user?.tenantId) {
            loadData();
        }
    }, [session, tahun]);

    const loadData = async () => {
        setIsLoading(true);
        const data = await getApbdesFinances(session?.user?.tenantId || "", tahun);
        setFinances(data);
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const ang = parseFloat(formData.anggaranTotal) || 0;
            const real = parseFloat(formData.realisasi) || 0;
            const persentase = ang > 0 ? (real / ang) * 100 : 0;
            
            await upsertApbdesFinance({
                ...formData,
                tahunAnggaran: tahun,
                anggaranTotal: ang,
                realisasi: real,
                persentase,
                tenantId: session?.user?.tenantId
            });
            setShowModal(false);
            setFormData({ kategori: "PENDAPATAN", sumberDana: "", anggaranTotal: "", realisasi: "", keterangan: "" });
            loadData();
        } catch (error) {
            alert("Gagal menyimpan data APBDes");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Hapus data ini?")) {
            await deleteApbdesFinance(id);
            loadData();
        }
    };

    const totalPendapatan = finances.filter(f => f.kategori === "PENDAPATAN").reduce((a, b) => a + b.anggaranTotal, 0);
    const totalBelanja = finances.filter(f => f.kategori === "BELANJA").reduce((a, b) => a + b.anggaranTotal, 0);
    const realisasiPendapatan = finances.filter(f => f.kategori === "PENDAPATAN").reduce((a, b) => a + b.realisasi, 0);
    const realisasiBelanja = finances.filter(f => f.kategori === "BELANJA").reduce((a, b) => a + b.realisasi, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/10 rounded-[1.25rem] flex items-center justify-center text-emerald-400 border border-white/10">
                        <PieChart size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Akuntabilitas APBDes</h1>
                        <p className="text-slate-400 text-sm font-medium">Transparansi Pendapatan dan Belanja Desa.</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-3">
                    <select 
                        value={tahun} 
                        onChange={e => setTahun(parseInt(e.target.value))}
                        className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:bg-white/20"
                    >
                        {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y} className="text-slate-900">Tahun {y}</option>)}
                    </select>
                    {canEdit && (
                        <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                            <Plus size={16}/> Input Realisasi
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><ArrowDownRight className="text-emerald-500"/> PENDAPATAN</h2>
                        <span className="text-2xl font-black text-emerald-600">Rp {totalPendapatan.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                        <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${totalPendapatan > 0 ? (realisasiPendapatan / totalPendapatan) * 100 : 0}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 font-bold text-right">Realisasi: Rp {realisasiPendapatan.toLocaleString('id-ID')}</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><ArrowUpRight className="text-rose-500"/> BELANJA</h2>
                        <span className="text-2xl font-black text-rose-600">Rp {totalBelanja.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                        <div className="bg-rose-500 h-3 rounded-full" style={{ width: `${totalBelanja > 0 ? (realisasiBelanja / totalBelanja) * 100 : 0}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 font-bold text-right">Realisasi: Rp {realisasiBelanja.toLocaleString('id-ID')}</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-x-auto">
                <h3 className="text-lg font-black text-slate-800 mb-6">Rincian APBDes {tahun}</h3>
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="pb-4 pl-4">Kategori & Sumber Daya</th>
                            <th className="pb-4 text-right">Anggaran (Rp)</th>
                            <th className="pb-4 text-right">Realisasi (Rp)</th>
                            <th className="pb-4 text-center">Persentase</th>
                            {canEdit && <th className="pb-4 text-right pr-4">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            <tr><td colSpan={5} className="py-8 text-center text-slate-400">Loading...</td></tr>
                        ) : finances.map((f: any) => (
                            <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 pl-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-8 rounded-full ${f.kategori === 'PENDAPATAN' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">{f.sumberDana}</div>
                                            <div className="text-[10px] text-slate-400">{f.keterangan || '-'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 text-right font-bold text-slate-600">{f.anggaranTotal.toLocaleString('id-ID')}</td>
                                <td className="py-4 text-right font-bold text-slate-800">{f.realisasi.toLocaleString('id-ID')}</td>
                                <td className="py-4 text-center">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">{f.persentase.toFixed(1)}%</span>
                                </td>
                                {canEdit && (
                                    <td className="py-4 text-right pr-4">
                                        <button onClick={() => handleDelete(f.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full">
                        <h2 className="text-xl font-black text-slate-800 mb-6">Input Data APBDes</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600">Kategori</label>
                                <select required value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border border-slate-200 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                    <option value="PENDAPATAN">Pendapatan Desa</option>
                                    <option value="BELANJA">Belanja Desa</option>
                                    <option value="PEMBIAYAAN">Pembiayaan</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600">Sumber Dana / Pos Belanja</label>
                                <input required value={formData.sumberDana} onChange={e => setFormData({...formData, sumberDana: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border border-slate-200" placeholder="Contoh: Dana Desa, ADD, dll" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600">Anggaran Total (Rp)</label>
                                <input required type="number" value={formData.anggaranTotal} onChange={e => setFormData({...formData, anggaranTotal: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border border-slate-200" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600">Realisasi Berjalan (Rp)</label>
                                <input required type="number" value={formData.realisasi} onChange={e => setFormData({...formData, realisasi: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border border-slate-200" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600">Keterangan Opsional</label>
                                <input value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} className="w-full px-4 py-3 mt-1 rounded-xl border border-slate-200" />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Batal</button>
                                <button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold">Simpan APBDes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
