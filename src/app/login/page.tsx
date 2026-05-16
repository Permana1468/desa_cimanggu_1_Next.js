"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Mail, Lock, Eye, EyeOff, Loader2, 
  Fingerprint, Phone, Instagram, Facebook, 
  Youtube, Globe, ArrowRight, UserPlus, LogIn 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { registerWarga } from "@/actions/auth";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [identifier, setIdentifier] = useState("");
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
    const [villageLogo, setVillageLogo] = useState("/images/logo-bogor.png");

    // Fetch settings for hero images
    useEffect(() => {
        async function fetchSettings() {
            try {
                // Use a more direct way to fetch profile for client components
                const response = await fetch('/api/village-profile');
                if (response.ok) {
                    const profile = await response.json();
                    if (profile && profile.gallery && Array.isArray(profile.gallery) && profile.gallery.length > 0) {
                        setHeroImages(profile.gallery);
                    }
                    if (profile && profile.logo) {
                        setVillageLogo(profile.logo);
                    }
                }
            } catch (err) {
            }
        };
        fetchSettings();
    }, []);

    // Carousel Auto-play
    useEffect(() => {
        if (heroImages.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
        }, 6000);
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
            } else if (res?.ok) {
                setSuccess("Masuk berhasil! Mengalihkan...");
                // Force a hard navigation to the unified dashboard
                // The dashboard layout/page will handle role-specific routing
                window.location.href = "/dashboard";
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
                setRegNik(""); setRegPhone(""); setRegPass(""); setRegConfirmPass("");
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem saat registrasi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-sans selection:bg-blue-200">
            {/* MAIN CONTAINER */}
            <div className="relative bg-white w-full max-w-5xl min-h-[600px] md:min-h-[650px] rounded-[2rem] md:rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col md:flex-row">
                
                {/* 1. OVERLAY / CAROUSEL PANEL */}
                <motion.div 
                    initial={false}
                    animate={{ 
                        x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : (isLogin ? 0 : "100%"),
                        y: typeof window !== 'undefined' && window.innerWidth < 768 ? (isLogin ? 0 : 0) : 0, // No Y shift for now
                        borderTopRightRadius: isLogin ? "15% 50%" : "0%",
                        borderBottomRightRadius: isLogin ? "15% 50%" : "0%",
                        borderTopLeftRadius: isLogin ? "0%" : "15% 50%",
                        borderBottomLeftRadius: isLogin ? "0%" : "15% 50%",
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 22 }}
                    className="relative md:absolute top-0 left-0 w-full md:w-1/2 h-[280px] md:h-full z-30 bg-[#1e293b] text-white overflow-hidden shadow-2xl md:rounded-none"
                >
                    {/* Background Carousel */}
                    <div className="absolute inset-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                className="absolute inset-0"
                            >
                                <Image src={heroImages[currentSlide]} alt="Desa" fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/95 via-[#1e293b]/70 to-transparent" />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Branding Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-6 md:p-12 text-center z-10">
                        <div className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 relative">
                            <Image src={villageLogo} alt="Logo" fill className="object-contain" />
                        </div>

                        <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-1">
                            Desa Cimanggu I
                        </h2>
                        <p className="text-blue-200 font-bold tracking-widest uppercase text-[8px] md:text-xs mb-4 md:mb-6">
                            Kec. Cibungbulang • Kab. Bogor
                        </p>
                        
                        <div className="w-12 md:w-16 h-1 bg-yellow-400 rounded-full mb-4 md:mb-8" />

                        <div className="hidden md:block">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isLogin ? 'welcome' : 'join'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="max-w-xs"
                                >
                                    <h3 className="text-lg font-bold mb-3">
                                        {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
                                    </h3>
                                    <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                                        {isLogin ? "Daftar sekarang untuk akses layanan administrasi desa." : "Masuk kembali untuk melanjutkan aktivitas Anda."}
                                    </p>
                                    
                                    <button
                                        onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
                                        className="px-8 py-2.5 border-2 border-white/30 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-[#1e293b] transition-all flex items-center gap-2 mx-auto"
                                    >
                                        {isLogin ? <><UserPlus size={14}/> DAFTAR</> : <><LogIn size={14}/> MASUK</>}
                                    </button>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Social Links (Always visible) */}
                        <div className="absolute bottom-6 md:bottom-10 left-0 w-full flex justify-center gap-4 md:gap-6">
                            <a href="#" className="p-1.5 md:p-2 bg-white/10 rounded-full hover:bg-yellow-400 hover:text-slate-900 transition-all">
                                <Instagram size={16} />
                            </a>
                            <a href="#" className="p-1.5 md:p-2 bg-white/10 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="p-1.5 md:p-2 bg-white/10 rounded-full hover:bg-red-600 hover:text-white transition-all">
                                <Youtube size={16} />
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* 2. FORMS SIDE */}
                <div className="relative flex-1 flex flex-col md:flex-row h-full">
                    
                    {/* REGISTER FORM (Left on Desktop) */}
                    <div className={`w-full md:w-1/2 h-full flex items-center justify-center p-8 md:p-12 transition-all duration-500 ${isLogin && 'hidden md:flex opacity-0 md:opacity-100'}`}>
                        <div className="w-full max-w-sm">
                            <h1 className="text-2xl md:text-4xl font-black text-slate-800 mb-2">Daftar</h1>
                            <p className="text-slate-500 font-medium text-xs md:text-sm mb-6">Registrasi khusus warga menggunakan NIK.</p>

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NIK (KTP)</label>
                                    <input
                                        type="text"
                                        value={regNik}
                                        onChange={(e) => setRegNik(e.target.value)}
                                        placeholder="16 Digit NIK"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 rounded-xl py-3 px-4 text-sm text-slate-700 outline-none transition-all font-semibold shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</label>
                                    <input
                                        type="text"
                                        value={regPhone}
                                        onChange={(e) => setRegPhone(e.target.value)}
                                        placeholder="0812..."
                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 rounded-xl py-3 px-4 text-sm text-slate-700 outline-none transition-all font-semibold shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="password"
                                        value={regPass}
                                        onChange={(e) => setRegPass(e.target.value)}
                                        placeholder="Password"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 rounded-xl py-3 px-4 text-sm text-slate-700 outline-none transition-all font-semibold shadow-sm"
                                        required
                                    />
                                    <input
                                        type="password"
                                        value={regConfirmPass}
                                        onChange={(e) => setRegConfirmPass(e.target.value)}
                                        placeholder="Konfirmasi"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 rounded-xl py-3 px-4 text-sm text-slate-700 outline-none transition-all font-semibold shadow-sm"
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest mt-4">
                                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "DAFTAR SEKARANG"}
                                </button>
                                <button type="button" onClick={() => setIsLogin(true)} className="md:hidden w-full text-[10px] font-bold text-slate-500 mt-4 underline">Sudah punya akun? Masuk</button>
                            </form>
                        </div>
                    </div>

                    {/* LOGIN FORM (Right on Desktop) */}
                    <div className={`w-full md:w-1/2 h-full flex items-center justify-center p-8 md:p-12 transition-all duration-500 ${!isLogin && 'hidden md:flex opacity-0 md:opacity-100'}`}>
                        <div className="w-full max-w-sm">
                            <h1 className="text-2xl md:text-4xl font-black text-slate-800 mb-2">Masuk</h1>
                            <p className="text-slate-500 font-medium text-xs md:text-sm mb-8">Selamat datang kembali di sistem desa.</p>

                            {error && <div className="bg-red-50 text-red-600 text-[10px] font-bold p-3 rounded-xl mb-6">{error}</div>}
                            {success && <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold p-3 rounded-xl mb-6">{success}</div>}

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="Email atau NIK"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none transition-all font-semibold shadow-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-xl py-3.5 pl-12 pr-12 text-sm text-slate-700 outline-none transition-all font-semibold shadow-sm"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest mt-6">
                                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "MASUK"}
                                </button>
                                <button type="button" onClick={() => setIsLogin(false)} className="md:hidden w-full text-[10px] font-bold text-slate-500 mt-4 underline">Belum punya akun? Daftar</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
