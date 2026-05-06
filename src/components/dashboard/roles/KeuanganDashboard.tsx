import { 
  Wallet,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import Link from "next/link";

export function KeuanganDashboard({ session, stats }: { session: any, stats: any }) {
  const roleName = session?.user?.role?.replace(/_/g, ' ') || "Perencanaan & Keuangan";

  return (
    <div className="space-y-6">
      {/* HEADER CARD - AMBER/YELLOW */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-amber-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-900/20 rounded-full blur-[60px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                    <Wallet size={14} /> Keuangan Desa
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    {roleName}
                </h1>
                <p className="text-amber-100 max-w-xl leading-relaxed">
                    Halo, <span className="text-white font-bold">{session?.user?.name}</span>. Pantau APBDes, serapan anggaran, dan progres RAB hari ini.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-amber-100 mb-1 uppercase">Serapan Dana Desa</span>
                    <span className="block text-3xl font-black text-white">45%</span>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-amber-100 mb-1 uppercase">Sisa Anggaran</span>
                    <span className="block text-xl font-black text-white mt-1">Rp 450 Juta</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Ringkasan APBDes 2026</h2>
                        <p className="text-slate-500 text-sm">Alokasi dan realisasi anggaran berjalan.</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="p-5 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-amber-200 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <ArrowDownRight size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Pendapatan Desa</h4>
                                <span className="text-xs text-slate-400">Target: Rp 1.2 Miliar</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-emerald-600">Rp 800 Juta</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">66% Tercapai</span>
                        </div>
                    </div>

                    <div className="p-5 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-amber-200 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                <ArrowUpRight size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Belanja Desa</h4>
                                <span className="text-xs text-slate-400">Pagu: Rp 1.2 Miliar</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-rose-600">Rp 450 Juta</span>
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">37% Terserap</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-800 mb-4">Menu Keuangan</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">
                        <FileSpreadsheet size={24} />
                        <span className="text-[10px] font-bold text-center">Input RAB</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                        <PieChart size={24} />
                        <span className="text-[10px] font-bold text-center">Laporan Realisasi</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
