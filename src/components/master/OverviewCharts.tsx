"use client";

import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Users, Database, Shield } from "lucide-react";

const data = [
    { name: 'Sen', residents: 400, transactions: 240 },
    { name: 'Sel', residents: 600, transactions: 139 },
    { name: 'Rab', residents: 900, transactions: 980 },
    { name: 'Kam', residents: 1200, transactions: 390 },
    { name: 'Jum', residents: 1500, transactions: 480 },
    { name: 'Sab', residents: 1800, transactions: 380 },
    { name: 'Min', residents: 2100, transactions: 430 },
];

export function OverviewCharts() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <TrendingUp className="text-emerald-500" size={24} /> Pertumbuhan Populasi
                        </h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Estimasi Mingguan</p>
                    </div>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" hide />
                            <Tooltip 
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="residents" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRes)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Shield className="text-blue-500" size={24} /> Keamanan Sistem
                        </h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Audit Log Rate</p>
                    </div>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" hide />
                            <Tooltip 
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="transactions" fill="#0f172a" radius={[10, 10, 10, 10]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
