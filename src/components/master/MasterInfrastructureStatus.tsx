"use client";

import useSWR from "swr";
import { Server, Database, Zap, Cpu, CheckCircle2 } from "lucide-react";

const fetcher = () => {
    return {
        serverLoad: Math.floor(Math.random() * 12) + 8,
        apiTraffic: 68 + Math.floor(Math.random() * 20),
        dbUsageMB: (Math.random() * 6 + 42).toFixed(1)
    };
};

export function MasterInfrastructureStatus() {
  const { data } = useSWR("master-infra-status", fetcher, { 
    refreshInterval: 4000,
    fallbackData: { serverLoad: 12, apiTraffic: 76, dbUsageMB: "44.5" }
  });

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                        <Cpu size={20} />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Status Infrastruktur</h3>
                        <p className="text-slate-400 text-xs font-semibold">Beban server & traffic live global</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Sehat</span>
                </div>
            </div>
            
            <div className="space-y-4">
                <StatusProgress 
                    icon={Server}
                    label="Server Load" 
                    value={`${data?.serverLoad}%`} 
                    percentage={data?.serverLoad} 
                    color="bg-amber-500" 
                />
                <StatusProgress 
                    icon={Database}
                    label="Memory Cache" 
                    value={`${data?.dbUsageMB} MB`} 
                    percentage={Math.min(100, (parseFloat(data?.dbUsageMB || "0") / 80) * 100)} 
                    color="bg-blue-500" 
                />
                <StatusProgress 
                    icon={Zap}
                    label="Kapasitas API" 
                    value={data?.apiTraffic > 90 ? "High" : "Optimal"} 
                    percentage={data?.apiTraffic} 
                    color={data?.apiTraffic > 90 ? "bg-rose-500" : "bg-emerald-500"} 
                />
            </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-100 flex items-center gap-3.5">
            <div className="w-9 h-9 bg-emerald-100/80 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
            </div>
            <div className="min-w-0">
                <span className="text-slate-900 text-xs font-black block truncate">Node Operasional Aktif</span>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Uptime: 99.99% • Bogor DC</span>
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
