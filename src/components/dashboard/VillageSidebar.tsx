"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";

function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  UserCircle, 
  Store, 
  Building2, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Database,
  Calculator,
  Menu,
  Banknote,
  Clock,
  Map,
  HardHat,
  CheckCircle2,
  Fingerprint,
  Activity,
  PieChart,
  Archive,
  Sparkles,
  Milestone,
  Megaphone,
  AlertCircle,
  Package,
  Boxes,
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
  Globe,
  MessageSquare,
  Folder,
  ShoppingBag,
  FolderArchive,
  Monitor,
  Terminal,
  FileCheck,
  QrCode,
  Layers,
  TrendingUp,
  Mail,
  Lightbulb,
  Cloud
} from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const SidebarThreeBackground = dynamic(
  () => import("./roles/SidebarThreeBackground").then((mod) => mod.SidebarThreeBackground),
  { ssr: false }
);
import { GlobalNotificationPanel } from "./GlobalNotificationPanel";
import { getVillageDashboardStats } from "@/actions/village";

const adminDesaMenuGroups = [
  {
    category: "Pelayanan Warga",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { name: "Verifikasi Warga", icon: UserCog, href: "/dashboard/verifikasi-warga", badgeKey: "unverifiedWarga", badgeColor: "bg-amber-500 text-white" },
      { name: "Pusat Persuratan & Layanan", icon: FileText, href: "/dashboard/surat", badgeKey: "suratPending", badgeColor: "bg-rose-500 text-white" },
    ],
  },
  {
    category: "Kependudukan & Sosial",
    items: [
      { name: "Data Kependudukan", icon: Database, href: "/dashboard/warga" },
      { name: "Data Bansos", icon: HeartHandshake, href: "/dashboard/bansos" },
    ],
  },
  {
    category: "Pemerintahan & SDM",
    items: [
      { name: "Aparatur Desa", icon: Users, href: "/dashboard/aparatur" },
      { name: "Kelembagaan Desa", icon: Building2, href: "/dashboard/kelembagaan" },
      { name: "E-Absensi Aparatur", icon: QrCode, href: "/dashboard/e-absensi" },
    ],
  },
  {
    category: "Pembangunan & Ekonomi",
    items: [
      { name: "APBDes Transparansi", icon: PieChart, href: "/dashboard/apbdes" },
      { name: "Infrastruktur", icon: HardHat, href: "/dashboard/infrastruktur" },
      { name: "BUMDes", icon: Store, href: "/dashboard/bumdes" },
      { name: "Peta Interaktif (WebGIS)", icon: Map, href: "/dashboard/map" },
      { name: "Katalog UMKM", icon: ShoppingBag, href: "/umkm" },
    ],
  },
  {
    category: "Arsip & Dokumen",
    items: [
      { name: "Arsip Digital", icon: Archive, href: "/dashboard/arsip" },
      { name: "Arsip Laporan", icon: Folder, href: "/dashboard/arsip-laporan" },
      { name: "Format Dokumen", icon: FileText, href: "/dashboard/format-dokumen" },
    ],
  },
  {
    category: "Pengaturan & Informasi",
    items: [
      { name: "Manajemen Konten (CMS)", icon: Monitor, href: "/dashboard/cms" },
      { name: "Monitoring & Audit", icon: Activity, href: "/dashboard/monitoring" },
      { name: "Log & Sistem", icon: Terminal, href: "/dashboard/sistem" },
      { name: "Pengaturan Desa", icon: Settings, href: "/dashboard/settings" },
    ],
  },
];

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Verifikasi Warga", icon: UserCog, href: "/dashboard/verifikasi-warga" },
  { name: "Pusat Persuratan", icon: FileText, href: "/dashboard/surat" },
  { name: "Data Kependudukan", icon: Database, href: "/dashboard/warga" },
  { name: "Manajemen Konten (CMS)", icon: Monitor, href: "/dashboard/cms" },
  { name: "Log & Sistem", icon: Terminal, href: "/dashboard/sistem" },
  { name: "Profil Desa", icon: UserCircle, href: "/dashboard/profil" },
  { name: "Aparatur Desa", icon: Users, href: "/dashboard/aparatur" },
  { name: "E-ABSENSI", icon: QrCode, href: "/dashboard/e-absensi" },
  { name: "Kelembagaan", icon: Building2, href: "/dashboard/kelembagaan" },
  { name: "BUMDES", icon: Store, href: "/dashboard/bumdes" },
  { name: "Infrastruktur", icon: HardHat, href: "/dashboard/infrastruktur" },
  { name: "Usulan Musrenbang", icon: Banknote, href: "/dashboard/finance" },
  { name: "APBDes", icon: PieChart, href: "/dashboard/apbdes" },
  { name: "Peta Interaktif", icon: Map, href: "/dashboard/map" },
  { name: "Arsip Digital", icon: Archive, href: "/dashboard/arsip" },
  { name: "Inventaris Aset Desa", icon: Boxes, href: "/dashboard/aset" },
  { name: "Arsip Laporan", icon: Folder, href: "/dashboard/arsip-laporan" },
  { name: "Format Dokumen", icon: FileText, href: "/dashboard/format-dokumen" },
  { name: "Data Bansos", icon: HeartHandshake, href: "/dashboard/bansos" },
  { name: "Monitoring", icon: Activity, href: "/dashboard/monitoring" },
  { name: "Tracking Layanan", icon: Clock, href: "/dashboard/tracking" },
  { name: 'Pengaturan', icon: Settings, href: '/dashboard/settings' },
  { name: 'Marketplace UMKM', icon: ShoppingBag, href: '/umkm' },
];

interface VillageSidebarProps {
  session?: any;
  isHackerTheme?: boolean;
}

