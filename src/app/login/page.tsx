"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, Bell, ChevronRight } from "lucide-react";
import api from "@/services/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [heroImages, setHeroImages] = useState(['/images/slide_1.webp']);
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();

    // Fetch settings for hero images (same as landing page)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Email atau kata sandi salah");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#d1d5db] flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden min-h-[600px]">
                
                {/* LEFT SIDE: CAROUSEL & BRANDING */}
                <div className="md:w-1/2 relative min-h-[300px] md:min-h-full">
                    {/* Carousel Images */}
                    {heroImages.map((img, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                idx === currentSlide ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <img
                                src={img}
                                alt={`Slide ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Dark Overlay */}
                            <div className="absolute inset-0 bg-black/40" />
                        </div>
                    ))}

                    {/* Branding Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
                        <img 
                            src="/images/logo-bogor.png" 
                            alt="Logo Kabupaten Bogor" 
                            className="w-20 h-20 object-contain mb-6 drop-shadow-lg"
                        />
                        <h2 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight max-w-xs drop-shadow-lg">
                            Dinas Pemberdayaan Masyarakat dan Desa
                        </h2>
                        <div className="w-16 h-1.5 bg-yellow-400 my-4 rounded-full" />
                        <p className="text-white font-bold tracking-[0.2em] uppercase text-sm drop-shadow-md">
                            Kabupaten Bogor
                        </p>
                    </div>

                    {/* Slide Indicators */}
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

                {/* RIGHT SIDE: LOGIN FORM */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#f8fafc]">
                    <div className="max-w-sm mx-auto w-full">
                        <div className="mb-8">
                            <h3 className="text-3xl font-black text-slate-800 mb-2">Selamat Datang!</h3>
                            <p className="text-slate-500 font-medium">Silakan masuk untuk melanjutkan.</p>
                        </div>

                        {/* Notification Box */}
                        <div className="bg-[#eff6ff] border border-blue-100 rounded-2xl p-4 flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                    <Bell size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-800">Aktifkan Notifikasi</span>
                                    <span className="text-[10px] text-slate-500">Untuk menerima update disposisi real-time</span>
                                </div>
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                                <ChevronRight size={12} /> Izinkan
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="anda@email.com"
                                        className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-blue-600 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
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

                            {error && (
                                <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-100 animate-pulse">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
