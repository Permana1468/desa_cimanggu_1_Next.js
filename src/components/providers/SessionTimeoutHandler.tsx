"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { ShieldAlert, LogOut, CheckCircle2 } from "lucide-react";

// Total inactivity allowed before auto-logout: 15 minutes (in milliseconds)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
// Countdown warning starts 60 seconds before auto-logout
const WARNING_THRESHOLD = 60 * 1000;
const STORAGE_KEY = "desa_session_last_active";

export default function SessionTimeoutHandler() {
  const { status } = useSession();
  const pathname = usePathname();

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const lastActivityRef = useRef<number>(0);

  // Check if current route is a protected/guarded route
  const isGuardedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/kelembagaan") ||
    pathname.startsWith("/master-admin") ||
    pathname.startsWith("/resident") ||
    pathname.startsWith("/gis-dashboard");

  // Broadcast activity to local storage for multi-tab sync
  const recordActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, String(now));
      } catch {}
    }
    // If warning was showing and user resumes activity, dismiss warning
    setShowWarningModal(false);
  }, []);

  // Multi-tab sync listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const remoteTime = Number(e.newValue);
        if (!isNaN(remoteTime) && remoteTime > lastActivityRef.current) {
          lastActivityRef.current = remoteTime;
          setShowWarningModal(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Inactivity detection & countdown timer loop
  useEffect(() => {
    if (status !== "authenticated" || !isGuardedRoute) {
      setShowWarningModal(false);
      return;
    }

    // Initialize initial activity timestamp
    recordActivity();

    // User interaction events that reset the activity timer
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handleUserInteraction = () => {
      // Throttle event reporting to avoid excessive localStorage writes (at most once every 2 seconds)
      const now = Date.now();
      if (now - lastActivityRef.current > 2000) {
        recordActivity();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserInteraction, { passive: true });
    });

    // Check timer every 1 second
    const interval = setInterval(() => {
      // Read latest timestamp across tabs if available
      let latestTime = lastActivityRef.current;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = Number(stored);
          if (!isNaN(parsed) && parsed > latestTime) {
            latestTime = parsed;
            lastActivityRef.current = parsed;
          }
        }
      } catch {}

      const elapsed = Date.now() - latestTime;
      const timeLeft = INACTIVITY_TIMEOUT - elapsed;

      // 1. Time is completely up -> auto logout immediately
      if (timeLeft <= 0) {
        clearInterval(interval);
        signOut({ callbackUrl: "/login?reason=inactive" });
        return;
      }

      // 2. In warning window (last 60 seconds) -> show warning modal
      if (timeLeft <= WARNING_THRESHOLD) {
        const secs = Math.ceil(timeLeft / 1000);
        setSecondsRemaining(Math.max(1, secs));
        setShowWarningModal(true);
      } else {
        setShowWarningModal(false);
      }
    }, 1000);

    // Immediate check on laptop wake or tab switch back
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        const elapsed = now - lastActivityRef.current;
        if (elapsed >= INACTIVITY_TIMEOUT) {
          signOut({ callbackUrl: "/login?reason=inactive" });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserInteraction);
      });
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [status, isGuardedRoute, recordActivity]);

  if (!showWarningModal || status !== "authenticated" || !isGuardedRoute) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-7 sm:p-8 shadow-2xl border border-rose-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/60 animate-bounce">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Peringatan Sesi Tidak Aktif
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Tidak ada aktivitas terdeteksi di dashboard. Demi mencegah kebocoran data desa, sesi Anda akan otomatis berakhir dalam:
          </p>
        </div>

        {/* Live Countdown Circle / Pill */}
        <div className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-mono font-black text-2xl tracking-wider shadow-inner">
          00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
        </div>

        <p className="text-[11px] text-slate-400">
          Klik tombol di bawah untuk tetap melanjutkan pekerjaan Anda.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={() => recordActivity()}
            className="w-full sm:flex-1 py-3 px-5 rounded-full bg-[#1d64ec] hover:bg-[#1554c9] active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={16} />
            <span>Saya Masih Bekerja</span>
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/login?reason=inactive" })}
            className="w-full sm:w-auto py-3 px-4 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={15} />
            <span>Keluar Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
