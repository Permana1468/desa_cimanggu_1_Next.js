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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-slate-200/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full -mr-48 -mt-48 pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-600/20">
                            <Key size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Identity & Access Policy</h3>
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-0.5">RBAC Matrix Management Engine</p>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {roles.map(role => (
                            <div key={role} className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-slate-200/70" />
                                    <div className="flex items-center gap-2.5 px-5 py-2 bg-slate-900 text-white rounded-xl shadow-xs">
                                        <ShieldCheck size={16} className="text-amber-400" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{role.replace('_', ' ')}</span>
                                    </div>
                                    <div className="h-[1px] flex-1 bg-slate-200/70" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                    {permissions.filter(p => p.role === role).map(perm => (
                                        <div key={perm.id} className="p-6 bg-slate-50/60 rounded-2xl border border-slate-200/70 hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all group">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-white text-indigo-600 rounded-xl flex items-center justify-center border border-slate-200/70 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                                                        <Server size={16} />
                                                    </div>
                                                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{perm.module}</h4>
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5">
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
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                <div className="flex-1 bg-amber-50/80 p-6 sm:p-7 rounded-2xl border border-amber-200/80 flex items-start gap-4">
                    <div className="w-12 h-12 bg-white text-amber-500 rounded-xl flex items-center justify-center shadow-xs shrink-0 border border-amber-100">
                        <Lock size={22} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-base font-black text-slate-800 tracking-tight leading-none">Security Enforcement</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Setiap perubahan pada matriks izin ini akan langsung diterapkan secara global di seluruh tenant tanpa perlu melakukan restart server atau deploy ulang.
                        </p>
                    </div>
                </div>
                <div className="flex-1 bg-blue-50/80 p-6 sm:p-7 rounded-2xl border border-blue-200/80 flex items-start gap-4">
                    <div className="w-12 h-12 bg-white text-blue-500 rounded-xl flex items-center justify-center shadow-xs shrink-0 border border-blue-100">
                        <Globe size={22} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-base font-black text-slate-800 tracking-tight leading-none">Multi-Tenant Sync</h4>
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
