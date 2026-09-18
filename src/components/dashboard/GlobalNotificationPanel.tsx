"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  Check, 
  Filter,
  Sparkles 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotifications, getNotificationIcon, NotificationItem } from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/lib/utils";

interface GlobalNotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isHackerTheme?: boolean;
}

export function GlobalNotificationPanel({
  isOpen,
  onClose,
  isHackerTheme = false,
}: GlobalNotificationPanelProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    return true;
  });

  const handleNotificationClick = (notif: NotificationItem) => {
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[998]"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className={`fixed inset-y-0 right-0 w-full max-w-md shadow-2xl z-[999] flex flex-col border-l transition-colors duration-300 ${
              isHackerTheme
                ? "bg-slate-950 border-cyan-500/30 text-cyan-50"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Drawer Header */}
            <div
              className={`p-6 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md ${
                isHackerTheme
                  ? "border-cyan-500/20 bg-slate-950/90"
                  : "border-slate-100 bg-white/90"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center relative shadow-sm ${
                    isHackerTheme
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  }`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black tracking-tight">
                      Pusat Notifikasi
                    </h2>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] font-medium mt-0.5 ${
                      isHackerTheme ? "text-cyan-400/70 font-mono" : "text-slate-500"
                    }`}
                  >
                    Pemberitahuan & Aktivitas Desa
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isHackerTheme
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                }`}
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Toolbar */}
            <div
              className={`px-6 py-3 border-b flex items-center justify-between text-xs ${
                isHackerTheme
                  ? "border-cyan-500/10 bg-slate-900/40"
                  : "border-slate-100 bg-slate-50/50"
              }`}
            >
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-[11px] ${
                    filter === "all"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Semua ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-[11px] ${
                    filter === "unread"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Belum Dibaca ({unreadCount})
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${
                    isHackerTheme
                      ? "text-cyan-400 hover:text-cyan-300"
                      : "text-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  <Check size={14} />
                  <span>Tandai Semua Dibaca</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
              {filteredNotifications.length === 0 ? (
                <div className="py-16 text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center mb-3 shadow-inner ${
                      isHackerTheme
                        ? "bg-slate-900 text-slate-600 border border-cyan-500/20"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">
                    Tidak ada notifikasi
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    {filter === "unread"
                      ? "Semua notifikasi penting telah Anda baca!"
                      : "Belum ada pemberitahuan baru di dashboard Anda."}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const IconComponent = getNotificationIcon(notif.iconType || notif.type);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                        notif.read
                          ? isHackerTheme
                            ? "bg-slate-900/30 border-cyan-500/10 opacity-70 hover:opacity-100 hover:bg-slate-900/60"
                            : "bg-slate-50/70 border-slate-200/60 opacity-80 hover:opacity-100 hover:bg-slate-100/70"
                          : isHackerTheme
                          ? "bg-slate-900 border-cyan-500/40 shadow-[inset_0_0_15px_rgba(34,211,238,0.05)] hover:border-cyan-400"
                          : "bg-white border-emerald-500/30 shadow-xs hover:shadow-md hover:border-emerald-500/50"
                      }`}
                    >
                      {!notif.read && (
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}

                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${
                            notif.badgeColor || "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          }`}
                        >
                          <IconComponent size={18} />
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center justify-between gap-2">
                            <h4
                              className={`text-xs font-black truncate ${
                                notif.read
                                  ? isHackerTheme
                                    ? "text-slate-300"
                                    : "text-slate-700"
                                  : isHackerTheme
                                  ? "text-white"
                                  : "text-slate-900"
                              }`}
                            >
                              {notif.title}
                            </h4>
                          </div>

                          <p
                            className={`text-[11px] leading-relaxed mt-1 line-clamp-2 ${
                              isHackerTheme ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            {notif.description}
                          </p>

                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/30 dark:border-slate-800/50">
                            <span className="text-[10px] font-bold text-slate-400">
                              {formatRelativeTime(new Date(notif.time))}
                            </span>

                            <div className="flex items-center gap-2">
                              {notif.actionUrl && (
                                <span className="text-[10px] font-bold flex items-center gap-1 text-emerald-600 dark:text-cyan-400 group-hover:underline">
                                  Lihat <ExternalLink size={10} />
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notif.id);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            <div
              className={`p-4 border-t flex items-center justify-between text-xs backdrop-blur-md ${
                isHackerTheme
                  ? "border-cyan-500/20 bg-slate-950/90"
                  : "border-slate-100 bg-white/90"
              }`}
            >
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Sparkles size={14} className="text-amber-500" />
                <span>Terhubung dengan Server Desa</span>
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all border ${
                    isHackerTheme
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  Tandai Semua Dibaca
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
