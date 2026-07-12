"use client";

import React, { useState } from "react";
import { Users, Shield, CheckCircle2, XCircle, Search, AlertTriangle, Fingerprint } from "lucide-react";
import { verifyWargaUser } from "@/actions/wargaVerifikasi";

export default function VerifikasiWargaClient({ users }: { users: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    const filteredUsers = users.filter(u => 
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.nik && u.nik.includes(searchQuery))
    );

    const handleVerify = async (userId: string, isActive: boolean) => {
        if (!confirm(`Apakah Anda yakin ingin ${isActive ? 'menyetujui' : 'menolak/membekukan'} pendaftaran warga ini?`)) return;
        
        setIsSubmitting(userId);
        const res = await verifyWargaUser(userId, isActive);
        setIsSubmitting(null);

        if (!res.success) {
            alert(res.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <Fingerprint size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Verifikasi Pendaftaran Warga</h1>
                        <p className="text-sm text-slate-500 font-medium">Tinjau dan setujui pendaftaran akun Warga baru.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari warga berdasarkan Nama / NIK..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50">
                                <th className="p-4 rounded-tl-xl">Warga</th>
                                <th className="p-4">NIK</th>
                                <th className="p-4">Kontak</th>
                                <th className="p-4 text-center">Status Verifikasi</th>
                                <th className="p-4 text-right rounded-tr-xl">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">
                                        Tidak ada data pendaftaran warga.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase shrink-0">
                                                    {user.fullName.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{user.fullName}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{user.resident?.rt ? `RT ${user.resident.rt} / RW ${user.resident.rw}` : "Belum terpetakan"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-slate-600">
                                            {user.nik || "-"}
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-medium text-slate-800">{user.phoneNumber || "-"}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${
                                                user.isActive
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {user.isActive ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                                {user.isActive ? "TERVERIFIKASI" : "MENUNGGU"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {!user.isActive ? (
                                                    <button
                                                        onClick={() => handleVerify(user.id, true)}
                                                        disabled={isSubmitting === user.id}
                                                        className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                    >
                                                        {isSubmitting === user.id ? 'Memproses...' : 'Verifikasi Akses'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleVerify(user.id, false)}
                                                        disabled={isSubmitting === user.id}
                                                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                    >
                                                        Cabut Akses
                                                    </button>
                                                )}
                                            </div>
                                        </td>
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
