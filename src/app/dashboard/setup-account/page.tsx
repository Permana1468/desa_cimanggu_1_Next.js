"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Phone, ShieldCheck, Loader2, LogOut } from "lucide-react";
import { setupInstitutionalAccount } from "@/app/actions/auth";
import { signOut } from "next-auth/react";

export default function SetupAccountPage() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Konfirmasi kata sandi tidak cocok");
            return;
        }

        if (newPassword.length < 6) {
            setError("Kata sandi minimal 6 karakter");
            return;
        }

        setLoading(true);
        try {
            const res = await setupInstitutionalAccount({
                phoneNumber,
                newPassword
            });

            if (res.error) {
                setError(res.error);
            } else {
                // Success! Force reload or sign out to refresh session
                // Sign out is safer to ensure all tokens are refreshed
                alert("Akun berhasil dikonfigurasi. Silakan login kembali dengan kata sandi baru Anda.");
                signOut({ callbackUrl: "/login" });
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 md:p-12 w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-2">Aktivasi Akun Pejabat</h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Ini adalah login pertama Anda. Mohon ubah kata sandi dan verifikasi nomor WhatsApp untuk keamanan sistem.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-100 animate-pulse text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor WhatsApp Aktif</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="0812XXXXXXXX"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-amber-500 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi Baru</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min 6 Karakter"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-amber-500 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Kata Sandi</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Ulangi Kata Sandi"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-amber-500 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "AKTIFKAN AKUN"}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => signOut()}
                            className="w-full bg-white text-red-500 border-2 border-red-50 py-4 rounded-2xl text-xs font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut size={16} /> Keluar & Batalkan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
