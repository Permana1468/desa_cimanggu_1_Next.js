"use client";

import { useState, useEffect } from "react";
import { BarChart3, Baby, HeartPulse, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getPosyanduDashboardStats } from "@/actions/posyandu";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ["#0d9488", "#ec4899", "#6366f1", "#f59e0b"];

export function PosyanduAnalisisTab({ session }: any) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getPosyanduDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pieData = [
    { name: "Balita Normal", value: (stats?.totalBalita || 0) - (stats?.stuntingBalita || 0) },
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
      sub: "terdaftar aktif",
      trend: "neutral",
    },
    {
      label: "Lansia",
      value: stats?.totalLansia || 0,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      sub: "dalam pemantauan",
      trend: "neutral",
    },
    {
      label: "Stunting Rate",
      value: stats?.totalBalita
        ? `${((stats.stuntingBalita / stats.totalBalita) * 100).toFixed(1)}%`
        : "0%",
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-50",
      sub: "dari total balita",
      trend: "down",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-500" />
          Analisis Laporan
        </h2>
        <p className="text-slate-500 text-sm mt-1">Ringkasan dan analisis data kesehatan posyandu</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon size={22} className={card.color} />
              </div>
              <div className={`p-1 rounded-lg ${card.trend === "up" ? "bg-green-50" : card.trend === "down" ? "bg-red-50" : "bg-slate-50"}`}>
                {card.trend === "up" ? <TrendingUp size={14} className="text-green-600" /> :
                 card.trend === "down" ? <TrendingDown size={14} className="text-red-500" /> :
                 <Minus size={14} className="text-slate-400" />}
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
            <p className="text-2xl font-black text-slate-800">{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-1">Grafik Pertumbuhan Balita</h3>
          <p className="text-xs text-slate-400 mb-5">Rata-rata berat & tinggi badan per bulan</p>
          {stats?.chartData && stats.chartData.length > 0 ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "16px" }} />
                  <Bar dataKey="beratRataRata" name="Berat (Kg)" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="tinggiRataRata" name="Tinggi (Cm)" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center">
              <p className="text-slate-400 text-sm">Data grafik belum tersedia</p>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-1">Distribusi Sasaran Posyandu</h3>
          <p className="text-xs text-slate-400 mb-5">Komposisi berdasarkan kategori layanan</p>
          <div className="h-[260px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alert Info */}
      {stats?.stuntingBalita > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
              <TrendingDown size={20} className="text-rose-600" />
            </div>
            <div>
              <h4 className="font-bold text-rose-800 mb-1">Perhatian: Kasus Stunting Terdeteksi</h4>
              <p className="text-sm text-rose-700/80">
                Terdapat <strong>{stats.stuntingBalita} balita</strong> yang terdeteksi stunting.
                Segera lakukan tindak lanjut berupa kunjungan rumah dan konsultasi dengan tenaga kesehatan Puskesmas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
