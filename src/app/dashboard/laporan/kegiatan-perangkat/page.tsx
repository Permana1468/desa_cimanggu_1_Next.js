"use client";

import { Activity, Plus, Search, CalendarDays, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

export default function KegiatanPerangkatPage() {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock Data
  const [kegiatan, setKegiatan] = useState([
      { id: 1, tanggal: "2024-03-15", nama: "Ahmad Yani", jabatan: "Perangkat Desa", kegiatan: "Pelayanan administrasi kependudukan di balai desa", durasi: "8 Jam" },
      { id: 2, tanggal: "2024-03-15", nama: "Budi Santoso", jabatan: "Sopir Ambulans", kegiatan: "Mengantar pasien rujukan ke RSUD", durasi: "4 Jam" },
      { id: 3, tanggal: "2024-03-14", nama: "Siti Aminah", jabatan: "Office Boy", kegiatan: "Membersihkan area balai desa dan aula", durasi: "8 Jam" },
      { id: 4, tanggal: "2024-03-14", nama: "Rahmat Hidayat", jabatan: "Staf", kegiatan: "Pendataan warga miskin di Dusun 1", durasi: "6 Jam" },
  ]);

  const filteredData = kegiatan.filter(k => k.nama.toLowerCase().includes(query.toLowerCase()) || k.kegiatan.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Buku Kegiatan Harian</h2>
          <p className="text-slate-500 text-sm mt-1">Rekapitulasi aktivitas harian Perangkat Desa, Office Boy, Sopir Ambulans, dan Staf.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all">
            <Plus size={16} /> Catat Kegiatan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-indigo-500" /> Logbook Kegiatan
            </h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari aktivitas atau nama staf..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal & Petugas</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Uraian Kegiatan</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Durasi Kerja</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-bold text-slate-800">{item.nama}</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.jabatan}</div>
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><CalendarDays size={12}/> {new Date(item.tanggal).toLocaleDateString('id-ID')}</div>
                            </td>
                            <td className="py-4 px-4">
                                <p className="text-sm text-slate-700 leading-relaxed max-w-lg">{item.kegiatan}</p>
                            </td>
                            <td className="py-4 px-4 text-center">
                                <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-black tracking-widest uppercase border border-slate-200">
                                    {item.durasi}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 size={16} /></button>
                                    <button className="p-2 bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus"><Trash2 size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                        <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">Tidak ada kegiatan yang ditemukan.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
              <div className="bg-white rounded-3xl w-full max-w-xl relative z-10 shadow-2xl overflow-hidden p-8">
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Plus size={20} className="text-indigo-600"/> Catat Kegiatan Harian</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tanggal Kegiatan</label>
                          <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Pegawai</label>
                              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none" placeholder="Cth: Budi Santoso" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jabatan</label>
                              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none appearance-none">
                                  <option>Perangkat Desa</option>
                                  <option>Office Boy</option>
                                  <option>Sopir Ambulans</option>
                                  <option>Staf</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Uraian Kegiatan</label>
                          <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none min-h-[100px]" placeholder="Jelaskan aktivitas yang dilakukan..." />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Durasi (Jam)</label>
                          <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none" placeholder="Cth: 8" />
                      </div>
                      
                      <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                          <button onClick={() => setIsModalOpen(false)} className="px-5 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl text-sm">Batal</button>
                          <button onClick={() => setIsModalOpen(false)} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/20">Simpan Logbook</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
