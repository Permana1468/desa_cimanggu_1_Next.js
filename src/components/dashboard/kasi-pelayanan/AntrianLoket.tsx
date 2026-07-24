"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Volume2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MonitorSmartphone,
  UserCheck,
  Activity
} from "lucide-react";
import { useState } from "react";

const dummyQueues = [
  { id: "A001", name: "Budi Santoso", type: "Offline", service: "Pembuatan SKU", status: "processing", time: "09:15" },
  { id: "B012", name: "Siti Aminah", type: "Online", service: "Mutasi Masuk", status: "waiting", time: "09:20" },
  { id: "A002", name: "Ahmad Dahlan", type: "Offline", service: "Surat Kematian", status: "waiting", time: "09:25" },
  { id: "B013", name: "Rina Kusuma", type: "Online", service: "Keterangan Domisili", status: "completed", time: "09:00" },
];

export function AntrianLoket({ session }: { session: any }) {
  const [queues, setQueues] = useState(dummyQueues);
  const [activeTab, setActiveTab] = useState('all');

  const handleCall = (id: string) => {
    // In a real app, this would trigger a WebSocket event to the display screen
    alert(`Memanggil antrean ${id}`);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setQueues(queues.map(q => q.id === id ? { ...q, status: newStatus } : q));
  };

  const filteredQueues = queues.filter(q => {
    if (activeTab === 'waiting') return q.status === 'waiting';
    if (activeTab === 'processing') return q.status === 'processing';
    if (activeTab === 'completed') return q.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-800">Manajemen Antrean</h1>
            <p className="text-slate-500 text-sm mt-1">Kelola pemanggilan dan status antrean loket pelayanan.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
            {['all', 'waiting', 'processing', 'completed'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {tab === 'all' ? 'Semua' : tab === 'waiting' ? 'Menunggu' : tab === 'processing' ? 'Diproses' : 'Selesai'}
                </button>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Active Queue Display */}
        <div className="lg:col-span-1 space-y-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-indigo-600 rounded-[2rem] p-8 text-center text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10" />
                <h3 className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-2">Dilayani Saat Ini</h3>
                <div className="text-6xl font-black mb-4">A001</div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <p className="font-bold text-lg">Budi Santoso</p>
                    <p className="text-indigo-200 text-sm mt-1">Pembuatan SKU</p>
                </div>
                <button 
                    onClick={() => handleCall("A001")}
                    className="w-full mt-6 bg-white text-indigo-600 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-95 shadow-lg"
                >
                    <Volume2 size={20} /> Panggil Ulang
                </button>
            </motion.div>

            {/* Quick Stats */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h4 className="font-black text-slate-800 mb-4">Statistik Hari Ini</h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
                            <MonitorSmartphone size={16} className="text-blue-500" /> Online
                        </span>
                        <span className="font-bold text-slate-800">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
                            <Users size={16} className="text-emerald-500" /> Offline
                        </span>
                        <span className="font-bold text-slate-800">25</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Queue List */}
        <div className="lg:col-span-3">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari nama atau nomor antrean..." 
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border-none text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                        />
                    </div>
                    <button className="p-3 rounded-xl bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">No. Antrean</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Warga / Pemohon</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Layanan</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredQueues.map((q) => (
                                <motion.tr 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={q.id} 
                                    className="hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-lg text-slate-800">{q.id}</span>
                                            {q.type === 'Online' ? (
                                                <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold">Online</span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">Offline</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-slate-800">{q.name}</p>
                                        <p className="text-xs text-slate-500">{q.time}</p>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-slate-600">
                                        {q.service}
                                    </td>
                                    <td className="py-4 px-6">
                                        {q.status === 'waiting' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-bold">
                                                <Clock size={14} /> Menunggu
                                            </span>
                                        )}
                                        {q.status === 'processing' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold">
                                                <Activity size={14} className="animate-pulse" /> Diproses
                                            </span>
                                        )}
                                        {q.status === 'completed' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold">
                                                <CheckCircle2 size={14} /> Selesai
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {q.status !== 'completed' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleCall(q.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                                                        title="Panggil"
                                                    >
                                                        <Volume2 size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusChange(q.id, q.status === 'waiting' ? 'processing' : 'completed')}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                                                        title="Lanjut / Selesai"
                                                    >
                                                        {q.status === 'waiting' ? <UserCheck size={14} /> : <CheckCircle2 size={14} />}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredQueues.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                            <AlertCircle size={48} className="text-slate-200 mb-4" />
                            <p className="font-bold">Tidak ada antrean</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
