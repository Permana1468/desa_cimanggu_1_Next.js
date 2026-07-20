"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User, Loader2, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function SensusLoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                identifier,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Kredensial tidak valid");
                setLoading(false);
            } else if (res?.ok) {
                router.push("/sensus-app");
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-white">
            
            {/* LEFT COLUMN - Animated Brand/Showcase */}
            <div className="relative w-full lg:w-5/12 xl:w-1/2 min-h-[40vh] lg:min-h-screen overflow-hidden bg-[#020817] flex flex-col justify-between p-10 lg:p-16">
                {/* Animated Mesh Gradient Background */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            x: [0, 50, 0],
                            y: [0, 30, 0]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-blue-600/40 rounded-full blur-[120px] mix-blend-screen"
                    ></motion.div>
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.3, 1],
                            x: [0, -60, 0],
                            y: [0, -40, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-indigo-500/30 rounded-full blur-[100px] mix-blend-screen"
                    ></motion.div>
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.1, 1],
                            x: [0, 30, 0],
                            y: [0, -50, 0]
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                        className="absolute top-[20%] left-[20%] w-[80%] h-[80%] bg-cyan-400/20 rounded-full blur-[90px] mix-blend-screen"
                    ></motion.div>
                </div>

                <div className="relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex items-center gap-3"
                    >
                        <div className="relative w-12 h-12">
                            <Image src="/images/LOGO GIS.png" alt="Logo" fill className="object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                        </div>
                        <span className="text-white font-bold text-xl tracking-wide">D-GIS<span className="text-blue-400">.</span></span>
                    </motion.div>
                </div>

                <div className="relative z-10 mt-12 lg:mt-0">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6"
                    >
                        Revolusi <br/>
                        Pemetaan <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">
                            Spasial Desa.
                        </span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-blue-100/80 text-lg max-w-md leading-relaxed"
                    >
                        Platform pintar terintegrasi untuk mendigitalkan, mengelola, dan menganalisis data kependudukan secara *real-time* dan presisi.
                    </motion.p>
                </div>

                <div className="relative z-10 hidden lg:block">
                    <div className="flex items-center gap-3 text-white/50 text-sm">
                        <MapPin size={16} />
                        <span>Sistem Informasi Geografis Desa Cimanggu 1</span>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN - Login Form */}
            <div className="w-full lg:w-7/12 xl:w-1/2 flex items-center justify-center p-8 lg:p-16 relative bg-slate-50/50">
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[440px]"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Selamat Datang Kembali</h2>
                        <p className="text-slate-500">Silakan masukkan detail akun petugas sensus Anda untuk melanjutkan ke ruang kerja.</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-4 rounded-xl mb-6 flex items-center gap-3 shadow-sm"
                        >
                            <ShieldCheck size={20} className="text-rose-500 shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">ID Pengguna / Email</label>
                            <div className="relative group/input">
                                <div className="absolute inset-0 bg-blue-500/0 group-focus-within/input:bg-blue-500/5 rounded-xl transition duration-300"></div>
                                <div className="relative flex items-center">
                                    <User size={18} className="absolute left-4 text-slate-400 group-focus-within/input:text-blue-600 transition-colors z-10" />
                                    <input 
                                        type="text" 
                                        placeholder="petugas@cimanggu.desa.id" 
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-xl py-4 pl-12 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-400 shadow-sm relative z-0"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Kata Sandi</label>
                            <div className="relative group/input">
                                <div className="absolute inset-0 bg-blue-500/0 group-focus-within/input:bg-blue-500/5 rounded-xl transition duration-300"></div>
                                <div className="relative flex items-center">
                                    <Lock size={18} className="absolute left-4 text-slate-400 group-focus-within/input:text-blue-600 transition-colors z-10" />
                                    <input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-xl py-4 pl-12 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-400 shadow-sm relative z-0"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-1">
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">Lupa Kata Sandi?</a>
                            </div>
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            disabled={loading}
                            className="w-full relative mt-6 disabled:opacity-70 group/btn"
                        >
                            <div className="absolute -inset-1 bg-blue-600 rounded-xl blur-md opacity-40 group-hover/btn:opacity-60 transition duration-300 translate-y-1"></div>
                            <div className="relative w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg">
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        Masuk ke Akun
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </motion.button>
                        
                        <div className="relative flex items-center justify-center mt-8">
                            <div className="absolute border-t border-slate-200 w-full"></div>
                            <span className="bg-slate-50 px-4 text-xs font-medium text-slate-400 relative z-10 uppercase tracking-widest">Sistem Internal</span>
                        </div>
                        
                        <div className="text-center mt-6 text-slate-500 text-sm">
                            Bukan petugas terdaftar? <a href="#" className="text-blue-600 font-medium hover:underline">Hubungi Admin Master</a>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
