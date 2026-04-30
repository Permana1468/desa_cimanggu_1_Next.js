import { ShoppingBag, TrendingUp, DollarSign, Package, ExternalLink } from "lucide-react";

export default function BumdesPage() {
    const units = [
        { name: "Unit Simpan Pinjam", status: "Profit", growth: "+15%", icon: DollarSign },
        { name: "Unit Grosir Sembako", status: "Stable", growth: "+5%", icon: ShoppingBag },
        { name: "Unit Pengelolaan Sampah", status: "Growing", growth: "+20%", icon: Package }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">BUMDesa</h1>
                    <p className="text-slate-500 text-sm">Badan Usaha Milik Desa - Penggerak Ekonomi Desa Cimanggu I.</p>
                </div>
                <button className="bg-[#1e293b] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
                    Laporan Keuangan
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-2 block">Total Omset (YTD)</span>
                    <p className="text-3xl font-black mb-4">Rp 452.800.000</p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase">
                        <TrendingUp size={14} /> +12% dari tahun lalu
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
        </div>
    );
}
