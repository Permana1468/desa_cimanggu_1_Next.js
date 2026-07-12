"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { useSearchParams, useRouter } from "next/navigation";

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

  const setActiveTab = (tabId: string) => {
    const newTabParam = tabId === "DASHBOARD" ? "overview" : tabId.toLowerCase();
    router.push(`/dashboard?tab=${newTabParam}`);
  };

  const pieData = [
    { name: "Kesehatan", value: 45, color: "#ef4444" },
    { name: "Sosial (Bansos)", value: 35, color: "#3b82f6" },
    { name: "Pendidikan", value: 15, color: "#eab308" },
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <span className="bg-white/20 p-2 rounded-xl border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-wider">PANEL KOORDINASI PUSKESOS</span>
          </div>
          <h1 className="text-4xl font-black mb-3">Pusat Kesejahteraan Sosial</h1>
          <p className="text-blue-100 max-w-xl leading-relaxed">
            Sistem Layanan Rujukan Terpadu (SLRT), pusat pengaduan masyarakat miskin/rentan, dan penjangkauan (Outreach) DTKS.
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 sticky top-4 z-20">
        {[
          { id: "DASHBOARD", label: "Statistik Real-time", icon: "📊" },
          { id: "WARGA", label: "Data Warga", icon: "👥" },
          { id: "PENGADUAN", label: "Layanan Pengaduan", icon: "💬" },
          { id: "RUJUKAN", label: "Manajemen Rujukan", icon: "📄" },
          { id: "UHC", label: "Usulan UHC", icon: "🏥" },
          { id: "PPKS", label: "Penjangkauan PPKS", icon: "🤝" },
          { id: "PENGURUS", label: "Data Pengurus", icon: "📋" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105" 
                : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: DASHBOARD */}
      {activeTab === "DASHBOARD" && (
        <div className="space-y-6">
          {/* TOP METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pengaduan Masuk</div>
                  <div className="text-2xl font-black text-slate-800">12<span className="text-sm font-medium text-slate-500"> /bulan</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Surat Rujukan (SLRT)</div>
                  <div className="text-2xl font-black text-slate-800">8<span className="text-sm font-medium text-slate-500"> surat</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warga PPKS Terdata</div>
                  <div className="text-2xl font-black text-slate-800">45<span className="text-sm font-medium text-slate-500"> orang</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Penjangkauan (Outreach)</div>
                  <div className="text-2xl font-black text-slate-800">6<span className="text-sm font-medium text-slate-500"> kali</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
              <h3 className="text-lg font-black text-slate-800 mb-6">Tren Pengaduan Mingguan</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAduan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="aduan" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAduan)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-6">Kategori Rujukan</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTHER TABS */}
      {activeTab === "WARGA" && <PuskesosWargaTab session={session} />}
      {activeTab === "UHC" && <PuskesosUhcTab session={session} />}
      {activeTab === "GIS-KEMISKINAN" && <PuskesosGisTab session={session} />}
      {activeTab === "LAPORAN" && (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Fitur Dalam Proses Pengembangan</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Sistem Laporan Kegiatan & LPJ otomatis dari Excel/Word sedang dibangun. Nantinya, Anda dapat menginput atau mengunggah data secara otomatis untuk dicetak oleh Kasi Kesejahteraan dengan format yang sesuai standar.
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
