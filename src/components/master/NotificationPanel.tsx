"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCircle2, ShieldAlert, Sparkles, ExternalLink } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { useNotifications, getNotificationIcon, NotificationItem } from "@/hooks/useNotifications";
import { useRouter } from "next/navigation";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleItemClick = (notif: NotificationItem) => {
    markAsRead(notif.id);
    if (notif.actionUrl) {
      onClose();
      router.push(notif.actionUrl);
    }
  };

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
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Notifikasi Sistem</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Live Feed Pemerintahan Desa
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
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="pt-16 pb-8 text-center">
                  <div className="inline-block p-4 rounded-full bg-white/5 border border-white/5 mb-3">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-black text-slate-300">Semua Terpantau Aman</h4>
                  <p className="text-xs text-slate-500 mt-1">Belum ada notifikasi baru yang membutuhkan perhatian.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = getNotificationIcon(notif.type);
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={notif.id} 
                      onClick={() => handleItemClick(notif)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                        notif.read 
                          ? "bg-white/[0.02] border-white/5 opacity-70 hover:opacity-100" 
                          : "bg-white/[0.07] border-white/10 hover:border-blue-500/40"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                              {notif.title}
                            </h4>
                            <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">
                              {formatRelativeTime(new Date(notif.time))}
                            </span>
                          </div>
                          <p className="text-xs font-normal text-slate-400 mt-1 leading-relaxed">
                            {notif.description}
                          </p>
                          {notif.actionUrl && (
                            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-blue-400 group-hover:underline">
                              <span>Lihat Detail</span>
                              <ExternalLink size={12} />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
            
            {/* Footer Action */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
              <button 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="w-full py-3 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-wider hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/10 disabled:opacity-50"
              >
                Tandai Semua Sudah Dibaca
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
