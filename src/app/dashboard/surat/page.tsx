"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSuratList, updateSuratStatus } from "@/actions/village";
import { getDashboardRealtimeStats } from "@/actions/dashboard";
import { StatusSurat } from "@prisma/client";
import { 
    FileText, 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    Search,
    Filter,
    MoreHorizontal,
    Send,
    FileSignature,
    CalendarDays,
    BarChart3
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function SuratManagementPage() {
    const [surat, setSurat] = useState<any[]>([]);
    const [stats, setStats] = useState({ suratHariIni: 0, totalAntrean: 0, suratSelesai: 0 });
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState("all"); // all, day, month, year

    useEffect(() => {
        loadData();
    }, [timeFilter]);

    const loadData = async () => {
        setLoading(true);
        const [suratData, realtimeStats] = await Promise.all([
            getSuratList(),
            getDashboardRealtimeStats()
        ]);
        
        let filteredSurat = suratData;
        const now = new Date();
        
        if (timeFilter === "day") {
            filteredSurat = suratData.filter((s: any) => new Date(s.createdAt).toDateString() === now.toDateString());
        } else if (timeFilter === "month") {
            filteredSurat = suratData.filter((s: any) => {
                const d = new Date(s.createdAt);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });
        } else if (timeFilter === "year") {
            filteredSurat = suratData.filter((s: any) => new Date(s.createdAt).getFullYear() === now.getFullYear());
        }

        setSurat(filteredSurat);
        setStats(realtimeStats);
        setLoading(false);
    };

    const handleVerify = async (id: string, currentStatus: StatusSurat) => {
        if (currentStatus === StatusSurat.TERTUNDA) {
            // Level 1 verifikasi (Misal: RT/RW -> Admin)
            await updateSuratStatus(id, StatusSurat.TERVERIFIKASI);
            alert("Surat telah diverifikasi dan diteruskan ke tahap selanjutnya.");
            loadData();
        } else if (currentStatus === StatusSurat.TERVERIFIKASI) {
            // Level 2 persetujuan (Misal: Kades/Sekdes menyetujui)
            const nomorRegister = prompt("Masukkan Nomor Register Surat (Opsional):");
            if (nomorRegister !== null) {
                await updateSuratStatus(id, StatusSurat.DISETUJUI, nomorRegister || undefined);
                alert("Surat telah disetujui.");
                loadData();
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pusat Persuratan</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Kelola, verifikasi, dan pantau seluruh pengajuan surat warga.</p>
                </div>
                <div className="flex gap-3 items-center">
                    <Link 
                        href="/dashboard/surat/templates"
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95"
                    >
                        <FileSignature size={18} /> Kelola Template
                    </Link>
                </div>
            </div>

            {/* Realtime Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-[1.5rem] flex items-center justify-center shrink-0 relative z-10">
                        <FileText size={32} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Surat Hari Ini</p>
                        <p className="text-3xl font-black text-slate-800">{stats.suratHariIni}</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-[1.5rem] flex items-center justify-center shrink-0 relative z-10">
                        <Clock size={32} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Antrean</p>
                        <p className="text-3xl font-black text-slate-800">{stats.totalAntrean}</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shrink-0 relative z-10">
                        <CheckCircle2 size={32} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Surat Selesai (Hari Ini)</p>
                        <p className="text-3xl font-black text-slate-800">{stats.suratSelesai}</p>
                    </div>
                </div>
            </div>

            {/* List and Filters */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl w-fit">
                        <button onClick={() => setTimeFilter("all")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeFilter === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Semua</button>
                        <button onClick={() => setTimeFilter("day")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeFilter === "day" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Hari Ini</button>
                        <button onClick={() => setTimeFilter("month")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeFilter === "month" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Bulan Ini</button>
                        <button onClick={() => setTimeFilter("year")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeFilter === "year" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Tahun Ini</button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari Pengajuan..." 
                            className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all w-full md:w-64"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">
                                <th className="py-6 pl-8">Detail Warga</th>
                                <th>Jenis & Keperluan</th>
                                <th>Nomor Register</th>
                                <th>Status Progres</th>
                                <th>Waktu Pengajuan</th>
                                <th className="pr-8 text-right">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {surat.map((item) => (
                                <tr key={item.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="py-6 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-[1rem] flex items-center justify-center text-blue-600 font-black shadow-sm">
                                                {item.warga.namaLengkap.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800">{item.warga.namaLengkap}</span>
                                                <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">NIK: {item.warga.nik}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-800 mb-1">{item.jenisSurat}</span>
                                            <span className="text-[11px] text-slate-500 font-medium line-clamp-1 max-w-xs">{item.keperluan || "-"}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                            {item.nomorSurat || "Belum Ada"}
                                        </span>
                                    </td>
                                    <td>
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="text-xs text-slate-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays size={14} className="text-slate-400" />
                                            {formatRelativeTime(new Date(item.createdAt))}
                                        </div>
                                    </td>
                                    <td className="pr-8 text-right">
                                        {item.status === StatusSurat.TERTUNDA && (
                                            <button 
                                                onClick={() => handleVerify(item.id, item.status)}
                                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                                            >
                                                <Send size={14} /> Teruskan
                                            </button>
                                        )}
                                        {item.status === StatusSurat.TERVERIFIKASI && (
                                            <button 
                                                onClick={() => handleVerify(item.id, item.status)}
                                                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                            >
                                                <CheckCircle2 size={14} /> Setujui
                                            </button>
                                        )}
                                        {item.status === StatusSurat.DISETUJUI && (
                                            <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {surat.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText size={32} />
                                        </div>
                                        <p className="text-slate-500 font-medium">Belum ada data pengajuan surat.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: StatusSurat }) {
    const configs: any = {
        [StatusSurat.TERTUNDA]: { text: "Menunggu", color: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
        [StatusSurat.TERVERIFIKASI]: { text: "Terverifikasi", color: "bg-blue-50 text-blue-600 border-blue-100", icon: AlertCircle },
        [StatusSurat.DISETUJUI]: { text: "Disetujui", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle2 },
        [StatusSurat.DITOLAK]: { text: "Ditolak", color: "bg-rose-50 text-rose-600 border-rose-100", icon: AlertCircle },
    }
    const config = configs[status];
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[0.5rem] text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
            <Icon size={12} />
            {config.text}
        </div>
    )
}
