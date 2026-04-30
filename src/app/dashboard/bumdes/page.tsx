"use client";

import { useState, useEffect } from "react";
import { getBumdesFinances, addBumdesTransaction } from "@/app/actions/village";
import { ShoppingBag, TrendingUp, DollarSign, Package, ExternalLink, Plus, X, Loader2, Save, ArrowUpRight, ArrowDownRight, History } from "lucide-react";

export default function BumdesPage() {
    const [finances, setFinances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        type: "INCOME",
        description: ""
    });

    const units = [
        { name: "Unit Simpan Pinjam", status: "Profit", growth: "+15%", icon: DollarSign },
        { name: "Unit Grosir Sembako", status: "Stable", growth: "+5%", icon: ShoppingBag },
        { name: "Unit Pengelolaan Sampah", status: "Growing", growth: "+20%", icon: Package }
    ];

    useEffect(() => {
        fetchFinances();
    }, []);

    const fetchFinances = async () => {
        setLoading(true);
        const data = await getBumdesFinances();
        setFinances(data);
        setLoading(false);
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await addBumdesTransaction(formData);
            setShowAddModal(false);
            fetchFinances();
            setFormData({ title: "", amount: "", type: "INCOME", description: "" });
        } catch (error) {
            console.error(error);
            alert("Gagal menambahkan transaksi.");
        } finally {
            setSaving(false);
        }
    };

    const totalIncome = finances.filter(f => f.type === "INCOME").reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = finances.filter(f => f.type === "EXPENSE").reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">BUMDesa</h1>
                    <p className="text-slate-500 text-sm">Badan Usaha Milik Desa - Penggerak Ekonomi Desa Cimanggu I.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#1e293b] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus size={16} /> Laporan Keuangan
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-2 block">Total Omset / Saldo</span>
                    <p className="text-3xl font-black mb-4">Rp {balance.toLocaleString('id-ID')}</p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase">
                        <TrendingUp size={14} /> Terpantau Real-time
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 lg:col-span-2 flex items-center gap-8">
                    <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-black text-slate-800">Cimanggu Mandiri Jaya</h3>
                        <p className="text-slate-500 text-sm font-medium">BUMDesa Cimanggu I saat ini mengelola 3 unit usaha aktif yang melayani kebutuhan pokok warga dan pemberdayaan lingkungan.</p>
                    </div>
                    <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <TrendingUp size={32} />
                    </div>
                </div>
            </div>

            {/* Financial History Section */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                        <History size={24} className="text-slate-400" /> Riwayat Transaksi Terbaru
                    </h3>
                </div>
                <div className="space-y-4">
                    {finances.length > 0 ? finances.map((f) => (
                        <div key={f.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {f.type === 'INCOME' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">{f.title}</h4>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{new Date(f.date).toLocaleDateString('id-ID')}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-black ${f.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {f.type === 'INCOME' ? '+' : '-'} Rp {f.amount.toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="py-12 text-center text-slate-400 font-medium text-sm">Belum ada catatan keuangan.</div>
                    )}
                </div>
            </div>

            {/* Business Units */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {units.map((unit, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <unit.icon size={24} />
                            </div>
                            <h4 className="text-xl font-black text-slate-800 mb-2">{unit.name}</h4>
                            <div className="flex items-center justify-between mt-6">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${unit.status === 'Profit' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {unit.status}
                                </span>
                                <span className="text-xs font-black text-slate-400">{unit.growth} Growth</span>
                            </div>
                            <button className="w-full mt-6 py-3 border-2 border-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all flex items-center justify-center gap-2">
                                Kelola Unit <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ADD TRANSACTION MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Catat Transaksi BUMDes</h2>
                                <p className="text-slate-500 text-xs font-medium">Laporan keuangan real-time unit usaha.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddTransaction} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan Transaksi</label>
                                <input required placeholder="Contoh: Penjualan Sembako Minggu I" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nominal (Rp)</label>
                                    <input type="number" required placeholder="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20">
                                        <option value="INCOME">Pemasukan (+)</option>
                                        <option value="EXPENSE">Pengeluaran (-)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Tambahan</label>
                                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 min-h-[80px]" />
                            </div>

                            <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Simpan Transaksi</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
