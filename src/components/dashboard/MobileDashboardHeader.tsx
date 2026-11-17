"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Bell, LogOut, Camera, KeyRound } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useNotifications } from "@/hooks/useNotifications";
import { GlobalNotificationPanel } from "./GlobalNotificationPanel";
import { QuickProfileModal } from "./QuickProfileModal";

export function MobileDashboardHeader({ session: initialSession }: { session: any }) {
  const { data: clientSession } = useSession();
  const session = clientSession || initialSession;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"photo" | "password" | null>(null);
  const { unreadCount } = useNotifications();

  const userRole = (session?.user as any)?.role || "ADMIN";
  const userName = session?.user?.name || "Admin Desa";

  return (
    <>
      <header className="lg:hidden shrink-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between sticky top-0 z-30 shadow-xs print:hidden no-print">
        {/* Left: Logo & Village Identity */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
            <Image
              src="/images/logo-bogor.png"
              alt="Logo Desa"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 tracking-tight leading-tight truncate">
              Desa Cimanggu I
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                {userRole.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Notifications & Profile Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Button */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
            title="Pusat Notifikasi"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`w-9 h-9 rounded-full ${
                userRole === 'POSYANDU' ? 'bg-emerald-700 ring-emerald-100' : 'bg-[#1d64ec] ring-blue-100'
              } text-white overflow-hidden flex items-center justify-center font-extrabold text-xs active:scale-95 transition-all shadow-sm ring-2`}
            >
              {session?.user?.photo ? (
                <Image
                  src={session.user.photo}
                  alt={userName}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2.5 border-b border-slate-100">
                    <p className="text-xs font-black text-slate-900 truncate">{userName}</p>
                    <p className="text-[10px] font-medium text-slate-400 truncate">{session?.user?.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full ${
                      userRole === 'POSYANDU' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-[#1d64ec]'
                    } text-[9px] font-bold uppercase`}>
                      {userRole}
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveModalTab("photo");
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Camera size={14} className="text-[#1d64ec]" />
                      <span>Ganti Foto Profil</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveModalTab("password");
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <KeyRound size={14} className="text-amber-500" />
                      <span>Ganti Password</span>
                    </button>
                  </div>

                  <div className="h-px bg-slate-100 my-1" />

                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut size={14} />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Notification Panel Drawer */}
      <GlobalNotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Quick Profile & Password Modal */}
      <QuickProfileModal
        isOpen={Boolean(activeModalTab)}
        onClose={() => setActiveModalTab(null)}
        initialTab={activeModalTab || "photo"}
        session={session}
      />
    </>
  );
}
