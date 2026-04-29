import React, { useContext, useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { menuConfig } from './menuConfig';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, Home, Settings, X, User, Bell, ChevronRight, LayoutGrid, LogOut, Sun, Moon, ChevronDown } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MobileMenuItem = ({ item, idx, navigate, setIsSidebarOpen, location, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!item) return null;

    const bgColors = [
        'bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 
        'bg-purple-600', 'bg-teal-500', 'bg-rose-500', 
        'bg-indigo-600', 'bg-gray-600'
    ];
    const bgColor = bgColors[idx % bgColors.length];

    const hasSubItems = item.subCategories || item.subMenus;
    const isActive = item.path && location.pathname === item.path;

    const navTo = () => {
        if (item.path) {
            navigate(item.path);
            setIsSidebarOpen(false);
        } else if (hasSubItems) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className="w-full">
            <button
                onClick={navTo}
                className={`flex items-center gap-6 p-3 w-full rounded-3xl transition-all active:scale-95 group
                           ${isActive ? 'bg-white/10 shadow-xl border border-white/20' : 'hover:bg-white/5'}`}
            >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-[0_6px_20px_rgba(0,0,0,0.3)] ${bgColor} shrink-0 group-active:animate-breathing`}>
                    {item.icon ? React.cloneElement(item.icon, { size: 22, strokeWidth: 2 }) : <LayoutGrid size={22} />}
                </div>
                <span className={`text-[15px] font-black tracking-tight flex-1 text-left ${isActive ? 'text-white' : 'text-white/70'}`}>
                    {item.title}
                </span>
                {hasSubItems && (
                    <ChevronDown size={18} className={`text-white/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {hasSubItems && isOpen && (
                <div className="ml-8 mt-2 space-y-2 border-l border-white/10 pl-4 animate-fade-in">
                    {item.subCategories?.map((sub, i) => (
                        <MobileMenuItem 
                            key={i} 
                            item={sub} 
                            idx={idx + i + 1} 
                            navigate={navigate} 
                            setIsSidebarOpen={setIsSidebarOpen} 
                            location={location}
                            level={level + 1}
                        />
                    ))}
                    {item.subMenus?.map((sub, i) => (
                        <button
                            key={i}
                            onClick={() => { navigate(sub.path); setIsSidebarOpen(false); }}
                            className={`flex items-center gap-4 p-3 w-full rounded-2xl transition-all active:scale-95 text-left
                                       ${location.pathname === sub.path ? 'text-blue-400 bg-white/5' : 'text-white/50'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${location.pathname === sub.path ? 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-white/20'}`} />
                            <span className="text-sm font-bold">{sub.title}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Layout = ({ children }) => {
    const { user, logoutUser } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Sidebar States
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile menu state (Closed by default)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop narrow state
    
    // Background States
    const [bgImages, setBgImages] = useState(['/bg-cimanggu.jpg']);
    const [currentBg, setCurrentBg] = useState(0);

    /* ── Fetch background images ──────────────────────────── */
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/users/api/landing-page/');
                if (response.data?.length > 0) {
                    const s = response.data[0];
                    const imgs = [s.carousel_image_1, s.carousel_image_2, s.carousel_image_3].filter(Boolean);
                    if (imgs.length > 0) setBgImages(imgs);
                }
            } catch (e) { /* fallback */ }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        // Only run carousel on desktop
        if (window.innerWidth < 768) return;
        
        const t = setInterval(() => {
            setCurrentBg(p => (p === bgImages.length - 1 ? 0 : p + 1));
        }, 8000);
        return () => clearInterval(t);
    }, [bgImages.length]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const role = user?.role || 'ADMIN';
    const isStaffRole = ['KAUR_PERENCANAAN', 'KAUR_TU', 'KAUR_KEUANGAN', 'KASI_PEMERINTAHAN', 'KASI_KESEJAHTERAAN', 'KASI_PELAYANAN'].includes(role);
    const menus = menuConfig?.[role] || (isStaffRole ? menuConfig?.STAF : menuConfig?.ADMIN) || [];

    // Reorder menus for mobile: Push "Pengaturan Web" to bottom
    const sortedMenus = React.useMemo(() => {
        try {
            if (!Array.isArray(menus)) return [];
            return [...menus].sort((a, b) => {
                if (a?.title === 'Pengaturan Web') return 1;
                if (b?.title === 'Pengaturan Web') return -1;
                return 0;
            });
        } catch (e) {
            console.error("Menu sort error:", e);
            return menus || [];
        }
    }, [menus]);

    return (
        <div className="relative flex h-screen overflow-hidden font-[Inter,system-ui,sans-serif] bg-dark-base transition-colors duration-500">

            {/* ── Background Layers ────────────────────────────── */}
            {/* On Mobile: Render only ONE static background to save GPU and battery */}
            {window.innerWidth < 768 ? (
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{
                        backgroundImage: `url('${bgImages[0]}')`,
                        opacity: theme === 'dark' ? 0.9 : 0.6,
                    }}
                />
            ) : (
                bgImages.map((src, i) => (
                    <div
                        key={i}
                        className="absolute inset-0 bg-cover bg-center blur-[8px] scale-[1.04] z-0 transition-opacity duration-[2000ms] ease-in-out"
                        style={{
                            backgroundImage: `url('${src}')`,
                            opacity: (i === currentBg) ? (theme === 'dark' ? 1 : 0.65) : 0,
                        }}
                    />
                ))
            )}
            
            {/* Theme-aware overlay */}
            <div className={`absolute inset-0 z-[1] pointer-events-none transition-all duration-700
                            ${theme === 'dark' 
                                ? 'bg-gradient-to-br from-[rgba(6,10,24,0.98)] via-[rgba(8,14,35,0.95)] to-[rgba(6,10,24,0.98)]' 
                                : 'bg-gradient-to-br from-[rgba(248,250,252,0.92)] via-[rgba(241,245,249,0.9)] to-[rgba(248,250,252,0.94)]'}`} 
            />
            
            {/* Grid pattern */}
            <div className="absolute inset-0 z-[1] pointer-events-none bg-grid-pattern opacity-[0.03] transition-opacity" />

            {/* ── Mobile UI Elements ────────────────────────────── */}
            
            {/* 1. Mobile Bottom Navigation Bar (Minimalist & Precise) */}
            <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white/10 dark:bg-[#0f172a]/20 backdrop-blur-3xl border-t border-white/10 h-16 px-14 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 active:scale-95 transition-all group shrink-0"
                >
                    <div className="p-2 rounded-xl group-active:bg-gold/10 group-active:animate-glow-pulse transition-all">
                        <Menu size={24} />
                    </div>
                </button>

                <button 
                    onClick={() => navigate('/dashboard')}
                    className="relative flex flex-col items-center justify-center w-14 h-14 -mt-10 group shrink-0"
                >
                    <div className="absolute inset-0 bg-[#10b981] rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-breathing group-active:scale-90 transition-transform"></div>
                    <div className="relative z-10 text-white animate-glow-pulse">
                        <LayoutGrid size={28} />
                    </div>
                </button>

                <button 
                    onClick={() => navigate('/dashboard/settings')}
                    className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 active:scale-95 transition-all group shrink-0"
                >
                    <div className="p-2 rounded-xl group-active:bg-purple-500/10 group-active:animate-glow-pulse transition-all">
                        <Settings size={22} />
                    </div>
                </button>
            </nav>

            {/* 2. Mobile Menu Sheet (Premium Glassmorphism & Desktop Style) */}
            <div 
                className={`fixed inset-0 z-[1000] md:hidden transition-all duration-500 flex flex-col justify-end
                           ${isSidebarOpen ? 'visible' : 'invisible pointer-events-none'}`}
            >
                {/* Backdrop overlay */}
                <div 
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500
                               ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsSidebarOpen(false)}
                />
                
                {/* Rolling Content Panel */}
                <div 
                    className={`relative w-full max-h-[90vh] bg-white/10 dark:bg-[#0f172a]/80 backdrop-blur-3xl rounded-t-[3rem] border-t border-white/20 flex flex-col overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                               shadow-[0_-20px_60px_rgba(0,0,0,0.5)]
                               ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full shadow-none'}`}
                >
                    {/* Drag handle */}
                    <div className="w-16 h-1.5 bg-white/20 rounded-full mx-auto mt-5 shrink-0" />

                    {/* Header: Compact Profile Branding */}
                    <div className="p-6 pb-2 flex flex-col items-center gap-3 text-center">
                        <div className="relative group shrink-0">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-emerald-500 to-emerald-400 
                                            flex items-center justify-center text-white text-2xl font-black relative z-10 
                                            shadow-[0_8px_20px_rgba(16,185,129,0.4)] border-[3px] border-white/10 overflow-hidden">
                                {user?.foto_profil ? (
                                    <img src={user.foto_profil} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <span>{user?.nama_lengkap?.[0] || user?.username?.[0]}</span>
                                )}
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-[3px] border-dark-base rounded-full" />
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <h3 className="text-lg font-black text-white tracking-tight leading-tight uppercase">
                                {user?.nama_lengkap || user?.username || 'Admin Desa Cimanggu I'}
                            </h3>
                            <p className="text-[10px] text-white/40 font-medium truncate mt-0.5 tracking-wide">
                                {user?.email || 'pemerintah@cimanggu1.desa.id'}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-md uppercase tracking-widest border border-emerald-500/30">
                                    Desa Cimanggu I
                                </span>
                                <span className="px-2 py-0.5 bg-gold/10 text-gold text-[8px] font-black rounded-md uppercase tracking-widest border border-gold/30">
                                    Digital Office
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Feature Bar: Smaller Icons */}
                    <div className="flex items-center justify-center gap-4 py-2">
                        <button 
                            onClick={toggleTheme}
                            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-amber-500 hover:bg-white/10 transition-all shadow-lg active:scale-90"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} className="text-blue-500" />}
                        </button>
                        <button className="relative w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-amber-500 hover:bg-white/10 transition-all shadow-lg active:scale-90">
                            <Bell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-amber-500 rounded-full border border-dark-base shadow-glow" />
                        </button>
                        <button 
                            onClick={() => { navigate('/dashboard/profile'); setIsSidebarOpen(false); }}
                            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-emerald-500 hover:bg-white/10 transition-all shadow-lg active:scale-90"
                        >
                            <User size={18} />
                        </button>
                    </div>

                    <div className="h-px bg-white/10 mx-10 mb-1" />

                    {/* Body: Grid Menu Items with Alive Effects */}
                    <div className="flex-1 overflow-y-auto px-8 py-4 space-y-3 custom-scrollbar h-full">
                        {sortedMenus?.map((item, idx) => (
                            <MobileMenuItem 
                                key={idx} 
                                item={item} 
                                idx={idx} 
                                navigate={navigate} 
                                setIsSidebarOpen={setIsSidebarOpen} 
                                location={location}
                            />
                        ))}

                        {/* Logout Link */}
                        <button
                            onClick={logoutUser}
                            className="flex items-center gap-4 p-3 w-full rounded-2xl hover:bg-red-500/10 text-red-500 transition-all mt-2"
                        >
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20 shrink-0">
                                <LogOut size={22} />
                            </div>
                            <span className="text-[15px] font-black tracking-tight uppercase">Keluar Sistem</span>
                        </button>
                    </div>

                    {/* Footer: Removed Close Button for Minimalism */}
                    <div className="pb-8 bg-black/5 shrink-0" />
                </div>
            </div>

            {/* ── Sidebar ───────────────────────────────────── */}
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen} 
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />

            {/* ── Main Content Area ─────────────────────────── */}
            <main className={`flex-1 flex flex-col relative z-10 min-w-0 h-screen overflow-hidden transition-all duration-500`}>
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-transparent h-full">
                    {/* Inner wrapper for padding/spacing - Adjusted for bottom nav on mobile */}
                    <div className="min-h-full p-2 pb-28 md:p-6 lg:p-8">
                        {children || <Outlet />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
