"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    HeartPulse, Users, Baby, Sparkles, RefreshCw, ShieldCheck,
    Search, Filter, Activity, Scale, Ruler, Stethoscope, AlertTriangle,
    CheckCircle2, BarChart3, MapPin
} from "lucide-react";
import { getWilayahPosyanduRecap } from "@/actions/wilayahTerpadu";

export function RwHealthTab({ session }: { session: any }) {
    const role = String((session?.user as any)?.role || "RW").toUpperCase();
    const rwNo = String((session?.user as any)?.rw || "009").replace(/\D/g, "").padStart(3, "0");
    const rtNo = String((session?.user as any)?.rt || "001").replace(/\D/g, "").padStart(3, "0");
    const [recap, setRecap] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<"balita" | "ibu_hamil" | "lansia" | "rt_rekap">("balita");
    const [selectedRw, setSelectedRw] = useState<string>("ALL");
    const [selectedRt, setSelectedRt] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [lastSync, setLastSync] = useState<string>("-");

    const loadData = useCallback(async (showSpinner = false) => {
        if (showSpinner) setLoading(true);
        try {
            const data = await getWilayahPosyanduRecap();
            if (data) {
                setRecap(data);
                setLastSync(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
            }
        } catch (err) {
            console.error("Failed to load Wilayah Posyandu Recap:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(true);

        const handleRefresh = () => {
            if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
            loadData(false);
        };

        window.addEventListener("refresh-notifications", handleRefresh);
        window.addEventListener("focus", handleRefresh);

        let bc: BroadcastChannel | null = null;
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
                bc = new BroadcastChannel("desa_cimanggu_realtime_sync");
                bc.onmessage = (ev) => {
                    if (
                        ev.data?.type === "SYNC_EVENT" ||
                        ev.data?.type === "POSYANDU_UPDATED" ||
                        ev.data?.type === "WARGA_UPDATED" ||
                        ev.data?.type === "MUTASI_UPDATED"
                    ) {
                        loadData(false);
                    }
                };
            } catch {}
        }

        const interval = setInterval(handleRefresh, 30000);

        return () => {
            window.removeEventListener("refresh-notifications", handleRefresh);
            window.removeEventListener("focus", handleRefresh);
            if (bc) bc.close();
            clearInterval(interval);
        };
    }, [loadData]);

    const summary = recap?.summary || {
        totalWarga: 0,
        totalKK: 0,
        sasaranBalita: 0,
        balitaTerdaftarPosyandu: 0,
        balitaDitimbang: 0,
        balitaStunting: 0,
        giziNormal: 0,
        giziKurang: 0,
        giziLebih: 0,
        ibuHamilTerdaftar: 0,
        ibuHamilRisti: 0,
        sasaranLansia: 0,
        lansiaTerdaftarPosyandu: 0
    };

    const rwList: string[] = useMemo(() => {
        if (!recap?.rwBreakdown) return [];
        return recap.rwBreakdown.map((r: any) => r.rw);
    }, [recap]);

    const rtList: string[] = useMemo(() => {
        if (!recap?.rtBreakdown) return [];
        return recap.rtBreakdown
            .filter((r: any) => selectedRw === "ALL" || r.rw === selectedRw)
            .map((r: any) => `${r.rw}-${r.rt}`);
    }, [recap, selectedRw]);

    const filteredBalita = useMemo(() => {
        const list = recap?.balitaDetails || [];
        return list.filter((b: any) => {
            if (selectedRw !== "ALL" && b.rw !== selectedRw) return false;
            if (selectedRt !== "ALL" && `${b.rw}-${b.rt}` !== selectedRt) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                    (b.namaLengkap || "").toLowerCase().includes(q) ||
                    (b.nik || "").includes(q) ||
                    (b.namaOrangTua || "").toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [recap, selectedRw, selectedRt, searchQuery]);

    const filteredIbuHamil = useMemo(() => {
        const list = recap?.ibuHamilDetails || [];
        return list.filter((ih: any) => {
            if (selectedRw !== "ALL" && ih.rw !== selectedRw) return false;
            if (selectedRt !== "ALL" && `${ih.rw}-${ih.rt}` !== selectedRt) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (ih.namaLengkap || "").toLowerCase().includes(q) || (ih.nik || "").includes(q);
            }
            return true;
        });
    }, [recap, selectedRw, selectedRt, searchQuery]);

    const filteredLansia = useMemo(() => {
        const list = recap?.lansiaDetails || [];
        return list.filter((l: any) => {
            if (selectedRw !== "ALL" && l.rw !== selectedRw) return false;
            if (selectedRt !== "ALL" && `${l.rw}-${l.rt}` !== selectedRt) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (l.namaLengkap || "").toLowerCase().includes(q) || (l.nik || "").includes(q);
            }
            return true;
        });
    }, [recap, selectedRw, selectedRt, searchQuery]);

    const balitaCakupanPct = summary.sasaranBalita > 0
        ? Math.min(100, Math.round((summary.balitaTerdaftarPosyandu / summary.sasaranBalita) * 100))
        : 0;

    const lansiaCakupanPct = summary.sasaranLansia > 0
        ? Math.min(100, Math.round((summary.lansiaTerdaftarPosyandu / summary.sasaranLansia) * 100))
        : 0;

    const maxRtBarVal = useMemo(() => {
        if (!recap?.rtBreakdown?.length) return 3;
        return Math.max(
            3,
            ...recap.rtBreakdown.map((r: any) => Math.max(r.balitaPosyandu || 0, r.ibuHamil || 0, r.lansiaPosyandu || 0))
        );
    }, [recap]);

    return (
        <div className="space-y-6">
            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700 rounded-[2.5rem] p-7 md:p-8 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[70px] -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-rose-100 text-[11px] font-bold backdrop-blur-md mb-3 border border-white/20">
                            <Sparkles size={13} className="text-amber-300" />
                            <span>Rekapitulasi Real-Time • {(recap?.posyanduUnits || []).join(", ") || `Posyandu Wilayah RW ${rwNo}`}</span>
                            <span className="bg-emerald-400/20 text-emerald-100 px-2 py-0.5 rounded-full text-[10px] border border-emerald-300/30">
                                Live Sync: {lastSync}
                            </span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black mb-2 flex items-center gap-3">
                            <HeartPulse className="shrink-0" /> Rekap Posyandu & Kesehatan {recap?.scopeLabel || (role === "RT" ? `RT ${rtNo} / RW ${rwNo}` : `RW ${rwNo}`)}
                        </h2>
                        <p className="text-rose-100 max-w-2xl text-xs sm:text-sm leading-relaxed">
                            Pemantauan otomatis hasil inputan Kader Posyandu (penimbangan balita, tinggi badan, status gizi, ibu hamil, dan posbindu lansia) khusus cakupan wilayah Anda.
                        </p>
                    </div>

                    <button
                        onClick={() => loadData(true)}
                        className="self-start md:self-center flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer text-xs font-bold"
                        title="Segarkan Data Posyandu"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                        <span>Sinkronkan</span>
                    </button>
                </div>
            </div>

            {/* 4 KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">Balita Posyandu</span>
                        <Baby size={18} className="text-blue-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">{summary.balitaTerdaftarPosyandu}</span>
                        <span className="text-xs font-bold text-slate-400">/ {summary.sasaranBalita} Sasaran</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Ditimbang: {summary.balitaDitimbang} anak</span>
                        <span className="text-blue-600">{balitaCakupanPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${balitaCakupanPct}%` }} />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">Gizi & Stunting</span>
                        <AlertTriangle size={18} className="text-rose-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-rose-600">{summary.balitaStunting}</span>
                        <span className="text-xs font-bold text-slate-400">Balita Stunting</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> Normal: {summary.giziNormal}</span>
                        <span className="text-amber-600">Kurang: {summary.giziKurang}</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">Ibu Hamil</span>
                        <HeartPulse size={18} className="text-pink-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">{summary.ibuHamilTerdaftar}</span>
                        <span className="text-xs font-bold text-slate-400">Dipantau</span>
                    </div>
                    <div className="mt-2 text-[11px] font-bold text-slate-500">
                        Risiko Tinggi (Risti): <span className={summary.ibuHamilRisti > 0 ? "text-rose-600 font-black" : "text-emerald-600"}>{summary.ibuHamilRisti} Ibu</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">Posbindu Lansia</span>
                        <Users size={18} className="text-amber-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">{summary.lansiaTerdaftarPosyandu}</span>
                        <span className="text-xs font-bold text-slate-400">/ {summary.sasaranLansia} Sasaran</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Total Warga: {summary.totalWarga}</span>
                        <span className="text-amber-600">{lansiaCakupanPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${lansiaCakupanPct}%` }} />
                    </div>
                </div>
            </div>

            {/* VISUAL CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* GRAFIK 1: STATUS KESEHATAN BALITA & SASARAN */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <BarChart3 size={16} className="text-rose-600" /> Grafik Status Gizi & Partisipasi Posyandu
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Perbandingan sasaran kependudukan vs hasil inputan Posyandu RW {rwNo}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: "Balita Sasaran (Data Kependudukan 0-5 Thn)", val: summary.sasaranBalita, max: Math.max(summary.sasaranBalita, summary.balitaTerdaftarPosyandu, 1), color: "bg-slate-400" },
                            { label: "Balita Terdaftar & Ikut Posyandu", val: summary.balitaTerdaftarPosyandu, max: Math.max(summary.sasaranBalita, summary.balitaTerdaftarPosyandu, 1), color: "bg-blue-600" },
                            { label: "Balita Gizi Normal", val: summary.giziNormal, max: Math.max(summary.balitaTerdaftarPosyandu, 1), color: "bg-emerald-500" },
                            { label: "Balita Gizi Kurang / Stunting", val: summary.giziKurang, max: Math.max(summary.balitaTerdaftarPosyandu, 1), color: "bg-rose-500" },
                            { label: "Ibu Hamil Dipantau", val: summary.ibuHamilTerdaftar, max: Math.max(summary.ibuHamilTerdaftar, 10), color: "bg-pink-500" },
                            { label: "Lansia Terlayani Posbindu", val: summary.lansiaTerdaftarPosyandu, max: Math.max(summary.sasaranLansia, summary.lansiaTerdaftarPosyandu, 1), color: "bg-amber-500" }
                        ].map((bar, idx) => {
                            const pct = Math.min(100, Math.round((bar.val / (bar.max || 1)) * 100));
                            return (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                        <span>{bar.label}</span>
                                        <span className="font-black text-slate-900">{bar.val} Jiwa</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${bar.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* GRAFIK 2: DISTRIBUSI PER RT DI WILAYAH RW */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <MapPin size={16} className="text-blue-600" /> Grafik Kesehatan per RT (Wilayah RW {rwNo})
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Sebaran Balita Posyandu, Ibu Hamil, dan Lansia di tiap RT</p>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span>Balita</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-pink-500 inline-block"></span>Bumil</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>Lansia</span>
                        </div>
                    </div>

                    {(!recap?.rtBreakdown || recap.rtBreakdown.length === 0) ? (
                        <div className="py-12 text-center text-slate-400 text-xs">Belum ada data RT terdeteksi.</div>
                    ) : (
                        <div className="flex items-end gap-3 h-52 pt-4 pb-2 overflow-x-auto px-1">
                            {recap.rtBreakdown.map((r: any) => {
                                const hBalita = Math.max(4, Math.round((r.balitaPosyandu / maxRtBarVal) * 100));
                                const hBumil = Math.max(4, Math.round((r.ibuHamil / maxRtBarVal) * 100));
                                const hLansia = Math.max(4, Math.round((r.lansiaPosyandu / maxRtBarVal) * 100));
                                return (
                                    <div key={r.key || r.rt} className="flex-1 min-w-[60px] flex flex-col items-center gap-2 h-full justify-end">
                                        <div className="flex items-end gap-1 h-40 w-full justify-center">
                                            <div
                                                className="w-3 bg-blue-500 rounded-t-md transition-all duration-500 relative group"
                                                style={{ height: `${hBalita}%` }}
                                                title={`RT ${r.rt} / RW ${r.rw} - Balita Posyandu: ${r.balitaPosyandu}`}
                                            >
                                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-black text-blue-700">{r.balitaPosyandu}</span>
                                            </div>
                                            <div
                                                className="w-3 bg-pink-500 rounded-t-md transition-all duration-500 relative"
                                                style={{ height: `${hBumil}%` }}
                                                title={`RT ${r.rt} / RW ${r.rw} - Ibu Hamil: ${r.ibuHamil}`}
                                            >
                                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-black text-pink-700">{r.ibuHamil}</span>
                                            </div>
                                            <div
                                                className="w-3 bg-amber-500 rounded-t-md transition-all duration-500 relative"
                                                style={{ height: `${hLansia}%` }}
                                                title={`RT ${r.rt} / RW ${r.rw} - Lansia Posyandu: ${r.lansiaPosyandu}`}
                                            >
                                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-black text-amber-700">{r.lansiaPosyandu}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                                            {role === "KADUS" ? `RT ${r.rt}/RW ${r.rw}` : `RT ${r.rt}`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* RINCIAN HASIL INPUTAN POSYANDU (READ-ONLY REKAPITULASI) */}
            <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs overflow-hidden">
                {/* SUB-TABS & FILTERS */}
                <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: "balita", label: `Rincian Balita (${filteredBalita.length})`, icon: Baby },
                            { id: "ibu_hamil", label: `Ibu Hamil (${filteredIbuHamil.length})`, icon: HeartPulse },
                            { id: "lansia", label: `Lansia (${filteredLansia.length})`, icon: Users },
                            { id: "rt_rekap", label: "Rekapan per RT", icon: ShieldCheck }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSubTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeSubTab === tab.id
                                        ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                <tab.icon size={14} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {activeSubTab !== "rt_rekap" && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            {rwList.length > 1 && (
                                <div className="relative">
                                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select
                                        value={selectedRw}
                                        onChange={(e) => { setSelectedRw(e.target.value); setSelectedRt("ALL"); }}
                                        className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-rose-500"
                                    >
                                        <option value="ALL">Semua RW Cakupan</option>
                                        {rwList.map(rw => (
                                            <option key={rw} value={rw}>RW {rw}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {rtList.length > 1 && (
                                <div className="relative">
                                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select
                                        value={selectedRt}
                                        onChange={(e) => setSelectedRt(e.target.value)}
                                        className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-rose-500"
                                    >
                                        <option value="ALL">Semua RT</option>
                                        {rtList.map(key => {
                                            const [rRw, rRt] = key.split("-");
                                            return <option key={key} value={key}>RT {rRt}{rwList.length > 1 ? ` (RW ${rRw})` : ""}</option>;
                                        })}
                                    </select>
                                </div>
                            )}
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari nama / NIK..."
                                    className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-rose-500 w-full sm:w-52"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTENT TABLE AREA */}
                <div className="overflow-x-auto">
                    {loading && !recap ? (
                        <div className="p-16 text-center text-slate-400 text-xs font-semibold">
                            Memuat sinkronisasi data Posyandu wilayah RW {rwNo}...
                        </div>
                    ) : activeSubTab === "balita" ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="px-4 py-3.5">Nama Balita & NIK</th>
                                    <th className="px-4 py-3.5">Wilayah</th>
                                    <th className="px-4 py-3.5">Umur / Orang Tua</th>
                                    <th className="px-4 py-3.5">Berat Badan</th>
                                    <th className="px-4 py-3.5">Tinggi / Lingkar Kep.</th>
                                    <th className="px-4 py-3.5">Status Gizi</th>
                                    <th className="px-4 py-3.5">Keterangan & Tgl Timbang</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredBalita.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                            Belum ada data balita yang diinput oleh kader Posyandu di wilayah RW {rwNo}{selectedRt !== "ALL" ? ` RT ${selectedRt}` : ""}.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBalita.map((b: any) => (
                                        <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-slate-900">{b.namaLengkap}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{b.nik}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                                                    RT {b.rt} / RW {b.rw}
                                                </span>
                                                <div className="text-[10px] text-rose-600 font-semibold mt-0.5">{b.posyanduName}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-slate-700">{b.usiaBulan} Bulan ({b.jenisKelamin})</div>
                                                <div className="text-[11px] text-slate-400">Ortu: {b.namaOrangTua || "-"}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {b.latestRecord?.beratBadan ? (
                                                    <span className="inline-flex items-center gap-1 font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                                                        <Scale size={12} /> {b.latestRecord.beratBadan} kg
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Belum ditimbang</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {b.latestRecord?.tinggiBadan ? (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                                                            <Ruler size={12} className="text-emerald-600" /> {b.latestRecord.tinggiBadan} cm
                                                        </span>
                                                        {b.latestRecord?.lingkarKepala && (
                                                            <div className="text-[10px] text-slate-500">LK: {b.latestRecord.lingkarKepala} cm</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-block px-2.5 py-1 rounded-lg font-black text-[10px] ${
                                                    b.statusStunting || b.latestRecord?.statusGizi === "Stunting"
                                                        ? "bg-rose-100 text-rose-700"
                                                        : b.latestRecord?.statusGizi === "Gizi Kurang"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-emerald-100 text-emerald-700"
                                                }`}>
                                                    {b.statusStunting ? "STUNTING" : (b.latestRecord?.statusGizi || "Normal")}
                                                </span>
                                                {b.latestRecord?.imunisasi && (
                                                    <div className="text-[10px] text-indigo-600 font-semibold mt-1">
                                                        {b.latestRecord.imunisasi}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 max-w-[220px]">
                                                <div className="text-slate-700 font-medium line-clamp-2">{b.latestRecord?.keterangan || "-"}</div>
                                                {b.latestRecord?.tanggal && (
                                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                                        {new Date(b.latestRecord.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : activeSubTab === "ibu_hamil" ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="px-4 py-3.5">Nama Ibu Hamil & NIK</th>
                                    <th className="px-4 py-3.5">Wilayah</th>
                                    <th className="px-4 py-3.5">Usia Kandungan</th>
                                    <th className="px-4 py-3.5">Tensi / BB / LILA</th>
                                    <th className="px-4 py-3.5">Status Risiko</th>
                                    <th className="px-4 py-3.5">Keterangan Kader</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredIbuHamil.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                            Belum ada data ibu hamil di wilayah RW {rwNo}.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredIbuHamil.map((ih: any) => (
                                        <tr key={ih.id} className="hover:bg-slate-50/60">
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-slate-900">{ih.namaLengkap}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{ih.nik}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">RT {ih.rt} / RW {ih.rw}</span>
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-slate-700">{ih.usiaKandungan} Bulan</td>
                                            <td className="px-4 py-3.5">
                                                {ih.latestRecord ? (
                                                    <div className="space-y-0.5 text-[11px]">
                                                        <span className="font-bold text-slate-800 block">Tensi: {ih.latestRecord.tensiDarah || "-"}</span>
                                                        <span className="text-slate-500">BB: {ih.latestRecord.beratBadan || "-"} kg</span>
                                                    </div>
                                                ) : (ih.beratBadanAwal ? <span className="text-slate-500 text-[11px]">BB Awal: {ih.beratBadanAwal} kg</span> : "-")}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] ${ih.risikoTinggi ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                                                    {ih.risikoTinggi ? "RISIKO TINGGI" : "Normal"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-600">{ih.latestRecord?.keterangan || "-"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : activeSubTab === "lansia" ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="px-4 py-3.5">Nama Lansia & NIK</th>
                                    <th className="px-4 py-3.5">Wilayah</th>
                                    <th className="px-4 py-3.5">Usia</th>
                                    <th className="px-4 py-3.5">Hasil Cek (Tensi / Gula / BB)</th>
                                    <th className="px-4 py-3.5">Penyakit Bawaan</th>
                                    <th className="px-4 py-3.5">Keterangan Kader</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredLansia.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                            Belum ada data lansia Posbindu di wilayah RW {rwNo}.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLansia.map((l: any) => (
                                        <tr key={l.id} className="hover:bg-slate-50/60">
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-slate-900">{l.namaLengkap}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{l.nik}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">RT {l.rt} / RW {l.rw}</span>
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-slate-700">{l.usiaTahun} Tahun</td>
                                            <td className="px-4 py-3.5">
                                                {l.latestRecord ? (
                                                    <div className="text-[11px] space-y-0.5">
                                                        <span className="font-bold text-slate-800 block">
                                                            <Stethoscope size={11} className="inline mr-1 text-rose-500" />
                                                            Tensi: {l.latestRecord.tensiDarah || "-"} | BB: {l.latestRecord.beratBadan || "-"} kg
                                                        </span>
                                                        <span className="text-slate-500">
                                                            Gula: {l.latestRecord.gulaDarah ?? "-"} mg/dL • Kondisi: {l.latestRecord.kondisiUmum || "-"}
                                                        </span>
                                                    </div>
                                                ) : "-"}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${l.memilikiPenyakitBawaan ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                                                    {l.memilikiPenyakitBawaan ? "Ada Penyakit Bawaan" : "Sehat / Tidak Ada"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-600">{l.latestRecord?.keterangan || "-"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="px-4 py-3.5">Wilayah RT</th>
                                    <th className="px-4 py-3.5 text-center">Total Warga</th>
                                    <th className="px-4 py-3.5 text-center">Sasaran Balita</th>
                                    <th className="px-4 py-3.5 text-center">Ikut Posyandu</th>
                                    <th className="px-4 py-3.5 text-center">Stunting</th>
                                    <th className="px-4 py-3.5 text-center">Ibu Hamil (Risti)</th>
                                    <th className="px-4 py-3.5 text-center">Lansia Posbindu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {(recap?.rtBreakdown || []).map((r: any) => (
                                    <tr key={r.key || r.rt} className="hover:bg-slate-50/60">
                                        <td className="px-4 py-3.5">
                                            <div className="font-black text-slate-800">RT {r.rt} / RW {r.rw || rwNo}</div>
                                            <div className="text-[10px] text-rose-600 font-semibold">{r.posyanduName}</div>
                                        </td>
                                        <td className="px-4 py-3.5 text-center font-bold text-slate-600">{r.totalWarga}</td>
                                        <td className="px-4 py-3.5 text-center font-bold text-slate-700">{r.sasaranBalita}</td>
                                        <td className="px-4 py-3.5 text-center font-black text-blue-600">{r.balitaPosyandu}</td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-md font-black ${r.balitaStunting > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-600"}`}>
                                                {r.balitaStunting}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center font-bold text-pink-600">
                                            {r.ibuHamil} {r.ibuHamilRisti > 0 && <span className="text-[10px] text-rose-600">({r.ibuHamilRisti} Risti)</span>}
                                        </td>
                                        <td className="px-4 py-3.5 text-center font-bold text-amber-600">
                                            {r.lansiaPosyandu} / {r.sasaranLansia}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
