"use client";

import { useState } from "react";
import { MasterSidebar } from "./MasterSidebar";
import { NotificationPanel } from "./NotificationPanel";
import { Menu, LayoutDashboard, Settings } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function MasterShell({ 
    children, 
    session, 
    tenants 
}: { 
    children: React.ReactNode; 
    session: any; 
    tenants: any[];
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

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
            <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
            
            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                
                {/* DECORATIVE BACKGROUND BLOB */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* MOBILE BOTTOM NAVIGATION DOCK */}
                <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-[320px]">
                    <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-2.5 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-between">
                        
                        {/* MENU BUTTON */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="w-12 h-12 flex flex-col items-center justify-center gap-1 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                        >
                            <Menu size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-bold tracking-widest uppercase">Menu</span>
                        </button>

                        {/* CENTER DASHBOARD BUTTON */}
                        <Link 
                            href="/master-admin"
                            className="relative group -mt-10"
                        >
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 text-white border-[6px] border-[#f8fafc] shadow-xl group-hover:-translate-y-1 transition-transform duration-300">
                                <LayoutDashboard size={24} className="group-hover:scale-110 transition-transform" />
                            </div>
                        </Link>

                        {/* SETTINGS BUTTON */}
                        <Link 
                            href="/master-admin/config"
                            className="w-12 h-12 flex flex-col items-center justify-center gap-1 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                        >
                            <Settings size={20} className="group-hover:rotate-45 transition-transform" />
                            <span className="text-[9px] font-bold tracking-widest uppercase">Set</span>
                        </Link>

                    </div>
                </div>

                {/* SCROLLABLE MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-16 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto pt-12 lg:pt-0">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}
