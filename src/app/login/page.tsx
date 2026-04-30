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
            <div className="bg-white rounded-[1.5rem] shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden min-h-[500px] transition-all duration-500">
                
                {/* LEFT SIDE: CAROUSEL & BRANDING */}
                <div className="md:w-[45%] relative min-h-[250px] md:min-h-full">
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

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                        <img src="/images/logo-bogor.png" alt="Logo" className="w-16 h-16 object-contain mb-4 drop-shadow-2xl" />
                        <h2 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight leading-tight max-w-xs drop-shadow-2xl">
                            Desa Cimanggu I
                            <span className="block text-base md:text-lg mt-1 opacity-90 font-bold">Kecamatan Cibungbulang</span>
                        </h2>
                        <div className="w-12 h-1 bg-yellow-400 my-3 rounded-full" />
                        <p className="text-white font-bold tracking-[0.2em] uppercase text-[10px] drop-shadow-md">Kabupaten Bogor</p>
                    </div>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {heroImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-1 rounded-full transition-all duration-300 ${
                                    idx === currentSlide ? "w-6 bg-yellow-400" : "w-1.5 bg-white/50"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE: AUTH FORM */}
                <div className="md:w-[55%] p-6 md:p-8 flex flex-col justify-center bg-[#f8fafc]">
                    <div className="max-w-sm mx-auto w-full">
                        
                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                            <button 
                                onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
                                className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                Masuk
                            </button>
                            <button 
                                onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
                                className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                Daftar Warga
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-2xl font-black text-slate-800 mb-1">
                                {isLogin ? "Selamat Datang!" : "Registrasi Mandiri"}
                            </h3>
                            <p className="text-slate-500 font-medium text-xs">
                                {isLogin ? "Silakan masuk untuk mengakses layanan desa." : "Khusus warga Desa Cimanggu I menggunakan NIK."}
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-[10px] font-bold p-3 rounded-xl border border-red-100 mb-4 animate-pulse">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold p-3 rounded-xl border border-emerald-100 mb-4">
                                {success}
                            </div>
                        )}

                        {isLogin ? (
                            /* LOGIN FORM */
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email atau NIK</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="Masukkan Email/NIK"
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:border-blue-600 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-700 focus:outline-none focus:border-blue-600 transition-all font-medium"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95 disabled:opacity-50 mt-4 text-xs"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : "SIGN IN"}
                                </button>
                            </form>
                        ) : (
                            /* REGISTER FORM */
                            <form onSubmit={handleRegister} className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK (KTP)</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            value={regNik}
                                            onChange={(e) => setRegNik(e.target.value)}
                                            placeholder="16 Digit NIK"
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:border-emerald-600 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            value={regPhone}
                                            onChange={(e) => setRegPhone(e.target.value)}
                                            placeholder="Contoh: 0812..."
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:border-emerald-600 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={regPass}
                                                onChange={(e) => setRegPass(e.target.value)}
                                                placeholder="Min 6"
                                                className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 px-3 text-sm text-slate-700 focus:outline-none focus:border-emerald-600 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={regConfirmPass}
                                                onChange={(e) => setRegConfirmPass(e.target.value)}
                                                placeholder="Ulangi"
                                                className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 px-3 text-sm text-slate-700 focus:outline-none focus:border-emerald-600 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50 mt-4 text-xs"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : "DAFTAR SEKARANG"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
