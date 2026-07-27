"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  HeartPulse, 
  Baby, 
  Download,
  CalendarDays,
  FileBarChart,
  Search,
  Activity,
  Heart,
  UserCircle,
  Users,
  AlertTriangle,
  PieChart as PieIcon,
  BarChart3
} from "lucide-react";
import { useState, useEffect } from "react";
import { getPosyanduLaporanStats } from "@/actions/posyandu";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const PIE_COLORS = ["#f43f5e", "#fbbf24", "#ec4899", "#14b8a6"];

export function LaporanPosyandu({ session, posyanduId }: { session: any, posyanduId: string }) {
  const posyanduMap: Record<string, string> = {
    "posyandu-mawar-1": "Posyandu Mawar I",
    "posyandu-mawar-2": "Posyandu Mawar II",
    "posyandu-mawar-3": "Posyandu Mawar III",
    "posyandu-mawar-4": "Posyandu Mawar IV",
    "posyandu-mawar-5": "Posyandu Mawar V",
    "posyandu-mawar-6": "Posyandu Mawar VI",
    "posyandu-mawar-7": "Posyandu Mawar VII",
  };
  const rawPosyanduName = posyanduMap[posyanduId] || "Posyandu";
  // Clean name so it doesn't duplicate "Posyandu Posyandu"
  const displayTitle = rawPosyanduName.startsWith("Posyandu") ? rawPosyanduName : `Posyandu ${rawPosyanduName}`;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'balita' | 'bumil' | 'lansia'>('ringkasan');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getPosyanduLaporanStats(rawPosyanduName);
        setData(result);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchData();
  }, [rawPosyanduName]);

  const handleDownloadCSV = (type: 'balita' | 'bumil' | 'lansia') => {
    if (!data) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = "";

    if (type === 'balita') {
        filename = `Data_Balita_${displayTitle}.csv`;
        csvContent += "Nama Balita,Nama Orang Tua,Jenis Kelamin,Status Stunting\n";
        data.listBalita?.forEach((b: any) => {
            csvContent += `${b.namaLengkap},${b.namaOrangTua},${b.jenisKelamin},${b.statusStunting ? 'Ya' : 'Tidak'}\n`;
        });
    } else if (type === 'bumil') {
        filename = `Data_Ibu_Hamil_${displayTitle}.csv`;
        csvContent += "Nama Ibu,Usia Kandungan\n";
        data.listIbuHamil?.forEach((b: any) => {
            csvContent += `${b.namaLengkap},${b.usiaKandungan || '-'}\n`;
        });
    } else if (type === 'lansia') {
        filename = `Data_Lansia_${displayTitle}.csv`;
        csvContent += "Nama Lansia,Usia,Jenis Kelamin\n";
        data.listLansia?.forEach((l: any) => {
            csvContent += `${l.namaLengkap},${l.usia},${l.jenisKelamin}\n`;
        });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'ringkasan', label: 'Ringkasan Laporan', icon: FileBarChart },
    { id: 'balita', label: 'Daftar Balita', icon: Baby },
    { id: 'bumil', label: 'Daftar Ibu Hamil', icon: Heart },
    { id: 'lansia', label: 'Daftar Lansia', icon: UserCircle },
  ];

  const pieData = [
    { name: "Balita Normal", value: Math.max(0, (data?.totalBalita || 0) - (data?.stuntingCount || 0)) },
    { name: "Balita Stunting", value: data?.stuntingCount || 0 },
    { name: "Ibu Hamil", value: data?.totalIbuHamil || 0 },
    { name: "Lansia", value: data?.totalLansia || 0 },
  ];

  const summaryCards = [
    {
      label: "Total Balita",
      value: loading ? "..." : (data?.totalBalita || 0),
      icon: Baby,
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-100",
      sub: `${data?.stuntingCount || 0} Terdeteksi Stunting`,
    },
    {
      label: "Balita Stunting",
      value: loading ? "..." : (data?.stuntingCount || 0),
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
      sub: "Membutuhkan Intervensi",
    },
    {
      label: "Ibu Hamil",
      value: loading ? "..." : (data?.totalIbuHamil || 0),
      icon: Heart,
      color: "text-pink-600",
      bg: "bg-pink-50 border-pink-100",
      sub: "Sasaran Pemeriksaan",
    },
    {
      label: "Total Lansia",
      value: loading ? "..." : (data?.totalLansia || 0),
      icon: Users,
      color: "text-teal-600",
      bg: "bg-teal-50 border-teal-100",
      sub: "Sasaran Posyandu Lansia",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <HeartPulse className="text-rose-500" /> 
                Laporan {displayTitle}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Laporan kesehatan balita, ibu hamil, dan lansia secara real-time.</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto w-full md:w-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-rose-600 shadow-sm border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'ringkasan' && (
            <div className="space-y-6">
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {summaryCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <motion.div 
                      key={card.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-6 rounded-[2rem] border ${card.bg} bg-white shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1`}
                    >
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{card.label}</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-1">{card.value}</h3>
                        <p className="text-xs font-bold text-slate-500 mt-1.5">{card.sub}</p>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center shadow-inner`}>
                        <Icon size={28} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recharts Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="text-rose-500" size={20} />
                          <h2 className="text-lg font-black text-slate-800">Grafik Kunjungan Warga (Bulan Ini)</h2>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100">
                            <CalendarDays size={14} />
                            <span>Real-time</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full pt-4">
                      {loading ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-bold text-sm">Memuat grafik...</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data?.weeklyStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,.1)" }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px", fontWeight: 600 }} />
                            <Bar dataKey="balita" name="Balita" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="bumil" name="Ibu Hamil" fill="#fbbf24" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="lansia" name="Lansia" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                </div>

                {/* Recharts Pie Chart */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2">
                        <PieIcon className="text-indigo-500" size={20} />
                        <h2 className="text-lg font-black text-slate-800">Distribusi Sasaran</h2>
                    </div>

                    <div className="h-[280px] w-full flex items-center justify-center">
                      {loading ? (
                        <div className="text-slate-400 font-bold text-sm">Memuat diagram...</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                              data={pieData} 
                              cx="50%" 
                              cy="50%" 
                              innerRadius={60} 
                              outerRadius={85} 
                              paddingAngle={5} 
                              dataKey="value"
                            >
                              {pieData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,.1)" }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: 600 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'ringkasan' && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Cari nama..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-shadow font-medium"
                        />
                    </div>
                    <button 
                        onClick={() => handleDownloadCSV(activeTab as any)}
                        className="px-6 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                        <Download size={18} /> Unduh CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                                {activeTab === 'balita' && (
                                    <>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Nama Orang Tua</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Jenis Kelamin</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status Stunting</th>
                                    </>
                                )}
                                {activeTab === 'bumil' && (
                                    <>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Usia Kandungan</th>
                                    </>
                                )}
                                {activeTab === 'lansia' && (
                                    <>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Usia</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Jenis Kelamin</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Memuat data...</td>
                                </tr>
                            ) : (
                                (() => {
                                    let list = [];
                                    if (activeTab === 'balita') list = data?.listBalita || [];
                                    if (activeTab === 'bumil') list = data?.listIbuHamil || [];
                                    if (activeTab === 'lansia') list = data?.listLansia || [];

                                    const filtered = list.filter((item: any) => 
                                        item.namaLengkap?.toLowerCase().includes(searchQuery.toLowerCase())
                                    );

                                    if (filtered.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Tidak ada data ditemukan.</td>
                                            </tr>
                                        );
                                    }

                                    return filtered.map((item: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-800">{item.namaLengkap}</td>
                                            
                                            {activeTab === 'balita' && (
                                                <>
                                                    <td className="px-6 py-4 text-slate-600 font-medium">{item.namaOrangTua}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.jenisKelamin === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                            {item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.statusStunting ? (
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">Stunting</span>
                                                        ) : (
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Normal</span>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                            
                                            {activeTab === 'bumil' && (
                                                <>
                                                    <td className="px-6 py-4 text-slate-600 font-medium">{item.usiaKandungan} Bulan</td>
                                                </>
                                            )}
                                            
                                            {activeTab === 'lansia' && (
                                                <>
                                                    <td className="px-6 py-4 text-slate-600 font-medium">{item.usia} Tahun</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.jenisKelamin === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                            {item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ));
                                })()
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