export const VillageSidebar = ({ session: propSession, isHackerTheme }: VillageSidebarProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get("tab") : null;
  const subParam = searchParams ? searchParams.get("sub") : null;
  const { data: clientSession } = useSession();
  const session = propSession || clientSession;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>("manajemen-data");
  const [isRkpOpen, setIsRkpOpen] = useState(true);
  const [isMusrenbangOpen, setIsMusrenbangOpen] = useState(true);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [kesraRgbTheme, setKesraRgbTheme] = useState<string>("rose");
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kesra_rgb_theme") || "rose";
      setKesraRgbTheme(saved);

      const handleThemeChange = () => {
        setKesraRgbTheme(localStorage.getItem("kesra_rgb_theme") || "rose");
      };

      window.addEventListener("kesra_rgb_theme_changed", handleThemeChange);
      window.addEventListener("storage", handleThemeChange);
      return () => {
        window.removeEventListener("kesra_rgb_theme_changed", handleThemeChange);
        window.removeEventListener("storage", handleThemeChange);
      };
    }
  }, []);

  const getRgbActiveBg = () => {
    return "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10";
  };

  const getRgbSubActiveBg = () => {
    return "bg-white/25 text-white font-extrabold shadow-sm";
  };

  const getRgbGroupActiveBg = () => {
    return "bg-white/15 text-white font-bold";
  };

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
    if (role === "KASI_KESEJAHTERAAN") {
      return [
        { label: "Cleansing DTKS", href: "/dashboard?tab=dtks", color: "bg-rose-500" },
        { label: "Peta GIS", href: "/dashboard?tab=gis-kemiskinan", color: "bg-indigo-500" },
        { label: "EWS Stunting", href: "/dashboard?tab=ews-stunting", color: "bg-emerald-500" },
        { label: "Insentif Guru", href: "/dashboard?tab=insentif", color: "bg-amber-500" },
      ];
    }
    if (role === "PUSKESOS") {
      return [
        { label: "Pengaduan", href: "/dashboard?tab=pengaduan", color: "bg-blue-500" },
        { label: "Rujukan SLRT", href: "/dashboard?tab=rujukan", color: "bg-indigo-500" },
        { label: "Data PPKS", href: "/dashboard?tab=ppks", color: "bg-emerald-500" },
        { label: "Pengurus", href: "/dashboard?tab=pengurus", color: "bg-amber-500" },
      ];
    }
    if (role === "KARANG_TARUNA") {
      return [
        { label: "Data Pemuda", href: "/kelembagaan?tab=anggota", color: "bg-blue-600" },
        { label: "Kegiatan", href: "/kelembagaan?tab=kegiatan", color: "bg-indigo-600" },
        { label: "Wirausaha", href: "/kelembagaan?tab=wirausaha", color: "bg-amber-500" },
        { label: "Pengurus", href: "/kelembagaan?tab=pengurus", color: "bg-slate-700" },
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


  const email = (session?.user?.email || "").toLowerCase();
  const userName = (session?.user?.name || "").toLowerCase();
  const baseRole = session?.user?.role;
  let role = baseRole;

  // Dynamic mapping for KAUR & KASI sub-roles based on email or name
  if (baseRole === "KAUR") {
    if (email.includes("perencanaan") || userName.includes("perencanaan")) {
      role = "KAUR_PERENCANAAN";
    } else if (email.includes("keuangan") || userName.includes("keuangan")) {
      role = "KAUR_KEUANGAN";
    } else if (email.includes("tu") || email.includes("umum") || userName.includes("tata usaha") || userName.includes("tu")) {
      role = "KAUR_TU";
    }
  } else if (baseRole === "KASI") {
    if (email.includes("pemerintahan") || userName.includes("pemerintahan")) {
      role = "KASI_PEMERINTAHAN";
    } else if (email.includes("pelayanan") || userName.includes("pelayanan")) {
      role = "KASI_PELAYANAN";
    } else if (email.includes("kesejahteraan") || email.includes("kesra") || userName.includes("kesejahteraan") || userName.includes("kesra")) {
      role = "KASI_KESEJAHTERAAN";
    }
  }

  const [adminStats, setAdminStats] = useState<{ suratPending: number; unverifiedWarga: number }>({
    suratPending: 0,
    unverifiedWarga: 0,
  });

  const isAdminDesaRole = ["ADMIN_DESA", "ADMIN_MASTER", "KADES", "SEKDES"].includes(role as string);

  useEffect(() => {
    let isMounted = true;
    if (["ADMIN_DESA", "ADMIN_MASTER", "KADES", "SEKDES"].includes(role as string)) {
      getVillageDashboardStats()
        .then((res) => {
          if (isMounted && res) {
            setAdminStats({
              suratPending: res.suratPending || 0,
              unverifiedWarga: (res as any).unverifiedWarga || 0,
            });
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [role]);

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

      {/* SIDEBAR CONTAINER (Signature Curved Lekukan on Desktop - Harmonized Across Roles) */}
      <aside 
        className={`transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col z-[70] shrink-0 overflow-hidden
          fixed inset-y-0 left-0 h-full w-72 ${isOpen ? 'translate-x-0 shadow-[10px_0_40px_rgba(0,0,0,0.15)]' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:h-full ${isCollapsed && !isOpen ? 'lg:w-20' : 'lg:w-72'}
          ${isHackerTheme ? 'bg-transparent border-cyan-500/30 text-cyan-50 shadow-[0_0_30px_rgba(6,182,212,0.1)] border-r' : 'bg-[#1d64ec] text-white shadow-2xl lg:rounded-tr-[3.5rem] lg:rounded-br-[2.5rem]'}
        `}
      >
        {isHackerTheme && <SidebarThreeBackground />}
        
        {/* Logo & Toggle Area (Logo hidden on desktop to avoid duplicate with top navbar) */}
        <div className={`relative z-10 px-5 pt-4 pb-2 flex items-center ${isCollapsed && !isOpen ? 'justify-center' : 'justify-between'} lg:pt-5 lg:pb-1 ${isHackerTheme ? 'border-b border-cyan-500/30' : ''}`}>
          <div className="flex items-center gap-3 overflow-hidden lg:hidden">
            <div className="relative w-9 h-9 shrink-0">
              <Image src={role === "KARANG_TARUNA" ? "/images/logo-katar.png" : role === "PUSKESOS" ? "/images/PUSKESOS-1.png" : "/images/logo-bogor.png"} alt="Logo" fill sizes="36px" className={`object-contain ${isHackerTheme ? 'drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] hue-rotate-180 brightness-150' : ''}`} />
            </div>
            {(!isCollapsed || isOpen) && (
              <div className="flex flex-col">
                <span className={`text-sm font-black leading-tight uppercase ${isHackerTheme ? 'text-cyan-400 font-mono tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'text-white'}`}>{role?.replace('_', ' ') || "ADMIN"}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isHackerTheme ? 'text-sky-500 font-mono' : 'text-blue-100 font-semibold'}`}>Desa Cimanggu I</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex p-1.5 rounded-full transition-colors cursor-pointer ${
              isHackerTheme 
                ? 'bg-slate-800/80 text-cyan-500 hover:text-cyan-300 hover:bg-slate-700 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] border border-cyan-500/30'
                : 'bg-white/10 text-white hover:bg-white/20 ml-auto'
            }`}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Action Pill Button (Desktop Signature Look) */}
        {(!isCollapsed || isOpen) && (
          <div className="px-5 pt-2 pb-4">
            <Link
              href={
                role === "KASI_PELAYANAN" 
                  ? "/dashboard?tab=buat-surat" 
                  : role === "RT" 
                  ? "/dashboard?tab=surat-pengantar" 
                  : "/dashboard/surat"
              }
              prefetch={false}
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 px-5 rounded-full bg-white text-[#1d64ec] hover:bg-blue-50 font-black text-xs uppercase tracking-wider shadow-lg shadow-black/15 flex items-center justify-center gap-2.5 transition-all active:scale-95 group cursor-pointer"
            >
              <Plus size={17} className="group-hover:rotate-90 transition-transform text-[#1d64ec]" />
              <span>{role === "KAUR_TU" ? "Buku Agenda Surat" : role === "RT" ? "Buat Pengantar" : "Buat Surat Baru"}</span>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="relative z-10 flex-1 px-3 mt-2 overflow-y-auto custom-scrollbar">
          {role === "POSYANDU" ? (
            // === POSYANDU ACCORDION SIDEBAR ===
            <div className="space-y-1">

              {/* Dashboard */}
              <Link
                href="/dashboard?tab=overview"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                  (tabParam || "overview") === "overview"
                    ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                    : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
              >
                <LayoutDashboard size={20} />
                {(!isCollapsed || isOpen) && <span className="text-sm">Dashboard</span>}
              </Link>

              {/* Group 1: Manajemen Data */}
              <div>
                <button
                  onClick={() => (!isCollapsed || isOpen) && toggleGroup("manajemen-data")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                    ["balita","ibuhamil","lansia"].includes(tabParam || "")
                      ? "bg-white/15 text-white font-bold"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
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
                      <div className="mt-1 ml-3 pl-3 border-l-2 border-white/20 space-y-1">
                        {[
                          { label: "Data Balita", tab: "balita", icon: Baby },
                          { label: "Data Ibu Hamil", tab: "ibuhamil", icon: HeartPulse },
                          { label: "Data Lansia", tab: "lansia", icon: Users },
                        ].map(({ label, tab, icon: Icon }) => (
                          <Link
                            key={tab}
                            href={`/dashboard?tab=${tab}`}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm ${
                              tabParam === tab
                                ? "bg-white/25 text-white font-extrabold shadow-sm"
                                : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                    ["layanan-balita","layanan-ibuhamil","layanan-lansia"].includes(tabParam || "")
                      ? "bg-white/15 text-white font-bold"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
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
                      <div className="mt-1 ml-3 pl-3 border-l-2 border-white/20 space-y-1">
                        {[
                          { label: "Layanan Balita", tab: "layanan-balita", icon: Baby },
                          { label: "Layanan Ibu Hamil", tab: "layanan-ibuhamil", icon: HeartPulse },
                          { label: "Layanan Lansia", tab: "layanan-lansia", icon: Users },
                        ].map(({ label, tab, icon: Icon }) => (
                          <Link
                            key={tab}
                            href={`/dashboard?tab=${tab}`}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm ${
                              tabParam === tab
                                ? "bg-white/25 text-white font-extrabold shadow-sm"
                                : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                    ["jadwal","kehadiran","analisis"].includes(tabParam || "")
                      ? "bg-white/15 text-white font-bold"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
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
                      <div className="mt-1 ml-3 pl-3 border-l-2 border-white/20 space-y-1">
                        {[
                          { label: "Jadwal Posyandu", tab: "jadwal", icon: ClipboardList },
                          { label: "Rekap Kehadiran", tab: "kehadiran", icon: Activity },
                          { label: "Analisis Laporan", tab: "analisis", icon: BarChart3 },
                        ].map(({ label, tab, icon: Icon }) => (
                          <Link
                            key={tab}
                            href={`/dashboard?tab=${tab}`}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm ${
                              tabParam === tab
                                ? "bg-white/25 text-white font-extrabold shadow-sm"
                                : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer text-white/80 hover:bg-white/10 hover:text-white font-medium ${isCollapsed && !isOpen ? "justify-center" : ""}`}
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
                      <div className="mt-1 ml-3 pl-3 border-l-2 border-white/20 space-y-1">
                        <Link
                          href="/dashboard/settings?tab=user"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm text-white/70 hover:bg-white/10 hover:text-white font-medium"
                        >
                          <UserCog size={16} />
                          <span>Manajemen User</span>
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm text-white/70 hover:bg-white/10 hover:text-white font-medium"
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
          ) : role === "KAUR_PERENCANAAN" ? (
             // === KAUR PERENCANAAN ACCORDION SIDEBAR ===
             <div className="space-y-1">
                {/* Standalone Links */}
                {[
                  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", activeParam: "overview" },
                  { name: "Infrastruktur", icon: HardHat, href: "/dashboard/infrastruktur", activeParam: "" },
                  { name: "APBDes", icon: PieChart, href: "/dashboard/apbdes", activeParam: "" },
                  { name: "Peta Interaktif", icon: Map, href: "/dashboard/map", activeParam: "" },
                  { name: "Data Kependudukan", icon: Database, href: "/dashboard/warga", activeParam: "warga" },
                  { name: "Arsip Digital", icon: Archive, href: "/dashboard/arsip", activeParam: "" },
                  { name: "Monitoring", icon: Activity, href: "/dashboard/monitoring", activeParam: "" },
                ].map((item) => {
                   const isDashboard = item.href === "/dashboard";
                   const isActive = isDashboard 
                     ? (pathname === "/dashboard" && (!tabParam || tabParam === "overview" || tabParam === item.activeParam))
                     : (pathname.startsWith(item.href) || (item.activeParam && tabParam === item.activeParam));
                   
                   return (
                     <Link
                       key={item.name}
                       href={item.href + (item.activeParam && isDashboard ? `?tab=${item.activeParam}` : '')}
                       onClick={() => setIsOpen(false)}
                       className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group relative z-10 ${
                         isActive
                           ? (isHackerTheme ? "bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-sm" : "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10")
                           : (isHackerTheme ? "text-slate-400 hover:bg-slate-800/60 hover:text-cyan-400 hover:border hover:border-cyan-500/30 font-medium backdrop-blur-sm" : "text-white/80 hover:bg-white/10 hover:text-white font-medium")
                       } ${isCollapsed && !isOpen ? 'justify-center' : ''}`}
                     >
                       <item.icon size={20} className={`transition-all duration-300 ${isActive ? (isHackerTheme ? "animate-luxury-pulse luxury-glow-strong text-teal-300" : "") : "group-hover:scale-125 transition-transform"}`} />
                       {(!isCollapsed || isOpen) && <span className={`text-sm ${isHackerTheme ? 'font-mono' : ''}`}>{item.name}</span>}
                     </Link>
                   );
                })}

                {/* Usulan Musrenbang Dropdown Sub-Menu */}
                <div className="pt-1 relative z-10">
                  <button
                    onClick={() => (!isCollapsed || isOpen) && setIsMusrenbangOpen(!isMusrenbangOpen)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                      ["undangan-musrenbang", "musling-rw", "musling-kadus", "finance", "musrenbang"].includes(tabParam || "")
                        ? (isHackerTheme ? "bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-sm" : "bg-white/15 text-white font-bold")
                        : (isHackerTheme ? "text-slate-400 hover:bg-slate-800/60 hover:text-cyan-400 hover:border hover:border-cyan-500/30 font-medium backdrop-blur-sm" : "text-white/80 hover:bg-white/10 hover:text-white font-medium")
                    } ${isCollapsed && !isOpen ? "justify-center" : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Banknote size={20} className={`shrink-0 transition-all duration-300 ${["undangan-musrenbang", "musling-rw", "musling-kadus", "finance", "musrenbang"].includes(tabParam || "") && isHackerTheme ? 'animate-luxury-pulse luxury-glow-strong text-teal-300' : 'group-hover:scale-125 transition-transform'}`} />
                      {(!isCollapsed || isOpen) && <span className={`text-sm ${isHackerTheme ? 'font-mono' : ''}`}>Usulan Musrenbang</span>}
                    </div>
                    {(!isCollapsed || isOpen) && (
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isMusrenbangOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  <AnimatePresence>
                    {(isMusrenbangOpen && (!isCollapsed || isOpen)) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className={`mt-1 ml-3 pl-3 border-l-2 space-y-1 ${isHackerTheme ? 'border-cyan-500/30' : 'border-white/20'}`}>
                          {[
                            { label: isHackerTheme ? "[1. Undangan Musrenbang]" : "1. UNDANGAN MUSRENBANG", tab: "undangan-musrenbang", icon: Mail },
                            { label: isHackerTheme ? "[2. Musling RW]" : "2. MUSLING TINGKAT RW", tab: "musling-rw", icon: Building2 },
                            { label: isHackerTheme ? "[3. Musling Kadus]" : "3. MUSLING TINGKAT KADUS", tab: "musling-kadus", icon: Users },
                          ].map((subItem) => (
                            <Link
                              key={subItem.tab}
                              href={`/dashboard?tab=${subItem.tab}`}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs group ${
                                tabParam === subItem.tab
                                  ? (isHackerTheme ? "bg-cyan-900/50 text-cyan-300 font-bold border border-cyan-500/50 backdrop-blur-sm" : "bg-white/25 text-white font-extrabold shadow-sm")
                                  : (isHackerTheme ? "text-slate-400 hover:bg-slate-800/60 hover:text-cyan-400 font-mono backdrop-blur-sm" : "text-white/70 hover:bg-white/10 hover:text-white font-medium")
                              }`}
                            >
                              <subItem.icon size={14} className={`${tabParam === subItem.tab ? 'text-white' : 'text-white/80 group-hover:scale-110 transition-transform'}`} />
                              <span>{subItem.label}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

               {/* CYBER-PLAN ENGINE Dropdown */}
               <div className="pt-2 relative z-10">
                 <button
                   onClick={() => (!isCollapsed || isOpen) && toggleGroup("cyberplan")}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                     openGroup === "cyberplan"
                       ? (isHackerTheme ? 'bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-500/50' : 'bg-white/15 text-white font-bold')
                       : (isHackerTheme ? 'text-slate-400 hover:bg-slate-800/60 hover:text-cyan-400 hover:border hover:border-cyan-500/30 backdrop-blur-sm' : 'text-white/80 hover:bg-white/10 hover:text-white font-medium')
                   } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                 >
                   <Building2 size={20} className={`shrink-0 transition-all duration-300 ${isHackerTheme ? 'group-hover:animate-luxury-pulse' : 'group-hover:scale-125 transition-transform'}`} />
                   {(!isCollapsed || isOpen) && (
                     <>
                       <span className={`text-[11px] flex-1 text-left tracking-widest uppercase ${isHackerTheme ? 'font-mono font-bold text-sky-500' : 'font-bold text-white'}`}>{isHackerTheme ? 'CYBER-PLAN ENGINE' : 'Perencanaan Pembangunan'}</span>
                       <ChevronDown
                         size={14}
                         className={`transition-transform duration-200 ${openGroup === "cyberplan" ? "rotate-180" : ""}`}
                       />
                     </>
                   )}
                 </button>
                 <AnimatePresence>
                   {(openGroup === "cyberplan" && (!isCollapsed || isOpen)) && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.2 }}
                       className="overflow-hidden"
                     >
                       <div className={`mt-1 ml-3 pl-3 border-l-2 space-y-1 ${isHackerTheme ? 'border-cyan-500/30' : 'border-white/20'}`}>
                         
                         <div>
                           <button
                             onClick={() => setIsRkpOpen(!isRkpOpen)}
                             className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-all text-sm group cursor-pointer ${
                               ["rkp", "apbdes", "rkkd-add", "rkkd-dd", "rkkd-bhprd", "rkkd-bankeu", "rkkd-banprov"].includes(tabParam || "")
                                 ? (isHackerTheme ? "bg-cyan-900/60 text-cyan-300 font-bold border border-cyan-500/50 backdrop-blur-sm" : "bg-white/20 text-white font-bold")
                                 : (isHackerTheme ? "text-slate-400 hover:bg-slate-800/60 hover:text-cyan-400 font-mono backdrop-blur-sm" : "text-white/80 hover:bg-white/10 hover:text-white font-medium")
                             }`}
                           >
                             <div className="flex items-center gap-2.5">
                               <FileText size={14} className={`${["rkp", "apbdes", "rkkd-add", "rkkd-dd", "rkkd-bhprd", "rkkd-bankeu", "rkkd-banprov"].includes(tabParam || "") && isHackerTheme ? 'animate-luxury-float luxury-glow-strong text-teal-300' : 'group-hover:animate-luxury-pulse'}`} />
                               <span>{isHackerTheme ? "[RKP-Desa]" : "RKP Desa"}</span>
                             </div>
                             <ChevronDown size={13} className={`transition-transform duration-200 ${isRkpOpen ? 'rotate-180' : ''}`} />
                           </button>

                           <AnimatePresence>
                             {isRkpOpen && (
                               <motion.div
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: "auto", opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 transition={{ duration: 0.15 }}
                                 className="overflow-hidden ml-3 pl-2.5 mt-1 space-y-1 border-l-2 border-white/20"
                               >
                                 {[
                                   { label: isHackerTheme ? "[1. APBDes]" : "1. APBDes", tab: "apbdes", icon: PieChart },
                                   { label: isHackerTheme ? "[2. RKKD ADD]" : "2. RKKD ADD", tab: "rkkd-add", icon: Banknote },
                                   { label: isHackerTheme ? "[3. RKKD DD]" : "3. RKKD DD", tab: "rkkd-dd", icon: Building2 },
                                   { label: isHackerTheme ? "[4. RKKD BHPRD]" : "4. RKKD BHPRD", tab: "rkkd-bhprd", icon: Layers },
                                   { label: isHackerTheme ? "[5. RKKD BANKEU]" : "5. RKKD BANKEU", tab: "rkkd-bankeu", icon: TrendingUp },
                                   { label: isHackerTheme ? "[6. RKKD BANPROV]" : "6. RKKD BANPROV", tab: "rkkd-banprov", icon: Award },
                                 ].map((subItem) => (
                                   <Link
                                     key={subItem.tab}
                                     href={`/dashboard?tab=${subItem.tab}`}
                                     onClick={() => setIsOpen(false)}
                                     className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs group ${
                                       tabParam === subItem.tab
                                         ? (isHackerTheme ? "bg-cyan-800/60 text-cyan-200 font-bold border border-cyan-400/40" : "bg-white/25 text-white font-extrabold shadow-sm")
                                         : (isHackerTheme ? "text-slate-400 hover:bg-slate-800/40 hover:text-cyan-300 font-mono" : "text-white/70 hover:bg-white/10 hover:text-white font-medium")
                                     }`}
                                   >
                                     <subItem.icon size={13} className={`${tabParam === subItem.tab ? 'text-white' : 'text-white/80 group-hover:scale-110 transition-transform'}`} />
                                     <span>{subItem.label}</span>
                                   </Link>
                                 ))}
                               </motion.div>
                             )}
                           </AnimatePresence>
                         </div>

                         {[
                           { label: isHackerTheme ? "[Harga Satuan]" : "Harga Satuan", tab: "harga-satuan", icon: Database },
                           { label: isHackerTheme ? "[AHSP Pekerjaan]" : "AHSP Pekerjaan", tab: "ahsp", icon: Calculator },
                           { label: isHackerTheme ? "[Take Off Sheet]" : "Take Off Sheet", tab: "takeoff", icon: FileText },
                           { label: isHackerTheme ? "[RAB-Desa]" : "RAB Desa", tab: "rab", icon: PieChart },
                           { label: isHackerTheme ? "[S-Curve Tracker]" : "S-Curve Tracker", tab: "scurve", icon: Activity },
                           { label: isHackerTheme ? "[Progress Control]" : "Progress Control", tab: "progress", icon: HardHat },
                         ].map((item) => (
                           <Link
                             key={item.tab}
                             href={`/dashboard?tab=${item.tab}`}
                             onClick={() => setIsOpen(false)}
                             className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm group ${
                               tabParam === item.tab
                                 ? (isHackerTheme ? "bg-cyan-900/50 text-cyan-300 font-bold border border-cyan-500/50 backdrop-blur-sm" : "bg-white/25 text-white font-extrabold shadow-sm")
                                 : (isHackerTheme ? "text-slate-400 hover:bg-slate-800/60 hover:text-cyan-400 font-mono backdrop-blur-sm" : "text-white/70 hover:bg-white/10 hover:text-white font-medium")
                             }`}
                           >
                             <item.icon size={14} className={`${tabParam === item.tab && isHackerTheme ? 'animate-luxury-float luxury-glow-strong text-teal-300' : 'group-hover:animate-luxury-pulse'}`} />
                             <span>{item.label}</span>
                           </Link>
                         ))}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               {/* Pengaturan */}
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsOpen(false)}
                  className={`mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group relative z-10 ${
                    pathname === "/dashboard/settings"
                      ? (isHackerTheme ? "bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-sm" : "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10")
                      : (isHackerTheme ? "text-slate-400 hover:bg-slate-800/60 hover:text-cyan-400 hover:border hover:border-cyan-500/30 font-medium backdrop-blur-sm" : "text-white/80 hover:bg-white/10 hover:text-white font-medium")
                  } ${isCollapsed && !isOpen ? 'justify-center' : ''}`}
                >
                  <Settings size={20} className={`transition-all duration-300 ${pathname === "/dashboard/settings" ? (isHackerTheme ? "animate-luxury-spin luxury-glow-strong text-teal-300" : "") : "group-hover:scale-125 group-hover:text-slate-700 group-hover:animate-spin group-hover:-translate-y-1"}`} />
                  {(!isCollapsed || isOpen) && <span className={`text-sm ${isHackerTheme ? 'font-mono' : ''}`}>Pengaturan</span>}
                </Link>

                {/* Theme Toggle Button Hidden */}
                {/* <button
                  onClick={() => {
                    const isCurrentlyHacker = !document.cookie.includes('themeMode=normal');
                    document.cookie = `themeMode=${isCurrentlyHacker ? 'normal' : 'hacker'}; path=/`;
                    window.location.reload();
                  }}
                  className={`mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group cursor-pointer relative z-10 ${
                    isHackerTheme
                      ? "text-slate-400 hover:bg-slate-800/60 hover:text-cyan-400 hover:border hover:border-cyan-500/30 font-medium backdrop-blur-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  } ${isCollapsed && !isOpen ? 'justify-center' : ''}`}
                >
                  {isHackerTheme ? <Monitor size={20} className="group-hover:scale-110 transition-transform group-hover:animate-luxury-pulse" /> : <Terminal size={20} className="group-hover:scale-110 transition-transform" />}
                  {(!isCollapsed || isOpen) && (
                    <span className={`text-sm text-left flex-1 ${isHackerTheme ? 'font-mono' : ''}`}>
                      {isHackerTheme ? 'Normal Mode' : 'Hacker Mode'}
                    </span>
                  )}
                </button> */}
             </div>
           ) : role === "KASI_KESEJAHTERAAN" ? (
              // === KASI KESEJAHTERAAN ACCORDION SIDEBAR WITH DYNAMIC RGB THEME & VIBRANT ANIMATED ICONS ===
              <div className="space-y-1">
                {/* Dashboard */}
                <Link
                  href="/dashboard?tab=overview"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                    (tabParam || "overview") === "overview"
                      ? getRgbActiveBg()
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                >
                  <LayoutDashboard size={20} className="group-hover:scale-125 transition-transform duration-300" />
                  {(!isCollapsed || isOpen) && <span className="text-sm">Dashboard</span>}
                </Link>

                {/* Group 1: Kemiskinan & Sosial */}
                <div>
                  <button
                    onClick={() => (!isCollapsed || isOpen) && toggleGroup("kemiskinan-sosial")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                      (() => {
                        const isActiveGisGroup = ["warga-bansos", "gis-kemiskinan", "uhc", "usulan-uhc"].includes(tabParam || "");
                        return isActiveGisGroup
                          ? getRgbGroupActiveBg()
                          : "text-white/80 hover:bg-white/10 hover:text-white font-medium";
                      })()
                    } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                  >
                    <HeartHandshake size={20} className="shrink-0 group-hover:scale-125 transition-transform duration-300" />
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
                        <div className="mt-1 ml-3 pl-3 border-l-2 border-white/20 space-y-1">
                          {[
                            { label: "Login SIKS-NG", href: "https://siks.kemensos.go.id/login", isExternal: true, icon: Globe },
                            { label: "Data Bansos Warga", tab: "warga-bansos", icon: Award },
                            { label: "Peta Kerentanan GIS", tab: "gis-kemiskinan", icon: Map },
                            { label: "Monitoring UHC / KIS", tab: "uhc", icon: HeartPulse },
                            { label: "Usulan UHC", tab: "usulan-uhc", icon: FileText },
                            { label: "Portal UHC Kab. Bogor", href: "https://linktr.ee/UHCKABBOGOR", isExternal: true, icon: Globe },
                            { label: "Edabu - BPJS Kesehatan", href: "https://edabu.bpjs-kesehatan.go.id/Edabu/Home/Login", isExternal: true, icon: Activity },
                          ].map((item) => {
                            const Icon = item.icon;
                            if (item.isExternal) {
                              return (
                                <a
                                  key={item.label}
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm text-white/70 hover:bg-white/10 hover:text-white font-medium group"
                                >
                                  <Icon size={16} className="group-hover:scale-125 transition-transform duration-300" />
                                  <span>{item.label}</span>
                                </a>
                              );
                            }
                            return (
                              <Link
                                key={item.tab}
                                href={`/dashboard?tab=${item.tab}`}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm group ${
                                  tabParam === item.tab
                                    ? getRgbSubActiveBg()
                                    : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                                }`}
                              >
                                <Icon size={16} className="group-hover:scale-125 transition-transform duration-300" />
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Group 3: Pendidikan & Agama */}
                <div>
                  <button
                    onClick={() => (!isCollapsed || isOpen) && toggleGroup("pendidikan-agama")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                      ["ats", "insentif", "pengangguran"].includes(tabParam || "")
                        ? getRgbGroupActiveBg()
                        : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                    } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                  >
                    <Compass size={20} className="shrink-0 group-hover:scale-125 transition-transform duration-300" />
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
                        <div className="mt-1 ml-3 pl-3 border-l-2 border-white/20 space-y-1">
                          {[
                            { label: "Anak Putus Sekolah", tab: "ats", icon: Milestone },
                            { label: "Insentif Guru Ngaji", tab: "insentif", icon: Banknote },
                            { label: "Data Pengangguran", tab: "pengangguran", icon: Briefcase },
                          ].map(({ label, tab, icon: Icon }) => (
                            <Link
                              key={tab}
                              href={`/dashboard?tab=${tab}`}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm group ${
                                tabParam === tab
                                  ? getRgbSubActiveBg()
                                  : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                              }`}
                            >
                              <Icon size={16} className="group-hover:scale-125 transition-transform duration-300" />
                              <span>{label}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Group 4: Laporan LPJ Kesra Dropdown */}
                <div>
                  <button
                    onClick={() => (!isCollapsed || isOpen) && toggleGroup("lpj-kesra")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                      ["lpj-registrasi-pembangunan", "lpj-pesanan-barang", "lpj-daftar-hadir-pekerja", "lpj-tanda-terima-pekerja", "lpj-daftar-ktp-pekerja", "lpj-bast-pekerjaan", "report"].includes(tabParam || "")
                        ? getRgbGroupActiveBg()
                        : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                    } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                  >
                    <FileText size={20} className="shrink-0 group-hover:scale-125 transition-all duration-300" />
                    {(!isCollapsed || isOpen) && (
                      <>
                        <span className="text-sm flex-1 text-left font-bold">Laporan LPJ Kesra</span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${openGroup === "lpj-kesra" ? "rotate-180" : ""}`}
                        />
                      </>
                    )}
                  </button>
                  <AnimatePresence>
                    {(openGroup === "lpj-kesra" && (!isCollapsed || isOpen)) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 ml-3 pl-3 border-l-2 border-white/20 space-y-1">
                          {[
                            { label: "1. Registrasi Pembangunan", tab: "lpj-registrasi-pembangunan", icon: Building2 },
                            { label: "2. Pesanan Barang", tab: "lpj-pesanan-barang", icon: ShoppingBag },
                            { label: "3. Daftar KTP Pekerja", tab: "lpj-daftar-ktp-pekerja", icon: Fingerprint },
                            { label: "4. Daftar Hadir Pekerja", tab: "lpj-daftar-hadir-pekerja", icon: Users },
                            { label: "5. Tanda Terima Pekerja", tab: "lpj-tanda-terima-pekerja", icon: CheckCircle2 },
                            { label: "6. BAST Pekerjaan", tab: "lpj-bast-pekerjaan", icon: FileCheck },
                          ].map(({ label, tab, icon: Icon }) => (
                            <Link
                              key={tab}
                              href={`/dashboard?tab=${tab}`}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm group ${
                                tabParam === tab
                                  ? getRgbSubActiveBg()
                                  : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                              }`}
                            >
                              <Icon size={16} className="group-hover:scale-125 transition-transform duration-300" />
                              <span>{label}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Data Kependudukan */}
                <Link
                  href="/dashboard?tab=kependudukan"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                    tabParam === "kependudukan"
                      ? getRgbActiveBg()
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                >
                  <Users size={20} className="group-hover:scale-125 transition-transform duration-300" />
                  {(!isCollapsed || isOpen) && <span className="text-sm">Data Kependudukan</span>}
                </Link>

                {/* Cloud / Penyimpanan */}
                <Link
                  href="/dashboard?tab=cloud"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                    tabParam === "cloud"
                      ? getRgbActiveBg()
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                >
                  <FolderArchive size={20} className="group-hover:scale-125 transition-all duration-300" />
                  {(!isCollapsed || isOpen) && <span className="text-sm">Cloud / Penyimpanan</span>}
                </Link>

               {/* Pengaturan */}
               <Link
                 href="/dashboard/settings"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   pathname === "/dashboard/settings"
                     ? getRgbActiveBg()
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <Settings size={20} />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Pengaturan</span>}
               </Link>
             </div>
          ) : role === "PUSKESOS" ? (
             // === PUSKESOS ACCORDION SIDEBAR ===
             <div className="space-y-1">
               {/* Dashboard */}
               <Link
                 href="/dashboard?tab=overview"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   (tabParam || "overview") === "overview"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Dashboard Utama</span>}
               </Link>

               {/* Layanan Pengaduan */}
               <Link
                 href="/dashboard?tab=pengaduan"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "pengaduan"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Layanan Pengaduan</span>}
               </Link>

               {/* Manajemen Rujukan */}
               <Link
                 href="/dashboard?tab=rujukan"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "rujukan"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <FileText size={20} className="group-hover:scale-110 transition-transform" />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Manajemen Rujukan (SLRT)</span>}
               </Link>

               {/* Data PPKS & Penjangkauan */}
               <Link
                 href="/dashboard?tab=ppks"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "ppks"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <HeartHandshake size={20} className="group-hover:scale-110 transition-transform" />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Data PPKS</span>}
               </Link>

               {/* Peta Kerentanan GIS */}
               <Link
                 href="/dashboard?tab=gis-kemiskinan"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "gis-kemiskinan"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <Map size={20} className="group-hover:scale-110 transition-transform" />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Peta Kerentanan GIS</span>}
               </Link>

               {/* Laporan Kegiatan & LPJ */}
               <Link
                 href="/dashboard?tab=laporan"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "laporan"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Laporan Kegiatan & LPJ</span>}
               </Link>

               {/* Usulan UHC */}
               <Link
                 href="/dashboard?tab=uhc"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "uhc"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <HeartPulse size={20} className="group-hover:scale-110 transition-transform" />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Usulan UHC</span>}
               </Link>

               {/* Data Warga */}
               <Link
                 href="/dashboard?tab=warga"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "warga"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <Users size={20} className="group-hover:scale-110 transition-transform" />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Data Warga</span>}
               </Link>

               {/* Data Pengurus */}
               <Link
                 href="/dashboard?tab=pengurus"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "pengurus"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <Users size={20} className="group-hover:scale-110 transition-transform" />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Data Pengurus</span>}
               </Link>

               {/* CUSTOM DROPDOWN LAPORAN FOR PUSKESOS */}
               <div className="mt-2">
                 <button
                   onClick={() => setOpenGroup(prev => prev === "laporan-puskesos" ? null : "laporan-puskesos")}
                   className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                     openGroup === "laporan-puskesos"
                       ? "bg-white/15 text-white font-bold"
                       : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                   } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                 >
                   <div className="flex items-center gap-3">
                     <FolderArchive size={20} />
                     {(!isCollapsed || isOpen) && (
                       <span className="text-[11px] font-bold tracking-widest uppercase">Laporan</span>
                     )}
                   </div>
                   {(!isCollapsed || isOpen) && (
                     <ChevronDown
                       size={14}
                       className={`transition-transform duration-200 ${openGroup === "laporan-puskesos" ? "rotate-180" : ""}`}
                     />
                   )}
                 </button>
                 <AnimatePresence>
                   {(openGroup === "laporan-puskesos" && (!isCollapsed || isOpen)) && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.2 }}
                       className="overflow-hidden"
                     >
                       <div className="mt-1 ml-4 pl-3 border-l-2 border-white/20 space-y-1">
                         {[
                           { label: "Buku Tamu", href: "/dashboard/puskesos/buku-tamu", icon: FileText },
                           { label: "Laporan Pengajuan", href: "/dashboard/puskesos/laporan-pengajuan", icon: Activity },
                         ].map((subItem) => (
                           <Link
                             key={subItem.href}
                             href={subItem.href}
                             onClick={() => setIsOpen(false)}
                             className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm ${
                               pathname === subItem.href
                                 ? "bg-white/25 text-white font-extrabold shadow-sm"
                                 : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                             }`}
                           >
                             <subItem.icon size={14} className="group-hover:scale-125 transition-transform" />
                             <span>{subItem.label}</span>
                           </Link>
                         ))}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               {/* Pengaturan */}
               <Link
                 href="/dashboard/settings"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   pathname === "/dashboard/settings"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <Settings size={20} className="text-slate-400 group-hover:text-slate-700 group-hover:rotate-90 transition-all duration-500" />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Pengaturan</span>}
               </Link>
             </div>
          ) : role === "KASI_PELAYANAN" ? (
             // === KASI PELAYANAN ACCORDION SIDEBAR ===
             <div className="space-y-1">
               {/* Dashboard Utama */}
               <Link
                 href="/dashboard?tab=overview"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   (tabParam || "overview") === "overview"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <LayoutDashboard size={20} />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Dashboard Utama</span>}
               </Link>
               
               {/* Manajemen Antrian Loket */}
               <Link
                 href="/dashboard?tab=antrian-loket"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "antrian-loket"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <Users size={20} />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Antrian Loket</span>}
               </Link>

               {/* Pusat Persuratan Dropdown */}
               <div>
                 <button
                   onClick={() => (!isCollapsed || isOpen) && toggleGroup("persuratan")}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                     ["buat-surat", "surat-masuk", "surat-keluar"].includes(tabParam || "")
                       ? "bg-white/15 text-white font-bold"
                       : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                   } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                 >
                   <FileText size={20} className="shrink-0" />
                   {(!isCollapsed || isOpen) && (
                     <>
                       <span className="text-sm flex-1 text-left">Pusat Persuratan</span>
                       <ChevronDown size={14} className={`transition-transform duration-200 ${openGroup === "persuratan" ? "rotate-180" : ""}`} />
                     </>
                   )}
                 </button>
                 <AnimatePresence>
                   {(openGroup === "persuratan" && (!isCollapsed || isOpen)) && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.2 }}
                       className="overflow-hidden"
                     >
                       <div className="mt-1 ml-3 pl-3 border-l-2 border-white/20 space-y-1">
                         {[
                           { label: "Buat Surat Baru", tab: "buat-surat", icon: Plus },
                           { label: "Agenda Surat Masuk", tab: "surat-masuk", icon: Folder },
                           { label: "Agenda Surat Keluar", tab: "surat-keluar", icon: FolderArchive },
                         ].map(({ label, tab, icon: Icon }) => (
                           <Link
                             key={tab}
                             href={`/dashboard?tab=${tab}`}
                             onClick={() => setIsOpen(false)}
                             className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm ${
                               tabParam === tab ? "bg-white/25 text-white font-extrabold shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
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

               {/* Manajemen Kependudukan */}
               <Link
                 href="/dashboard?tab=kependudukan"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "kependudukan"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <Database size={20} />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Data Kependudukan</span>}
               </Link>

               {/* Tracking Layanan */}
               <Link
                 href="/dashboard?tab=tracking-layanan"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "tracking-layanan"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <Clock size={20} />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Tracking Layanan</span>}
               </Link>

               {/* Layanan Umum Dropdown */}
               <div>
                 <button
                   onClick={() => (!isCollapsed || isOpen) && toggleGroup("layanan-umum")}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                     ["buku-tamu", "reporting", "tte"].includes(tabParam || "")
                       ? "bg-white/15 text-white font-bold"
                       : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                   } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                 >
                   <HeartHandshake size={20} className="shrink-0" />
                   {(!isCollapsed || isOpen) && (
                     <>
                       <span className="text-sm flex-1 text-left">Layanan Umum</span>
                       <ChevronDown size={14} className={`transition-transform duration-200 ${openGroup === "layanan-umum" ? "rotate-180" : ""}`} />
                     </>
                   )}
                 </button>
                 <AnimatePresence>
                   {(openGroup === "layanan-umum" && (!isCollapsed || isOpen)) && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.2 }}
                       className="overflow-hidden"
                     >
                       <div className="mt-1 ml-3 pl-3 border-l-2 border-white/20 space-y-1">
                         {[
                           { label: "Buku Tamu Digital", tab: "buku-tamu", icon: ClipboardList },
                           { label: "Laporan Pelayanan", tab: "reporting", icon: BarChart3 },
                           { label: "Pengaturan TTE", tab: "tte", icon: ShieldCheck },
                         ].map(({ label, tab, icon: Icon }) => (
                           <Link
                             key={tab}
                             href={`/dashboard?tab=${tab}`}
                             onClick={() => setIsOpen(false)}
                             className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm ${
                               tabParam === tab ? "bg-white/25 text-white font-extrabold shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
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

               {/* Laporan Posyandu Dropdown */}
               <div>
                 <button
                   onClick={() => (!isCollapsed || isOpen) && toggleGroup("laporan-posyandu")}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                     (tabParam || "").startsWith("posyandu-")
                       ? "bg-white/15 text-white font-bold"
                       : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                   } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                 >
                   <HeartPulse size={20} className="shrink-0" />
                   {(!isCollapsed || isOpen) && (
                     <>
                       <span className="text-sm flex-1 text-left">Laporan Posyandu</span>
                       <ChevronDown size={14} className={`transition-transform duration-200 ${openGroup === "laporan-posyandu" ? "rotate-180" : ""}`} />
                     </>
                   )}
                 </button>
                 <AnimatePresence>
                   {(openGroup === "laporan-posyandu" && (!isCollapsed || isOpen)) && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.2 }}
                       className="overflow-hidden"
                     >
                       <div className="mt-1 ml-3 pl-3 border-l-2 border-white/20 space-y-1">
                         {[
                           { label: "Posyandu Mawar I", tab: "posyandu-mawar-1" },
                           { label: "Posyandu Mawar II", tab: "posyandu-mawar-2" },
                           { label: "Posyandu Mawar III", tab: "posyandu-mawar-3" },
                           { label: "Posyandu Mawar IV", tab: "posyandu-mawar-4" },
                           { label: "Posyandu Mawar V", tab: "posyandu-mawar-5" },
                           { label: "Posyandu Mawar VI", tab: "posyandu-mawar-6" },
                           { label: "Posyandu Mawar VII", tab: "posyandu-mawar-7" },
                         ].map(({ label, tab }) => (
                           <Link
                             key={tab}
                             href={`/dashboard?tab=${tab}`}
                             onClick={() => setIsOpen(false)}
                             className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm ${
                               tabParam === tab ? "bg-white/25 text-white font-extrabold shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                             }`}
                           >
                             <Baby size={16} />
                             <span>{label}</span>
                           </Link>
                         ))}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               {/* Laporan Karang Taruna */}
               <Link
                 href="/dashboard?tab=karang-taruna"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "karang-taruna"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <UserCircle size={20} />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Laporan Karang Taruna</span>}
               </Link>

               {/* Laporan Kegiatan */}
               <Link
                 href="/dashboard?tab=laporan-kegiatan"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   tabParam === "laporan-kegiatan"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <Activity size={20} />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Laporan Kegiatan</span>}
               </Link>

               {/* Pengaturan */}
               <Link
                 href="/dashboard/settings"
                 onClick={() => setIsOpen(false)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                   pathname === "/dashboard/settings"
                     ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                     : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                 } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
               >
                 <Settings size={20} />
                 {(!isCollapsed || isOpen) && <span className="text-sm">Pengaturan</span>}
               </Link>
             </div>
          ) : ["ADMIN_DESA", "ADMIN_MASTER", "KADES", "SEKDES"].includes(role as string) ? (
            // === ADMIN DESA / EKSEKUTIF ORGANIZED CATEGORIZED SIDEBAR ===
            <div className="space-y-2 pb-6">
              {adminDesaMenuGroups.map((group, groupIdx) => (
                <div key={group.category} className="space-y-1">
                  {/* Section Header */}
                  <div className={`pb-1 ${groupIdx > 0 ? "pt-3.5" : "pt-1"} ${isCollapsed && !isOpen ? "px-1" : "px-3"}`}>
                    {isCollapsed && !isOpen ? (
                      groupIdx > 0 ? <div className={`h-[1px] w-full my-1 ${isAdminDesaRole ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700/60'}`} /> : null
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isHackerTheme ? "text-cyan-400/80 font-mono" : isAdminDesaRole ? "text-white/70 tracking-widest font-bold" : "text-slate-400 dark:text-slate-500"}`}>
                          {group.category}
                        </span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${isHackerTheme ? "bg-cyan-950 text-cyan-300 border border-cyan-800" : isAdminDesaRole ? "bg-white/15 text-white font-bold" : "text-slate-400/90 bg-slate-100 dark:bg-slate-800/80"}`}>
                          {group.items.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.href || (item.href !== "/umkm" && pathname.startsWith(item.href));

                      const badgeCount = item.badgeKey === "unverifiedWarga"
                        ? adminStats.unverifiedWarga
                        : item.badgeKey === "suratPending"
                        ? adminStats.suratPending
                        : 0;

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          prefetch={false}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all group ${
                            isActive
                              ? (isHackerTheme
                                  ? "bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                  : isAdminDesaRole
                                  ? "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10"
                                  : "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20")
                              : (isHackerTheme
                                  ? "text-slate-400 hover:bg-slate-800/80 hover:text-cyan-400 hover:border hover:border-cyan-500/30 font-medium"
                                  : isAdminDesaRole
                                  ? "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium")
                          } ${isCollapsed && !isOpen ? "justify-center !px-2" : ""}`}
                          title={isCollapsed && !isOpen ? item.name : undefined}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <item.icon
                              size={19}
                              className={`shrink-0 transition-transform ${
                                isActive ? "" : "group-hover:scale-110"
                              } ${isHackerTheme && isActive ? "animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : ""}`}
                            />
                            {(!isCollapsed || isOpen) && (
                              <span className={`text-sm truncate ${isHackerTheme ? "font-mono" : ""}`}>
                                {item.name}
                              </span>
                            )}
                          </div>

                          {/* Live Badge Counter */}
                          {(!isCollapsed || isOpen) && badgeCount > 0 && (
                            <span
                              className={`ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full shrink-0 shadow-sm ${
                                isActive
                                  ? (isAdminDesaRole ? "bg-[#1d64ec] text-white" : "bg-white text-emerald-700")
                                  : item.badgeColor || "bg-rose-500 text-white"
                              }`}
                            >
                              {badgeCount > 99 ? "99+" : badgeCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // === ALL OTHER ROLES: Generic list ===
            <div className="space-y-1.5">
              {(() => {
                let itemsToRender = menuItems.filter(item => {
                    if (role === "OPERATOR_DESA") {
                        // Fitur spesifik Operator Desa (Log & Sistem removed as requested)
                        return ["Dashboard", "Verifikasi Warga", "Pusat Persuratan", "Manajemen Konten (CMS)"].includes(item.name);
                    }
                    if (["ADMIN_DESA", "KADES", "SEKDES", "PERANGKAT_DESA", "ADMIN_MASTER"].includes(role as string)) {
                        if (role === "ADMIN_DESA" && item.name === "Usulan Musrenbang") return false;
                        if (item.name === "Arsip Laporan" && !["ADMIN_DESA", "ADMIN_MASTER", "KADES"].includes(role as string)) return false;
                        return true;
                    }
                  if (role === "KAUR_KEUANGAN") {
                    return ["Dashboard", "APBDes", "Pengaturan"].includes(item.name);
                  }
                  if (role === "KAUR_TU") {
                    return ["Dashboard", "Pusat Persuratan", "Inventaris Aset Desa", "Aparatur Desa", "Arsip Digital", "Pengaturan"].includes(item.name);
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
                  if (["PKK", "TP_PKK", "BPD", "PUSKESOS", "PETUGAS_SENSUS"].includes(role as string)) {
                     return ["Dashboard", "Pusat Persuratan", "Data Kependudukan", "Usulan Musrenbang", "Tracking Layanan", "Peta Interaktif"].includes(item.name);
                  }
                  if (role === "KADUS") {
                     return ["Dashboard", "Data Kependudukan", "Data Bansos", "Pusat Persuratan", "Infrastruktur", "Peta Interaktif", "Pengaturan"].includes(item.name);
                  }
                  if (role === "BUMDES") {
                     return ["Dashboard", "BUMDES"].includes(item.name);
                  }
                  return false;
                });

                if (role === "LPM") {
                  itemsToRender = [
                    { name: "Dashboard", icon: LayoutDashboard, href: "/kelembagaan?tab=overview" },
                    { name: "Usulan Musrenbang", icon: Banknote, href: "/kelembagaan/musrenbang" },
                    { name: "Program Kerja", icon: Activity, href: "/kelembagaan?tab=program" },
                    { name: "Pemberdayaan", icon: Sparkles, href: "/kelembagaan?tab=pemberdayaan" },
                    { name: "Swadaya & Gotong Royong", icon: HeartHandshake, href: "/kelembagaan?tab=swadaya" },
                    { name: "Susunan Pengurus", icon: Users, href: "/kelembagaan?tab=pengurus" }
                  ];
                }

                if (role === "KARANG_TARUNA") {
                  itemsToRender = [
                    { name: "Dashboard Utama", icon: LayoutDashboard, href: "/kelembagaan?tab=overview" },
                    { name: "Database Keanggotaan", icon: Users, href: "/kelembagaan?tab=anggota" },
                    { name: "Manajemen Keuangan", icon: Banknote, href: "/kelembagaan?tab=finance" },
                    { name: "Administrasi & E-Office", icon: FileText, href: "/kelembagaan?tab=eoffice" },
                    { name: "Sistem Inventaris", icon: Package, href: "/kelembagaan?tab=inventory" },
                    { name: "Program & Kegiatan", icon: Activity, href: "/kelembagaan?tab=kegiatan" },
                    { name: "Pemberdayaan UEP", icon: Briefcase, href: "/kelembagaan?tab=wirausaha" },
                    { name: "Galeri & Arsip LPJ", icon: FolderArchive, href: "/kelembagaan?tab=gallery" },
                    { name: "Usulan Musrenbang", icon: Banknote, href: "/kelembagaan/musrenbang" },
                  ];
                }

                if (role === "PUSKESOS") {
                  itemsToRender = [
                    { name: "Statistik Real-time", icon: LayoutDashboard, href: "/dashboard?tab=overview" },
                    { name: "Data Warga", icon: Users, href: "/dashboard?tab=warga" },
                    { name: "Layanan Pengaduan", icon: MessageSquare, href: "/dashboard?tab=pengaduan" },
                    { name: "Manajemen Rujukan", icon: FileText, href: "/dashboard?tab=rujukan" },
                    { name: "Usulan UHC", icon: HeartPulse, href: "/dashboard?tab=uhc" },
                    { name: "Penjangkauan PPKS", icon: HeartHandshake, href: "/dashboard?tab=ppks" },
                    { name: "Data Pengurus", icon: Users, href: "/dashboard?tab=pengurus" }
                  ];
                }

                const isRwRole = role === "RW" || String(role || "").toUpperCase() === "RW" || Boolean((session?.user as any)?.rw && (!(session?.user as any)?.rt || (session?.user as any)?.rt === "000"));

                if (role === "RT" || role === "RW" || isRwRole) {
                  itemsToRender = [
                    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard?tab=overview" },
                    { name: "Data Warga", icon: Users, href: "/dashboard?tab=warga" },
                    { name: "Rumah Warga", icon: HomeIcon, href: "/dashboard?tab=rumah" },
                    { name: isRwRole ? "Kas Keuangan RW" : "Kas Keuangan", icon: Banknote, href: "/dashboard?tab=finance" },
                    { name: "Cek Surat", icon: FileText, href: "/dashboard?tab=surat" },
                    { name: "Laporan Kegiatan", icon: Sparkles, href: "/dashboard?tab=kegiatan" },
                    { name: "Laporan LAMPID", icon: Milestone, href: "/dashboard?tab=lampid" },
                    { name: "Pengumuman", icon: Megaphone, href: "/dashboard?tab=announcements" },
                    { name: "Aduan Warga", icon: AlertCircle, href: "/dashboard?tab=complaints" },
                    { name: isRwRole ? "Inventaris RW" : "Inventaris RT", icon: Package, href: "/dashboard?tab=inventory" },
                    { name: "GeoSENSUS", icon: Compass, href: "/dashboard?tab=geosensus" },
                    { name: "Data Bansos", icon: HeartHandshake, href: "/dashboard?tab=bansos" },
                    { name: "Keamanan Lingkungan", icon: ShieldCheck, href: "/dashboard?tab=security" },
                    { name: "Usulan Musrenbang", icon: Banknote, href: "/kelembagaan/musrenbang" }
                  ];
                  if (isRwRole) {
                    itemsToRender.push(
                      { name: "Posyandu & Kesehatan", icon: HeartPulse, href: "/dashboard?tab=health" },
                      { name: "Kelembagaan RW", icon: Building2, href: "/dashboard?tab=institutions" }
                    );
                  }
                }

                if (!itemsToRender.find(item => item.name === 'Pengaturan')) {
                    itemsToRender.push({ name: 'Pengaturan', icon: Settings, href: '/dashboard/settings' });
                }

                return (
                  <>
                    {itemsToRender.map((item) => {
                      const isInstitutional = ["PKK", "TP_PKK", "LPM", "BPD", "KARANG_TARUNA", "PETUGAS_SENSUS"].includes(role as string);
                      let href = item.href;
                      if (isInstitutional && role !== "LPM" && item.name !== "Usulan Musrenbang") {
                          if (href === "/dashboard") href = "/kelembagaan";
                          else if (!href.includes("/settings")) href = href.replace("/dashboard/", "/kelembagaan/");
                      } else if (isInstitutional && item.name === "Usulan Musrenbang") {
                          href = "/kelembagaan/musrenbang";
                      }
                      let isActive = false;
                      if (role === "RT" || role === "RW" || role === "LPM" || role === "PUSKESOS") {
                        const urlTab = tabParam || "overview";
                        const itemTab = item.href.split("tab=")[1] || "overview";
                        isActive = (pathname === "/dashboard" || pathname === "/kelembagaan") && urlTab === itemTab;
                        if (item.name === "Usulan Musrenbang" && role === "LPM") {
                          isActive = pathname === "/kelembagaan/musrenbang";
                        }
                      } else {
                        isActive = pathname === href;
                      }

                      if (item.name === "Usulan Musrenbang") {
                        const isMusrenbangActive = pathname === "/kelembagaan/musrenbang" || ["musling-rw", "musrenbang", "undangan-musrenbang"].includes(tabParam || "");
                        return (
                          <div key={item.name} className="pt-1 relative z-10">
                            <button
                              type="button"
                              onClick={() => (!isCollapsed || isOpen) && setIsMusrenbangOpen(!isMusrenbangOpen)}
                              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                                isMusrenbangActive
                                  ? (isHackerTheme 
                                      ? "bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-sm" 
                                      : "bg-white/15 text-white font-bold")
                                  : (isHackerTheme 
                                      ? "text-slate-400 hover:bg-slate-800/60 hover:text-cyan-400 hover:border hover:border-cyan-500/30 font-medium backdrop-blur-sm" 
                                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium")
                              } ${isCollapsed && !isOpen ? "justify-center" : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon size={20} className={`shrink-0 transition-all duration-300 ${isMusrenbangActive && isHackerTheme ? 'animate-luxury-pulse luxury-glow-strong text-teal-300' : 'group-hover:scale-125 transition-transform'}`} />
                                {(!isCollapsed || isOpen) && <span className={`text-sm ${isHackerTheme ? 'font-mono' : ''}`}>{item.name}</span>}
                              </div>
                              {(!isCollapsed || isOpen) && (
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isMusrenbangOpen ? 'rotate-180' : ''}`} />
                              )}
                            </button>
                            <AnimatePresence>
                              {(isMusrenbangOpen && (!isCollapsed || isOpen)) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                   <div className={`mt-1 ml-3 pl-3 border-l space-y-1 ${isHackerTheme ? 'border-cyan-500/30' : 'border-white/20'}`}>
                                      {(role === "RT" ? [
                                        { label: isHackerTheme ? "[1. Draft Usulan RT]" : "1. DRAFT USULAN RT", tab: "musling-rw", sub: "draft-usulan", icon: Lightbulb, type: "tab" },
                                      ] : [
                                        { label: isHackerTheme ? "[1. Rekapan Usulan]" : "1. REKAPAN USULAN", tab: "musling-rw", sub: "rekapan", icon: FileText, type: "tab" },
                                        { label: isHackerTheme ? "[2. Undangan Musling]" : "2. UNDANGAN MUSLING", tab: "musling-rw", sub: "undangan", icon: Mail, type: "tab" },
                                        { label: isHackerTheme ? "[3. Daftar Hadir]" : "3. DAFTAR HADIR", tab: "musling-rw", sub: "daftar-hadir", icon: Users, type: "tab" },
                                        { label: isHackerTheme ? "[4. Draft Usulan RW]" : "4. DRAFT USULAN RW", tab: "musling-rw", sub: "draft-usulan", icon: Lightbulb, type: "tab" },
                                      ]).map((subItem) => {
                                        const isSubActive = subItem.type === "direct"
                                          ? pathname === "/kelembagaan/musrenbang"
                                          : ((pathname === "/dashboard" || pathname === "/kelembagaan") && tabParam === subItem.tab && (subParam === subItem.sub || (!subParam && (role === "RT" ? subItem.sub === "draft-usulan" : subItem.sub === "rekapan"))));
                                        const targetHref = subItem.type === "direct" ? ((subItem as any).href ?? "/kelembagaan/musrenbang") : `/dashboard?tab=${subItem.tab}&sub=${subItem.sub}`;
                                       return (
                                         <Link
                                           key={subItem.label}
                                           href={targetHref}
                                           onClick={() => setIsOpen(false)}
                                           className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs group ${
                                             isSubActive
                                               ? (isHackerTheme ? "bg-cyan-900/50 text-cyan-300 font-bold border border-cyan-500/50 backdrop-blur-sm" : "bg-white/25 text-white font-extrabold shadow-sm")
                                               : (isHackerTheme ? "text-slate-400 hover:bg-slate-800/60 hover:text-cyan-400 font-mono backdrop-blur-sm" : "text-white/70 hover:bg-white/10 hover:text-white font-medium")
                                           }`}
                                         >
                                           <subItem.icon size={14} className={`${isSubActive ? 'text-white' : 'text-white/80 group-hover:scale-110 transition-transform'}`} />
                                           <span>{subItem.label}</span>
                                         </Link>
                                       );
                                     })}
                                   </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={item.name}
                          href={href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                            isActive
                              ? (isHackerTheme 
                                  ? "bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                                  : "bg-white text-[#1d64ec] font-black shadow-lg shadow-black/10")
                              : (isHackerTheme
                                  ? "text-slate-400 hover:bg-slate-800/80 hover:text-cyan-400 hover:border hover:border-cyan-500/30 font-medium"
                                  : "text-white/80 hover:bg-white/10 hover:text-white font-medium")
                          } ${isCollapsed && !isOpen ? 'justify-center' : ''}`}
                        >
                          <item.icon size={20} className={`${isActive ? "" : "group-hover:scale-110 transition-transform"} ${isHackerTheme && isActive ? 'animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''}`} />
                          {(!isCollapsed || isOpen) && <span className={`text-sm ${isHackerTheme ? 'font-mono' : ''}`}>{item.name}</span>}
                        </Link>
                      );
                    })}

                    {/* CUSTOM DROPDOWN LAPORAN FOR OPERATOR_DESA */}
                    {role === "OPERATOR_DESA" && (
                      <div className="mt-2">
                        <button
                          onClick={() => setOpenGroup(prev => prev === "laporan-operator" ? null : "laporan-operator")}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group cursor-pointer ${
                            openGroup === "laporan-operator"
                              ? "bg-white/15 text-white font-bold"
                              : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                          } ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <FolderArchive size={20} />
                            {(!isCollapsed || isOpen) && (
                              <span className="text-[11px] font-bold tracking-widest uppercase">Laporan</span>
                            )}
                          </div>
                          {(!isCollapsed || isOpen) && (
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-200 ${openGroup === "laporan-operator" ? "rotate-180" : ""}`}
                            />
                          )}
                        </button>
                        <AnimatePresence>
                          {(openGroup === "laporan-operator" && (!isCollapsed || isOpen)) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className={`mt-1 ml-4 pl-3 border-l-2 space-y-1 ${isHackerTheme ? 'border-cyan-500/30' : 'border-white/20'}`}>
                                {[
                                  { label: "Standar Harga Satuan", href: "/dashboard/laporan/harga-satuan", tab: "harga-satuan", icon: Database },
                                  { label: "1. Registrasi Pembangunan", href: "/dashboard/laporan/registrasi-pembangunan", tab: "lpj-registrasi-pembangunan", icon: Building2 },
                                  { label: "2. Pesanan Barang", href: "/dashboard/laporan/pesanan-barang", tab: "lpj-pesanan-barang", icon: ShoppingBag },
                                  { label: "3. Daftar KTP Pekerja", href: "/dashboard/laporan/daftar-ktp-pekerja", tab: "lpj-daftar-ktp-pekerja", icon: Fingerprint },
                                  { label: "4. Daftar Hadir Pekerja", href: "/dashboard/laporan/daftar-hadir-pekerja", tab: "lpj-daftar-hadir-pekerja", icon: Users },
                                  { label: "5. Tanda Terima Pekerja", href: "/dashboard/laporan/tanda-terima-pekerja", tab: "lpj-tanda-terima-pekerja", icon: CheckCircle2 },
                                  { label: "6. BAST Pekerjaan", href: "/dashboard/laporan/bast-pekerjaan", tab: "lpj-bast-pekerjaan", icon: FileCheck },
                                  { label: "Kegiatan Perangkat", href: "/dashboard/laporan/kegiatan-perangkat", tab: "kegiatan-perangkat", icon: Activity },
                                ].map((subItem) => {
                                  const isActive = pathname === subItem.href || (subItem.tab && tabParam === subItem.tab);
                                  return (
                                    <Link
                                      key={subItem.href}
                                      href={subItem.href}
                                      onClick={() => setIsOpen(false)}
                                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm ${
                                        isActive
                                          ? (isHackerTheme ? "bg-cyan-900/50 text-cyan-300 font-bold" : "bg-white/25 text-white font-extrabold shadow-sm")
                                          : (isHackerTheme ? "text-slate-400 hover:text-cyan-400 font-mono" : "text-white/70 hover:bg-white/10 hover:text-white font-medium")
                                      }`}
                                    >
                                      <subItem.icon size={14} />
                                      <span>{subItem.label}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    {/* CUSTOM DROPDOWN LAPORAN FOR PUSKESOS */}
                    {role === "PUSKESOS" && (
                      <div className="mt-2">
                        <button
                          onClick={() => setOpenGroup(prev => prev === "laporan-puskesos" ? null : "laporan-puskesos")}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isHackerTheme ? "text-slate-400 hover:text-cyan-400 font-mono" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"} ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <FolderArchive size={20} />
                            {(!isCollapsed || isOpen) && (
                              <span className="text-[11px] font-bold tracking-widest uppercase">Laporan</span>
                            )}
                          </div>
                          {(!isCollapsed || isOpen) && (
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-200 ${openGroup === "laporan-puskesos" ? "rotate-180" : ""}`}
                            />
                          )}
                        </button>
                        <AnimatePresence>
                          {(openGroup === "laporan-puskesos" && (!isCollapsed || isOpen)) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className={`mt-1 ml-4 pl-3 border-l space-y-1 ${isHackerTheme ? 'border-cyan-500/30' : 'border-blue-100'}`}>
                                {[
                                  { label: "Buku Tamu", href: "/dashboard/puskesos/buku-tamu", icon: FileText },
                                  { label: "Laporan Pengajuan", href: "/dashboard/puskesos/laporan-pengajuan", icon: Activity },
                                ].map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-sm ${
                                      pathname === subItem.href
                                        ? (isHackerTheme ? "bg-cyan-900/50 text-cyan-300 font-bold" : "bg-emerald-50 text-emerald-700 font-bold")
                                        : (isHackerTheme ? "text-slate-400 hover:text-cyan-400 font-mono" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")
                                    }`}
                                  >
                                    <subItem.icon size={14} />
                                    <span>{subItem.label}</span>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </nav>


        {/* STORAGE DETAILS / STATUS SISTEM WIDGET (Harmonized for Desktop) */}
        {(!isCollapsed || isOpen) && (
          <div className="px-4 py-3 mx-3 my-2 rounded-2xl bg-white/10 border border-white/15 text-white">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-2.5">
              STATUS SISTEM DESA
            </span>
            {/* Server / Cloud Storage Bar */}
            <div className="space-y-1 mb-2.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-white/90">
                <span className="flex items-center gap-1.5"><Cloud size={13} className="text-white/80" /> Arsip Surat</span>
                <span className="text-[10px] text-white/70 font-mono">24.5 MB / 1 GB</span>
              </div>
              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-[25%]" />
              </div>
            </div>
            {/* Database Capacity Bar */}
            <div className="space-y-1 mb-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-white/90">
                <span className="flex items-center gap-1.5"><Database size={13} className="text-white/80" /> Basis Data Warga</span>
                <span className="text-[10px] text-white/70 font-mono">1.2k / 10k</span>
              </div>
              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-[12%]" />
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MOBILE BOTTOM NAVIGATION DOCK (CURVED DESIGN WITH DYNAMIC MODALS - FULL WIDTH) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 w-full h-[75px] select-none">
          {/* SVG Background with Notch */}
          <div className="absolute inset-0 z-0 pointer-events-none">
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
                  href={["TP_PKK", "PKK", "LPM", "BPD", "KARANG_TARUNA"].includes(role) ? "/kelembagaan?tab=overview" : "/dashboard?tab=overview"}
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

              {/* BUTTON 4: CHAT (formerly Laporan) */}
              <button 
                  onClick={() => window.dispatchEvent(new Event('open-chat-mobile'))}
                  className="w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all text-slate-400 hover:text-slate-600"
              >
                  <MessageSquare size={20} className="stroke-[1.8]" />
                  <span className="text-[9px] font-bold mt-0.5 tracking-tight">Pesan</span>
              </button>

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

      {/* GLOBAL NOTIFICATION PANEL DRAWER */}
      <GlobalNotificationPanel 
          isOpen={isNotifOpen} 
          onClose={() => setIsNotifOpen(false)} 
          isHackerTheme={isHackerTheme} 
      />
    </>
  );
};
