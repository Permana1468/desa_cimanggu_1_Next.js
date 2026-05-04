"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  UserCircle, 
  Gavel, 
  Store, 
  Building2, 
  Users, 
  Wallet, 
  MessageSquare, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Database
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Pusat Persuratan", icon: FileText, href: "/dashboard/surat" },
  { name: "Data Kependudukan", icon: Database, href: "/dashboard/warga" },
  { name: "Profil Desa", icon: UserCircle, href: "/dashboard/profil" },
  { name: "Aparatur Desa", icon: Users, href: "/dashboard/aparatur" },
  { name: "Kelembagaan", icon: Building2, href: "/dashboard/kelembagaan" },
  { name: "BUMDES", icon: Store, href: "/dashboard/bumdes" },
  { name: "Pengaturan", icon: Settings, href: "/dashboard/settings" },
];

export const VillageSidebar = () => {
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
              <span className="text-sm font-black text-slate-800 leading-tight uppercase">{(session?.user as any)?.role || "ADMIN"}</span>
              <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">{(session?.user as any)?.role === "ADMIN_DESA" ? "DESA" : "WILAYAH"}</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.filter(item => {
          const role = (session?.user as any)?.role;
          // Roles with full access
          if (["ADMIN_DESA", "KADES", "SEKDES", "KASI", "KAUR"].includes(role as string)) return true;
          
          // Institutional roles with limited access
          if (["RT", "RW", "PKK", "POSYANDU", "LPM", "BPD", "KADUS", "KARANG_TARUNA"].includes(role as string)) {
             return ["Dashboard", "Pusat Persuratan", "Data Kependudukan"].includes(item.name);
          }
          return false;
        }).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20" 
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
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shadow-sm">
                {session?.user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate">{session?.user?.name || "Admin Desa"}</span>
                <span className="text-[10px] text-emerald-600 font-medium truncate">Desa Cimanggu I</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => signOut()}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm">Keluar</span>}
        </button>
      </div>
    </aside>
  );
};
