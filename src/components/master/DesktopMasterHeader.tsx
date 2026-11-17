"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Building, 
  Activity,
  HardDrive,
  Cpu
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useNotifications } from "@/hooks/useNotifications";
import { TenantSwitcher } from "./TenantSwitcher";

interface DesktopMasterHeaderProps {
  session: any;
  tenants?: any[];
  onOpenNotif?: () => void;
}

export function DesktopMasterHeader({ session, tenants = [], onOpenNotif }: DesktopMasterHeaderProps) {
  const router = useRouter();
  const { data: clientSession } = useSession();
  const currentSession = clientSession || session;
  const { unreadCount } = useNotifications();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = currentSession?.user;
  const userName = (user?.name || "Admin Master").trim();
  const userEmail = user?.email || "master@cimanggu1.desa.id";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();

    // Smart Navigation routing based on query
    if (q.includes("warga") || q.includes("penduduk")) {
      router.push("/master-admin/warga-users");
    } else if (q.includes("user") || q.includes("admin") || q.includes("pengguna")) {
      router.push("/master-admin/pengguna-sistem");
    } else if (q.includes("wilayah") || q.includes("dusun") || q.includes("rw") || q.includes("rt")) {
      router.push("/master-admin/wilayah");
    } else if (q.includes("umkm") || q.includes("toko") || q.includes("produk")) {
      router.push("/master-admin/umkm");
    } else if (q.includes("gis") || q.includes("peta") || q.includes("spasial")) {
      router.push("/master-admin/gis");
    } else if (q.includes("log") || q.includes("audit") || q.includes("riwayat")) {
      router.push("/master-admin/logs");
    } else if (q.includes("stat") || q.includes("grafik") || q.includes("cache")) {
      router.push("/master-admin/stats");
    } else if (q.includes("template") || q.includes("surat") || q.includes("arsip")) {
      router.push("/master-admin/templates");
    } else if (q.includes("wa") || q.includes("whatsapp")) {
      router.push("/master-admin/whatsapp");
    } else if (q.includes("ai") || q.includes("gemini") || q.includes("kecerdasan")) {
      router.push("/master-admin/ai");
    } else if (q.includes("maint") || q.includes("pemeliharaan") || q.includes("fitur")) {
      router.push("/master-admin/maintenance");
    } else if (q.includes("config") || q.includes("atur") || q.includes("backup")) {
      router.push("/master-admin/config");
    } else {
      router.push(`/master-admin/pengguna-sistem?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="hidden lg:flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-100/90 z-40 shrink-0 select-none">
      {/* 1. Left Brand / Logo (Master Admin Enterprise Identity) */}
      <div className="flex items-center gap-3.5 w-64 xl:w-72 shrink-0">
        <div className="relative w-9 h-9 shrink-0">
          <Image
            src="/images/logo-bogor.png"
            alt="Logo Kabupaten Bogor"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[16px] xl:text-[17px] font-black text-slate-900 tracking-tight leading-none uppercase">
              MASTER ADMIN
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          </div>
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider mt-0.5">
            Kabupaten Bogor
          </span>
        </div>
      </div>

      {/* 2. Center Pill Search Bar (Unified with Admin Desa Mockup Curve) */}
      <div className="flex-1 max-w-xl mx-4">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search size={17} className="absolute left-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari modul, data wilayah, pengguna sistem, atau logs..."
            className="w-full pl-11 pr-16 py-2.5 rounded-full bg-[#f4f7fc] border border-transparent focus:border-blue-600/30 focus:bg-white text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 transition-all outline-none"
          />
          <kbd className="absolute right-3.5 hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200/80 rounded-full shadow-2xs">
            Enter ↵
          </kbd>
        </form>
      </div>

      {/* 3. Right Action Tools & Interactive Profile */}
      <div className="flex items-center gap-2 xl:gap-3 shrink-0">
        {/* Quick Tenant Switcher Badge */}
        {tenants.length > 0 && (
          <div className="hidden xl:block">
            <TenantSwitcher tenants={tenants} />
          </div>
        )}

        {/* System Health / Cache Pill Quick Indicator */}
        <Link
          href="/master-admin/stats"
          title="Status Infrastruktur & Cache"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold hover:bg-emerald-100 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistem Sehat</span>
        </Link>

        {/* Notifications */}
        <button
          onClick={onOpenNotif}
          title="Notifikasi Sistem"
          className="relative w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-[#f4f7fc] transition-all cursor-pointer"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-black flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <Link
          href="/master-admin/config"
          title="Pengaturan Sistem & Keamanan"
          className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-[#f4f7fc] transition-all cursor-pointer"
        >
          <Settings size={18} />
        </Link>

        {/* Profile User Info & Interactive Dropdown Trigger */}
        <div className="relative pl-1">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-[#f4f7fc] transition-all cursor-pointer group"
            title="Menu Admin Master"
          >
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 ring-2 ring-amber-100 group-hover:ring-amber-400 text-white font-black text-sm flex items-center justify-center shadow-md overflow-hidden transition-all shrink-0">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={userName}
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                userName.charAt(0) || "M"
              )}
            </div>
            <div className="hidden xl:flex flex-col text-left pr-1 leading-tight">
              <span className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[120px]">
                {userName}
              </span>
              <span className="text-[10px] font-bold text-amber-600">
                Master Admin
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 hidden xl:block transition-transform duration-200" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsProfileMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-900 truncate">{userName}</p>
                  <p className="text-[11px] text-slate-400 font-medium truncate">{userEmail}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                    Level: Super Administrator
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    href="/master-admin/config"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    <Settings size={15} />
                    <span>Konfigurasi Sistem</span>
                  </Link>
                  <Link
                    href="/master-admin/stats"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    <Activity size={15} />
                    <span>Intelijen & Cache</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut size={15} />
                    <span>Keluar Sistem</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

