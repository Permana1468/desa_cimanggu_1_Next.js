"use client";

import { motion } from "framer-motion";
import { 
  Search, 
  History, 
  FileCheck,
  CheckCircle2,
  Clock,
  Activity,
  Archive,
  Download
} from "lucide-react";
import { useState } from "react";

const dummyHistory = [
  { id: "TRK-001", name: "Budi Santoso", doc: "SKU", status: "Selesai", time: "10:45 AM", date: "24 Jul 2026" },
  { id: "TRK-002", name: "Siti Aminah", doc: "SKTM", status: "Diproses Kades", time: "09:30 AM", date: "24 Jul 2026" },
  { id: "TRK-003", name: "Ahmad Dahlan", doc: "Surat Pindah", status: "Menunggu Berkas", time: "15:20 PM", date: "23 Jul 2026" },
];

export function TrackingLayanan({ session }: { session: any }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-800">Tracking Layanan</h1>
            <p className="text-slate-500 text-sm mt-1">Pelacakan riwayat dokumen pemohon dan arsip surat terbit secara real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tracking Search & Status */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 shadow-xl shadow-indigo-900/10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -mr-32 -mt-32" />
                  <h2 className="text-2xl font-black mb-2 relative z-10">Lacak Dokumen</h2>
                  <p className="text-indigo-100 mb-6 relative z-10">Masukkan nomor resi atau NIK untuk melacak status dokumen pemohon.</p>
                  
                  <div className="relative z-10 flex gap-3">
                      <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input 
                              type="text" 
                              placeholder="Contoh: TRK-001 atau 3201..." 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-slate-800 font-bold focus:ring-4 focus:ring-indigo-400/50 outline-none transition-all shadow-lg"
                          />
                      </div>
                      <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all">
                          Lacak
                      </button>
                  </div>
              </div>

              {/* Realtime History Flow */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                          <History className="text-indigo-600" />
                          Riwayat Pemrosesan Terbaru
                      </h3>
                      <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                          <Activity size={14} className="animate-pulse" /> Live Update
                      </span>
                  </div>

                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                      {dummyHistory.map((item, i) => (
                          <motion.div 
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                          >
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                  {item.status === 'Selesai' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                              </div>
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm group-hover:bg-white group-hover:shadow-md transition-all">
                                  <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-slate-800">{item.name}</span>
                                      <span className="text-[10px] font-bold text-slate-400">{item.time}</span>
                                  </div>
                                  <div className="text-sm text-slate-600 mb-2">{item.doc} - <span className="font-mono text-xs">{item.id}</span></div>
                                  <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold ${
                                      item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 
                                      item.status.includes('Diproses') ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                      {item.status}
                                  </span>
                              </div>
                          </motion.div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Arsip Surat Terbit */}
          <div className="space-y-6">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 h-full flex flex-col">
                  <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
                      <Archive className="text-indigo-600" />
                      Arsip Surat Terbit
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">Penyimpanan dokumen warga yang telah dicetak dan disahkan.</p>

                  <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm bg-slate-50/50 hover:bg-white transition-all group">
                              <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                          <FileCheck size={20} />
                                      </div>
                                      <div>
                                          <p className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">SKU_Budi_Santoso.pdf</p>
                                          <p className="text-[10px] text-slate-400 mt-1">24 Jul 2026 • 245 KB</p>
                                      </div>
                                  </div>
                                  <button className="text-slate-400 hover:text-indigo-600 transition-colors" title="Unduh Arsip">
                                      <Download size={18} />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <button className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-600 transition-all">
                      Lihat Seluruh Arsip
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
