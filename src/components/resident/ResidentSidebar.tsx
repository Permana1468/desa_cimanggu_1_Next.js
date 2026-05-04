"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { 
    Home, 
    FileText, 
    User, 
    Bell, 
    Settings, 
    LogOut,
    Heart,
    MapPin,
    ShieldCheck
} from "lucide-react";

const residentMenuItems = [
    { name: "Beranda", icon: Home, href: "/resident" },
    { name: "Layanan Surat", icon: FileText, href: "/resident/surat" },
    { name: "Profil Saya", icon: User, href: "/resident/profile" },
    { name: "Informasi Desa", icon: MapPin, href: "/resident/info" },
    { name: "Pengaturan", icon: Settings, href: "/resident/settings" },
];

export const ResidentSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="relative w-10 h-10">
                        <Image src="/images/logo-bogor.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 leading-tight">WARGA</h2>
                        <p className="text-[10px] text-blue-600 font-bold tracking-widest uppercase">Cimanggu I</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {residentMenuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                                    isActive 
                                        ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20" 
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                <item.icon size={20} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
                                <span className="text-xs">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-8 space-y-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">Verified Account</p>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase">Digital Citizen</p>
                    </div>
                </div>

                <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-xs"
                >
                    <LogOut size={20} />
                    Keluar
                </button>
            </div>
        </aside>
    );
};
