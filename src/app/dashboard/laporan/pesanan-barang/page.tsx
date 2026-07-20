"use client";

import { Package, Search, Plus, Printer, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function PesananBarangPage() {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock Data for UI
  const [pesanan, setPesanan] = useState([
      { id: "PO-001", tanggal: "2024-03-12", namaBarang: "Semen Portland 50kg", jumlah: 100, satuan: "Sak", hargaSatuan: 65000, supplier: "Toko Bangunan Berkah", status: "SELESAI" },
      { id: "PO-002", tanggal: "2024-03-14", namaBarang: "Besi Beton 10mm", jumlah: 50, satuan: "Batang", hargaSatuan: 85000, supplier: "TB Makmur Jaya", status: "PROSES" },
      { id: "PO-003", tanggal: "2024-03-15", namaBarang: "Pasir Cor", jumlah: 2, satuan: "Truk", hargaSatuan: 1200000, supplier: "CV Pasir Alam", status: "MENUNGGU" },
  ]);

  const filteredData = pesanan.filter(p => p.namaBarang.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Laporan Pesanan Barang</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola dan pantau seluruh transaksi pemesanan barang untuk operasional desa.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all">
            <Plus size={16} /> Buat Pesanan Baru
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Package size={18} className="text-indigo-500" /> Daftar Pesanan (PO)
            </h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari pesanan..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">No. PO & Tanggal</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Detail Barang</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Volume</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total Biaya</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-bold text-slate-700">{item.id}</div>
                                <div className="text-xs text-slate-500">{new Date(item.tanggal).toLocaleDateString('id-ID')}</div>
                            </td>
                            <td className="py-4 px-4">
                                <div className="font-bold text-slate-800">{item.namaBarang}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">{item.supplier}</div>
                            </td>
                            <td className="py-4 px-4 text-right">
                                <div className="font-bold text-slate-700">{item.jumlah}</div>
                                <div className="text-[10px] text-slate-500 uppercase">{item.satuan}</div>
                            </td>
                            <td className="py-4 px-4 text-right font-black text-slate-800">
                                Rp {(item.jumlah * item.hargaSatuan).toLocaleString('id-ID')}
                            </td>
                            <td className="py-4 px-4 text-center">
                                <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                    item.status === "SELESAI" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                    item.status === "PROSES" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                    "bg-amber-50 text-amber-600 border border-amber-100"
                                }`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Cetak PO"><Printer size={16} /></button>
                                    <button className="p-2 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 size={16} /></button>
                                    <button className="p-2 bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus"><Trash2 size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                        <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">Tidak ada pesanan barang ditemukan.</td>
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
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Plus size={20} className="text-indigo-600"/> Form Pesanan Barang Baru</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Barang / Material</label>
                          <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none" placeholder="Cth: Semen 50kg" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jumlah (Volume)</label>
                              <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none" placeholder="Cth: 100" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Satuan</label>
                              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none" placeholder="Cth: Sak" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Harga Satuan (Rp)</label>
                          <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none" placeholder="Cth: 65000" />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Supplier / Toko</label>
                          <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none" placeholder="Cth: Toko Bangunan XYZ" />
                      </div>
                      
                      <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                          <button onClick={() => setIsModalOpen(false)} className="px-5 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl text-sm">Batal</button>
                          <button onClick={() => setIsModalOpen(false)} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/20">Simpan Pesanan</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
