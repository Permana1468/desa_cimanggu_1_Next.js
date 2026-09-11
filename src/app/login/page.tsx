"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Lock, Eye, EyeOff, Loader2, 
  Fingerprint, Phone, Instagram, Facebook, 
  Youtube, UserPlus, LogIn, ArrowLeft, ShieldCheck, Sparkles, User, KeyRound, X,
  QrCode, CreditCard, Wallet, Receipt, Users, Building, FileText, Smartphone
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
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
    
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
            <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex items-center justify-center p-0 md:p-6 font-sans relative overflow-hidden selection:bg-emerald-500 selection:text-white">

            {/* MAIN CONTAINER */}
            <div className="relative z-10 bg-white/95 backdrop-blur-xl w-full max-w-4xl h-[100dvh] md:h-auto md:min-h-[620px] rounded-none md:rounded-[2.5rem] border-0 md:border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row">
                
                {/* 1. OVERLAY / CAROUSEL PANEL (Splash Screen on Mobile) */}
                <motion.div 
                    initial={false}
                    animate={{ 
                        x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : (isLogin ? 0 : "100%"),
                        borderTopRightRadius: typeof window !== 'undefined' && window.innerWidth < 768 ? "0%" : (isLogin ? "12% 50%" : "0%"),
                        borderBottomRightRadius: typeof window !== 'undefined' && window.innerWidth < 768 ? "0%" : (isLogin ? "12% 50%" : "0%"),
                        borderTopLeftRadius: typeof window !== 'undefined' && window.innerWidth < 768 ? "0%" : (isLogin ? "0%" : "12% 50%"),
                        borderBottomLeftRadius: typeof window !== 'undefined' && window.innerWidth < 768 ? "0%" : (isLogin ? "0%" : "12% 50%"),
                    }}
                    transition={{ type: "spring", stiffness: 90, damping: 20 }}
                    className="relative md:absolute top-0 left-0 w-full md:w-1/2 h-full z-10 bg-[#0e5cad] md:bg-slate-900 text-white overflow-hidden shadow-2xl"
                >
                    {/* Mobile Only: Solid Blue Top Background */}
                    <div className="md:hidden absolute inset-0 bg-gradient-to-b from-[#0e5cad] to-[#0a4686] overflow-hidden pointer-events-none">
                         {/* Subtle Abstract Wave/Light Shapes */}
                         <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                         <div className="absolute bottom-[20%] left-[-10%] w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl"></div>
                    </div>

                    {/* Background Carousel (Desktop Only) */}
                    <div className="hidden md:block absolute inset-0">
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
                                    className="object-cover opacity-90 transition-transform duration-[12000ms] ease-out scale-105" 
                                />
                                {/* Clean elegant gradient for better readability without looking muddy */}
                                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/50 to-slate-900/90" />
                            </motion.div>
                        </AnimatePresence>
                    </div>


                    {/* Mobile Splash Screen Content (BRImo Style) */}
                    <div className="md:hidden relative h-full flex flex-col items-center pt-16 z-10 w-full">
                        {/* Logo & Greeting */}
                        <div className="w-16 h-16 mb-3 relative drop-shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                            <Image src={villageLogo} alt="Logo" fill className="object-contain" />
                        </div>
                        <h2 className="text-lg font-black text-white mb-8 tracking-wide drop-shadow-md">Hai, Selamat Datang!</h2>

                        {/* Illustration Area */}
                        <div className="relative w-full max-w-[280px] h-48 flex items-center justify-center mt-2">
                             {/* Floating Elements */}
                             <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="absolute top-0 left-2 bg-white/95 p-2.5 rounded-2xl shadow-xl rotate-[-12deg]">
                                 <Receipt className="text-blue-500 w-6 h-6" />
                             </motion.div>
                             <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }} className="absolute bottom-8 left-0 bg-white/95 p-2.5 rounded-2xl shadow-xl rotate-[8deg]">
                                 <FileText className="text-emerald-500 w-6 h-6" />
                             </motion.div>
                             <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }} className="absolute top-4 right-0 bg-white/95 p-2.5 rounded-2xl shadow-xl rotate-[15deg]">
                                 <Wallet className="text-orange-500 w-6 h-6" />
                             </motion.div>
                             
                             {/* Center Graphic */}
                             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="relative w-28 h-40 bg-white rounded-[2rem] border-8 border-[#0a4686] shadow-2xl flex flex-col items-center justify-center overflow-hidden z-10">
                                  <div className="absolute top-2 w-10 h-1 bg-slate-200 rounded-full"></div>
                                  <div className="w-12 h-12 relative mt-2 opacity-90">
                                      <Image src={villageLogo} alt="App" fill className="object-contain grayscale hover:grayscale-0 transition-all" />
                                  </div>
                             </motion.div>
                        </div>
                    </div>

                    {/* Mobile Curved Bottom Section (Fast Menu & Login) */}
                    <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-20 flex flex-col pt-8 px-6 pb-6 shadow-[0_-15px_40px_rgba(0,0,0,0.15)]">
                         {/* Fast Menu */}
                         <div className="w-full mb-6">
                              <div className="flex items-center justify-center gap-2 mb-5">
                                  <span className="text-[#0a4686] font-extrabold text-xs tracking-wide">Layanan Cepat</span>
                                  <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">i</div>
                              </div>
                              <div className="flex justify-between items-start gap-2 overflow-x-auto custom-scrollbar pb-2 px-1">
                                   {[
                                       { icon: FileText, label: "Surat", color: "text-blue-600 bg-blue-50 border-blue-100" },
                                       { icon: Users, label: "Warga", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                                       { icon: Receipt, label: "Pajak", color: "text-amber-600 bg-amber-50 border-amber-100" },
                                       { icon: Phone, label: "Lapor", color: "text-rose-600 bg-rose-50 border-rose-100" }
                                   ].map((item, idx) => (
                                       <div key={idx} className="flex flex-col items-center gap-2 min-w-[64px] cursor-pointer active:scale-95 transition-transform">
                                            <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center border shadow-sm ${item.color}`}>
                                                <item.icon size={20} className="stroke-[2.5]" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-700">{item.label}</span>
                                       </div>
                                   ))}
                              </div>
                         </div>

                         {/* Footer Buttons */}
                         <div className="flex items-center gap-3 w-full">
                             <button 
                                 onClick={() => setIsMobileSheetOpen(true)}
                                 className="flex-1 bg-[#0e5cad] hover:bg-[#0a4686] text-white font-extrabold py-3.5 rounded-2xl text-[14px] shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                             >
                                 Login
                             </button>
                             <button 
                                 onClick={() => alert("Fitur Biometrik akan segera diaktifkan!")}
                                 className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-[#0e5cad] shadow-inner active:scale-95 transition-all shrink-0"
                             >
                                 <Fingerprint size={28} className="stroke-[2]" />
                             </button>
                         </div>
                    </div>


                    {/* Branding & Content (Desktop Only) */}
                    <div className="hidden md:flex relative h-full flex-col items-center justify-center p-6 md:p-12 text-center z-10 mt-[-40px] md:mt-0">
                        {/* Village Logo */}
                        <div className="w-16 h-16 md:w-20 md:h-20 mb-4 relative transition-transform duration-500 hover:scale-110">
                            <Image 
                                src={villageLogo} 
                                alt="Logo" 
                                fill 
                                className="object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.7)]" 
                            />
                        </div>

                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-1 text-white drop-shadow-md">
                            Desa Cimanggu I
                        </h2>
                        <p className="text-emerald-400 font-extrabold tracking-[0.25em] uppercase text-[9px] md:text-xs mb-8 drop-shadow-sm">
                            Kec. Cibungbulang • Kab. Bogor
                        </p>

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
                                    <p className="text-xs text-slate-200 mb-6 leading-relaxed font-light">
                                        {isLogin 
                                            ? "Daftar sekarang menggunakan NIK KTP Anda untuk mengakses seluruh layanan administrasi desa." 
                                            : "Masuk kembali ke akun Anda untuk memonitor data & layanan."
                                        }
                                    </p>
                                    
                                    <button
                                        onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
                                        className="px-8 py-3 bg-white/10 border border-white/30 hover:bg-white/20 rounded-full font-black text-xs uppercase tracking-widest text-white transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg transform hover:-translate-y-0.5"
                                    >
                                        {isLogin ? <><UserPlus size={16} className="text-white"/> BUAT AKUN BARU</> : <><LogIn size={16} className="text-white"/> MASUK AKUN</>}
                                    </button>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Social Links */}
                        <div className="absolute bottom-6 md:bottom-8 left-0 w-full flex justify-center gap-4">
                            <a href="#" className="p-2 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition-all">
                                <Instagram size={16} />
                            </a>
                            <a href="#" className="p-2 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition-all">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="p-2 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition-all">
                                <Youtube size={16} />
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* 2. FORMS SIDE (Bottom Sheet on Mobile, Inline on Desktop) */}
                <div 
                    className={`fixed inset-x-0 bottom-0 md:relative md:inset-auto md:flex-1 bg-white md:bg-transparent rounded-t-[2.5rem] md:rounded-none shadow-[0_-20px_40px_rgba(0,0,0,0.2)] md:shadow-none flex flex-col md:flex-row h-[85dvh] md:h-full z-50 md:z-20 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMobileSheetOpen ? 'translate-y-0' : 'translate-y-[120%] md:translate-y-0'}`}
                >
                    
                    {/* MOBILE SHEET CLOSE HANDLE */}
                    <div className="md:hidden flex justify-center pt-3 pb-2 w-full absolute top-0 left-0 right-0 z-10" onClick={() => setIsMobileSheetOpen(false)}>
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                    </div>
                    <button 
                        onClick={() => setIsMobileSheetOpen(false)}
                        className="md:hidden absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full z-10"
                    >
                        <X size={20} />
                    </button>

                    {/* REGISTER FORM (Left on Desktop) */}
                    <div className={`w-full md:w-1/2 h-full flex items-start md:items-center justify-center pt-12 md:pt-0 p-6 md:p-12 transition-all duration-500 overflow-y-auto md:overflow-visible ${isLogin ? 'hidden md:flex opacity-0 md:opacity-100 pointer-events-none' : ''}`}>
                        <div className="w-full max-w-sm space-y-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                    <UserPlus size={14} /> REGISTRASI WARGA
                                </div>
                                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Daftar Akun</h1>
                                <p className="text-slate-500 text-xs mt-1">Registrasi khusus warga desa menggunakan 16 Digit NIK.</p>
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
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">NIK (KTP)</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                        <input
                                            type="text"
                                            value={regNik}
                                            onChange={(e) => setRegNik(e.target.value)}
                                            placeholder="16 Digit NIK"
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl py-3 pl-12 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                        <input
                                            type="text"
                                            value={regFullName}
                                            onChange={(e) => setRegFullName(e.target.value)}
                                            placeholder="Nama Sesuai KTP"
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl py-3 pl-12 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">No. WhatsApp</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                        <input
                                            type="text"
                                            value={regPhone}
                                            onChange={(e) => setRegPhone(e.target.value)}
                                            placeholder="0812..."
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl py-3 pl-12 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold"
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
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl py-3 px-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={regConfirmPass}
                                            onChange={(e) => setRegConfirmPass(e.target.value)}
                                            placeholder="Konfirmasi"
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl py-3 px-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-widest mt-2 shadow-lg shadow-emerald-600/20 transition-all duration-300 flex items-center justify-center gap-2"
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
                                    className="md:hidden w-full text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-2 text-center block uppercase tracking-wider"
                                >
                                    Sudah Punya Akun? Masuk
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* LOGIN FORM (Right on Desktop) */}
                    <div className={`w-full md:w-1/2 h-full flex items-start md:items-center justify-center pt-12 md:pt-0 p-6 md:p-12 transition-all duration-500 overflow-y-auto md:overflow-visible ${!isLogin ? 'hidden md:flex opacity-0 md:opacity-100 pointer-events-none' : ''}`}>
                        <div className="w-full max-w-sm space-y-5">
                            <div>
                                <div className="inline-flex items-center gap-1.5 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                    <LogIn size={14} /> OTENTIKASI SISTEM
                                </div>
                                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Masuk</h1>
                                <p className="text-slate-500 text-xs mt-1">Selamat datang kembali di portal digital desa.</p>
                            </div>

                            {error && isLogin && (
                                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2.5">
                                    <span>⚠️</span> <span>{error}</span>
                                </div>
                            )}
                            {success && isLogin && (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2.5">
                                    <span>✅</span> <span>{success}</span>
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Identitas Akun</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                                        <input
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="Email atau NIK"
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Kata Sandi</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 pl-12 pr-12 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold"
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
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest mt-4 shadow-lg shadow-blue-600/20 transition-all duration-300 flex items-center justify-center gap-2"
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
                                    className="md:hidden w-full text-xs font-bold text-blue-600 hover:text-blue-700 mt-3 text-center block uppercase tracking-wider"
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
