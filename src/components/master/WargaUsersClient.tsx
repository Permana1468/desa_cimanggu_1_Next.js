"use client";

import React, { useState, useMemo } from "react";
import { 
    Users, Shield, MapPin, CheckCircle2, XCircle, 
    Search, Plus, Edit2, Trash2, X, AlertTriangle,
    Mail, UserCircle, Lock, Building, ChevronRight,
    Loader2, Key, ShieldCheck, ArrowRight, Smartphone, Fingerprint
} from "lucide-react";
import { RoleType } from "@prisma/client";
import { upsertMasterUser, deleteMasterUser, toggleUserStatus, toggleUserSecurity } from "@/actions/master";
import { formatRelativeTime } from "@/lib/utils";
import Image from "next/image";

interface UserManagementClientProps {
    initialUsers: any[];
    tenants: { id: string; name: string }[];
}

export default function WargaUsersClient({ initialUsers, tenants = [] }: { initialUsers: any[], tenants?: any[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const [formData, setFormData] = useState<{
        email: string;
        fullName: string;
        role: RoleType;
        tenantId: string;
        password?: string;
        isActive: boolean;
        rt?: string;
        rw?: string;
    }>({
        email: "",
        fullName: "",
        role: RoleType.WARGA,
        tenantId: "",
        password: "",
        isActive: true,
        rt: "",
        rw: ""
    });


    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.role === 'WARGA' &&
            (u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())))
        );
    }, [users, searchQuery]);

    const handleOpenModal = (user?: any) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                email: user.email || "",
                fullName: user.fullName,
                role: user.role,
                tenantId: user.tenantId,
                password: "", 
                isActive: user.isActive,
                rt: user.rt || "",
                rw: user.rw || ""
            });
        } else {
            setEditingUser(null);
            setFormData({
                email: "",
                fullName: "",
                role: RoleType.ADMIN_DESA,
                tenantId: tenants[0]?.id || "",
                password: "",
                isActive: true,
                rt: "",
                rw: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await upsertMasterUser({
                id: editingUser?.id,
                ...formData
            });
            if (editingUser) {
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...result } : u));
            } else {
                setUsers([result, ...users]);
            }
            setIsModalOpen(false);
            alert(editingUser ? "User updated successfully!" : "User created successfully!");
        } catch (err: any) {
            alert(err.message || "Failed to save user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Hapus pengguna ini? Tindakan ini tidak dapat dibatalkan.")) return;
        setIsDeleting(userId);
        try {
            await deleteMasterUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err: any) {
            alert(err.message || "Gagal menghapus pengguna");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleToggleSecurity = async (userId: string, type: '2FA' | 'Biometric') => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const isEnabling = type === '2FA' ? !user.isTwoFactorEnabled : true;
        const msg = type === '2FA' 
            ? `${isEnabling ? 'Wajibkan' : 'Cabut'} 2FA untuk user ini?`
            : "Wajibkan registrasi Face-ID pada login berikutnya?";

        if (!confirm(msg)) return;

        try {
            const result = await toggleUserSecurity(userId, {
                force2FA: type === '2FA' ? isEnabling : undefined,
                requestBiometric: type === 'Biometric' ? true : undefined
            });
            setUsers(users.map(u => u.id === userId ? { ...u, ...result } : u));
            alert("Security protocol updated!");
        } catch (err: any) {
            alert(err.message || "Gagal memperbarui protokol keamanan");
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        const msg = currentStatus 
            ? "Tangguhkan akun ini? Pengguna tidak akan bisa login."
            : "Aktifkan kembali akun ini?";
        
        if (!confirm(msg)) return;

        try {
            const result = await toggleUserStatus(userId, !currentStatus);
            setUsers(users.map(u => u.id === userId ? { ...u, ...result } : u));
        } catch (err: any) {
            alert(err.message || "Gagal mengubah status pengguna");
        }
    };

    return (
        <div className="space-y-10 pb-20 px-4 md:px-0 animate-in fade-in duration-700">
            {/* EPIC HEADER */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                        <Key size={12} /> Access Control System
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                        Manajemen Data Warga
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full border border-teal-200">
                            {users.filter(u => u.role === 'WARGA').length} Warga
                        </span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-2">
                        Kelola data warga, otoritas akses, dan konfigurasi keamanan akun.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative group flex-1 xl:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cari nama atau email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xl shadow-slate-200/40"
                        />
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-10 py-5 rounded-[2rem] text-sm font-black shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 shrink-0 uppercase tracking-widest border border-blue-400/20"
                    >
                        <Plus size={20} /> Tambah Admin
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Administrator</th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Otorisasi / Peran</th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Wilayah Kerja</th>
                                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Opsi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className={`relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 group-hover:scale-110 transition-transform duration-500 ${user.role === 'ADMIN_MASTER' ? 'animate-ring-master' : 'animate-ring-desa'}`}>
                                                <Image 
                                                    src={user.photo || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop&ixlib=rb-4.0.3`} 
                                                    alt="Avatar" 
                                                    fill 
                                                    className="object-cover" 
                                                    unoptimized={!!user.photo}
                                                />
                                                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-none mb-1">{user.fullName}</span>
                                                <span className="text-xs text-slate-400 font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{user.email || user.nik}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex flex-col gap-2">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-[9px] font-black tracking-[0.1em] uppercase shadow-sm w-fit ${
                                                user.role === 'ADMIN_MASTER' 
                                                ? 'bg-amber-950 text-amber-400 border-amber-900' 
                                                : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                                <ShieldCheck size={14} /> {user.role.replace('_', ' ')}
                                            </div>
                                            {(user.rt || user.rw) && (
                                                <span className="inline-flex items-center w-fit px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-100 mt-1">
                                                    <MapPin size={10} className="mr-1" />
                                                    {user.role === 'RT' ? `RT ${user.rt} / RW ${user.rw}` : `RW ${user.rw}`}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-2 text-sm font-black text-slate-600">
                                            <MapPin size={16} className="text-slate-300" /> {user.tenant?.name || "Global Control"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse-indicator' : 'bg-slate-300'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {user.isActive ? 'System Online' : 'Suspended'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                            {/* SECURITY HARDENING OPTIONS (MASTER ONLY CONTROL) */}
                                            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                                                <button 
                                                    onClick={() => handleToggleSecurity(user.id, '2FA')}
                                                    title={user.isTwoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${user.isTwoFactorEnabled ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-blue-600'}`}
                                                >
                                                    <Smartphone size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleSecurity(user.id, 'Biometric')}
                                                    title="Request Face-ID Registration"
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-white hover:text-indigo-600 rounded-xl transition-all"
                                                >
                                                    <Fingerprint size={16} />
                                                </button>
                                            </div>

                                            {/* STATUS TOGGLE */}
                                            <button 
                                                onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                title={user.isActive ? "Tangguhkan (Maintenance)" : "Aktifkan Akun"}
                                                className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-xl shadow-slate-200/50 ${user.isActive ? 'bg-white text-slate-400 border border-slate-100 hover:text-rose-500' : 'bg-rose-500 text-white hover:bg-rose-600 border-transparent'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64A9 9 0 0 1 20.77 15"></path><path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"></path><path d="M12 2v10"></path><path d="m2 2 20 20"></path></svg>
                                            </button>

                                            <button 
                                                onClick={() => handleOpenModal(user)}
                                                className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:text-blue-600 border border-slate-100 rounded-2xl transition-all shadow-xl shadow-slate-200/50"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                disabled={isDeleting === user.id}
                                                onClick={() => handleDelete(user.id)}
                                                className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:text-red-500 border border-slate-100 rounded-2xl transition-all shadow-xl shadow-slate-200/50 disabled:opacity-50"
                                            >
                                                {isDeleting === user.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-5 md:p-8 space-y-6 bg-slate-50/50">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 space-y-6 active:scale-95 transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 ${user.role === 'ADMIN_MASTER' ? 'animate-ring-master' : 'animate-ring-desa'}`}>
                                        <Image 
                                            src={user.photo || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop&ixlib=rb-4.0.3`} 
                                            alt="Avatar" 
                                            fill 
                                            className="object-cover" 
                                            unoptimized={!!user.photo}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-slate-900 leading-none mb-1">{user.fullName}</p>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleToggleStatus(user.id, user.isActive)} className={`p-3 rounded-xl ${user.isActive ? 'bg-slate-50 text-slate-400 hover:text-rose-500' : 'bg-rose-500 text-white'}`}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64A9 9 0 0 1 20.77 15"></path><path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"></path><path d="M12 2v10"></path><path d="m2 2 20 20"></path></svg></button>
                                    <button onClick={() => handleOpenModal(user)} className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(user.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                <div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Wilayah</p>
                                    <p className="text-xs font-black text-slate-600">{user.tenant?.name || "Global"}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{user.isActive ? 'Aktif' : 'Nonaktif'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL - Premium Glassmorphism */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
                    
                    <div className="bg-white rounded-t-[3.5rem] sm:rounded-[4rem] shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col h-[90vh] sm:h-auto animate-in slide-in-from-bottom duration-500">
                        <div className="bg-slate-950 p-10 md:p-12 text-white relative shrink-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-none">{editingUser ? "Edit Profile" : "New Account"}</h2>
                                    <p className="text-blue-400 text-[10px] font-black mt-3 uppercase tracking-[0.3em]">Access Authorization Terminal</p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                                >
                                    <X size={28} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10 overflow-y-auto custom-scrollbar bg-slate-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                                <FormGroup label="Identitas Lengkap" icon={UserCircle}>
                                    <input 
                                        required
                                        value={formData.fullName}
                                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                                        placeholder="Full Name Sesuai KTP"
                                        className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                    />
                                </FormGroup>

                                <FormGroup label="Email Login" icon={Mail}>
                                    <input 
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        placeholder="admin@desa.id"
                                        className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                    />
                                </FormGroup>

                                <FormGroup label="Peran Otorisasi" icon={Shield}>
                                    <select 
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value as RoleType})}
                                        className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none shadow-sm"
                                    >
                                        <option value={RoleType.ADMIN_DESA}>Administrator Desa</option>
                                        <option value={RoleType.ADMIN_MASTER}>Master Administrator</option>
                                        <option value={RoleType.KADES}>Kepala Desa</option>
                                        <option value={RoleType.SEKDES}>Sekretaris Desa</option>
                                        <option value={RoleType.PERANGKAT_DESA}>Perangkat Desa Lainnya</option>
                                        <option value="KADUS">Kepala Dusun (KADUS)</option>
                                        <option value={RoleType.KARANG_TARUNA}>Karang Taruna</option>
                                        <option value={RoleType.RT}>Ketua RT</option>
                                        <option value={RoleType.RW}>Ketua RW</option>
                                        <option value={RoleType.LPM}>LPM</option>
                                        <option value="WARGA">Warga Desa</option>
                                    </select>
                                </FormGroup>

                                <FormGroup label="Wilayah Penugasan" icon={Building}>
                                    <select 
                                        value={formData.tenantId}
                                        onChange={e => setFormData({...formData, tenantId: e.target.value})}
                                        className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none shadow-sm"
                                    >
                                        {tenants.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </FormGroup>

                                {(formData.role === "RT" || formData.role === "RW" || formData.role === "KADUS") && (
                                    <>
                                        <FormGroup label={formData.role === "KADUS" ? "Wilayah Dusun" : "Wilayah RW"} icon={MapPin}>
                                            <select 
                                                value={formData.rw}
                                                onChange={e => setFormData({...formData, rw: e.target.value})}
                                                className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none shadow-sm"
                                            >
                                                <option value="">{formData.role === "KADUS" ? "Pilih Dusun" : "Pilih RW"}</option>
                                                {formData.role === "KADUS" ? (
                                                    <>
                                                        <option value="Dusun I">Dusun I</option>
                                                        <option value="Dusun II">Dusun II</option>
                                                        <option value="Dusun III">Dusun III</option>
                                                        <option value="Dusun IV">Dusun IV</option>
                                                    </>
                                                ) : (
                                                    Array.from({length: 9}, (_, i) => String(i + 1).padStart(3, '0')).map(rw => (
                                                        <option key={rw} value={rw}>RW {rw}</option>
                                                    ))
                                                )}
                                            </select>
                                        </FormGroup>

                                        {formData.role === "RT" && (
                                            <FormGroup label="Wilayah RT" icon={MapPin}>
                                                <select 
                                                    value={formData.rt}
                                                    onChange={e => setFormData({...formData, rt: e.target.value})}
                                                    className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none shadow-sm"
                                                >
                                                    <option value="">Pilih RT</option>
                                                    {Array.from({length: 5}, (_, i) => String(i + 1).padStart(3, '0')).map(rt => (
                                                        <option key={rt} value={rt}>RT {rt}</option>
                                                    ))}
                                                </select>
                                            </FormGroup>
                                        )}
                                    </>
                                )}

                                <FormGroup label={editingUser ? "Ganti Password (Opsional)" : "Sandi Akses"} icon={Lock}>
                                    <input 
                                        required={!editingUser}
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        placeholder="••••••••"
                                        className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                    />
                                </FormGroup>

                                <div className="flex flex-col justify-end pb-2">
                                    <label className="flex items-center gap-4 cursor-pointer group p-2 rounded-2xl hover:bg-white transition-all">
                                        <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${formData.isActive ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200'}`}>
                                            {formData.isActive && <CheckCircle2 size={18} />}
                                        </div>
                                        <input 
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                            className="hidden"
                                        />
                                        <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors">Aktifkan Akses Node</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-10 flex flex-col sm:flex-row gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-6 rounded-[2rem] text-sm font-black text-slate-400 uppercase tracking-widest hover:bg-white transition-all border border-transparent hover:border-slate-100"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] bg-slate-950 text-white py-6 rounded-[2rem] text-sm font-black shadow-2xl shadow-slate-900/30 transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] hover:bg-blue-600"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
                                    {editingUser ? "Confirm Update" : "Establish Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function FormGroup({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <label className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <Icon size={12} />
                </div>
                {label}
            </label>
            <div className="relative">
                {children}
            </div>
        </div>
    )
}
