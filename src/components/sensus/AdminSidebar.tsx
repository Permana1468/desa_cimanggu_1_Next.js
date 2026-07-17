"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    FileSpreadsheet, 
    Users, 
    ShieldCheck, 
    Layers, 
    Map as MapIcon,
    LogOut,
    Menu
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/sensus-app/admin/dashboard", icon: LayoutDashboard },
    { name: "Kuisioner", href: "/sensus-app/admin/kuisioner", icon: FileSpreadsheet },
    { name: "Users", href: "/sensus-app/admin/users", icon: Users },
    { name: "Roles", href: "/sensus-app/admin/roles", icon: ShieldCheck },
    { name: "Layer", href: "/sensus-app/admin/layer", icon: Layers },
    { name: "Peta Sebaran", href: "/sensus-app/admin/peta", icon: MapIcon },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <motion.div 
            initial={{ width: 280 }}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-screen bg-slate-950 border-r border-slate-800 flex flex-col relative z-50 shrink-0"
        >
            {/* Header / Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/50">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 overflow-hidden"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                                <ShieldCheck size={18} />
                            </div>
                            <span className="text-white font-bold tracking-wider text-sm truncate whitespace-nowrap">COMMAND CENTER</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-auto"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link 
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : undefined}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                                isActive 
                                ? "bg-blue-600/10 border border-blue-500/30 text-blue-400 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]" 
                                : "text-slate-400 border border-transparent hover:bg-slate-900 hover:text-slate-200"
                            }`}
                        >
                            <item.icon size={20} className={isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"} />
                            {!isCollapsed && (
                                <span className={`font-medium text-sm whitespace-nowrap ${isActive ? "text-white" : ""}`}>
                                    {item.name}
                                </span>
                            )}
                            {isActive && !isCollapsed && (
                                <motion.div 
                                    layoutId="active-indicator"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/30">
                <button 
                    onClick={() => signOut({ callbackUrl: "/sensus-app/login" })}
                    className={`flex items-center gap-3 w-full p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors ${isCollapsed ? "justify-center" : ""}`}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="font-medium text-sm">Keluar Sistem</span>}
                </button>
            </div>
        </motion.div>
    );
}
