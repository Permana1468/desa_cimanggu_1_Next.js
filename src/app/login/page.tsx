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

const RocketIllustration = () => (
    <svg width="80" height="120" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10C50 10 20 40 20 90C20 90 30 110 50 110C70 110 80 90 80 90C80 40 50 10 50 10Z" fill="#e2e8f0"/>
        <path d="M50 10C50 10 80 40 80 90C80 90 70 110 50 110V10Z" fill="#cbd5e1"/>
        <circle cx="50" cy="65" r="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="4"/>
        <path d="M20 90L10 110H30L20 90Z" fill="#0ea5e9"/>
        <path d="M80 90L90 110H70L80 90Z" fill="#0284c7"/>
        <path d="M40 110L50 130L60 110H40Z" fill="#f59e0b"/>
        <path d="M45 110L50 120L55 110H45Z" fill="#fef08a"/>
    </svg>
);

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

                        <div className="relative h-full flex flex-col items-center pt-16 z-10 w-full">
                            <div className="w-24 h-24 mb-3 relative drop-shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                                <Image src={villageLogo} alt="Logo" fill className="object-contain" />
                            </div>
                            <h2 className="text-xl font-black text-white mb-8 tracking-wide drop-shadow-md">Hai, Selamat Datang!</h2>
                            <div className="relative w-full h-full max-w-[340px] flex items-center justify-center mt-[-20px] z-0 pointer-events-none">
                                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="absolute top-[5%] left-0 bg-white/95 p-2.5 rounded-2xl shadow-xl rotate-[-12deg]"><Receipt className="text-blue-500 w-6 h-6" /></motion.div>
                                <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }} className="absolute top-[15%] right-2 bg-white/95 p-2.5 rounded-2xl shadow-xl rotate-[15deg]"><Wallet className="text-orange-500 w-6 h-6" /></motion.div>
                                <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }} className="absolute top-[45%] left-2 bg-white/95 p-2.5 rounded-2xl shadow-xl rotate-[8deg]"><FileText className="text-emerald-500 w-6 h-6" /></motion.div>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col pointer-events-auto">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="absolute bottom-[calc(100%-60px)] left-1/2 -translate-x-1/2 w-[180%] max-w-[560px] h-[480px] z-10 flex items-center justify-center pointer-events-none">
                                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="relative w-full h-full">
                                    <Image src="/images/keren 1.png" alt="Ilustrasi" fill className="object-contain object-bottom drop-shadow-2xl" priority />
                                </motion.div>
                            </motion.div>
                            <div className="w-full relative h-16 -mb-[2px] z-20">
                                <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full block" preserveAspectRatio="none">
                                    <path fill="#ffffff" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,197.3C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                                </svg>
                            </div>
                            <div className="bg-white pt-8 px-6 pb-6 relative z-20">
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


            {/* ========== DESKTOP LAYOUT (Fullscreen Curved Circle Sliding Overlay) ========== */}
            <div className="hidden md:block relative w-full h-[100dvh] overflow-hidden bg-[#09121f] text-white font-sans">
                
                {/* Background Image & Atmosphere Layer */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/slide_1.png"
                        alt="Atmosphere"
                        fill
                        className="object-cover scale-105"
                    />
                    {/* Subtle dark overlay just enough to keep white text readable */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-slate-900/20 to-slate-900/50" />
                </div>

                {/* Top Branding Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute top-0 left-0 right-0 z-40 flex items-center justify-end px-12 py-6"
                >
                    {/* Minimal Active Indicator Badge */}
                    <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center bg-white/10 border border-white/15 w-8 h-8 rounded-full backdrop-blur-md shadow-lg" title="Sistem Aktif">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></span>
                        </span>
                    </div>
                </motion.div>

                {/* GIANT SLIDING CURVED CIRCLE OVERLAY */}
                <motion.div
                    className="absolute rounded-full z-20 pointer-events-none"
                    style={{ 
                        width: '200vw', 
                        height: '200vw', 
                        top: '-120vw',
                    }}
                    initial={false}
                    animate={{
                        left: isLogin ? "-135vw" : "35vw"
                    }}
                    transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
                >
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-white/10 via-cyan-500/5 to-transparent backdrop-blur-[20px] shadow-[0_0_80px_rgba(0,0,0,0.5),inset_0_0_80px_rgba(255,255,255,0.05)] border border-white/20 relative overflow-hidden pointer-events-auto">
                        <div className="absolute top-[65%] left-[65%] w-[800px] h-[800px] rounded-full bg-cyan-400/20 blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-[25%] right-[65%] w-[700px] h-[700px] rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />
                    </div>
                </motion.div>

                {/* CONTENT LAYER */}
                <div className="relative w-full h-full flex z-30">
                    
                    {/* --- LEFT SECTION --- */}
                    <div className="w-1/2 h-full flex flex-col justify-center items-center px-12 lg:px-20 py-16 relative">
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.div
                                    key="welcome-signup-panel"
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="flex flex-col items-center text-center max-w-md text-white z-30"
                                >
                                    <h2 className="text-4xl font-black mb-4 tracking-tight drop-shadow-lg">New here ?</h2>
                                    <p className="text-xs lg:text-sm text-cyan-50/90 leading-relaxed mb-8 font-medium">
                                        Selamat datang! Buat akun baru atau beralih ke halaman registrasi warga desa.
                                    </p>
                                    <button
                                        onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
                                        className="px-10 py-3 rounded-full border-2 border-white/90 text-white font-extrabold text-xs uppercase tracking-widest hover:bg-white hover:text-blue-900 shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] active:scale-95 transition-all"
                                    >
                                        SIGN UP
                                    </button>
                                    <div className="mt-12 opacity-90 drop-shadow-2xl animate-pulse">
                                        <RocketIllustration />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="desktop-signup-form"
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="w-full max-w-sm mx-auto z-30"
                                >
                                    {/* Logo Section acting as Title */}
                                    <div className="flex items-center gap-3.5 mb-4">
                                        <div className="w-12 h-12 relative drop-shadow-[0_0_15px_rgba(0,180,255,0.5)]">
                                            <Image src={villageLogo} alt="Logo" fill sizes="48px" className="object-contain" />
                                        </div>
                                        <div>
                                            <div className="text-white font-black text-xl leading-tight tracking-wide drop-shadow-md">Desa Cimanggu I</div>
                                            <div className="text-cyan-400 text-[10px] font-bold tracking-[0.2em] uppercase mt-0.5">Kec. Cibungbulang • Kab. Bogor</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                                        Registrasi khusus warga desa menggunakan 16 Digit NIK KTP.
                                    </p>

                                    {error && !isLogin && (
                                        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold p-3 rounded-2xl flex items-center gap-2 mb-4 backdrop-blur-md">
                                            <span>❌</span><span>{error}</span>
                                        </div>
                                    )}
                                    {success && !isLogin && (
                                        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold p-3 rounded-2xl flex items-center gap-2 mb-4 backdrop-blur-md">
                                            <span>✅</span><span>{success}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleRegister} className="space-y-3.5">
                                        <div className="relative">
                                            <Fingerprint size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
                                            <input type="text" value={regNik} onChange={(e) => setRegNik(e.target.value)} placeholder="16 Digit NIK KTP" className="w-full bg-white/90 border border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 rounded-full py-3.5 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold shadow-md" required />
                                        </div>
                                        <div className="relative">
                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
                                            <input type="text" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} placeholder="Nama Lengkap Sesuai KTP" className="w-full bg-white/90 border border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 rounded-full py-3.5 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold shadow-md" required />
                                        </div>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
                                            <input type="text" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="0812..." className="w-full bg-white/90 border border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 rounded-full py-3.5 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold shadow-md" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                                                <input type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} placeholder="Kata Sandi" className="w-full bg-white/90 border border-slate-200 focus:border-cyan-500 rounded-full py-3 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold shadow-md" required />
                                            </div>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                                                <input type="password" value={regConfirmPass} onChange={(e) => setRegConfirmPass(e.target.value)} placeholder="Konfirmasi" className="w-full bg-white/90 border border-slate-200 focus:border-cyan-500 rounded-full py-3 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold shadow-md" required />
                                            </div>
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-full text-xs uppercase tracking-widest shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2">
                                            {loading ? <Loader2 size={18} className="animate-spin" /> : <><ShieldCheck size={18} /><span>DAFTAR SEKARANG</span></>}
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* --- RIGHT SECTION --- */}
                    <div className="w-1/2 h-full flex flex-col justify-center items-center px-12 lg:px-20 py-16 relative">
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.div
                                    key="desktop-signin-form"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="w-full max-w-sm mx-auto z-30"
                                >
                                    {/* Logo Section acting as Title */}
                                    <div className="flex items-center gap-3.5 mb-4">
                                        <div className="w-12 h-12 relative drop-shadow-[0_0_15px_rgba(0,180,255,0.5)]">
                                            <Image src={villageLogo} alt="Logo" fill sizes="48px" className="object-contain" />
                                        </div>
                                        <div>
                                            <div className="text-white font-black text-xl leading-tight tracking-wide drop-shadow-md">Desa Cimanggu I</div>
                                            <div className="text-cyan-400 text-[10px] font-bold tracking-[0.2em] uppercase mt-0.5">Kec. Cibungbulang • Kab. Bogor</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                                        Silakan masuk untuk mengelola layanan administrasi desa.
                                    </p>

                                    {error && isLogin && (
                                        <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold p-3 rounded-2xl flex items-center gap-2 mb-4 backdrop-blur-md">
                                            <span>⚠️</span><span>{error}</span>
                                        </div>
                                    )}
                                    {success && isLogin && (
                                        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold p-3 rounded-2xl flex items-center gap-2 mb-4 backdrop-blur-md">
                                            <span>✅</span><span>{success}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="relative">
                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email atau NIK" className="w-full bg-white/90 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-full py-3.5 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold shadow-md" required />
                                        </div>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kata Sandi" className="w-full bg-white/90 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-full py-3.5 pl-11 pr-11 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-semibold shadow-md" required />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 pt-1 pb-2">
                                            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                                                <input type="checkbox" className="w-3.5 h-3.5 rounded-sm bg-white/10 border-slate-400/30 text-blue-500 focus:ring-blue-500/30" />
                                                <span>Ingat Saya</span>
                                            </label>
                                            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Lupa kata sandi?</a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button type="button" onClick={async () => {
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
                                            }} className="w-12 h-12 rounded-full bg-white/90 border border-slate-200 text-blue-600 flex items-center justify-center hover:bg-blue-50 shadow-md transition-all shrink-0 active:scale-95 disabled:opacity-40" title="Login dengan Passkey / Fingerprint">
                                                <Fingerprint size={22} />
                                            </button>
                                            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-full text-xs uppercase tracking-widest shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                                                {loading ? <Loader2 size={18} className="animate-spin" /> : <><KeyRound size={18} /><span>LOGIN</span></>}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-6 text-center">
                                        <p className="text-[11px] text-slate-300 uppercase tracking-widest font-semibold mb-3">Or Sign up with social platforms</p>
                                        <div className="flex items-center justify-center gap-3">
                                            <a href="#" title="Facebook" className="w-9 h-9 rounded-full border border-white/30 bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all">
                                                <Facebook size={16} />
                                            </a>
                                            <a href="#" title="Instagram" className="w-9 h-9 rounded-full border border-white/30 bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-pink-600 transition-all">
                                                <Instagram size={16} />
                                            </a>
                                            <a href="#" title="Youtube" className="w-9 h-9 rounded-full border border-white/30 bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-all">
                                                <Youtube size={16} />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="welcome-signin-panel"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="flex flex-col items-center text-center max-w-md text-white z-30"
                                >
                                    <h2 className="text-4xl font-black mb-4 tracking-tight drop-shadow-lg">Welcome back</h2>
                                    <p className="text-xs lg:text-sm text-cyan-50/90 leading-relaxed mb-8 font-medium">
                                        Sudah memiliki akun? Silakan masuk dengan email dan kata sandi Anda yang telah terdaftar.
                                    </p>
                                    <button
                                        onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
                                        className="px-10 py-3 rounded-full border-2 border-white/90 text-white font-extrabold text-xs uppercase tracking-widest hover:bg-white hover:text-blue-900 shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] active:scale-95 transition-all"
                                    >
                                        SIGN IN
                                    </button>
                                    <div className="mt-12 opacity-90 drop-shadow-2xl animate-pulse">
                                        <RocketIllustration />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </LandingThemeProvider>
    );
}
