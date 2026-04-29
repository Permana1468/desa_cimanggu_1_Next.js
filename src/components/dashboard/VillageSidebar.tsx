"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Database, 
  PieChart, 
  Settings,
  Home,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { name: "Beranda", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Kependudukan", icon: Database, href: "/dashboard/kependudukan" },
  { name: "Layanan Surat", icon: FileText, href: "/dashboard/surat" },
  { name: "Data Warga", icon: Users, href: "/dashboard/warga" },
  { name: "Statistik Desa", icon: PieChart, href: "/dashboard/statistik" },
  { name: "Aspirasi", icon: MessageSquare, href: "/dashboard/aspirasi" },
  { name: "Pengaturan", icon: Settings, href: "/dashboard/settings" },
];

export const VillageSidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`relative h-screen bg-[#0b1120] border-r border-white/5 transition-all duration-300 flex flex-col z-50 ${isCollapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
          <Home className="text-white" size={24} />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-tight text-lg leading-tight">ADMIN DESA</span>
            <span className="text-blue-400 text-[10px] font-bold tracking-[0.2em] uppercase">Cimanggu I Portal</span>
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
                  ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/10" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={22} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
              {!isCollapsed && <span className="text-sm">{item.name}</span>}
              {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
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
