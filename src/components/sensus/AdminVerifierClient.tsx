"use client";

import { useState, useMemo } from "react";
import { PendingSensusPoint, verifySensusPoint } from "@/actions/sensus";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, User, CheckCircle2, XCircle, Home, Map as MapIcon, Loader2, ArrowRight, Filter } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminVerifierClient({ 
    initialPoints,
    villageStructure 
}: { 
    initialPoints: PendingSensusPoint[];
    villageStructure?: any;
}) {
    const [points, setPoints] = useState<PendingSensusPoint[]>(initialPoints);
    const [selectedPoint, setSelectedPoint] = useState<PendingSensusPoint | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    
    // Filters
    const [filterKadus, setFilterKadus] = useState("");
    const [filterRw, setFilterRw] = useState("");
    const [filterRt, setFilterRt] = useState("");

    // Mapping RW to Kadus based on Village Structure
    const rwToDusunMap = useMemo(() => {
        const map: Record<string, string> = {};
        if (villageStructure?.dusun) {
            villageStructure.dusun.forEach((d: any) => {
                d.rw.forEach((r: any) => {
                    const rwNumMatch = r.name.match(/\d+/);
                    if (rwNumMatch) {
                        const rwStr = String(rwNumMatch[0]).padStart(3, '0');
                        map[rwStr] = d.name;
                    }
                });
            });
        }
        return map;
    }, [villageStructure]);

    const filteredPoints = useMemo(() => {
        return points.filter(p => {
            const pointKadus = rwToDusunMap[p.rw.padStart(3, '0')] || "";
            const matchKadus = filterKadus ? pointKadus === filterKadus : true;
            const matchRw = filterRw ? p.rw === filterRw : true;
            const matchRt = filterRt ? p.rt === filterRt : true;
            return matchKadus && matchRw && matchRt;
        });
    }, [points, filterRw, filterRt, filterKadus, rwToDusunMap]);

    const handleVerify = async (id: string, status: "DISETUJUI" | "DITOLAK") => {
        setIsVerifying(true);
        try {
            await verifySensusPoint(id, status);
            setPoints(points.filter(p => p.id !== id));
            if (selectedPoint?.id === id) {
                setSelectedPoint(null);
            }
            toast.success(status === "DISETUJUI" ? "Data disetujui & tayang di Peta!" : "Data ditolak");
        } catch (error) {
            toast.error("Gagal memverifikasi data");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-950 text-slate-200">
            {/* Left Sidebar: List of Pending Points */}
            <div className="w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10 shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                        <CheckCircle2 className="text-emerald-500" />
                        Ruang Verifikasi
                    </h2>
                    <p className="text-slate-400 text-sm mb-4">
                        Menunggu Tinjauan: <span className="font-bold text-amber-500">{filteredPoints.length} Data</span>
                    </p>
                    
                    {/* Filters */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="relative">
                            <select 
                                value={filterKadus} 
                                onChange={e => setFilterKadus(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white appearance-none outline-none focus:border-blue-500"
                            >
                                <option value="">Semua Dusun</option>
                                {villageStructure?.dusun?.map((d: any) => (
                                    <option key={d.name} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <select 
                                value={filterRw} 
                                onChange={e => { setFilterRw(e.target.value); setFilterRt(""); }}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white appearance-none outline-none focus:border-blue-500"
                            >
                                <option value="">Semua RW</option>
                                {(() => {
                                    let rws: any[] = [];
                                    if (filterKadus) {
                                        const dusun = villageStructure?.dusun?.find((d: any) => d.name === filterKadus);
                                        if (dusun) rws = dusun.rw;
                                    } else {
                                        villageStructure?.dusun?.forEach((d: any) => rws.push(...d.rw));
                                    }
                                    return rws.map((r: any) => {
                                        const rwNumMatch = r.name.match(/\d+/);
                                        const val = rwNumMatch ? String(rwNumMatch[0]).padStart(3, '0') : r.name;
                                        return <option key={val} value={val}>{r.name}</option>;
                                    });
                                })()}
                            </select>
                        </div>
                        <div className="relative">
                            <select 
                                value={filterRt} 
                                onChange={e => setFilterRt(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white appearance-none outline-none focus:border-blue-500"
                            >
                                <option value="">Semua RT</option>
                                {(() => {
                                    let rts: string[] = [];
                                    const allRws: any[] = [];
                                    villageStructure?.dusun?.forEach((d: any) => allRws.push(...d.rw));

                                    if (filterRw) {
                                        const rwObj = allRws.find((r: any) => {
                                            const match = r.name.match(/\d+/);
                                            return match && String(match[0]).padStart(3, '0') === filterRw;
                                        });
                                        if (rwObj) rts = rwObj.rt;
                                    } else {
                                        // If no RW selected, maybe don't show all 32 RTs to avoid confusion, or show them if Kadus is selected
                                        if (filterKadus) {
                                            const dusun = villageStructure?.dusun?.find((d: any) => d.name === filterKadus);
                                            if (dusun) dusun.rw.forEach((r: any) => rts.push(...r.rt));
                                        }
                                    }
                                    return rts.map((rt: string) => {
                                        const rtNumMatch = rt.match(/\d+/);
                                        const val = rtNumMatch ? String(rtNumMatch[0]).padStart(3, '0') : rt;
                                        return <option key={val} value={val}>{rt}</option>;
                                    });
                                })()}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    <AnimatePresence>
                        {filteredPoints.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="text-center p-8 text-slate-500 border border-dashed border-slate-700 rounded-xl mt-4"
                            >
                                <CheckCircle2 size={48} className="mx-auto mb-3 text-slate-700" />
                                <p>Tidak ada data yang sesuai dengan filter.</p>
                            </motion.div>
                        ) : (
                            filteredPoints.map((point) => (
                                <motion.div
                                    key={point.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    onClick={() => setSelectedPoint(point)}
                                    className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                                        selectedPoint?.id === point.id 
                                        ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                                        : "bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300">
                                            {point.type === "RUMAH_WARGA" ? <Home size={12} className="text-blue-400" /> : <MapIcon size={12} className="text-purple-400" />}
                                            {point.type === "RUMAH_WARGA" ? "Rumah Warga" : "Fasum / Fasos"}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {new Date(point.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-white truncate">
                                        {point.type === "RUMAH_WARGA" ? point.name || "Tanpa Nama" : point.categoryFasum || "Tanpa Kategori"}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><MapPin size={12} /> RT {point.rt} / RW {point.rw}</span>
                                        <span className="flex items-center gap-1"><User size={12} /> {point.createdBy?.fullName?.split(" ")[0] || "Petugas"}</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Pane: Map Viewer & Action Panel */}
            <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center">
                {/* Background Map Placeholder (In a real app, integrate Leaflet/Mapbox here) */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                
                {selectedPoint ? (
                    <motion.div 
                        key={selectedPoint.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-800">
                            <h2 className="text-2xl font-bold text-white mb-1">Detail Tinjauan</h2>
                            <p className="text-slate-400 text-sm">Harap periksa validitas data ini sebelum ditayangkan ke publik.</p>
                        </div>
                        
                        <div className="p-6 grid grid-cols-2 gap-6 bg-slate-900/50">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tipe Entri</label>
                                    <p className="text-white font-medium">{selectedPoint.type === "RUMAH_WARGA" ? "Rumah Warga" : "Fasum / Fasos"}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Nama / Keterangan</label>
                                    <p className="text-white font-medium text-lg">{selectedPoint.name || selectedPoint.categoryFasum || "-"}</p>
                                </div>
                                {selectedPoint.type === "RUMAH_WARGA" && (
                                    <>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Status Warga</label>
                                            <p className="text-slate-300">{selectedPoint.statusWarga?.replace("_", " ") || "-"}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Nomor KK Terhubung</label>
                                            <p className="text-slate-300 font-mono">{selectedPoint.noKK || "Belum ditautkan"}</p>
                                        </div>
                                    </>
                                )}
                                {selectedPoint.description && (
                                    <div className="col-span-2">
                                        <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Catatan Lapangan</label>
                                        <p className="text-slate-300 italic">"{selectedPoint.description}"</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-4 border-l border-slate-800 pl-6">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Koordinat GPS</label>
                                    <p className="text-blue-400 font-mono text-sm mt-1 bg-blue-900/20 py-1.5 px-3 rounded-lg border border-blue-900/50 inline-block">
                                        {selectedPoint.latitude.toFixed(6)}, {selectedPoint.longitude.toFixed(6)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Wilayah Administratif</label>
                                    <p className="text-white">RT {selectedPoint.rt} / RW {selectedPoint.rw}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Petugas Pendata</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm">{selectedPoint.createdBy?.fullName || "Petugas Lapangan"}</p>
                                            <p className="text-slate-500 text-xs">{selectedPoint.createdBy?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
                            <button 
                                onClick={() => handleVerify(selectedPoint.id, "DITOLAK")}
                                disabled={isVerifying}
                                className="px-5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors flex items-center gap-2 font-medium border border-transparent hover:border-rose-500/20"
                            >
                                <XCircle size={18} /> Tolak Data
                            </button>
                            <button 
                                onClick={() => handleVerify(selectedPoint.id, "DISETUJUI")}
                                disabled={isVerifying}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2 font-medium"
                            >
                                {isVerifying ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                Setujui & Tayangkan
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center text-slate-500 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                            <ArrowRight size={32} className="text-slate-700" />
                        </div>
                        <p className="text-lg">Pilih salah satu entri di panel kiri</p>
                        <p className="text-sm mt-1 opacity-70">untuk meninjau detail dan mengonfirmasi koordinat GPS.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
