import { 
  Users, 
  Database, 
  Clock,
  ShieldCheck,
  Server,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
  Shield,
  Key,
  Globe,
  Map,
  History,
  Settings
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InfrastructureStatus } from "@/components/dashboard/InfrastructureStatus";
import { OverviewCharts } from "@/components/master/OverviewChartsWrapper";
import { SupabaseStorageStats } from "@/components/master/SupabaseStorageStats";

export default async function MasterDashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tenantId?: string }> 
}) {
  const { tenantId } = await searchParams;
  const session = await getServerSession(authOptions);

  const filter = tenantId ? { tenantId } : {};

  // Live Data Integration - Run queries concurrently using Promise.all to optimize page loading time
  const [totalPenduduk, adminAktif, totalTenant, dailyLogs, latestLogs] = await Promise.all([
    prisma.dataKependudukan.count({ where: filter }),
    prisma.user.count({ where: { ...filter, isActive: true } }),
    tenantId ? Promise.resolve(1) : prisma.tenant.count(),
    prisma.auditLog.count({
      where: {
        ...filter,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.auditLog.findMany({
      where: filter,
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true } }
      }
    })
  ]);

  return (
    <div className="space-y-12 pb-20">
      {/* HERO SECTION - Premium Dark Design */}
      <div className="relative group overflow-hidden bg-slate-950 rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 text-white shadow-2xl shadow-blue-500/10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] -ml-48 -mb-48" />
          
          <div className="relative z-10 space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-6">
                      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.25em]">
                          <ShieldCheck size={16} /> Enterprise Control Center
                      </div>
                      <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                          Integritas <br />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
                            Tanpa Batas.
                          </span>
                      </h1>
                      <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
                          Sistem manajemen multi-tenant tercanggih untuk koordinasi administrasi desa yang presisi, aman, dan transparan.
                      </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <HeroStat label="Total Warga" value={totalPenduduk.toLocaleString()} icon={Users} color="blue" />
                    <HeroStat label="Active Admin" value={adminAktif.toString()} icon={Shield} color="emerald" />
                    <HeroStat label="Total Tenant" value={totalTenant.toString()} icon={Globe} color="amber" />
                    <HeroStat label="Daily Logs" value={dailyLogs.toString()} icon={Activity} color="rose" />
                  </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                <StatusPill icon={Server} label="System Uptime" value="99.99%" color="text-blue-400" />
                <StatusPill icon={Database} label="Sync Rate" value="Real-time" color="text-emerald-400" />
                <StatusPill icon={Zap} label="Performance" value="Stable" color="text-amber-400" />
              </div>
          </div>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <ActionCard icon={Users} label="Manajemen Pengguna" href="/master-admin/pengguna-sistem" color="bg-blue-500" />
          <ActionCard icon={Database} label="Data Kependudukan" href="/master-admin/data" color="bg-indigo-500" />
          <ActionCard icon={Map} label="Pemetaan GIS" href="/master-admin/gis" color="bg-emerald-600" />
          <ActionCard icon={History} label="Audit Logs" href="/master-admin/logs" color="bg-slate-900" />
          <ActionCard icon={Settings} label="Konfigurasi" href="/master-admin/config" color="bg-amber-500" />
      </div>

      {/* CHARTS SECTION */}
      <OverviewCharts />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LOGS SECTION */}
        <div className="lg:col-span-2 space-y-8 bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Audit Log Transaksional</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Aktivitas Terakhir Sistem</p>
                </div>
                <Link href="/master-admin/logs" className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <ArrowRight size={20} />
                </Link>
            </div>

            <div className="space-y-4">
                {latestLogs.map((log) => (
                    <LogItem 
                      key={log.id} 
                      user={log.user?.fullName || "Sistem"} 
                      action={log.action} 
                      time={formatRelativeTime(log.createdAt)} 
                      category={log.category || "SYSTEM"}
                    />
                ))}
            </div>
        </div>

        {/* SIDEBAR STATUS */}
        <div className="space-y-8">
            <SupabaseStorageStats />
            <InfrastructureStatus />
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <h3 className="text-xl font-black mb-4 relative z-10">Keamanan Enkripsi</h3>
                <p className="text-blue-100 text-sm font-medium leading-relaxed relative z-10">Seluruh data kependudukan dan transaksi dilindungi oleh enkripsi AES-256 tingkat militer untuk menjamin privasi warga.</p>
                <div className="mt-8 flex items-center gap-2 bg-white/10 w-fit px-4 py-2 rounded-xl border border-white/10">
                    <Key size={16} className="text-amber-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Secure Handshake</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-500/10 text-blue-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    rose: "bg-rose-500/10 text-rose-400"
  };
  return (
    <div className="bg-white/5 border border-white/5 p-4 md:p-6 rounded-3xl backdrop-blur-md group hover:bg-white/10 transition-all cursor-default">
        <Icon size={20} className={`${color === 'blue' ? 'text-blue-400' : color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'} mb-3 opacity-60 group-hover:opacity-100 transition-opacity`} />
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl md:text-2xl font-black tabular-nums">{value}</p>
    </div>
  )
}

function StatusPill({ icon: Icon, label, value, color }: any) {
  return (
    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
        <Icon size={14} className={color} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}:</span>
        <span className="text-[10px] font-black text-white">{value}</span>
    </div>
  )
}

function ActionCard({ icon: Icon, label, href, color }: any) {
  return (
    <Link href={href} className="group bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.03] active:scale-95 transition-all">
        <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center mb-6 shadow-lg shadow-current/20 group-hover:rotate-12 transition-transform`}>
            <Icon size={24} />
        </div>
        <p className="text-sm font-black text-slate-800 leading-tight">{label}</p>
        <div className="mt-4 flex items-center gap-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
            <span className="text-[10px] font-black uppercase tracking-widest">Buka Menu</span>
            <ArrowRight size={14} />
        </div>
    </Link>
  )
}

function LogItem({ user, action, time, category }: any) {
  return (
    <div className="flex items-center gap-6 p-4 rounded-3xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
            <Activity size={20} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
                <p className="text-sm font-black text-slate-800 truncate">{user}</p>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{time}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate">
                <span className="inline-block px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-black mr-2 uppercase">{category}</span>
                {action.replace(/_/g, ' ')}
            </p>
        </div>
    </div>
  )
}

