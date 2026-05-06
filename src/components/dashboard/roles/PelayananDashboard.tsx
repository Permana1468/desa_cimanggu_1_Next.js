import { 
  Users,
  FileText,
  ClipboardList,
  Printer,
  Mail,
  ChevronRight,
  MonitorSmartphone
} from "lucide-react";
import Link from "next/link";

export function PelayananDashboard({ session, stats }: { session: any, stats: any }) {
  const roleName = session?.user?.role?.replace(/_/g, ' ') || "Pelayanan Administrasi";

  return (
    <div className="space-y-6">
      {/* HEADER CARD - INDIGO */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-indigo-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/20 rounded-full blur-[60px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                    <MonitorSmartphone size={14} /> Tata Usaha & Pelayanan
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    {roleName}
                </h1>
                <p className="text-indigo-100 max-w-xl leading-relaxed">
                    Halo, <span className="text-white font-bold">{session?.user?.name}</span>. Kelola arsip desa, registrasi kependudukan, dan antrean layanan publik hari ini.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-indigo-100 mb-1 uppercase">Surat Masuk</span>
                    <span className="block text-3xl font-black text-white">24</span>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-indigo-100 mb-1 uppercase">Antrean Warga</span>
                    <span className="block text-3xl font-black text-white">5</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Antrean Loket Pelayanan</h2>
                        <p className="text-slate-500 text-sm">Proses dokumen warga yang menunggu di balai desa atau via online.</p>
                    </div>
                </div>
                <div className="p-12 text-center text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-2xl">
                    Semua antrean pelayanan telah diselesaikan.
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-800 mb-4">Pintasan Layanan</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                        <Printer size={24} />
                        <span className="text-[10px] font-bold text-center">Cetak Surat</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                        <ClipboardList size={24} />
                        <span className="text-[10px] font-bold text-center">Buku Tamu</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                        <Users size={24} />
                        <span className="text-[10px] font-bold text-center">Mutasi Warga</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                        <Mail size={24} />
                        <span className="text-[10px] font-bold text-center">Arsip Digital</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
