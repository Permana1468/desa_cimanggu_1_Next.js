"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Lock, Eye, EyeOff, Loader2, 
  Fingerprint, Phone, Instagram, Facebook, 
  Youtube, UserPlus, LogIn, ArrowLeft, ShieldCheck, Sparkles, User, KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { registerWarga } from "@/actions/auth";
import { TechNightCanvas } from "@/components/landing/TechNightCanvas";
import { LandingThemeProvider } from "@/components/landing/LandingThemeProvider";

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
    const [regFullName, setRegFullName] = useState("");
    const [regPhone, setRegPhone] = useState("");
    const [regPass, setRegPass] = useState("");
    const [regConfirmPass, setRegConfirmPass] = useState("");

    const [heroImages, setHeroImages] = useState<string[]>([
        '/images/slide_1.webp', 
        '/images/slide_6_.png', 
        '/images/sawah.png'
    ]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();
    const [villageLogo, setVillageLogo] = useState("/images/logo-bogor.png");

    // Fetch settings for hero images
    useEffect(() => {
        async function fetchSettings() {
            try {
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

    // Detect redirect reason from URL query parameter
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const reason = params.get("reason");
            if (reason === "expired") {
                setError("Sesi Anda telah berakhir demi keamanan. Silakan masuk kembali.");
            } else if (reason === "inactive") {
                setError("Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan masuk kembali.");
            }
        }
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
                setSuccess("Masuk berhasil! Mengalihkan ke dashboard...");
                sessionStorage.setItem("tab_session_active", "true");
                
                if (identifier === "petagis@cimanggu1.desa.id") {
                    window.location.href = "/gis-dashboard";
                } else {
                    window.location.href = "/dashboard";
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
                fullName: regFullName,
                phoneNumber: regPhone,
                password: regPass
            });

            if (res.error) {
                setError(res.error);
            } else {
                setSuccess(`Registrasi Berhasil! Selamat datang. Silakan login.`);
                setIsLogin(true);
                setIdentifier(regNik);
                setRegNik(""); setRegFullName(""); setRegPhone(""); setRegPass(""); setRegConfirmPass("");
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem saat registrasi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LandingThemeProvider>
            <div className="min-h-screen bg-[#050914] text-white flex items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden selection:bg-cyan-500 selection:text-black">
                {/* Back to Home Button */}
                <Link href="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:border-cyan-400/50 shadow-lg group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider">Kembali</span>
                </Link>

                {/* Real-time Dynamic Ambient Cyber Canvas Background */}
            <TechNightCanvas />

            {/* MAIN CYBER GLASS CONTAINER */}
            <div className="relative z-10 bg-slate-900/80 backdrop-blur-2xl w-full max-w-5xl min-h-[620px] md:min-h-[680px] rounded-[2.5rem] border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col md:flex-row">
                
                {/* Top Scanner Beam */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent -translate-x-full animate-laser-scan pointer-events-none z-40"></div>

                {/* 1. OVERLAY / CAROUSEL PANEL */}
                <motion.div 
                    initial={false}
                    animate={{ 
                        x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : (isLogin ? 0 : "100%"),
                        borderTopRightRadius: isLogin ? "12% 50%" : "0%",
                        borderBottomRightRadius: isLogin ? "12% 50%" : "0%",
                        borderTopLeftRadius: isLogin ? "0%" : "12% 50%",
                        borderBottomLeftRadius: isLogin ? "0%" : "12% 50%",
                    }}
                    transition={{ type: "spring", stiffness: 90, damping: 20 }}
                    className="relative md:absolute top-0 left-0 w-full md:w-1/2 h-[300px] md:h-full z-30 bg-slate-950 text-white overflow-hidden border-r border-white/10 md:border-r-0 shadow-2xl"
                >
                    {/* Background Carousel */}
                    <div className="absolute inset-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2 }}
                                className="absolute inset-0"
                            >
                                <Image 
                                    src={heroImages[currentSlide]} 
                                    alt="Desa Cimanggu I" 
                                    fill 
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                    className="object-cover opacity-85 transition-transform duration-[12000ms] ease-out scale-105" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#060a17] via-[#060a17]/55 to-black/30" />
                                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
                            </motion.div>
                        </AnimatePresence>

                        {/* Cyber Overlay Grid */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                    </div>


                    {/* Branding & Telemetry Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-6 md:p-12 text-center z-10">
                        {/* Live Telemetry Tag */}
                        <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-full px-4 py-1.5 text-[10px] text-cyan-300 mb-6 flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="font-mono font-bold tracking-widest uppercase">SDD AUTH PORTAL v2.4</span>
                        </div>

                        {/* Village Logo */}
                        <div className="w-16 h-16 md:w-20 md:h-20 mb-4 relative transition-transform duration-500 hover:scale-110">
                            <Image 
                                src={villageLogo} 
                                alt="Logo" 
                                fill 
                                className="object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.7)]" 
                            />
                        </div>

                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                            Desa Cimanggu I
                        </h2>
                        <p className="text-cyan-400 font-extrabold tracking-[0.25em] uppercase text-[9px] md:text-xs mb-6">
                            Kec. Cibungbulang • Kab. Bogor
                        </p>
                        
                        <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-8 shadow-[0_0_12px_rgba(250,204,21,0.8)]" />

                        <div className="hidden md:block">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isLogin ? 'welcome' : 'join'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="max-w-xs"
                                >
                                    <h3 className="text-xl font-extrabold mb-2 text-white">
                                        {isLogin ? "Belum Punya Akun?" : "Sudah Terdaftar?"}
                                    </h3>
                                    <p className="text-xs text-slate-400 mb-6 leading-relaxed font-light">
                                        {isLogin 
                                            ? "Daftar sekarang menggunakan NIK KTP Anda untuk mengakses seluruh layanan administrasi desa." 
                                            : "Masuk kembali ke akun Anda untuk memonitor data & layanan."
                                        }
                                    </p>
                                    
                                    <button
                                        onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
                                        className="px-8 py-3 bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-300 rounded-full font-black text-xs uppercase tracking-widest text-cyan-300 hover:text-white transition-all duration-300 flex items-center gap-2 mx-auto shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transform hover:-translate-y-0.5"
                                    >
                                        {isLogin ? <><UserPlus size={16} className="text-yellow-400"/> BUAT AKUN BARU</> : <><LogIn size={16} className="text-cyan-400"/> MASUK AKUN</>}
                                    </button>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Social Links */}
                        <div className="absolute bottom-6 md:bottom-8 left-0 w-full flex justify-center gap-4">
                            <a href="#" className="p-2 bg-slate-900/80 border border-white/10 rounded-full text-slate-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all">
                                <Instagram size={16} />
                            </a>
                            <a href="#" className="p-2 bg-slate-900/80 border border-white/10 rounded-full text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-all">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="p-2 bg-slate-900/80 border border-white/10 rounded-full text-slate-400 hover:text-rose-400 hover:border-rose-400/50 transition-all">
                                <Youtube size={16} />
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* 2. FORMS SIDE */}
                <div className="relative flex-1 flex flex-col md:flex-row h-full z-20">
                    
                    {/* REGISTER FORM (Left on Desktop) */}
                    <div className={`w-full md:w-1/2 h-full flex items-center justify-center p-6 md:p-12 transition-all duration-500 ${isLogin && 'hidden md:flex opacity-0 md:opacity-100 pointer-events-none'}`}>
                        <div className="w-full max-w-sm space-y-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                    <UserPlus size={14} /> REGISTRASI WARGA
                                </div>
                                <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">Daftar Akun</h1>
                                <p className="text-slate-400 text-xs mt-1">Registrasi khusus warga desa menggunakan 16 Digit NIK.</p>
                            </div>

                            {error && !isLogin && (
                                <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                                    <span>❌</span> <span>{error}</span>
                                </div>
                            )}
                            {success && !isLogin && (
                                <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <span>✅</span> <span>{success}</span>
                                </div>
                            )}

                            <form onSubmit={handleRegister} className="space-y-3.5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK (KTP)</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                        <input
                                            type="text"
                                            value={regNik}
                                            onChange={(e) => setRegNik(e.target.value)}
                                            placeholder="16 Digit NIK"
                                            className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-400 rounded-2xl py-3 pl-12 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all focus:shadow-[0_0_15px_rgba(16,185,129,0.3)] font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                        <input
                                            type="text"
                                            value={regFullName}
                                            onChange={(e) => setRegFullName(e.target.value)}
                                            placeholder="Nama Sesuai KTP"
                                            className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-400 rounded-2xl py-3 pl-12 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all focus:shadow-[0_0_15px_rgba(16,185,129,0.3)] font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No. WhatsApp</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                        <input
                                            type="text"
                                            value={regPhone}
                                            onChange={(e) => setRegPhone(e.target.value)}
                                            placeholder="0812..."
                                            className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-400 rounded-2xl py-3 pl-12 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all focus:shadow-[0_0_15px_rgba(16,185,129,0.3)] font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={regPass}
                                            onChange={(e) => setRegPass(e.target.value)}
                                            placeholder="Password"
                                            className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-400 rounded-2xl py-3 px-4 text-xs text-white placeholder-slate-500 outline-none transition-all focus:shadow-[0_0_15px_rgba(16,185,129,0.3)] font-semibold"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={regConfirmPass}
                                            onChange={(e) => setRegConfirmPass(e.target.value)}
                                            placeholder="Konfirmasi"
                                            className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-400 rounded-2xl py-3 px-4 text-xs text-white placeholder-slate-500 outline-none transition-all focus:shadow-[0_0_15px_rgba(16,185,129,0.3)] font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-widest mt-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>
                                            <ShieldCheck size={18} />
                                            <span>DAFTAR SEKARANG</span>
                                        </>
                                    )}
                                </button>

                                <button 
                                    type="button" 
                                    onClick={() => setIsLogin(true)} 
                                    className="md:hidden w-full text-xs font-bold text-cyan-400 mt-2 text-center block uppercase tracking-wider"
                                >
                                    Sudah Punya Akun? Masuk
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* LOGIN FORM (Right on Desktop) */}
                    <div className={`w-full md:w-1/2 h-full flex items-center justify-center p-6 md:p-12 transition-all duration-500 ${!isLogin && 'hidden md:flex opacity-0 md:opacity-100 pointer-events-none'}`}>
                        <div className="w-full max-w-sm space-y-5">
                            <div>
                                <div className="inline-flex items-center gap-1.5 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                    <LogIn size={14} /> OTENTIKASI SISTEM
                                </div>
                                <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">Masuk</h1>
                                <p className="text-slate-400 text-xs mt-1">Selamat datang kembali di portal digital desa.</p>
                            </div>

                            {error && isLogin && (
                                <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2.5 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                                    <span>⚠️</span> <span>{error}</span>
                                </div>
                            )}
                            {success && isLogin && (
                                <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2.5 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                    <span>✅</span> <span>{success}</span>
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identitas Akun</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                                        <input
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="Email atau NIK"
                                            className="w-full bg-slate-950/80 border border-white/10 focus:border-cyan-400 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all focus:shadow-[0_0_20px_rgba(6,182,212,0.35)] font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-950/80 border border-white/10 focus:border-cyan-400 rounded-2xl py-3.5 pl-12 pr-12 text-xs text-white placeholder-slate-500 outline-none transition-all focus:shadow-[0_0_20px_rgba(6,182,212,0.35)] font-semibold"
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)} 
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest mt-4 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>
                                            <KeyRound size={18} />
                                            <span>MASUK KE SISTEM</span>
                                        </>
                                    )}
                                </button>

                                <button 
                                    type="button" 
                                    onClick={() => setIsLogin(false)} 
                                    className="md:hidden w-full text-xs font-bold text-yellow-400 mt-3 text-center block uppercase tracking-wider"
                                >
                                    Belum Punya Akun? Daftar Sekarang
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </LandingThemeProvider>
    );
}
