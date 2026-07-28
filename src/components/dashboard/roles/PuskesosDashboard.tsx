"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  HeartHandshake, 
  FileText, 
  Users, 
  Activity, 
  Sparkles, 
  Bell, 
  Compass, 
  TrendingUp, 
  ShieldCheck, 
  HeartPulse, 
  MapPin, 
  Globe 
} from "lucide-react";

import { PuskesosPengaduanTab } from "../puskesos/PuskesosPengaduanTab";
import { PuskesosRujukanTab } from "../puskesos/PuskesosRujukanTab";
import { PuskesosPpksTab } from "../puskesos/PuskesosPpksTab";
import { PuskesosPengurusTab } from "../puskesos/PuskesosPengurusTab";
import { PuskesosWargaTab } from "../puskesos/PuskesosWargaTab";
import { PuskesosUhcTab } from "../puskesos/PuskesosUhcTab";
import { PuskesosGisTab } from "../puskesos/PuskesosGisTab";

export function PuskesosDashboard({ session, stats }: any) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams ? searchParams.get("tab") : "overview";
  const activeTab = tabParam === "overview" ? "DASHBOARD" : tabParam?.toUpperCase() || "DASHBOARD";

  const pieData = [
    { name: "Kesehatan (BPJS)", value: 45, color: "#ef4444" },
    { name: "Sosial (Bansos)", value: 35, color: "#3b82f6" },
    { name: "Pendidikan (ATS)", value: 15, color: "#f59e0b" },
    { name: "Lainnya", value: 5, color: "#8b5cf6" },
  ];

  const trendData = [
    { name: "Senin", aduan: 4 },
    { name: "Selasa", aduan: 7 },
    { name: "Rabu", aduan: 5 },
    { name: "Kamis", aduan: 10 },
    { name: "Jumat", aduan: 8 },
    { name: "Sabtu", aduan: 3 },
    { name: "Minggu", aduan: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* TAB CONTENT: DASHBOARD */}
      {activeTab === "DASHBOARD" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* HEADER BANNER WITH DYNAMIC NEON GRADIENT & FLOATING BADGES */}
          <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-950 p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-900/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" style={{ animationDuration: '7s' }} />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl -ml-20 -mb-20" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/15 border border-white/25 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-cyan-200 flex items-center gap-1.5 shadow-xs">
                  <HeartHandshake size={14} className="text-pink-300 animate-bounce" /> PANEL KOORDINASI PUSKESOS (SLRT)
                </span>
                <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={12} className="animate-spin" style={{ animationDuration: '6s' }} /> Active 24/7
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-md">
                Pusat Kesejahteraan Sosial
              </h1>
              <p className="text-blue-100/90 max-w-xl leading-relaxed text-sm font-medium">
                Sistem Layanan Rujukan Terpadu (SLRT), pusat pengaduan masyarakat miskin/rentan, dan penjangkauan (Outreach) DTKS terintegrasi.
              </p>
            </div>
          </div>

          {/* TOP METRICS WITH VIBRANT COLORED ANIMATED ICONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Pengaduan Masuk", val: "12", sub: "/bulan", icon: Bell, iconColor: "text-amber-500 bg-amber-50 border-amber-100", anim: "animate-bounce" },
              { title: "Surat Rujukan (SLRT)", val: "8", sub: "surat", icon: FileText, iconColor: "text-blue-500 bg-blue-50 border-blue-100", anim: "hover:rotate-12" },
              { title: "Warga PPKS Terdata", val: "45", sub: "orang", icon: Users, iconColor: "text-emerald-500 bg-emerald-50 border-emerald-100", anim: "hover:scale-125" },
              { title: "Penjangkauan (Outreach)", val: "6", sub: "kali", icon: Compass, iconColor: "text-purple-500 bg-purple-50 border-purple-100", anim: "animate-pulse" }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ scale: 1.04, translateY: -4 }}
                  key={idx} 
                  className={`bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all flex items-center gap-4 group`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.iconColor.split(' ').slice(1).join(' ')} shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className={`${card.iconColor.split(' ')[0]} ${card.anim}`} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                    <div className="text-2xl font-black text-slate-800 mt-0.5">{card.val} <span className="text-xs font-semibold text-slate-400">{card.sub}</span></div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tren Pengaduan Mingguan</h3>
                  <p className="text-xs text-slate-500">Jumlah aduan warga sosial & kesehatan masuk per hari</p>
                </div>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <TrendingUp size={18} />
                </span>
              </div>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAduanPuskesos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <Tooltip contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="aduan" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAduanPuskesos)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Kategori Rujukan SLRT</h3>
                <p className="text-xs text-slate-500">Persentase rujukan bantuan sosial warga</p>
              </div>
              <div className="h-[180px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{item.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* OTHER TABS */}
      {activeTab === "WARGA" && <PuskesosWargaTab session={session} />}
      {activeTab === "UHC" && <PuskesosUhcTab session={session} />}
      {activeTab === "GIS-KEMISKINAN" && <PuskesosGisTab session={session} />}
      {activeTab === "LAPORAN" && (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Fitur Laporan & LPJ Puskesos</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Sistem Laporan Kegiatan & LPJ otomatis dari Excel/Word terintegrasi.
          </p>
        </div>
      )}
      {activeTab === "PENGADUAN" && <PuskesosPengaduanTab session={session} />}
      {activeTab === "RUJUKAN" && <PuskesosRujukanTab session={session} />}
      {activeTab === "PPKS" && <PuskesosPpksTab session={session} />}
      {activeTab === "PENGURUS" && <PuskesosPengurusTab session={session} />}
    </div>
  );
}
