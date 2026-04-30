"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { 
  Users, 
  UserCircle,
  Building2, 
  PieChart,
  Calendar,
  ChevronRight,
  Search,
  MapPin,
  Clock,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  LayoutGrid
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
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER CARD - DARK */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <LayoutGrid size={14} className="text-emerald-500" /> Ringkasan fitur dan data utama desa
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Dashboard Desa Cimanggu I
                </h1>
                <p className="text-slate-400 max-w-xl leading-relaxed">
                    Pantau kelengkapan data desa, status modul kerja, realisasi keuangan, serta berita terbaru dari DPMD dalam satu halaman.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs font-medium">
                        <MapPin size={14} className="text-blue-400" /> Kecamatan Cibungbulang
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs font-medium">
                        <Sparkles size={14} className="text-emerald-400" /> 4/6 modul telah memiliki data inti
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs font-medium">
                        <DollarSign size={14} className="text-blue-400" /> Realisasi 2025 Rp 3.223.656.620
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs font-medium">
                        <Calendar size={14} className="text-slate-400" /> Kamis, 30 April 2026
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-4">
                <QuickStat label="PROFIL TERISI" value="100%" />
                <QuickStat label="APARATUR" value="0" />
                <QuickStat label="KELEMBAGAAN" value="11" />
                <QuickStat label="PROPOSAL BANKEU" value="11" />
            </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CENTER COLUMN: FEATURE SUMMARY */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Ringkasan Fitur Desa</h2>
                        <p className="text-slate-500 text-sm">Semua modul utama untuk user desa diringkas dalam kartu yang bisa langsung dibuka.</p>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-600 text-xs font-bold">
                        <Users size={14} /> 6 modul utama
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeatureCard 
                        title="Profil Desa"
                        percentage="100%"
                        desc="Data dasar desa sudah lengkap dan siap digunakan lintas modul."
                        stats={[
                            { label: "Jumlah penduduk", value: "9.081 jiwa" },
                            { label: "Luas wilayah", value: "1,7 km²" }
                        ]}
                        status="Lengkap"
                        statusColor="emerald"
                        icon={MapPin}
                        iconColor="bg-emerald-500"
                    />
                    <FeatureCard 
                        title="Aparatur Desa"
                        percentage="0 orang"
                        desc="Belum ada aparatur yang terinput pada modul aparatur desa."
                        stats={[
                            { label: "Status aktif", value: "0 orang" },
                            { label: "Nonaktif", value: "0 orang" }
                        ]}
                        status="Kosong"
                        statusColor="blue"
                        icon={Users}
                        iconColor="bg-blue-500"
                    />
                    <FeatureCard 
                        title="Produk Hukum"
                        percentage="Tersedia"
                        desc="Regulasi desa terdokumentasi dengan baik dalam sistem."
                        stats={[
                            { label: "Perdes", value: "12 dokumen" },
                            { label: "Perkades", value: "8 dokumen" }
                        ]}
                        status="Tersedia"
                        statusColor="amber"
                        icon={Clock}
                        iconColor="bg-amber-500"
                    />
                     <FeatureCard 
                        title="BUMDES"
                        percentage="Belum ada"
                        desc="Modul pengelolaan unit usaha milik desa belum terisi data."
                        stats={[
                            { label: "Unit Usaha", value: "-" },
                            { label: "Aset", value: "Rp 0" }
                        ]}
                        status="Belum ada"
                        statusColor="slate"
                        icon={Building2}
                        iconColor="bg-purple-500"
                    />
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: NEWS & ARTICLES */}
        <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Berita & Artikel DPMD</h2>
                        <p className="text-slate-500 text-xs leading-relaxed mt-1">Pembaruan terbaru yang relevan untuk desa dari kanal berita DPMD.</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 text-slate-400 font-bold">
                        <span className="text-xs leading-none">3</span>
                        <span className="text-[8px] uppercase tracking-tighter">Item</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <NewsItem 
                        num="01"
                        type="Umum"
                        date="19 Mar 2026"
                        views={26}
                        title="Data Lembaga Kemasyarakatan Desa"
                        desc="Tutorial Pengisian Data Lembaga Kemasyarakatan Desa"
                    />
                    <NewsItem 
                        num="02"
                        type="Pengumuman"
                        date="14 Nov 2025"
                        views={57}
                        title="Launching Sistem Informasi DPMD Kabupaten Bogor"
                        desc="Peluncuran sistem informasi terpadu DPMD untuk meningkatkan pelayanan masyarakat"
                    />
                    <NewsItem 
                        num="03"
                        type="Umum"
                        date="13 Nov 2025"
                        views={13}
                        title="Video Tutorial Sipanda"
                        desc="Ringkasan belum tersedia."
                    />
                </div>

                <button className="w-full mt-8 py-4 text-sm font-bold text-slate-500 hover:text-blue-600 border-2 border-dashed border-slate-100 rounded-2xl transition-all">
                    Lihat Semua Berita
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

function FeatureCard({ title, percentage, desc, stats, status, statusColor, icon: Icon, iconColor }: any) {
    const statusColors: any = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        slate: "bg-slate-50 text-slate-500 border-slate-100",
    }
    return (
        <div className="group border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 ${iconColor} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    <Icon size={22} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${statusColors[statusColor]}`}>
                    {status}
                </div>
            </div>
            
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
            <div className="text-2xl font-black text-slate-800 mb-3">{percentage}</div>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 h-10 overflow-hidden line-clamp-2">{desc}</p>
            
            <div className="space-y-2 mb-6">
                {stats.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">{s.label}</span>
                        <span className="text-slate-700 font-bold">{s.value}</span>
                    </div>
                ))}
            </div>
            
            <button className="w-full flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors pt-4 border-t border-slate-50">
                Buka profil desa <ArrowUpRight size={14} />
            </button>
        </div>
    )
}

function NewsItem({ num, type, date, views, title, desc }: any) {
    return (
        <div className="flex gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group">
            <div className="w-10 h-10 bg-[#0f172a] rounded-full flex items-center justify-center text-white text-xs font-black shrink-0">
                {num}
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{type}</span>
                    <span className="text-slate-400">{date}</span>
                    <span className="text-slate-400">{views} dibaca</span>
                </div>
                <h4 className="text-sm font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{title}</h4>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{desc}</p>
            </div>
        </div>
    )
}
