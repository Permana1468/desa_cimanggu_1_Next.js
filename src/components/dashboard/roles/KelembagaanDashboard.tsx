import { 
  Users,
  CalendarDays,
  Target,
  Trophy,
  Activity
} from "lucide-react";
import Link from "next/link";

export function KelembagaanDashboard({ session, stats }: { session: any, stats: any }) {
  const roleName = session?.user?.role?.replace(/_/g, ' ') || "Kelembagaan Desa";

  return (
    <div className="space-y-6">
      {/* HEADER CARD - VIOLET/PURPLE */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-violet-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-900/20 rounded-full blur-[60px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                    <Users size={14} /> Kelembagaan Masyarakat
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    Dashboard {roleName}
                </h1>
                <p className="text-violet-100 max-w-xl leading-relaxed">
                    Halo, <span className="text-white font-bold">{session?.user?.name}</span>. Kelola program kerja, anggota, dan agenda lembaga desa hari ini.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-violet-100 mb-1 uppercase">Total Anggota</span>
                    <span className="block text-3xl font-black text-white">45</span>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-violet-100 mb-1 uppercase">Agenda Aktif</span>
                    <span className="block text-3xl font-black text-white">3</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Program Kerja Mendatang</h2>
                        <p className="text-slate-500 text-sm">Agenda terdekat lembaga yang perlu dipersiapkan.</p>
                    </div>
                </div>
                <div className="p-12 text-center text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-2xl">
                    Belum ada agenda bulan ini.
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-800 mb-4">Aksi Cepat</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors">
                        <CalendarDays size={24} />
                        <span className="text-[10px] font-bold text-center">Buat Kegiatan</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                        <Users size={24} />
                        <span className="text-[10px] font-bold text-center">Kelola Anggota</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
