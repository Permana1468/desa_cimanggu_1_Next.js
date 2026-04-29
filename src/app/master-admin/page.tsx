import { 
  Users, 
  Building2, 
  Activity, 
  Database, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock
} from "lucide-react";

export default function MasterDashboardPage() {
  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Sistem Pusat Kendali</h1>
        <p className="text-slate-400">Selamat datang di dashboard pemantauan real-time Desa Cimanggu I.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Penduduk" 
          value="4,821" 
          change="+2.4%" 
          isPositive={true} 
          icon={Database} 
          color="blue"
        />
        <StatCard 
          title="Admin Aktif" 
          value="12" 
          change="+1" 
          isPositive={true} 
          icon={Users} 
          color="amber"
        />
        <StatCard 
          title="Tenant Desa" 
          value="1" 
          change="0%" 
          isPositive={true} 
          icon={Building2} 
          color="purple"
        />
        <StatCard 
          title="Log Aktivitas" 
          value="892" 
          change="+124" 
          isPositive={true} 
          icon={Activity} 
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <History className="text-amber-500" size={24} />
              Audit Log Terbaru
            </h2>
            <button className="text-sm text-amber-500 font-bold hover:text-amber-400 transition-colors">Lihat Semua</button>
          </div>
          
          <div className="space-y-6">
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

        {/* Quick Stats / Mini Chart Placeholder */}
        <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-[2rem] p-8 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Status Sistem</h2>
            <p className="text-slate-400 text-sm mb-8">Pemantauan kesehatan infrastruktur server desa.</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span>Server Load</span>
                  <span className="text-amber-500">12%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[12%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span>Database Usage</span>
                  <span className="text-blue-500">4.2GB</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[35%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            </div>
            <div>
              <span className="text-white text-sm font-bold block">Sistem Online</span>
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Uptime: 14 hari, 2 jam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, change, isPositive, icon: Icon, color }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl border ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {change}
        </div>
      </div>
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

interface ActivityItemProps {
  user: string;
  action: string;
  target: string;
  time: string;
}

function ActivityItem({ user, action, target, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
        <Clock className="text-slate-400" size={20} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm text-white">
            <span className="font-bold text-amber-500">{user}</span> {action}
          </p>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{time}</span>
        </div>
        <p className="text-xs text-slate-500 font-medium italic">Target: {target}</p>
      </div>
    </div>
  );
}

import { History } from "lucide-react";
