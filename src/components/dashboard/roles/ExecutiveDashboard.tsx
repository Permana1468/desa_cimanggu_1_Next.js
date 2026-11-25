"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  FileSpreadsheet, 
  FileType, 
  Search, 
  Bell, 
  Settings, 
  HelpCircle, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Link2, 
  MoreHorizontal, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Building2, 
  HeartHandshake, 
  ArrowUpRight, 
  ExternalLink,
  MapPin,
  Calendar,
  Layers
} from "lucide-react";
import { StatusSurat } from "@prisma/client";
import Link from "next/link";
import { getVillageDashboardStats, getSuratList } from "@/actions/village";
import { getDashboardRealtimeStats } from "@/actions/dashboard";

interface ExecutiveDashboardProps {
  session: any;
  stats: any;
  latestSurat: any[];
  realtimeStats?: any;
  villageProfile?: any;
}

export function ExecutiveDashboard({
  session,
  stats: initialStats,
  latestSurat: initialLatestSurat,
  realtimeStats: initialRealtimeStats,
  villageProfile,
}: ExecutiveDashboardProps) {
  const [stats, setStats] = useState(initialStats || {});
  const [latestSurat, setLatestSurat] = useState(initialLatestSurat || []);
  const [realtimeStats, setRealtimeStats] = useState(initialRealtimeStats || null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchLiveExecutiveData = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    try {
      setIsSyncing(true);
      const [vStats, suratList, rtStats] = await Promise.all([
        getVillageDashboardStats(),
        getSuratList(),
        getDashboardRealtimeStats(),
      ]);
      if (vStats) setStats(vStats);
      if (Array.isArray(suratList)) setLatestSurat(suratList);
      if (rtStats) setRealtimeStats(rtStats);
    } catch (err) {
      console.warn("Failed to sync live executive stats:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const handleRefresh = () => fetchLiveExecutiveData();
    window.addEventListener("refresh-notifications", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    const interval = setInterval(fetchLiveExecutiveData, 30000);
    return () => {
      window.removeEventListener("refresh-notifications", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      clearInterval(interval);
    };
  }, [fetchLiveExecutiveData]);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFolderFilter, setActiveFolderFilter] = useState<string>("ALL");

  const villageName = villageProfile?.title || "Desa Cimanggu I";
  const villageAddress = villageProfile?.address || "Kec. Cibungbulang";

  // Prioritize pending & unverified letters
  const sortedSurat = [...latestSurat].sort((a, b) => {
    const isAPending = a.status === StatusSurat.TERTUNDA || a.status === StatusSurat.TERVERIFIKASI;
    const isBPending = b.status === StatusSurat.TERTUNDA || b.status === StatusSurat.TERVERIFIKASI;
    if (isAPending && !isBPending) return -1;
    if (!isAPending && isBPending) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredSurat = sortedSurat.filter((s: any) => {
    const query = searchTerm.toLowerCase();
    const nameMatch = (s.warga?.namaLengkap || "").toLowerCase().includes(query);
    const jenisMatch = (s.jenisSurat || "").toLowerCase().includes(query);
    const nikMatch = (s.warga?.nik || "").includes(query);
    return nameMatch || jenisMatch || nikMatch;
  });

  // Overlapping avatar generator helper (Vibrant Mockup Style)
  const AVATAR_PALETTE = [
    "bg-gradient-to-tr from-rose-500 to-pink-500 text-white",
    "bg-gradient-to-tr from-amber-500 to-orange-500 text-white",
    "bg-gradient-to-tr from-teal-500 to-emerald-500 text-white",
    "bg-gradient-to-tr from-indigo-500 to-sky-500 text-white",
    "bg-gradient-to-tr from-purple-500 to-violet-500 text-white"
  ];

  const renderAvatars = (names: string[], isBlueFolder = false) => (
    <div className="flex items-center -space-x-2">
      {names.map((name, i) => {
        const bg = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
        return (
          <div
            key={i}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black uppercase shadow-xs shrink-0 ${
              isBlueFolder
                ? "bg-white text-[#1d64ec] ring-2 ring-[#1d64ec]"
                : `${bg} ring-2 ring-white`
            }`}
            title={name}
          >
            {name.charAt(0)}
          </div>
        );
      })}
    </div>
  );

  // File type icon badge helper
  const getFileBadge = (jenisSurat: string) => {
    const lower = (jenisSurat || "").toLowerCase();
    if (lower.includes("usaha") || lower.includes("sku")) {
      return {
        icon: FileSpreadsheet,
        bg: "bg-emerald-100 text-emerald-600",
        color: "text-emerald-600",
      };
    }
    if (lower.includes("tidak mampu") || lower.includes("skkm")) {
      return {
        icon: FileType,
        bg: "bg-rose-100 text-rose-600",
        color: "text-rose-600",
      };
    }
    if (lower.includes("skck") || lower.includes("kelakuan")) {
      return {
        icon: FileText,
        bg: "bg-amber-100 text-amber-600",
        color: "text-amber-600",
      };
    }
    return {
      icon: FileText,
      bg: "bg-blue-100 text-[#1d64ec]",
      color: "text-[#1d64ec]",
    };
  };

  return (
    <div className="space-y-7 pb-20 animate-in fade-in duration-300">
      {/* 1. TOP TITLE BAR & CONTROLS (GOODLE DRIVE REDESIGN STYLE) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Utama
          </h1>
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
            <Folder size={18} className="fill-white/20" />
          </div>
          <span className="text-xs font-semibold text-slate-400 hidden md:inline-block">
            • {villageName}
          </span>
        </div>

        {/* Right Action Icons & View Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100/90 rounded-2xl p-1 border border-slate-200/60">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          <Link
            href="/dashboard/settings"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
            title="Pengaturan Desa"
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>

      {/* 2. SECTION: QUICK ACCESS (SIGNATURE FOLDER TAB CARDS) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
            Quick Access
          </h2>
          <span className="text-[11px] font-semibold text-slate-400">
            4 Modul Utama
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* FOLDER 1: PERSURATAN (SOLID ROYAL BLUE - ACTIVE HERO FOLDER) */}
          <Link
            href="/dashboard/surat?status=TERTUNDA"
            className="group block relative transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
          >
            {/* Seamless Curved Folder Notch Tab */}
            <div className="w-[52%] px-4 py-1.5 rounded-t-2xl bg-[#1d64ec] text-[9px] font-black tracking-wider uppercase text-white/90">
              <span>SHARED WITH</span>
            </div>

            {/* Folder Body */}
            <div className="bg-[#1d64ec] text-white rounded-3xl rounded-tl-none p-5 lg:p-6 shadow-xl shadow-blue-600/25 space-y-4">
              <div className="flex items-center justify-between">
                {renderAvatars(["Sekdes", "Kasi", "Warga"], true)}
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-blue-200 uppercase tracking-widest mb-0.5">
                  FOLDER • PELAYANAN
                </p>
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                  Antrean Persuratan
                </h3>
              </div>

              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-300">
                  {stats.suratPending || 0} Surat Menunggu
                </span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-white/90" />
              </div>
            </div>
          </Link>

          {/* FOLDER 2: KEPENDUDUKAN (CLEAN SOFT TINT FOLDER) */}
          <Link
            href="/dashboard/warga"
            className="group block relative transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
          >
            {/* Seamless Curved Folder Notch Tab */}
            <div className="w-[52%] px-4 py-1.5 rounded-t-2xl bg-[#f4f7fc] text-[9px] font-black tracking-wider uppercase text-slate-500">
              <span>SHARED WITH</span>
            </div>

            {/* Folder Body */}
            <div className="bg-[#f4f7fc] hover:bg-[#edf3fc] rounded-3xl rounded-tl-none p-5 lg:p-6 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                {renderAvatars(["Kaur", "Operator", "RT"])}
                <Users size={17} className="text-slate-400 group-hover:text-[#1d64ec] transition-colors" />
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#1d64ec] uppercase tracking-widest mb-0.5">
                  FOLDER • KEPENDUDUKAN
                </p>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                  Data Warga Desa
                </h3>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="font-bold text-slate-700">{stats.totalWarga || 0} Jiwa Terdata</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* FOLDER 3: APARATUR DESA (CLEAN SOFT TINT FOLDER) */}
          <Link
            href="/dashboard/aparatur"
            className="group block relative transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
          >
            {/* Seamless Curved Folder Notch Tab */}
            <div className="w-[52%] px-4 py-1.5 rounded-t-2xl bg-[#f4f7fc] text-[9px] font-black tracking-wider uppercase text-slate-500">
              <span>SHARED WITH</span>
            </div>

            {/* Folder Body */}
            <div className="bg-[#f4f7fc] hover:bg-[#edf3fc] rounded-3xl rounded-tl-none p-5 lg:p-6 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                {renderAvatars(["Kades", "Sekdes", "BPD"])}
                <Building2 size={17} className="text-slate-400 group-hover:text-[#1d64ec] transition-colors" />
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#1d64ec] uppercase tracking-widest mb-0.5">
                  FOLDER • SDM & STRUKTUR
                </p>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                  Aparatur & Lembaga
                </h3>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="font-bold text-slate-700">{stats.totalAparatur || 0} Perangkat Aktif</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* FOLDER 4: BANSOS & SOSIAL (CLEAN SOFT TINT FOLDER) */}
          <Link
            href="/dashboard/bansos"
            className="group block relative transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
          >
            {/* Seamless Curved Folder Notch Tab */}
            <div className="w-[52%] px-4 py-1.5 rounded-t-2xl bg-[#f4f7fc] text-[9px] font-black tracking-wider uppercase text-slate-500">
              <span>SHARED WITH</span>
            </div>

            {/* Folder Body */}
            <div className="bg-[#f4f7fc] hover:bg-[#edf3fc] rounded-3xl rounded-tl-none p-5 lg:p-6 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                {renderAvatars(["Kesra", "Puskesos", "Kadus"])}
                <HeartHandshake size={17} className="text-slate-400 group-hover:text-[#1d64ec] transition-colors" />
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#1d64ec] uppercase tracking-widest mb-0.5">
                  FOLDER • SOSIAL & BANSOS
                </p>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                  Bantuan Sosial
                </h3>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="font-bold text-slate-700">PKH, BPNT, BLT-DD</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. SECTION: ALL FILES / AKTIVITAS PERSURATAN TERKINI (GOODLE DRIVE TABLE STYLE) */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
              All Files &bull; Persuratan Terkini
            </h2>
            <p className="text-slate-400 text-xs font-medium mt-0.5">
              Daftar dokumen permohonan surat masuk dan status verifikasi digital
            </p>
          </div>

          {/* Search Box in Table (Mockup Pill Curve) */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari surat, nama warga, atau NIK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-full border border-slate-200/80 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1d64ec] bg-[#f4f7fc] focus:bg-white transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* DESKTOP & TABLET VIEW: TERISOLASI (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar -mx-6 lg:-mx-8 px-6 lg:px-8">
          <table className="w-full text-left min-w-[760px] border-separate border-spacing-y-1.5">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Owners</th>
                <th className="px-4 py-2.5">Last Modified</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 text-xs font-bold">
                    Tidak ada dokumen surat yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSurat.slice(0, 8).map((surat: any) => {
                  const badge = getFileBadge(surat.jenisSurat);
                  const Icon = badge.icon;
                  const residentName = surat.warga?.namaLengkap || "Warga Desa";
                  const nik = surat.warga?.nik || "-";
                  const dateStr = new Date(surat.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={surat.id}
                      className="group transition-colors hover:bg-[#edf4ff] rounded-2xl"
                    >
                      {/* Name Column with colorful icon */}
                      <td className="px-4 py-3 rounded-l-2xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${badge.bg}`}>
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                              {surat.jenisSurat}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              NIK: {nik}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Owners / Pemohon Column */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black uppercase shrink-0 ${AVATAR_PALETTE[residentName.length % AVATAR_PALETTE.length]} shadow-2xs`}>
                            {residentName.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
                            {residentName}
                          </span>
                        </div>
                      </td>

                      {/* Last Modified Date Column */}
                      <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                        {dateStr}
                      </td>

                      {/* Status Column */}
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={surat.status} />
                      </td>

                      {/* Action Column */}
                      <td className="px-4 py-3 text-right rounded-r-2xl">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href="/dashboard/surat"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100/50 transition-colors cursor-pointer"
                            title="Buka Persuratan"
                          >
                            <Link2 size={16} />
                          </Link>
                          <Link
                            href="/dashboard/surat"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                            title="Opsi Dokumen"
                          >
                            <MoreHorizontal size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE / APP VIEW: TERISOLASI (block md:hidden) */}
        <div className="block md:hidden space-y-3">
          {filteredSurat.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold">
              Tidak ada permohonan surat ditemukan.
            </div>
          ) : (
            filteredSurat.slice(0, 6).map((surat: any) => {
              const badge = getFileBadge(surat.jenisSurat);
              const Icon = badge.icon;
              const residentName = surat.warga?.namaLengkap || "Warga Desa";

              return (
                <div
                  key={surat.id}
                  className="p-4 rounded-2xl bg-[#f4f7fc] border border-slate-200/70 space-y-2.5 active:bg-[#eaf1fc] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${badge.bg}`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {surat.jenisSurat}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Pemohon: {residentName}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={surat.status} />
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span className="text-[10px]">
                      {new Date(surat.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <Link
                      href="/dashboard/surat"
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-blue-600 font-bold text-xs"
                    >
                      Buka &rarr;
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: StatusSurat }) {
  const configs: Record<string, { text: string; color: string; icon: any }> = {
    [StatusSurat.TERTUNDA]: {
      text: "Tertunda",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
    },
    [StatusSurat.TERVERIFIKASI]: {
      text: "Terverifikasi",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: AlertCircle,
    },
    [StatusSurat.DISETUJUI]: {
      text: "Disetujui",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
    [StatusSurat.DITOLAK]: {
      text: "Ditolak",
      color: "bg-rose-50 text-rose-700 border-rose-200",
      icon: AlertCircle,
    },
  };
  const config = configs[status] || configs[StatusSurat.TERTUNDA];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.color}`}
    >
      <Icon size={11} />
      <span>{config.text}</span>
    </span>
  );
}
