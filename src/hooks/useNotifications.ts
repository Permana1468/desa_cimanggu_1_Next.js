"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { getLiveNotifications, LiveNotification } from "@/actions/notifications";

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
  priority?: "high" | "medium" | "low";
}

const STORAGE_READ_KEY = "desa_cimanggu_read_notif_ids_v2";
const STORAGE_DELETED_KEY = "desa_cimanggu_deleted_notif_ids_v2";

export function triggerNotificationRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("refresh-notifications"));
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isFetchingRef = useRef(false);

  const getStoredSet = (key: string): Set<string> => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch {
      // ignore JSON parse error
    }
    return new Set<string>();
  };

  const saveStoredSet = (key: string, set: Set<string>) => {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch (e) {
      console.warn("Failed to persist notification state to localStorage:", e);
    }
  };

  const fetchLive = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const liveData = await getLiveNotifications();
      const readSet = getStoredSet(STORAGE_READ_KEY);
      const deletedSet = getStoredSet(STORAGE_DELETED_KEY);

      const mapped: NotificationItem[] = liveData
        .filter((item) => !deletedSet.has(item.id))
        .map((item) => ({
          ...item,
          read: readSet.has(item.id) || item.read,
          iconType: item.type,
        }));

      setNotifications(mapped);
      setIsLoaded(true);
    } catch (err) {
      console.error("Error fetching live notifications:", err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchLive();

    const handleRefresh = () => fetchLive();
    const handleFocus = () => fetchLive();

    window.addEventListener("refresh-notifications", handleRefresh);
    window.addEventListener("focus", handleFocus);

    // Realtime polling every 12 seconds for immediate notification updates
    const interval = setInterval(fetchLive, 12000);

    return () => {
      window.removeEventListener("refresh-notifications", handleRefresh);
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [fetchLive]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    const readSet = getStoredSet(STORAGE_READ_KEY);
    readSet.add(id);
    saveStoredSet(STORAGE_READ_KEY, readSet);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const readSet = getStoredSet(STORAGE_READ_KEY);
    notifications.forEach((n) => readSet.add(n.id));
    saveStoredSet(STORAGE_READ_KEY, readSet);
  }, [notifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const deletedSet = getStoredSet(STORAGE_DELETED_KEY);
    deletedSet.add(id);
    saveStoredSet(STORAGE_DELETED_KEY, deletedSet);
  }, []);

  const addNotification = useCallback((notif: Omit<NotificationItem, "id" | "time" | "read">) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `manual-notif-${Date.now()}`,
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
    refreshNotifications: fetchLive,
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
