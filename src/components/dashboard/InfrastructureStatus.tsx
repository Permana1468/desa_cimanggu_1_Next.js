"use client";

import useSWR from "swr";
import { Server, Database, Zap } from "lucide-react";

const fetcher = () => {
    // Simulate real-time API call
    return {
        serverLoad: Math.floor(Math.random() * 15) + 5,
        apiTraffic: 70 + Math.floor(Math.random() * 25),
        dbUsageMB: (Math.random() * 10 + 45).toFixed(1)
    };
};

export function InfrastructureStatus() {
  const { data, error } = useSWR("infra-status", fetcher, { 
    refreshInterval: 3000,
    fallbackData: { serverLoad: 10, apiTraffic: 80, dbUsageMB: "45.0" }
  });

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 h-full flex flex-col justify-between">
        <div>
            <h2 className="text-xl font-black text-slate-800 mb-2">Status Infrastruktur</h2>
            <p className="text-slate-500 text-xs leading-relaxed mb-8">Kesehatan server dan penggunaan resource global secara real-time.</p>
            
            <div className="space-y-6">
                <StatusProgress label="Server Load" value={`${data?.serverLoad}%`} percentage={data?.serverLoad} color="bg-amber-500" />
                <StatusProgress label="Database Usage" value={`${data?.dbUsageMB}MB`} percentage={Math.min(100, (parseFloat(data?.dbUsageMB || "0") / 100) * 100)} color="bg-blue-500" />
                <StatusProgress label="API Traffic" value={data?.apiTraffic > 90 ? "Critical" : "Healthy"} percentage={data?.apiTraffic} color={data?.apiTraffic > 90 ? "bg-red-500" : "bg-emerald-500"} />
            </div>
        </div>

        <div className="mt-12 bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div>
                <span className="text-slate-800 text-sm font-black block">Sistem Terpantau</span>
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Uptime: 14 hari, 2 jam</span>
            </div>
        </div>
    </div>
  );
}

function StatusProgress({ label, value, percentage, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>{label}</span>
                <span className="text-slate-800 font-bold">{value}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}
