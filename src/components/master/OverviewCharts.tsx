"use client";

import { 
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { TrendingUp, ShieldCheck, ArrowUpRight, Activity } from "lucide-react";

const residentGrowthData = [
    { name: 'Sen', residents: 410, change: '+12' },
    { name: 'Sel', residents: 580, change: '+24' },
    { name: 'Rab', residents: 720, change: '+18' },
    { name: 'Kam', residents: 950, change: '+32' },
    { name: 'Jum', residents: 1200, change: '+45' },
    { name: 'Sab', residents: 1650, change: '+60' },
    { name: 'Min', residents: 2100, change: '+85' },
];

const transactionLogsData = [
    { name: 'Sen', logs: 240, latency: '12ms' },
    { name: 'Sel', logs: 380, latency: '14ms' },
    { name: 'Rab', logs: 650, latency: '11ms' },
    { name: 'Kam', logs: 490, latency: '13ms' },
    { name: 'Jum', logs: 720, latency: '15ms' },
    { name: 'Sab', logs: 530, latency: '12ms' },
    { name: 'Min', logs: 890, latency: '10ms' },
];

export function OverviewCharts() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* CHART 1: POPULATION GROWTH */}
            <div className="bg-white p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                Pertumbuhan Populasi
                            </h3>
                            <p className="text-slate-400 text-xs font-semibold">Estimasi registrasi & update warga mingguan</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black">
                        <ArrowUpRight size={14} className="stroke-[2.5]" />
                        <span>+14.8% Tren Positif</span>
                    </div>
                </div>

                <div className="h-[200px] sm:h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={residentGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="popColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            />
                            <YAxis 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#0f172a', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                                }}
                                itemStyle={{ color: '#60a5fa' }}
                                labelStyle={{ color: '#cbd5e1' }}
                                formatter={(val: any) => [`${val} Warga`, 'Akumulasi']}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="residents" 
                                stroke="#2563eb" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#popColor)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* CHART 2: SYSTEM SECURITY & TRANSACTION LOGS */}
            <div className="bg-white p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                Transaksi & Audit Log
                            </h3>
                            <p className="text-slate-400 text-xs font-semibold">Volume aktivitas data & audit sistem</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black">
                        <Activity size={14} className="stroke-[2.5]" />
                        <span>Aktivitas Normal</span>
                    </div>
                </div>

                <div className="h-[200px] sm:h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={transactionLogsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            />
                            <YAxis 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#0f172a', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                                }}
                                itemStyle={{ color: '#38bdf8' }}
                                labelStyle={{ color: '#cbd5e1' }}
                                formatter={(val: any) => [`${val} Transaksi`, 'Volume Log']}
                            />
                            <Bar 
                                dataKey="logs" 
                                fill="#0f172a" 
                                radius={[8, 8, 2, 2]} 
                                barSize={24} 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
