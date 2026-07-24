"use client";

import { motion } from "framer-motion";
import { 
  HeartPulse, 
  Baby, 
  Download,
  CalendarDays,
  FileBarChart,
  Users
} from "lucide-react";

export function LaporanPosyandu({ session, posyanduId }: { session: any, posyanduId: string }) {
  const posyanduName = posyanduId.replace('posyandu-', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <HeartPulse className="text-rose-500" /> 
                Laporan Posyandu {posyanduName}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Laporan kesehatan balita, ibu hamil, dan lansia.</p>
        </div>
        <button className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 flex items-center gap-2">
            <Download size={18} /> Unduh Laporan Bulanan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100"
              >
                  <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-black text-slate-800">Grafik Kunjungan Warga</h2>
                      <div className="flex items-center gap-2 text-sm">
                          <CalendarDays size={16} className="text-slate-400" />
                          <span className="font-bold text-slate-600">Juli 2026</span>
                      </div>
                  </div>
                  
                  {/* Dummy Chart Area */}
                  <div className="h-64 flex items-end justify-between gap-4 px-2">
                      {[
                          { label: 'Minggu 1', balita: 40, bumil: 20 },
                          { label: 'Minggu 2', balita: 60, bumil: 30 },
                          { label: 'Minggu 3', balita: 45, bumil: 25 },
                          { label: 'Minggu 4', balita: 80, bumil: 40 },
                      ].map((item, i) => (
                          <div key={i} className="flex-1 flex flex-col justify-end group">
                              <div className="flex justify-center gap-2 mb-3">
                                  <motion.div 
                                      initial={{ height: 0 }}
                                      animate={{ height: `${item.balita}%` }}
                                      transition={{ duration: 1, delay: i * 0.1 }}
                                      className="w-1/2 bg-rose-500 rounded-t-xl group-hover:bg-rose-600 transition-colors relative"
                                  />
                                  <motion.div 
                                      initial={{ height: 0 }}
                                      animate={{ height: `${item.bumil}%` }}
                                      transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                                      className="w-1/2 bg-amber-400 rounded-t-xl group-hover:bg-amber-500 transition-colors relative"
                                  />
                              </div>
                              <div className="text-center text-xs font-bold text-slate-500">
                                  {item.label}
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-8 flex justify-center gap-6 text-sm font-bold">
                      <div className="flex items-center gap-2 text-slate-600">
                          <span className="w-3 h-3 rounded-full bg-rose-500" /> Balita
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                          <span className="w-3 h-3 rounded-full bg-amber-400" /> Ibu Hamil / Menyusui
                      </div>
                  </div>
              </motion.div>
          </div>

          <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-rose-50 rounded-[2rem] p-6 border border-rose-100"
              >
                  <h3 className="font-black text-rose-900 mb-4 flex items-center gap-2">
                      <Baby className="text-rose-600" /> Ringkasan Data
                  </h3>
                  <div className="space-y-3">
                      <div className="bg-white/60 p-4 rounded-xl border border-rose-200/50 flex justify-between items-center">
                          <span className="text-sm font-bold text-rose-800">Total Balita Terdaftar</span>
                          <span className="font-black text-lg text-rose-600">142</span>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl border border-rose-200/50 flex justify-between items-center">
                          <span className="text-sm font-bold text-rose-800">Balita Stunting</span>
                          <span className="font-black text-lg text-rose-600">3</span>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl border border-rose-200/50 flex justify-between items-center">
                          <span className="text-sm font-bold text-rose-800">Ibu Hamil</span>
                          <span className="font-black text-lg text-rose-600">28</span>
                      </div>
                  </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100"
              >
                  <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                      <FileBarChart className="text-indigo-600" /> Arsip Laporan
                  </h3>
                  <div className="space-y-3">
                      {['Juni 2026', 'Mei 2026', 'April 2026'].map((month, i) => (
                          <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between group hover:border-indigo-200 transition-colors cursor-pointer">
                              <div>
                                  <p className="font-bold text-sm text-slate-800">Laporan {month}</p>
                                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">PDF • 1.2 MB</p>
                              </div>
                              <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                  <Download size={16} />
                              </button>
                          </div>
                      ))}
                  </div>
              </motion.div>
          </div>
      </div>
    </div>
  );
}
