"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
    Users, 
    ShieldCheck, 
    Mail, 
    UserCircle, 
    Lock, 
    Globe, 
    ArrowRight,
    Sparkles
} from "lucide-react";
import { RoleType } from "@prisma/client";
import { createVillageAccount } from "@/actions/village";
import SettingsClient from "@/components/dashboard/settings/SettingsClient";
import { getUserSettings } from "@/actions/settings";

function SettingsContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const tabParam = searchParams ? searchParams.get("tab") : null;
    
    const role = (session?.user as any)?.role;
    const isAdmin = role === "ADMIN_DESA" || role === "ADMIN_MASTER" || role === "KADES";
    
    const [activeTab, setActiveTab] = useState<string>("accounts");

    useEffect(() => {
        if (tabParam) {
            if (tabParam === "profile" || tabParam === "facesecurity" || (isAdmin && tabParam === "accounts")) {
                setActiveTab(tabParam);
                return;
            }
        }
        if (status === "authenticated") {
            if (isAdmin) {
                setActiveTab("accounts");
            } else {
                setActiveTab("profile");
            }
        }
    }, [status, isAdmin, tabParam]);

    if (status === "loading") {
        return (
            <div className="p-12 text-center text-slate-400 font-bold animate-pulse">
                Memuat konfigurasi pengaturan...
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {isAdmin ? "Pengaturan Sistem & Akun" : "Pengaturan Akun"}
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        {isAdmin 
                            ? "Kelola akun kewilayahan RT/RW, profil administrator desa, dan keamanan biometrik wajah." 
                            : "Kelola data profil pribadi, kata sandi, dan autentikasi biometrik wajah Anda."
                        }
                    </p>
                </div>
            </div>

            {/* Centralized CMS Guidance Banner */}
            {isAdmin && (
                <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#1d64ec] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                            <Globe size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-slate-900">Pusat Manajemen Konten Publik (CMS)</h3>
                                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-[#1d64ec] text-[10px] font-black uppercase">
                                    <Sparkles size={11} /> Terpusat
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Semua publikasi berita desa, foto landing page, dan transparansi publik dikelola terpusat di modul CMS.
                            </p>
                        </div>
                    </div>
                    <Link 
                        href="/dashboard/cms"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1d64ec] hover:bg-[#1554c9] text-white text-xs font-black rounded-full shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
                    >
                        Buka CMS Desa <ArrowRight size={14} />
                    </Link>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-[#f4f7fc] border border-slate-200/60 rounded-full w-fit">
                {isAdmin && (
                    <TabButton 
                        active={activeTab === "accounts"} 
                        onClick={() => setActiveTab("accounts")} 
                        icon={Users} 
                        label="Akun RT/RW & Kewilayahan" 
                    />
                )}
                <TabButton 
                    active={activeTab === "profile"} 
                    onClick={() => setActiveTab("profile")} 
                    icon={UserCircle} 
                    label="Profil & Keamanan Akun" 
                />
                <TabButton 
                    active={activeTab === "facesecurity"} 
                    onClick={() => setActiveTab("facesecurity")} 
                    icon={ShieldCheck} 
                    label="Keamanan Biometrik Wajah" 
                />
            </div>

            {/* Tab Contents */}
            <div className="mt-6">
                {activeTab === "accounts" && isAdmin && <AccountManager />}
                {activeTab === "profile" && <UserProfileManager />}
                {activeTab === "facesecurity" && <FaceSecurityManager />}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-slate-400 font-bold animate-pulse">Memuat pengaturan...</div>}>
            <SettingsContent />
        </Suspense>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                active 
                    ? 'bg-[#1d64ec] text-white shadow-md shadow-blue-600/20 font-black' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
            }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );
}

function UserProfileManager() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserSettings().then(res => {
            setUser(res);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400 font-bold bg-white rounded-3xl border border-slate-100 animate-pulse">
                Memuat data profil & integrasi...
            </div>
        );
    }
    if (!user) {
        return (
            <div className="p-8 text-center text-rose-500 font-bold bg-white rounded-3xl border border-rose-100">
                Gagal memuat profil pengguna.
            </div>
        );
    }

    return <SettingsClient user={user} />;
}

function AccountManager() {
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        role: RoleType.RT as RoleType,
        password: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setNotification(null);
        try {
            await createVillageAccount(formData);
            setNotification({
                type: "success",
                message: `Akun perangkat ${formData.fullName} (${formData.email}) berhasil didaftarkan!`
            });
            setFormData({ email: "", fullName: "", role: RoleType.RT, password: "" });
        } catch {
            setNotification({
                type: "error",
                message: "Gagal membuat akun. Pastikan email belum terdaftar di sistem."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-7 sm:p-8 shadow-sm border border-slate-200/60">
                <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <ShieldCheck className="text-blue-600" size={24} />
                    Buat Akun Perangkat Desa
                </h2>

                {notification && (
                    <div className={`p-4 mb-5 rounded-2xl text-xs font-bold border ${
                        notification.type === "success" 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                            : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}>
                        {notification.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                            Nama Lengkap & Gelar
                        </label>
                        <div className="relative">
                            <UserCircle className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input 
                                required
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                                type="text" 
                                placeholder="Contoh: Bpk. Mulyadi (Ketua RT 02)" 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 outline-none" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                            Email Login Resmi
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input 
                                required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                type="email" 
                                placeholder="rt02@cimanggu1.desa.id" 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 outline-none" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                Peran / Wilayah
                            </label>
                            <select 
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value as RoleType})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            >
                                <option value={RoleType.RT}>Ketua RT</option>
                                <option value={RoleType.RW}>Ketua RW</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                Kata Sandi Awal
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3 text-slate-400" size={18} />
                                <input 
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 outline-none" 
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-[#1d64ec] hover:bg-[#1554c9] disabled:bg-slate-400 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] cursor-pointer"
                    >
                        {isSubmitting ? "Mendaftarkan..." : "Daftarkan Akun Perangkat Baru"}
                    </button>
                </form>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-7 sm:p-8 text-white flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h3 className="font-black text-base uppercase tracking-wider text-white">Panduan Hak Akses Kewilayahan</h3>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                        Akun yang didaftarkan akan secara otomatis mendapatkan akses khusus untuk memverifikasi data kependudukan dan surat pengantar warga di lingkup RT/RW bersangkutan.
                    </p>
                    <div className="space-y-3">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-white">Otorisasi RT & RW</p>
                                <p className="text-[10px] text-slate-400">Verifikasi surat & usulan warga</p>
                            </div>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-black uppercase">
                                Aktif
                            </span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-white">Responsif Mobile / Tablet</p>
                                <p className="text-[10px] text-slate-400">Akses mudah dari smartphone</p>
                            </div>
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-black uppercase">
                                Siap Pakai
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-[11px] text-slate-400">
                        Keamanan Akun: Harap sarankan Ketua RT/RW untuk segera mengubah kata sandi default pada menu Profil setelah login pertama kali.
                    </p>
                </div>
            </div>
        </div>
    );
}

function FaceSecurityManager() {
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [statusText, setStatusText] = useState("Memuat model Face API...");
    const [descriptor] = useState<Float32Array | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isRegisteredState, setIsRegisteredState] = useState(false);

    useEffect(() => {
        setIsRegisteredState(typeof window !== 'undefined' && !!localStorage.getItem("imo_registered_face"));

        const loadModels = async () => {
            try {
                setModelsLoaded(true);
                setStatusText("Model siap. Silakan aktifkan kamera.");
            } catch (err) {
                console.error("Gagal memuat model:", err);
                setStatusText("Gagal memuat model Face API.");
            }
        };
        loadModels();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        if (!modelsLoaded) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsCameraActive(true);
                setStatusText("Kamera aktif. Posisikan wajah Anda di tengah...");
            }
        } catch {
            setStatusText("Tidak dapat mengakses kamera. Pastikan izin kamera aktif.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            setIsCameraActive(false);
            setStatusText("Kamera dimatikan.");
        }
    };

    const registerFace = () => {
        if (descriptor) {
            localStorage.setItem("imo_registered_face", JSON.stringify(Array.from(descriptor)));
            setIsRegisteredState(true);
            alert("Wajah berhasil didaftarkan sebagai pemilik sah!");
            stopCamera();
        }
    };

    const clearRegistration = () => {
        localStorage.removeItem("imo_registered_face");
        setIsRegisteredState(false);
        alert("Data wajah berhasil dihapus.");
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-7 sm:p-8 shadow-sm border border-slate-200/60 max-w-2xl">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-2">
                <ShieldCheck className="text-emerald-500" size={24} />
                Verifikasi Keamanan Biometrik Wajah
            </h2>
            <p className="text-slate-500 mb-6 text-xs sm:text-sm leading-relaxed">
                Daftarkan wajah Anda agar asisten cerdas IMO-1 dapat mengenali Anda saat mengakses terminal desa.
            </p>

            <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm flex justify-between items-center">
                    <div>
                        <span className="font-bold text-slate-700">Status Pendaftaran: </span>
                        {isRegisteredState ? (
                            <span className="text-emerald-600 font-black">Terdaftar</span>
                        ) : (
                            <span className="text-rose-500 font-bold">Belum Terdaftar</span>
                        )}
                    </div>
                    {isRegisteredState && (
                        <button 
                            onClick={clearRegistration} 
                            className="text-rose-500 hover:text-rose-600 text-xs font-bold px-3 py-1.5 bg-rose-50 rounded-xl cursor-pointer"
                        >
                            Hapus Data Wajah
                        </button>
                    )}
                </div>

                <div className="relative bg-slate-900 rounded-3xl overflow-hidden aspect-video flex flex-col items-center justify-center">
                    {!isCameraActive ? (
                        <div className="text-center text-slate-400 p-6">
                            <UserCircle size={48} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xs">{statusText}</p>
                            {modelsLoaded && (
                                <button 
                                    onClick={startCamera} 
                                    className="mt-4 px-6 py-2.5 bg-[#1d64ec] hover:bg-[#1554c9] text-white font-bold text-xs rounded-full shadow-lg transition-all cursor-pointer"
                                >
                                    Nyalakan Kamera
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                muted 
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full transform scale-x-[-1]" />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
                                <button 
                                    onClick={stopCamera} 
                                    className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs rounded-full backdrop-blur-md cursor-pointer"
                                >
                                    Batalkan
                                </button>
                                <button 
                                    onClick={registerFace} 
                                    disabled={!descriptor}
                                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:bg-slate-500 text-white font-bold text-xs rounded-full shadow-lg cursor-pointer"
                                >
                                    Daftarkan Wajah Ini
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
