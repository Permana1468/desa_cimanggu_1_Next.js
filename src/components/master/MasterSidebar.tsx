"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Users, 
  History, 
  Database, 
  Settings, 
  PieChart, 
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/master-admin" },
  { name: "User Management", icon: Users, href: "/master-admin/pengguna-sistem" },
  { name: "Audit Logs", icon: History, href: "/master-admin/logs" },
  { name: "Data Kependudukan", icon: Database, href: "/master-admin/data" },
  { name: "Wilayah & Lembaga", icon: Building2, href: "/master-admin/wilayah" },
  { name: "Statistik", icon: PieChart, href: "/master-admin/stats" },
  { name: "Konfigurasi", icon: Settings, href: "/master-admin/config" },
];

export const MasterSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 lg:static bg-white border-r border-slate-200 transition-all duration-500 flex flex-col z-[70] 
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72 shadow-2xl lg:shadow-none`}
      >
        {/* Logo Area */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center bg-amber-500 rounded-[1.25rem] shadow-lg shadow-amber-500/20 rotate-3 group-hover:rotate-0 transition-transform">
              <div className="relative w-8 h-8">
                <Image src="/images/logo-bogor.png" alt="Logo" fill className="object-contain brightness-0 invert" />
              </div>
            </div>
            {(!isCollapsed || isOpen) && (
              <div className="flex flex-col">
                <span className="text-lg font-black text-slate-900 tracking-tighter leading-none">MASTER</span>
                <span className="text-[10px] font-black text-amber-600 tracking-[0.3em] mt-0.5">CONTROL</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all active:scale-90 shadow-sm"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all group relative overflow-hidden ${
                  isActive 
                    ? "bg-slate-950 text-white font-black shadow-xl shadow-slate-950/20" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900 font-bold"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-amber-500 rounded-r-full" />
                )}
                <item.icon size={22} className={`${isActive ? "text-amber-500" : "group-hover:text-blue-600"} transition-all`} />
                {(!isCollapsed || isOpen) && <span className="text-sm tracking-tight">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Area & Logout */}
        <div className="p-6 border-t border-slate-50 bg-slate-50/30">
          {(!isCollapsed || isOpen) && (
            <div className="flex items-center gap-4 px-3 mb-6 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/20">
                  {session?.user?.name?.charAt(0) || 'M'}
              </div>
              <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black text-slate-900 truncate tracking-tight">{session?.user?.name || "Master Admin"}</span>
                  <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Online
                  </span>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => signOut()}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all font-black text-sm group ${isCollapsed && !isOpen ? 'justify-center' : ''}`}
          >
            <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
            {(!isCollapsed || isOpen) && <span className="tracking-tight">Keluar Sistem</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

