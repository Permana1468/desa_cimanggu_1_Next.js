"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Lock, Eye, EyeOff, Loader2, 
  Fingerprint, Phone, Instagram, Facebook, 
  Youtube, UserPlus, LogIn, ShieldCheck, Sparkles, User, KeyRound, X,
  Receipt, Wallet, FileText, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { registerWarga } from "@/actions/auth";
import { LandingThemeProvider } from "@/components/landing/LandingThemeProvider";
import { startAuthentication } from "@simplewebauthn/browser";

// ---- Desktop Character with Ultra-Smooth 60FPS GPU Background Removal (ALDY 4.mp4) ----
function DesktopCharacter({ onVideoProgress }: { onVideoProgress: (currentTime: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      <video
        ref={videoRef}
        src="/images/ALDY 4.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onTimeUpdate={(e) => {
          if (!hasTriggeredRef.current && e.currentTarget.currentTime >= 3.3) {
            hasTriggeredRef.current = true;
            onVideoProgress(e.currentTarget.currentTime);
          }
        }}
        onEnded={(e) => {
          e.currentTarget.pause();
        }}
        style={{ 
          mixBlendMode: 'multiply',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
        className="w-full h-full object-contain filter contrast-[1.05] brightness-100"
      />
    </div>
  );
}

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    // Register specific state
    const [regNik, setRegNik] = useState("");
    const [regFullName, setRegFullName] = useState("");
    const [regPhone, setRegPhone] = useState("");
    const [regPass, setRegPass] = useState("");
    const [regConfirmPass, setRegConfirmPass] = useState("");
    
    // Desktop rocket state
    const [desktopPhase, setDesktopPhase] = useState<'rocket' | 'exploding' | 'form'>('rocket');

    const [heroImages, setHeroImages] = useState<string[]>([
        '/images/slide_1.webp', 
        '/images/slide_6_.png', 
        '/images/sawah.png'
    ]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();
    const [villageLogo, setVillageLogo] = useState("/images/logo-bogor.png");

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
            } catch (err) {}
        };
        fetchSettings();
    }, []);

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

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (heroImages.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(timer);
    }, [heroImages.length]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setSuccess(""); setLoading(true);
        try {
            const res = await signIn("credentials", { identifier, password, redirect: false });
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
        setError(""); setSuccess("");
        if (regPass !== regConfirmPass) { setError("Konfirmasi kata sandi tidak cocok"); return; }
        setLoading(true);
        try {
            const res = await registerWarga({ nik: regNik, fullName: regFullName, phoneNumber: regPhone, password: regPass });
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

    const handleRocketExplode = () => {
        setDesktopPhase('exploding');
        setTimeout(() => setDesktopPhase('form'), 700);
    };

    return (
        <LandingThemeProvider>
            {/* ========== MOBILE LAYOUT (visible only on mobile) ========== */}
            <div className="md:hidden min-h-[100dvh] bg-slate-50 text-slate-900 font-sans relative overflow-hidden">
                <div className="relative z-10 bg-white/95 backdrop-blur-xl w-full h-[100dvh] overflow-hidden flex flex-col">
                    <motion.div
                        initial={false}
                        animate={{ x: 0, scale: 1, borderRadius: "0%", filter: "brightness(1) blur(0px)" }}
                        className="relative top-0 left-0 w-full h-full z-10 bg-[#0e5cad] text-white overflow-hidden shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0e5cad] to-[#0a4686] overflow-hidden pointer-events-none">
                            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-[20%] left-[-10%] w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl"></div>
                            {[...Array(12)].map((_, i) => (
                                <motion.div key={i} className="absolute bg-white/60 rounded-full"
                                    style={{ width: (i % 3 === 0 ? 4 : 2) + 'px', height: (i % 3 === 0 ? 4 : 2) + 'px', top: (10 + (i * 5)) + '%', left: (5 + (i * 8)) + '%' }}
                                    animate={{ y: [0, -40, 0], opacity: [0.1, 0.8, 0.1], scale: [1, 1.5, 1] }}
                                    transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                                />
                            ))}
                            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute top-[25%] left-[20%] text-yellow-300/80"><Sparkles size={16} fill="currentColor" /></motion.div>
                            <motion.div animate={{ rotate: -360, scale: [1, 1.3, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="absolute top-[40%] right-[25%] text-yellow-300/80"><Sparkles size={20} fill="currentColor" /></motion.div>
                        </div>

                        <div className="relative h-full flex flex-col items-center pt-8 sm:pt-12 z-10 w-full">
                            <div className="w-20 h-20 mb-2 relative drop-shadow-[0_5px_15px_rgba(0,0,0,0.2)] shrink-0">
                                <Image src={villageLogo} alt="Logo" fill className="object-contain" priority />
                            </div>
                            <h2 className="text-lg font-black text-white mb-4 tracking-wide drop-shadow-md shrink-0">Hai, Selamat Datang!</h2>
                            <div className="relative w-full h-full max-w-[340px] flex items-center justify-center mt-[-10px] z-0 pointer-events-none">
                                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="absolute top-[2%] left-2 bg-white/95 p-2 rounded-2xl shadow-xl rotate-[-12deg]"><Receipt className="text-blue-500 w-5 h-5" /></motion.div>
                                <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }} className="absolute top-[8%] right-2 bg-white/95 p-2 rounded-2xl shadow-xl rotate-[15deg]"><Wallet className="text-orange-500 w-5 h-5" /></motion.div>
                                <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }} className="absolute top-[35%] left-2 bg-white/95 p-2 rounded-2xl shadow-xl rotate-[8deg]"><FileText className="text-emerald-500 w-5 h-5" /></motion.div>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col pointer-events-auto">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="absolute bottom-[calc(100%-115px)] left-1/2 -translate-x-1/2 w-[170%] max-w-[520px] h-[390px] sm:h-[430px] z-10 flex items-center justify-center pointer-events-none">
                                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="relative w-full h-full">
                                    <Image src="/images/keren 1.png" alt="Ilustrasi" fill className="object-contain object-bottom drop-shadow-2xl" priority />
                                </motion.div>
                            </motion.div>
                            <div className="w-full relative h-14 -mb-[2px] z-20">
                                <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full block" preserveAspectRatio="none">
                                    <path fill="#ffffff" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,197.3C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                                </svg>
                            </div>
                            <div className="bg-white pt-6 px-6 pb-6 relative z-20">
                                <div className="w-full mb-6 relative z-20">
                                    <div className="flex items-center justify-center gap-2 mb-5">
                                        <span className="text-[#0a4686] font-extrabold text-xs tracking-wide">Layanan Cepat</span>
                                        <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">i</div>
                                    </div>
                                    <div className="flex justify-between items-start gap-2 overflow-x-auto pb-2 px-1">
                                        {[
                                            { icon: FileText, label: "Surat", color: "text-blue-600 bg-blue-50 border-blue-100" },
                                            { icon: Users, label: "Warga", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                                            { icon: Receipt, label: "Pajak", color: "text-amber-600 bg-amber-50 border-amber-100" },
                                            { icon: Phone, label: "Lapor", color: "text-rose-600 bg-rose-50 border-rose-100" }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex flex-col items-center gap-2 min-w-[64px] cursor-pointer active:scale-95 transition-transform">
                                                <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center border shadow-sm ${item.color}`}><item.icon size={20} className="stroke-[2.5]" /></div>
                                                <span className="text-[10px] font-bold text-slate-700">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full">
                                    <button onClick={() => setIsMobileSheetOpen(true)} className="flex-1 bg-[#0e5cad] hover:bg-[#0a4686] text-white font-extrabold py-3.5 rounded-2xl text-[14px] shadow-lg shadow-blue-900/20 active:scale-95 transition-all">Login</button>
                                    <button onClick={async () => {
                                        try {
                                            setLoading(true);
                                            const getRes = await fetch("/api/webauthn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate-authentication" }) });
                                            const options = await getRes.json();
                                            if (options.error) throw new Error(options.error);
                                            let asseResp;
                                            try { asseResp = await startAuthentication({ optionsJSON: options } as any); } catch (error: any) { setError("Autentikasi biometrik dibatalkan."); setLoading(false); return; }
                                            const signInRes = await signIn("credentials", { webauthn: JSON.stringify(asseResp), webauthnChallenge: options.challenge, redirect: false });
                                            if (signInRes?.error) { setError(signInRes.error); } else { router.push("/dashboard"); }
                                        } catch (err: any) { setError(err.message || "Gagal memproses biometrik."); } finally { setLoading(false); }
                                    }} disabled={loading} className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-[#0e5cad] shadow-inner active:scale-95 transition-all shrink-0 disabled:opacity-50">
                                        {loading ? <Loader2 size={24} className="animate-spin" /> : <Fingerprint size={28} className="stroke-[2]" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Mobile bottom sheet for login/register */}
                    <div className={`fixed inset-x-0 bottom-0 bg-white rounded-t-[2.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.2)] flex flex-col h-[85dvh] z-50 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMobileSheetOpen ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                        <div className="flex justify-center pt-3 pb-2 w-full absolute top-0 left-0 right-0 z-10" onClick={() => setIsMobileSheetOpen(false)}>
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                        </div>
                        <button onClick={() => setIsMobileSheetOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full z-10"><X size={20} /></button>
                        
                        {/* Tabs */}
                        <div className="flex pt-14 px-6 gap-2 mb-2">
                            <button onClick={() => { setIsLogin(true); setError(""); }} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Masuk</button>
                            <button onClick={() => { setIsLogin(false); setError(""); }} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Daftar</button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.div key="m-login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                        <p className="text-slate-500 text-xs mb-4 mt-2">Selamat datang kembali di portal digital desa.</p>
                                        {error && isLogin && <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 mb-3"><span>⚠️</span><span>{error}</span></div>}
                                        {success && isLogin && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 mb-3"><span>✅</span><span>{success}</span></div>}
                                        <form onSubmit={handleLogin} className="space-y-4">
                                            <div className="relative"><Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} /><input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email atau NIK" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold" required /></div>
                                            <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 pl-12 pr-12 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" size={18} /> : <><KeyRound size={18} /><span>MASUK KE SISTEM</span></>}</button>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div key="m-register" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                                        <p className="text-slate-500 text-xs mb-4 mt-2">Registrasi khusus warga desa menggunakan 16 Digit NIK.</p>
                                        {error && !isLogin && <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 mb-3"><span>❌</span><span>{error}</span></div>}
                                        {success && !isLogin && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 mb-3"><span>✅</span><span>{success}</span></div>}
                                        <form onSubmit={handleRegister} className="space-y-3">
                                            <div className="relative"><Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} /><input type="text" value={regNik} onChange={(e) => setRegNik(e.target.value)} placeholder="16 Digit NIK" className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-3 pl-12 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold" required /></div>
                                            <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} /><input type="text" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} placeholder="Nama Sesuai KTP" className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-3 pl-12 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold" required /></div>
                                            <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} /><input type="text" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="0812..." className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-3 pl-12 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold" required /></div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} placeholder="Password" className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-3 px-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold" required />
                                                <input type="password" value={regConfirmPass} onChange={(e) => setRegConfirmPass(e.target.value)} placeholder="Konfirmasi" className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-3 px-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold" required />
                                            </div>
                                            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" size={18} /> : <><ShieldCheck size={18} /><span>DAFTAR SEKARANG</span></>}</button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>


            {/* ========== DESKTOP LAYOUT (hidden on mobile) ========== */}
            <div className="hidden md:block min-h-[100dvh] font-sans relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #bfdbfe 0%, #e0f2fe 35%, #f0f9ff 65%, #dbeafe 100%)' }}>

                {/* Drifting Animated Sky Clouds */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-200/35 blur-[100px]" />
                    <div className="absolute bottom-[-15%] left-[5%] w-[500px] h-[500px] rounded-full bg-sky-100/60 blur-[80px]" />
                    
                    {/* Multiple Layers of Moving Fluffy Clouds */}
                    {[
                        { top: "2%", scale: 1.4, speed: 52, delay: 0, opacity: 0.85 },
                        { top: "7%", scale: 0.9, speed: 42, delay: -15, opacity: 0.7 },
                        { top: "12%", scale: 1.6, speed: 65, delay: -30, opacity: 0.8 },
                        { top: "18%", scale: 0.8, speed: 36, delay: -10, opacity: 0.65 },
                        { top: "4%", scale: 1.1, speed: 48, delay: -45, opacity: 0.75 },
                        { top: "15%", scale: 1.3, speed: 58, delay: -22, opacity: 0.7 },
                    ].map((cloud, i) => (
                        <motion.div
                            key={`cloud-${i}`}
                            className="absolute flex items-center"
                            style={{ top: cloud.top, opacity: cloud.opacity }}
                            initial={{ x: "-30vw" }}
                            animate={{ x: "115vw" }}
                            transition={{
                                duration: cloud.speed,
                                repeat: Infinity,
                                ease: "linear",
                                delay: cloud.delay,
                            }}
                        >
                            {/* Fluffy SVG-styled Soft Cloud */}
                            <div className="relative filter drop-shadow-md">
                                <div
                                    className="bg-white/80 backdrop-blur-xs rounded-full relative"
                                    style={{ width: `${160 * cloud.scale}px`, height: `${50 * cloud.scale}px` }}
                                >
                                    <div
                                        className="absolute -top-6 left-6 bg-white/85 rounded-full"
                                        style={{ width: `${70 * cloud.scale}px`, height: `${70 * cloud.scale}px` }}
                                    />
                                    <div
                                        className="absolute -top-9 left-16 bg-white/90 rounded-full"
                                        style={{ width: `${85 * cloud.scale}px`, height: `${85 * cloud.scale}px` }}
                                    />
                                    <div
                                        className="absolute -top-5 left-32 bg-white/80 rounded-full"
                                        style={{ width: `${60 * cloud.scale}px`, height: `${60 * cloud.scale}px` }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Top Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                    className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-5"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 relative drop-shadow-md">
                            <Image src={villageLogo} alt="Logo" fill sizes="44px" className="object-contain" />
                        </div>
                        <div>
                            <div className="text-blue-900 font-black text-base leading-tight">Desa Cimanggu I</div>
                            <div className="text-blue-600/65 text-[10px] font-bold tracking-[0.18em] uppercase">Kec. Cibungbulang • Kab. Bogor</div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Layout */}
                <div className="relative w-full h-[100dvh] flex items-center pt-16 overflow-hidden">

                    {/* LEFT / CENTER-LEFT: Character & Bag video (ALDY 4.mp4) */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="relative w-full h-full max-w-[1400px]">
                            <DesktopCharacter onVideoProgress={(currentTime) => {
                                if (currentTime >= 3.3 && desktopPhase !== 'form') {
                                    setDesktopPhase('form');
                                }
                            }} />

                            {/* Volumetric Smoke effect rising directly out of bag */}
                            <AnimatePresence>
                                {desktopPhase === 'form' && (
                                    <div className="absolute bottom-[18%] left-[36%] xl:left-[37%] w-52 h-52 pointer-events-none z-20">
                                        {[...Array(9)].map((_, i) => (
                                            <motion.div
                                                key={`smoke-${i}`}
                                                className="absolute rounded-full bg-gradient-to-t from-white/95 via-sky-100/70 to-transparent blur-md shadow-sm"
                                                style={{
                                                    width: `${45 + i * 14}px`,
                                                    height: `${45 + i * 14}px`,
                                                    left: `${(i % 4) * 10}px`,
                                                    bottom: "10px",
                                                }}
                                                initial={{ opacity: 0, scale: 0.15, y: 0, rotate: 0 }}
                                                animate={{
                                                    opacity: [0, 0.9, 0.5, 0],
                                                    scale: [0.15, 1.4, 2.6],
                                                    y: [-10, -120, -250],
                                                    x: [(i % 2 === 0 ? 1 : -1) * 15, (i % 2 === 0 ? -1 : 1) * 45],
                                                    rotate: [0, (i % 2 === 0 ? 45 : -45)],
                                                }}
                                                transition={{
                                                    duration: 2.4,
                                                    delay: i * 0.14,
                                                    ease: "easeOut",
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>

                            {/* Form emerging directly UPWARDS slow & smooth directly above the bag & close to character */}
                            <AnimatePresence>
                                {desktopPhase === 'form' && (
                                    <motion.div
                                        key="login-form-panel"
                                        initial={{ opacity: 0, y: 180, scale: 0.3, filter: "blur(20px)" }}
                                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                                        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                                        style={{ transformOrigin: "bottom left" }}
                                        className="absolute top-[18%] lg:top-[20%] xl:top-[21%] left-[34%] lg:left-[35%] xl:left-[36%] w-full max-w-[365px] z-30"
                                    >
                                        {/* Title & Subtitle */}
                                        <div className="mb-6">
                                            <h1 className="text-4xl font-black text-blue-950 tracking-tight leading-none mb-2.5">
                                                {isLogin ? "Selamat Datang" : "Buat Akun Baru"}
                                            </h1>
                                            <p className="text-blue-700/60 text-sm font-medium leading-relaxed">
                                                {isLogin
                                                    ? "Silakan masuk untuk mengelola layanan administrasi desa."
                                                    : "Lengkapi data NIK untuk mendaftar layanan warga."}
                                            </p>
                                        </div>

                                        {/* Toggle Tabs */}
                                        <div className="flex gap-6 mb-6 border-b border-blue-200/60 pb-2">
                                            <button
                                                onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
                                                className={`relative text-xs font-black uppercase tracking-widest pb-2 transition-colors ${
                                                    isLogin ? "text-blue-600" : "text-blue-400/60 hover:text-blue-600"
                                                }`}
                                            >
                                                <span>Masuk</span>
                                                {isLogin && (
                                                    <motion.div
                                                        layoutId="activeTabUnderline"
                                                        className="absolute bottom-[-9px] left-0 right-0 h-[3px] bg-blue-600 rounded-full"
                                                    />
                                                )}
                                            </button>

                                            <button
                                                onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
                                                className={`relative text-xs font-black uppercase tracking-widest pb-2 transition-colors ${
                                                    !isLogin ? "text-emerald-600" : "text-blue-400/60 hover:text-emerald-600"
                                                }`}
                                            >
                                                <span>Daftar</span>
                                                {!isLogin && (
                                                    <motion.div
                                                        layoutId="activeTabUnderline"
                                                        className="absolute bottom-[-9px] left-0 right-0 h-[3px] bg-emerald-600 rounded-full"
                                                    />
                                                )}
                                            </button>
                                        </div>

                                        {/* Form Fields (Clean White Pill Inputs like Image 1 & 2) */}
                                        <AnimatePresence mode="wait">
                                            {isLogin ? (
                                                <motion.div
                                                    key="dsk-login"
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -15 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {error && isLogin && (
                                                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 mb-4 backdrop-blur-sm">
                                                            <span>⚠️</span><span>{error}</span>
                                                        </div>
                                                    )}
                                                    {success && isLogin && (
                                                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 mb-4 backdrop-blur-sm">
                                                            <span>✅</span><span>{success}</span>
                                                        </div>
                                                    )}

                                                    <form onSubmit={handleLogin} className="space-y-4">
                                                        <div className="relative group">
                                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-700 transition-colors z-10" />
                                                            <input
                                                                type="text"
                                                                value={identifier}
                                                                onChange={(e) => setIdentifier(e.target.value)}
                                                                placeholder="Email atau NIK"
                                                                style={{ WebkitBoxShadow: "0 0 0px 1000px white inset" }}
                                                                className="w-full bg-white border border-slate-200/90 shadow-md shadow-blue-950/5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all font-semibold"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="relative group">
                                                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-700 transition-colors z-10" />
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                                placeholder="Kata Sandi"
                                                                style={{ WebkitBoxShadow: "0 0 0px 1000px white inset" }}
                                                                className="w-full bg-white border border-slate-200/90 shadow-md shadow-blue-950/5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl pl-11 pr-11 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all font-semibold"
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors z-10"
                                                            >
                                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>

                                                        <div className="flex gap-3 pt-2">
                                                            <button
                                                                type="button"
                                                                title="Login Biometrik"
                                                                disabled={loading}
                                                                onClick={async () => {
                                                                    setLoading(true); setError("");
                                                                    try {
                                                                        const res = await fetch("/api/webauthn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate-authentication" }) });
                                                                        if (!res.ok) throw new Error("Gagal");
                                                                        const opts = await res.json();
                                                                        if (opts.error) throw new Error(opts.error);
                                                                        const asseResp = await startAuthentication({ optionsJSON: opts } as any);
                                                                        const r2 = await signIn("credentials", { webauthn: JSON.stringify(asseResp), webauthnChallenge: opts.challenge, redirect: false });
                                                                        if (r2?.error) setError(r2.error); else window.location.href = "/dashboard";
                                                                    } catch (e: any) { setError(e.message || "Gagal biometrik"); } finally { setLoading(false); }
                                                                }}
                                                                className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 shadow-md text-blue-600 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all shrink-0 active:scale-95 disabled:opacity-40"
                                                            >
                                                                <Fingerprint size={22} />
                                                            </button>

                                                            <button
                                                                type="submit"
                                                                disabled={loading}
                                                                className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                {loading ? <Loader2 size={18} className="animate-spin" /> : <><KeyRound size={18} /><span>MASUK SEKARANG</span></>}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="dsk-register"
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -15 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {error && !isLogin && (
                                                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 mb-4 backdrop-blur-sm">
                                                            <span>❌</span><span>{error}</span>
                                                        </div>
                                                    )}
                                                    {success && !isLogin && (
                                                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 mb-4 backdrop-blur-sm">
                                                            <span>✅</span><span>{success}</span>
                                                        </div>
                                                    )}

                                                    <form onSubmit={handleRegister} className="space-y-3.5">
                                                        <div className="relative group">
                                                            <Fingerprint size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10" />
                                                            <input type="text" value={regNik} onChange={(e) => setRegNik(e.target.value)} placeholder="NIK (16 Digit)" style={{ WebkitBoxShadow: "0 0 0px 1000px white inset" }} className="w-full bg-white border border-slate-200/90 shadow-md focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all font-semibold" required />
                                                        </div>

                                                        <div className="relative group">
                                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10" />
                                                            <input type="text" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} placeholder="Nama Lengkap" style={{ WebkitBoxShadow: "0 0 0px 1000px white inset" }} className="w-full bg-white border border-slate-200/90 shadow-md focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all font-semibold" required />
                                                        </div>

                                                        <div className="relative group">
                                                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10" />
                                                            <input type="text" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="No. WhatsApp" style={{ WebkitBoxShadow: "0 0 0px 1000px white inset" }} className="w-full bg-white border border-slate-200/90 shadow-md focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all font-semibold" required />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="relative group">
                                                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 z-10" />
                                                                <input type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} placeholder="Password" style={{ WebkitBoxShadow: "0 0 0px 1000px white inset" }} className="w-full bg-white border border-slate-200/90 shadow-md focus:border-emerald-500 rounded-2xl pl-9 pr-3 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all font-semibold" required />
                                                            </div>
                                                            <div className="relative group">
                                                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 z-10" />
                                                                <input type="password" value={regConfirmPass} onChange={(e) => setRegConfirmPass(e.target.value)} placeholder="Konfirmasi" style={{ WebkitBoxShadow: "0 0 0px 1000px white inset" }} className="w-full bg-white border border-slate-200/90 shadow-md focus:border-emerald-500 rounded-2xl pl-9 pr-3 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all font-semibold" required />
                                                            </div>
                                                        </div>

                                                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2">
                                                            {loading ? <Loader2 size={18} className="animate-spin" /> : <><ShieldCheck size={18} /><span>DAFTAR SEKARANG</span></>}
                                                        </button>
                                                    </form>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </div>

    {/* Bottom gradient line */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
</div>
        </LandingThemeProvider>
    );
}
