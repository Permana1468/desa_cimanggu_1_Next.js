import { 
  Store,
  ShoppingBag,
  TrendingUp,
  PackageSearch,
  Banknote
} from "lucide-react";
import Link from "next/link";

export function EkonomiDashboard({ session, stats }: { session: any, stats: any }) {
  const roleName = session?.user?.role?.replace(/_/g, ' ') || "Ekonomi Desa";

  return (
    <div className="space-y-6">
      {/* HEADER CARD - ORANGE/AMBER */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-orange-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-900/20 rounded-full blur-[60px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                    <Store size={14} /> Ekonomi & Bisnis Desa
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    Dashboard {roleName}
                </h1>
                <p className="text-orange-100 max-w-xl leading-relaxed">
                    Halo, <span className="text-white font-bold">{session?.user?.name}</span>. Pantau omset penjualan, kelola inventaris, dan pesanan produk unggulan desa.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-orange-100 mb-1 uppercase">Pesanan Baru</span>
                    <span className="block text-3xl font-black text-white">12</span>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-orange-100 mb-1 uppercase">Total Omset Bulan Ini</span>
                    <span className="block text-xl font-black text-white mt-1">Rp 12,5 Juta</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Daftar Pesanan Terkini</h2>
                        <p className="text-slate-500 text-sm">Pesanan masuk dari warga atau pelanggan luar desa.</p>
                    </div>
                </div>
                <div className="p-12 text-center text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-2xl">
                    Semua pesanan telah diproses.
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-800 mb-4">Pusat Kelola Bisnis</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                        <ShoppingBag size={24} />
                        <span className="text-[10px] font-bold text-center">Kelola Produk</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                        <Banknote size={24} />
                        <span className="text-[10px] font-bold text-center">Tarik Dana</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
