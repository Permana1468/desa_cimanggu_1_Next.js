"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Briefcase, Compass, Plus, Trash2, Search, Filter, RefreshCw,
    Loader2, CheckCircle2, GraduationCap, Users
} from "lucide-react";
import {
    getWilayahSosialData,
    lookupWargaByNikForWilayah,
    addWilayahAts,
    deleteWilayahAts,
    addWilayahPengangguran,
    updateWilayahPengangguranStatus,
    deleteWilayahPengangguran
} from "@/actions/wilayahTerpadu";
import { triggerNotificationRefresh } from "@/hooks/useNotifications";

export function WilayahSosialTab({ session }: { session: any }) {
    const role = String((session?.user as any)?.role || "RT").toUpperCase();
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<"pengangguran" | "ats">("pengangguran");
    const [selectedRw, setSelectedRw] = useState<string>("ALL");
    const [selectedRt, setSelectedRt] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState<"pengangguran" | "ats" | null>(null);

    const loadData = useCallback(async (showSpinner = false) => {
        if (showSpinner) setLoading(true);
        try {
            const res = await getWilayahSosialData();
            if (res) setData(res);
        } catch (err) {
            console.error("Failed to load Wilayah Sosial data:", err);
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
                    if (ev.data?.type === "SYNC_EVENT" || ev.data?.type === "KESRA_UPDATED" || ev.data?.type === "WARGA_UPDATED") {
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

    const filteredPengangguran = useMemo(() => {
        const list = data?.pengangguranList || [];
        return list.filter((p: any) => {
            if (selectedRw !== "ALL" && p.rw !== selectedRw) return false;
            if (selectedRt !== "ALL" && p.rt !== selectedRt) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (p.nama || "").toLowerCase().includes(q) || (p.nik || "").includes(q);
            }
            return true;
        });
    }, [data, selectedRw, selectedRt, searchQuery]);

    const filteredAts = useMemo(() => {
        const list = data?.atsList || [];
        return list.filter((a: any) => {
            if (selectedRw !== "ALL" && a.rw !== selectedRw) return false;
            if (selectedRt !== "ALL" && a.rt !== selectedRt) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (a.nama || "").toLowerCase().includes(q) || (a.nik || "").includes(q);
            }
            return true;
        });
    }, [data, selectedRw, selectedRt, searchQuery]);

    const handleStatusChange = async (id: string, status: string) => {
        await updateWilayahPengangguranStatus(id, status);
        loadData(false);
        triggerNotificationRefresh();
    };

    const handleDeletePengangguran = async (id: string) => {
        if (!confirm("Hapus data pengangguran ini?")) return;
        await deleteWilayahPengangguran(id);
        loadData(false);
        triggerNotificationRefresh();
    };

    const handleDeleteAts = async (id: string) => {
        if (!confirm("Hapus data Anak Putus Sekolah ini?")) return;
        await deleteWilayahAts(id);
        loadData(false);
        triggerNotificationRefresh();
    };

    const summary = data?.summary || {
        totalAts: 0,
        atsMinatPaket: 0,
        atsDisetujui: 0,
        totalPengangguran: 0,
        mencariKerja: 0,
        pelatihan: 0,
        sudahKerja: 0
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-slate-900 rounded-[2rem] p-6 md:p-7 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-[11px] font-bold mb-2.5 border border-white/20">
                        <Users size={13} />
                        <span>Sinkron Real-Time dengan Kasi Kesejahteraan Desa</span>
                    </div>
                    <h2 className="text-xl lg:text-2xl font-black tracking-tight">
                        Data Pengangguran & Anak Putus Sekolah (ATS)
                    </h2>
                    <p className="text-indigo-100/90 text-xs mt-1 max-w-2xl">
                        Pendataan sosial terpadu khusus cakupan wilayah {role === "RT" ? "RT Anda" : role === "RW" ? "RW & seluruh RT binaan" : "Dusun (seluruh RW & RT binaan)"}. Cukup ketik NIK untuk pengisian data otomatis.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => loadData(true)}
                        className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all cursor-pointer"
                        title="Segarkan Data"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setShowModal(activeSubTab)}
                        className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>{activeSubTab === "pengangguran" ? "Catat Pengangguran" : "Tambah Data ATS"}</span>
                    </button>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Pengangguran</span>
                    <div className="text-2xl font-black text-indigo-600 mt-1">{summary.totalPengangguran}</div>
                    <span className="text-[11px] text-slate-500 font-semibold">Mencari Kerja: {summary.mencariKerja}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pelatihan / Bekerja</span>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{summary.pelatihan + summary.sudahKerja}</div>
                    <span className="text-[11px] text-slate-500 font-semibold">Sudah Kerja: {summary.sudahKerja}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Anak Putus Sekolah</span>
                    <div className="text-2xl font-black text-amber-600 mt-1">{summary.totalAts}</div>
                    <span className="text-[11px] text-slate-500 font-semibold">Usia Sekolah (ATS)</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Minat Kejar Paket</span>
                    <div className="text-2xl font-black text-blue-600 mt-1">{summary.atsMinatPaket}</div>
                    <span className="text-[11px] text-slate-500 font-semibold">Beasiswa Disetujui: {summary.atsDisetujui}</span>
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveSubTab("pengangguran")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeSubTab === "pengangguran"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <Briefcase size={14} />
                            <span>Data Pengangguran ({filteredPengangguran.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveSubTab("ats")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeSubTab === "ats"
                                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <Compass size={14} />
                            <span>Anak Putus Sekolah ({filteredAts.length})</span>
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        {data?.availableRws?.length > 1 && (
                            <div className="relative">
                                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={selectedRw}
                                    onChange={(e) => { setSelectedRw(e.target.value); setSelectedRt("ALL"); }}
                                    className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                                >
                                    <option value="ALL">Semua RW</option>
                                    {data.availableRws.map((rw: string) => (
                                        <option key={rw} value={rw}>RW {rw}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {data?.availableRts?.length > 1 && (
                            <div className="relative">
                                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={selectedRt}
                                    onChange={(e) => setSelectedRt(e.target.value)}
                                    className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                                >
                                    <option value="ALL">Semua RT</option>
                                    {data.availableRts.map((rt: string) => (
                                        <option key={rt} value={rt}>RT {rt}</option>
                                    ))}
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
                                className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none w-full sm:w-52"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading && !data ? (
                        <div className="p-12 text-center text-slate-400 text-xs">Memuat data sosial wilayah...</div>
                    ) : activeSubTab === "pengangguran" ? (
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="px-4 py-3.5">NIK & Nama</th>
                                    <th className="px-4 py-3.5">Wilayah</th>
                                    <th className="px-4 py-3.5">Usia / Pendidikan</th>
                                    <th className="px-4 py-3.5">Keahlian & Lama</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPengangguran.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                            Belum ada data pengangguran di cakupan wilayah Anda.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPengangguran.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-slate-900">{p.nama}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{p.nik}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                                                    RT {p.rt} / RW {p.rw}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-slate-700">{p.usia} Tahun</div>
                                                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                                    <GraduationCap size={12} /> {p.pendidikan || "-"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-semibold text-slate-700">{p.keahlian || "-"}</div>
                                                <div className="text-[10px] text-slate-400">
                                                    {p.lamaMenganggur} bulan • {p.minatPelatihan ? "Minat Pelatihan" : "Tidak Minat"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <select
                                                    value={p.status}
                                                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border outline-none cursor-pointer ${
                                                        p.status === "MENCARI_KERJA"
                                                            ? "bg-red-50 text-red-700 border-red-200"
                                                            : p.status === "PELATIHAN"
                                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    }`}
                                                >
                                                    <option value="MENCARI_KERJA">Mencari Kerja</option>
                                                    <option value="PELATIHAN">Pelatihan</option>
                                                    <option value="SUDAH_KERJA">Sudah Kerja</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <button
                                                    onClick={() => handleDeletePengangguran(p.id)}
                                                    className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="px-4 py-3.5">NIK & Nama Anak</th>
                                    <th className="px-4 py-3.5">Wilayah</th>
                                    <th className="px-4 py-3.5">Usia / Pendidikan</th>
                                    <th className="px-4 py-3.5">Alasan Putus Sekolah</th>
                                    <th className="px-4 py-3.5">Kejar Paket & Bantuan</th>
                                    <th className="px-4 py-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                            Belum ada data Anak Putus Sekolah di cakupan wilayah Anda.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAts.map((a: any) => (
                                        <tr key={a.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-slate-900">{a.nama}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{a.nik}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                                                    RT {a.rt} / RW {a.rw}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-slate-700">{a.usia} Tahun</div>
                                                <div className="text-[11px] text-slate-500">{a.pendidikanTerakhir}</div>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-700 font-medium">{a.alasanPutusSekolah}</td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${a.minatKejarPaket ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                                                        {a.minatKejarPaket ? "Minat Paket" : "Tidak Minat"}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                        a.statusBantuan === "DISETUJUI" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                                    }`}>
                                                        {a.statusBantuan}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <button
                                                    onClick={() => handleDeleteAts(a.id)}
                                                    className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showModal && (
                <ModalTambahSosialWilayah
                    mode={showModal}
                    onClose={() => setShowModal(null)}
                    onSuccess={() => {
                        loadData(false);
                        triggerNotificationRefresh();
                    }}
                />
            )}
        </div>
    );
}

function ModalTambahSosialWilayah({
    mode,
    onClose,
    onSuccess
}: {
    mode: "pengangguran" | "ats";
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [selectedWarga, setSelectedWarga] = useState<any | null>(null);
    const [pendidikan, setPendidikan] = useState("");
    const [pendidikanAts, setPendidikanAts] = useState("SD");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const mapPendidikanToAts = (p?: string | null) => {
        if (!p) return "SD";
        const upper = p.toUpperCase();
        if (upper.includes("SMA") || upper.includes("SMK") || upper.includes("SLTA")) return "SMA";
        if (upper.includes("SMP") || upper.includes("SLTP")) return "SMP";
        if (upper.includes("TIDAK")) return "TIDAK_SEKOLAH";
        return "SD";
    };

    const handleSelect = (w: any) => {
        setSelectedWarga(w);
        setPendidikan(w.pendidikan || "");
        setPendidikanAts(mapPendidikanToAts(w.pendidikan));
        setSuggestions([]);
        setQuery("");
        setErrorMsg(null);
    };

    const handleSearchChange = async (val: string) => {
        setQuery(val);
        setErrorMsg(null);
        const clean = val.trim();
        if (clean.length < 3) {
            setSuggestions([]);
            return;
        }
        setSearching(true);
        try {
            const res = await lookupWargaByNikForWilayah(clean);
            const exact = res.find((r: any) => r.nik === clean);
            if (exact) {
                handleSelect(exact);
            } else {
                setSuggestions(res);
            }
        } catch {
            setSuggestions([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!selectedWarga) {
            setErrorMsg("Mohon masukkan NIK atau pilih warga dari wilayah Anda terlebih dahulu.");
            return;
        }
        setLoading(true);
        setErrorMsg(null);
        const fd = new FormData(e.target);

        let res: any;
        if (mode === "pengangguran") {
            res = await addWilayahPengangguran({
                nik: selectedWarga.nik,
                usia: selectedWarga.usia,
                pendidikan,
                keahlian: fd.get("keahlian"),
                lamaMenganggur: fd.get("lamaMenganggur"),
                minatPelatihan: fd.get("minatPelatihan") === "true",
                status: fd.get("status")
            });
        } else {
            res = await addWilayahAts({
                nik: selectedWarga.nik,
                usia: selectedWarga.usia,
                pendidikanTerakhir: pendidikanAts,
                alasanPutusSekolah: fd.get("alasanPutusSekolah"),
                minatKejarPaket: fd.get("minatKejarPaket") === "true"
            });
        }

        setLoading(false);
        if (!res?.success) {
            setErrorMsg(res?.error || "Gagal menyimpan data.");
            return;
        }
        onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {mode === "pengangguran" ? "Catat Data Pengangguran" : "Tambah Anak Putus Sekolah (ATS)"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Ketik NIK warga wilayah Anda untuk isi otomatis</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 text-xl">&times;</button>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                        {errorMsg}
                    </div>
                )}

                {!selectedWarga ? (
                    <div className="space-y-2 mb-4 relative">
                        <label className="block text-xs font-semibold text-slate-600">Masukkan NIK atau Nama Warga *</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Ketik 16 digit NIK atau nama..."
                                className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                            />
                            {searching && <Loader2 className="w-4 h-4 animate-spin text-indigo-500 absolute right-3 top-1/2 -translate-y-1/2" />}
                        </div>
                        {suggestions.length > 0 && (
                            <div className="border border-slate-200 bg-white rounded-xl shadow-lg divide-y divide-slate-100 max-h-44 overflow-y-auto">
                                {suggestions.map((w: any) => (
                                    <button
                                        type="button"
                                        key={w.id}
                                        onClick={() => handleSelect(w)}
                                        className="w-full text-left p-2.5 hover:bg-indigo-50 text-xs flex justify-between items-center"
                                    >
                                        <div>
                                            <span className="font-bold text-slate-800 block">{w.namaLengkap}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">{w.nik} • RT {w.rt}/RW {w.rw} ({w.usia} Thn)</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-indigo-600">Pilih</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex justify-between items-center mb-4">
                        <div>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                                <CheckCircle2 size={12} /> Warga Tersinkron ({selectedWarga.usia} Tahun)
                            </span>
                            <span className="font-bold text-slate-800 text-xs mt-1 block">{selectedWarga.namaLengkap}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{selectedWarga.nik} • RT {selectedWarga.rt}/RW {selectedWarga.rw}</span>
                        </div>
                        <button type="button" onClick={() => setSelectedWarga(null)} className="text-[10px] font-bold text-red-500 hover:underline">Ubah</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {mode === "pengangguran" ? (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Pendidikan Terakhir</label>
                                    <input name="pendidikan" required value={pendidikan} onChange={e => setPendidikan(e.target.value)} placeholder="SMA / S1" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/60" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Keahlian Utama</label>
                                    <input name="keahlian" placeholder="Las / Jahit / IT" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Lama Menganggur (Bln)</label>
                                    <input name="lamaMenganggur" type="number" min="0" defaultValue={1} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Minat Pelatihan</label>
                                    <select name="minatPelatihan" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white">
                                        <option value="true">Ya, Minat</option>
                                        <option value="false">Tidak Minat</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Status Ketenagakerjaan</label>
                                <select name="status" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white">
                                    <option value="MENCARI_KERJA">Mencari Kerja</option>
                                    <option value="PELATIHAN">Mengikuti Pelatihan</option>
                                    <option value="SUDAH_KERJA">Sudah Dapat Kerja</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Pendidikan Terakhir *</label>
                                <select value={pendidikanAts} onChange={e => setPendidikanAts(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white">
                                    <option value="SD">SD/MI</option>
                                    <option value="SMP">SMP/MTs</option>
                                    <option value="SMA">SMA/MA/SMK</option>
                                    <option value="TIDAK_SEKOLAH">Tidak Pernah Sekolah</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Alasan Putus Sekolah *</label>
                                <input name="alasanPutusSekolah" required placeholder="Faktor Ekonomi / Bekerja" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Minat Kejar Paket (A/B/C)?</label>
                                <select name="minatKejarPaket" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white">
                                    <option value="true">Ya, Minat</option>
                                    <option value="false">Tidak Minat</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
                        <button type="submit" disabled={loading} className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold disabled:opacity-50">
                            {loading ? "Menyimpan..." : "Simpan Data"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

