"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { MasterSidebar } from "./MasterSidebar";
import { GlobalNotificationPanel } from "../dashboard/GlobalNotificationPanel";
import { Menu, LayoutDashboard, Settings, Plus, Home as HomeIcon, BarChart3, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FloatingChat } from "../dashboard/FloatingChat";

export function MasterShell({ 
    children, 
    session, 
    tenants 
}: { 
    children: React.ReactNode; 
    session: any; 
    tenants: any[];
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [showPlusMenu, setShowPlusMenu] = useState(false);

    const getQuickActions = () => {
        return [
            { label: "Mode Pemeliharaan", href: "/master-admin/maintenance", color: "bg-rose-600" },
            { label: "Konfigurasi Sistem", href: "/master-admin/config", color: "bg-blue-600" },
            { label: "Manajemen Data", href: "/master-admin/data", color: "bg-teal-600" },
            { label: "Integrasi & API", href: "/master-admin/integrasi", color: "bg-indigo-600" },
            { label: "Kecerdasan Buatan", href: "/master-admin/ai", color: "bg-purple-600" },
            { label: "Log Aktivitas", href: "/master-admin/logs", color: "bg-amber-500" },
        ];
    };

    return (
        <div className="flex h-screen bg-slate-50 bg-grid-pattern overflow-hidden font-sans text-slate-900 relative">
            {/* SIDEBAR */}
            <MasterSidebar 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen} 
                tenants={tenants} 
                onOpenNotif={() => setIsNotifOpen(true)}
            />
            
            {/* NOTIFICATION PANEL */}
            <GlobalNotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
            
            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                
                {/* DECORATIVE BACKGROUND BLOB */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* MOBILE TOP HEADER (SLEEK & CLEAN) */}
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0f172a] text-white border-b border-white/10 z-40 shrink-0 shadow-md">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Buka Menu"
                            className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2.5">
                            <div className="relative w-7 h-7 shrink-0">
                                <Image src="/images/logo-bogor.png" alt="Logo" fill className="object-contain" priority />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black tracking-tight text-white leading-none">MASTER ADMIN</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                </div>
                                <span className="text-[9px] font-bold text-blue-400 tracking-wider">KABUPATEN BOGOR</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsNotifOpen(true)}
                            aria-label="Notifikasi"
                            className="relative p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse ring-2 ring-[#0f172a]" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-black shadow-md">
                            {session?.user?.name?.charAt(0) || "M"}
                        </div>
                    </div>
                </header>

                {/* MOBILE BOTTOM NAVIGATION DOCK (CURVED DESIGN WITH DYNAMIC MODALS - FULL WIDTH) */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 w-full h-[75px] select-none">
                    {/* SVG Background with Notch */}
                    <div className="absolute inset-0 z-0">
                        <svg className="w-full h-full text-[#0f172a]/95 backdrop-blur-xl fill-current filter drop-shadow-[0_-15px_30px_rgba(0,0,0,0.5)]" viewBox="0 0 400 80" preserveAspectRatio="none">
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
                                    className="fixed inset-0 -z-10 bg-slate-950/40 backdrop-blur-[2px]"
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.95, x: "-50%" }}
                                    animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95, x: "-50%" }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="absolute bottom-[90px] left-1/2 w-[90%] max-w-[280px] bg-slate-900 p-4 rounded-3xl shadow-[0_15px_30px_rgba(0,0,0,0.4)] border border-white/10 z-10 space-y-2.5"
                                >
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Akses Cepat Master</p>
                                    {getQuickActions().map((action: any) => (
                                        <Link
                                            key={action.label}
                                            href={action.href}
                                            onClick={() => setShowPlusMenu(false)}
                                            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/10 transition-colors group"
                                        >
                                            <div className={`w-8 h-8 rounded-xl ${action.color} flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0`}>
                                                +
                                            </div>
                                            <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{action.label}</span>
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
                            href="/master-admin"
                            className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all ${
                                pathname === "/master-admin" 
                                    ? "text-blue-400 font-black scale-105" 
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <HomeIcon size={20} className="stroke-[2]" />
                            <span className="text-[9px] font-bold mt-0.5 tracking-tight">Beranda</span>
                        </Link>

                        {/* BUTTON 2: ALL MENU / GRID */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all text-slate-400 hover:text-white"
                        >
                            <Menu size={20} className="stroke-[1.8]" />
                            <span className="text-[9px] font-bold mt-0.5 tracking-tight">Menu</span>
                        </button>

                        {/* BUTTON 3: CENTER FLOATING ACTION "+" BUTTON */}
                        <div className="relative w-16 h-12 flex items-center justify-center">
                            <button 
                                onClick={() => setShowPlusMenu(!showPlusMenu)}
                                aria-label="Aksi Cepat"
                                className="absolute -top-6 w-14 h-14 bg-gradient-to-tr from-blue-700 to-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.7)] transition-all z-20 active:scale-95 border-4 border-[#0f172a]"
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
                            href="/master-admin/stats"
                            className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all ${
                                pathname.startsWith("/master-admin/stats") 
                                    ? "text-blue-400 font-black scale-105" 
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <BarChart3 size={20} className="stroke-[1.8]" />
                            <span className="text-[9px] font-bold mt-0.5 tracking-tight">Statistik</span>
                        </Link>

                        {/* BUTTON 5: PROFILE / SETTINGS */}
                        <Link 
                            href="/master-admin/config"
                            className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all ${
                                pathname.startsWith("/master-admin/config") 
                                    ? "text-blue-400 font-black scale-105" 
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <Settings size={20} className="stroke-[1.8]" />
                            <span className="text-[9px] font-bold mt-0.5 tracking-tight">Config</span>
                        </Link>

                    </div>
                </div>

                {/* SCROLLABLE MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 lg:p-10 pb-28 sm:pb-32 lg:pb-16 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto pt-2 lg:pt-0">
                        {children}
                    </div>
                </main>

            </div>

            {/* Floating Chat for Master Admins */}
            <FloatingChat session={session} />
        </div>
    );
}
