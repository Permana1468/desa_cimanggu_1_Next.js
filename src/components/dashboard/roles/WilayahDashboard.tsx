import { 
  Users,
  MapPin,
  FileText,
  AlertTriangle,
  HeartPulse,
  TrendingUp,
  Search,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export function WilayahDashboard({ session, stats }: { session: any, stats: any }) {
  const roleName = session?.user?.role?.replace('_', ' ') || "Perangkat Wilayah";
  const userRt = (session?.user as any)?.rt;
  const userRw = (session?.user as any)?.rw;

  let displayTitle = `Dashboard ${roleName}`;
  if (roleName === "RT" && userRt && userRw) {
    displayTitle = `Dashboard RT ${userRt} / RW ${userRw}`;
  } else if (roleName === "RW" && userRw) {
    displayTitle = `Dashboard RW ${userRw}`;
  }

  return (
    <div className="space-y-6">
      {/* HEADER CARD - EMERALD/TEAL (Different from Executive Dark) */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-teal-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-900/20 rounded-full blur-[60px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                    <MapPin size={14} /> Panel Wilayah
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    {displayTitle}
                </h1>
                <p className="text-teal-100 max-w-xl leading-relaxed">
                    Halo, <span className="text-white font-bold">{session?.user?.name}</span>. Pantau statistik warga dan kelola administrasi di wilayah Anda.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-medium backdrop-blur-sm">
                        <Users size={14} className="text-teal-200" /> 124 Kepala Keluarga
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-medium backdrop-blur-sm">
                        <FileText size={14} className="text-teal-200" /> 3 Pengajuan Pengantar
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-teal-100 mb-1 uppercase">Total Warga</span>
                    <span className="block text-3xl font-black text-white">458</span>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-teal-100 mb-1 uppercase">Keluarga Prasejahtera</span>
                    <span className="block text-3xl font-black text-white">12</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: DEMOGRAPHICS & QUICK STATS */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-800 mb-4">Aktivitas Terkini</h2>
                <div className="space-y-4">
                    <ActivityItem 
                        icon={FileText} 
                        title="Surat Keterangan Usaha" 
                        desc="Bpk. Ahmad meminta tanda tangan pengantar RT." 
                        time="10 Menit lalu"
                        color="text-blue-600 bg-blue-50"
                    />
                    <ActivityItem 
                        icon={AlertTriangle} 
                        title="Laporan Warga" 
                        desc="Pohon tumbang di jalan utama." 
                        time="2 Jam lalu"
                        color="text-amber-600 bg-amber-50"
                    />
                    <ActivityItem 
                        icon={HeartPulse} 
                        title="Data Stunting Baru" 
                        desc="Sinergi dengan Posyandu selesai." 
                        time="Kemarin"
                        color="text-rose-600 bg-rose-50"
                    />
                </div>
                <button className="w-full mt-6 py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all">
                    Lihat Semua Aktivitas
                </button>
            </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Menunggu Tindakan Anda</h2>
                        <p className="text-slate-500 text-sm">Dokumen yang memerlukan validasi atau tanda tangan Anda.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Dummy Data for Wilayah */}
                    <ActionRequestCard 
                        warga="Ahmad Subarjo"
                        nik="3201140000000001"
                        jenis="Surat Pengantar RT/RW"
                        keperluan="Pembuatan KTP Baru"
                    />
                    <ActionRequestCard 
                        warga="Siti Aminah"
                        nik="3201140000000002"
                        jenis="Surat Keterangan Tidak Mampu"
                        keperluan="Bantuan Pendidikan Anak"
                    />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

function ActivityItem({ icon: Icon, title, desc, time, color }: any) {
    return (
        <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
            </div>
            <div>
                <h4 className="text-xs font-bold text-slate-800">{title}</h4>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{desc}</p>
                <span className="text-[9px] font-bold text-slate-400 mt-1 block">{time}</span>
            </div>
        </div>
    )
}

function ActionRequestCard({ warga, nik, jenis, keperluan }: any) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all group">
            <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                    {warga.charAt(0)}
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-800">{warga}</h4>
                    <span className="text-[10px] text-slate-400 block mb-1">NIK: {nik}</span>
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase">{jenis}</span>
                </div>
            </div>
            <div className="flex sm:flex-col gap-2">
                <button className="flex-1 sm:flex-none px-4 py-2 bg-teal-500 text-white text-xs font-bold rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20">
                    Tanda Tangani
                </button>
                <button className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all">
                    Tinjau
                </button>
            </div>
        </div>
    )
}
