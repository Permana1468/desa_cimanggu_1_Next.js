import prisma from "@/lib/prisma";
import { Database, Search, Filter, Download, UserCheck } from "lucide-react";

export default async function GlobalDataPage() {
    const data = await prisma.dataKependudukan.findMany({
        take: 50,
        include: { tenant: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Data Kependudukan Global</h1>
                    <p className="text-slate-500 text-sm">Pusat data agregat seluruh warga dari seluruh tenant desa.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white text-slate-700 px-4 py-3 rounded-2xl text-xs font-bold shadow-sm border border-slate-200 flex items-center gap-2">
                        <Download size={16} /> Export Data
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari NIK atau Nama Warga..." 
                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium"
                        />
                    </div>
                    <button className="bg-slate-100 p-4 rounded-2xl text-slate-600 hover:bg-slate-200 transition-all">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                                <th className="pb-4 pl-4">NIK</th>
                                <th className="pb-4">Nama Lengkap</th>
                                <th className="pb-4">Jenis Kelamin</th>
                                <th className="pb-4">Desa (Tenant)</th>
                                <th className="pb-4">Status Akun</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.map((warga) => (
                                <tr key={warga.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="py-4 pl-4">
                                        <span className="text-xs font-black text-slate-800 font-mono tracking-tighter">{warga.nik}</span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{warga.namaLengkap}</span>
                                            <span className="text-[10px] text-slate-400">{warga.tempatLahir}, {new Date(warga.tanggalLahir).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{warga.jenisKelamin}</span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit border border-amber-100">
                                            {warga.tenant.name}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            <UserCheck size={14} className="text-emerald-500" /> Terverifikasi
                                        </div>
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
