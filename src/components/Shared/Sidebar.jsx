import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
    ChevronDown, Bell, LogOut, User, Settings, Sun, Moon, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import useRole from '../../hooks/useRole';
import { menuConfig } from './menuConfig';

/* ─── TOOLTIP COMPONENT ────────────────────────────────────────────────────── */
const Tooltip = ({ text, show }) => (
    <div className={`fixed left-[75px] px-3 py-1.5 bg-dark-overlay backdrop-blur-xl 
                    border border-white/15 rounded-lg text-white text-[11px] font-bold
                    pointer-events-none transition-all duration-300 z-[100] whitespace-nowrap shadow-2xl
                    ${show ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
        {text}
        <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-dark-overlay border-l border-b border-white/15 rotate-45" />
    </div>
);

/* ─── NESTED ITEM COMPONENT ────────────────────────────────────────────────── */
const SidebarItem = ({ item, isCollapsed, setIsCollapsed, setIsSidebarOpen, level = 0 }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    const hasActiveChild = (menu) => {
        if (menu.subMenus?.some(s => location.pathname === s.path)) return true;
        if (menu.subCategories?.some(c => hasActiveChild(c))) return true;
        return false;
    };

    const isParentActive = hasActiveChild(item);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isParentActive && !isCollapsed) setIsOpen(true);
            if (isCollapsed) setIsOpen(false);
        }, 0);
        return () => clearTimeout(timer);
    }, [isParentActive, isCollapsed]);

    const renderIcon = (active) => {
        if (!item.icon) return null;
        const colorClass = active ? 'text-white' : (item.iconColor || 'text-text-muted');
        return (
            <div className={`transition-all duration-500 ease-out flex items-center justify-center
                            ${isHovered ? 'scale-125 rotate-3 -translate-y-0.5' : 'scale-100'}`}>
                {React.cloneElement(item.icon, { 
                    size: isCollapsed ? 18 : 17, 
                    className: `transition-all duration-300 ${colorClass} ${!active && !isCollapsed ? 'opacity-90' : 'opacity-100'}`
                })}
            </div>
        );
    };

    const handleParentClick = () => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setIsOpen(true);
        } else {
            setIsOpen(!isOpen);
        }
    };

    const navClass = (active) => `
        w-full flex items-center gap-3 px-5 py-3 text-[13px] font-bold 
        transition-all duration-300 group relative rounded-xl
        ${active 
            ? 'sidebar-active-gradient text-white shadow-lg' 
            : `text-text-muted hover:bg-white/[0.05] hover:text-text-main`}
        ${isCollapsed ? 'justify-center px-0 h-[48px] w-[48px] mx-auto' : ''}
    `;

    if (item.subCategories || item.subMenus) {
        return (
            <div className={`w-full ${isCollapsed ? 'flex justify-center' : 'px-2.5'}`}>
                <button
                    onClick={handleParentClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={navClass(isParentActive && level === 0)}
                >
                    <span className={`shrink-0 ${isCollapsed ? 'flex items-center justify-center' : ''}`}>
                        {renderIcon(isParentActive && level === 0)}
                    </span>
                    
                    {!isCollapsed && (
                        <>
                            <span className="flex-1 text-left truncate tracking-tight">{item.title}</span>
                            <ChevronDown
                                size={14}
                                className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''} opacity-30 group-hover:opacity-60`}
                            />
                        </>
                    )}

                    {isCollapsed && isHovered && <Tooltip text={item.title} show={true} />}
                </button>

                {!isCollapsed && (
                    <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                                    ${isOpen ? 'max-h-[1200px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                        <div className="ml-5 space-y-1 relative border-l-2 border-white/[0.05] py-1">
                            {item.subCategories?.map((sub, i) => (
                                <SidebarItem key={i} item={sub} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} setIsSidebarOpen={setIsSidebarOpen} level={level + 1} />
                            ))}

                            {item.subMenus?.map((sub, i) => (
                                <NavLink
                                    key={i}
                                    to={sub.path}
                                    onClick={() => {
                                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                                    }}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 py-2.5 pl-8 pr-4 text-[12px] font-bold transition-all duration-300 group rounded-lg mx-2
                                         ${isActive 
                                            ? 'text-[#3b82f6] bg-white/[0.04]' 
                                            : 'text-text-subtle hover:text-text-main hover:bg-white/[0.02]'}`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className={`w-1.5 h-1.5 rounded-full border transition-all duration-500
                                                ${isActive ? 'bg-[#3b82f6] border-[#3b82f6] scale-125 shadow-[0_0_8px_rgba(59,130,246,1)]' : 'bg-white/10 border-white/5'}`} />
                                            <span className="truncate">{sub.title}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`w-full ${isCollapsed ? 'flex justify-center' : 'px-2.5'}`}>
            <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => {
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={({ isActive }) => navClass(isActive)}
            >
                {({ isActive }) => (
                    <>
                        <span className={`shrink-0 ${isCollapsed ? 'flex items-center justify-center' : ''}`}>
                            {renderIcon(isActive)}
                        </span>
                        
                        {!isCollapsed && (
                            <span className="flex-1 truncate tracking-tight">{item.title}</span>
                        )}

                        {!isCollapsed && item.badge && !isActive && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm
                                bg-gold-light border border-gold-border text-gold uppercase tracking-tighter animate-pulse">
                                {item.badge}
                            </span>
                        )}

                        {isCollapsed && isHovered && <Tooltip text={item.title} show={true} />}
                    </>
                )}
            </NavLink>
        </div>
    );
};


const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, isCollapsed, setIsCollapsed }) => {
    const { user, logoutUser } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const { role } = useRole();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    
    // UI Local States
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const footerRef = useRef(null);

    const notifications = [
        { msg: 'Siti Rahayu melakukan absensi masuk', time: '08:12', icon: '🟢' },
        { msg: 'Realisasi anggaran Q1 siap direview', time: '09:00', icon: '📊' },
        { msg: 'Usulan Musrenbang baru dari Dusun III', time: '09:30', icon: '📋' },
    ];

    useEffect(() => {
        const handler = (e) => {
            if (footerRef.current && !footerRef.current.contains(e.target)) {
                setNotifOpen(false);
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fallback logic for staff roles that use a generic STAF menu
    const isStaffRole = ['KAUR_PERENCANAAN', 'KAUR_TU', 'KAUR_KEUANGAN', 'KASI_PEMERINTAHAN', 'KASI_KESEJAHTERAAN', 'KASI_PELAYANAN'].includes(role);
    const menus = menuConfig[role] || (isStaffRole ? menuConfig.STAF : menuConfig.ADMIN) || [];

    return (
        <aside
            className={`hidden md:flex md:relative top-0 left-0 z-[60] h-screen flex-col
                bg-dark-sidebar backdrop-blur-3xl border-r border-white/5
                shadow-[25px_0_100px_rgba(0,0,0,0.6)] overflow-visible
                transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isCollapsed ? 'w-0 md:w-[68px]' : 'w-[280px]'}`}
        >
            {/* ── Internal Sidebar Toggle Handle ── */}
            <div className={`hidden md:flex absolute top-10 right-[-14px] z-[100] transition-transform duration-500 ${isCollapsed ? 'translate-x-[2px]' : ''}`}>
                 <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-7 h-7 flex items-center justify-center
                               bg-[#3b82f6] text-white rounded-full shadow-[0_4px_12px_rgba(59,130,246,0.6)] 
                               border border-white/30 cursor-pointer 
                               hover:scale-115 transition-all"
                >
                    {isCollapsed ? <ChevronRight size={15} strokeWidth={3} /> : <ChevronLeft size={15} strokeWidth={3} />}
                </button>
            </div>

            {/* ── Mobile Close Button (Premium Floating) ── */}
            <div className={`md:hidden absolute top-6 right-[-60px] transition-all duration-700 delay-300 
                            ${isSidebarOpen ? 'translate-x-0 opacity-100 rotate-0' : '-translate-x-10 opacity-0 -rotate-90'}`}>
                <button 
                    className="w-11 h-11 flex items-center justify-center bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white shadow-2xl active:scale-90 hover:bg-white/20 transition-all"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsSidebarOpen(false);
                    }}
                >
                    <X size={20} strokeWidth={3} />
                </button>
            </div>

            {/* ── Brand Header ────────────────────────────────────── */}
            <div className={`px-4 py-8 flex flex-col items-center justify-center shrink-0 relative
                            transition-all duration-500
                            ${scrolled ? 'bg-dark-base shadow-lg transition-colors' : ''}`}>
                
                <div className={`flex items-center gap-4 transition-all duration-500 ${isCollapsed ? 'flex-col gap-4' : ''}`}>
                    <div className="relative group shrink-0">
                        <div className="absolute inset-0 bg-gold/15 rounded-full blur-2xl animate-pulse opacity-0 group-hover:opacity-100"></div>
                        <div className={`transition-all duration-500 ${isCollapsed ? 'w-11 h-11' : 'w-14 h-14'} 
                                        relative z-10 flex items-center justify-center logo-cahaya animate-logo-float`}>
                            <img 
                                src="/images/logo_kabupaten_bogor.png" 
                                alt="Logo" 
                                className="w-full h-full object-contain"
                                onClick={() => navigate('/dashboard')}
                            />
                        </div>
                    </div>
                    
                    {!isCollapsed && (
                        <div className="transition-all duration-500 animate-fade-in translate-y-1">
                            <div className="text-[16px] font-black text-text-main tracking-[0.08em] uppercase leading-none">
                                CIMANGGU I
                            </div>
                            <div className="text-[8.5px] text-gold font-black uppercase tracking-[0.25em] mt-2 opacity-80 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-gold animate-pulse shadow-glow" />
                                Digital Office
                            </div>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 px-6">
                    <div className="complex-divider opacity-30"></div>
                </div>
            </div>

            {/* ── Navigation ──────────────────────────────────────── */}
            <nav 
                className="flex-1 overflow-y-auto overflow-x-hidden py-8 space-y-2 custom-scrollbar scroll-smooth"
                onScroll={(e) => setScrolled(e.target.scrollTop > 10)}
            >
                {menus.map((item, idx) => (
                    <SidebarItem key={idx} item={item} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} setIsSidebarOpen={setIsSidebarOpen} />
                ))}
            </nav>

            {/* ── Management Footer (Notifications & Profile) ────────────────── */}
            <div className={`px-4 py-6 shrink-0 relative bg-white/[0.02] flex flex-col gap-3 items-center`} ref={footerRef}>
                <div className="absolute top-0 left-0 right-0 px-6">
                    <div className="complex-divider opacity-30"></div>
                </div>

                <div className={`flex items-center gap-3 w-full ${isCollapsed ? 'flex-col items-center' : ''}`}>
                    {/* Notification Integrated */}
                    <div className="relative">
                        <button
                            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                            className={`relative flex items-center justify-center rounded-xl transition-all duration-300
                                       ${isCollapsed ? 'w-10 h-10' : 'w-9 h-9'}
                                       bg-white/[0.04] border border-white/[0.07] text-amber-500
                                       hover:bg-amber-500/10 hover:border-amber-500/30 shadow-sm`}
                        >
                            <Bell size={17} className={notifOpen ? 'animate-bounce' : ''} />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full border border-dark-base shadow-glow" />
                        </button>

                        {/* Dropup Logic... */}
                        {notifOpen && (
                            <div className={`absolute bottom-full mb-3 left-0 z-[100] overflow-hidden
                                            ${isCollapsed ? 'w-[260px]' : 'w-[250px]'}
                                            bg-dark-overlay backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl
                                            animate-[drop-in_0.3s_ease-out]`}>
                                <div className="p-4 border-b border-white/5 flex justify-between items-center text-shadow-sm">
                                    <span className="text-[10px] font-black uppercase text-text-main">Notifikasi</span>
                                    <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black">NEW</span>
                                </div>
                                <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                                    {notifications.map((n, i) => (
                                        <div key={i} className="p-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.05] cursor-pointer">
                                            <div className="text-[12px] text-text-main font-medium leading-tight">{n.msg}</div>
                                            <div className="text-[9px] text-text-muted mt-2 font-black opacity-50 uppercase tracking-tighter">{n.time} WIB</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) }
                    </div>

                    {/* User Profile Integrated */}
                    <div className="relative flex-1 w-full">
                        <button
                            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                            className={`flex items-center gap-3 w-full rounded-xl transition-all duration-300
                                       ${isCollapsed ? 'w-10 h-10 justify-center' : 'p-1.5 pr-3 bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] shadow-sm'}`}
                        >
                            <div className={`relative w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 
                                            flex items-center justify-center font-black text-[10px] text-white shadow-lg overflow-hidden shrink-0`}>
                                {user?.foto_profil ? <img src={user.foto_profil} className="w-full h-full object-cover" alt="" /> : (user?.username?.charAt(0)?.toUpperCase() || 'U')}
                                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-dark-base rounded-full" />
                            </div>
                            
                            {!isCollapsed && (
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="text-[12px] font-black text-text-main truncate max-w-full tracking-tight">{user?.nama_lengkap || user?.username}</span>
                                    <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">
                                        {(user?.role === 'RT' || user?.role === 'RW') && user?.unit_detail
                                            ? user.unit_detail
                                            : user?.role?.replace('_', ' ')} AKTIF
                                    </span>
                                </div>
                            )}
                        </button>

                        {/* Dropup Logic... */}
                        {userMenuOpen && (
                             <div className={`absolute bottom-full mb-3 left-0 z-[100] w-[240px]
                                             bg-dark-overlay backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl
                                             animate-[drop-in_0.3s_ease-out] overflow-hidden`}>
                                <div className="p-4 border-b border-white/5 flex justify-between items-center text-shadow-sm">
                                    <span className="text-[10px] font-black uppercase text-text-muted">Profil Saya</span>
                                    <button onClick={toggleTheme} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        {theme === 'dark' ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-blue-500" />}
                                    </button>
                                </div>
                                <div className="p-1.5">
                                    <button onClick={() => { navigate('/dashboard/profile'); setUserMenuOpen(false); if (window.innerWidth < 768) setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 p-3 text-[12.5px] font-bold text-text-muted hover:bg-white/5 hover:text-white rounded-xl transition-all">
                                        <User size={15} className="text-blue-400" /> Profil Saya
                                    </button>
                                    <button onClick={() => { navigate('/dashboard/settings'); setUserMenuOpen(false); if (window.innerWidth < 768) setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 p-3 text-[12.5px] font-bold text-text-muted hover:bg-white/5 hover:text-white rounded-xl transition-all">
                                        <Settings size={15} className="text-purple-400" /> Pengaturan
                                    </button>
                                    <div className="h-px bg-white/[0.05] my-1 mx-2" />
                                    <button onClick={logoutUser} className="w-full flex items-center gap-3 p-3 text-[12.5px] font-black text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                        <LogOut size={15} /> Logout Sistem
                                    </button>
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
