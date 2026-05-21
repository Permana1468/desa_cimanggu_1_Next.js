import { 
  Sparkles,
  LayoutGrid,
  FileText,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Calendar,
  ChevronRight
} from "lucide-react";
import { StatusSurat } from "@prisma/client";
import Link from "next/link";

export function ExecutiveDashboard({ session, stats, latestSurat, realtimeStats }: { session: any, stats: any, latestSurat: any[], realtimeStats?: any }) {
  return (
    <div className="space-y-6">
      {/* HEADER CARD - DARK */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <LayoutGrid size={14} className="text-emerald-500" /> Panel Eksekutif Desa Cimanggu I
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Dashboard Pimpinan
                </h1>
                <p className="text-slate-400 max-w-xl leading-relaxed">
                    Selamat pagi, <span className="text-white font-bold">{session?.user?.name}</span>. Mari pantau performa pelayanan dan data desa hari ini.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs font-medium">
                        <MapPin size={14} className="text-blue-400" /> Kec. Cibungbulang
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs font-medium">
                        <Sparkles size={14} className="text-emerald-400" /> {stats.suratPending} Surat Tertunda
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs font-medium">
                        <Calendar size={14} className="text-slate-400" /> {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-4">
                <QuickStat label="SURAT HARI INI" value={realtimeStats?.suratHariIni?.toString() || "0"} />
                <QuickStat label="ANTREAN SURAT" value={realtimeStats?.totalAntrean?.toString() || "0"} />
                <QuickStat label="SELESAI HARI INI" value={realtimeStats?.suratSelesai?.toString() || "0"} />
                <QuickStat label="TOTAL APARATUR" value={stats.totalAparatur.toString()} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CENTER COLUMN: PERSURATAN TERBARU */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Antrean Persuratan</h2>
                        <p className="text-slate-500 text-sm">Kelola pengajuan surat warga yang menunggu pengesahan.</p>
                    </div>
                    <Link href="/dashboard/surat" className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all">
                        Lihat Semua <ChevronRight size={14} />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                                <th className="pb-4 pl-4">Warga / NIK</th>
                                <th className="pb-4">Jenis Surat</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Tanggal</th>
                                <th className="pb-4 text-right pr-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {latestSurat.length > 0 ? latestSurat.slice(0, 5).map((surat) => (
                                <tr key={surat.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="py-4 pl-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800">{(surat as any).warga.namaLengkap}</span>
                                            <span className="text-[10px] text-slate-400">{(surat as any).warga.nik}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                <FileText size={16} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{(surat as any).jenisSurat}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <StatusBadge status={(surat as any).status} />
                                    </td>
                                    <td className="py-4 text-xs text-slate-500 font-medium">
                                        {new Date((surat as any).createdAt).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="py-4 text-right pr-4">
                                        <button className="text-blue-600 hover:text-blue-700 text-xs font-bold transition-colors">
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400 italic text-sm">
                                        Belum ada antrean surat saat ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS & CMS */}
        <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <h2 className="text-xl font-black text-slate-800 mb-6">Aksi Cepat</h2>
                <div className="grid grid-cols-1 gap-4">
                    <ActionButton 
                        icon={UserPlus} 
                        title="Manajemen Aparatur" 
                        desc="Kelola data perangkat desa" 
                        color="bg-blue-500" 
                    />
                    <ActionButton 
                        icon={Search} 
                        title="Database Warga" 
                        desc="Akses data kependudukan" 
                        color="bg-emerald-500" 
                    />
                    <ActionButton 
                        icon={Sparkles} 
                        title="Laporan Kinerja" 
                        desc="Unduh laporan bulanan" 
                        color="bg-amber-500" 
                    />
                </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-lg font-black mb-2 relative z-10">Pusat Kendali</h3>
                <p className="text-blue-100 text-xs leading-relaxed mb-6 relative z-10">Pantau seluruh aktivitas administratif desa secara real-time dari satu tempat.</p>
                <button className="bg-white text-blue-700 px-6 py-3 rounded-2xl text-xs font-bold relative z-10 shadow-lg hover:shadow-white/20 transition-all active:scale-95">
                    Pengaturan Desa
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}

function QuickStat({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 min-w-[120px] text-center backdrop-blur-sm">
            <span className="block text-[8px] font-black text-slate-400 tracking-[0.2em] mb-2 uppercase">{label}</span>
            <span className="block text-2xl font-black text-white">{value}</span>
        </div>
    )
}

function StatusBadge({ status }: { status: StatusSurat }) {
    const configs: Record<string, { text: string; color: string; icon: any }> = {
        [StatusSurat.TERTUNDA]: { text: "Tertunda", color: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
        [StatusSurat.TERVERIFIKASI]: { text: "Terverifikasi", color: "bg-blue-50 text-blue-600 border-blue-100", icon: AlertCircle },
        [StatusSurat.DISETUJUI]: { text: "Disetujui", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle2 },
        [StatusSurat.DITOLAK]: { text: "Ditolak", color: "bg-red-50 text-red-600 border-red-100", icon: AlertCircle },
    }
    const config = configs[status] || configs[StatusSurat.TERTUNDA];
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${config.color}`}>
            <Icon size={12} />
            {config.text}
        </div>
    )
}

function ActionButton({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) {
    return (
        <button className="flex items-center gap-4 p-4 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left group">
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
            </div>
            <div>
                <h4 className="text-sm font-black text-slate-800">{title}</h4>
                <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
            </div>
        </button>
    )
}
