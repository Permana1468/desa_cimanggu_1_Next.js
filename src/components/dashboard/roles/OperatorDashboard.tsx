import { 
  Monitor, 
  Database, 
  Globe, 
  ShieldCheck, 
  Users, 
  FileText,
  Activity,
  Zap,
  ArrowRight,
  Clock,
  UserCheck,
  MailWarning
} from "lucide-react";
import Link from "next/link";

export function OperatorDashboard({ session, stats }: { session: any; stats?: any }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* 1. PREMIUM HEADER - GLASSMORPHISM */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-8 md:p-12 shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-indigo-500/20 rounded-full blur-[80px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                    <Monitor size={14} className="text-cyan-400" /> Control Center
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Operator</span>
                </h1>
                <p className="text-indigo-100/80 max-w-xl leading-relaxed font-medium text-sm md:text-base">
                    Sistem kendali terpusat. Kelola verifikasi warga, layanan administrasi, publikasi konten, dan pantau kesehatan sistem Desa Cimanggu I.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatBadge label="Sistem Uptime" value="99.9%" status="good" />
                <StatBadge label="Warga Terverifikasi" value="2,401" />
                <StatBadge label="Surat Tertunda" value="12" status="warning" />
            </div>
        </div>
      </div>

      {/* 2. MAIN PILLARS (NAVIGATION CARDS) */}
      <div>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><Activity size={18} /></div>
            <h2 className="text-xl font-black text-slate-800">Pilar Operasional</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <MainPillarCard 
                icon={UserCheck} 
                title="Pusat Verifikasi Warga" 
                desc="Validasi NIK, sinkronisasi data kependudukan, dan approval akun."
                href="/dashboard/warga"
                color="from-emerald-500 to-teal-600"
                shadow="shadow-emerald-500/20"
                stats="5 Menunggu"
            />
            <MainPillarCard 
                icon={FileText} 
                title="Loket Persuratan Digital" 
                desc="Proses permohonan surat warga, cetak PDF, dan log dokumen."
                href="/dashboard/surat"
                color="from-blue-500 to-indigo-600"
                shadow="shadow-blue-500/20"
                stats="12 Antrean"
            />
            <MainPillarCard 
                icon={Globe} 
                title="Manajemen Konten (CMS)" 
                desc="Update berita, pengumuman, dan profil desa di portal publik."
                href="/dashboard/cms"
                color="from-amber-500 to-orange-600"
                shadow="shadow-amber-500/20"
                stats="Draft: 2"
            />
            <MainPillarCard 
                icon={ShieldCheck} 
                title="Log & Keamanan Sistem" 
                desc="Pantau audit log, aktivitas user, dan jalankan backup rutin."
                href="/dashboard/sistem"
                color="from-rose-500 to-red-600"
                shadow="shadow-rose-500/20"
                stats="Aman"
            />
          </div>
      </div>

      {/* 3. BOTTOM SECTION: QUICK AUDIT & SYSTEM STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 h-full">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Clock size={20} className="text-indigo-500" /> Log Aktivitas Terkini
                    </h3>
                    <Link href="/dashboard/sistem" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                        Lihat Semua <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {/* Dummy Logs */}
                    <LogItem time="10:45 AM" user="Warga (Budi)" action="Mendaftar akun baru" status="pending" />
                    <LogItem time="09:12 AM" user="Sistem" action="Backup database otomatis berhasil" status="success" />
                    <LogItem time="Kemarin, 14:30" user="Operator" action="Menyetujui Surat Keterangan Usaha" status="info" />
                    <LogItem time="Kemarin, 10:00" user="Operator" action="Mempublikasikan Berita: 'Jadwal Vaksinasi'" status="info" />
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 h-full">
                <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                    <Zap size={20} className="text-indigo-500" /> Status Layanan
                </h3>
                <div className="space-y-5">
                    <StatusItem label="API Gateway" status="Operational" />
                    <StatusItem label="Database Server" status="Operational" />
                    <StatusItem label="File Storage" status="Operational" />
                    <StatusItem label="Mail Server" status="Operational" />
                </div>
                
                <div className="mt-10 pt-8 border-t border-slate-100">
                    <button className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 group">
                        <Monitor size={16} className="group-hover:rotate-12 transition-transform" /> Jalankan Diagnostik
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, value, status = "default" }: { label: string, value: string, status?: "default" | "good" | "warning" }) {
    const isWarning = status === "warning";
    const isGood = status === "good";
    return (
        <div className="bg-white/10 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-md flex flex-col justify-between">
            <span className="block text-[10px] md:text-xs font-bold text-indigo-100 mb-2 uppercase tracking-wider">{label}</span>
            <div className="flex items-end justify-between">
                <span className="block text-2xl md:text-3xl font-black text-white">{value}</span>
                {isWarning && <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse mb-1.5" />}
                {isGood && <div className="w-2 h-2 bg-emerald-400 rounded-full mb-1.5" />}
            </div>
        </div>
    )
}

function MainPillarCard({ icon: Icon, title, desc, href, color, shadow, stats }: any) {
    return (
        <Link href={href} className="group block h-full">
            <div className={`bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4">
                    <div className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                        {stats}
                    </div>
                </div>
                
                <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-lg ${shadow}`}>
                    <Icon size={26} />
                </div>
                <h4 className="font-black text-slate-800 mb-2 text-lg group-hover:text-indigo-600 transition-colors">{title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">{desc}</p>
                
                <div className="mt-6 flex items-center text-xs font-bold text-indigo-600 uppercase tracking-widest gap-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Buka Modul <ArrowRight size={14} />
                </div>
            </div>
        </Link>
    )
}

function StatusItem({ label, status }: { label: string, status: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <span className="text-sm font-bold text-slate-600">{label}</span>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{status}</span>
            </div>
        </div>
    )
}

function LogItem({ time, user, action, status }: any) {
    const colors = {
        pending: "bg-amber-100 text-amber-600",
        success: "bg-emerald-100 text-emerald-600",
        info: "bg-blue-100 text-blue-600"
    }[status as string] || "bg-slate-100 text-slate-600";

    return (
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 group-hover:scale-110 transition-transform">
                <Activity size={16} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group-hover:border-indigo-100">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{time}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${colors}`}>{user}</span>
                </div>
                <p className="text-sm font-medium text-slate-700">{action}</p>
            </div>
        </div>
    )
}
