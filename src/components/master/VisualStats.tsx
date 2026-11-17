"use client";

import React from "react";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { TrendingUp, PieChart as PieIcon, Users } from "lucide-react";

interface VisualStatsProps {
    growthData: any[];
    demographicData: any[];
}

const COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

export const VisualStats = ({ growthData, demographicData }: VisualStatsProps) => {
    const totalDemographic = (demographicData || []).reduce((acc, curr) => acc + (curr.value || 0), 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* GROWTH CHART - Modern Clean Glassmorphic Card */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-blue-500/10 transition-all" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10 border-b border-slate-100 pb-5">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                Ecosystem Growth
                            </h3>
                        </div>
                        <p className="text-slate-400 text-xs font-semibold mt-1">
                            Matriks registrasi & pembaruan kependudukan desa (6 bulan berjalan)
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 self-start sm:self-auto">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        <span>Tren Positif Terpantau</span>
                    </div>
                </div>

                <div className="h-[340px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    borderRadius: '16px', 
                                    border: '1px solid #e2e8f0', 
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                                    padding: '14px 18px', 
                                    backgroundColor: '#ffffff', 
                                    color: '#0f172a',
                                    fontWeight: 'bold'
                                }}
                                itemStyle={{ fontSize: '13px', fontWeight: '800', color: '#2563eb' }}
                                cursor={{ stroke: '#3b82f6', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#2563eb" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* DEMOGRAPHIC DONUT - Refined Modern Harmony Card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-indigo-500/10 transition-all" />
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                                <PieIcon size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Demographics</h3>
                                <p className="text-slate-400 text-xs font-semibold">Komposisi Gender Warga</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Sampel</span>
                            <span className="text-sm font-black text-slate-900 tabular-nums">{totalDemographic.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div className="h-[220px] w-full relative z-10 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={demographicData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={6}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {demographicData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer outline-none" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '14px', 
                                        border: '1px solid #e2e8f0', 
                                        backgroundColor: '#ffffff', 
                                        color: '#0f172a', 
                                        fontWeight: '800',
                                        fontSize: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-4 space-y-2.5 relative z-10">
                    {demographicData.map((d, i) => {
                        const pct = totalDemographic > 0 ? Math.round((d.value / totalDemographic) * 100) : 0;
                        return (
                            <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-all cursor-default">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-xs font-bold text-slate-700">{d.name || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400">({pct}%)</span>
                                    <span className="text-xs font-black text-slate-900 tabular-nums">{d.value.toLocaleString()}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
