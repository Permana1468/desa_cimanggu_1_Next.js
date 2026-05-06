"use client";

import { Bell, Search, User, LogOut, Settings } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export const DashboardHeader = () => {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="h-20 border-b border-white/5 bg-[#0b1120]/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-4 top-3 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Cari data, laporan, atau user..."
          className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[#0b1120] rounded-full text-[10px] text-white flex items-center justify-center font-bold">3</span>
        </button>

        <div className="h-8 w-px bg-white/5 mx-2" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
              <User className="text-slate-400" size={24} />
            </div>
            <div className="hidden lg:flex flex-col items-start">
              <span className="text-sm font-bold text-white leading-none mb-1">{session?.user?.name || "Admin Master"}</span>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{(session?.user as any)?.role || "Master"}</span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-4 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in duration-200">
              <Link href="/master-admin/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                <User size={18} />
                <span className="text-sm">Profil Saya</span>
              </Link>
              <Link href="/master-admin/config" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                <Settings size={18} />
                <span className="text-sm">Pengaturan</span>
              </Link>
              <div className="h-px bg-white/5 my-2 mx-2" />
              <button 
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={18} />
                <span className="text-sm font-bold">Keluar Sistem</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import Link from "next/link";
