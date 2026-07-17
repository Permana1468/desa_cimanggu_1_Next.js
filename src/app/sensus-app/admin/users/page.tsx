import { Metadata } from "next";
import { Users as UsersIcon, Plus, Edit2, Trash2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Sensus App | Manajemen Users",
};

export default function UsersPage() {
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-8">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <UsersIcon className="text-blue-500" /> Manajemen Pengguna
                    </h1>
                    <p className="text-slate-400">Atur akun petugas surveyor dan admin verifikator.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                    <Plus size={18} /> Tambah Pengguna
                </button>
            </header>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-4">
                    <input 
                        type="text" 
                        placeholder="Cari nama atau email..." 
                        className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white w-64 focus:outline-none focus:border-blue-500"
                    />
                    <select className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500">
                        <option value="">Semua Peran</option>
                        <option value="admin">Admin Verifikator</option>
                        <option value="surveyor">Surveyor Lapangan</option>
                    </select>
                </div>
                
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950/50 sticky top-0">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama Lengkap</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Peran (Role)</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {[
                                { name: "Abas Suhanda", email: "sensus@cimanggu1.desa.id", role: "Surveyor Lapangan", status: "Aktif" },
                                { name: "Admin Utama", email: "master@cimanggu1.desa.id", role: "Admin Verifikator", status: "Aktif" },
                                { name: "Budi Santoso", email: "budi@cimanggu1.desa.id", role: "Surveyor Lapangan", status: "Nonaktif" },
                            ].map((user, i) => (
                                <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 text-sm font-medium text-white">{user.name}</td>
                                    <td className="p-4 text-sm text-slate-400">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${user.role === 'Admin Verifikator' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1.5 text-xs font-medium ${user.status === 'Aktif' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Aktif' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-600'}`}></span>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors mr-1">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
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
