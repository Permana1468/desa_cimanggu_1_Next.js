"use client";

import { motion } from "framer-motion";
import { 
  ClipboardList, 
  BarChart3, 
  ShieldCheck, 
  Users,
  Search,
  Filter,
  Download,
  Calendar,
  Lock,
  Key
} from "lucide-react";

export function LayananUmum({ session, tab }: { session: any, tab: string }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-800">Layanan Umum</h1>
            <p className="text-slate-500 text-sm mt-1">Buku tamu, pelaporan layanan, dan pengaturan otorisasi TTE.</p>
        </div>
      </div>

      {tab === 'buku-tamu' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden"
          >
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                          <ClipboardList className="text-indigo-600" />
                          Buku Tamu Digital
                      </h2>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input type="text" placeholder="Cari nama tamu..." className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                      </div>
                      <button className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                          <Filter size={18} />
                      </button>
                      <button className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20" title="Unduh Excel">
                          <Download size={18} />
                      </button>
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-slate-50/50">
                              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Tamu</th>
                              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instansi / Asal</th>
                              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Keperluan</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {[1, 2, 3, 4, 5].map((i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-4 px-6 text-sm text-slate-600">
                                      <span className="font-bold">24 Jul</span> <br/><span className="text-xs">09:15 AM</span>
                                  </td>
                                  <td className="py-4 px-6 font-bold text-slate-800">Bapak Hermawan</td>
                                  <td className="py-4 px-6 text-sm text-slate-600">Kecamatan</td>
                                  <td className="py-4 px-6 text-sm text-slate-600">Monitoring evaluasi pelayanan</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </motion.div>
      )}

      {tab === 'reporting' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-indigo-600/20">
                      <BarChart3 size={32} className="mb-4 text-indigo-200" />
                      <h3 className="text-3xl font-black mb-1">1,245</h3>
                      <p className="text-indigo-100 text-sm">Total Layanan (Bulan Ini)</p>
                  </div>
                  <div className="bg-emerald-500 rounded-[2rem] p-6 text-white shadow-lg shadow-emerald-500/20">
                      <Users size={32} className="mb-4 text-emerald-200" />
                      <h3 className="text-3xl font-black mb-1">85%</h3>
                      <p className="text-emerald-100 text-sm">Tingkat Kepuasan Warga</p>
                  </div>
                  <div className="bg-amber-500 rounded-[2rem] p-6 text-white shadow-lg shadow-amber-500/20">
                      <Calendar size={32} className="mb-4 text-amber-200" />
                      <h3 className="text-3xl font-black mb-1">12 mnt</h3>
                      <p className="text-amber-100 text-sm">Rata-rata Waktu Proses</p>
                  </div>
              </div>
              
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 text-center">
                  <p className="text-slate-500 font-medium mb-6">Unduh laporan lengkap bulanan dalam format PDF / Excel untuk dilaporkan ke Kepala Desa.</p>
                  <div className="flex justify-center gap-4">
                      <button className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                          Preview Laporan
                      </button>
                      <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                          <Download size={18} /> Export Laporan
                      </button>
                  </div>
              </div>
          </motion.div>
      )}

      {tab === 'tte' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <ShieldCheck size={32} />
                      </div>
                      <div>
                          <h2 className="text-xl font-black text-slate-800">Pengaturan TTE</h2>
                          <p className="text-slate-500 text-sm">Tanda Tangan Elektronik Kades</p>
                      </div>
                  </div>
                  <div className="space-y-4">
                      <div className="p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/50 flex justify-between items-center">
                          <div>
                              <p className="font-bold text-indigo-900">Status Modul TTE</p>
                              <p className="text-xs text-indigo-700 mt-0.5">Terkoneksi dengan BSSN</p>
                          </div>
                          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                              Aktif
                          </span>
                      </div>
                      
                      <div className="space-y-2 pt-4">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <Lock size={14} /> Passphrase / PIN Otorisasi
                          </label>
                          <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                          <p className="text-[10px] text-slate-400">Masukkan PIN Anda setiap kali akan mengesahkan batch dokumen.</p>
                      </div>

                      <button className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-colors">
                          Simpan Pengaturan
                      </button>
                  </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl -mr-10 -mt-10" />
                  <Key size={32} className="text-slate-400 mb-6" />
                  <h3 className="text-xl font-black mb-2">Riwayat Otorisasi</h3>
                  <p className="text-slate-400 text-sm mb-6">Log aktivitas penggunaan TTE.</p>

                  <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center justify-between border-b border-slate-700/50 pb-4 last:border-0 last:pb-0">
                              <div>
                                  <p className="text-sm font-bold">Otorisasi 12 Dokumen</p>
                                  <p className="text-[10px] text-slate-400 mt-1">24 Jul 2026, 09:30 AM</p>
                              </div>
                              <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-1 rounded-md">
                                  Berhasil
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
          </motion.div>
      )}
    </div>
  );
}
