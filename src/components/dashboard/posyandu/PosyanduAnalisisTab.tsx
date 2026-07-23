"use client";

import { useState, useEffect } from "react";
import { BarChart3, Baby, HeartPulse, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getPosyanduDashboardStats } from "@/actions/posyandu";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ["#0d9488", "#ec4899", "#6366f1", "#f59e0b"];

export function PosyanduAnalisisTab({ session, selectedPosyandu }: { session?: any; selectedPosyandu?: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getPosyanduDashboardStats(selectedPosyandu);
      setStats(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [selectedPosyandu]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pieData = [
    { name: "Balita Normal", value: Math.max(0, (stats?.totalBalita || 0) - (stats?.stuntingBalita || 0)) },
    { name: "Stunting", value: stats?.stuntingBalita || 0 },
    { name: "Ibu Hamil", value: stats?.totalIbuHamil || 0 },
    { name: "Lansia", value: stats?.totalLansia || 0 },
  ];

  const summaryCards = [
    {
      label: "Total Balita",
      value: stats?.totalBalita || 0,
      icon: Baby,
      color: "text-blue-600",
      bg: "bg-blue-50",
      sub: `${stats?.stuntingBalita || 0} stunting`,
      trend: stats?.stuntingBalita > 0 ? "down" : "up",
    },
    {
      label: "Ibu Hamil",
      value: stats?.totalIbuHamil || 0,
      icon: HeartPulse,
      color: "text-pink-600",
      bg: "bg-pink-50",
      sub: `${stats?.layananIbuHamilCount || 0} layanan`,
      trend: "up",
    },
    {
      label: "Total Lansia",
      value: stats?.totalLansia || 0,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      sub: `${stats?.layananLansiaCount || 0} layanan`,
      trend: "up",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-500" />
            Analisis & Pelaporan Posyandu
          </h2>
          <p className="text-slate-500 text-sm mt-1">Ringkasan dan analisis data kesehatan posyandu</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{card.value}</h3>
                <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Tren Pertumbuhan Rata-Rata Balita</h3>
          <div className="h-[280px]">
            {stats?.chartData && stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,.1)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="beratRataRata" name="BB Rata-rata (Kg)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tinggiRataRata" name="TB Rata-rata (Cm)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Belum ada data grafik.</div>
            )}
          </div>
        </div>

        {/* Target Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Distribusi Sasaran Posyandu</h3>
          <div className="h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,.1)" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
