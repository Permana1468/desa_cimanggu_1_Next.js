"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Info, Users, Newspaper, Store, ChevronRight, X } from 'lucide-react';
import { useLandingTheme } from './LandingThemeProvider';

export const MobileBottomNav = () => {
    const { isDualMode } = useLandingTheme();
    const [activeTab, setActiveTab] = useState('beranda');
    const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
    const [sheetData, setSheetData] = useState<{ title: string; items: { name: string; id: string }[] } | null>(null);

    if (isDualMode) {
        return null;
    }

    const navItems = [
        { id: 'beranda', name: 'Beranda', icon: <Home size={20} />, isRoute: false, path: '#beranda' },
        { 
            id: 'informasi', 
            name: 'Informasi', 
            icon: <Info size={20} />, 
            isRoute: false, 
            hasSheet: true,
            sheetContent: [
                { name: 'Sejarah & Visi Misi', id: 'profil' },
                { name: 'Struktur Organisasi', id: 'organisasi' },
                { name: 'Peta Interaktif WebGIS', id: 'peta-interaktif' },
                { name: 'Wilayah Dusun/RW/RT', id: 'wilayah' },
                { name: 'E-Tupoksi & RAB', id: 'layanan' },
                { name: 'E-KMS Posyandu', id: 'layanan' },
            ]
        },
        { 
            id: 'lembaga', 
            name: 'Lembaga', 
            icon: <Users size={20} />, 
            isRoute: false, 
            hasSheet: true,
            sheetContent: [
                { name: 'Karang Taruna', id: 'lembaga' },
                { name: 'LPM & BPD', id: 'lembaga' },
                { name: 'PKK & Posyandu', id: 'lembaga' },
            ]
        },
        { 
            id: 'kabar', 
            name: 'Kabar', 
            icon: <Newspaper size={20} />, 
            isRoute: false, 
            hasSheet: true,
            sheetContent: [
                { name: 'Berita Terbaru', id: 'berita' },
                { name: 'Statistik Demografi', id: 'statistik' },
            ]
        },
        { id: 'umkm', name: 'UMKM', icon: <Store size={20} />, isRoute: true, path: '/umkm' },
    ];

    const handleTabClick = (item: any) => {
        setActiveTab(item.id);
        if (item.hasSheet) {
            setSheetData({ title: item.name, items: item.sheetContent });
            setBottomSheetOpen(true);
        } else {
            setBottomSheetOpen(false);
        }
    };

    return (
        <>
            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#080e1c] border-t border-cyan-500/30 pb-safe lg:hidden shadow-[0_-10px_30px_rgba(6,182,212,0.1)]">
                <div className="flex items-center justify-around px-2 py-2">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <div key={item.id} className="flex flex-col items-center">
                                {item.isRoute ? (
                                    <Link href={item.path || '#'} onClick={() => handleTabClick(item)} className="flex flex-col items-center gap-1 p-2 w-14">
                                        <div className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-cyan-500/20 text-yellow-400' : 'text-slate-400'}`}>
                                            {item.icon}
                                        </div>
                                        <span className={`text-[9px] sm:text-[10px] font-bold ${isActive ? 'text-yellow-400' : 'text-slate-400'}`}>
                                            {item.name}
                                        </span>
                                    </Link>
                                ) : (
                                    item.hasSheet ? (
                                        <button onClick={() => handleTabClick(item)} className="flex flex-col items-center gap-1 p-2 w-14">
                                            <div className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-cyan-500/20 text-yellow-400' : 'text-slate-400'}`}>
                                                {item.icon}
                                            </div>
                                            <span className={`text-[9px] sm:text-[10px] font-bold ${isActive ? 'text-yellow-400' : 'text-slate-400'}`}>
                                                {item.name}
                                            </span>
                                        </button>
                                    ) : (
                                        <a href={item.path} onClick={() => handleTabClick(item)} className="flex flex-col items-center gap-1 p-2 w-14">
                                            <div className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-cyan-500/20 text-yellow-400' : 'text-slate-400'}`}>
                                                {item.icon}
                                            </div>
                                            <span className={`text-[9px] sm:text-[10px] font-bold ${isActive ? 'text-yellow-400' : 'text-slate-400'}`}>
                                                {item.name}
                                            </span>
                                        </a>
                                    )
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom Sheet Modal */}
            {bottomSheetOpen && (
                <div className="fixed inset-0 z-[60] flex items-end lg:hidden">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                        onClick={() => setBottomSheetOpen(false)}
                    />
                    
                    {/* Sheet Content */}
                    <div className="relative w-full bg-[#080e1c] rounded-t-3xl border-t border-cyan-500/40 p-5 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-cyan-400 rounded-full"></span>
                                {sheetData?.title}
                            </h3>
                            <button 
                                onClick={() => setBottomSheetOpen(false)}
                                className="p-2 bg-slate-800/80 rounded-full text-slate-300 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            {sheetData?.items.map((subItem, idx) => (
                                <a
                                    key={idx}
                                    href={`#${subItem.id}`}
                                    onClick={() => setBottomSheetOpen(false)}
                                    className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-cyan-900/50 rounded-2xl text-slate-200 font-semibold text-sm active:bg-cyan-900/40 active:scale-[0.98] transition-all"
                                >
                                    <span>{subItem.name}</span>
                                    <ChevronRight size={16} className="text-cyan-500" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
