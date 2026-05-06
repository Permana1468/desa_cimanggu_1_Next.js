import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFinanceProposals } from "@/actions/tracking";
import { Banknote, Plus, Search, Filter } from "lucide-react";

export default async function FinancePage() {
    const session = await getServerSession(authOptions);
    const proposals = await getFinanceProposals();

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Manajemen Usulan Dana</h1>
                    <p className="text-slate-500 text-sm">Pantau dan kelola pengajuan anggaran dari tiap lembaga desa.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200">
                    <Plus size={18} /> Buat Usulan Baru
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatMini label="Total Pengajuan" value={proposals.length.toString()} color="text-blue-600" />
                <StatMini label="Menunggu" value={proposals.filter(p => p.status === 'PENDING').length.toString()} color="text-amber-600" />
                <StatMini label="Disetujui" value={proposals.filter(p => p.status === 'APPROVED').length.toString()} color="text-emerald-600" />
                <StatMini label="Ditolak" value={proposals.filter(p => p.status === 'REJECTED').length.toString()} color="text-rose-600" />
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4 w-full max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Cari usulan..." 
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Judul Usulan</th>
                                <th className="px-6 py-4">Pengaju</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Nominal</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {proposals.length > 0 ? proposals.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 text-sm">{p.title}</div>
                                        <div className="text-[10px] text-slate-400">{new Date(p.createdAt).toLocaleDateString('id-ID')}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-600">{p.user.fullName}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">{p.category}</span>
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-800 text-sm">Rp {p.amount.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={p.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:underline text-xs font-bold">Detail</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic text-sm">
                                        Belum ada data usulan dana.
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

function StatMini({ label, value, color }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</span>
            <span className={`text-2xl font-black ${color}`}>{value}</span>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const colors: any = {
        PENDING: "bg-amber-50 text-amber-600 border-amber-100",
        APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
        REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
        VERIFIED: "bg-blue-50 text-blue-600 border-blue-100"
    };
    return (
        <span className={`px-2 py-1 rounded-lg border text-[10px] font-bold ${colors[status] || "bg-slate-50"}`}>
            {status}
        </span>
    )
}
