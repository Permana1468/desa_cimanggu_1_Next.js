"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, Bell, ChevronRight, UserPlus, Fingerprint, Phone } from "lucide-react";
import api from "@/services/api";
import { registerWarga } from "@/app/actions/auth";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [identifier, setIdentifier] = useState(""); // Email or NIK
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Register specific state
    const [regNik, setRegNik] = useState("");
    const [regPhone, setRegPhone] = useState("");
    const [regPass, setRegPass] = useState("");
    const [regConfirmPass, setRegConfirmPass] = useState("");

    const [heroImages, setHeroImages] = useState(['/images/slide_1.webp']);
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();

    // Fetch settings for hero images
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/users/api/setting/');
                if (res.data && res.data.length > 0) {
                    const settings = res.data[0];
                    const images = [];
                    if (settings.slide_1) images.push(settings.slide_1);
                    if (settings.slide_2) images.push(settings.slide_2);
                    if (settings.slide_3) images.push(settings.slide_3);
                    if (images.length > 0) setHeroImages(images);
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            }
        };
        fetchSettings();
    }, []);

    // Carousel Auto-play
    useEffect(() => {
        if (heroImages.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [heroImages.length]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                identifier,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError(res.error === "CredentialsSignin" ? "Email/NIK atau kata sandi salah" : res.error);
            } else {
                const sessionResponse = await fetch('/api/auth/session');
                const session = await sessionResponse.json();
                
                if (session?.user?.role === "ADMIN_MASTER") {
                    router.push("/master-admin");
                } else {
                    router.push("/dashboard");
                }
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        if (regPass !== regConfirmPass) {
            setError("Konfirmasi kata sandi tidak cocok");
            return;
        }

        setLoading(true);
        try {
            const res = await registerWarga({
                nik: regNik,
                phoneNumber: regPhone,
                password: regPass
            });

            if (res.error) {
                setError(res.error);
            } else {
                setSuccess(`Registrasi Berhasil! Selamat datang, ${res.name}. Silakan login.`);
                setIsLogin(true);
                setIdentifier(regNik);
                // Clear reg fields
                setRegNik(""); setRegPhone(""); setRegPass(""); setRegConfirmPass("");
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem saat registrasi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#d1d5db] flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden min-h-[600px] transition-all duration-500">
                
                {/* LEFT SIDE: CAROUSEL & BRANDING */}
                <div className="md:w-1/2 relative min-h-[300px] md:min-h-full">
                    {heroImages.map((img, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                idx === currentSlide ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40" />
                        </div>
                    ))}

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
                        <img src="/images/logo-bogor.png" alt="Logo" className="w-20 h-20 object-contain mb-6 drop-shadow-2xl" />
                        <h2 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight max-w-xs drop-shadow-2xl">
                            Desa Cimanggu I
                            <span className="block text-lg md:text-xl mt-1 opacity-90 font-bold">Kecamatan Cibungbulang</span>
                        </h2>
                        <div className="w-16 h-1 bg-yellow-400 my-4 rounded-full" />
                        <p className="text-white font-bold tracking-[0.3em] uppercase text-xs drop-shadow-md">Kabupaten Bogor</p>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {heroImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === currentSlide ? "w-8 bg-yellow-400" : "w-2 bg-white/50"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE: AUTH FORM */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#f8fafc]">
                    <div className="max-w-sm mx-auto w-full">
                        
                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
                            <button 
                                onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                Masuk
                            </button>
                            <button 
                                onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                Daftar Warga
                            </button>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-3xl font-black text-slate-800 mb-2">
                                {isLogin ? "Selamat Datang!" : "Registrasi Mandiri"}
                            </h3>
                            <p className="text-slate-500 font-medium text-sm">
                                {isLogin ? "Silakan masuk untuk mengakses layanan desa." : "Khusus warga Desa Cimanggu I menggunakan NIK."}
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-100 mb-6 animate-pulse">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-emerald-50 text-emerald-600 text-xs font-bold p-4 rounded-xl border border-emerald-100 mb-6">
                                {success}
                            </div>
                        )}

                        {isLogin ? (
                            /* LOGIN FORM */
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email atau NIK</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="Masukkan Email/NIK"
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-blue-600 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-slate-700 focus:outline-none focus:border-blue-600 transition-all font-medium"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 mt-8"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "SIGN IN"}
                                </button>
                            </form>
                        ) : (
                            /* REGISTER FORM */
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Induk Kependudukan (NIK)</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={regNik}
                                            onChange={(e) => setRegNik(e.target.value)}
                                            placeholder="16 Digit NIK KTP"
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-emerald-600 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={regPhone}
                                            onChange={(e) => setRegPhone(e.target.value)}
                                            placeholder="Contoh: 08123456789"
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-emerald-600 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Buat Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            value={regPass}
                                            onChange={(e) => setRegPass(e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-emerald-600 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            value={regConfirmPass}
                                            onChange={(e) => setRegConfirmPass(e.target.value)}
                                            placeholder="Ulangi password"
                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-emerald-600 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 active:scale-95 disabled:opacity-50 mt-6"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "DAFTAR SEKARANG"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
