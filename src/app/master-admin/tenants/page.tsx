import { getAllTenants } from "@/app/actions/master";
import { Building2, Globe, Users, Database, Plus } from "lucide-react";

export default async function TenantsPage() {
    const tenants = await getAllTenants();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Multi-Tenant Management</h1>
                    <p className="text-slate-500 text-sm">Kelola entitas desa dan konfigurasi subdomain akses.</p>
                </div>
                <button className="bg-amber-500 text-slate-900 px-6 py-3 rounded-2xl text-xs font-bold shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95 flex items-center gap-2">
                    <Plus size={16} /> Registrasi Desa Baru
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map((tenant) => (
                    <div key={tenant.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 hover:border-amber-200 transition-all group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">
                                <Building2 size={28} />
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${tenant.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {tenant.isActive ? 'Active' : 'Inactive'}
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-slate-800 mb-2">{tenant.name}</h3>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6">
                            <Globe size={14} className="text-blue-500" /> {tenant.domain || "Internal Subdomain"}
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                            <div className="space-y-1">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin</span>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                    <Users size={14} className="text-slate-400" /> {(tenant as any)._count.users}
                                </div>
                            </div>
                            <div className="space-y-1 text-right">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Warga</span>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 justify-end">
                                    <Database size={14} className="text-slate-400" /> {(tenant as any)._count.dataKependudukan}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
