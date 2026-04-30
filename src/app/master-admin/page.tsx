import { 
  Users, 
  Database, 
  Clock,
  ShieldCheck,
  Server,
  Zap
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLatestLogs } from "@/app/actions/audit";
import { InfrastructureStatus } from "@/components/dashboard/InfrastructureStatus";

export default async function MasterDashboardPage() {
  const session = await getServerSession(authOptions);

  // 1. Live Data Integration
  const totalPenduduk = await prisma.dataKependudukan.count();
  const adminAktif = await prisma.user.count({
    where: { isActive: true }
  });
  const totalTenant = await prisma.tenant.count();
  const dailyLogs = await prisma.auditLog.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  });

  // 2. Real-time Audit Log using Server Action
  const latestLogs = await getLatestLogs();

  return (
    <div className="space-y-6">
      {/* HEADER CARD - DARK */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-amber-500" /> Pusat Kendali Sistem Utama
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Master Administration
                </h1>
                <p className="text-slate-400 max-w-xl leading-relaxed">
                    Selamat datang kembali, <span className="text-white font-bold">{session?.user?.name}</span>. Kelola infrastruktur desa, pantau aktivitas tenant, dan pastikan integritas data seluruh sistem tetap terjaga secara real-time.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs font-medium">
                        <Server size={14} className="text-blue-400" /> System Uptime: 99.9%
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs font-medium">
                        <Database size={14} className="text-emerald-400" /> Database Healthy
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs font-medium">
                        <Zap size={14} className="text-amber-400" /> High Performance Mode
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-4">
                <QuickStat label="TOTAL PENDUDUK" value={totalPenduduk.toLocaleString('id-ID')} />
                <QuickStat label="ADMIN AKTIF" value={adminAktif.toString()} />
                <QuickStat label="TENANT DESA" value={totalTenant.toString()} />
                <QuickStat label="LOG HARIAN" value={dailyLogs.toString()} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CENTER COLUMN: AUDIT LOGS */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Audit Log Terbaru</h2>
                        <p className="text-slate-500 text-sm">Pemantauan aktivitas user dan perubahan data sistem.</p>
                    </div>
                    <Link href="/master-admin/logs" className="text-sm text-amber-600 font-bold hover:text-amber-700 transition-colors">Lihat Semua</Link>
                </div>

                <div className="space-y-4">
                    {latestLogs.length > 0 ? latestLogs.map((log: { id: string; user: { fullName: string } | null; action: string; entity: string; createdAt: Date }) => (
                        <ActivityItem 
                            key={log.id}
                            user={log.user?.fullName || "Sistem"} 
                            action={log.action.replace(/_/g, ' ')} 
                            target={log.entity} 
                            time={formatRelativeTime(log.createdAt)} 
                        />
                    )) : (
                        <div className="py-12 text-center text-slate-400 italic text-sm">
                            Belum ada aktivitas log yang tercatat.
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME SYSTEM STATUS */}
        <div className="space-y-6">
            <InfrastructureStatus />
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

function ActivityItem({ user, action, target, time }: { user: string; action: string; target: string; time: string }) {
  // Indikator Critical: Berikan warna teks merah jika action mengandung kata "Delete" atau "Hapus"
  const isCritical = /delete|hapus/i.test(action);

  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
      <div className={`w-10 h-10 ${isCritical ? 'bg-red-50 border-red-100' : 'bg-slate-100 border-slate-200'} rounded-xl flex items-center justify-center shrink-0 border group-hover:scale-110 transition-transform`}>
        <Clock className={isCritical ? 'text-red-500' : 'text-slate-400'} size={20} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm text-slate-700">
            <span className="font-bold text-amber-600">{user}</span> <span className={isCritical ? "text-red-600 font-bold" : ""}>{action}</span>
          </p>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{time}</span>
        </div>
        <p className="text-xs text-slate-500 font-medium italic">Target: {target}</p>
      </div>
    </div>
  );
}
