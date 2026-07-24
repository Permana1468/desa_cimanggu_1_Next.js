"use client";

import { motion } from "framer-motion";
import { 
  Activity,
  Calendar,
  CheckSquare,
  FileText,
  Download,
  Filter,
  Plus
} from "lucide-react";

export function LaporanKegiatan({ session }: { session: any }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Activity className="text-emerald-500" /> 
                Laporan Kegiatan Desa
            </h1>
            <p className="text-slate-500 text-sm mt-1">Dokumentasi dan pelaporan seluruh kegiatan kemasyarakatan.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                <Filter size={18} /> <span className="hidden md:inline">Filter</span>
            </button>
            <button className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                <Plus size={18} /> Buat Laporan
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
              <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100">
                  <h3 className="font-black text-emerald-900 mb-4">Kategori Kegiatan</h3>
                  <div className="space-y-2">
                      {['Pembangunan', 'Sosial', 'Keagamaan', 'Pendidikan'].map((kategori, i) => (
                          <label key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-100/50 cursor-pointer transition-colors">
                              <input type="checkbox" className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300" defaultChecked={i === 0 || i === 1} />
                              <span className="text-sm font-medium text-emerald-800">{kategori}</span>
                          </label>
                      ))}
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                  <h3 className="font-black text-slate-800 mb-4">Status Laporan</h3>
                  <div className="space-y-3">
                      <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Selesai
                          </span>
                          <span className="font-bold text-slate-800">45</span>
                      </div>
                      <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Draft
                          </span>
                          <span className="font-bold text-slate-800">12</span>
                      </div>
                  </div>
              </div>
          </div>

          <div className="lg:col-span-3">
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                          <thead>
                              <tr className="bg-slate-50/50">
                                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Kegiatan</th>
                                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {[
                                  { judul: "Kerja Bakti Rutin RW 03", date: "20 Jul 2026", kat: "Sosial", status: "Selesai" },
                                  { judul: "Penyuluhan Kesehatan", date: "15 Jul 2026", kat: "Pendidikan", status: "Selesai" },
                                  { judul: "Pembangunan Gorong-gorong", date: "10 Jul 2026", kat: "Pembangunan", status: "Draft" },
                                  { judul: "Pengajian Akbar", date: "05 Jul 2026", kat: "Keagamaan", status: "Selesai" },
                              ].map((item, i) => (
                                  <motion.tr 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: i * 0.1 }}
                                      key={i} 
                                      className="hover:bg-slate-50/50 transition-colors group"
                                  >
                                      <td className="py-4 px-6 font-bold text-slate-800">{item.judul}</td>
                                      <td className="py-4 px-6 text-sm text-slate-500">
                                          <div className="flex items-center gap-2">
                                              <Calendar size={14} /> {item.date}
                                          </div>
                                      </td>
                                      <td className="py-4 px-6">
                                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                                              {item.kat}
                                          </span>
                                      </td>
                                      <td className="py-4 px-6">
                                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                                              item.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                          }`}>
                                              {item.status === 'Selesai' ? <CheckSquare size={14} /> : <FileText size={14} />} {item.status}
                                          </span>
                                      </td>
                                      <td className="py-4 px-6 text-right">
                                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors" title="Lihat/Edit">
                                                  <FileText size={14} />
                                              </button>
                                              {item.status === 'Selesai' && (
                                                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors" title="Unduh PDF">
                                                      <Download size={14} />
                                                  </button>
                                              )}
                                          </div>
                                      </td>
                                  </motion.tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
