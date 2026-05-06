import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
    FileText, 
    Bell, 
    User, 
    ArrowRight, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    Megaphone,
    Search
} from "lucide-react";
import Link from "next/link";

export default async function ResidentDashboard() {
    const session = await getServerSession(authOptions);

    return (
        <div className="space-y-8 pb-12">
            {/* WELCOME HERO */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-200/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                        Halo, <span className="text-blue-600">{session?.user?.name}</span> 👋
                    </h2>
                    <p className="text-slate-500 text-sm font-medium max-w-md">
                        Selamat datang di Portal Layanan Mandiri Desa Cimanggu I. Anda dapat mengajukan persuratan dan memantau statusnya di sini.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* QUICK SERVICE CARDS */}
                <ServiceCard 
                    icon={FileText} 
                    title="Buat Surat Baru" 
                    desc="Ajukan permohonan surat keterangan secara online." 
                    color="bg-blue-600"
                    href="/resident/surat/baru"
                />
                <ServiceCard 
                    icon={Bell} 
                    title="Status Pengajuan" 
                    desc="Pantau progres verifikasi surat yang Anda ajukan." 
                    color="bg-emerald-600"
                    href="/resident/surat"
                />
                <ServiceCard 
                    icon={User} 
                    title="Data Keluarga" 
                    desc="Lihat dan pastikan data keluarga Anda sudah benar." 
                    color="bg-amber-600"
                    href="/resident/profile"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RECENT ACTIVITY */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800">Riwayat Pengajuan</h3>
                            <Link href="/resident/surat" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                                Lihat Semua <ArrowRight size={14} />
                            </Link>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Empty state mock */}
                            <div className="py-12 text-center flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                    <Clock size={32} />
                                </div>
                                <p className="text-slate-400 font-medium text-sm">Belum ada pengajuan surat terbaru.</p>
                                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg">
                                    Mulai Ajukan Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ANNOUNCEMENTS */}
                <div className="space-y-6">
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20">
                                <Megaphone size={20} />
                            </div>
                            <h3 className="text-lg font-black tracking-tight">Pengumuman Desa</h3>
                        </div>
                        <div className="space-y-4">
                            <AnnouncementItem 
                                date="30 Apr 2026" 
                                title="Jadwal Vaksinasi Booster di Balai Desa" 
                            />
                            <AnnouncementItem 
                                date="28 Apr 2026" 
                                title="Pemberitahuan Penyaluran BLT Dana Desa" 
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                            <Search size={20} className="text-blue-500" /> Cek Data NIK
                        </h3>
                        <p className="text-xs text-slate-500 mb-6">Validasi NIK Anda di database kependudukan nasional melalui sistem desa.</p>
                        <div className="relative">
                            <input type="text" placeholder="Masukkan NIK..." className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-xs font-bold" />
                            <button className="absolute right-2 top-2 bg-blue-600 text-white p-2 rounded-lg">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ServiceCard({ icon: Icon, title, desc, color, href }: any) {
    return (
        <Link href={href} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-blue-200 transition-all group">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon size={28} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-2">{title}</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
        </Link>
    )
}

function AnnouncementItem({ date, title }: { date: string, title: string }) {
    return (
        <div className="border-l-2 border-white/10 pl-4 py-1 space-y-1 hover:border-amber-500 transition-all cursor-pointer group">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</span>
            <p className="text-xs font-bold group-hover:text-amber-500 transition-colors">{title}</p>
        </div>
    )
}
