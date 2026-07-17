import { Metadata } from "next";
import { LayoutDashboard, Target, Users as UsersIcon, MapPin, Activity } from "lucide-react";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
    title: "Sensus App | Dashboard Statistik",
};

export default async function DashboardPage() {
    // Fetch real stats from database
    const [totalMasuk, menunggu, disetujui, petugas] = await Promise.all([
        prisma.sensusPoint.count(),
        prisma.sensusPoint.count({ where: { status: "MENUNGGU_VERIFIKASI" } }),
        prisma.sensusPoint.count({ where: { status: "DISETUJUI" } }),
        prisma.user.count({ where: { role: "PETUGAS_SENSUS" } })
    ]);

    const recentActivities = await prisma.sensusPoint.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { fullName: true } } }
    });

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Statistik Tracking Lapangan</h1>
                <p className="text-slate-400">Pantau progres pengumpulan data sensus secara Real-Time.</p>
            </header>

            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Data Masuk" 
                    value={totalMasuk} 
                    icon={Target} 
                    color="text-blue-400" 
                    bgColor="bg-blue-600/20" 
                    borderColor="border-blue-500/30" 
                />
                <StatCard 
                    title="Menunggu Tinjauan" 
                    value={menunggu} 
                    icon={Activity} 
                    color="text-amber-400" 
                    bgColor="bg-amber-600/20" 
                    borderColor="border-amber-500/30" 
                />
                <StatCard 
                    title="Data Disetujui" 
                    value={disetujui} 
                    icon={MapPin} 
                    color="text-emerald-400" 
                    bgColor="bg-emerald-600/20" 
                    borderColor="border-emerald-500/30" 
                />
                <StatCard 
                    title="Petugas Aktif" 
                    value={petugas} 
                    icon={UsersIcon} 
                    color="text-purple-400" 
                    bgColor="bg-purple-600/20" 
                    borderColor="border-purple-500/30" 
                />
            </div>

            <div className="grid grid-cols-3 gap-6 flex-1">
                <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center">
                    <div className="w-full h-64 bg-slate-800/50 rounded-xl border border-dashed border-slate-700 flex items-center justify-center">
                        <p className="text-slate-500">[ Area Grafik Real-Time (Segera Hadir) ]</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-white font-bold mb-4">Aktivitas Terbaru</h3>
                    <div className="flex-1 space-y-4">
                        {recentActivities.map((act) => (
                            <div key={act.id} className="flex items-start gap-3">
                                <div className={`w-2 h-2 mt-2 rounded-full ${act.status === 'DISETUJUI' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                <div>
                                    <p className="text-sm text-slate-300">
                                        <span className="font-semibold text-white">{act.createdBy?.fullName || "Petugas"}</span> mengirim data di RT {act.rt}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(act.createdAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bgColor, borderColor }: any) {
    return (
        <div className={`p-6 rounded-2xl border bg-slate-900 ${borderColor} relative overflow-hidden group hover:border-slate-500 transition-colors`}>
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${bgColor} blur-2xl group-hover:scale-150 transition-transform`}></div>
            <div className="relative z-10 flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor} ${color} border ${borderColor}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                </div>
            </div>
        </div>
    );
}
