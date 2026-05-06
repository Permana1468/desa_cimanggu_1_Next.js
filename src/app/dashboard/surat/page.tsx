"use client";

import { useEffect, useState } from "react";
import { getSuratList, updateSuratStatus } from "@/actions/village";
import { StatusSurat } from "@prisma/client";
import { 
    FileText, 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    ArrowRightLeft,
    Search,
    Filter,
    MoreHorizontal,
    Send
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function SuratManagementPage() {
    const [surat, setSurat] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSurat();
    }, []);

    const loadSurat = async () => {
        const data = await getSuratList();
        setSurat(data);
        setLoading(false);
    };

    const handleVerify = async (id: string) => {
        await updateSuratStatus(id, StatusSurat.TERVERIFIKASI);
        loadSurat();
        // In a real app, this would trigger a notification to Sekdes
        alert("Surat telah diverifikasi dan diteruskan ke Sekdes.");
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pusat Persuratan</h1>
                    <p className="text-slate-500 text-sm">Kelola, verifikasi, dan pantau seluruh pengajuan surat warga.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari NIK atau Nama..." 
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                                <th className="py-6 pl-8">Detail Warga</th>
                                <th>Jenis & Keperluan</th>
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
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                                {item.warga.namaLengkap.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{item.warga.namaLengkap}</span>
                                                <span className="text-[11px] text-slate-400 font-medium">NIK: {item.warga.nik}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700">{item.jenisSurat}</span>
                                            <span className="text-[11px] text-slate-400 italic line-clamp-1">"{item.keperluan}"</span>
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="text-xs text-slate-500 font-medium">
                                        {formatRelativeTime(new Date(item.createdAt))}
                                    </td>
                                    <td className="pr-8 text-right">
                                        {item.status === StatusSurat.TERTUNDA && (
                                            <button 
                                                onClick={() => handleVerify(item.id)}
                                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                            >
                                                <Send size={14} /> Teruskan ke Sekdes
                                            </button>
                                        )}
                                        {item.status !== StatusSurat.TERTUNDA && (
                                            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: StatusSurat }) {
    const configs: any = {
        [StatusSurat.TERTUNDA]: { text: "Menunggu RT/RW", color: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
        [StatusSurat.TERVERIFIKASI]: { text: "Terverifikasi Admin", color: "bg-blue-50 text-blue-600 border-blue-100", icon: AlertCircle },
        [StatusSurat.DISETUJUI]: { text: "Disetujui Sekdes", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle2 },
        [StatusSurat.DITOLAK]: { text: "Ditolak", color: "bg-red-50 text-red-600 border-red-100", icon: AlertCircle },
    }
    const config = configs[status];
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${config.color}`}>
            <Icon size={12} />
            {config.text}
        </div>
    )
}
