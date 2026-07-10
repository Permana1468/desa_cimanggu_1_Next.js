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
  ChevronDown,
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
  HeartHandshake,
  Home as HomeIcon,
  ShieldCheck,
  HeartPulse,
  Baby,
  Stethoscope,
  CalendarClock,
  ClipboardList,
  UserCog,
  SlidersHorizontal,
  BarChart3,
  Plus,
  Award,
  Briefcase,
  Globe
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
  { name: "Usulan Pembangunan", icon: Banknote, href: "/dashboard/finance" },
  { name: "APBDes", icon: PieChart, href: "/dashboard/apbdes" },
  { name: "Peta Interaktif", icon: Map, href: "/dashboard/map" },
  { name: "Arsip Digital", icon: Archive, href: "/dashboard/arsip" },
  { name: "Data Bansos", icon: HeartHandshake, href: "/dashboard/bansos" },
  { name: "Monitoring", icon: Activity, href: "/dashboard/monitoring" },
  { name: "Tracking Layanan", icon: Clock, href: "/dashboard/tracking" },
  { name: 'Pengaturan', icon: Settings, href: '/dashboard/settings' },
];

interface VillageSidebarProps {
  session?: any;
}

export const VillageSidebar = ({ session: propSession }: VillageSidebarProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get("tab") : null;
  const { data: clientSession } = useSession();
  const session = propSession || clientSession;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>("manajemen-data");
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  const toggleGroup = (group: string) => {
    setOpenGroup(prev => prev === group ? null : group);
  };

  const getQuickActions = () => {
    if (role === "POSYANDU") {
      return [
        { label: "Layanan Balita", href: "/dashboard?tab=layanan-balita", color: "bg-teal-600" },
        { label: "Layanan Bumil", href: "/dashboard?tab=layanan-ibuhamil", color: "bg-pink-600" },
        { label: "Layanan Lansia", href: "/dashboard?tab=layanan-lansia", color: "bg-indigo-600" },
        { label: "Tambah Jadwal", href: "/dashboard?tab=jadwal", color: "bg-amber-500" },
      ];
    }
    if (role === "KASI_KESEJAHTERAAN" || role === "PUSKESOS") {
      return [
        { label: "Cleansing DTKS", href: "/dashboard?tab=dtks", color: "bg-rose-500" },
        { label: "Peta GIS", href: "/dashboard?tab=gis-kemiskinan", color: "bg-indigo-500" },
        { label: "EWS Stunting", href: "/dashboard?tab=ews-stunting", color: "bg-emerald-500" },
        { label: "Insentif Guru", href: "/dashboard?tab=insentif", color: "bg-amber-500" },
      ];
    }
    if (role === "RT" || role === "RW") {
      return [
        { label: "Kas RT/RW", href: "/dashboard?tab=finance", color: "bg-emerald-600" },
        { label: "Aduan Warga", href: "/dashboard?tab=complaints", color: "bg-red-500" },
        { label: "GeoSENSUS", href: "/dashboard?tab=geosensus", color: "bg-teal-600" },
        { label: "Data Bansos", href: "/dashboard?tab=bansos", color: "bg-indigo-600" },
      ];
    }
    return [
      { label: "Kependudukan", href: "/dashboard/warga", color: "bg-teal-600" },
      { label: "Persuratan", href: "/dashboard/surat", color: "bg-blue-600" },
      { label: "Bansos", href: "/dashboard/bansos", color: "bg-pink-600" },
      { label: "Peta Interaktif", href: "/dashboard/map", color: "bg-amber-500" },
    ];
  };

  const getIsActive = (buttonType: string) => {
    if (buttonType === "home") {
      return pathname === "/dashboard" && (tabParam === "overview" || !tabParam);
    }
    if (buttonType === "stats") {
      return tabParam === "analisis" || tabParam === "finance" || tabParam === "lampid" || pathname.includes("stats");
    }
    if (buttonType === "settings") {
      return pathname === "/dashboard/settings" || pathname === "/dashboard/profil" || tabParam === "settings";
    }
    return false;
  };


  const email = session?.user?.email || "";
  const baseRole = session?.user?.role;
  let role = baseRole;

  // Dynamic mapping for KAUR & KASI sub-roles based on email
  if (baseRole === "KAUR") {
    if (email.includes("perencanaan")) {
      role = "KAUR_PERENCANAAN";
    } else if (email.includes("keuangan")) {
      role = "KAUR_KEUANGAN";
    } else if (email.includes("tu") || email.includes("umum")) {
      role = "KAUR_TU";
    }
  } else if (baseRole === "KASI") {
    if (email.includes("pemerintahan")) {
      role = "KASI_PEMERINTAHAN";
    } else if (email.includes("pelayanan")) {
      role = "KASI_PELAYANAN";
    } else if (email.includes("kesejahteraan")) {
      role = "KASI_KESEJAHTERAAN";
    }
  }

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
                <span className="text-sm font-black text-slate-800 leading-tight uppercase">{role?.replace('_', ' ') || "ADMIN"}</span>
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
        <nav className="flex-1 px-3 mt-2 overflow-y-auto custom-scrollbar">
          {role === "POSYANDU" ? (
            // === POSYANDU ACCORDION SIDEBAR ===
            <div className="space-y-1">
              {/* Dashboard */}
              <Link
                href="/dashboard?tab=overview"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  (tabParam || "overview") === "overview"
                    ? "bg-teal-600 text-white font-bold shadow-lg shadow-teal-600/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
              >
                <LayoutDashboard size={20} />
                {(!isCollapsed || isOpen) && <span className="text-sm">Dashboard</span>}
              </Link>

              {/* Group 1: Manajemen Data */}
              <div>
                <button
                  onClick={() => (!isCollapsed || isOpen) && toggleGroup("manajemen-data")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    ["balita","ibuhamil","lansia"].includes(tabParam || "")
                      ? "bg-teal-50 text-teal-700 font-bold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                >
                  <Database size={20} className="shrink-0" />
                  {(!isCollapsed || isOpen) && (
                    <>
                      <span className="text-sm flex-1 text-left">Manajemen Data</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${openGroup === "manajemen-data" ? "rotate-180" : ""}`}
                      />
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {(openGroup === "manajemen-data" && (!isCollapsed || isOpen)) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 ml-3 pl-3 border-l-2 border-teal-100 space-y-1">
                        {[
                          { label: "Data Balita", tab: "balita", icon: Baby },
                          { label: "Data Ibu Hamil", tab: "ibuhamil", icon: HeartPulse },
                          { label: "Data Lansia", tab: "lansia", icon: Users },
                        ].map(({ label, tab, icon: Icon }) => (
                          <Link
                            key={tab}
                            href={`/dashboard?tab=${tab}`}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
                              tabParam === tab
                                ? "bg-teal-500 text-white font-semibold"
                                : "text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                            }`}
                          >
                            <Icon size={16} />
                            <span>{label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Group 2: Layanan Kesehatan */}
              <div>
                <button
                  onClick={() => (!isCollapsed || isOpen) && toggleGroup("layanan")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    ["layanan-balita","layanan-ibuhamil","layanan-lansia"].includes(tabParam || "")
                      ? "bg-teal-50 text-teal-700 font-bold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                >
                  <Stethoscope size={20} className="shrink-0" />
                  {(!isCollapsed || isOpen) && (
                    <>
                      <span className="text-sm flex-1 text-left">Layanan Kesehatan</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${openGroup === "layanan" ? "rotate-180" : ""}`}
                      />
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {(openGroup === "layanan" && (!isCollapsed || isOpen)) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 ml-3 pl-3 border-l-2 border-teal-100 space-y-1">
                        {[
                          { label: "Layanan Balita", tab: "layanan-balita", icon: Baby },
                          { label: "Layanan Ibu Hamil", tab: "layanan-ibuhamil", icon: HeartPulse },
                          { label: "Layanan Lansia", tab: "layanan-lansia", icon: Users },
                        ].map(({ label, tab, icon: Icon }) => (
                          <Link
                            key={tab}
                            href={`/dashboard?tab=${tab}`}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
                              tabParam === tab
                                ? "bg-teal-500 text-white font-semibold"
                                : "text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                            }`}
                          >
                            <Icon size={16} />
                            <span>{label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Group 3: Jadwal & Kehadiran */}
              <div>
                <button
                  onClick={() => (!isCollapsed || isOpen) && toggleGroup("jadwal")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    ["jadwal","kehadiran","analisis"].includes(tabParam || "")
                      ? "bg-teal-50 text-teal-700 font-bold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                >
                  <CalendarClock size={20} className="shrink-0" />
                  {(!isCollapsed || isOpen) && (
                    <>
                      <span className="text-sm flex-1 text-left">Jadwal & Kehadiran</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${openGroup === "jadwal" ? "rotate-180" : ""}`}
                      />
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {(openGroup === "jadwal" && (!isCollapsed || isOpen)) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 ml-3 pl-3 border-l-2 border-teal-100 space-y-1">
                        {[
                          { label: "Jadwal Posyandu", tab: "jadwal", icon: ClipboardList },
                          { label: "Rekap Kehadiran", tab: "kehadiran", icon: Activity },
                          { label: "Analisis Laporan", tab: "analisis", icon: BarChart3 },
                        ].map(({ label, tab, icon: Icon }) => (
                          <Link
                            key={tab}
                            href={`/dashboard?tab=${tab}`}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
                              tabParam === tab
                                ? "bg-teal-500 text-white font-semibold"
                                : "text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                            }`}
                          >
                            <Icon size={16} />
                            <span>{label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Group 4: Manajemen Sistem */}
              <div>
                <button
                  onClick={() => (!isCollapsed || isOpen) && toggleGroup("sistem")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                >
                  <SlidersHorizontal size={20} className="shrink-0" />
                  {(!isCollapsed || isOpen) && (
                    <>
                      <span className="text-sm flex-1 text-left">Manajemen Sistem</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${openGroup === "sistem" ? "rotate-180" : ""}`}
                      />
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {(openGroup === "sistem" && (!isCollapsed || isOpen)) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 ml-3 pl-3 border-l-2 border-slate-100 space-y-1">
                        <Link
                          href="/dashboard/settings?tab=user"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <UserCog size={16} />
                          <span>Manajemen User</span>
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <Settings size={16} />
                          <span>Pengaturan Sistem</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : role === "KASI_KESEJAHTERAAN" || role === "PUSKESOS" ? (
             // === KASI KESEJAHTERAAN ACCORDION SIDEBAR ===
             <div className="space-y-1">
               {/* Dashboard */}
               <Link
                 href="/dashboard?tab=overview"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                   (tabParam || "overview") === "overview"
                     ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                     : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <LayoutDashboard size={20} />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Dashboard</span>}
               </Link>

               {/* Group 1: Kemiskinan & Sosial */}
               <div>
                 <button
                   onClick={() => (!isCollapsed || isOpen) && toggleGroup("kemiskinan-sosial")}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                     ["warga-bansos", "gis-kemiskinan", "uhc"].includes(tabParam || "")
                       ? "bg-rose-50 text-rose-700 font-bold"
                       : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                   } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                 >
                   <HeartHandshake size={20} className="shrink-0" />
                   {(!isCollapsed || isOpen) && (
                     <>
                       <span className="text-sm flex-1 text-left">Kemiskinan & Sosial</span>
                       <ChevronDown
                         size={14}
                         className={`transition-transform duration-200 ${openGroup === "kemiskinan-sosial" ? "rotate-180" : ""}`}
                       />
                     </>
                   )}
                 </button>
                 <AnimatePresence>
                   {(openGroup === "kemiskinan-sosial" && (!isCollapsed || isOpen)) && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.2 }}
                       className="overflow-hidden"
                     >
                       <div className="mt-1 ml-3 pl-3 border-l-2 border-rose-100 space-y-1">
                         {[
                           { label: "Login SIKS-NG", href: "https://siks.kemensos.go.id/login", isExternal: true, icon: Globe },
                           { label: "Data Bansos Warga", tab: "warga-bansos", icon: Award },
                           { label: "Peta Kerentanan GIS", tab: "gis-kemiskinan", icon: Map },
                           { label: "Monitoring UHC / KIS", tab: "uhc", icon: HeartPulse },
                           { label: "Usulan UHC", tab: "usulan-uhc", icon: FileText },
                         ].map((item) => {
                           const Icon = item.icon;
                           if (item.isExternal) {
                             return (
                               <a
                                 key={item.label}
                                 href={item.href}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                               >
                                 <Icon size={16} />
                                 <span>{item.label}</span>
                               </a>
                             );
                           }
                           return (
                             <Link
                               key={item.tab}
                               href={`/dashboard?tab=${item.tab}`}
                               onClick={() => setIsOpen(false)}
                               className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
                                 tabParam === item.tab
                                   ? "bg-rose-500 text-white font-bold"
                                   : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                               }`}
                             >
                               <Icon size={16} />
                               <span>{item.label}</span>
                             </Link>
                           );
                         })}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               {/* Group 2: Kesehatan & Stunting */}
               <div>
                 <button
                   onClick={() => (!isCollapsed || isOpen) && toggleGroup("kesehatan-stunting")}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                     ["ews-stunting", "pmt", "posyandu-register", "posyandu-jadwal", "posyandu-inventaris"].includes(tabParam || "")
                       ? "bg-rose-50 text-rose-700 font-bold"
                       : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                   } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                 >
                   <Activity size={20} className="shrink-0" />
                   {(!isCollapsed || isOpen) && (
                     <>
                       <span className="text-sm flex-1 text-left">Kesehatan & Stunting</span>
                       <ChevronDown
                         size={14}
                         className={`transition-transform duration-200 ${openGroup === "kesehatan-stunting" ? "rotate-180" : ""}`}
                       />
                     </>
                   )}
                 </button>
                 <AnimatePresence>
                   {(openGroup === "kesehatan-stunting" && (!isCollapsed || isOpen)) && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.2 }}
                       className="overflow-hidden"
                     >
                       <div className="mt-1 ml-3 pl-3 border-l-2 border-rose-100 space-y-1">
                         {[
                            { label: "Buku Register Digital", tab: "posyandu-register", icon: ClipboardList },
                            { label: "EWS Stunting Balita", tab: "ews-stunting", icon: HeartPulse },
                            { label: "Jadwal & Absensi", tab: "posyandu-jadwal", icon: CalendarClock },
                            { label: "Modul Manajemen Anggaran", tab: "pmt", icon: Package },
                            { label: "Manajemen Inventaris", tab: "posyandu-inventaris", icon: Archive },
                         ].map(({ label, tab, icon: Icon }) => (
                           <Link
                             key={tab}
                             href={`/dashboard?tab=${tab}`}
                             onClick={() => setIsOpen(false)}
                             className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
                               tabParam === tab
                                 ? "bg-rose-500 text-white font-bold"
                                 : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                             }`}
                           >
                             <Icon size={16} />
                             <span>{label}</span>
                           </Link>
                         ))}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               {/* Group 3: Pendidikan & Agama */}
               <div>
                 <button
                   onClick={() => (!isCollapsed || isOpen) && toggleGroup("pendidikan-agama")}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                     ["ats", "insentif", "pengangguran"].includes(tabParam || "")
                       ? "bg-rose-50 text-rose-700 font-bold"
                       : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                   } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                 >
                   <Compass size={20} className="shrink-0" />
                   {(!isCollapsed || isOpen) && (
                     <>
                       <span className="text-sm flex-1 text-left">Pendidikan & Agama</span>
                       <ChevronDown
                         size={14}
                         className={`transition-transform duration-200 ${openGroup === "pendidikan-agama" ? "rotate-180" : ""}`}
                       />
                     </>
                   )}
                 </button>
                 <AnimatePresence>
                   {(openGroup === "pendidikan-agama" && (!isCollapsed || isOpen)) && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.2 }}
                       className="overflow-hidden"
                     >
                       <div className="mt-1 ml-3 pl-3 border-l-2 border-rose-100 space-y-1">
                         {[
                           { label: "Anak Putus Sekolah", tab: "ats", icon: Milestone },
                           { label: "Insentif Guru Ngaji", tab: "insentif", icon: Banknote },
                           { label: "Data Pengangguran", tab: "pengangguran", icon: Briefcase },
                         ].map(({ label, tab, icon: Icon }) => (
                           <Link
                             key={tab}
                             href={`/dashboard?tab=${tab}`}
                             onClick={() => setIsOpen(false)}
                             className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
                               tabParam === tab
                                 ? "bg-rose-500 text-white font-bold"
                                 : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                             }`}
                           >
                             <Icon size={16} />
                             <span>{label}</span>
                           </Link>
                         ))}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               {/* Laporan LPJ */}
               <Link
                 href="/dashboard?tab=report"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                   tabParam === "report"
                     ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                     : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <FileText size={20} />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Laporan LPJ Kesra</span>}
               </Link>

               {/* Pengaturan */}
               <Link
                 href="/dashboard/settings"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                   pathname === "/dashboard/settings"
                     ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                     : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <Settings size={20} />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Pengaturan</span>}
               </Link>
             </div>
          ) : (
            // === ALL OTHER ROLES: Generic list ===
            <div className="space-y-1.5">
              {(() => {
                let itemsToRender = menuItems.filter(item => {
                  if (["ADMIN_DESA", "KADES", "SEKDES", "PERANGKAT_DESA", "OPERATOR_DESA", "ADMIN_MASTER"].includes(role as string)) {
                      if (role === "ADMIN_DESA" && item.name === "Usulan Pembangunan") return false;
                      return true;
                  }
                  if (role === "KAUR_PERENCANAAN") {
                    return ["Dashboard", "Usulan Pembangunan", "Infrastruktur", "APBDes", "Peta Interaktif", "Arsip Digital", "Monitoring", "Pengaturan"].includes(item.name);
                  }
                  if (role === "KAUR_KEUANGAN") {
                    return ["Dashboard", "APBDes", "Usulan Pembangunan", "Pengaturan"].includes(item.name);
                  }
                  if (role === "KAUR_TU") {
                    return ["Dashboard", "Pusat Persuratan", "Data Kependudukan", "Aparatur Desa", "Arsip Digital", "Tracking Layanan", "Pengaturan"].includes(item.name);
                  }
                  if (role === "KASI_PEMERINTAHAN") {
                    return ["Dashboard", "Pusat Persuratan", "Data Kependudukan", "Peta Interaktif", "Tracking Layanan", "Pengaturan"].includes(item.name);
                  }
                  if (role === "KASI_PELAYANAN") {
                    return ["Dashboard", "Pusat Persuratan", "Tracking Layanan", "Pengaturan"].includes(item.name);
                  }
                  if (role === "KASI_KESEJAHTERAAN") {
                    return ["Dashboard", "Data Bansos", "Pengaturan"].includes(item.name);
                  }
                  if (["KAUR", "KASI"].includes(role as string)) return true;
                  if (["PKK", "TP_PKK", "BPD", "KADUS", "KARANG_TARUNA", "PUSKESOS", "PETUGAS_SENSUS"].includes(role as string)) {
                     return ["Dashboard", "Pusat Persuratan", "Data Kependudukan", "Usulan Pembangunan", "Tracking Layanan", "Peta Interaktif"].includes(item.name);
                  }
                  if (role === "BUMDES") {
                     return ["Dashboard", "BUMDES"].includes(item.name);
                  }
                  return false;
                });

                if (role === "LPM") {
                  itemsToRender = [
                    { name: "Dashboard", icon: LayoutDashboard, href: "/kelembagaan?tab=overview" },
                    { name: "Usulan Pembangunan", icon: Banknote, href: "/kelembagaan/finance" },
                    { name: "Program Kerja", icon: Activity, href: "/kelembagaan?tab=program" },
                    { name: "Pemberdayaan", icon: Sparkles, href: "/kelembagaan?tab=pemberdayaan" },
                    { name: "Swadaya & Gotong Royong", icon: HeartHandshake, href: "/kelembagaan?tab=swadaya" },
                    { name: "Susunan Pengurus", icon: Users, href: "/kelembagaan?tab=pengurus" }
                  ];
                }

                if (role === "RT" || role === "RW") {
                  itemsToRender = [
                    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard?tab=overview" },
                    { name: "Data Warga", icon: Users, href: "/dashboard?tab=warga" },
                    { name: "Rumah Warga", icon: HomeIcon, href: "/dashboard?tab=rumah" },
                    { name: "Kas Keuangan", icon: Banknote, href: "/dashboard?tab=finance" },
                    { name: "Cek Surat", icon: FileText, href: "/dashboard?tab=surat" },
                    { name: "Laporan Kegiatan", icon: Sparkles, href: "/dashboard?tab=kegiatan" },
                    { name: "Laporan LAMPID", icon: Milestone, href: "/dashboard?tab=lampid" },
                    { name: "Pengumuman", icon: Megaphone, href: "/dashboard?tab=announcements" },
                    { name: "Aduan Warga", icon: AlertCircle, href: "/dashboard?tab=complaints" },
                    { name: "Inventaris RT", icon: Package, href: "/dashboard?tab=inventory" },
                    { name: "GeoSENSUS", icon: Compass, href: "/dashboard?tab=geosensus" },
                    { name: "Data Bansos", icon: HeartHandshake, href: "/dashboard?tab=bansos" },
                    { name: "Keamanan Lingkungan", icon: ShieldCheck, href: "/dashboard?tab=security" }
                  ];
                  if (role === "RW") {
                    itemsToRender.push(
                      { name: "Posyandu & Kesehatan", icon: HeartPulse, href: "/dashboard?tab=health" },
                      { name: "Kelembagaan RW", icon: Building2, href: "/dashboard?tab=institutions" }
                    );
                  }
                }

                if (!itemsToRender.find(item => item.name === 'Pengaturan')) {
                    itemsToRender.push({ name: 'Pengaturan', icon: Settings, href: '/dashboard/settings' });
                }

                return itemsToRender.map((item) => {
                  const isInstitutional = ["PKK", "TP_PKK", "LPM", "BPD", "KARANG_TARUNA", "PUSKESOS", "PETUGAS_SENSUS"].includes(role as string);
                  let href = item.href;
                  if (isInstitutional && role !== "LPM") {
                      if (href === "/dashboard") href = "/kelembagaan";
                      else href = href.replace("/dashboard/", "/kelembagaan/");
                  }
                  let isActive = false;
                  if (role === "RT" || role === "RW" || role === "LPM") {
                    const urlTab = tabParam || "overview";
                    const itemTab = item.href.split("tab=")[1] || "overview";
                    isActive = (pathname === "/dashboard" || pathname === "/kelembagaan") && urlTab === itemTab;
                    if (item.name === "Usulan Pembangunan" && role === "LPM") {
                      isActive = pathname === "/kelembagaan/finance";
                    }
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
            </div>
          )}
        </nav>


        {/* User Area & Logout (Compact Aesthetic Design) */}
        <div className="p-4 mt-auto">
          {(!isCollapsed || isOpen) ? (
             <div className="flex items-center justify-between p-3 rounded-[1.25rem] bg-slate-50 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-md overflow-hidden">
                        {session?.user?.photo ? (
                            <Image src={session.user.photo} alt="Profile" width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                            session?.user?.name?.charAt(0) || 'A'
                        )}
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

      {/* MOBILE BOTTOM NAVIGATION DOCK (CURVED DESIGN WITH DYNAMIC MODALS - FULL WIDTH) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 w-full h-[75px] select-none">
          {/* SVG Background with Notch */}
          <div className="absolute inset-0 z-0">
              <svg className="w-full h-full text-white/95 dark:text-slate-900/95 backdrop-blur-xl fill-current filter drop-shadow-[0_-15px_30px_rgba(0,0,0,0.12)]" viewBox="0 0 400 80" preserveAspectRatio="none">
                  <path d="M 0 10 L 165 10 C 180 10, 182 48, 200 48 C 218 48, 220 10, 235 10 L 400 10 L 400 80 L 0 80 Z" />
              </svg>
          </div>

          {/* Plus Menu Quick Actions Overlay */}
          <AnimatePresence>
              {showPlusMenu && (
                  <>
                      {/* Click outside backdrop for quick actions */}
                      <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowPlusMenu(false)}
                          className="fixed inset-0 -z-10 bg-slate-950/20 backdrop-blur-[2px]"
                      />
                      <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95, x: "-50%" }}
                          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                          exit={{ opacity: 0, y: 15, scale: 0.95, x: "-50%" }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="absolute bottom-[90px] left-1/2 w-[90%] max-w-[280px] bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-700 z-10 space-y-2.5"
                      >
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mb-1">Akses Cepat</p>
                          {getQuickActions().map((action: any) => (
                              <Link
                                  key={action.label}
                                  href={action.href}
                                  onClick={() => setShowPlusMenu(false)}
                                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                              >
                                  <div className={`w-8 h-8 rounded-xl ${action.color} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                                      +
                                  </div>
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">{action.label}</span>
                              </Link>
                          ))}
                      </motion.div>
                  </>
              )}
          </AnimatePresence>

          {/* Interactive Navigation Elements */}
          <div className="relative z-10 w-full h-full flex items-center justify-between px-6 pt-[6px]">
              
              {/* BUTTON 1: HOME */}
              <Link 
                  href="/dashboard?tab=overview"
                  className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all ${
                      getIsActive("home") 
                          ? "text-emerald-600 dark:text-emerald-400 scale-105" 
                          : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                  <HomeIcon size={20} className={getIsActive("home") ? "stroke-[2.5]" : "stroke-[1.8]"} />
                  <span className="text-[9px] font-bold mt-0.5 tracking-tight">Beranda</span>
              </Link>

              {/* BUTTON 2: ALL MENU / GRID */}
              <button 
                  onClick={() => setIsOpen(true)}
                  className="w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all text-slate-400 hover:text-slate-600"
              >
                  <Menu size={20} className="stroke-[1.8]" />
                  <span className="text-[9px] font-bold mt-0.5 tracking-tight">Menu</span>
              </button>

              {/* BUTTON 3: CENTER FLOATING ACTION "+" BUTTON */}
              <div className="relative w-16 h-12 flex items-center justify-center">
                  <button 
                      onClick={() => setShowPlusMenu(!showPlusMenu)}
                      className="absolute -top-6 w-14 h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-all z-20 active:scale-95"
                  >
                      <motion.div
                          animate={{ rotate: showPlusMenu ? 135 : 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                          <Plus size={24} className="stroke-[2.5]" />
                      </motion.div>
                  </button>
              </div>

              {/* BUTTON 4: STATS / CHARTS */}
              <Link 
                  href={role === "POSYANDU" ? "/dashboard?tab=analisis" : (role === "RT" || role === "RW" ? "/dashboard?tab=finance" : "/dashboard")}
                  className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all ${
                      getIsActive("stats") 
                          ? "text-emerald-600 dark:text-emerald-400 scale-105" 
                          : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                  <BarChart3 size={20} className={getIsActive("stats") ? "stroke-[2.5]" : "stroke-[1.8]"} />
                  <span className="text-[9px] font-bold mt-0.5 tracking-tight">Laporan</span>
              </Link>

              {/* BUTTON 5: PROFILE / SETTINGS */}
              <Link 
                  href="/dashboard/settings"
                  className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all ${
                      getIsActive("settings") 
                          ? "text-emerald-600 dark:text-emerald-400 scale-105" 
                          : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                  <Settings size={20} className={getIsActive("settings") ? "stroke-[2.5] rotate-45" : "stroke-[1.8]"} />
                  <span className="text-[9px] font-bold mt-0.5 tracking-tight">Setel</span>
              </Link>

          </div>
      </div>
    </>
  );
};
