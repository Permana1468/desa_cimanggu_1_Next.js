"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  Clock, 
  Activity,
  BellRing,
  ArrowUpRight,
  MonitorSmartphone,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";

export function DashboardUtama({ session, stats }: { session: any, stats: any }) {
  const roleName = session?.user?.role?.replace(/_/g, ' ') || "KASI PELAYANAN";
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Permohonan Surat Keterangan Usaha baru dari Budi.", time: "2 menit lalu", unread: true },
    { id: 2, text: "Antrian loket A (Offline) telah mencapai batas maksimal.", time: "15 menit lalu", unread: true },
    { id: 3, text: "Data kependudukan bulanan perlu direview.", time: "1 jam lalu", unread: false }
  ]);

  // Simulate real-time data update
  const [liveVisitors, setLiveVisitors] = useState(12);
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER CARD - SLEEK DARK/GLASSMORPHISM GRADIENT */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-white/10"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                    <MonitorSmartphone size={14} className="text-indigo-400" /> 
                    Pusat Informasi & Pelayanan Terpadu
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                    {roleName}
                </h1>
                <p className="text-indigo-100/70 max-w-xl leading-relaxed text-sm">
                    Halo, <span className="text-white font-bold">{session?.user?.name || "Kasi Pelayanan"}</span>. Pantau statistik layanan warga, pergerakan antrean, dan status persuratan secara real-time hari ini.
                </p>
            </div>

            <div className="flex gap-4">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 min-w-[150px] backdrop-blur-xl relative group hover:bg-white/10 transition-all">
                    <div className="absolute top-3 right-3 text-emerald-400">
                        <Activity size={18} className="animate-pulse" />
                    </div>
                    <span className="block text-[10px] font-bold text-indigo-200 mb-1 uppercase tracking-wider">Antrean Aktif</span>
                    <span className="block text-4xl font-black text-white">{liveVisitors}</span>
                    <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                        <TrendingUp size={12} /> +2 dari jam lalu
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 min-w-[150px] backdrop-blur-xl relative group hover:bg-white/10 transition-all">
                    <div className="absolute top-3 right-3 text-indigo-400">
                        <FileText size={18} />
                    </div>
                    <span className="block text-[10px] font-bold text-indigo-200 mb-1 uppercase tracking-wider">Surat Selesai</span>
                    <span className="block text-4xl font-black text-white">{stats?.suratCount || 45}</span>
                    <div className="mt-2 text-[10px] text-indigo-300 flex items-center gap-1 font-medium">
                        Hari Ini
                    </div>
                </div>
            </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - STATS & CHARTS */}
        <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Statistik Pelayanan Warga</h2>
                        <p className="text-slate-500 text-sm mt-1">Akumulasi data layanan minggu ini.</p>
                    </div>
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl flex items-center gap-2">
                        Unduh Laporan <ArrowUpRight size={16} />
                    </button>
                </div>
                
                {/* Dummy Chart Area */}
                <div className="h-64 flex items-end justify-between gap-2 px-2">
                    {[30, 45, 25, 60, 40, 70, 50].map((h, i) => (
                        <div key={i} className="w-full relative group">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className={`w-full rounded-t-xl ${i === 5 ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-100 group-hover:bg-indigo-100'} transition-colors relative`}
                            >
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded-lg transition-opacity whitespace-nowrap">
                                    {h} Layanan
                                </div>
                            </motion.div>
                            <div className="text-center mt-3 text-xs font-bold text-slate-400">
                                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][i]}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-rose-500 to-red-600 rounded-[2rem] p-6 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden"
                 >
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <AlertCircle size={24} className="mb-4 text-rose-100" />
                    <h3 className="text-2xl font-black mb-1">2 Keluhan</h3>
                    <p className="text-rose-100 text-sm">Aduan warga terkait layanan yang belum diproses.</p>
                 </motion.div>
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center"
                 >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800">128 Warga</h3>
                            <p className="text-slate-500 text-xs">Total dilayani bulan ini</p>
                        </div>
                    </div>
                 </motion.div>
            </div>
        </div>

        {/* RIGHT COLUMN - NOTIFICATIONS */}
        <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col h-full"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <BellRing size={20} className="text-indigo-600" />
                        Notifikasi
                    </h2>
                    <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-full">
                        {notifications.filter(n => n.unread).length} Baru
                    </span>
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                    {notifications.map((notif) => (
                        <div 
                            key={notif.id} 
                            className={`p-4 rounded-2xl transition-all border ${
                                notif.unread 
                                  ? 'bg-indigo-50/50 border-indigo-100/50' 
                                  : 'bg-slate-50 border-transparent hover:bg-slate-100'
                            }`}
                        >
                            <div className="flex gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.unread ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
                                <div>
                                    <p className={`text-sm ${notif.unread ? 'text-slate-800 font-semibold' : 'text-slate-600'}`}>
                                        {notif.text}
                                    </p>
                                    <span className="text-[10px] font-bold text-slate-400 mt-2 block">
                                        {notif.time}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button className="w-full mt-4 py-3 rounded-xl border-2 border-slate-100 text-slate-500 font-bold text-sm hover:bg-slate-50 hover:border-slate-200 transition-all">
                    Lihat Semua
                </button>
            </motion.div>
        </div>
      </div>
    </div>
  );
}
