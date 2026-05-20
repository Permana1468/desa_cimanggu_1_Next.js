"use client";

import React, { useState } from "react";
import { Building, Power, CheckCircle2, ShieldAlert } from "lucide-react";
import { toggleTenantStatus } from "@/actions/master";

interface TenantManagementClientProps {
    initialTenants: any[];
}

export function TenantManagementClient({ initialTenants }: TenantManagementClientProps) {
    const [tenants, setTenants] = useState(initialTenants);

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const isTurningOff = currentStatus;
        const msg = isTurningOff 
            ? "Peringatan: Jika dimatikan, seluruh warga dan admin desa dari wilayah ini tidak akan bisa login. Lanjutkan?"
            : "Aktifkan kembali akses untuk desa ini?";

        if (!confirm(msg)) return;

        try {
            const updated = await toggleTenantStatus(id, !currentStatus);
            setTenants(tenants.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t));
        } catch (error: any) {
            alert(error.message || "Gagal mengubah status desa.");
        }
    };

    return (
        <div className="mb-12 animate-in slide-in-from-top duration-700">
            <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-slate-200/40 border border-slate-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Status Akses Desa (Maintenance)</h2>
                        <p className="text-sm text-slate-500 font-medium">Kontrol akses masuk untuk keseluruhan akun dalam satu desa.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tenants.map(tenant => (
                        <div key={tenant.id} className={`p-6 rounded-[2rem] border transition-all ${tenant.isActive ? 'bg-slate-50 border-slate-100' : 'bg-rose-50 border-rose-100 shadow-xl shadow-rose-100'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Building size={20} className={tenant.isActive ? 'text-slate-400' : 'text-rose-500'} />
                                    <h3 className="font-bold text-lg text-slate-800">{tenant.name}</h3>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tenant.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {tenant.isActive ? 'Online' : 'Maintenance'}
                                </div>
                            </div>
                            
                            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
                                {tenant.isActive 
                                    ? "Sistem beroperasi normal. Semua akun desa dapat masuk dan menggunakan fitur."
                                    : "Akses ditutup. Warga & Admin Desa akan melihat halaman peringatan saat login."}
                            </p>

                            <button 
                                onClick={() => handleToggle(tenant.id, tenant.isActive)}
                                className={`w-full py-4 rounded-[1.5rem] flex items-center justify-center gap-2 text-sm font-black transition-all ${
                                    tenant.isActive 
                                    ? 'bg-white text-rose-600 border border-rose-100 hover:bg-rose-50' 
                                    : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700'
                                }`}
                            >
                                <Power size={16} /> {tenant.isActive ? 'Matikan Akses (Maintenance)' : 'Nyalakan Sistem'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
