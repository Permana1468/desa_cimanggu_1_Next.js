"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { TenantSwitcher } from "./TenantSwitcher";
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
  Layers,
  Cpu,
  Bell,
  Map as MapIcon,
  Cloud,
  FileText,
  Brain,
  Store
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/master-admin" },
  { name: "User Management", icon: Users, href: "/master-admin/pengguna-sistem" },
  { name: "Manajemen Warga", icon: Users, href: "/master-admin/warga-users" },
  { name: "Verifikasi UMKM", icon: Store, href: "/master-admin/umkm" },
  { name: "Pemetaan GIS", icon: MapIcon, href: "/master-admin/gis" },
  { name: "Audit Logs", icon: History, href: "/master-admin/logs" },
  { name: "Data Kependudukan", icon: Database, href: "/master-admin/data" },
  { name: "Wilayah & Lembaga", icon: Building2, href: "/master-admin/wilayah" },
  { name: "Statistik", icon: PieChart, href: "/master-admin/stats" },
  { name: "Arsip Template", icon: FileText, href: "/master-admin/templates" },
  { name: "Integrasi Cloud", icon: Cloud, href: "/master-admin/integrasi" },
  { name: "Kecerdasan Buatan", icon: Brain, href: "/master-admin/ai" },
  { name: "Konfigurasi", icon: Settings, href: "/master-admin/config" },
];

export const MasterSidebar = ({ 
  isOpen, 
  setIsOpen,
  tenants = [],
  onOpenNotif
}: { 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void;
  tenants?: any[];
  onOpenNotif?: () => void;
}) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* MOBILE BACKDROP */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-md z-[60] lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside 
        className={`bg-[#0f172a] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col z-[70] shrink-0 shadow-[10px_0_40px_rgba(0,0,0,0.3)]
          fixed inset-y-0 left-0 h-full w-80 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:h-full ${isCollapsed && !isOpen ? 'lg:w-28' : 'lg:w-80'}`}
      >
        {/* LOGO AREA */}
        <div className={`h-24 px-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-4 overflow-hidden">
            <motion.div 
              whileHover={{ rotate: 12, scale: 1.1 }}
              className="w-14 h-14 shrink-0 flex items-center justify-center relative"
            >
              <div className="relative w-full h-full">
                <Image src="/images/logo-bogor.png" alt="Logo Kabupaten Bogor" fill className="object-contain" />
              </div>
            </motion.div>
            {(!isCollapsed || isOpen) && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-xl font-black text-white tracking-tighter leading-none">MASTER</span>
                <span className="text-[10px] font-black text-blue-400 tracking-[0.3em] mt-1">DASHBOARD</span>
              </motion.div>
            )}
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* TENANT SWITCHER AREA */}
        {(!isCollapsed || isOpen) && (
          <div className="px-6 mb-4 flex items-center gap-2">
            <div className="flex-1 p-1 rounded-[1.5rem] bg-white/5 border border-white/5 shadow-inner">
               <TenantSwitcher tenants={tenants} />
            </div>
            <button title="Holographic Map Shortcut" className="w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl bg-white/5 text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-white/5 shadow-sm overflow-hidden group relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <MapIcon size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* NAVIGATION AREA (MAGIC CURVE CONTAINER) */}
        <nav className="flex-1 mt-6 space-y-1 relative pl-6 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-5 px-6 py-4.5 transition-all duration-300 relative z-20 ${
                    isActive 
                      ? "magic-curve-active bg-slate-50 text-slate-900 rounded-l-[2rem] font-black" 
                      : "text-slate-400 hover:text-white font-bold hover:bg-white/5 rounded-l-[2rem]"
                  } ${isCollapsed && !isOpen ? 'justify-center pr-10' : ''}`}
                >
                  <div className={`transition-all duration-500 ${isActive ? 'scale-125 text-blue-600 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'group-hover:scale-110 group-hover:text-blue-400'}`}>
                    <item.icon size={isCollapsed && !isOpen ? 28 : 22} strokeWidth={1.5} />
                  </div>
                  {(!isCollapsed || isOpen) && (
                    <span className="text-sm tracking-tight whitespace-nowrap">{item.name}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <motion.div layoutId="active-pill" className="w-1.5 h-1.5 bg-blue-600 rounded-full ml-auto shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* FOOTER USER AREA */}
        <div className="p-6 mt-auto">
          {!isCollapsed || isOpen ? (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-[1.5rem] bg-white/5 border border-white/5 shadow-2xl backdrop-blur-sm"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black shadow-lg">
                        {session?.user?.name?.charAt(0) || 'M'}
                    </div>
                    <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[11px] font-bold text-white truncate tracking-tight">{session?.user?.name || "Admin"}</span>
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest truncate">Master Admin</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                    <button 
                        onClick={onOpenNotif}
                        title="Notifikasi"
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all relative group"
                    >
                        <Bell size={16} className="group-hover:rotate-12 transition-transform" />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    </button>
                    <button 
                        onClick={() => signOut()}
                        title="Keluar Sistem"
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-4">
                <button 
                    onClick={() => setIsCollapsed(false)}
                    className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/5"
                >
                    <Layers size={22} />
                </button>
                <button 
                    onClick={() => signOut()}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                >
                    <LogOut size={22} />
                </button>
            </div>
          )}

          {/* COLLAPSE TOGGLE */}
          <div className="hidden lg:flex mt-6 justify-center">
              <button 
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-[9px] font-black text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"
              >
                  {isCollapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> MINIMIZE</>}
              </button>
          </div>
          
          <div className="mt-8 flex flex-col items-center justify-center gap-3">
             {(!isCollapsed || isOpen) && (
               <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">System Health: 98.9%</span>
               </div>
             )}
             <div className="flex items-center gap-2 opacity-20">
                <Cpu size={10} className="text-white" />
                <span className="text-[7px] font-black text-white tracking-[0.3em]">ENGINE v2.0</span>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};
