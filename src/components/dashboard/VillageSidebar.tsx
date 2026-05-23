"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  UserCircle, 
  Store, 
  Building2, 
  Users, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Database,
  Menu,
  Bell,
  Banknote,
  Clock,
  Map,
  HardHat,
  Activity,
  PieChart,
  Archive,
  Sparkles,
  Milestone,
  Megaphone,
  AlertCircle,
  Package,
  Compass,
  HeartHandshake
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Pusat Persuratan", icon: FileText, href: "/dashboard/surat" },
  { name: "Data Kependudukan", icon: Database, href: "/dashboard/warga" },
  { name: "Profil Desa", icon: UserCircle, href: "/dashboard/profil" },
  { name: "Aparatur Desa", icon: Users, href: "/dashboard/aparatur" },
  { name: "Kelembagaan", icon: Building2, href: "/dashboard/kelembagaan" },
  { name: "BUMDES", icon: Store, href: "/dashboard/bumdes" },
  { name: "Infrastruktur", icon: HardHat, href: "/dashboard/infrastruktur" },
  { name: "Usulan Dana", icon: Banknote, href: "/dashboard/finance" },
  { name: "APBDes", icon: PieChart, href: "/dashboard/apbdes" },
  { name: "Peta Interaktif", icon: Map, href: "/dashboard/map" },
  { name: "Arsip Digital", icon: Archive, href: "/dashboard/arsip" },
  { name: "Data Bansos", icon: HeartHandshake, href: "/dashboard/bansos" },
  { name: "Monitoring", icon: Activity, href: "/dashboard/monitoring" },
  { name: "Tracking Layanan", icon: Clock, href: "/dashboard/tracking" },
  { name: 'Pengaturan', icon: Settings, href: '/dashboard/settings' },
];

