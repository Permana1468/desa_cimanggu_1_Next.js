"use client";

import { useState } from "react";
import useSWR from "swr";
import { 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  HardDrive, 
  Activity, 
  Sparkles, 
  Database,
  Layers,
  ShieldAlert
} from "lucide-react";
import { getRealtimeSystemHealth, purgeSystemCacheAction, SystemHealthData } from "@/actions/systemMonitor";
import toast from "react-hot-toast";

interface SystemHealthCacheManagerProps {
  initialData?: SystemHealthData;
}

export function SystemHealthCacheManager({ initialData }: SystemHealthCacheManagerProps) {
  const [cleaning, setCleaning] = useState(false);

  const { data: health, mutate, isLoading } = useSWR<SystemHealthData>(
    "realtime-system-health",
    getRealtimeSystemHealth,
    {
      fallbackData: initialData,
      refreshInterval: 6000, // Refresh automatically every 6 seconds
      revalidateOnFocus: true,
    }
  );

  const handlePurgeCache = async () => {
    setCleaning(true);
    const toastId = toast.loading("Membersihkan cache & sampah sistem...");
    try {
      const res = await purgeSystemCacheAction();
      if (res.success) {
        toast.success(res.message, { id: toastId, duration: 4000 });
        await mutate(); // Refresh real-time numbers immediately
      } else {
        toast.error(res.message, { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membersihkan cache", { id: toastId });
    } finally {
      setCleaning(false);
    }
  };

  const loadLevel = health?.loadLevel || "HEALTHY";
  const isCritical = loadLevel === "CRITICAL";
  const isWarning = loadLevel === "WARNING";

  // Cache percentage against 1024 MB (1 GB threshold)
  const cacheMb = health?.cacheGarbage.totalMb || 0;
  const cachePercent = Math.min(100, Math.round((cacheMb / 1024) * 100));

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
      {/* Ambient background glow */}
      <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-all ${
        isCritical 
          ? "bg-rose-500/20" 
          : isWarning 
          ? "bg-amber-500/15" 
          : "bg-blue-500/15"
      }`} />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
            isCritical
              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
              : isWarning
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          }`}>
            <HardDrive size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white tracking-tight">System Resource & Cache Collector</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isCritical
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  : isWarning
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              }`}>
                {loadLevel === "CRITICAL" ? "Beban Kritis" : loadLevel === "WARNING" ? "Beban Meningkat" : "Normal / Ringan"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Pemantauan penggunaan memori, sampah build cache, dan pembersihan instan satu klik.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={() => mutate()}
            disabled={isLoading}
            title="Refresh Status"
            className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all active:scale-95"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin text-blue-400" : ""} />
          </button>
          <button
            onClick={handlePurgeCache}
            disabled={cleaning}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 ${
              isCritical
                ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30 animate-pulse"
                : isWarning
                ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-600/30"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30"
            }`}
          >
            <Trash2 size={16} className={cleaning ? "animate-bounce" : ""} />
            <span>{cleaning ? "Membersihkan..." : "Bersihkan Sampah & Cache"}</span>
          </button>
        </div>
      </div>

      {/* Warning banner if cache is heavy or memory is elevated */}
      {(isCritical || isWarning) && health?.warningMessage && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-3.5 relative z-10 ${
          isCritical
            ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
            : "bg-amber-500/10 border-amber-500/30 text-amber-200"
        }`}>
          <div className="mt-0.5 p-1 rounded-lg shrink-0">
            {isCritical ? <ShieldAlert size={20} className="text-rose-400" /> : <AlertTriangle size={20} className="text-amber-400" />}
          </div>
          <div className="flex-1 text-xs">
            <span className="font-bold block text-sm mb-0.5">
              {isCritical ? "Peringatan: Beban Server Terlalu Berat!" : "Pemberitahuan Beban Cache"}
            </span>
            <p className="leading-relaxed opacity-90">{health.warningMessage}</p>
          </div>
        </div>
      )}

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
        {/* Metric 1: Disk Cache & Dev Garbage */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive size={14} className="text-blue-400" /> Sampah Build Cache
            </span>
            <span className="text-white font-mono font-bold">{health?.cacheGarbage.formatted || "0 MB"}</span>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  cachePercent > 75 ? "bg-rose-500" : cachePercent > 40 ? "bg-amber-500" : "bg-blue-500"
                }`}
                style={{ width: `${Math.max(cachePercent, 4)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 MB</span>
              <span>Ambang Batas: 1 GB</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Cache / Dev / Temp:</span>
            <span className="font-mono text-slate-300">
              {health?.cacheGarbage.totalMb || 0} MB
            </span>
          </div>
        </div>

        {/* Metric 2: Server RAM OS Usage */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Database size={14} className="text-emerald-400" /> RAM Sistem Server
            </span>
            <span className="text-white font-mono font-bold">{health?.memory.osUsagePercent || 0}%</span>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  (health?.memory.osUsagePercent || 0) > 85 ? "bg-rose-500" : (health?.memory.osUsagePercent || 0) > 70 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.max(health?.memory.osUsagePercent || 0, 4)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Terpakai: {health?.memory.osUsedMemMb || 0} MB</span>
              <span>Total: {health?.memory.osTotalMemMb || 0} MB</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>RAM Tersedia:</span>
            <span className="font-mono text-emerald-400 font-semibold">
              {health?.memory.osFreeMemMb || 0} MB
            </span>
          </div>
        </div>

        {/* Metric 3: Node.js V8 Heap & CPU Load */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Cpu size={14} className="text-purple-400" /> V8 Heap & CPU Cores
            </span>
            <span className="text-white font-mono font-bold">{health?.cpu.cores || 1} Cores</span>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.round(((health?.memory.heapUsedMb || 0) / Math.max(1, health?.memory.heapTotalMb || 1)) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Heap: {health?.memory.heapUsedMb || 0} MB</span>
              <span>Alloc: {health?.memory.heapTotalMb || 0} MB</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Load Avg (1m, 5m):</span>
            <span className="font-mono text-slate-300">
              {health?.cpu.loadAvg1m || 0}, {health?.cpu.loadAvg5m || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

