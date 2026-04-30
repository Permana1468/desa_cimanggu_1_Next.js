import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    Users,
    FileText,
    ShieldCheck,
    MapPin,
    Clock,
    CheckCircle2,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default async function KelembagaanDashboard() {
    const session = await getServerSession(authOptions);

    return (
        <div className="space-y-8 pb-12">
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                        <ShieldCheck size={14} className="text-blue-500" /> Panel Koordinasi {(session?.user as any)?.role}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                        Selamat Datang, {session?.user?.name}
                    </h1>
                    <p className="text-slate-400 max-w-xl text-sm font-medium">
                        Kelola data wilayah dan verifikasi pengajuan surat dari warga di lingkungan Anda secara mandiri dan cepat.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={Users} label="Warga Wilayah" value="-" color="bg-blue-600" />
                <StatCard icon={FileText} label="Permintaan Verifikasi" value="0" color="bg-amber-600" />
                <StatCard icon={CheckCircle2} label="Sudah Selesai" value="0" color="bg-emerald-600" />
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800">Aktivitas Wilayah</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <MapPin size={14} /> Desa Cimanggu I
                    </div>
                </div>

                <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <Clock size={32} />
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Belum ada aktivitas koordinasi terbaru di wilayah Anda.</p>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200/60 flex items-center gap-6">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/10`}>
                <Icon size={28} />
            </div>
            <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <p className="text-2xl font-black text-slate-800">{value}</p>
            </div>
        </div>
    )
}