export const VillageSidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* MOBILE BACKDROP */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR CONTAINER */}
      <aside 
        className={`bg-white transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col z-[70] shrink-0 border-r border-slate-200
          fixed inset-y-0 left-0 h-full w-72 ${isOpen ? 'translate-x-0 shadow-[10px_0_40px_rgba(0,0,0,0.15)]' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:h-full ${isCollapsed && !isOpen ? 'lg:w-20' : 'lg:w-72'}
        `}
      >
        {/* Logo Area */}
        <div className={`p-6 flex items-center ${isCollapsed && !isOpen ? 'justify-center' : 'justify-between'} h-24`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-10 h-10 shrink-0">
              <Image src="/images/logo-bogor.png" alt="Logo" fill className="object-contain" />
            </div>
            {(!isCollapsed || isOpen) && (
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-800 leading-tight uppercase">{session?.user?.role?.replace('_', ' ') || "ADMIN"}</span>
                <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Desa Cimanggu I</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1.5 mt-2 overflow-y-auto custom-scrollbar">
          {(() => {
            const role = session?.user?.role;
            const searchParams = useSearchParams();
            const tabParam = searchParams.get("tab");

            let itemsToRender = menuItems.filter(item => {
              if (["ADMIN_DESA", "KADES", "SEKDES", "KASI", "KAUR", "PERANGKAT_DESA", "OPERATOR_DESA", "ADMIN_MASTER"].includes(role as string)) return true;
              if (["PKK", "TP_PKK", "POSYANDU", "LPM", "BPD", "KADUS", "KARANG_TARUNA", "PUSKESOS", "PETUGAS_SENSUS"].includes(role as string)) {
                 return ["Dashboard", "Pusat Persuratan", "Data Kependudukan", "Usulan Dana", "Tracking Layanan", "Peta Interaktif"].includes(item.name);
              }
              if (role === "BUMDES") {
                 return ["Dashboard", "BUMDES"].includes(item.name);
              }
              return false;
            });

            if (role === "RT" || role === "RW") {
              itemsToRender = [
                { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard?tab=overview" },
                { name: "Data Warga", icon: Users, href: "/dashboard?tab=warga" },
                { name: "Kas Keuangan", icon: Banknote, href: "/dashboard?tab=finance" },
                { name: "Cek Surat", icon: FileText, href: "/dashboard?tab=surat" },
                { name: "Laporan Kegiatan", icon: Sparkles, href: "/dashboard?tab=kegiatan" },
                { name: "Laporan LAMPID", icon: Milestone, href: "/dashboard?tab=lampid" },
                { name: "Pengumuman", icon: Megaphone, href: "/dashboard?tab=announcements" },
                { name: "Aduan Warga", icon: AlertCircle, href: "/dashboard?tab=complaints" },
                { name: "Inventaris RT", icon: Package, href: "/dashboard?tab=inventory" },
                { name: "GeoSENSUS", icon: Compass, href: "/dashboard?tab=geosensus" },
                { name: "Data Bansos", icon: HeartHandshake, href: "/dashboard?tab=bansos" }
              ];
            }

            return itemsToRender.map((item) => {
              const isInstitutional = ["PKK", "TP_PKK", "POSYANDU", "LPM", "BPD", "KARANG_TARUNA", "PUSKESOS", "PETUGAS_SENSUS"].includes(role as string);
              
              // Map dashboard links to kelembagaan links for institutional roles
              let href = item.href;
              if (isInstitutional) {
                  if (href === "/dashboard") href = "/kelembagaan";
                  else href = href.replace("/dashboard/", "/kelembagaan/");
              }

              let isActive = false;
              if (role === "RT" || role === "RW") {
                const urlTab = tabParam || "overview";
                const itemTab = item.href.split("tab=")[1] || "overview";
                isActive = pathname === "/dashboard" && urlTab === itemTab;
              } else {
                isActive = pathname === href;
              }

              return (
                <Link
                  key={item.name}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  } ${isCollapsed && !isOpen ? 'justify-center' : ''}`}
                >
                  <item.icon size={20} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
                  {(!isCollapsed || isOpen) && <span className="text-sm">{item.name}</span>}
                </Link>
              );
            });
          })()}
        </nav>

        {/* User Area & Logout (Compact Aesthetic Design) */}
        <div className="p-4 mt-auto">
          {(!isCollapsed || isOpen) ? (
             <div className="flex items-center justify-between p-3 rounded-[1.25rem] bg-slate-50 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-md">
                        {session?.user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[11px] font-bold text-slate-800 truncate tracking-tight">{session?.user?.name || "Aparatur Desa"}</span>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest truncate">Cimanggu I</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                    <button 
                        title="Notifikasi"
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all relative group"
                    >
                        <Bell size={16} className="group-hover:rotate-12 transition-transform" />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                    </button>
                    <button 
                        onClick={() => signOut()}
                        title="Keluar Sistem"
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button 
                title="Notifikasi"
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all relative"
              >
                  <Bell size={18} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse border-2 border-white" />
              </button>
              <button 
                onClick={() => signOut()}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION DOCK */}
      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-[320px]">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 p-2.5 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] flex items-center justify-between">
              
              {/* MENU BUTTON */}
              <button 
                  onClick={() => setIsOpen(true)}
                  className="w-12 h-12 flex flex-col items-center justify-center gap-1 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all group"
              >
                  <Menu size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-bold tracking-widest uppercase">Menu</span>
              </button>

              {/* CENTER DASHBOARD BUTTON */}
              <Link 
                  href="/dashboard"
                  className="relative group -mt-10"
              >
                  <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>
                  <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white border-[6px] border-slate-50 shadow-xl group-hover:-translate-y-1 transition-transform duration-300">
                      <LayoutDashboard size={24} className="group-hover:scale-110 transition-transform" />
                  </div>
              </Link>

              {/* SETTINGS BUTTON */}
              <Link 
                  href="/dashboard/settings"
                  className="w-12 h-12 flex flex-col items-center justify-center gap-1 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all group"
              >
                  <Settings size={20} className="group-hover:rotate-45 transition-transform" />
                  <span className="text-[9px] font-bold tracking-widest uppercase">Set</span>
              </Link>

          </div>
      </div>
    </>
  );
};
