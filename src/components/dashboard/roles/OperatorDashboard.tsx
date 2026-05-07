import { 
  Monitor, 
  Database, 
  Globe, 
  ShieldCheck, 
  Users, 
  FileText,
  Activity,
  Zap
} from "lucide-react";
import Link from "next/link";

export function OperatorDashboard({ session, stats }: { session: any, stats: any }) {
  return (
    <div className="space-y-6">
      {/* HEADER CARD - OPERATOR BLUE/INDIGO */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/20 rounded-full blur-[60px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                    <Monitor size={14} /> System & Data Operator
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    Dashboard Operator
                </h1>
                <p className="text-indigo-100 max-w-xl leading-relaxed font-medium">
                    Selamat bekerja, <span className="text-white font-bold">{session?.user?.name}</span>. Kelola infrastruktur data, konten publik, dan monitoring sistem desa secara terpusat.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-indigo-100 mb-1 uppercase">Uptime Sistem</span>
                    <span className="block text-3xl font-black text-white">99.9%</span>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] backdrop-blur-md">
                    <span className="block text-[10px] font-bold text-indigo-100 mb-1 uppercase">Data Kependudukan</span>
                    <span className="block text-xl font-black text-white mt-1">Terverifikasi</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <OperatorToolCard 
                    icon={Database} 
                    title="Database Kependudukan" 
                    desc="Kelola, sinkronkan, dan validasi data warga desa."
                    href="/dashboard/warga"
                    color="bg-blue-500"
                />
                <OperatorToolCard 
                    icon={Globe} 
                    title="Manajemen Konten (CMS)" 
                    desc="Update berita, pengumuman, dan profil desa."
                    href="/dashboard/cms"
                    color="bg-emerald-500"
                />
                <OperatorToolCard 
                    icon={FileText} 
                    title="Log Persuratan" 
                    desc="Pantau seluruh aliran surat masuk dan keluar."
                    href="/dashboard/surat"
                    color="bg-amber-500"
                />
                <OperatorToolCard 
                    icon={ShieldCheck} 
                    title="Audit Keamanan" 
                    desc="Lihat log aktivitas user dan akses sistem."
                    href="/dashboard/audit"
                    color="bg-rose-500"
                />
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-indigo-500" /> Status Layanan
                </h3>
                <div className="space-y-4">
                    <StatusItem label="API Gateway" status="Operational" />
                    <StatusItem label="Database Server" status="Operational" />
                    <StatusItem label="File Storage" status="Operational" />
                    <StatusItem label="Mail Server" status="Operational" />
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-100">
                    <button className="w-full bg-indigo-50 text-indigo-600 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
                        <Zap size={14} /> Jalankan Backup Rutin
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function OperatorToolCard({ icon: Icon, title, desc, href, color }: any) {
    return (
        <Link href={href} className="group block">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60 hover:border-indigo-200 hover:shadow-md transition-all h-full">
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                <h4 className="font-black text-slate-800 mb-2">{title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
        </Link>
    )
}

function StatusItem({ label, status }: { label: string, status: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{label}</span>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{status}</span>
            </div>
        </div>
    )
}
