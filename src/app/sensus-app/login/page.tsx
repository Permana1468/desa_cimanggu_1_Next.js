"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
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
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Map Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#475569 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm z-10"
            >
                {/* Logo & Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-2">
                        <Image 
                            src="/images/LOGO GIS.png" 
                            alt="D-GIS Logo" 
                            fill 
                            className="object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">SENSUS APP</h1>
                    <p className="text-slate-400 text-sm mt-1">Portal Pendataan & Pemetaan Spasial</p>
                </div>

                {/* Login Form */}
                <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl shadow-2xl">
                    <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-emerald-400" />
                        Otentikasi Petugas
                    </h2>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="NIK atau Email Petugas" 
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="password" 
                                    placeholder="Kata Sandi" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : (
                                <>Masuk Sistem <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-6 text-slate-500 text-xs">
                    &copy; 2026 Desa Digital - D-GIS Center
                </div>
            </motion.div>
        </div>
    );
}
