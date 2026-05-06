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
    BarChart,
    Bar,
    Legend
} from "recharts";
import { TrendingUp, PieChart as PieIcon, Activity } from "lucide-react";

interface VisualStatsProps {
    growthData: any[];
    demographicData: any[];
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export const VisualStats = ({ growthData, demographicData }: VisualStatsProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* GROWTH CHART - Cinematic */}
            <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-blue-500/10 transition-all" />
                
                <div className="flex items-center justify-between mb-12 relative z-10">
                    <div>
                        <h3 className="text-2xl font-black text-slate-950 tracking-tighter flex items-center gap-3">
                            <TrendingUp className="text-blue-600" size={28} /> Ecosystem Growth
                        </h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">New Resident Registration Matrix (6 Months)</p>
                    </div>
                </div>

                <div className="h-[400px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }}
                                dy={15}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px', backgroundColor: '#0f172a', color: '#fff' }}
                                itemStyle={{ fontSize: '14px', fontWeight: '900', color: '#3b82f6' }}
                                cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#3b82f6" 
                                strokeWidth={6}
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* DEMOGRAPHIC PIE - Cinematic */}
            <div className="bg-slate-950 rounded-[3.5rem] p-10 md:p-12 shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />
                
                <h3 className="text-2xl font-black text-white tracking-tighter mb-10 flex items-center gap-3 relative z-10">
                    <PieIcon className="text-amber-500" size={28} /> Demographics
                </h3>
                
                <div className="h-[320px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={demographicData}
                                cx="50%"
                                cy="50%"
                                innerRadius={75}
                                outerRadius={115}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {demographicData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer outline-none" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: '900' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-12 space-y-4 relative z-10">
                    {demographicData.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/item cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: COLORS[i % COLORS.length], color: COLORS[i % COLORS.length] }} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover/item:text-white transition-colors">{d.name || "N/A"}</span>
                            </div>
                            <span className="text-sm font-black text-white tabular-nums">{d.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
