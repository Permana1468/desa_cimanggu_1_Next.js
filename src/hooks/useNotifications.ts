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
import type { LiveNotification } from "@/actions/notifications";
export type { LiveNotification };

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
const SYNC_CHANNEL_NAME = "desa_cimanggu_realtime_sync";

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      return new BroadcastChannel(SYNC_CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return null;
}

export function triggerNotificationRefresh() {
  if (typeof window !== "undefined") {
    // 1. Dispatch locally in the current tab
    window.dispatchEvent(new Event("refresh-notifications"));

    // 2. Broadcast to all other open tabs/windows on the machine
    try {
      const channel = getBroadcastChannel();
      if (channel) {
        channel.postMessage({ type: "SYNC_EVENT", timestamp: Date.now() });
        channel.close();
      }
    } catch {
      // Fallback: localStorage storage event
      try {
        localStorage.setItem("desa_cimanggu_last_sync", String(Date.now()));
      } catch {}
    }
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
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch notifications API");
      const json = await res.json();
      const liveData: any[] = json.notifications || [];

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
      console.warn("Error fetching live notifications:", err);
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

    // Cross-tab synchronization listener via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data?.type === "SYNC_EVENT") {
            window.dispatchEvent(new Event("refresh-notifications"));
          }
        };
      } catch {}
    }

    // Fallback for storage event across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "desa_cimanggu_last_sync") {
        window.dispatchEvent(new Event("refresh-notifications"));
      }
    };
    window.addEventListener("storage", handleStorage);

    // Non-intrusive polling every 30 seconds for background notifications
    const interval = setInterval(fetchLive, 30000);

    return () => {
      window.removeEventListener("refresh-notifications", handleRefresh);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
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
