"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    FileText, CheckCircle2, Clock, Users, Banknote, ShieldCheck,
    RefreshCw, ArrowRight, Archive, QrCode, UserCheck, Building2,
    HardHat, FileCheck2, Loader2, Sparkles, Database
} from "lucide-react";
import { getSekdesCommandCenterData, verifySuratBySekdes } from "@/actions/sekdes";
import { triggerNotificationRefresh } from "@/hooks/useNotifications";

const formatRp = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);

export function SekdesDashboard({ session }: { session: any }) {
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string>("-");
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    const loadData = useCallback(async (showSpinner = false) => {
        if (showSpinner) setLoading(true);
        setSyncing(true);
        try {
            const res = await getSekdesCommandCenterData();
            setData(res);
            setLastSync(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        } catch (err) {
            console.error("Failed to load SEKDES data:", err);
        } finally {
            setLoading(false);
            setSyncing(false);
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
                bc.onmessage = () => {
                    loadData(false);
                };
            } catch {}
        }

        const interval = setInterval(handleRefresh, 25000);

        return () => {
            window.removeEventListener("refresh-notifications", handleRefresh);
            window.removeEventListener("focus", handleRefresh);
            if (bc) bc.close();
            clearInterval(interval);
        };
    }, [loadData]);

    const handleParafSurat = async (id: string) => {
        setVerifyingId(id);
        try {
            await verifySuratBySekdes(id);
            triggerNotificationRefresh();
            await loadData(false);
        } catch (err) {
            console.error("Gagal memverifikasi surat:", err);
        } finally {
            setVerifyingId(null);
        }
    };

    if (loading && !data) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[450px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-slate-400 text-xs font-semibold mt-3 animate-pulse">Memuat Pusat Koordinasi Sekretaris Desa...</p>
            </div>
        );
    }

    const persuratan = data?.persuratan || { pendingCount: 0, verifiedCount: 0, approvedToday: 0, queueList: [] };
    const ppkd = data?.ppkd || { tahun: new Date().getFullYear(), totalPendapatan: 0, totalBelanjaAnggaran: 0, totalBelanjaRealisasi: 0, serapanPersen: 0, pendingProposals: 0 };
    const kepegawaian = data?.kepegawaian || { totalAparatur: 0, hadirHariIni: 0, kehadiranPersen: 0 };
    const kependudukan = data?.kependudukan || { totalWargaAktif: 0, unverifiedWargaCount: 0, totalArsipDokumen: 0, mutasiBulanIni: { lahir: 0, mati: 0, pindah: 0, datang: 0 } };

    return (
        <div className="space-y-6 pb-16 animate-in fade-in duration-300">
            {/* HERO BANNER */}
            <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#1d4ed8] p-7 md:p-9 text-white shadow-xl shadow-blue-900/15">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/15 rounded-full blur-[80px] -mr-28 -mt-28" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md">
                                <Sparkles size={12} className="text-amber-300" />
                                Koordinator PPKD &amp; Administrasi Pemerintahan
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-black uppercase">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Live Sync: {lastSync}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight">
                            Dashboard Sekretaris Desa
                        </h1>
                        <p className="text-blue-100/85 text-xs sm:text-sm max-w-2xl leading-relaxed">
                            Selamat datang, <strong className="text-white">{session?.user?.name || "Sekretaris Desa"}</strong>. Kendalikan verifikasi naskah dinas &amp; paraf surat, koordinasi APBDes (PPKD), kedisiplinan aparatur, serta tata kearsipan Desa Cimanggu I.
                        </p>
                    </div>

                    <button
                        onClick={() => loadData(false)}
                        className="self-start lg:self-center flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                        <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
                        <span>Sinkronkan</span>
                    </button>
                </div>
            </div>

            {/* 4 KPI UTAMA TUPOKSI SEKDES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/dashboard/surat" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">Paraf / Verifikasi Surat</span>
                        <FileText size={18} className="text-rose-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">{persuratan.pendingCount}</span>
                        <span className="text-xs font-bold text-slate-400">Menunggu Paraf</span>
                    </div>
                    <div className="mt-2 text-[11px] font-bold text-slate-500 flex items-center justify-between">
                        <span>Terverifikasi: {persuratan.verifiedCount}</span>
                        <span className="text-emerald-600">Selesai Hari Ini: {persuratan.approvedToday}</span>
                    </div>
                </Link>

                <Link href="/dashboard/apbdes" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">Koordinator PPKD ({ppkd.tahun})</span>
                        <Banknote size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-xl font-black text-slate-900 truncate">{formatRp(ppkd.totalBelanjaRealisasi)}</div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Serapan Belanja</span>
                        <span className="text-blue-600">{ppkd.serapanPersen}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${ppkd.serapanPersen}%` }} />
                    </div>
                </Link>

                <Link href="/dashboard/e-absensi" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">Absensi Aparatur</span>
                        <QrCode size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">{kepegawaian.hadirHariIni}</span>
                        <span className="text-xs font-bold text-slate-400">/ {kepegawaian.totalAparatur} Aparatur</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Kehadiran Hari Ini</span>
                        <span className="text-emerald-600">{kepegawaian.kehadiranPersen}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${kepegawaian.kehadiranPersen}%` }} />
                    </div>
                </Link>

                <Link href="/dashboard/verifikasi-warga" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">Administrasi Warga</span>
                        <UserCheck size={18} className="text-amber-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">{kependudukan.unverifiedWargaCount}</span>
                        <span className="text-xs font-bold text-slate-400">Akun Pending</span>
                    </div>
                    <div className="mt-2 text-[11px] font-bold text-slate-500 flex items-center justify-between">
                        <span>Warga Aktif: {kependudukan.totalWargaAktif.toLocaleString("id-ID")}</span>
                        <span className="text-indigo-600">{kependudukan.totalArsipDokumen} Arsip</span>
                    </div>
                </Link>
            </div>

            {/* PANEL UTAMA: ANTREAN PARAF SURAT & KOORDINASI PPKD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* KIRI (2 KOLOM): ANTREAN VERIFIKASI & PARAF SURAT SEKDES */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <FileCheck2 size={18} className="text-blue-600" /> Meja Verifikasi &amp; Paraf Surat Sekdes
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Surat dengan status <em>Tertunda</em> dapat langsung diparaf/verifikasi Sekdes sebelum pengesahan Kepala Desa.
                            </p>
                        </div>
                        <Link href="/dashboard/surat" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 shrink-0">
                            Lihat Semua <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {persuratan.queueList.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                                Tidak ada antrean surat yang menunggu paraf saat ini.
                            </div>
                        ) : (
                            persuratan.queueList.map((s: any) => (
                                <div key={s.id} className="p-4 px-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-slate-900">{s.jenisSurat}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                                s.status === "TERTUNDA" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                            }`}>
                                                {s.status === "TERTUNDA" ? "MENUNGGU PARAF" : "TERVERIFIKASI (SIAP KADES)"}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            Pemohon: <strong className="text-slate-700">{s.warga?.namaLengkap || "-"}</strong> • RT {s.warga?.rt || "-"}/RW {s.warga?.rw || "-"} • {s.keperluan || "-"}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {s.status === "TERTUNDA" ? (
                                            <button
                                                onClick={() => handleParafSurat(s.id)}
                                                disabled={verifyingId === s.id}
                                                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                {verifyingId === s.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                                <span>Paraf Sekdes</span>
                                            </button>
                                        ) : (
                                            <Link
                                                href="/dashboard/surat"
                                                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                                            >
                                                Detail
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* KANAN: RINGKASAN PPKD & MUTASI KEPENDUDUKAN */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-xs space-y-4">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <Banknote size={17} className="text-blue-600" /> Ringkasan APBDes (PPKD {ppkd.tahun})
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                                <span className="text-slate-500 font-semibold">Target Pendapatan</span>
                                <span className="font-black text-slate-900">{formatRp(ppkd.totalPendapatan)}</span>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                                <span className="text-slate-500 font-semibold">Pagu Belanja</span>
                                <span className="font-black text-slate-900">{formatRp(ppkd.totalBelanjaAnggaran)}</span>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex justify-between items-center">
                                <span className="text-blue-700 font-bold">Realisasi Belanja</span>
                                <span className="font-black text-blue-800">{formatRp(ppkd.totalBelanjaRealisasi)}</span>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 flex justify-between items-center">
                                <span className="text-amber-700 font-bold">Usulan Keuangan Pending</span>
                                <span className="font-black text-amber-800">{ppkd.pendingProposals} Berkas</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-xs space-y-3">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <Clock size={17} className="text-indigo-600" /> Mutasi Kependudukan Bulan Ini
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Lahir</span>
                                <span className="text-xl font-black text-emerald-800">{kependudukan.mutasiBulanIni.lahir}</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                                <span className="text-[10px] font-bold text-rose-700 uppercase block">Meninggal</span>
                                <span className="text-xl font-black text-rose-800">{kependudukan.mutasiBulanIni.mati}</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                                <span className="text-[10px] font-bold text-amber-700 uppercase block">Pindah Keluar</span>
                                <span className="text-xl font-black text-amber-800">{kependudukan.mutasiBulanIni.pindah}</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                                <span className="text-[10px] font-bold text-blue-700 uppercase block">Pendatang</span>
                                <span className="text-xl font-black text-blue-800">{kependudukan.mutasiBulanIni.datang}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODUL AKSES CEPAT TUPOKSI SEKDES */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { title: "Persuratan", href: "/dashboard/surat", icon: FileText, color: "text-blue-600 bg-blue-50" },
                    { title: "APBDes (PPKD)", href: "/dashboard/apbdes", icon: Banknote, color: "text-emerald-600 bg-emerald-50" },
                    { title: "Aparatur Desa", href: "/dashboard/aparatur", icon: Users, color: "text-indigo-600 bg-indigo-50" },
                    { title: "E-Absensi", href: "/dashboard/e-absensi", icon: QrCode, color: "text-teal-600 bg-teal-50" },
                    { title: "Data Warga", href: "/dashboard/warga", icon: Database, color: "text-amber-600 bg-amber-50" },
                    { title: "Arsip Digital", href: "/dashboard/arsip", icon: Archive, color: "text-purple-600 bg-purple-50" }
                ].map((mod) => (
                    <Link
                        key={mod.title}
                        href={mod.href}
                        className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5 group"
                    >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${mod.color} group-hover:scale-110 transition-transform`}>
                            <mod.icon size={20} />
                        </div>
                        <span className="text-xs font-black text-slate-800">{mod.title}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

