"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Settings, 
  SlidersHorizontal, 
  Camera, 
  KeyRound, 
  LogOut, 
  ChevronDown, 
  UserCheck 
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useNotifications } from "@/hooks/useNotifications";
import { GlobalNotificationPanel } from "@/components/dashboard/GlobalNotificationPanel";
import { QuickProfileModal } from "@/components/dashboard/QuickProfileModal";
import { SystemHelpModal } from "@/components/dashboard/SystemHelpModal";
import { DisplayPreferencesModal } from "@/components/dashboard/DisplayPreferencesModal";

interface DesktopDashboardHeaderProps {
  session: any;
}

export function DesktopDashboardHeader({ session }: DesktopDashboardHeaderProps) {
  const { data: clientSession } = useSession();
  const currentSession = clientSession || session;
  const { unreadCount } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"photo" | "password" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const user = currentSession?.user;
  const userName = (user?.name || "Admin Desa").trim();
  const nameLower = userName.toLowerCase();
  const userEmail = (user?.email || "").toLowerCase();
  const baseRole = String(user?.role || "ADMIN_DESA").toUpperCase();
  const userRole = (user?.role || "ADMIN_DESA").replace(/_/g, " ");
  const userRt = (user as any)?.rt;
  const userRw = (user as any)?.rw;

  let brandTitle = "ADMIN DESA";
  if (
    baseRole === "KASI_PELAYANAN" ||
    (baseRole === "KASI" && (userEmail.includes("pelayanan") || nameLower.includes("pelayanan"))) ||
    nameLower.includes("pelayanan")
  ) {
    brandTitle = "KASI PELAYANAN";
  } else if (
    baseRole === "KASI_PEMERINTAHAN" ||
    (baseRole === "KASI" && (userEmail.includes("pemerintahan") || nameLower.includes("pemerintahan"))) ||
    nameLower.includes("pemerintahan")
  ) {
    brandTitle = "KASI PEMERINTAHAN";
  } else if (
    baseRole === "KASI_KESEJAHTERAAN" ||
    (baseRole === "KASI" && (userEmail.includes("kesejahteraan") || userEmail.includes("kesra") || nameLower.includes("kesejahteraan") || nameLower.includes("kesra"))) ||
    nameLower.includes("kesejahteraan") ||
    nameLower.includes("kesra")
  ) {
    brandTitle = "KASI KESEJAHTERAAN";
  } else if (
    baseRole === "KAUR_KEUANGAN" ||
    (baseRole === "KAUR" && (userEmail.includes("keuangan") || nameLower.includes("keuangan"))) ||
    nameLower.includes("keuangan")
  ) {
    brandTitle = "KEUANGAN DESA";
  } else if (
    baseRole === "KAUR_PERENCANAAN" ||
    (baseRole === "KAUR" && (userEmail.includes("perencanaan") || nameLower.includes("perencanaan"))) ||
    nameLower.includes("perencanaan")
  ) {
    brandTitle = "PERENCANAAN DESA";
  } else if (
    baseRole === "KAUR_TU" ||
    (baseRole === "KAUR" && (userEmail.includes("tu") || userEmail.includes("umum") || nameLower.includes("tata usaha") || nameLower.includes("umum"))) ||
    nameLower.includes("tata usaha")
  ) {
    brandTitle = "TATA USAHA DESA";
  } else if (baseRole === "RT" || nameLower.includes("ketua rt") || nameLower.startsWith("rt ")) {
    brandTitle = userRt ? `KETUA RT ${userRt}` : (userName ? userName.toUpperCase() : "KETUA RT");
  } else if (baseRole === "RW" || nameLower.includes("ketua rw") || nameLower.startsWith("rw ")) {
    brandTitle = userRw ? `KETUA RW ${userRw}` : (userName ? userName.toUpperCase() : "KETUA RW");
  } else if (baseRole === "KADUS" || nameLower.includes("kadus") || nameLower.includes("dusun")) {
    brandTitle = userRw ? `KEPALA DUSUN ${userRw}` : "KEPALA DUSUN";
  } else if (baseRole === "BPD" || nameLower.includes("bpd")) {
    brandTitle = "BPD DESA";
  } else if (baseRole === "LPM" || nameLower.includes("lpm")) {
    brandTitle = "LPM DESA";
  } else if (["TP_PKK", "PKK"].includes(baseRole) || nameLower.includes("pkk")) {
    brandTitle = "TP PKK DESA";
  } else if (baseRole === "POSYANDU" || nameLower.includes("posyandu")) {
    brandTitle = "POSYANDU DESA";
  } else if (baseRole === "KARANG_TARUNA" || nameLower.includes("karang taruna") || nameLower.includes("katar")) {
    brandTitle = "KARANG TARUNA";
  } else if (baseRole === "PUSKESOS" || nameLower.includes("puskesos")) {
    brandTitle = "PUSKESOS SLRT";
  } else if (baseRole === "BUMDES" || nameLower.includes("bumdes")) {
    brandTitle = "BUMDES DESA";
  } else if (baseRole === "KADES" || nameLower.includes("kepala desa") || nameLower.includes("kades")) {
    brandTitle = "KEPALA DESA";
  } else if (baseRole === "SEKDES" || nameLower.includes("sekretaris desa") || nameLower.includes("sekdes")) {
    brandTitle = "SEKRETARIS DESA";
  } else if (["ADMIN_DESA", "ADMIN_MASTER", "OPERATOR_DESA"].includes(baseRole)) {
    brandTitle = "ADMIN DESA";
  } else {
    brandTitle = "ADMIN DESA";
  }

  const brandLogo = (baseRole === "KARANG_TARUNA" || nameLower.includes("karang taruna") || nameLower.includes("katar"))
    ? "/images/logo-katar.png" 
    : (baseRole === "PUSKESOS" || nameLower.includes("puskesos"))
    ? "/images/PUSKESOS-1.png" 
    : "/images/logo-bogor.png";

  return (
    <>
      <header className="hidden lg:flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-100/90 z-40 shrink-0 select-none print:hidden no-print">
        {/* 1. Left Brand / Logo (Dynamic Role Matching) */}
        <div className="flex items-center gap-3.5 w-64 xl:w-72 shrink-0">
          <div className="relative w-9 h-9 shrink-0">
            <Image
              src={brandLogo}
              alt="Logo Desa"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[16px] xl:text-[17px] font-black text-slate-900 tracking-tight leading-none uppercase">
                {brandTitle}
              </span>
            </div>
            <span className={`text-[10px] font-extrabold ${baseRole === 'POSYANDU' ? 'text-emerald-600' : 'text-[#1d64ec]'} uppercase tracking-wider mt-0.5`}>
              Desa Cimanggu I
            </span>
          </div>
        </div>

        {/* 2. Center Pill Search Bar (Organic Mockup Curve) */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative flex items-center">
            <Search size={17} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berkas, data warga, surat, atau agenda..."
              className={`w-full pl-11 pr-16 py-2.5 rounded-full bg-[#f4f7fc] border border-transparent ${
                baseRole === 'POSYANDU' ? 'focus:border-emerald-600/30' : 'focus:border-[#1d64ec]/30'
              } focus:bg-white text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 transition-all outline-none`}
            />
            <kbd className="absolute right-3.5 hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200/80 rounded-full shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* 3. Right Action Tools & Interactive Profile */}
        <div className="flex items-center gap-2 xl:gap-3 shrink-0">
          {/* Notifications */}
          <button
            onClick={() => setIsNotifOpen(true)}
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

          {/* Help & Guide Modal Trigger */}
          <button
            onClick={() => setIsHelpOpen(true)}
            title="Pusat Panduan & Bantuan Sistem"
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-[#f4f7fc] transition-all cursor-pointer"
          >
            <HelpCircle size={18} />
          </button>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            title="Pengaturan Akun & Sistem"
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-[#f4f7fc] transition-all cursor-pointer"
          >
            <Settings size={18} />
          </Link>

          {/* Profile User Info & Interactive Dropdown Trigger */}
          <div className="relative pl-1">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-[#f4f7fc] transition-all cursor-pointer group"
              title="Menu Profil & Keamanan Akun"
            >
              <div className={`relative w-9 h-9 rounded-full ${
                baseRole === 'POSYANDU' ? 'bg-emerald-700 ring-emerald-100 group-hover:ring-emerald-600' : 'bg-[#1d64ec] ring-blue-100 group-hover:ring-[#1d64ec]'
              } text-white font-black text-sm flex items-center justify-center shadow-md overflow-hidden ring-2 transition-all shrink-0`}>
                {user?.photo ? (
                  <Image
                    src={user.photo}
                    alt={userName}
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <span>{userName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="text-left hidden xl:block pr-1">
                <span className={`block text-xs font-bold text-slate-800 leading-tight ${
                  baseRole === 'POSYANDU' ? 'group-hover:text-emerald-700' : 'group-hover:text-[#1d64ec]'
                } transition-colors`}>
                  {userName}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {userRole}
                </span>
              </div>

              <ChevronDown
                size={14}
                className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 hidden xl:block ${
                  isProfileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Card Header */}
                  <div className="p-3 bg-[#f4f7fc] rounded-2xl flex items-center gap-3 mb-1.5">
                    <div className={`w-10 h-10 rounded-full ${
                      baseRole === 'POSYANDU' ? 'bg-emerald-700' : 'bg-[#1d64ec]'
                    } text-white font-black text-sm flex items-center justify-center shadow-md overflow-hidden shrink-0 ring-2 ring-white`}>
                      {user?.photo ? (
                        <Image
                          src={user.photo}
                          alt={userName}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <span>{userName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 truncate">{userName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full ${
                        baseRole === 'POSYANDU' ? 'bg-emerald-100/70 text-emerald-800' : 'bg-blue-100/70 text-[#1d64ec]'
                      } text-[9px] font-black uppercase tracking-wider`}>
                        {userRole}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions List */}
                  <div className="space-y-0.5 py-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setActiveModalTab("photo");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#1d64ec] hover:bg-blue-50/80 transition-all cursor-pointer text-left"
                    >
                      <Camera size={15} className="text-[#1d64ec]" />
                      <span>Ganti Foto Profil</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setActiveModalTab("password");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#1d64ec] hover:bg-blue-50/80 transition-all cursor-pointer text-left"
                    >
                      <KeyRound size={15} className="text-amber-500" />
                      <span>Reset / Ganti Password</span>
                    </button>

                    <Link
                      href="/dashboard/settings?tab=profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#1d64ec] hover:bg-blue-50/80 transition-all cursor-pointer text-left"
                    >
                      <UserCheck size={15} className="text-emerald-500" />
                      <span>Pengaturan Lengkap</span>
                    </Link>
                  </div>

                  <div className="h-px bg-slate-100 my-1" />

                  {/* Sign Out */}
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut size={15} />
                    <span>Keluar Sistem</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sliders / Display Preferences Toggle */}
          <button
            onClick={() => setIsPreferencesOpen(true)}
            title="Preferensi Tampilan & Sistem"
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-[#f4f7fc] transition-all cursor-pointer ml-0.5"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </header>

      {/* Global Notification Panel Drawer */}
      <GlobalNotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Quick Profile & Password Modal */}
      <QuickProfileModal
        isOpen={Boolean(activeModalTab)}
        onClose={() => setActiveModalTab(null)}
        initialTab={activeModalTab || "photo"}
        session={currentSession}
      />

      {/* System Help & Guide Modal */}
      <SystemHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Display & System Preferences Modal */}
      <DisplayPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </>
  );
}
