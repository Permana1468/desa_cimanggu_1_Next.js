"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  History, 
  Database, 
  Settings, 
  PieChart, 
  Building2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/master-admin" },
  { name: "User Management", icon: Users, href: "/master-admin/users" },
  { name: "Audit Logs", icon: History, href: "/master-admin/logs" },
  { name: "Data Kependudukan", icon: Database, href: "/master-admin/data" },
  { name: "Multi-Tenant", icon: Building2, href: "/master-admin/tenants" },
  { name: "Statistik", icon: PieChart, href: "/master-admin/stats" },
  { name: "Konfigurasi", icon: Settings, href: "/master-admin/config" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`relative h-screen bg-[#0b1120] border-r border-white/5 transition-all duration-300 flex flex-col z-50 ${isCollapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-4">
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
          <ShieldAlert className="text-slate-900" size={24} />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-tight text-lg leading-tight">MASTER</span>
            <span className="text-amber-500 text-[10px] font-bold tracking-[0.2em] uppercase">Control Panel</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? "bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/10" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={22} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
              {!isCollapsed && <span className="text-sm">{item.name}</span>}
              {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 bg-slate-900 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
        >
          {isCollapsed ? <ChevronRight size={22} /> : (
            <>
              <ChevronLeft size={22} />
              <span className="text-sm font-medium">Sembunyikan Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
