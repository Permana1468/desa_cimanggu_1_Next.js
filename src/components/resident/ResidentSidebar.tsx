"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { 
    Home, 
    FileText, 
    User, 
    Bell, 
    Settings, 
    LogOut,
    MapPin,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Plus,
    Menu,
    MessageSquare,
    ShoppingBag
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const residentMenuItems = [
    { name: "Beranda", icon: Home, href: "/resident" },
    { name: "Layanan Surat", icon: FileText, href: "/resident/surat" },
    { name: "Profil Saya", icon: User, href: "/resident/profile" },
    { name: "Informasi Desa", icon: MapPin, href: "/resident/info" },
    { name: "Marketplace UMKM", icon: ShoppingBag, href: "/resident/marketplace" },
    { name: "Pengaturan", icon: Settings, href: "/resident/settings" },
];

export const ResidentSidebar = ({ session: propSession }: { session?: any }) => {
    const pathname = usePathname();
    const { data: clientSession } = useSession();
    const session = propSession || clientSession;

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showPlusMenu, setShowPlusMenu] = useState(false);

    const getIsActive = (path: string) => {
        return pathname === path;
    };

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
                                <span className="text-sm font-black text-slate-800 leading-tight">WARGA</span>
                                <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Cimanggu I</span>
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
                    <div className="space-y-1">
                        {residentMenuItems.map((item) => {
                            const isActive = getIsActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                                        isActive
                                            ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                    } ${isCollapsed && !isOpen ? 'justify-center' : ''}`}
                                >
                                    <item.icon size={20} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
                                    {(!isCollapsed || isOpen) && <span className="text-sm">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Area & Logout */}
                <div className="p-4 mt-auto">
                    {(!isCollapsed || isOpen) ? (
                        <div className="flex flex-col gap-4 p-4 bg-emerald-50 rounded-[1.25rem] border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-black shadow-md overflow-hidden">
                                    {session?.user?.photo ? (
                                        <Image src={session.user.photo} alt="Profile" width={40} height={40} className="object-cover w-full h-full" />
                                    ) : (
                                        session?.user?.name?.charAt(0) || 'W'
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[11px] font-bold text-slate-800 truncate tracking-tight">{session?.user?.name || "Warga"}</span>
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                        <ShieldCheck size={10} /> Verified
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/50">
                                <button 
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-slate-500 hover:bg-emerald-100/50 hover:text-slate-700 transition-colors"
                                >
                                    <Bell size={14} />
                                    <span className="text-[10px] font-bold uppercase">Notif</span>
                                </button>
                                <button 
                                    onClick={() => signOut()}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-red-500 hover:bg-red-100/50 transition-colors"
                                >
                                    <LogOut size={14} />
                                    <span className="text-[10px] font-bold uppercase">Keluar</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <button 
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all relative"
                            >
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>
                            <button 
                                onClick={() => signOut()}
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* MOBILE BOTTOM NAVIGATION DOCK */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 w-full h-[75px] select-none">
                <div className="absolute inset-0 z-0">
                    <svg className="w-full h-full text-white/95 dark:text-slate-900/95 backdrop-blur-xl fill-current filter drop-shadow-[0_-15px_30px_rgba(0,0,0,0.12)]" viewBox="0 0 400 80" preserveAspectRatio="none">
                        <path d="M 0 10 L 165 10 C 180 10, 182 48, 200 48 C 218 48, 220 10, 235 10 L 400 10 L 400 80 L 0 80 Z" />
                    </svg>
                </div>

                <AnimatePresence>
                    {showPlusMenu && (
                        <>
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
                                className="absolute bottom-[90px] left-1/2 w-[90%] max-w-[280px] bg-white p-4 rounded-3xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] border border-slate-100 z-10 space-y-2.5"
                            >
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Akses Cepat</p>
                                <Link
                                    href="/resident/surat"
                                    onClick={() => setShowPlusMenu(false)}
                                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                        +
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Buat Pengajuan Surat</span>
                                </Link>
                                <Link
                                    href="/resident/info"
                                    onClick={() => setShowPlusMenu(false)}
                                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                        +
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">Lihat Info Desa</span>
                                </Link>
                                <Link
                                    href="/resident/marketplace"
                                    onClick={() => setShowPlusMenu(false)}
                                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                        <ShoppingBag size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 group-hover:text-amber-500 transition-colors">Marketplace UMKM</span>
                                </Link>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div className="relative z-10 w-full h-full flex items-center justify-between px-6 pt-[6px]">
                    <Link 
                        href="/resident"
                        className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all ${
                            getIsActive("/resident") 
                                ? "text-blue-600 scale-105" 
                                : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <Home size={20} className={getIsActive("/resident") ? "stroke-[2.5]" : "stroke-[1.8]"} />
                        <span className="text-[9px] font-bold mt-0.5 tracking-tight">Beranda</span>
                    </Link>

                    <button 
                        onClick={() => setIsOpen(true)}
                        className="w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all text-slate-400 hover:text-slate-600"
                    >
                        <Menu size={20} className="stroke-[1.8]" />
                        <span className="text-[9px] font-bold mt-0.5 tracking-tight">Menu</span>
                    </button>

                    <div className="relative w-16 h-12 flex items-center justify-center">
                        <button 
                            onClick={() => setShowPlusMenu(!showPlusMenu)}
                            className="absolute -top-6 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-all z-20 active:scale-95"
                        >
                            <motion.div
                                animate={{ rotate: showPlusMenu ? 135 : 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            >
                                <Plus size={24} className="stroke-[2.5]" />
                            </motion.div>
                        </button>
                    </div>

                    <Link 
                        href="/resident/surat"
                        className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all ${
                            getIsActive("/resident/surat") 
                                ? "text-blue-600 scale-105" 
                                : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <FileText size={20} className={getIsActive("/resident/surat") ? "stroke-[2.5]" : "stroke-[1.8]"} />
                        <span className="text-[9px] font-bold mt-0.5 tracking-tight">Surat</span>
                    </Link>

                    <Link 
                        href="/resident/settings"
                        className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all ${
                            getIsActive("/resident/settings") 
                                ? "text-blue-600 scale-105" 
                                : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <Settings size={20} className={getIsActive("/resident/settings") ? "stroke-[2.5] rotate-45" : "stroke-[1.8]"} />
                        <span className="text-[9px] font-bold mt-0.5 tracking-tight">Setel</span>
                    </Link>
                </div>
            </div>
        </>
    );
};
