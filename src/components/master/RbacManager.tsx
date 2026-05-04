"use client";

import React, { useState } from "react";
import { Shield, Check, X, Eye, Plus, Edit3, Trash, Loader2, ShieldCheck, Key, Lock, Globe, Server } from "lucide-react";
import { updateRolePermission } from "@/actions/master";

interface RbacManagerProps {
    initialPermissions: any[];
}

export const RbacManager = ({ initialPermissions }: RbacManagerProps) => {
    const [permissions, setPermissions] = useState(initialPermissions);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const handleToggle = async (id: string, field: string, currentValue: boolean) => {
        setIsUpdating(`${id}-${field}`);
        try {
            const result = await updateRolePermission(id, { [field]: !currentValue });
            setPermissions(prev => prev.map(p => p.id === id ? result : p));
        } catch (error: any) {
            alert(error.message || "Gagal memperbarui izin");
        } finally {
            setIsUpdating(null);
        }
    };

    const roles = Array.from(new Set(permissions.map(p => p.role)));

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -mr-48 -mt-48 opacity-50" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-12">
                        <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                            <Key size={32} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Identity & Access Policy</h3>
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mt-1">RBAC Matrix Management Engine</p>
                        </div>
                    </div>

                    <div className="space-y-16">
                        {roles.map(role => (
                            <div key={role} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-[2px] flex-1 bg-slate-100" />
                                    <div className="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-[2rem] shadow-xl shadow-slate-900/10">
                                        <ShieldCheck size={18} className="text-amber-400" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{role.replace('_', ' ')}</span>
                                    </div>
                                    <div className="h-[2px] flex-1 bg-slate-100" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {permissions.filter(p => p.role === role).map(perm => (
                                        <div key={perm.id} className="p-8 bg-white rounded-[2.5rem] border-2 border-slate-50 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 group">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        <Server size={18} />
                                                    </div>
                                                    <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">{perm.module}</h4>
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <PermissionTile 
                                                    label="View" 
                                                    active={perm.canView} 
                                                    icon={Eye} 
                                                    loading={isUpdating === `${perm.id}-canView`}
                                                    onClick={() => handleToggle(perm.id, 'canView', perm.canView)} 
                                                />
                                                <PermissionTile 
                                                    label="Create" 
                                                    active={perm.canCreate} 
                                                    icon={Plus} 
                                                    loading={isUpdating === `${perm.id}-canCreate`}
                                                    onClick={() => handleToggle(perm.id, 'canCreate', perm.canCreate)} 
                                                />
                                                <PermissionTile 
                                                    label="Update" 
                                                    active={perm.canUpdate} 
                                                    icon={Edit3} 
                                                    loading={isUpdating === `${perm.id}-canUpdate`}
                                                    onClick={() => handleToggle(perm.id, 'canUpdate', perm.canUpdate)} 
                                                />
                                                <PermissionTile 
                                                    label="Delete" 
                                                    active={perm.canDelete} 
                                                    icon={Trash} 
                                                    loading={isUpdating === `${perm.id}-canDelete`}
                                                    onClick={() => handleToggle(perm.id, 'canDelete', perm.canDelete)} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* INFO PANEL */}
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 bg-amber-50 p-10 rounded-[3rem] border border-amber-100 flex items-start gap-6">
                    <div className="w-14 h-14 bg-white text-amber-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                        <Lock size={28} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none">Security Enforcement</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Setiap perubahan pada matriks izin ini akan langsung diterapkan secara global di seluruh tenant tanpa perlu melakukan restart server atau deploy ulang.
                        </p>
                    </div>
                </div>
                <div className="flex-1 bg-blue-50 p-10 rounded-[3rem] border border-blue-100 flex items-start gap-6">
                    <div className="w-14 h-14 bg-white text-blue-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                        <Globe size={28} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none">Multi-Tenant Sync</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Kebijakan hak akses ini berlaku untuk semua desa (tenants) yang terhubung di bawah naungan Master Admin Cimanggu I.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

function PermissionTile({ label, active, icon: Icon, onClick, loading }: any) {
    return (
        <button 
            onClick={onClick}
            disabled={loading}
            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                active 
                ? 'bg-emerald-50/30 border-emerald-500/20 text-emerald-700 shadow-sm' 
                : 'bg-white border-slate-50 text-slate-400 grayscale opacity-60'
            } hover:scale-[1.03] active:scale-95 disabled:opacity-50`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Icon size={12} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-tight">{label}</span>
            </div>
            {loading ? (
                <Loader2 size={12} className="animate-spin text-slate-400" />
            ) : (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-emerald-100' : 'bg-slate-50'}`}>
                    {active ? <Check size={10} /> : <X size={10} />}
                </div>
            )}
        </button>
    )
}
