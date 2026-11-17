"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Server, Database, Zap, Cpu, CheckCircle2, AlertCircle } from "lucide-react";
import { getRealtimeSystemHealth, SystemHealthData } from "@/actions/systemMonitor";

export function MasterInfrastructureStatus() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: health, isLoading } = useSWR<SystemHealthData>(
    "master-realtime-infra-status", 
    getRealtimeSystemHealth, 
    { 
      refreshInterval: 5000,
      revalidateOnFocus: true
    }
  );

  const ramUsagePercent = health?.memory?.osUsagePercent || 25;
  const heapUsagePercent = health?.memory 
    ? Math.round((health.memory.heapUsedMb / Math.max(1, health.memory.heapTotalMb)) * 100) 
    : 30;
  const isHealthy = (health?.loadLevel || "HEALTHY") === "HEALTHY";

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                        <Cpu size={20} />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Status Infrastruktur</h3>
                        <p className="text-slate-400 text-xs font-semibold">Beban server & kapasitas V8 live global</p>
                    </div>
                </div>

                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold ${
                  isHealthy 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                    : "bg-amber-50 border-amber-100 text-amber-700"
                }`}>
                    <span className={`w-2 h-2 rounded-full ${isHealthy ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
                    <span>{isHealthy ? "Sehat" : "Waspada"}</span>
                </div>
            </div>
            
            <div className="space-y-4">
                <StatusProgress 
                    icon={Server}
                    label="RAM Server Terpakai" 
                    value={`${ramUsagePercent}% (${health?.memory?.osUsedMemMb || 0} MB)`} 
                    percentage={ramUsagePercent} 
                    color={ramUsagePercent > 80 ? "bg-rose-500" : ramUsagePercent > 60 ? "bg-amber-500" : "bg-emerald-500"} 
                />
                <StatusProgress 
                    icon={Database}
                    label="Cache & Sampah Disk" 
                    value={health?.cacheGarbage?.formatted || "0 MB"} 
                    percentage={Math.min(100, Math.round(((health?.cacheGarbage?.totalMb || 0) / 1024) * 100))} 
                    color={(health?.cacheGarbage?.totalMb || 0) > 500 ? "bg-amber-500" : "bg-blue-500"} 
                />
                <StatusProgress 
                    icon={Zap}
                    label="Node.js V8 Heap" 
                    value={`${health?.memory?.heapUsedMb || 0} MB (${heapUsagePercent}%)`} 
                    percentage={heapUsagePercent} 
                    color={heapUsagePercent > 80 ? "bg-rose-500" : "bg-indigo-500"} 
                />
            </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-100 flex items-center gap-3.5">
            <div className="w-9 h-9 bg-emerald-100/80 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
            </div>
            <div className="min-w-0">
                <span className="text-slate-900 text-xs font-black block truncate" suppressHydrationWarning>
                  Node Linux ({mounted && health?.cpu?.cores ? health.cpu.cores : 1} Cores) • Node {mounted && health?.nodeVersion ? health.nodeVersion : "v20 LTS"}
                </span>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block" suppressHydrationWarning>
                  Uptime: {mounted && health?.serverUptimeHours ? health.serverUptimeHours : 0} Jam • Server Aktif
                </span>
            </div>
        </div>
    </div>
  );
}

function StatusProgress({ icon: Icon, label, value, percentage, color }: any) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-bold text-slate-500">
                    <Icon size={13} className="text-slate-400" />
                    <span>{label}</span>
                </span>
                <span className="text-slate-800 font-black tabular-nums">{value}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color} rounded-full transition-all duration-700 ease-out`} 
                    style={{ width: `${Math.max(percentage, 5)}%` }} 
                />
            </div>
        </div>
    );
}
