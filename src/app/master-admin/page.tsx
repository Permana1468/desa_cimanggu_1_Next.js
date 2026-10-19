import { 
  Users, 
  Database, 
  ShieldCheck, 
  Server, 
  Zap, 
  Activity, 
  ArrowRight, 
  Shield, 
  Key, 
  Globe, 
  Map, 
  History, 
  Settings, 
  Store,
  Lock,
  Building,
  CheckCircle2,
  ExternalLink,
  Wrench
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MasterInfrastructureStatus } from "@/components/master/MasterInfrastructureStatus";
import { OverviewCharts } from "@/components/master/OverviewChartsWrapper";
import { SupabaseStorageStats } from "@/components/master/SupabaseStorageStats";
import { getMaintenanceSettings } from "@/lib/maintenanceService";

export default async function MasterDashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tenantId?: string }> 
}) {
  const { tenantId } = await searchParams;
  const session = await getServerSession(authOptions);

  const filter = tenantId ? { tenantId } : {};

  // Live Data Integration - Run queries concurrently using Promise.all to optimize page loading time
  const [totalPenduduk, adminAktif, totalTenant, dailyLogs, latestLogs, selectedTenant, maintenanceSettings] = await Promise.all([
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
      take: 7,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true } }
      }
    }),
    tenantId ? prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } }) : Promise.resolve(null),
    getMaintenanceSettings()
  ]);

  const offlineFeaturesCount = Object.values(maintenanceSettings.features).filter((f: any) => f.enabled === false).length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-6">
      {/* ── HERO COMMAND CENTER ────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a1122] to-slate-950 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-7 md:p-9 text-white shadow-xl shadow-slate-950/20 border border-slate-800/80">
          {/* Ambient Lighting & Cybernetic Accents */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-[90px] pointer-events-none -mb-32" />
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none -ml-32" />
          
          <div className="relative z-10 space-y-6 sm:space-y-8">
              {/* Top Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 sm:gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          Enterprise Control
                      </span>
                      <span className="hidden sm:inline-block text-slate-500 text-xs font-semibold">•</span>
                      <span className="text-[11px] font-semibold text-slate-400">
                          Super Administrator Access
                      </span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-[11px] font-semibold">
                      <Building size={13} className="text-blue-400" />
                      <span>{selectedTenant ? `Wilayah: ${selectedTenant.name}` : "Cakupan: Semua Wilayah"}</span>
                  </div>
              </div>

              {/* Main Content & Metrics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                  {/* Left Column: Heading & Description */}
                  <div className="lg:col-span-7 space-y-4">
                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                          Pusat Kendali & Integritas{" "}
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 block sm:inline">
                            Multi-Desa
                          </span>
                      </h1>
                      <p className="text-slate-300/90 text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-xl">
                          Sistem koordinasi terpadu untuk administrasi kependudukan, validasi perizinan usaha, dan monitoring keamanan data real-time.
                      </p>

                      {/* Live System Telemetry Pills */}
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <StatusPill icon={Server} label="Uptime" value="99.99%" color="text-blue-400" />
                        <StatusPill icon={Database} label="Sinkronisasi" value="Real-time" color="text-emerald-400" />
                        <StatusPill icon={Zap} label="Protokol" value="AES-256" color="text-amber-400" />
                        <Link href="/master-admin/maintenance" className="transition-transform hover:scale-105">
                          <StatusPill 
                            icon={Wrench} 
                            label="Maintenance" 
                            value={maintenanceSettings.isGlobalMaintenance ? "GLOBAL ON" : offlineFeaturesCount > 0 ? `${offlineFeaturesCount} OFF` : "Normal"} 
                            color={maintenanceSettings.isGlobalMaintenance || offlineFeaturesCount > 0 ? "text-rose-400" : "text-emerald-400"} 
                          />
                        </Link>
                      </div>
                  </div>

                  {/* Right Column: 4 Stat Cards */}
                  <div className="lg:col-span-5 grid grid-cols-2 gap-2.5 sm:gap-3.5">
                    <HeroStat 
                      label="Total Warga" 
                      value={totalPenduduk.toLocaleString('id-ID')} 
                      icon={Users} 
                      color="blue"
                      badge="Terdaftar" 
                    />
                    <HeroStat 
                      label="Admin Aktif" 
                      value={adminAktif.toString()} 
                      icon={Shield} 
                      color="emerald"
                      badge="Online" 
                    />
                    <HeroStat 
                      label="Total Wilayah" 
                      value={totalTenant.toString()} 
                      icon={Globe} 
                      color="amber"
                      badge="Tenant" 
                    />
                    <HeroStat 
                      label="Log Hari Ini" 
                      value={dailyLogs.toString()} 
                      icon={Activity} 
                      color="rose"
                      badge="Aktivitas" 
                    />
                  </div>
              </div>
          </div>
      </div>

      {/* ── QUICK ACTIONS (6 MODULES - PERFECT BALANCED GRID) ────────── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-wider">
            Modul Operasional Utama
          </h2>
          <span className="text-[11px] font-bold text-slate-400">6 Modul Siap Akses</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <ActionCard 
              icon={Users} 
              label="Manajemen Pengguna" 
              desc="Akun & hak akses sistem"
              href="/master-admin/pengguna-sistem" 
              color="bg-blue-600 text-white" 
            />
            <ActionCard 
              icon={Database} 
              label="Data Kependudukan" 
              desc="Master data NIK & KK"
              href="/master-admin/data" 
              color="bg-indigo-600 text-white" 
            />
            <ActionCard 
              icon={Map} 
              label="Pemetaan GIS" 
              desc="Batas spasial & wilayah"
              href="/master-admin/gis" 
              color="bg-emerald-600 text-white" 
            />
            <ActionCard 
              icon={Store} 
              label="Verifikasi UMKM" 
              desc="Legalitas & produk usaha"
              href="/master-admin/umkm" 
              color="bg-amber-500 text-white" 
            />
            <ActionCard 
              icon={History} 
              label="Audit Logs" 
              desc="Jejak audit transaksi"
              href="/master-admin/logs" 
              color="bg-slate-800 text-white" 
            />
            <ActionCard 
              icon={Settings} 
              label="Konfigurasi" 
              desc="Pengaturan & integrasi"
              href="/master-admin/config" 
              color="bg-cyan-600 text-white" 
            />
        </div>
      </div>

      {/* ── CHARTS SECTION ─────────────────────────────────── */}
      <OverviewCharts />

      {/* ── LOGS & STATUS SECTION (2/3 + 1/3 RESPONSIVE LAYOUT) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* LOGS SECTION (2 COLS) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                      <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                        Audit Log Transaksional
                      </h2>
                      <p className="text-slate-400 text-xs font-semibold mt-0.5">
                        Catatan aktivitas & perubahan data terbaru di sistem
                      </p>
                  </div>
                  <Link 
                    href="/master-admin/logs" 
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all shrink-0"
                  >
                      <span>Lihat Semua</span>
                      <ArrowRight size={14} />
                  </Link>
              </div>

              <div className="divide-y divide-slate-100">
                  {latestLogs.length > 0 ? (
                    latestLogs.map((log) => (
                        <LogItem 
                          key={log.id} 
                          user={log.user?.fullName || "Sistem"} 
                          action={log.action} 
                          time={formatRelativeTime(log.createdAt)} 
                          category={log.category || "SYSTEM"}
                        />
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                        <Activity className="mx-auto text-slate-300" size={32} />
                        <p className="text-sm font-bold">Belum ada aktivitas tercatat hari ini</p>
                    </div>
                  )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  Semua transaksi tercatat secara permanen (Immutable Audit)
                </span>
                <span className="font-bold">{latestLogs.length} Entri Ditampilkan</span>
            </div>
        </div>

        {/* SIDEBAR STATUS (1 COL) */}
        <div className="space-y-6">
            <SupabaseStorageStats />
            <MasterInfrastructureStatus />
            
            {/* ENCRYPTION & SECURITY CARD */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-7 rounded-2xl sm:rounded-3xl text-white shadow-md border border-indigo-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/20">
                            <Lock size={16} />
                        </div>
                        <h3 className="text-sm sm:text-base font-black tracking-tight">Keamanan & Kriptografi</h3>
                    </div>

                    <p className="text-blue-200/80 text-xs font-normal leading-relaxed">
                        Data kependudukan, berkas usulan, dan kredensial multi-tenant dienkripsi dengan standar AES-256 untuk menjamin integritas desa.
                    </p>

                    <div className="pt-2 flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider text-amber-300">
                            <Key size={12} />
                            <span>Zero-Trust Protocol</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">SHA-256 Validated</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value, icon: Icon, color, badge }: any) {
  const colorMap: any = {
    blue: {
      bg: "bg-blue-500/15 border-blue-500/25 text-blue-400",
      badge: "bg-blue-500/20 text-blue-300",
      iconGlow: "text-blue-400"
    },
    emerald: {
      bg: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-300",
      iconGlow: "text-emerald-400"
    },
    amber: {
      bg: "bg-amber-500/15 border-amber-500/25 text-amber-400",
      badge: "bg-amber-500/20 text-amber-300",
      iconGlow: "text-amber-400"
    },
    rose: {
      bg: "bg-rose-500/15 border-rose-500/25 text-rose-400",
      badge: "bg-rose-500/20 text-rose-300",
      iconGlow: "text-rose-400"
    }
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-sm group hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
        <div className="flex items-center justify-between mb-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${style.bg}`}>
                <Icon size={16} className={style.iconGlow} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${style.badge}`}>
                {badge}
            </span>
        </div>
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mb-0.5">
            {label}
        </p>
        <p className="text-lg sm:text-2xl font-black text-white tabular-nums tracking-tight">
            {value}
        </p>
    </div>
  );
}

function StatusPill({ icon: Icon, label, value, color }: any) {
  return (
    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/10">
        <Icon size={12} className={color} />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}:</span>
        <span className="text-[10px] font-black text-white">{value}</span>
    </div>
  );
}

function ActionCard({ icon: Icon, label, desc, href, color }: any) {
  return (
    <Link 
      href={href} 
      className="group bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all flex flex-col justify-between"
    >
        <div>
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${color} flex items-center justify-center mb-2.5 sm:mb-3 shadow-md shadow-current/20 group-hover:scale-105 transition-transform`}>
              <Icon size={18} className="stroke-[2.2]" />
          </div>
          <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-1">
              {label}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-tight mt-0.5 line-clamp-1">
              {desc}
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold text-blue-600 mt-2.5 pt-2 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Buka Modul</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
    </Link>
  );
}

function LogItem({ user, action, time, category }: any) {
  const categoryConfig: any = {
    AUTH: { bg: "bg-amber-50 text-amber-700 border-amber-200", label: "AUTH" },
    DATA: { bg: "bg-blue-50 text-blue-700 border-blue-200", label: "DATA" },
    UMKM: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "UMKM" },
    GIS: { bg: "bg-purple-50 text-purple-700 border-purple-200", label: "GIS" },
    SYSTEM: { bg: "bg-slate-100 text-slate-700 border-slate-200", label: "SISTEM" }
  };

  const cat = categoryConfig[category?.toUpperCase()] || categoryConfig.SYSTEM;

  return (
    <div className="flex items-start sm:items-center justify-between gap-3 py-3 px-1.5 hover:bg-slate-50/80 rounded-xl transition-colors">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Activity size={16} />
            </div>
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {user}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border ${cat.bg}`}>
                        {cat.label}
                    </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {action.replace(/_/g, ' ')}
                </p>
            </div>
        </div>

        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 whitespace-nowrap self-start sm:self-center mt-1 sm:mt-0">
            {time}
        </span>
    </div>
  );
}
