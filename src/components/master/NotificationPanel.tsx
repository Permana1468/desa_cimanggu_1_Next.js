"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, ShieldAlert, CheckCircle2, Info, Activity } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockNotifications = [
  {
    id: "1",
    type: "security",
    title: "Login Baru Terdeteksi",
    description: "Seseorang baru saja login dengan akun Admin dari IP 114.122.x.x.",
    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    icon: ShieldAlert,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    id: "2",
    type: "system",
    title: "Backup Database Selesai",
    description: "Proses backup otomatis harian telah berhasil diselesaikan.",
    time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: "3",
    type: "activity",
    title: "Sinkronisasi Node Berhasil",
    description: "Node cluster 003 telah kembali online dan disinkronkan.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    icon: Activity,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: "4",
    type: "info",
    title: "Pembaruan Kebijakan Privasi",
    description: "Sistem telah diperbarui ke versi kebijakan privasi v2.1.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    icon: Info,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  }
];

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80]"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div 
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl z-[90] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Notifikasi Sistem</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Log Aktivitas & Peringatan
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {mockNotifications.map((notif) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={notif.id} 
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 shrink-0 rounded-xl ${notif.bg} ${notif.color} flex items-center justify-center`}>
                      <notif.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-black text-white truncate">{notif.title}</h4>
                        <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                          {formatRelativeTime(new Date(notif.time))}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">
                        {notif.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="pt-8 pb-4 text-center">
                <div className="inline-block p-4 rounded-full bg-white/5 border border-white/5 mb-3">
                  <CheckCircle2 size={24} className="text-slate-500" />
                </div>
                <h4 className="text-sm font-black text-slate-300">Anda sudah melihat semuanya!</h4>
                <p className="text-xs text-slate-500 mt-1">Tidak ada notifikasi baru lainnya.</p>
              </div>
            </div>
            
            {/* Footer Action */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
              <button className="w-full py-4 rounded-xl text-sm font-black text-slate-400 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/10">
                Tandai Semua Dibaca
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
