"use client";

import React, { useState } from "react";
import { User, Power, Search, ShieldAlert } from "lucide-react";
import { toggleUserStatus } from "@/actions/master";
import Image from "next/image";

interface UserMaintenanceClientProps {
    initialUsers: any[];
}

export function UserMaintenanceClient({ initialUsers }: UserMaintenanceClientProps) {
    const [users, setUsers] = useState(initialUsers);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredUsers = users.filter(u => 
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleToggle = async (userId: string, currentStatus: boolean) => {
        const isTurningOff = currentStatus;
        const msg = isTurningOff 
            ? "Tangguhkan (Matikan) akses untuk pengguna ini? Ia tidak akan bisa login."
            : "Aktifkan kembali akses untuk pengguna ini?";

        if (!confirm(msg)) return;

        try {
            const updated = await toggleUserStatus(userId, !currentStatus);
            setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
        } catch (error: any) {
            alert(error.message || "Gagal mengubah status pengguna.");
        }
    };

    return (
        <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                        <User size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Status Akses Individu</h2>
                        <p className="text-sm text-slate-500 font-medium">Matikan akses spesifik untuk akun individu secara satu per satu.</p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari pengguna..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-64 pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {filteredUsers.map(user => (
                    <div key={user.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${user.isActive ? 'bg-white border-slate-100' : 'bg-rose-50 border-rose-200 shadow-md shadow-rose-100'}`}>
                        <div className="flex items-center gap-4">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0">
                                <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" alt="Avatar" fill className="object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900 truncate max-w-[120px]">{user.fullName}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{user.role.replace('_', ' ')}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleToggle(user.id, user.isActive)}
                            title={user.isActive ? "Matikan Akses" : "Nyalakan Akses"}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0 ${
                                user.isActive 
                                ? 'bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50' 
                                : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                            }`}
                        >
                            <Power size={18} />
                        </button>
                    </div>
                ))}
                
                {filteredUsers.length === 0 && (
                    <div className="col-span-full py-10 text-center text-slate-400 font-medium text-sm">
                        Pengguna tidak ditemukan.
                    </div>
                )}
            </div>
        </div>
    );
}
