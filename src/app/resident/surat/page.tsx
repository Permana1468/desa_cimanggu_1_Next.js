import { getResidentSuratHistory } from "@/actions/resident";
import { FileText, Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ResidentSuratHistory() {
    const history = await getResidentSuratHistory();

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "TERTUNDA":
                return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Menunggu" };
            case "TERVERIFIKASI":
                return { icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-50", label: "Diproses" };
            case "DISETUJUI":
                return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", label: "Selesai" };
            case "DITOLAK":
                return { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", label: "Ditolak" };
            default:
                return { icon: AlertCircle, color: "text-slate-600", bg: "bg-slate-50", label: status };
        }
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Status Pengajuan</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Pantau progres verifikasi surat yang Anda ajukan.
                    </p>
                </div>
                <Link 
                    href="/resident/surat/baru"
                    className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 w-fit"
                >
                    <Plus size={20} /> Buat Surat Baru
                </Link>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 min-h-[500px]">
                {history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map((surat) => {
                            const status = getStatusConfig(surat.status);
                            const StatusIcon = status.icon;
                            
                            return (
                                <div key={surat.id} className="p-5 rounded-[1.5rem] border border-slate-100 hover:border-blue-200 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 leading-tight">{surat.jenisSurat}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(surat.createdAt))}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:items-end gap-1">
                                        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${status.bg} ${status.color} w-fit`}>
                                            <StatusIcon size={14} />
                                            <span className="text-xs font-black uppercase tracking-widest">{status.label}</span>
                                        </div>
                                        {surat.keperluan && (
                                            <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                                                Keperluan: {surat.keperluan}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                            <Clock size={40} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-2">Belum Ada Pengajuan</h3>
                        <p className="text-slate-500 text-sm font-medium max-w-sm mb-6">
                            Anda belum pernah mengajukan surat keterangan. Klik tombol di atas untuk mulai membuat permohonan.
                        </p>
                        <Link 
                            href="/resident/surat/baru"
                            className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-slate-800 transition-colors"
                        >
                            Mulai Ajukan Sekarang
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
