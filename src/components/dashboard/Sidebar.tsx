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
  Map
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/master-admin" },
  { name: "User Management", icon: Users, href: "/master-admin/pengguna-sistem" },
  { name: "Pemetaan GIS", icon: Map, href: "/master-admin/gis" },
  { name: "Audit Logs", icon: History, href: "/master-admin/logs" },
  { name: "Data Kependudukan", icon: Database, href: "/master-admin/data" },
  { name: "Multi-Tenant", icon: Building2, href: "/master-admin/tenants" },
  { name: "Statistik", icon: PieChart, href: "/master-admin/stats" },
  { name: "Konfigurasi", icon: Settings, href: "/master-admin/config" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`relative h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50 ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Logo Area */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative w-10 h-10 shrink-0">
            <Image src="/images/logo-bogor.png" alt="Logo" fill className="object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-800 leading-tight">MASTER</span>
              <span className="text-[10px] font-bold text-amber-600 tracking-widest">CONTROL</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
          aria-label={isCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl transition-all group ${
                isActive 
                  ? "bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon size={20} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
              {!isCollapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Area & Logout */}
      <div className="p-4 border-t border-slate-100">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold shadow-sm">
                {session?.user?.name?.charAt(0) || 'M'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-800 truncate">{session?.user?.name || 'Master Admin'}</span>
              <span className="text-xs text-slate-400 truncate">{session?.user?.email || 'admin@cimanggu1.desa.id'}</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={`w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-rose-600 hover:bg-rose-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          aria-label="Keluar / Sign Out"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-semibold">Keluar</span>}
        </button>
      </div>
    </aside>
  );
};
