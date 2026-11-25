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
  Store,
  MessageCircle,
  Wrench,
  Activity,
  HardDrive,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Radio
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Categorized Master Navigation Groups (Mirrors Admin Desa's Structured Experience)
const masterMenuGroups = [
  {
    category: "Pusat Kendali",
    items: [
      { name: "Overview", icon: LayoutDashboard, href: "/master-admin" },
      { name: "Statistik", icon: PieChart, href: "/master-admin/stats" },
      { name: "Pemetaan GIS", icon: MapIcon, href: "/master-admin/gis" },
    ],
  },
  {
    category: "Pengguna & UMKM",
    items: [
      { name: "User Management", icon: Users, href: "/master-admin/pengguna-sistem" },
      { name: "Manajemen Warga", icon: Users, href: "/master-admin/warga-users" },
      { name: "Verifikasi UMKM", icon: Store, href: "/master-admin/umkm" },
    ],
  },
  {
    category: "Wilayah & Data",
    items: [
      { name: "Wilayah & Lembaga", icon: Building2, href: "/master-admin/wilayah" },
      { name: "Data Kependudukan", icon: Database, href: "/master-admin/data" },
      { name: "Arsip Template", icon: FileText, href: "/master-admin/templates" },
    ],
  },
  {
    category: "Integrasi & AI",
    items: [
      { name: "Integrasi Cloud", icon: Cloud, href: "/master-admin/integrasi" },
      { name: "Integrasi WhatsApp", icon: MessageCircle, href: "/master-admin/whatsapp" },
      { name: "Kecerdasan Buatan", icon: Brain, href: "/master-admin/ai" },
    ],
  },
  {
    category: "Sistem & Keamanan",
    items: [
      { name: "Keamanan Siber", icon: ShieldAlert, href: "/master-admin/keamanan", badge: "C++ & Py" },
      { name: "Audit Logs", icon: History, href: "/master-admin/logs" },
      { name: "Mode Pemeliharaan", icon: Wrench, href: "/master-admin/maintenance" },
      { name: "Konfigurasi", icon: Settings, href: "/master-admin/config" },
    ],
  },
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
        className={`bg-[#0f172a] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col z-[70] shrink-0 border-r border-slate-800/80 shadow-2xl
          fixed inset-y-0 left-0 h-full w-[85vw] max-w-[300px] sm:w-72 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:h-full ${isCollapsed && !isOpen ? 'lg:w-24' : 'lg:w-72'}`}
      >
        {/* MOBILE SIDEBAR HEADER */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/5 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 shrink-0">
              <Image src="/images/logo-bogor.png" alt="Logo" fill className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white leading-none">MASTER ADMIN</span>
              <span className="text-[9px] font-bold text-blue-400 tracking-wider mt-0.5">Kabupaten Bogor</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            aria-label="Tutup Menu"
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ACTION PILL BUTTON (MIRRORS ADMIN DESA '+ BUAT SURAT BARU' ACTION BUTTON) */}
        {(!isCollapsed || isOpen) && (
          <div className="px-4 pt-3 pb-1">
            <Link
              href="/master-admin/pengguna-sistem"
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-blue-600 rounded-full font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>KELOLA PENGGUNA</span>
            </Link>
          </div>
        )}

        {/* TENANT SWITCHER (FOR COMPACT / MOBILE / EXPANDED) */}
        {(!isCollapsed || isOpen) && (
          <div className="px-4 pt-2 pb-2">
            <div className="p-1 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
              <TenantSwitcher tenants={tenants} />
            </div>
          </div>
        )}

        {/* CATEGORIZED NAVIGATION (MATCHING ADMIN DESA SIDEBAR STRUCTURE) */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto custom-scrollbar overflow-x-hidden select-none">
          {masterMenuGroups.map((group, groupIdx) => (
            <div key={group.category} className="space-y-1">
              {/* Category Section Header */}
              <div className={`pb-1 px-3 ${groupIdx > 0 ? "pt-2" : "pt-0"}`}>
                {isCollapsed && !isOpen ? (
                  groupIdx > 0 ? <div className="h-[1px] w-full my-1.5 bg-white/10" /> : null
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                      {group.category}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-slate-400">
                      {group.items.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.href === "/master-admin" 
                    ? pathname === "/master-admin"
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setIsOpen(false)}
                      title={isCollapsed ? item.name : undefined}
                      className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl transition-all duration-200 group text-xs sm:text-sm ${
                        isActive
                          ? "bg-blue-600 text-white font-black shadow-lg shadow-blue-600/30"
                          : "text-slate-400 hover:text-white hover:bg-white/10 font-bold"
                      } ${isCollapsed && !isOpen ? 'justify-center px-2' : ''}`}
                    >
                      <item.icon 
                        size={18} 
                        className={`shrink-0 transition-transform ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110 group-hover:text-blue-400'}`} 
                      />
                      {(!isCollapsed || isOpen) && (
                        <span className="truncate tracking-tight">{item.name}</span>
                      )}
                      {(item as any).badge && (!isCollapsed || isOpen) && (
                        <span className="ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {(item as any).badge}
                        </span>
                      )}
                      {isActive && (!isCollapsed || isOpen) && !(item as any).badge && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white ml-auto shadow-xs" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* CCTV SENTRY CYBER SENTINEL WIDGET (VISUALISASI SIMPUL & OTAK KEAMANAN PROYEK) */}
        {(!isCollapsed || isOpen) ? (
          <div className="px-3 pt-2 pb-1">
            <Link 
              href="/master-admin/keamanan"
              className="block relative p-3 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900 to-cyan-950/80 border border-cyan-500/30 shadow-lg shadow-cyan-950/40 hover:border-cyan-400 transition-all group overflow-hidden"
            >
              {/* Laser Scanning Line Animation */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                    <Eye size={13} className="animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-cyan-200 leading-tight">
                      SENTRY CCTV BRAIN
                    </h5>
                    <p className="text-[8px] font-medium text-slate-400">
                      Otak Pengawas Siber Realtime
                    </p>
                  </div>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
              </div>

              {/* 12-Node Micro Visual Mesh Matrix */}
              <div className="bg-slate-950/60 rounded-xl p-2 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-slate-400 font-medium">12 Simpul Proyek:</span>
                  <span className="text-emerald-400 font-mono font-bold">12/12 Terkoneksi</span>
                </div>
                {/* 12 Mesh Node Dots */}
                <div className="grid grid-cols-6 gap-1 pt-0.5">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className="h-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_6px_rgba(34,211,238,0.8)]" 
                      title={`Simpul ${idx + 1} Terproteksi`} 
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[8px] font-mono font-bold text-slate-300 pt-1 border-t border-white/5">
                <span className="text-cyan-300">C++ WAF & Python AI</span>
                <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">RADAR TOPOLOGI &rarr;</span>
              </div>
            </Link>
          </div>
        ) : (
          <div className="px-2 py-1 flex justify-center">
            <Link
              href="/master-admin/keamanan"
              title="Sentry CCTV Brain: 12 Simpul Terkoneksi (C++ & Python)"
              className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-all flex items-center justify-center relative group"
            >
              <Eye size={16} className="animate-pulse" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </Link>
          </div>
        )}

        {/* BOTTOM HARMONIZED STATUS WIDGET (MATCHING ADMIN DESA ERGONOMICS) */}
        <div className="p-3 border-t border-white/5 space-y-2 mt-auto">
          {(!isCollapsed || isOpen) ? (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity size={12} className="text-emerald-400" /> STATUS MASTER
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
              </div>
              
              <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Infrastruktur:</span>
                  <span className="font-bold text-emerald-400">C++ & Python Aktif</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Node Engine:</span>
                  <span className="font-mono text-[10px] text-blue-300">v2.0 (Turbopack)</span>
                </div>
              </div>

              {/* Real-time status progress indicators (Exact match to Village Admin Status Bar) */}
              <div className="space-y-2 pt-2 border-t border-white/10 text-[10px]">
                <div>
                  <div className="flex justify-between text-slate-400 font-bold mb-1">
                    <span>Kapasitas Memori</span>
                    <span className="text-emerald-400 font-mono">Stabil</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[45%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 font-bold mb-1">
                    <span>Sampah Cache</span>
                    <span className="text-blue-300 font-mono">Terkontrol</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full w-[28%]" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
            </div>
          )}

          {/* COLLAPSE / EXPAND TOGGLE BUTTON */}
          <div className="hidden lg:flex justify-center pt-1">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> <span>MINIMIZE</span></>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
