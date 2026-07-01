"use client";

import { useState } from "react";
import { Settings, Lock, Shield, Key } from "lucide-react";

export default function ResidentSettings() {
    const [loading, setLoading] = useState(false);
    
    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate password change API call
        setTimeout(() => {
            alert("Kata sandi berhasil diperbarui.");
            setLoading(false);
            (e.target as HTMLFormElement).reset();
        }, 1000);
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pengaturan Akun</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Kelola keamanan akun dan preferensi Portal Warga Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* SETTINGS MENU (Sidebar-like) */}
                <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-blue-50 text-blue-600 font-bold border border-blue-100 transition-all">
                        <Lock size={18} /> Keamanan Akun
                    </button>
                    <button className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium transition-all">
                        <Shield size={18} /> Privasi
                    </button>
                </div>

                {/* SETTINGS CONTENT */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-200/60">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                            <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center">
                                <Key size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Ubah Kata Sandi</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pastikan menggunakan sandi yang kuat</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Kata Sandi Lama
                                </label>
                                <input 
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-900"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Kata Sandi Baru
                                </label>
                                <input 
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-900"
                                    placeholder="Minimal 8 karakter"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Konfirmasi Kata Sandi Baru
                                </label>
                                <input 
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-900"
                                    placeholder="Ulangi kata sandi baru"
                                />
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
