"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Info, 
  FileText, 
  MessageSquare, 
  HeartPulse, 
  Clock,
  LucideIcon 
} from "lucide-react";

export interface NotificationItem {
  id: string;
  type: "security" | "system" | "surat" | "pengaduan" | "posyandu" | "info";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  iconType?: string;
  badgeColor?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "surat",
    title: "Permohonan Surat Masuk",
    description: "Warga mengajukan Surat Keterangan Usaha (SKU) #SKU-2026-089 perlu verifikasi.",
    time: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    read: false,
    actionUrl: "/dashboard/surat",
    iconType: "surat",
    badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "notif-2",
    type: "pengaduan",
    title: "Laporan Pengaduan Baru",
    description: "Pengaduan mengenai perbaikan lampu jalan RT 02/RW 04 telah masuk.",
    time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    actionUrl: "/dashboard/layanan/pengaduan",
    iconType: "pengaduan",
    badgeColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  },
  {
    id: "notif-3",
    type: "posyandu",
    title: "Jadwal Posyandu Mawar",
    description: "Kegiatan penimbangan balita rutin akan diselenggarakan esok hari pukul 08:00 WIB.",
    time: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    read: false,
    actionUrl: "/dashboard/posyandu",
    iconType: "posyandu",
    badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "notif-4",
    type: "system",
    title: "Pemberitahuan Sistem",
    description: "Backup otomatis basis data desa diselesaikan dengan sukses.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    read: true,
    actionUrl: "/master-admin/logs",
    iconType: "system",
    badgeColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "notif-5",
    type: "security",
    title: "Sesi Login Baru",
    description: "Login terdeteksi dari perangkat Firefox Linux di Wilayah Desa Cimanggu.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    actionUrl: "/dashboard/pengaturan",
    iconType: "security",
    badgeColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  }
];

const STORAGE_KEY = "desa_cimanggu_notifications_v1";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage or initialize
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed);
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to load notifications from localStorage:", e);
    }
    setNotifications(INITIAL_NOTIFICATIONS);
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn("Failed to save notifications to localStorage:", e);
    }
  }, [notifications, isLoaded]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((notif: Omit<NotificationItem, "id" | "time" | "read">) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      time: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification,
    isLoaded,
  };
}

export function getNotificationIcon(type: string): LucideIcon {
  switch (type) {
    case "security":
      return ShieldAlert;
    case "surat":
      return FileText;
    case "pengaduan":
      return MessageSquare;
    case "posyandu":
      return HeartPulse;
    case "system":
      return Activity;
    default:
      return Info;
  }
}
