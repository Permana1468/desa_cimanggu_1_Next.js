"use client";

import React, { useState } from "react";
import { UserCircle, Phone, Image as ImageIcon, CheckCircle, Search, ShieldCheck, Lock, Check } from "lucide-react";
import { updateProfile, linkResidentData, changePassword } from "@/actions/settings";
import Image from "next/image";

export default function SettingsClient({ user }: { user: any }) {
    const [activeSection, setActiveSection] = useState<"profil" | "kependudukan" | "keamanan">("profil");

    // Profile State
    const [phone, setPhone] = useState(user.phoneNumber || "");
    const [photoUrl, setPhotoUrl] = useState(user.photo || "");
    const [savingProfile, setSavingProfile] = useState(false);

    // Kependudukan State
    const [nik, setNik] = useState("");
    const [linking, setLinking] = useState(false);

    // Keamanan State
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran file terlalu besar. Maksimal 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        const res = await updateProfile({ phoneNumber: phone, photo: photoUrl });
        if (res.success) {
            alert("Profil berhasil diperbarui!");
        } else {
            alert("Gagal memperbarui profil: " + res.error);
        }
        setSavingProfile(false);
    };

    const handleLinkNik = async (e: React.FormEvent) => {
        e.preventDefault();
        setLinking(true);
        const res = await linkResidentData(nik);
        if (res.success) {
            alert(`Berhasil terhubung dengan data: ${res.resident?.namaLengkap}`);
            window.location.reload(); // reload to reflect changes
        } else {
            alert("Gagal menghubungkan NIK: " + res.error);
        }
        setLinking(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Konfirmasi password tidak cocok!");
            return;
        }
        setChangingPassword(true);
        const res = await changePassword(oldPassword, newPassword);
        if (res.success) {
            alert("Password berhasil diubah!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } else {
            alert("Gagal mengubah password: " + res.error);
        }
        setChangingPassword(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-2">
                <button 
                    onClick={() => setActiveSection("profil")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeSection === "profil" ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                    <UserCircle size={18} /> Profil Akun
                </button>
                <button 
                    onClick={() => setActiveSection("kependudukan")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeSection === "kependudukan" ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                    <ShieldCheck size={18} /> Data Kependudukan
                </button>
                <button 
                    onClick={() => setActiveSection("keamanan")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeSection === "keamanan" ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                    <Lock size={18} /> Keamanan & Password
                </button>
            </div>

            <div className="md:col-span-3">
                {activeSection === "profil" && (
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <UserCircle className="text-emerald-500" /> Profil Akun Anda
                        </h2>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex flex-col items-center gap-4 shrink-0">
                                <div className="w-32 h-32 rounded-full border-4 border-slate-100 bg-slate-50 overflow-hidden relative flex items-center justify-center text-slate-300">
                                    {photoUrl ? (
                                        <Image src={photoUrl} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <UserCircle size={64} />
                                    )}
                                </div>
                                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                                    <ImageIcon size={14} /> Pilih Foto
                                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
                                </label>
                                <p className="text-[10px] text-slate-400 font-medium max-w-[120px] text-center">JPG/PNG maksimal 2MB.</p>
                            </div>

                            <div className="flex-1 space-y-5">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Pengguna</label>
                                    <div className="mt-1 relative">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={user.fullName} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700"
                                        />
                                        {user.residentId && (
                                            <div className="absolute right-3 top-3 text-emerald-500" title="Tervalidasi Data Kependudukan">
                                                <CheckCircle size={18} />
                                            </div>
                                        )}
                                    </div>
                                    {!user.residentId && (
                                        <p className="text-xs text-amber-600 font-semibold mt-2">
                                            ⚠️ Nama Anda belum terhubung dengan Data Kependudukan. Hubungkan NIK Anda di menu Data Kependudukan.
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Role Akun</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={user.role?.replace("_", " ")} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nomor Handphone / WA</label>
                                    <div className="relative mt-1">
                                        <Phone className="absolute left-4 top-3.5 text-slate-400" size={16} />
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="Contoh: 08123456789"
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-sm font-bold text-slate-900 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleSaveProfile}
                                    disabled={savingProfile}
                                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                >
                                    {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === "kependudukan" && (
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <ShieldCheck className="text-blue-500" /> Integrasi Data Kependudukan
                        </h2>
                        
                        {user.residentId ? (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                                    <Check size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-emerald-800 text-lg mb-1">Akun Tervalidasi Kependudukan</h3>
                                    <p className="text-emerald-700 text-sm mb-4">Akun Anda telah dihubungkan dengan database kependudukan resmi desa.</p>
                                    
                                    <div className="space-y-2 text-sm font-semibold text-emerald-900">
                                        <div className="flex justify-between border-b border-emerald-200/50 pb-2">
                                            <span className="text-emerald-600">NIK</span>
                                            <span>{user.resident?.nik}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-emerald-200/50 pb-2">
                                            <span className="text-emerald-600">Nama Resmi</span>
                                            <span>{user.resident?.namaLengkap}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-emerald-200/50 pb-2">
                                            <span className="text-emerald-600">RT/RW</span>
                                            <span>RT {user.resident?.rt} / RW {user.resident?.rw}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-slate-500 text-sm font-medium mb-6">
                                    Untuk memastikan validitas data perangkat dan warga, harap hubungkan akun Anda dengan database kependudukan menggunakan NIK Anda yang terdaftar di Desa.
                                </p>
                                <form onSubmit={handleLinkNik} className="space-y-5">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nomor Induk Kependudukan (NIK)</label>
                                        <div className="relative mt-1">
                                            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
                                            <input 
                                                required
                                                type="text" 
                                                value={nik}
                                                onChange={e => setNik(e.target.value)}
                                                placeholder="Masukkan 16 digit NIK Anda..."
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm font-bold text-slate-900 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={linking || !nik}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                    >
                                        {linking ? "Mencari & Menghubungkan..." : "Validasi & Hubungkan NIK"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {activeSection === "keamanan" && (
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Lock className="text-rose-500" /> Ganti Kata Sandi
                        </h2>

                        <form onSubmit={handleChangePassword} className="space-y-5">
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Password Saat Ini</label>
                                <input 
                                    required
                                    type="password" 
                                    value={oldPassword}
                                    onChange={e => setOldPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl text-sm font-bold text-slate-900 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Password Baru</label>
                                <input 
                                    required
                                    type="password" 
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Minimal 8 karakter"
                                    minLength={8}
                                    className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl text-sm font-bold text-slate-900 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Konfirmasi Password Baru</label>
                                <input 
                                    required
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi password baru"
                                    minLength={8}
                                    className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl text-sm font-bold text-slate-900 transition-all outline-none"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword}
                                className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                            >
                                {changingPassword ? "Menyimpan..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
