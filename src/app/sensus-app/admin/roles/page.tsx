import { Metadata } from "next";
import { ShieldCheck, Plus, Key } from "lucide-react";

export const metadata: Metadata = {
    title: "Sensus App | Manajemen Roles",
};

export default function RolesPage() {
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-8">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <ShieldCheck className="text-amber-500" /> Manajemen Roles
                    </h1>
                    <p className="text-slate-400">Atur hak akses (peran) untuk masing-masing pengguna sistem.</p>
                </div>
                <button className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                    <Plus size={18} /> Buat Role Baru
                </button>
            </header>

            <div className="grid grid-cols-2 gap-6">
                {[
                    { title: "Admin Verifikator", count: 2, desc: "Akses penuh ke semua fitur Command Center dan berhak meninjau serta menyetujui data dari lapangan.", color: "purple" },
                    { title: "Surveyor Lapangan", count: 12, desc: "Akses khusus aplikasi mobile GPS untuk menginput data sensus. Tidak memiliki akses ke dashboard ini.", color: "blue" },
                    { title: "Viewer / Tamu", count: 5, desc: "Hanya bisa melihat peta sebaran dan statistik tanpa hak untuk menambah, mengubah, atau memverifikasi data.", color: "slate" },
                ].map((role, i) => (
                    <div key={i} className={`bg-slate-900 border border-slate-800 hover:border-${role.color}-500/50 rounded-2xl p-6 transition-all group`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-${role.color}-500/10 text-${role.color}-400 flex items-center justify-center border border-${role.color}-500/20`}>
                                <Key size={24} />
                            </div>
                            <span className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-xs font-medium text-slate-300">
                                {role.count} Pengguna
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                        <p className="text-sm text-slate-400 mb-6">{role.desc}</p>
                        
                        <div className="flex gap-2">
                            <button className="text-xs px-3 py-1.5 rounded-lg font-medium bg-slate-800 text-white hover:bg-slate-700">Edit Akses</button>
                            <button className="text-xs px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-rose-400">Hapus</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
