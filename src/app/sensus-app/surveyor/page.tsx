"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Target, Send, ShieldCheck, Home, FileText, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { createSensusPoint } from "@/actions/sensus";

export default function SurveyorPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form states
    const [type, setType] = useState("RUMAH_WARGA");
    const [name, setName] = useState("");
    const [rt, setRt] = useState("001");
    const [rw, setRw] = useState("001");
    
    // Simulate getting GPS coordinates
    const [coords, setCoords] = useState({ lat: -6.9, lng: 107.6 });

    // Simulate GPS jitter for realism
    useEffect(() => {
        if (!isSheetOpen) {
            const interval = setInterval(() => {
                setCoords(prev => ({
                    lat: prev.lat + (Math.random() - 0.5) * 0.00001,
                    lng: prev.lng + (Math.random() - 0.5) * 0.00001
                }));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isSheetOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await createSensusPoint({
                type,
                name: type === "RUMAH_WARGA" ? name : null,
                categoryFasum: type === "FASUM" ? name : null,
                rt,
                rw,
                latitude: coords.lat,
                longitude: coords.lng,
                description: `Sensus ${type} dari GPS Surveyor Mobile`,
                statusWarga: type === "RUMAH_WARGA" ? "WARGA_TETAP" : null
            });
            setIsSuccess(true);
            toast.success("Titik Sensus berhasil dikirim untuk diverifikasi Admin!");
            
            setTimeout(() => {
                setIsSuccess(false);
                setIsSheetOpen(false);
                setName("");
            }, 2500);
        } catch (error) {
            toast.error("Gagal mengirim data");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen w-full bg-slate-900 relative overflow-hidden flex flex-col font-sans">
            {/* Top Bar */}
            <div className="absolute top-0 inset-x-0 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 z-20 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                        <ShieldCheck size={16} />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm tracking-wide leading-tight">D-GIS SURVEYOR</h1>
                        <p className="text-[10px] text-emerald-400 font-mono">● GPS ACTIVE</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-slate-300 text-xs font-semibold">Petugas</p>
                    <p className="text-slate-500 text-[10px]">Sensus App</p>
                </div>
            </div>

            {/* Map Area Placeholder */}
            <div className="flex-1 relative bg-slate-950">
                {/* Tech Map Grid */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]"></div>
                
                {/* Crosshair target in center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-12 h-12 rounded-full border-2 border-blue-500/50 flex items-center justify-center"
                    >
                        <Target size={24} className="text-blue-400" />
                    </motion.div>
                </div>

                {/* Simulated Floating Pins */}
                <div className="absolute top-1/3 left-1/4 opacity-30"><MapPin size={20} className="text-rose-500" /></div>
                <div className="absolute bottom-1/3 right-1/4 opacity-30"><MapPin size={20} className="text-blue-500" /></div>

                {/* Coordinate HUD */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 font-mono text-[10px] text-blue-300 shadow-xl z-10 flex items-center gap-2">
                    <MapPin size={12} />
                    {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </div>
            </div>

            {/* Bottom Action Area */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent pt-12 z-20">
                <button 
                    onClick={() => setIsSheetOpen(true)}
                    className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    <Target size={20} />
                    KUNCI KOORDINAT & INPUT DATA
                </button>
            </div>

            {/* Bottom Sheet Form */}
            <AnimatePresence>
                {isSheetOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-30"
                            onClick={() => setIsSheetOpen(false)}
                        />
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute bottom-0 inset-x-0 bg-slate-900 rounded-t-3xl border-t border-slate-700 shadow-2xl z-40 max-h-[85vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md pb-4 pt-3 px-6 border-b border-slate-800 z-10 flex flex-col items-center">
                                <div className="w-12 h-1.5 bg-slate-700 rounded-full mb-4" />
                                <div className="flex justify-between items-center w-full">
                                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                                        <FileText size={18} className="text-blue-400" />
                                        Formulir Sensus
                                    </h2>
                                    <button onClick={() => setIsSheetOpen(false)} className="text-slate-400 p-2">
                                        <ChevronDown size={20} />
                                    </button>
                                </div>
                            </div>

                            {isSuccess ? (
                                <div className="p-10 flex flex-col items-center justify-center text-center">
                                    <motion.div 
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} 
                                        className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30"
                                    >
                                        <CheckCircle2 size={40} />
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-white mb-2">Data Dikirim!</h3>
                                    <p className="text-slate-400 text-sm">Menunggu verifikasi dari Admin sebelum tayang di D-GIS Center.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-6 space-y-5 pb-8">
                                    {/* Type Toggle */}
                                    <div className="grid grid-cols-2 gap-3 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setType("RUMAH_WARGA")}
                                            className={`py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${type === "RUMAH_WARGA" ? "bg-slate-800 text-white shadow-md" : "text-slate-500"}`}
                                        >
                                            <Home size={16} /> Warga
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType("FASUM")}
                                            className={`py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors ${type === "FASUM" ? "bg-slate-800 text-white shadow-md" : "text-slate-500"}`}
                                        >
                                            <MapPin size={16} /> Fasum
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5 block">
                                            {type === "RUMAH_WARGA" ? "Nama Kepala Keluarga" : "Nama Fasilitas Umum"}
                                        </label>
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            placeholder={type === "RUMAH_WARGA" ? "Contoh: Bpk. Budi Santoso" : "Contoh: Masjid Al-Ikhlas"}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 focus:outline-none placeholder:text-slate-600"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5 block">RT</label>
                                            <select value={rt} onChange={e => setRt(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none appearance-none">
                                                <option value="001">001</option>
                                                <option value="002">002</option>
                                                <option value="003">003</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5 block">RW</label>
                                            <select value={rw} onChange={e => setRw(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none appearance-none">
                                                <option value="001">001</option>
                                                <option value="002">002</option>
                                                <option value="003">003</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5 block">Koordinat Terkunci</label>
                                        <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 text-sm font-mono flex items-center justify-between">
                                            <span>{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</span>
                                            <CheckCircle2 size={16} />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-bold shadow-lg flex items-center justify-center gap-2 mt-4 active:scale-95 transition-transform disabled:opacity-70"
                                    >
                                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                        KIRIM KE ADMIN VERIFIKATOR
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
