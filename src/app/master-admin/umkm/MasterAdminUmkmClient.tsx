"use client";

import { useState } from "react";
import { Store, Search, Filter, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { approveStore } from "@/app/actions/umkm";

export default function MasterAdminUmkmClient({ umkmList }: { umkmList: any[] }) {
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState<string | null>(null);

    const filteredList = statusFilter === "ALL" ? umkmList : umkmList.filter(u => u.status === statusFilter);

    const handleApprove = async (id: string) => {
        if(confirm("Setujui toko ini?")) {
            setLoading(id);
            const res = await approveStore(id);
            setLoading(null);
            if (!res.success) alert(res.error);
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                        <Store size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Verifikasi UMKM</h1>
                        <p className="text-sm text-slate-500 font-medium">Kelola dan verifikasi toko UMKM yang mendaftar di Marketplace Desa.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex gap-2">
                        {["ALL", "PENDING", "APPROVED", "REJECTED"].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === status ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {status === "ALL" ? "Semua" : status === "PENDING" ? "Menunggu Verifikasi" : status === "APPROVED" ? "Disetujui" : "Ditolak"}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="Cari nama toko..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium w-64 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50">
                                <th className="p-4 rounded-tl-xl">Toko & Pemilik</th>
                                <th className="p-4">Kontak (WhatsApp)</th>
                                <th className="p-4">Tanggal Daftar</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right rounded-tr-xl">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Belum ada data toko</td>
                                </tr>
                            )}
                            {filteredList.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{item.storeName}</div>
                                        <div className="text-xs text-slate-500">{item.user?.fullName}</div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-600">{item.user?.phoneNumber || item.user?.nik || "-"}</td>
                                    <td className="p-4 text-sm font-medium text-slate-600">{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                                            item.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                            item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-rose-100 text-rose-700'
                                        }`}>
                                            {item.status === 'PENDING' ? <AlertCircle size={12}/> : item.status === 'APPROVED' ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {item.status === 'PENDING' && (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    disabled={loading === item.id}
                                                    onClick={() => handleApprove(item.id)} 
                                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                                >
                                                    {loading === item.id ? "..." : "Setujui"}
                                                </button>
                                                <button className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors">Tolak</button>
                                            </div>
                                        )}
                                        {item.status === 'APPROVED' && (
                                            <button className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors">Bekukan Akun</button>
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
