"use client";

import { useState, useEffect } from "react";
import { getBumdesFinances, addBumdesTransaction } from "@/actions/village";
import { 
    ShoppingBag, 
    TrendingUp, 
    DollarSign, 
    Package, 
    ExternalLink, 
    Plus, 
    X, 
    Loader2, 
    Save, 
    ArrowUpRight, 
    ArrowDownRight, 
    History,
    PieChart,
    BarChart3,
    Activity,
    CreditCard
} from "lucide-react";

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
        { name: "Unit Simpan Pinjam", status: "Profit", growth: "+15%", icon: CreditCard, color: "blue" },
        { name: "Unit Grosir Sembako", status: "Stable", growth: "+5%", icon: ShoppingBag, color: "emerald" },
        { name: "Unit Pengelolaan Sampah", status: "Growing", growth: "+20%", icon: Package, color: "amber" }
    ];

    useEffect(() => {
        fetchFinances();
    }, []);

    const fetchFinances = async () => {
        setLoading(true);
        try {
            const data = await getBumdesFinances();
            setFinances(data);
        } catch (err) {
            console.error(err);
        }
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
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-slate-400 font-bold animate-pulse">Memuat Data Keuangan...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">BUMDesa Monitoring</h1>
                    <p className="text-slate-500 font-medium mt-1">Badan Usaha Milik Desa - Penggerak Ekonomi Desa Cimanggu I.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-slate-900/10 hover:bg-black transition-all active:scale-95 flex items-center gap-2 group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Tambah Laporan
                </button>
            </div>

            {/* MONITORING PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Stats */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#0f172a] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[240px]">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20" />
                        <div className="relative z-10">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2 block">Total Saldo Aktif</span>
                            <p className="text-4xl font-black tracking-tight">Rp {balance.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="px-4 py-2 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp size={14} className="text-emerald-400" /> +12.5% MTD
                            </div>
                            <div className="px-4 py-2 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                Real-time Audit
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[240px]">
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20" />
                        <div className="relative z-10">
                            <span className="text-[10px] font-black text-emerald-200 uppercase tracking-[0.3em] mb-2 block">Total Pemasukan (YTD)</span>
                            <p className="text-4xl font-black tracking-tight">Rp {totalIncome.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="relative z-10">
                             <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                 <div className="w-3/4 h-full bg-white rounded-full shadow-sm" />
                             </div>
                             <p className="text-[10px] font-bold mt-3 text-emerald-100">75% dari target tahunan desa</p>
                        </div>
                    </div>
                </div>

                {/* Quick Info */}
                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200/60 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 shadow-inner">
                            <Activity size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Cimanggu Mandiri Jaya</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">Saat ini mengelola unit usaha strategis untuk kemandirian ekonomi desa.</p>
                    </div>
                    <div className="pt-8 border-t border-slate-50">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Kesehatan Usaha</span>
                            <span className="text-emerald-600">SANGAT BAIK</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BUSINESS UNITS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {units.map((unit, i) => (
                    <div key={i} className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200/60 hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
                        <div className={`absolute -bottom-6 -right-6 w-32 h-32 bg-${unit.color}-50 rounded-full group-hover:scale-150 transition-transform duration-1000`} />
                        <div className="relative z-10">
                            <div className={`w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm mb-8`}>
                                <unit.icon size={28} />
                            </div>
                            <h4 className="text-2xl font-black text-slate-800 mb-2">{unit.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit Bisnis Aktif</p>
                            
                            <div className="flex items-center justify-between mt-10">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${unit.status === 'Profit' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {unit.status}
                                </span>
                                <div className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                                    <ArrowUpRight size={16} /> {unit.growth}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TRANSACTION HISTORY */}
            <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                             <History size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Riwayat Transaksi</h3>
                            <p className="text-slate-500 font-medium text-sm mt-0.5">Laporan arus kas terbaru dari seluruh unit usaha.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900"><PieChart size={20} /></button>
                        <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900"><BarChart3 size={20} /></button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {finances.length > 0 ? finances.map((f) => (
                        <div key={f.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group">
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-all ${f.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white'}`}>
                                    {f.type === 'INCOME' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-800 leading-tight mb-1">{f.title}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(f.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{f.description || "General"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-xl font-black tracking-tight ${f.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {f.type === 'INCOME' ? '+' : '-'} Rp {f.amount.toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                <DollarSign size={40} />
                            </div>
                            <p className="text-slate-400 font-bold">Belum ada catatan transaksi keuangan terdaftar.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ADD TRANSACTION MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Catat Transaksi</h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">Laporan keuangan real-time unit usaha BUMDes.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddTransaction} className="p-10 overflow-y-auto space-y-8 custom-scrollbar bg-white">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Keterangan Transaksi</label>
                                <input required placeholder="Contoh: Penjualan Sembako Minggu I" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold text-slate-950 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white transition-all outline-none" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nominal (Rp)</label>
                                    <input type="number" required placeholder="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold text-slate-950 focus:border-blue-500 focus:bg-white transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Jenis Transaksi</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold text-slate-950 focus:border-blue-500 focus:bg-white transition-all outline-none appearance-none">
                                        <option value="INCOME">Pemasukan (+)</option>
                                        <option value="EXPENSE">Pengeluaran (-)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Catatan Tambahan</label>
                                <textarea placeholder="Detail sumber dana atau alokasi..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold text-slate-950 min-h-[120px] focus:border-blue-500 focus:bg-white transition-all outline-none" />
                            </div>

                            <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Simpan Laporan Keuangan</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
