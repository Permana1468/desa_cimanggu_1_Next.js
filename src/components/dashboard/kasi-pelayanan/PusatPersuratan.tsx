"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Folder, 
  FolderArchive,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  PenTool,
  Upload,
  ArrowRight
} from "lucide-react";
import { useState } from "react";

export function PusatPersuratan({ session, tab }: { session: any, tab: string }) {
  const [activeSubTab, setActiveSubTab] = useState(tab || 'buat-surat');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-800">Pusat Persuratan</h1>
            <p className="text-slate-500 text-sm mt-1">Pembuatan surat, penomoran otomatis, dan buku agenda surat desa.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
            {[
              { id: 'buat-surat', label: 'Buat Surat', icon: Plus },
              { id: 'surat-masuk', label: 'Surat Masuk', icon: Folder },
              { id: 'surat-keluar', label: 'Surat Keluar', icon: FolderArchive }
            ].map(t => (
                <button
                    key={t.id}
                    onClick={() => setActiveSubTab(t.id)}
                    className={`flex-1 md:px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                        activeSubTab === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <t.icon size={16} /> <span className="hidden md:inline">{t.label}</span>
                </button>
            ))}
        </div>
      </div>

      {/* Main Content Area based on SubTab */}
      {activeSubTab === 'buat-surat' && (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
            {/* Form Buat Surat */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <h2 className="text-lg font-black text-slate-800 mb-6">Formulir Pembuatan Surat</h2>
                <form className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Jenis Surat</label>
                            <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 outline-none">
                                <option>Surat Keterangan Usaha (SKU)</option>
                                <option>Surat Keterangan Tidak Mampu (SKTM)</option>
                                <option>Surat Keterangan Domisili</option>
                                <option>Surat Pengantar Nikah</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                Penomoran Surat
                                <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md">Otomatis (Integrasi TU)</span>
                            </label>
                            <input type="text" value="145/SKU/VII/2026" disabled className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-mono font-bold" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">NIK / Nama Pemohon</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Cari warga berdasarkan NIK atau Nama..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Keperluan</label>
                        <textarea rows={3} placeholder="Tuliskan keperluan secara detail..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"></textarea>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button type="button" className="flex-1 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors">
                            Simpan Draft
                        </button>
                        <button type="button" className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-colors flex items-center justify-center gap-2">
                            <Printer size={18} /> Cetak & Terbitkan
                        </button>
                    </div>
                </form>
            </div>

            {/* Panel Kanan */}
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[2rem] p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10" />
                    <PenTool size={24} className="mb-4 text-indigo-100" />
                    <h3 className="font-black text-lg mb-1">Tanda Tangan Elektronik</h3>
                    <p className="text-sm text-indigo-100/80 mb-6">Gunakan TTE Kades terenkripsi untuk pengesahan surat instan.</p>
                    <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 transition-colors rounded-xl font-bold text-sm backdrop-blur-md">
                        Otorisasi TTE
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                    <h3 className="font-black text-slate-800 mb-4">Pemohon Online (Menunggu)</h3>
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                <div>
                                    <p className="font-bold text-sm text-slate-800">Agus Setiawan</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">Surat Ket. Domisili</p>
                                </div>
                                <button className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
      )}

      {(activeSubTab === 'surat-masuk' || activeSubTab === 'surat-keluar') && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden"
          >
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                      <h2 className="text-lg font-black text-slate-800">
                          Buku Agenda {activeSubTab === 'surat-masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Terintegrasi dengan Kaur TU.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input type="text" placeholder="Cari nomor urut, nomor surat..." className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                      </div>
                      <button className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                          <Upload size={18} />
                      </button>
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-slate-50/50">
                              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">No. Urut</th>
                              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Nomor Surat</th>
                              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tanggal</th>
                              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Perihal</th>
                              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tujuan/Pengirim</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {[1, 2, 3, 4].map((i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-4 px-6 font-mono font-bold text-slate-700">{String(i).padStart(3, '0')}</td>
                                  <td className="py-4 px-6">
                                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold font-mono">14{i}/SKU/VII/2026</span>
                                  </td>
                                  <td className="py-4 px-6 text-sm text-slate-600">24 Jul 2026</td>
                                  <td className="py-4 px-6 text-sm font-bold text-slate-800">Pembuatan Keterangan Usaha</td>
                                  <td className="py-4 px-6 text-sm text-slate-600">Budi Santoso</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </motion.div>
      )}

    </div>
  );
}
