"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Folder, 
  FileText, 
  Search, 
  Settings, 
  LayoutGrid, 
  List, 
  Link2, 
  MoreHorizontal, 
  ChevronRight, 
  ArrowUpRight, 
  Users, 
  Building2, 
  Activity, 
  Shield, 
  ShieldCheck, 
  Server, 
  Database, 
  Lock, 
  History,
  Store,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface MasterExecutiveDashboardProps {
  stats: {
    totalUsers: number;
    adminAktif: number;
    totalPenduduk: number;
    totalTenant: number;
    dailyLogs: number;
  };
  latestLogs: any[];
  selectedTenant: any;
  maintenanceSettings: any;
  session: any;
}

const AVATAR_PALETTE = [
  "bg-gradient-to-tr from-rose-500 to-pink-500 text-white",
  "bg-gradient-to-tr from-amber-500 to-orange-500 text-white",
  "bg-gradient-to-tr from-teal-500 to-emerald-500 text-white",
  "bg-gradient-to-tr from-indigo-500 to-sky-500 text-white",
  "bg-gradient-to-tr from-purple-500 to-violet-500 text-white",
  "bg-gradient-to-tr from-blue-500 to-cyan-500 text-white"
];

export function MasterExecutiveDashboard({
  stats,
  latestLogs,
  selectedTenant,
  maintenanceSettings,
  session
}: MasterExecutiveDashboardProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchTerm, setSearchTerm] = useState("");

  const tenantLabel = selectedTenant?.name || "Semua Wilayah Node";

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

  const getLogBadge = (action: string, category: string) => {
    const act = (action || "").toUpperCase();
    const cat = (category || "").toUpperCase();

    if (act.includes("CREATE") || act.includes("INSERT") || act.includes("REGISTER")) {
      return {
        bg: "bg-emerald-100 text-emerald-600",
        label: "Dibuat",
        statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
      };
    }
    if (act.includes("DELETE") || act.includes("DROP") || act.includes("REMOVE")) {
      return {
        bg: "bg-rose-100 text-rose-600",
        label: "Dihapus",
        statusColor: "bg-rose-50 text-rose-700 border-rose-200"
      };
    }
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("PATCH")) {
      return {
        bg: "bg-blue-100 text-[#1d64ec]",
        label: "Diperbarui",
        statusColor: "bg-blue-50 text-blue-700 border-blue-200"
      };
    }
    if (act.includes("LOGIN") || act.includes("AUTH") || cat.includes("SECURITY")) {
      return {
        bg: "bg-amber-100 text-amber-600",
        label: "Autentikasi",
        statusColor: "bg-amber-50 text-amber-700 border-amber-200"
      };
    }
    return {
      bg: "bg-slate-100 text-slate-700",
      label: "Tercatat",
      statusColor: "bg-slate-50 text-slate-700 border-slate-200"
    };
  };

  const filteredLogs = latestLogs.filter((log) => {
    const query = searchTerm.toLowerCase();
    const actionMatch = (log.action || "").toLowerCase().includes(query);
    const userMatch = (log.user?.fullName || "Sistem").toLowerCase().includes(query);
    const entityMatch = (log.entity || "").toLowerCase().includes(query);
    const ipMatch = (log.ipAddress || "").includes(query);
    return actionMatch || userMatch || entityMatch || ipMatch;
  });

  return (
    <div className="space-y-7 pb-16 animate-in fade-in duration-300">
      {/* 1. TOP TITLE BAR & CONTROLS (MIRRORS ADMIN DESA HEADER EXACTLY) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Utama
          </h1>
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
            <Folder size={18} className="fill-white/20" />
          </div>
          <span className="text-xs font-semibold text-slate-400 hidden md:inline-block">
            • {tenantLabel}
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
            href="/master-admin/config"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
            title="Konfigurasi Master"
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>

      {/* 2. SECTION: QUICK ACCESS (SIGNATURE FOLDER TAB CARDS - EXACT REPLICA) */}
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
          {/* FOLDER 1: MANAJEMEN PENGGUNA (SOLID ROYAL BLUE - ACTIVE HERO FOLDER) */}
          <Link
            href="/master-admin/pengguna-sistem"
            className="group block relative transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
          >
            {/* Seamless Curved Folder Notch Tab */}
            <div className="w-[52%] px-4 py-1.5 rounded-t-2xl bg-[#1d64ec] text-[9px] font-black tracking-wider uppercase text-white/90">
              <span>SHARED WITH</span>
            </div>

            {/* Folder Body */}
            <div className="bg-[#1d64ec] text-white rounded-3xl rounded-tl-none p-5 lg:p-6 shadow-xl shadow-blue-600/25 space-y-4">
              <div className="flex items-center justify-between">
                {renderAvatars(["Admin", "Master", "Super"], true)}
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-blue-200 uppercase tracking-widest mb-0.5">
                  FOLDER • PENGGUNA & OTORITAS
                </p>
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                  Manajemen Pengguna
                </h3>
              </div>

              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-300">
                  {stats.adminAktif} Admin Aktif • {stats.totalUsers} Akun
                </span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-white/90" />
              </div>
            </div>
          </Link>

          {/* FOLDER 2: KEPENDUDUKAN (CLEAN SOFT TINT FOLDER) */}
          <Link
            href="/master-admin/data"
            className="group block relative transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
          >
            {/* Seamless Curved Folder Notch Tab */}
            <div className="w-[52%] px-4 py-1.5 rounded-t-2xl bg-[#f4f7fc] text-[9px] font-black tracking-wider uppercase text-slate-500">
              <span>SHARED WITH</span>
            </div>

            {/* Folder Body */}
            <div className="bg-[#f4f7fc] hover:bg-[#edf3fc] rounded-3xl rounded-tl-none p-5 lg:p-6 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                {renderAvatars(["Warga", "Kependudukan", "RT"])}
                <Users size={17} className="text-slate-400 group-hover:text-[#1d64ec] transition-colors" />
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#1d64ec] uppercase tracking-widest mb-0.5">
                  FOLDER • KEPENDUDUKAN GLOBAL
                </p>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                  Data Warga & Sensus
                </h3>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="font-bold text-slate-700">{stats.totalPenduduk.toLocaleString('id-ID')} Jiwa Terdata</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* FOLDER 3: WILAYAH & KELEMBAGAAN (CLEAN SOFT TINT FOLDER) */}
          <Link
            href="/master-admin/wilayah"
            className="group block relative transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
          >
            {/* Seamless Curved Folder Notch Tab */}
            <div className="w-[52%] px-4 py-1.5 rounded-t-2xl bg-[#f4f7fc] text-[9px] font-black tracking-wider uppercase text-slate-500">
              <span>SHARED WITH</span>
            </div>

            {/* Folder Body */}
            <div className="bg-[#f4f7fc] hover:bg-[#edf3fc] rounded-3xl rounded-tl-none p-5 lg:p-6 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                {renderAvatars(["Dusun", "RW", "RT"])}
                <Building2 size={17} className="text-slate-400 group-hover:text-[#1d64ec] transition-colors" />
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#1d64ec] uppercase tracking-widest mb-0.5">
                  FOLDER • WILAYAH & STRUKTUR
                </p>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                  Wilayah & Lembaga
                </h3>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="font-bold text-slate-700">{stats.totalTenant} Node Wilayah Aktif</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* FOLDER 4: SISTEM INTELLIGENCE & CACHE (CLEAN SOFT TINT FOLDER) */}
          <Link
            href="/master-admin/stats"
            className="group block relative transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
          >
            {/* Seamless Curved Folder Notch Tab */}
            <div className="w-[52%] px-4 py-1.5 rounded-t-2xl bg-[#f4f7fc] text-[9px] font-black tracking-wider uppercase text-slate-500">
              <span>SHARED WITH</span>
            </div>

            {/* Folder Body */}
            <div className="bg-[#f4f7fc] hover:bg-[#edf3fc] rounded-3xl rounded-tl-none p-5 lg:p-6 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between">
                {renderAvatars(["Server", "Cache", "Security"])}
                <Activity size={17} className="text-slate-400 group-hover:text-[#1d64ec] transition-colors" />
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-[#1d64ec] uppercase tracking-widest mb-0.5">
                  FOLDER • VITALITAS & CACHE
                </p>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                  System Intelligence
                </h3>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="font-bold text-slate-700">{stats.dailyLogs} Log Hari Ini</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. SECTION: ALL FILES / AKTIVITAS AUDIT LOG TERKINI (GOOGLE DRIVE TABLE STYLE PERSIS GAMBAR 2) */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
              All Files &bull; Audit Trail Terkini
            </h2>
            <p className="text-slate-400 text-xs font-medium mt-0.5">
              Daftar dokumen rekam jejak transaksi data, otentikasi login, dan perubahan sistem
            </p>
          </div>

          {/* Search Box in Table (Mockup Pill Curve) */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari audit log, pengguna, atau IP..."
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
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 text-xs font-bold">
                    Tidak ada rekam jejak audit log yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 8).map((log: any) => {
                  const badge = getLogBadge(log.action, log.category);
                  const userName = log.user?.fullName || "System Engine";
                  const entityLabel = log.entity || "Sistem";
                  const dateStr = new Date(log.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={log.id}
                      className="group transition-colors hover:bg-[#edf4ff] rounded-2xl"
                    >
                      {/* Name Column with colorful icon */}
                      <td className="px-4 py-3 rounded-l-2xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${badge.bg}`}>
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                              {log.action?.replace(/_/g, " ")}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              Entitas: {entityLabel} {log.entityId ? `• ID: ${log.entityId.substring(0, 8)}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Owners / Pemohon Column */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black uppercase shrink-0 ${AVATAR_PALETTE[userName.length % AVATAR_PALETTE.length]} shadow-2xs`}>
                            {userName.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
                            {userName}
                          </span>
                        </div>
                      </td>

                      {/* Last Modified Date Column */}
                      <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                        {dateStr}
                      </td>

                      {/* Status Column */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badge.statusColor}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Action Column */}
                      <td className="px-4 py-3 text-right rounded-r-2xl">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href="/master-admin/logs"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100/50 transition-colors cursor-pointer"
                            title="Buka Log Detail"
                          >
                            <Link2 size={16} />
                          </Link>
                          <Link
                            href="/master-admin/logs"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                            title="Opsi Jejak"
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
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold">
              Tidak ada catatan log ditemukan.
            </div>
          ) : (
            filteredLogs.slice(0, 6).map((log: any) => {
              const badge = getLogBadge(log.action, log.category);
              const userName = log.user?.fullName || "System Engine";

              return (
                <div
                  key={log.id}
                  className="bg-[#f8fafd] p-4 rounded-2xl border border-slate-200/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${badge.bg}`}>
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {log.action?.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {log.entity}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${badge.statusColor}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium truncate max-w-[140px]">{userName}</span>
                    <span>{new Date(log.createdAt).toLocaleDateString("id-ID")}</span>
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
