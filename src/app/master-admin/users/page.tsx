import { getAllUsers } from "@/app/actions/master";
import { Users, Shield, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default async function UserManagementPage() {
    const users = await getAllUsers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">User Management</h1>
                    <p className="text-slate-500 text-sm">Kelola seluruh akun administrator desa dan pengurus lembaga.</p>
                </div>
                <button className="bg-[#0f172a] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
                    <Users size={16} /> Tambah Admin Baru
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                                <th className="pb-4 pl-4">Pengguna</th>
                                <th className="pb-4">Peran</th>
                                <th className="pb-4">Tenant / Wilayah</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Terdaftar</th>
                                <th className="pb-4 text-right pr-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                                                {user.fullName.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{user.fullName}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{user.email || user.nik}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                                            <Shield size={12} /> {user.role}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                            <MapPin size={14} className="text-blue-500" /> {user.tenant?.name || "Global"}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        {user.isActive ? (
                                            <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                                                <CheckCircle2 size={14} /> Aktif
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold">
                                                <XCircle size={14} /> Nonaktif
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4 text-[10px] text-slate-400 font-bold uppercase">
                                        {formatRelativeTime(user.createdAt)}
                                    </td>
                                    <td className="py-4 text-right pr-4">
                                        <button className="text-blue-600 hover:text-blue-700 text-xs font-bold transition-colors">Edit</button>
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
