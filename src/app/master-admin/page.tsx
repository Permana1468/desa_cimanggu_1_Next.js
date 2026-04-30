"use client";

import { 
  Users, 
  Building2, 
  Activity, 
  Database, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  History,
  LayoutGrid,
  ShieldCheck,
  Server,
  Zap
} from "lucide-react";

export default function MasterDashboardPage() {
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
                    Kelola infrastruktur desa, pantau aktivitas tenant, dan pastikan integritas data seluruh sistem tetap terjaga secara real-time.
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
                <QuickStat label="TOTAL PENDUDUK" value="4.821" />
                <QuickStat label="ADMIN AKTIF" value="12" />
                <QuickStat label="TENANT DESA" value="1" />
                <QuickStat label="LOG HARIAN" value="892" />
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
                    <button className="text-sm text-amber-600 font-bold hover:text-amber-700 transition-colors">Lihat Semua</button>
                </div>

                <div className="space-y-4">
                    <ActivityItem 
                        user="Admin Master" 
                        action="Menambah User Baru" 
                        target="Operator Dusun III" 
                        time="2 menit yang lalu" 
                    />
                    <ActivityItem 
                        user="Sistem" 
                        action="Backup Otomatis Selesai" 
                        target="Database Utama" 
                        time="1 jam yang lalu" 
                    />
                    <ActivityItem 
                        user="Admin Desa" 
                        action="Update Data Kependudukan" 
                        target="RW 04 / RT 02" 
                        time="3 jam yang lalu" 
                    />
                    <ActivityItem 
                        user="Admin Master" 
                        action="Konfigurasi 2FA" 
                        target="Keamanan Global" 
                        time="5 jam yang lalu" 
                    />
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: SYSTEM STATUS */}
        <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 h-full flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-800 mb-2">Status Infrastruktur</h2>
                    <p className="text-slate-500 text-xs leading-relaxed mb-8">Kesehatan server dan penggunaan resource global.</p>
                    
                    <div className="space-y-6">
                        <StatusProgress label="Server Load" value="12%" percentage={12} color="bg-amber-500" />
                        <StatusProgress label="Database Usage" value="4.2GB" percentage={35} color="bg-blue-500" />
                        <StatusProgress label="API Traffic" value="High" percentage={85} color="bg-emerald-500" />
                    </div>
                </div>

                <div className="mt-12 bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                    <div>
                        <span className="text-slate-800 text-sm font-black block">Sistem Terpantau</span>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Uptime: 14 hari, 2 jam</span>
                    </div>
                </div>
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

function StatusProgress({ label, value, percentage, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>{label}</span>
                <span className="text-slate-800">{value}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}

function ActivityItem({ user, action, target, time }: any) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 group-hover:scale-110 transition-transform">
        <Clock className="text-slate-400" size={20} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm text-slate-700">
            <span className="font-bold text-amber-600">{user}</span> {action}
          </p>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{time}</span>
        </div>
        <p className="text-xs text-slate-400 font-medium italic">Target: {target}</p>
      </div>
    </div>
  );
}
