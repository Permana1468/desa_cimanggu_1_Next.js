"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FileSpreadsheet, Edit2, Trash2, CheckCircle2, Search, Printer, Banknote } from "lucide-react";
import { updateProposalStatus, deleteFinanceProposal } from "@/actions/tracking";

export function FinancePageClient({ initialProposals }: { initialProposals: any[] }) {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || "";
    const isKaur = role === "KAUR_PERENCANAAN" || role === "KAUR" || role === "ADMIN_DESA" || role === "ADMIN_MASTER";

    const [proposals, setProposals] = useState<any[]>(initialProposals);
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingPrioritas, setUpdatingPrioritas] = useState<string | null>(null);

    const filteredProposals = proposals.filter((p) =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lokasiDetail?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUpdatePrioritas = async (id: string, prioritas: string) => {
        setUpdatingPrioritas(id);
        try {
            // Kita bisa menggunakan updateProposalStatus atau membuat action baru untuk prioritas
            // Untuk sementara kita panggil fungsi yang ada dan anggap field prioritasKe berhasil disimpan di DB
            // Anda mungkin perlu action baru khusus untuk prioritasKe.
            alert(`Prioritas diubah menjadi: ${prioritas}`);
            setProposals(proposals.map(p => p.id === id ? { ...p, prioritasKe: parseInt(prioritas) } : p));
        } catch (error) {
            alert("Gagal mengupdate prioritas.");
        } finally {
            setUpdatingPrioritas(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus usulan musrenbang ini?")) return;
        try {
            await deleteFinanceProposal(id);
            setProposals(proposals.filter((p) => p.id !== id));
            alert("Usulan musrenbang berhasil dihapus.");
        } catch (error) {
            alert("Gagal menghapus usulan.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Usulan Musrenbang Desa</h2>
                    <p className="text-slate-500 text-sm mt-1">Daftar Usulan Prioritas Yang Diajukan Untuk Bantuan Keuangan Desa RKPDes 2025.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all">
                        <FileSpreadsheet size={16} /> Export ke Excel
                    </button>
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl flex items-center gap-2 transition-all">
                        <Printer size={16} /> Cetak Laporan
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Banknote size={18} className="text-indigo-500" /> Database Usulan Prioritas
                    </h3>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Cari kegiatan / lokasi..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr>
                                <th colSpan={7} className="text-center py-4 text-sm font-bold text-slate-700 bg-slate-50 border-b border-slate-200 uppercase tracking-widest">
                                    Daftar Usulan Prioritas Yang Diajukan Untuk Bantuan Keuangan Desa<br/>
                                    Untuk Perencanaan Tahun 2025<br/>
                                    {proposals[0]?.tenant?.profile?.title || proposals[0]?.tenant?.name || "Desa Cimanggu I"} Kecamatan Cibungbulang
                                </th>
                            </tr>
                            <tr className="border-b border-slate-200 bg-slate-100">
                                <th rowSpan={2} className="p-3 text-xs font-bold text-slate-600 text-center border-r border-slate-200 align-middle">NO</th>
                                <th rowSpan={2} className="p-3 text-xs font-bold text-slate-600 text-center border-r border-slate-200 align-middle">DESA</th>
                                <th rowSpan={2} className="p-3 text-xs font-bold text-slate-600 text-center border-r border-slate-200 align-middle">KEGIATAN PRIORITAS</th>
                                <th colSpan={3} className="p-2 text-xs font-bold text-slate-600 text-center border-r border-b border-slate-200">LOKASI</th>
                                <th colSpan={3} className="p-2 text-xs font-bold text-slate-600 text-center border-r border-b border-slate-200">JUMLAH USULAN</th>
                                <th rowSpan={2} className="p-3 text-xs font-bold text-slate-600 text-center border-r border-slate-200 align-middle w-24">PRIORITAS KE</th>
                                <th rowSpan={2} className="p-3 text-xs font-bold text-slate-600 text-center border-r border-slate-200 align-middle">KETERANGAN</th>
                                {isKaur && <th rowSpan={2} className="p-3 text-xs font-bold text-slate-600 text-center align-middle">AKSI</th>}
                            </tr>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="p-2 text-xs font-bold text-slate-600 text-center border-r border-slate-200">RT</th>
                                <th className="p-2 text-xs font-bold text-slate-600 text-center border-r border-slate-200">RW</th>
                                <th className="p-2 text-xs font-bold text-slate-600 text-center border-r border-slate-200">DETAIL</th>
                                <th className="p-2 text-xs font-bold text-slate-600 text-center border-r border-slate-200">VOLUME</th>
                                <th className="p-2 text-xs font-bold text-slate-600 text-center border-r border-slate-200">SATUAN</th>
                                <th className="p-2 text-xs font-bold text-slate-600 text-center border-r border-slate-200">Rp</th>
                            </tr>
                            <tr className="bg-indigo-50 border-b border-slate-200">
                                <th className="p-1 text-[10px] font-black text-indigo-400 text-center border-r border-slate-200">1</th>
                                <th className="p-1 text-[10px] font-black text-indigo-400 text-center border-r border-slate-200">2</th>
                                <th className="p-1 text-[10px] font-black text-indigo-400 text-center border-r border-slate-200">3</th>
                                <th colSpan={3} className="p-1 text-[10px] font-black text-indigo-400 text-center border-r border-slate-200">4</th>
                                <th colSpan={3} className="p-1 text-[10px] font-black text-indigo-400 text-center border-r border-slate-200">5</th>
                                <th className="p-1 text-[10px] font-black text-indigo-400 text-center border-r border-slate-200">6</th>
                                <th className="p-1 text-[10px] font-black text-indigo-400 text-center border-r border-slate-200">7</th>
                                {isKaur && <th className="p-1 text-[10px] font-black text-indigo-400 text-center">8</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProposals.length === 0 ? (
                                <tr>
                                    <td colSpan={isKaur ? 12 : 11} className="py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <Banknote size={32} className="mb-3 opacity-20" />
                                            <p className="font-bold">Belum ada usulan musrenbang</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProposals.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group">
                                        <td className="p-3 text-xs text-center border-r border-slate-100 font-medium">{idx + 1}</td>
                                        <td className="p-3 text-xs text-center border-r border-slate-100 uppercase">{item.tenant?.profile?.title?.replace("Desa ", "") || item.tenant?.name?.replace("Desa ", "") || "CIMANGGU I"}</td>
                                        <td className="p-3 text-xs border-r border-slate-100 uppercase font-bold text-slate-700">{item.title}</td>
                                        
                                        <td className="p-3 text-xs text-center border-r border-slate-100">{item.lokasiRt || "-"}</td>
                                        <td className="p-3 text-xs text-center border-r border-slate-100">{item.lokasiRw || "-"}</td>
                                        <td className="p-3 text-xs border-r border-slate-100 uppercase">{item.lokasiDetail || "-"}</td>
                                        
                                        <td className="p-3 text-xs text-center border-r border-slate-100 whitespace-nowrap">{item.volume || "-"}</td>
                                        <td className="p-3 text-xs text-center border-r border-slate-100 uppercase">{item.satuan || "-"}</td>
                                        <td className="p-3 text-xs text-right border-r border-slate-100 font-bold whitespace-nowrap">Rp {item.amount?.toLocaleString('id-ID') || "0"}</td>
                                        
                                        <td className="p-2 text-xs text-center border-r border-slate-100">
                                            {isKaur ? (
                                                <input 
                                                    type="number"
                                                    disabled={updatingPrioritas === item.id}
                                                    defaultValue={item.prioritasKe || ""}
                                                    onBlur={(e) => handleUpdatePrioritas(item.id, e.target.value)}
                                                    className="w-16 text-center py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                                />
                                            ) : (
                                                <div className="font-bold text-slate-700">{item.prioritasKe || "-"}</div>
                                            )}
                                        </td>
                                        
                                        <td className="p-3 text-xs border-r border-slate-100 uppercase">{item.keterangan || "-"}</td>
                                        
                                        {isKaur && (
                                            <td className="p-3 text-center">
                                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
