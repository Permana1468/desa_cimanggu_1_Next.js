"use client";

import { useState } from "react";
import { MasterSidebar } from "./MasterSidebar";
import { TenantSwitcher } from "./TenantSwitcher";
import { Bell, Search, Menu } from "lucide-react";

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

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-900">
            <MasterSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* TOP NAVBAR */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 flex items-center justify-between shrink-0 z-40">
                    <div className="flex items-center gap-4 md:gap-8">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <TenantSwitcher tenants={tenants} />
                        
                        <div className="hidden xl:flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-2xl border border-transparent focus-within:border-blue-500/50 transition-all w-80">
                            <Search size={18} className="text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Cari fitur atau data..." 
                                className="bg-transparent border-none outline-none text-sm font-bold w-full placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <button className="hidden sm:flex p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all relative group">
                            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
                        </button>
                        
                        <div className="hidden sm:block h-8 w-[1px] bg-slate-100 mx-2" />
                        
                        <div className="flex items-center gap-3 bg-slate-50/50 p-1.5 pr-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white font-black shadow-lg shadow-slate-900/10 group-hover:bg-blue-600 transition-colors">
                                {session.user.name?.charAt(0)}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-[11px] font-black leading-none mb-1 tracking-tight">{session.user.name}</p>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Master Mode</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar bg-slate-50/30">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
