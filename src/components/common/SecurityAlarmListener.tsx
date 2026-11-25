"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldAlert, AlertTriangle, X, CheckCircle, Volume2, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SecurityAlarmListener() {
  const [alarmMessage, setAlarmMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Play subtle warning beep via Web Audio API safely without needing external audio files
  const playAlarmSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  const checkForAlarm = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    try {
      const res = await fetch("/api/security/alarm-check", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.alarm) {
          setAlarmMessage(data.alarm);
          setIsOpen(true);
          playAlarmSound();
        }
      }
    } catch {
      // Silent error handling for background polling
    }
  }, [playAlarmSound]);

  useEffect(() => {
    // Initial check on mount
    checkForAlarm();

    const handleFocus = () => checkForAlarm();
    window.addEventListener("focus", handleFocus);

    // Check periodically every 25 seconds when tab is active (lightweight API)
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      checkForAlarm();
    }, 25000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [checkForAlarm]);

  if (!isOpen || !alarmMessage) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#0f172a] border-2 border-rose-500 rounded-3xl shadow-[0_0_50px_rgba(244,63,94,0.4)] overflow-hidden text-white"
        >
          {/* Top pulsating alert bar */}
          <div className="h-2 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-pulse" />

          <div className="p-6 sm:p-7 space-y-5">
            {/* Header with flashing shield */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/60 animate-bounce">
                <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black tracking-widest bg-rose-500/30 text-rose-300 border border-rose-500/40 uppercase animate-pulse">
                    SECURITY SENTINEL ALERT
                  </span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                </div>
                <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                  Peringatan Sistem Keamanan & Integritas
                </h3>
                <p className="text-xs text-rose-300/80 font-medium">
                  Pelanggaran SOP / Anomali Otoritas Terdeteksi
                </p>
              </div>
            </div>

            {/* Warning Message Box */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-100 text-xs sm:text-sm leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                <AlertTriangle size={15} />
                <span>Pemberitahuan Resmi Dari Otak Keamanan:</span>
              </div>
              <p className="font-sans font-medium text-slate-200">
                {alarmMessage}
              </p>
            </div>

            {/* Official Legal & CCTV Notice */}
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-300">
                <span>Mesin Pengawas: Python AI & C++ Core</span>
                <span className="text-emerald-400">Terekam di Audit Master</span>
              </div>
              <p className="text-[10px] leading-normal text-slate-400">
                Aktivitas Anda sedang dipantau secara otomatis oleh Otak Sentry CCTV Keamanan Desa. Segala bentuk manipulasi data, penetrasi batas wilayah (IDOR), atau pembobolan sistem akan otomatis diblokade dan diteruskan ke Dashboard Master Administrator.
              </p>
            </div>

            {/* Acknowledgment Button */}
            <div className="pt-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-900/50 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <CheckCircle size={16} />
                <span>Saya Mengerti & Akan Mematuhi Aturan</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

