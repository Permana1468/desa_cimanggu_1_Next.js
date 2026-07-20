"use client";

import { useState } from "react";
import { Users, FileSignature, CreditCard, Search, Download, Plus, Edit2, Trash2 } from "lucide-react";

export function AbsensiPekerja() {
  const [activeTab, setActiveTab] = useState<"ktp" | "hadir" | "terima">("ktp");
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock Data
  const [dataKtp] = useState([
      { id: "3201010101010001", nama: "Joko Supriyanto", posisi: "Tukang Bangunan", alamat: "RT 01 RW 02 Dusun 1" },
      { id: "3201010101010002", nama: "Udin Sedunia", posisi: "Kernet", alamat: "RT 03 RW 01 Dusun 2" },
  ]);

  const [dataHadir] = useState([
      { tanggal: "2024-03-15", nama: "Joko Supriyanto", jamMasuk: "07:30", jamPulang: "16:00", status: "Hadir" },
      { tanggal: "2024-03-15", nama: "Udin Sedunia", jamMasuk: "07:45", jamPulang: "16:00", status: "Hadir" },
  ]);

  const [dataTerima] = useState([
      { id: "PAY-001", tanggal: "2024-03-15", nama: "Joko Supriyanto", jumlah: 150000, keterangan: "Upah Harian" },
      { id: "PAY-002", tanggal: "2024-03-15", nama: "Udin Sedunia", jumlah: 120000, keterangan: "Upah Harian" },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Manajemen Pekerja & Absensi</h2>
          <p className="text-slate-500 text-sm mt-1">Satu paket laporan untuk KTP Pekerja, Daftar Hadir, dan Tanda Terima Pembayaran.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl flex items-center gap-2 transition-all">
            <Download size={16} /> Unduh Format Template
          </button>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all">
            <Plus size={16} /> Tambah Data Baru
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 pb-px">
        <button 
          onClick={() => setActiveTab("ktp")}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "ktp" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <CreditCard size={18} /> KTP Pekerja
        </button>
        <button 
          onClick={() => setActiveTab("hadir")}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "hadir" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <Users size={18} /> Daftar Hadir
        </button>
        <button 
          onClick={() => setActiveTab("terima")}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "terima" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
        >
          <FileSignature size={18} /> Tanda Terima
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 min-h-[400px]">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {activeTab === "ktp" && <><CreditCard size={18} className="text-indigo-500"/> Database KTP Pekerja</>}
                {activeTab === "hadir" && <><Users size={18} className="text-indigo-500"/> Rekapitulasi Daftar Hadir</>}
                {activeTab === "terima" && <><FileSignature size={18} className="text-indigo-500"/> Riwayat Tanda Terima Pembayaran</>}
            </h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Pencarian cepat..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
         </div>

         <div className="overflow-x-auto">
             {activeTab === "ktp" && (
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="border-b border-slate-100 bg-slate-50/50">
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">NIK & Nama Pekerja</th>
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Posisi</th>
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Alamat</th>
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                         {dataKtp.filter(d => d.nama.toLowerCase().includes(query.toLowerCase()) || d.id.includes(query)).map((item) => (
                             <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                 <td className="py-4 px-4">
                                     <div className="font-bold text-slate-800">{item.nama}</div>
                                     <div className="text-xs text-slate-500 font-mono mt-0.5">{item.id}</div>
                                 </td>
                                 <td className="py-4 px-4 text-sm font-bold text-slate-700">{item.posisi}</td>
                                 <td className="py-4 px-4 text-sm text-slate-600">{item.alamat}</td>
                                 <td className="py-4 px-4 text-right">
                                     <div className="flex items-center justify-end gap-2">
                                         <button className="p-2 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                         <button className="p-2 bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                     </div>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             )}

             {activeTab === "hadir" && (
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="border-b border-slate-100 bg-slate-50/50">
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Pekerja</th>
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Waktu Mulai</th>
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Waktu Selesai</th>
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                         {dataHadir.filter(d => d.nama.toLowerCase().includes(query.toLowerCase())).map((item, idx) => (
                             <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                 <td className="py-4 px-4 text-sm font-bold text-slate-700">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                                 <td className="py-4 px-4 text-sm font-bold text-slate-800">{item.nama}</td>
                                 <td className="py-4 px-4 text-center text-sm text-slate-600">{item.jamMasuk}</td>
                                 <td className="py-4 px-4 text-center text-sm text-slate-600">{item.jamPulang}</td>
                                 <td className="py-4 px-4 text-center">
                                     <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                         {item.status}
                                     </span>
                                 </td>
                                 <td className="py-4 px-4 text-right">
                                     <div className="flex items-center justify-end gap-2">
                                         <button className="p-2 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                         <button className="p-2 bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                     </div>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             )}

             {activeTab === "terima" && (
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="border-b border-slate-100 bg-slate-50/50">
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">No. Bukti & Tanggal</th>
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Penerima</th>
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Keterangan</th>
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Jumlah Dibayar</th>
                             <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                         {dataTerima.filter(d => d.nama.toLowerCase().includes(query.toLowerCase()) || d.id.includes(query)).map((item, idx) => (
                             <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                 <td className="py-4 px-4 whitespace-nowrap">
                                     <div className="font-bold text-slate-800">{item.id}</div>
                                     <div className="text-xs text-slate-500">{new Date(item.tanggal).toLocaleDateString('id-ID')}</div>
                                 </td>
                                 <td className="py-4 px-4 text-sm font-bold text-slate-700">{item.nama}</td>
                                 <td className="py-4 px-4 text-sm text-slate-600">{item.keterangan}</td>
                                 <td className="py-4 px-4 text-right font-black text-slate-800">Rp {item.jumlah.toLocaleString('id-ID')}</td>
                                 <td className="py-4 px-4 text-right">
                                     <div className="flex items-center justify-end gap-2">
                                         <button className="p-2 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><FileSignature size={16} /></button>
                                         <button className="p-2 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                         <button className="p-2 bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                     </div>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             )}
         </div>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
              <div className="bg-white rounded-3xl w-full max-w-xl relative z-10 shadow-2xl overflow-hidden p-8">
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Plus size={20} className="text-indigo-600"/> Tambah Data Baru</h3>
                  <div className="text-sm text-slate-500 mb-6">Pilih modul mana yang ingin Anda tambahkan datanya.</div>
                  <div className="grid grid-cols-1 gap-3">
                      <button onClick={() => { setIsModalOpen(false); setActiveTab("ktp"); }} className="w-full p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex items-center gap-4 text-left">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0"><CreditCard size={20} className="text-indigo-600"/></div>
                          <div><div className="font-bold text-slate-800">Database Pekerja</div><div className="text-xs text-slate-500 mt-0.5">Tambah data KTP/Identitas pekerja baru</div></div>
                      </button>
                      <button onClick={() => { setIsModalOpen(false); setActiveTab("hadir"); }} className="w-full p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex items-center gap-4 text-left">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0"><Users size={20} className="text-indigo-600"/></div>
                          <div><div className="font-bold text-slate-800">Catat Kehadiran</div><div className="text-xs text-slate-500 mt-0.5">Input absensi pekerja harian</div></div>
                      </button>
                      <button onClick={() => { setIsModalOpen(false); setActiveTab("terima"); }} className="w-full p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex items-center gap-4 text-left">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0"><FileSignature size={20} className="text-indigo-600"/></div>
                          <div><div className="font-bold text-slate-800">Buat Tanda Terima</div><div className="text-xs text-slate-500 mt-0.5">Input pembayaran upah / gaji pekerja</div></div>
                      </button>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                      <button onClick={() => setIsModalOpen(false)} className="px-5 py-3 bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 rounded-xl text-sm transition-colors">Tutup Jendela</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
