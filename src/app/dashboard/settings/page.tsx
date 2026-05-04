"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getBeritaList, deleteBerita } from "@/actions/cms";
import { createVillageAccount } from "@/actions/village";
import { RoleType } from "@prisma/client";
import { 
    Newspaper, 
    Users, 
    Plus, 
    Trash2, 
    Globe, 
    ShieldCheck,
    Mail,
    UserCircle,
    Lock
} from "lucide-react";

interface BeritaItem {
    id: string;
    judul: string;
    kategori: string | null;
    createdAt: Date;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("cms");
    
    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pengaturan & Konten</h1>
                <p className="text-slate-500 text-sm">Kelola konten website desa dan akun perangkat kewilayahan.</p>
            </div>

            <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl w-fit">
                <TabButton 
                    active={activeTab === "cms"} 
                    onClick={() => setActiveTab("cms")} 
                    icon={Newspaper} 
                    label="Manajemen Berita" 
                />
                <TabButton 
                    active={activeTab === "accounts"} 
                    onClick={() => setActiveTab("accounts")} 
                    icon={Users} 
                    label="Akun RT/RW" 
                />
            </div>

            <div className="mt-8">
                {activeTab === "cms" ? <CMSManager /> : <AccountManager />}
            </div>
        </div>
    );
}

function CMSManager() {
    const [berita, setBerita] = useState<BeritaItem[]>([]);

    const loadBerita = useCallback(async () => {
        const data = await getBeritaList();
        setBerita(data as BeritaItem[]);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            const data = await getBeritaList();
            if (isMounted) {
                setBerita(data as BeritaItem[]);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <Globe className="text-blue-500" size={24} />
                    Konten Halaman Depan
                </h2>
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                >
                    <Plus size={16} /> Tambah Berita Baru
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {berita.map((item) => (
                    <div key={item.id} className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/30 flex justify-between items-start group">
                        <div className="space-y-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold uppercase">{item.kategori}</span>
                            <h3 className="font-bold text-slate-800 leading-tight">{item.judul}</h3>
                            <p className="text-[10px] text-slate-400">Dibuat: {new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button 
                            onClick={async () => {
                                if(confirm("Hapus berita ini?")) {
                                    await deleteBerita(item.id);
                                    loadBerita();
                                }
                            }}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AccountManager() {
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        role: RoleType.RT as RoleType,
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createVillageAccount(formData);
            alert("Akun berhasil dibuat!");
            setFormData({ email: "", fullName: "", role: RoleType.RT, password: "" });
        } catch (err: unknown) {
            console.error(err);
            alert("Gagal membuat akun.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500" size={24} />
                    Buat Akun Perangkat Desa
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
                        <div className="relative">
                            <UserCircle className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input 
                                required
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                                type="text" placeholder="Contoh: Bpk. Mulyadi" 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400" 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Login</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input 
                                required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                type="email" placeholder="rt01@cimanggu1.desa.id" 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400" 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Jabatan</label>
                            <select 
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value as RoleType})}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value={RoleType.RT}>Ketua RT</option>
                                <option value={RoleType.RW}>Ketua RW</option>
                                <option value={RoleType.KADES}>Kepala Desa</option>
                                <option value={RoleType.SEKDES}>Sekretaris Desa</option>
                                <option value={RoleType.KAUR}>KAUR</option>
                                <option value={RoleType.KASI}>KASI</option>
                                <option value={RoleType.KADUS}>Kepala Dusun</option>
                                <option value={RoleType.BPD}>BPD</option>
                                <option value={RoleType.LPM}>LPM</option>
                                <option value={RoleType.PKK}>PKK</option>
                                <option value={RoleType.POSYANDU}>POSYANDU</option>
                                <option value={RoleType.KARANG_TARUNA}>Karang Taruna</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Kata Sandi</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3 text-slate-400" size={18} />
                                <input 
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    type="password" placeholder="••••••••" 
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400" 
                                />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
                        Daftarkan Perangkat Baru
                    </button>
                </form>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                <h3 className="font-bold mb-4">Informasi Akses</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    Akun yang dibuat akan secara otomatis memiliki akses ke modul verifikasi di wilayahnya masing-masing. Pastikan email yang digunakan unik untuk setiap perangkat desa.
                </p>
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <span className="text-xs font-bold">RT/RW Access</span>
                        <span className="text-[10px] text-emerald-400 font-black uppercase">Active</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <span className="text-xs font-bold">Mobile Compatibility</span>
                        <span className="text-[10px] text-blue-400 font-black uppercase">Optimized</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
            <Icon size={16} />
            {label}
        </button>
    )
}
