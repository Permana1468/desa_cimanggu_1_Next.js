"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { 
  Users, 
  FileText, 
  MessageSquare, 
  HeartPulse, 
  ArrowUpRight, 
  Plus,
  Search,
  Calendar,
  ChevronRight
} from "lucide-react";

export default function VillageDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && (session.user as any).role === "ADMIN_MASTER") {
      router.push("/master-admin");
    }
  }, [session, status, router]);

  if (status === "loading" || !session || (session.user as any).role === "ADMIN_MASTER") {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Panel Operasional Desa</h1>
          <p className="text-slate-400">Selamat pagi, <span className="text-white font-bold">{session.user?.name}</span>. Mari kelola desa kita hari ini.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            <Plus size={20} />
            Layanan Baru
          </button>
        </div>
      </div>

      {/* Local Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LocalStatCard 
          title="Data Penduduk" 
          value="4,821" 
          label="Total Terverifikasi" 
          icon={Users} 
          color="blue"
        />
        <LocalStatCard 
          title="Antrean Surat" 
          value="14" 
          label="Perlu Diproses" 
          icon={FileText} 
          color="amber"
        />
        <LocalStatCard 
          title="Aspirasi Warga" 
          value="8" 
          label="Belum Dibaca" 
          icon={MessageSquare} 
          color="green"
        />
        <LocalStatCard 
          title="Data Posyandu" 
          value="102" 
          label="Balita Terdata" 
          icon={HeartPulse} 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions / Shortcuts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Calendar className="text-blue-500" size={24} />
              Agenda Desa Pekan Ini
            </h2>
            <div className="space-y-4">
              <AgendaItem 
                date="02 Mei" 
                title="Gotong Royong Kebersihan" 
                loc="Wilayah RW 04" 
                time="08:00 WIB" 
              />
              <AgendaItem 
                date="04 Mei" 
                title="Musyawarah Desa (Musdes)" 
                loc="Aula Kantor Desa" 
                time="13:30 WIB" 
              />
              <AgendaItem 
                date="07 Mei" 
                title="Penyaluran BLT-DD" 
                loc="Kantor Pos Cibungbulang" 
                time="09:00 WIB" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShortcutCard 
              title="Cetak Surat Domisili" 
              desc="Buat surat keterangan domisili warga secara cepat."
              icon={FileText}
            />
            <ShortcutCard 
              title="Input Data Kematian" 
              desc="Pembaruan data statistik kependudukan otomatis."
              icon={Users}
            />
          </div>
        </div>

        {/* Local Notifications / Alerts */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20 rounded-[2.5rem] p-8 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">Pengumuman Internal</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-sm text-slate-300 leading-relaxed mb-2">Rapat koordinasi staf desa akan diadakan besok jam 09:00 di ruang Kades.</p>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Sekdes • 1 jam lalu</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-sm text-slate-300 leading-relaxed mb-2">Pastikan input data stunting bulan April sudah selesai 100% sore ini.</p>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Kasi Pelayanan • 3 jam lalu</span>
              </div>
            </div>
          </div>

          <button className="w-full group bg-white/5 border border-white/10 hover:border-blue-500/50 p-6 rounded-3xl transition-all flex items-center justify-between">
            <div className="text-left">
              <span className="text-white font-bold block mb-1">Panduan Penggunaan</span>
              <span className="text-slate-500 text-xs">Pelajari fitur dashboard SDD v2.0</span>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 group-hover:bg-blue-500 text-blue-500 group-hover:text-white rounded-full flex items-center justify-center transition-all">
              <ChevronRight size={20} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function LocalStatCard({ title, value, label, icon: Icon, color }: any) {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    green: "text-green-500 bg-green-500/10",
    red: "text-red-500 bg-red-500/10",
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:translate-y-[-4px] transition-all duration-300">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${colorMap[color]}`}>
        <Icon size={24} />
      </div>
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-black text-white">{value}</span>
        <ArrowUpRight className="text-green-500" size={16} />
      </div>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{label}</p>
    </div>
  );
}

function AgendaItem({ date, title, loc, time }: any) {
  return (
    <div className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white/5 transition-all group">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg shadow-blue-600/10 group-hover:scale-105 transition-transform">
        <span className="text-[10px] text-blue-100 font-bold uppercase tracking-tighter">{date.split(' ')[1]}</span>
        <span className="text-xl font-black text-white leading-none">{date.split(' ')[0]}</span>
      </div>
      <div className="flex-1">
        <h4 className="text-white font-bold mb-1">{title}</h4>
        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1"><Search size={12} className="shrink-0" /> {loc}</span>
          <span className="flex items-center gap-1"><ChevronRight size={12} className="shrink-0" /> {time}</span>
        </div>
      </div>
    </div>
  );
}

function ShortcutCard({ title, desc, icon: Icon }: any) {
  return (
    <button className="bg-white/5 border border-white/10 p-6 rounded-3xl text-left hover:bg-white/10 hover:border-blue-500/30 transition-all group">
      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform">
        <Icon size={20} className="text-blue-500" />
      </div>
      <h3 className="text-white font-bold mb-1">{title}</h3>
      <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
    </button>
  );
}
